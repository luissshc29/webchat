"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shadcn/components/ui/avatar";
import { Button } from "@/shadcn/components/ui/button";
import { Skeleton } from "@/shadcn/components/ui/skeleton";
import { useAuthContext } from "@/utils/providers/AuthProvider";
import { useChatContext } from "@/utils/providers/ChatProvider";
import { User } from "@/utils/types/User";
import { gql, useQuery } from "@apollo/client";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { IoIosArrowBack } from "react-icons/io";

export default function ChatTopbar() {
  const { activeChat, setActiveChat, userActivityChangedSubscription } =
    useChatContext();
  const { loggedUser, userStatusSwitchedSubscription } = useAuthContext();
  const { push } = useRouter();

  const receiverId =
    activeChat.users.find((u) => u !== loggedUser?.id) || loggedUser?.id;

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

  const userInfo = useQuery<{ getUser: User }>(GET_USER_QUERY, {
    variables: {
      id: receiverId,
    },
  });

  const [userOnline, setUserOnline] = useState<"online" | "offline">(
    userInfo.data?.getUser.status as "online" | "offline"
  );

  useEffect(() => {
    if (userStatusSwitchedSubscription) {
      const userSwitched =
        userStatusSwitchedSubscription.data?.userStatusSwitched;

      if (userSwitched && userSwitched?.id === userInfo.data?.getUser.id) {
        setUserOnline(userSwitched.status);
      }
    }
  }, [userStatusSwitchedSubscription]);

  useEffect(() => {
    if (!userInfo.loading) {
      setUserOnline(userInfo.data?.getUser.status as "online" | "offline");
    }
  }, [activeChat, userInfo.loading]);

  const [userActivity, setUserActivity] = useState<"typing" | "default">(
    "default"
  );

  useEffect(() => {
    const sub = userActivityChangedSubscription;
    if (sub && sub.data) {
      if (
        sub.data.userActivityChanged.senderId === userInfo.data?.getUser.id &&
        sub.data.userActivityChanged.receiverId === loggedUser?.id
      ) {
        setUserActivity(sub.data?.userActivityChanged.activity);
      }
    }
  }, [userActivityChangedSubscription]);

  if (userInfo.loading) {
    return (
      <div className="flex items-center gap-x-2 border-gray-200 bg-white hover:bg-gray-200 p-2 border-t w-full cursor-pointer">
        <div className="flex items-center w-full">
          <Skeleton className="rounded-full w-12 h-12" />
          <div className="flex flex-col flex-1 gap-1">
            <Skeleton className="w-2/3 h-4" />
            <Skeleton className="w-1/3 h-4" />
          </div>
        </div>
      </div>
    );
  }

  if (!userInfo.loading && userInfo.data?.getUser) {
    return (
      <div className="flex items-center gap-x-2 border-gray-200 bg-white p-2 border-t w-full">
        <Button
          onClick={() => {
            push("/");
            setActiveChat?.({
              id: 0,
              messages: [],
              users: [],
            });
          }}
          variant="ghost"
          className="block lg:hidden p-0"
        >
          <IoIosArrowBack className="text-xl" />
        </Button>

        <Avatar className="w-[40px] lg:w-[45px] h-[40px] lg:h-[45px]">
          <AvatarImage
            src={userInfo.data?.getUser.avatar.url}
            alt={userInfo.data?.getUser.username}
            className="rounded-full"
          />
          <AvatarFallback>
            {userInfo.data?.getUser.avatar.fallback}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-0.5 lg:gap-0 text-sm lg:text-base">
          <h3 className="text-black">
            {userInfo.data?.getUser.name}{" "}
            <span className="text-gray-500">
              ({userInfo.data?.getUser.username})
            </span>
          </h3>
          <p className="text-gray-500 text-xs lg:text-sm capitalize transition-all animate-show-up duration-300">
            {userActivity === "typing" ? (
              <i>Typing...</i>
            ) : userOnline === "online" ? (
              userOnline
            ) : (
              ""
            )}
          </p>
        </div>
      </div>
    );
  }
}
