"use client";

import { useEffect, useRef, useState } from "react";
import ChatInput from "@/components/ChatInput";
import MessageBubble from "@/components/MessageBubble";
import { connectToChatSocket } from "@/lib/socket";

export type ChatMessage = {
  id: string;
  text: string;
  sender: string;
  timestamp: number;
};

type ServerEvent =
  | { type: "history"; payload: ChatMessage[] }
  | { type: "message"; payload: ChatMessage };

export default function ChatClient() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [username, setUsername] = useState("Convidado");
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const existing = window.sessionStorage.getItem("chat-username");
    if (existing) {
      setUsername(existing);
      return;
    }

    const randomId = Math.floor(100 + Math.random() * 900);
    const generated = `User ${randomId}`;
    window.sessionStorage.setItem("chat-username", generated);
    setUsername(generated);
  }, []);

  useEffect(() => {
    const { socket, cleanup, disconnect } = connectToChatSocket({
      onOpen: () => setIsConnected(true),
      onClose: () => setIsConnected(false),
      onError: () => setIsConnected(false),
      onMessage: (event) => {
        try {
          const data = JSON.parse(event.data) as ServerEvent;
          if (data.type === "history") {
            setMessages(data.payload);
          }

          if (data.type === "message") {
            setMessages((prev) => {
              if (prev.some((message) => message.id === data.payload.id)) {
                return prev;
              }
              return [...prev, data.payload];
            });
          }
        } catch (error) {
          console.error("Failed to parse incoming message", error);
        }
      },
    });

    if (socket?.readyState === WebSocket.OPEN) {
      setIsConnected(true);
    }

    return () => {
      cleanup();
      disconnect();
    };
  }, []);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages]);

  const sendMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const sender = username || "Convidado";

    const optimisticMessage: ChatMessage = {
      id: crypto.randomUUID(),
      text: trimmed,
      sender,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, optimisticMessage]);

    const payload: ServerEvent = {
      type: "message",
      payload: optimisticMessage,
    };

    const { socket } = connectToChatSocket();

    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(payload));
    } else if (socket) {
      socket.addEventListener(
        "open",
        () => {
          socket.send(JSON.stringify(payload));
        },
        { once: true }
      );
    }
  };

  return (
    <main className="flex min-h-screen flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <header className="flex items-center justify-between border-b border-white/10 px-6 py-5">
        <div>
          <h1 className="text-2xl font-semibold">Chat em tempo real</h1>
          <p className="text-sm text-slate-300">Você está conectado como {username}</p>
        </div>
        <div className={`h-2 w-2 rounded-full ${isConnected ? "bg-emerald-400" : "bg-red-500"}`} />
      </header>

      <section className="flex flex-1 flex-col gap-4 p-4 md:p-6">
        <div
          ref={scrollContainerRef}
          className="flex-1 space-y-4 overflow-y-auto rounded-3xl bg-white/5 p-4 shadow-inner"
          style={{ scrollBehavior: "smooth" }}
        >
          {messages.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-slate-400">
              Comece a conversa enviando uma mensagem!
            </div>
          ) : (
            messages.map((message) => (
              <MessageBubble key={message.id} message={message} isOwn={message.sender === username} />
            ))
          )}
        </div>

        <ChatInput onSend={sendMessage} disabled={!isConnected} />
      </section>
    </main>
  );
}
