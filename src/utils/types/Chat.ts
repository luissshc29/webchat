import { Message } from "./Message";

export type Chat = {
  id: number;
  users: number[];
  messages: Message[];
};
