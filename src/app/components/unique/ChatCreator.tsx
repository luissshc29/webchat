import { Button } from "@/shadcn/components/ui/button";
import { Input } from "@/shadcn/components/ui/input";
import { Label } from "@/shadcn/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shadcn/components/ui/popover";
import { useAuthContext } from "@/utils/providers/AuthProvider";
import { gql, useLazyQuery } from "@apollo/client";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { IoMdAdd } from "react-icons/io";

export default function ChatCreator() {
  const { push } = useRouter();
  const { loggedUser } = useAuthContext();

  const [search, setSearch] = useState<string>("");

  const GET_USER_QUERY = gql`
    query GetUser($username: String) {
      getUser(username: $username) {
        id
      }
    }
  `;

  const [getUser, getUserInfo] = useLazyQuery<{ getUser: { id: number } }>(
    GET_USER_QUERY
  );

  function createChat() {
    getUser({
      variables: {
        username: search,
      },
    }).then((res) => {
      console.log(res);
      if (res.data) {
        const id = res.data?.getUser.id;

        if (id) {
          push(`/?usersInChat=${loggedUser?.id},${id}`);
        }
      }
    });
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">
          <IoMdAdd className="text-2xl" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="flex flex-col items-start gap-4 p-4">
        <h1 className="font-bold">Start a chat:</h1>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createChat();
          }}
          className="flex flex-col gap-1 w-full"
        >
          <Label htmlFor="chat-creator-input">Username:</Label>
          <Input
            id="chat-creator-input"
            className="w-full"
            required
            type="text"
            onChange={(e) => setSearch(e.target.value)}
            min={1}
          />
        </form>
        <p className="text-red-500 text-sm">{getUserInfo.error?.message}</p>
      </PopoverContent>
    </Popover>
  );
}
