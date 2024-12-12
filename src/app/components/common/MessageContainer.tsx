"use client";

import { useAuthContext } from "@/utils/providers/AuthProvider";
import { useChatContext } from "@/utils/providers/ChatProvider";
import { Message } from "@/utils/types/Message";
import React, { useEffect, useState } from "react";
import { FaCircle } from "react-icons/fa6";

export default function MessageContainer({
  message,
  ...rest
}: { message: Message } & React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
>) {
  const { loggedUser } = useAuthContext();
  const { messageReadSubscription, markMessageAsRead } = useChatContext();
  const [messageStatus, setMessageStatus] = useState<"sent" | "read">(
    message.status
  );

  useEffect(() => {
    if (messageReadSubscription?.data?.messageRead.id === message.id) {
      setMessageStatus("read");
    }

    // Marking every message on chat as 'read' if they are not already
    if (
      loggedUser &&
      message.status === "sent" &&
      message.senderId !== loggedUser.id
    ) {
      markMessageAsRead(Number(message.id));
    }
  }, [messageReadSubscription]);

  return (
    <div
      key={message.id}
      id={`message-${message.id}`}
      className={`flex items-end gap-1 w-fit my-2 ${
        message.senderId === loggedUser?.id
          ? "mr-0 ml-auto flex-row"
          : "mr-auto ml-0 flex-row-reverse"
      }`}
      {...rest}
    >
      {loggedUser?.id === message.senderId && (
        <FaCircle
          title={`Message ${messageStatus}`}
          className={`text-sm`}
          style={
            messageStatus === "sent"
              ? {
                  color: "#a3a3a3",
                }
              : {
                  color: "#22c55e",
                }
          }
        />
      )}

      <div
        className={`bg-blue-500 p-3 rounded-lg max-w-[50vw] text-white break-words [word-wrap:break-word] ${
          message.senderId === loggedUser?.id ? "text-right" : "text-left"
        }`}
      >
        <p className="text-left text-sm lg:text-base [white-space:pre-wrap]">
          {message.message.split("\n").map((text, i) => (
            <React.Fragment key={i}>
              {text}
              <br />
            </React.Fragment>
          ))}
        </p>
        <span className="text-neutral-300 text-xs">{`${new Date(message.sentAt)
          .getHours()
          .toString()
          .padStart(2, "0")}:${new Date(message.sentAt)
          .getMinutes()
          .toString()
          .padStart(2, "0")} - ${(new Date(message.sentAt).getMonth() + 1)
          .toString()
          .padStart(2, "0")}/${new Date(message.sentAt)
          .getDate()
          .toString()
          .padStart(2, "0")}`}</span>
      </div>
    </div>
  );
}
