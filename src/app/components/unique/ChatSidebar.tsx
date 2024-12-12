"use client";

import { useChatContext } from "@/utils/providers/ChatProvider";
import React, { useEffect } from "react";
import ChatCreator from "./ChatCreator";
import { gql, useQuery } from "@apollo/client";
import { User } from "@/utils/types/User";
import ChatSidebarItem from "../common/ChatSidebarItem";
import { useAuthContext } from "@/utils/providers/AuthProvider";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shadcn/components/ui/avatar";
import { Skeleton } from "@/shadcn/components/ui/skeleton";
import { LuLogOut } from "react-icons/lu";
import { Button } from "@/shadcn/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function ChatSidebar({
  displayContent,
}: {
  displayContent: "avatar" | "full";
}) {
  const { newMessageSubscription } = useChatContext();
  const { loggedUser, logout } = useAuthContext();

  const GET_CHATS_QUERY = gql`
    query GetChats($userId: Int) {
      getChats(userId: $userId) {
        id
        lastMessageId
        users
      }
    }
  `;

  const getChats = useQuery<{
    getChats: { id: number; users: string; lastMessageId: number }[];
  }>(GET_CHATS_QUERY, {
    variables: {
      userId: loggedUser?.id,
    },
  });

  const GET_USERS_QUERY = gql`
    query GetUsers {
      getUsers {
        id
        name
        username
        avatar {
          fallback
          url
        }
        status
      }
    }
  `;

  const getUsers = useQuery<{ getUsers: User[] }>(GET_USERS_QUERY);

  useEffect(() => {
    getChats.refetch();
  }, [newMessageSubscription]);

  return (
    <div className="flex flex-col justify-between items-center border-neutral-200 bg-neutral-100 py-2 border-r w-screen lg:w-full h-screen text-black">
      <div className="flex justify-between items-center gap-2 border-neutral-400 px-2 pb-2 border-b-[1px] w-full h-fit">
        <h2 className="font-semibold text-xl">Chats</h2>
        <ChatCreator />
      </div>
      <ScrollArea className="w-full h-full">
        <ul>
          {!getChats.loading && !getUsers.loading ? (
            getChats.data?.getChats.map((chat) => (
              <ChatSidebarItem
                displayContent={displayContent}
                key={chat.id}
                chat={chat}
                user={
                  getUsers.data?.getUsers.find(
                    (item) =>
                      item.id.toString() ===
                      chat.users
                        .split(",")
                        .find((item) => item !== `${loggedUser?.id}`)
                  ) || (loggedUser as User)
                }
              />
            ))
          ) : (
            <div className="flex items-center p-2">
              <Skeleton className="rounded-full w-12 h-12" />
              <div className="flex flex-col flex-1 gap-2">
                <Skeleton className="w-full h-4" />
                <Skeleton className="w-1/2 h-4" />
              </div>
            </div>
          )}
        </ul>
      </ScrollArea>

      <div
        className="flex items-center gap-2 border-neutral-400 px-2 pt-2 border-t-[1px] w-full h-fit"
        style={
          displayContent === "full"
            ? {
                justifyContent: "space-between",
              }
            : {
                justifyContent: "center",
              }
        }
      >
        <div className="flex items-center gap-2 px-auto w-fit">
          <Avatar
            className="border-[3px] border-neutral-400"
            title={`Logged user: ${loggedUser?.username}`}
          >
            <AvatarImage
              src={loggedUser?.avatar.url}
              alt={loggedUser?.username}
              className="rounded-full"
            />
            <AvatarFallback>{loggedUser?.avatar.fallback}</AvatarFallback>
          </Avatar>
          {displayContent === "full" && (
            <h2 className="text-base text-neutral-700">
              {loggedUser?.username}
            </h2>
          )}
        </div>
        {displayContent === "full" && (
          <Button
            variant="destructive"
            title="Logout"
            className="p-2 rounded-full w-8 h-8"
            onClick={logout}
          >
            <LuLogOut className="text-xl" />
          </Button>
        )}
      </div>
    </div>
  );
}
