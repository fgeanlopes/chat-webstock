import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8 text-center">
      <h1 className="text-4xl font-semibold">Chat WebSocket Demo</h1>
      <p className="max-w-lg text-slate-300">
        Abra o chat em múltiplas abas para testar as mensagens em tempo real usando WebSocket.
      </p>
      <Link
        href="/chat"
        className="rounded-lg bg-emerald-500 px-6 py-3 text-lg font-medium text-white shadow transition hover:bg-emerald-400"
      >
        Ir para o chat
      </Link>
    </main>
  );
}
