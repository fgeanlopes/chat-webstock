import type { Metadata } from "next";
import "@/styles/globals.css";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Chat WebSocket Demo",
  description: "Realtime chat built with Next.js and WebSocket"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-chat-background text-slate-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}
