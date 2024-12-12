"use client";

import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";
import { Message } from "../types/Message";
import { Chat } from "../types/Chat";
import {
  gql,
  SubscriptionResult,
  useMutation,
  useQuery,
  useSubscription,
} from "@apollo/client";
import { useSearchParams } from "next/navigation";
import { useAuthContext } from "./AuthProvider";
import { UserActivityChangedReturn } from "../types/User";

export const chatContext = createContext<{
  activeChat: Chat;
  setActiveChat?: Dispatch<SetStateAction<Chat>>;
  newMessageSubscription?: SubscriptionResult<{ newMessage: Message }>;
  messageReadSubscription?: SubscriptionResult<{ messageRead: Message }>;
  userActivityChangedSubscription?: SubscriptionResult<{
    userActivityChanged: UserActivityChangedReturn;
  }>;
}>({ activeChat: { id: 0, messages: [], users: [] } });

export default function ChatProvider({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams();
  const { loggedUser } = useAuthContext();

  const [activeChat, setActiveChat] = useState<Chat>({
    id: 0,
    messages: [],
    users: [],
  });

  //---------------------
  // Subscription returning user activity alterations ('typing' or 'default')
  const USER_ACTIVITY_CHANGED_SUBSCRIPTION = gql`
    subscription UserActivityChanged {
      userActivityChanged {
        senderId
        receiverId
        activity
      }
    }
  `;

  const userActivityChangedSubscription = useSubscription<{
    userActivityChanged: UserActivityChangedReturn;
  }>(USER_ACTIVITY_CHANGED_SUBSCRIPTION);
  //---------------------

  //---------------------
  // Subscription returning message status alterations ('sent' or 'read')
  const MESSAGE_READ_SUBSCRIPTION = gql`
    subscription MessageRead {
      messageRead {
        id
        message
        receiverId
        senderId
        sentAt
        status
      }
    }
  `;

  const messageReadSubscription = useSubscription<{ messageRead: Message }>(
    MESSAGE_READ_SUBSCRIPTION
  );
  //---------------------

  //---------------------
  // Subscription returning new messages
  const NEW_MESSAGE_SUBSCRIPTION = gql`
    subscription NewMessage {
      newMessage {
        id
        message
        receiverId
        senderId
        sentAt
        status
      }
    }
  `;

  const newMessageSubscription = useSubscription<{ newMessage: Message }>(
    NEW_MESSAGE_SUBSCRIPTION
  );
  //---------------------

  //---------------------
  // Query returning messages between the users on "activeChat"
  const GET_MESSAGES_QUERY = gql`
    query GetMessages($usersIds: String) {
      getMessages(usersIds: $usersIds) {
        id
        message
        senderId
        receiverId
        sentAt
        status
      }
    }
  `;

  const getMessagesInfo = useQuery<{
    getMessages: Message[];
  }>(GET_MESSAGES_QUERY, {
    variables: {
      usersIds: searchParams.get("usersInChat"),
    },
  });
  //---------------------

  useEffect(() => {
    const activeUsers = searchParams.get("usersInChat");
    if (activeUsers) {
      getMessagesInfo
        .refetch({
          usersIds: searchParams.get("usersInChat"),
        })
        .then((res) => {
          const newChat: Chat = {
            id: 1,
            messages: res.data?.getMessages || [],
            users: activeUsers.split(",").map((u) => Number(u)),
          };

          setActiveChat(newChat);
        })
        .catch((err) => {
          window.location.replace("/");
        });
    }
  }, [searchParams, getMessagesInfo.loading]);

  useEffect(() => {
    if (newMessageSubscription.data?.newMessage) {
      const newMessage = newMessageSubscription.data?.newMessage;
      if (
        [newMessage.senderId, newMessage.receiverId].includes(
          loggedUser?.id as number
        )
      ) {
        const updatedActiveChat = {
          ...activeChat,
          messages: [
            ...activeChat?.messages,
            newMessageSubscription.data?.newMessage,
          ],
        };
        setActiveChat?.(updatedActiveChat);
      }
    }
  }, [newMessageSubscription]);

  return (
    <chatContext.Provider
      value={{
        activeChat,
        setActiveChat,
        newMessageSubscription,
        messageReadSubscription,
        userActivityChangedSubscription,
      }}
    >
      {children}
    </chatContext.Provider>
  );
}

export function useChatContext() {
  const {
    activeChat,
    setActiveChat,
    newMessageSubscription,
    messageReadSubscription,
    userActivityChangedSubscription,
  } = useContext(chatContext);

  //---------------------
  // Mutation and function to post a message
  const POST_MESSAGE_MUTATION = gql`
    mutation PostMessage(
      $message: String!
      $senderId: Int!
      $receiverId: Int!
    ) {
      postMessage(
        message: $message
        senderId: $senderId
        receiverId: $receiverId
      ) {
        id
        message
        receiverId
        senderId
        sentAt
        status
      }
    }
  `;

  const [postMessage, postMessageResponse] = useMutation<{
    postMessage: Message;
  }>(POST_MESSAGE_MUTATION);

  function addMessageOnChat(message: {
    senderId: number;
    receiverId: number;
    message: string;
  }) {
    const { senderId, receiverId } = message;
    postMessage({
      variables: {
        message: message.message,
        senderId: senderId,
        receiverId: receiverId,
      },
    }).then((res) => {
      const users = `${senderId},${receiverId}`;
      const isMessageFromChat =
        users === activeChat.users.toString() ||
        users === activeChat.users.reverse().toString();
      if (isMessageFromChat) {
        const updatedActiveChat = {
          ...activeChat,
          messages: [...activeChat?.messages, res.data?.postMessage as Message],
        };
        setActiveChat?.(updatedActiveChat);
      }
    });
  }
  //---------------------

  //---------------------
  // Mutation and function to mark a message as 'read'
  const READ_MESSAGE_MUTATION = gql`
    mutation ReadMessage($id: Int!) {
      readMessage(id: $id) {
        id
        status
      }
    }
  `;

  const [readMessage, readMessageResponse] = useMutation<{
    readMessage: { status: "sent" | "read" };
  }>(READ_MESSAGE_MUTATION);

  function markMessageAsRead(messageId: number) {
    readMessage({
      variables: {
        id: messageId,
      },
    }).then((res) => {
      const messageIndex = activeChat.messages.findIndex(
        (m) => Number(m.id) === messageId
      );
      const updatedMessage: Message = {
        ...activeChat.messages[messageIndex],
        status: "read",
      };

      const updatedMessageList: Message[] = [
        ...activeChat.messages.slice(0, messageIndex),
        updatedMessage,
        ...activeChat.messages.slice(messageIndex + 1),
      ];

      const updatedActiveChat = {
        ...activeChat,
        messages: updatedMessageList,
      };

      setActiveChat?.(updatedActiveChat);
    });
  }
  //---------------------

  //---------------------
  // Mutation and function change an user's activity ('typing' or 'default')
  const CHANGE_USER_ACTIVITY_MUTATION = gql`
    mutation ChangeUserActivity(
      $senderId: Int!
      $activity: UserActivity!
      $receiverId: Int!
    ) {
      changeUserActivity(
        senderId: $senderId
        activity: $activity
        receiverId: $receiverId
      ) {
        senderId
        receiverId
        activity
      }
    }
  `;

  const [changeActivityMutation, changeActivityMutationResponse] = useMutation<{
    changeUserActivity: UserActivityChangedReturn;
  }>(CHANGE_USER_ACTIVITY_MUTATION);

  function changeActivity({
    activity,
    receiverId,
    senderId,
  }: UserActivityChangedReturn) {
    changeActivityMutation({
      variables: {
        activity,
        receiverId,
        senderId,
      },
    });
  }
  //---------------------

  return {
    setActiveChat,
    activeChat,
    addMessageOnChat,
    markMessageAsRead,
    newMessageSubscription,
    messageReadSubscription,
    changeActivity,
    userActivityChangedSubscription,
  };
}
