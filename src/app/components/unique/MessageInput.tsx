"use client";

import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/shadcn/components/ui/button";
import { useAuthContext } from "@/utils/providers/AuthProvider";
import { useChatContext } from "@/utils/providers/ChatProvider";
import { LucideSendHorizontal } from "lucide-react";
import React, { FormEvent, useState } from "react";

export default function MessageInput() {
  const [messageContent, setMessageContent] = useState("");

  const { addMessageOnChat, activeChat, changeActivity } = useChatContext();
  const { loggedUser } = useAuthContext();

  function sendMessage() {
    if (messageContent.replaceAll(" ", "").length === 0) {
      setMessageContent("");
    } else {
      const newMessage = {
        senderId: loggedUser?.id as number,
        receiverId:
          activeChat.users.find((u) => u !== loggedUser?.id) ||
          (loggedUser?.id as number),
        message: messageContent.trim(),
      };

      addMessageOnChat(newMessage);

      setMessageContent("");
      changeActivity({
        senderId: loggedUser?.id as number,
        receiverId: activeChat.users.find(
          (u) => u !== loggedUser?.id
        ) as number,
        activity: "default",
      });
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter") {
      if (e.shiftKey) {
        e.preventDefault();
        setMessageContent((prev) => prev + "\n");
      } else {
        e.preventDefault();
        sendMessage();
      }
    }
  }

  return (
    <div className="flex items-center border-gray-200 bg-white p-2 lg:p-3 border-t w-full h-full text-black">
      <form
        onSubmit={(e) => e.preventDefault()}
        className="flex gap-2 w-full h-full"
      >
        <Textarea
          placeholder="Type your message..."
          value={messageContent}
          onKeyDown={(e) => handleKeyDown(e)}
          onChange={(e) => {
            setMessageContent(e.target.value);
            changeActivity({
              senderId: loggedUser?.id as number,
              receiverId: activeChat.users.find(
                (u) => u !== loggedUser?.id
              ) as number,
              activity: "typing",
            });
          }}
          className="flex-1 p-2 rounded-xl w-[90%] h-full min-h-full max-h-full text-xs lg:text-sm lg:placeholder:text-sm placeholder:text-xs resize-none"
          required
          onBlur={() => {
            changeActivity({
              senderId: loggedUser?.id as number,
              receiverId: activeChat.users.find(
                (u) => u !== loggedUser?.id
              ) as number,
              activity: "default",
            });
          }}
        />
        <Button
          type="submit"
          className="p-1 rounded-full w-fit h-fit transition-all duration-300"
          disabled={messageContent.replaceAll(" ", "").length === 0}
        >
          <LucideSendHorizontal className="scale-75" />
        </Button>
      </form>
    </div>
  );
}
