import { FormEvent, useState } from "react";

type ChatInputProps = {
  onSend: (message: string) => void;
  disabled?: boolean;
};

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [value, setValue] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = value.trim();

    if (!trimmed) return;

    onSend(trimmed);
    setValue("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 rounded-xl bg-chat-sidebar/80 p-3 shadow-lg backdrop-blur"
    >
      <input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Digite sua mensagem"
        className="flex-1 rounded-lg bg-chat-background px-4 py-3 text-sm text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        disabled={disabled}
      />
      <button
        type="submit"
        disabled={disabled || value.trim().length === 0}
        className="rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold uppercase tracking-wide text-white shadow transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-emerald-800/60"
      >
        Enviar
      </button>
    </form>
  );
}
