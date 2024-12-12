"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shadcn/components/ui/avatar";
import { Message } from "@/utils/types/Message";
import { User } from "@/utils/types/User";
import { gql, useQuery } from "@apollo/client";
import { DivideCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import { FaCircle } from "react-icons/fa6";

export default function NotificationToast({
  newMessage,
}: {
  newMessage: Message;
}) {
  const { id, message, senderId, receiverId, sentAt, status } = newMessage;

  const { push } = useRouter();

  const GET_USER_QUERY = gql`
    query GetUser($id: Int) {
      getUser(id: $id) {
        id
        name
        username
        avatar {
          url
          fallback
        }
        status
      }
    }
  `;

  const getUserInfo = useQuery<{ getUser: User }>(GET_USER_QUERY, {
    variables: {
      id: senderId,
    },
  });

  if (!getUserInfo.loading && getUserInfo.data?.getUser) {
    return (
      <div
        className={`flex items-center justify-between gap-2 bg-white hover:bg-gray-200 p-2 rounded-lg w-full cursor-pointer`}
        onClick={() => push(`/?usersInChat=${senderId},${receiverId}`)}
      >
        <div className="flex items-center gap-2 w-[70%] max-w-[70%]">
          <Avatar className={`w-12 h-12`}>
            <AvatarImage
              src={getUserInfo.data?.getUser.avatar.url}
              alt={getUserInfo.data?.getUser.username}
              className="rounded-full"
            />
            <AvatarFallback>
              {getUserInfo.data?.getUser.avatar.fallback}
            </AvatarFallback>
          </Avatar>
          <div
            className={`flex flex-col items-left gap-[1px] text-base overflow-hidden w-full`}
          >
            <div className="flex items-center gap-1 w-full truncate">
              <h3 className="font-bold text-base">
                {getUserInfo.data?.getUser.name}
              </h3>
              <span className="text-gray-500 text-sm truncate">
                ({getUserInfo.data?.getUser.username})
              </span>
            </div>

            <p className="text-sm truncate">{message}</p>
          </div>
        </div>

        <div
          className={`flex flex-col justify-between items-end gap-1 max-w-[30%] w-[30%]`}
        >
          <p className="text-right text-sm">{`${new Date(sentAt)
            .getHours()
            .toString()
            .padStart(2, "0")}:${new Date(sentAt)
            .getMinutes()
            .toString()
            .padStart(2, "0")} 
                -
                ${(new Date(sentAt).getMonth() + 1)
                  .toString()
                  .padStart(2, "0")}/${new Date(sentAt)
            .getDate()
            .toString()
            .padStart(2, "0")}`}</p>
          {status === "sent" && (
            <FaCircle className="text-base text-green-500" />
          )}
        </div>
      </div>
    );
  }
}
