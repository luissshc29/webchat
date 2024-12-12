"use client";

import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
} from "react";
import {
  gql,
  SubscriptionResult,
  useLazyQuery,
  useMutation,
  useSubscription,
} from "@apollo/client";
import { User } from "../types/User";
import { useSearchParams } from "next/navigation";
import { LoginDataType, RegisterDataType } from "../types/Auth";

export const authContext = createContext<{
  loggedUser: User | undefined;
  setLoggedUser?: Dispatch<SetStateAction<User | undefined>>;
  userStatusSwitchedSubscription?: SubscriptionResult<{
    userStatusSwitched: User;
  }>;
}>({ loggedUser: undefined });

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [loggedUser, setLoggedUser] = useState<User | undefined>(undefined);

  //---------------------
  // Subscription returning user status alterations ('online' or 'offline')
  const USER_STATUS_SWITCHED_SUBSCRIPTION = gql`
    subscription UserStatusSwitched {
      userStatusSwitched {
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

  const userStatusSwitchedSubscription = useSubscription<{
    userStatusSwitched: User;
  }>(USER_STATUS_SWITCHED_SUBSCRIPTION);
  //---------------------

  return (
    <authContext.Provider
      value={{ loggedUser, setLoggedUser, userStatusSwitchedSubscription }}
    >
      {children}
    </authContext.Provider>
  );
}

export function useAuthContext() {
  const { loggedUser, setLoggedUser, userStatusSwitchedSubscription } =
    useContext(authContext);
  const searchParams = useSearchParams();

  //---------------------
  // Query returning an user by its 'token'
  const GET_USER_QUERY = gql`
    query GetUser($token: String) {
      getUser(token: $token) {
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

  const [getUser, getUserInfo] = useLazyQuery<{ getUser: User }>(
    GET_USER_QUERY
  );
  //---------------------

  //---------------------
  // Query and function to log an user in
  const LOGIN_QUERY = gql`
    query Login($email: String!, $password: String!) {
      login(email: $email, password: $password)
    }
  `;

  const [loginQuery, loginInfo] = useLazyQuery<{ login: string }>(LOGIN_QUERY);

  function login({ email, password }: LoginDataType) {
    loginQuery({
      variables: {
        email,
        password,
      },
    }).then(({ data }) => {
      if (data) {
        window.localStorage.setItem("token", data.login);
        window.location.replace("/");
      }
    });
  }
  //---------------------

  //---------------------
  // Function to log an user out
  function logout() {
    window.localStorage.removeItem("token");
    window.location.reload();
  }
  //---------------------

  //---------------------
  // Function to verify if there's an user already logged in, and redirecting if not
  function verifyLogin() {
    const token = window.localStorage.getItem("token");
    if (token) {
      getUser({ variables: { token } }).then(({ data }) => {
        const user = data?.getUser;
        if (user) {
          setLoggedUser?.(user);

          if (window.location.pathname !== "/") {
            window.location.replace("/");
          }

          const usersInChat = searchParams.get("usersInChat")?.split(",");
          if (usersInChat && !usersInChat.includes(String(user.id))) {
            window.location.replace("/");
          }
        } else {
          if (window.location.pathname !== "/login") {
            window.location.replace("/login");
          }
        }
      });
    } else {
      if (window.location.pathname !== "/login") {
        window.location.replace("/login");
      }
    }
  }
  //---------------------

  //---------------------
  // Mutation and function to register an user
  const REGISTER_QUERY = gql`
    mutation CreateUser(
      $name: String!
      $avatarUrl: String!
      $username: String!
      $avatarFallback: String!
      $email: String!
      $password: String!
    ) {
      createUser(
        name: $name
        avatarUrl: $avatarUrl
        username: $username
        avatarFallback: $avatarFallback
        email: $email
        password: $password
      ) {
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

  const [registerMutation, registerInfo] = useMutation<{ createUser: User }>(
    REGISTER_QUERY
  );

  function register(data: RegisterDataType) {
    const { name, username, newEmail, avatarUrl, newPassword, repeatPassword } =
      data;

    var variables = {
      name,
      avatarUrl,
      username: "",
      avatarFallback: "",
      email: newEmail,
      password: "",
    };

    // Handling 'username'
    const usernameWithAt = username.includes("@") ? username : `@${username}`;
    const usernameWithLowercase = usernameWithAt.toLowerCase();
    const usernameWithUnderline = usernameWithLowercase.replaceAll(" ", "_");

    variables.username = usernameWithUnderline;

    // Handling 'avatarFallback'
    const splitName = name.split(" ");
    const fallback =
      splitName.length === 1
        ? `${splitName[0][0]}${splitName[0][1]}`.toUpperCase()
        : `${splitName[0][0]}${splitName[1][0]}`.toUpperCase();

    variables.avatarFallback = fallback;

    // Handling 'password'
    if (newPassword === repeatPassword) {
      variables.password = newPassword;
    }

    registerMutation({ variables }).then(({ data }) => {
      if (data) {
        login({ email: newEmail, password: newPassword });
      }
    });
  }
  //---------------------

  //---------------------
  // Mutation and function to switch an user's status ('online' or 'offline')
  const SWITCH_USER_STATUS_QUERY = gql`
    mutation SwitchUserStatus($id: Int!, $status: UserStatus!) {
      switchUserStatus(id: $id, status: $status) {
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

  const [switchUserStatusMutation, switchOnlineStatusInfo] = useMutation<{
    switchUserStatus: User;
  }>(SWITCH_USER_STATUS_QUERY);

  function switchOnlineStatus({
    id,
    status,
  }: {
    id: number;
    status: "online" | "offline";
  }) {
    switchUserStatusMutation({ variables: { id, status } }).then(({ data }) => {
      const user = data?.switchUserStatus;
      if (user) {
        setLoggedUser?.(user);
      }
    });
  }
  //---------------------

  return {
    verifyLogin,
    loggedUser,
    login,
    loginInfo,
    logout,
    register,
    registerInfo,
    userStatusSwitchedSubscription,
    switchOnlineStatus,
    switchOnlineStatusInfo,
  };
}
