import { NextRequest } from "next/server";

export const runtime = "edge";

type ChatMessage = {
  id: string;
  text: string;
  sender: string;
  timestamp: number;
};

type BroadcastPayload =
  | { type: "history"; payload: ChatMessage[] }
  | { type: "message"; payload: ChatMessage };

type GlobalState = {
  chatClients?: Set<WebSocket>;
  chatHistory?: ChatMessage[];
};

const globalState = globalThis as unknown as GlobalState & {
  WebSocketPair?: new () => { 0: WebSocket; 1: WebSocket };
};

function getClients() {
  if (!globalState.chatClients) {
    globalState.chatClients = new Set();
  }
  return globalState.chatClients;
}

function getHistory() {
  if (!globalState.chatHistory) {
    globalState.chatHistory = [];
  }
  return globalState.chatHistory;
}

function broadcast(message: BroadcastPayload, exclude?: WebSocket) {
  const clients = getClients();
  const data = JSON.stringify(message);

  for (const client of clients) {
    if (client === exclude) continue;
    try {
      client.send(data);
    } catch (error) {
      console.error("Failed to send message", error);
    }
  }
}

export async function GET(request: NextRequest) {
  if (request.headers.get("upgrade") !== "websocket") {
    return new Response("Expected WebSocket", { status: 426 });
  }

  const WebSocketPairConstructor = globalState.WebSocketPair ?? (globalThis as any).WebSocketPair;

  if (typeof WebSocketPairConstructor !== "function") {
    return new Response("WebSocketPair not supported", { status: 500 });
  }

  const pair = new WebSocketPairConstructor();
  const { 0: client, 1: server } = pair as { 0: WebSocket; 1: WebSocket };

  const ws = server as unknown as WebSocket;
  const clients = getClients();
  const history = getHistory();

  ws.accept();

  // Send chat history to the newly connected client.
  if (history.length > 0) {
    ws.send(JSON.stringify({ type: "history", payload: history } satisfies BroadcastPayload));
  }

  ws.addEventListener("message", (event) => {
    try {
      const data = JSON.parse(event.data as string) as BroadcastPayload;

      if (data.type === "message") {
        const normalized: ChatMessage = {
          id: data.payload.id,
          text: data.payload.text,
          sender: data.payload.sender,
          timestamp: data.payload.timestamp,
        };

        history.push(normalized);
        broadcast({ type: "message", payload: normalized }, ws);
      }
    } catch (error) {
      console.error("Invalid message received", error);
    }
  });

  ws.addEventListener("close", () => {
    clients.delete(ws);
  });

  ws.addEventListener("error", () => {
    clients.delete(ws);
  });

  clients.add(ws);

  return new Response(null, { status: 101, webSocket: client });
}
