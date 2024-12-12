export type Message = {
  id: string;
  message: string;
  senderId: number;
  receiverId: number;
  sentAt: string;
  status: "sent" | "read";
};
