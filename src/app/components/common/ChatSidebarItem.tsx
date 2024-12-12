import Link from "next/link";
import React, { useEffect, useState } from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shadcn/components/ui/avatar";
import { gql, useQuery } from "@apollo/client";
import { User } from "@/utils/types/User";
import { useChatContext } from "@/utils/providers/ChatProvider";
import { FaCircle } from "react-icons/fa6";
import { useAuthContext } from "@/utils/providers/AuthProvider";
import { useSearchParams } from "next/navigation";
import { Message } from "@/utils/types/Message";

export default function ChatSidebarItem({
  chat,
  user,
  displayContent,
}: {
  chat: { id: number; users: string; lastMessageId: number };
  user: User;
  displayContent: "avatar" | "full";
}) {
  const searchParams = useSearchParams();
  const { name, avatar, username, status } = user;

  const {
    newMessageSubscription,
    messageReadSubscription,
    userActivityChangedSubscription,
  } = useChatContext();
  const { loggedUser, userStatusSwitchedSubscription } = useAuthContext();

  const [userOnline, setUserOnline] = useState<"online" | "offline">(
    user.status
  );

  const GET_MESSAGE_QUERY = gql`
    query GetMessage($id: Int!) {
      getMessage(id: $id) {
        id
        message
        sentAt
        senderId
        status
      }
    }
  `;

  const getMessageInfo = useQuery<{
    getMessage: Message;
  }>(GET_MESSAGE_QUERY, {
    variables: {
      id: chat.lastMessageId,
    },
  });

  useEffect(() => {
    if (newMessageSubscription) {
      if (newMessageSubscription?.data) {
        const newMessage = newMessageSubscription?.data?.newMessage;
        if (newMessage) {
          const isNewMessageFromChat =
            `${newMessage?.senderId},${newMessage?.receiverId}` ===
              chat.users ||
            `${newMessage?.receiverId},${newMessage?.senderId}` === chat.users;

          if (isNewMessageFromChat) {
            setMessageStatus(newMessage.status);
            getMessageInfo.refetch({ id: Number(newMessage?.id) });
          }
        }
      }
    }
  }, [newMessageSubscription]);

  const [messageStatus, setMessageStatus] = useState<"sent" | "read">(
    getMessageInfo.data?.getMessage.status as "sent" | "read"
  );

  useEffect(() => {
    const messageRead = messageReadSubscription?.data?.messageRead;
    const isNewMessageFromChat =
      `${messageRead?.senderId},${messageRead?.receiverId}` === chat.users ||
      `${messageRead?.receiverId},${messageRead?.senderId}` === chat.users;

    if (isNewMessageFromChat) {
      setMessageStatus(messageRead?.status as "sent" | "read");
      getMessageInfo.refetch({ id: Number(messageRead?.id) });
    }
  }, [messageReadSubscription]);

  useEffect(() => {
    getMessageInfo
      .refetch({ id: Number(chat.lastMessageId) })
      .then(({ data }) => {
        setMessageStatus(data.getMessage.status);
      });
  }, []);

  useEffect(() => {
    if (userStatusSwitchedSubscription) {
      const userSwitched =
        userStatusSwitchedSubscription.data?.userStatusSwitched;

      if (user && userSwitched?.id === user.id) {
        setUserOnline(userSwitched.status);
      }
    }
  }, [userStatusSwitchedSubscription]);

  const [userActivity, setUserActivity] = useState<"typing" | "default">(
    "default"
  );

  useEffect(() => {
    const sub = userActivityChangedSubscription;
    if (sub && sub.data) {
      if (
        sub.data.userActivityChanged.senderId === user.id &&
        sub.data.userActivityChanged.receiverId === loggedUser?.id
      ) {
        setUserActivity(sub.data?.userActivityChanged.activity);
      }
    }
  }, [userActivityChangedSubscription]);

  if (chat && !getMessageInfo.loading) {
    return (
      <Link
        href={`/?usersInChat=${chat.users}`}
        key={chat.id}
        className={`flex items-center gap-2 hover:bg-neutral-200 p-2 rounded-lg w-screen lg:max-w-[25vw] lg:w-full cursor-pointer ${
          chat.users === searchParams.get("usersInChat") ||
          chat.users.split(",").reverse().toString() ===
            searchParams.get("usersInChat")
            ? "bg-neutral-200"
            : ""
        }`}
        style={
          displayContent === "avatar"
            ? {
                justifyContent: "center",
              }
            : {
                justifyContent: "flex-start",
              }
        }
        title={getMessageInfo.data?.getMessage.message}
      >
        <Avatar
          className={`w-12 h-12 relative overflow-visible`}
          style={
            displayContent === "avatar" &&
            messageStatus === "sent" &&
            getMessageInfo.data?.getMessage.senderId !== loggedUser?.id
              ? {
                  borderWidth: "3px",
                  padding: "0.1rem",
                  borderColor: "#22c55e",
                }
              : {}
          }
        >
          <AvatarImage
            src={avatar.url}
            alt={username}
            className="rounded-full"
          />
          <AvatarFallback className="rounded-full">
            {avatar.fallback}
          </AvatarFallback>
          {userOnline === "online" && (
            <FaCircle
              className={`-right-1 -bottom-1 absolute border-[3px] border-[#e7e7e7] m-0 p-0 rounded-full w-5 h-5 text-green-500 text-sm transition-all animate-show-up duration-300`}
            />
          )}
        </Avatar>
        {displayContent === "full" && (
          <>
            {getMessageInfo.data?.getMessage && (
              <>
                <div
                  className={`flex flex-col items-left gap-[1px] text-base overflow-hidden max-w-[50%] ${
                    messageStatus === "sent" &&
                    getMessageInfo.data?.getMessage.senderId !== loggedUser?.id
                      ? " text-green-500"
                      : ""
                  }`}
                >
                  <h3 className="font-bold text-base truncate">{name}</h3>
                  {userActivity === "typing" ? (
                    <i className="text-sm">Typing...</i>
                  ) : (
                    <p className="text-sm truncate">
                      {getMessageInfo.data?.getMessage.senderId ===
                        loggedUser?.id && <strong>You: </strong>}
                      {getMessageInfo.data?.getMessage.message}
                    </p>
                  )}
                </div>
                <div
                  className={`flex flex-col justify-between items-end gap-1.5 flex-1 ${
                    messageStatus === "sent" &&
                    getMessageInfo.data?.getMessage.senderId !== loggedUser?.id
                      ? "text-green-500"
                      : ""
                  }`}
                >
                  <p className="text-right text-sm">{`${new Date(
                    getMessageInfo.data?.getMessage.sentAt
                  )
                    .getHours()
                    .toString()
                    .padStart(2, "0")}:${new Date(
                    getMessageInfo.data?.getMessage.sentAt
                  )
                    .getMinutes()
                    .toString()
                    .padStart(2, "0")} 
              -
              ${(
                new Date(getMessageInfo.data?.getMessage.sentAt).getMonth() + 1
              )
                .toString()
                .padStart(2, "0")}/${new Date(
                    getMessageInfo.data?.getMessage.sentAt
                  )
                    .getDate()
                    .toString()
                    .padStart(2, "0")}`}</p>
                  {messageStatus === "sent" &&
                  getMessageInfo.data?.getMessage.senderId !==
                    loggedUser?.id ? (
                    <FaCircle className="text-base animate-pulse" />
                  ) : (
                    ""
                  )}
                </div>
              </>
            )}
          </>
        )}
      </Link>
    );
  }
}
