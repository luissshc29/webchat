"use client";

import { Button } from "@/shadcn/components/ui/button";
import { Input } from "@/shadcn/components/ui/input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shadcn/components/ui/tabs";
import { useAuthContext } from "@/utils/providers/AuthProvider";
import LoadingSVG from "@/utils/svg/LoadingSVG";
import { LoginDataType, RegisterDataType } from "@/utils/types/Auth";
import React, { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import Footer from "../components/unique/Footer";

export default function LoginPage() {
  //let redirectUrl = "";
  const authContext = useAuthContext();

  useEffect(() => {
    document.title = "Webchat | Login";
    authContext.verifyLogin();
    // const url = new URL(location.href);
    // redirectUrl = url.searchParams.get("callbackUrl")!;
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { errors },
  } = useForm<LoginDataType & RegisterDataType>();

  const onLogin: SubmitHandler<LoginDataType> = (data) => {
    authContext.login(data);
  };

  const [differentPasswordsError, setDifferentPasswordsError] =
    useState<string>("");
  const onRegister: SubmitHandler<RegisterDataType> = (data) => {
    if (data.newPassword === data.repeatPassword) {
      authContext.register(data);
    } else {
      setDifferentPasswordsError("The passwords are different");
    }
  };

  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  if (!authContext.loggedUser) {
    return (
      <div className="flex flex-col justify-center items-center gap-2 lg:gap-6 pt-6 w-screen min-h-screen overflow-x-hidden">
        <h1 className="text-3xl lg:text-4xl">
          Welcome to <strong>Webchat</strong>!
        </h1>
        <Tabs value={activeTab} className="grid mx-auto py-8 pb-16 w-[90vw]">
          <TabsList className="grid grid-cols-2 mx-auto w-3/4 md:w-1/2">
            <TabsTrigger
              value="login"
              onClick={() => {
                reset();
                setActiveTab("login");
                document.title = "Webchat | Login";
              }}
            >
              Login
            </TabsTrigger>
            <TabsTrigger
              value="register"
              onClick={() => {
                reset();
                setActiveTab("register");
                document.title = "Webchat | Register";
              }}
            >
              Register
            </TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            {activeTab === "login" && (
              <form
                className="flex flex-col justify-center items-center gap-4 shadow-lg shadow-neutral-300 px-4 py-8 rounded-xl transition-all animate-show-up duration-350 overflow-hidden"
                onSubmit={handleSubmit(onLogin)}
              >
                <h2 className="font-bold text-3xl">Login</h2>
                <p className="mb-6 text-neutral-600 text-sm">
                  Login to access your chats!
                </p>
                {authContext.loginInfo.error?.message && (
                  <p className="text-red-600 text-sm">
                    {authContext.loginInfo.error?.message}
                  </p>
                )}
                {errors && (
                  <p className="text-red-600 text-sm">
                    {errors.email?.message}
                  </p>
                )}
                <Input
                  type="email"
                  placeholder="Your email"
                  className="md:w-3/5"
                  {...register("email", {
                    required: true,
                    pattern: {
                      value: /^[^\s@]+@[^\s.]+\.[^\s]+$/,
                      message:
                        "Your email must match the example: example@email.com",
                    },
                  })}
                />
                <Input
                  type="password"
                  placeholder="Your password"
                  className="md:w-3/5"
                  {...register("password", { required: true })}
                />

                <Button
                  className="flex gap-2 rounded-lg w-[30vh]"
                  variant="default"
                  disabled={authContext.loginInfo.loading}
                  type="submit"
                >
                  {authContext.loginInfo.loading ? (
                    <>
                      Loading <LoadingSVG />
                    </>
                  ) : (
                    "Login"
                  )}
                </Button>

                <p className="flex items-center gap-1 w-fit text-[13px]">
                  Don't have an account?
                  <Button
                    variant="link"
                    className="p-0 text-[13px] underline"
                    type="button"
                    onClick={() => {
                      reset();
                      setActiveTab("register");
                      document.title = "Webchat | Register";
                    }}
                  >
                    Click here
                  </Button>
                </p>
              </form>
            )}
          </TabsContent>
          <TabsContent value="register">
            {activeTab === "register" && (
              <form
                className="flex flex-col justify-center items-center gap-4 shadow-lg shadow-neutral-300 px-4 py-8 rounded-xl transition-all animate-show-up duration-350 overflow-hidden"
                onSubmit={handleSubmit(onRegister)}
              >
                <h2 className="font-bold text-3xl">Register</h2>
                <p className="mb-6 text-neutral-600 text-sm">Join us today!</p>
                {differentPasswordsError && (
                  <p className="text-red-600 text-sm">
                    {differentPasswordsError}
                  </p>
                )}
                {authContext.registerInfo.error?.message && (
                  <p className="text-red-600 text-sm">
                    {authContext.registerInfo.error?.message}
                  </p>
                )}
                {errors && (
                  <p className="text-red-600 text-sm">
                    {errors.username?.message ||
                      errors.newEmail?.message ||
                      errors.newPassword?.message ||
                      errors.repeatPassword?.message}
                  </p>
                )}
                <Input
                  type="text"
                  placeholder="Your name (e.g.: John Doe)"
                  className="md:w-3/5"
                  {...register("name", {
                    required: true,
                  })}
                />
                <Input
                  type="text"
                  placeholder="Your username (e.g.: @john_doe)"
                  className="md:w-3/5"
                  {...register("username", {
                    required: true,
                    pattern: {
                      value: /^\S+$/,
                      message:
                        "Your username can't contain white whitespace(s)",
                    },
                  })}
                />
                <Input
                  type="email"
                  placeholder="Your best email"
                  className="md:w-3/5"
                  {...register("newEmail", {
                    required: true,
                    pattern: {
                      value: /^[^\s@]+@[^\s.]+\.[^\s]+$/,
                      message:
                        "Your email must match the example: example@email.com",
                    },
                  })}
                />
                <Input
                  type="text"
                  placeholder="Your avatar url (e.g.: https://github.com/john_doe.png)"
                  className="md:w-3/5"
                  {...register("avatarUrl", {
                    required: true,
                  })}
                />
                <Input
                  type="password"
                  placeholder="Your password"
                  className="md:w-3/5"
                  {...register("newPassword", {
                    required: true,
                    pattern: {
                      value: /^\S+$/,
                      message:
                        "Your password can't contain white whitespace(s)",
                    },
                  })}
                />
                <Input
                  type="password"
                  placeholder="Confirm your password"
                  className="md:w-3/5"
                  {...register("repeatPassword", {
                    required: true,
                    pattern: {
                      value: /^\S+$/,
                      message:
                        "Your password can't contain white whitespace(s)",
                    },
                  })}
                />
                <Button
                  className="flex justify-center gap-2 rounded-lg w-[30vh]"
                  variant="default"
                  disabled={authContext.registerInfo.loading}
                  type="submit"
                >
                  {authContext.registerInfo.loading ? (
                    <>
                      Loading <LoadingSVG />
                    </>
                  ) : (
                    "Register"
                  )}
                </Button>
                <Button
                  variant="ghost"
                  className="font-semibold text-sm"
                  onClick={() => {
                    reset();
                    setActiveTab("login");
                    document.title = "Webchat | Login";
                  }}
                  disabled={authContext.registerInfo.loading}
                >
                  Cancel
                </Button>
              </form>
            )}
          </TabsContent>
        </Tabs>
        <Footer />
      </div>
    );
  }
}
