import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import ChatProvider from "@/utils/providers/ChatProvider";
import ApolloClientProvider from "@/utils/providers/ApolloClientProvider";
import AuthProvider from "@/utils/providers/AuthProvider";
import { Suspense } from "react";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Webchat",
  description: "Online messaging platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/images/favicon.ico" />
        <link rel="apple-touch-icon" href="/images/favicon.ico" />
        <meta
          name="google-site-verification"
          content="5WYCOXw59AxMbUclhEquVd7hbceqzxZRztDtehQ5NVs"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Suspense>
          <ApolloClientProvider>
            <AuthProvider>
              <ChatProvider>{children}</ChatProvider>
            </AuthProvider>
          </ApolloClientProvider>
        </Suspense>
      </body>
    </html>
  );
}
