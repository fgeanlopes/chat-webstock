import { memo } from "react";

type Message = {
  id: string;
  text: string;
  sender: string;
  timestamp: number;
};

type MessageBubbleProps = {
  message: Message;
  isOwn: boolean;
};

function formatTime(timestamp: number) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(timestamp);
}

function MessageBubbleBase({ message, isOwn }: MessageBubbleProps) {
  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
      <div
        className={`group relative max-w-[75%] rounded-2xl px-4 py-2 text-sm shadow transition-all duration-300 ease-out ${
          isOwn
            ? "bg-emerald-600 text-white" // Own messages
            : "bg-chat-bubbleReceived text-slate-200"
        }`}
      >
        <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-emerald-200/80">
          {message.sender}
        </div>
        <p className="whitespace-pre-line break-words leading-relaxed text-base">{message.text}</p>
        <span className="mt-2 block text-right text-[11px] font-medium text-white/70">
          {formatTime(message.timestamp)}
        </span>
      </div>
    </div>
  );
}

const MessageBubble = memo(MessageBubbleBase);

export default MessageBubble;
