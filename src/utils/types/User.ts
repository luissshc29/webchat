export type User = {
  id: number;
  name: string;
  username: string;
  avatar: UserAvatar;
  status: "online" | "offline";
};

type UserAvatar = {
  url: string;
  fallback: string;
};

export type UserActivityChangedReturn = {
  senderId: number;
  receiverId: number;
  activity: "typing" | "default";
};
