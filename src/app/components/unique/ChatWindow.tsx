"use client";

import { useChatContext } from "@/utils/providers/ChatProvider";
import React, { useEffect } from "react";
import ChatTopbar from "./ChatTopbar";
import MessageInput from "./MessageInput";
import { ScrollArea } from "@/components/ui/scroll-area";
import MessageContainer from "../common/MessageContainer";
import { Button } from "@/shadcn/components/ui/button";
import { IoIosArrowDown } from "react-icons/io";
import { scrollIntoView } from "seamless-scroll-polyfill";
import { useInView } from "react-intersection-observer";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useMediaQuery } from "@uidotdev/usehooks";
import useDevice from "@/utils/hooks/useDevice";

export default function ChatWindow() {
  const { activeChat, newMessageSubscription } = useChatContext();

  const { inView, ref } = useInView();

  const { isLgHeight } = useDevice();

  function scrollToLastMessage() {
    requestAnimationFrame(() => {
      const length = activeChat.messages.length;
      const messageById = document.getElementById(
        `message-${activeChat.messages[length - 1].id}`
      );
      if (messageById) {
        setTimeout(() => {
          scrollIntoView(
            messageById,
            {
              behavior: "smooth",
              block: "center",
              inline: "nearest",
            },
            { duration: 250 }
          );
        }, 50);
      }
    });
  }
  useEffect(() => {
    if (activeChat && activeChat.messages.length > 0) {
      scrollToLastMessage();
    }
  }, [activeChat, newMessageSubscription]);

  if (activeChat && activeChat.users.length > 0) {
    return (
      <div className="flex flex-col justify-center items-center w-full h-screen overflow-y-auto">
        <ResizablePanelGroup direction="vertical" className="w-full h-full">
          <ResizablePanel defaultSize={isLgHeight ? 90 : 85} minSize={75}>
            <div className="flex flex-col w-full h-full overflow-y-auto">
              <ChatTopbar />
              <ScrollArea className="relative flex flex-col flex-1 justify-center items-center gap-1 bg-[#fcedc2] px-4 w-full h-full overflow-y-auto">
                <div>
                  {activeChat
                    ? activeChat.messages.length > 0
                      ? activeChat.messages
                          .filter(
                            (m) =>
                              `${m.senderId},${m.receiverId}` ===
                                activeChat.users.toString() ||
                              `${m.senderId},${m.receiverId}` ===
                                activeChat.users.reverse().toString()
                          )
                          .map((message) => (
                            <MessageContainer
                              message={message}
                              key={message.id}
                              ref={
                                activeChat.messages.findIndex(
                                  (m) => m.id === message.id
                                ) ===
                                activeChat.messages.length - 1
                                  ? ref
                                  : undefined
                              }
                            />
                          ))
                      : ""
                    : ""}
                </div>

                {!inView && (
                  <Button
                    type="submit"
                    className="right-2 bottom-2 absolute mx-auto p-1 rounded-full w-fit h-fit transition-all animate-show-up duration-300"
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToLastMessage();
                    }}
                    title="Scroll to the last message"
                  >
                    <IoIosArrowDown className="text-lg" />
                  </Button>
                )}
              </ScrollArea>
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle title="Drag to resize" />
          <ResizablePanel
            defaultSize={isLgHeight ? 10 : 15}
            minSize={isLgHeight ? 10 : 15}
          >
            <MessageInput />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    );
  } else {
    return <div className="min-w-full min-h-full"></div>;
  }
}
