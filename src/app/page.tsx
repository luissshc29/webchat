"use client";

import { useEffect, useState } from "react";
import ChatSidebar from "./components/unique/ChatSidebar";
import ChatWindow from "./components/unique/ChatWindow";
import { useAuthContext } from "@/utils/providers/AuthProvider";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Toaster as SonnerToaster, toast } from "sonner";
import { useChatContext } from "@/utils/providers/ChatProvider";
import { Message } from "@/utils/types/Message";
import NotificationToast from "./components/unique/NotificationToast";
import useDevice from "@/utils/hooks/useDevice";
import dynamic from "next/dynamic";

function Home() {
  const { verifyLogin, loggedUser, switchOnlineStatus } = useAuthContext();
  const { newMessageSubscription, activeChat } = useChatContext();

  const [sidebarDisplayContent, setSidebarDisplayContent] = useState<
    "avatar" | "full"
  >("full");

  const { isLgWidth } = useDevice();

  useEffect(() => {
    verifyLogin();
    document.title = "Webchat | Chats";
  }, []);

  useEffect(() => {
    let currentStatus: "online" | "offline" = loggedUser?.status as
      | "online"
      | "offline";
    let timeoutId: NodeJS.Timeout;

    function handleVisibilityChange() {
      if (!loggedUser?.id) return;

      const visibilityState = document.visibilityState;
      const status =
        visibilityState === "visible" || visibilityState === "hidden"
          ? "online"
          : "offline";

      if (status !== currentStatus) {
        currentStatus = status;

        if (status === "online") {
          timeoutId = setTimeout(() => {
            switchOnlineStatus({ id: loggedUser.id, status });
          }, 2000);
        } else {
          clearTimeout(timeoutId);
          switchOnlineStatus({ id: loggedUser.id, status });
        }
      }
    }

    function handleTabClose() {
      if (!loggedUser?.id) return;

      clearTimeout(timeoutId);
      if (currentStatus !== "offline") {
        switchOnlineStatus({ id: loggedUser.id, status: "offline" });
      }
    }

    handleVisibilityChange();

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleTabClose);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleTabClose);
      clearTimeout(timeoutId);
    };
  }, [loggedUser]);

  function activateNotificationToast(message: Message) {
    toast(<NotificationToast newMessage={message} />);
  }

  useEffect(() => {
    const newMessage = newMessageSubscription?.data?.newMessage;
    if (
      newMessage &&
      newMessage.receiverId === loggedUser?.id &&
      newMessage.senderId !== loggedUser?.id
    ) {
      if (
        activeChat.users.toString() !==
          `${newMessage.senderId},${newMessage.receiverId}` &&
        activeChat.users.reverse().toString() !==
          `${newMessage.senderId},${newMessage.receiverId}`
      ) {
        activateNotificationToast(newMessage);
      }
    }
  }, [newMessageSubscription]);

  if (loggedUser) {
    return (
      <div className="flex bg-[#fcedc2] w-screen h-screen">
        {isLgWidth ? (
          <div className="w-screen h-screen">
            <ResizablePanelGroup
              direction="horizontal"
              className="w-full h-full"
            >
              <ResizablePanel
                defaultSize={25}
                maxSize={25}
                minSize={6.5}
                onResize={(e) => {
                  // setCollapsedSize(e);
                  if (e < 10) {
                    setSidebarDisplayContent("avatar");
                  } else {
                    setSidebarDisplayContent("full");
                  }
                }}
              >
                <ChatSidebar displayContent={sidebarDisplayContent} />
              </ResizablePanel>
              <ResizableHandle
                withHandle
                // onDoubleClick={() => setCollapsedSize(25)}
                title="Drag to resize"
              />
              <ResizablePanel
                defaultSize={75}
                minSize={25}
                className="h-screen !overflow-y-auto"
              >
                <ChatWindow />
              </ResizablePanel>
            </ResizablePanelGroup>
          </div>
        ) : (
          <div className="w-full h-full overflow-y-auto">
            {activeChat.id > 0 ? (
              <ChatWindow />
            ) : (
              <ChatSidebar displayContent={sidebarDisplayContent} />
            )}
          </div>
        )}

        {isLgWidth ? (
          <SonnerToaster
            duration={8000}
            className="lg:block hidden"
            closeButton
            toastOptions={{
              classNames: {
                toast: "p-0 rounded-none",
              },
            }}
            position="bottom-right"
          />
        ) : (
          <SonnerToaster
            duration={8000}
            className="block lg:hidden"
            closeButton
            toastOptions={{
              classNames: {
                toast: "p-0 rounded-none",
              },
            }}
            position="top-center"
          />
        )}
      </div>
    );
  }
}

const HomePage = dynamic(() => Promise.resolve(Home), { ssr: false });
export default HomePage;
