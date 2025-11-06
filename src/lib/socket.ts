// Simple client-side helper to manage a singleton WebSocket connection.
// This avoids opening multiple sockets when the component re-renders.
type SocketCallbacks = {
  onOpen?: (event: Event) => void;
  onMessage?: (event: MessageEvent) => void;
  onClose?: (event: CloseEvent) => void;
  onError?: (event: Event) => void;
};

let socket: WebSocket | null = null;

function buildSocketUrl() {
  if (typeof window === "undefined") {
    return "";
  }

  const protocol = window.location.protocol === "https:" ? "wss" : "ws";
  return `${protocol}://${window.location.host}/api/socket`;
}

export function connectToChatSocket(callbacks: SocketCallbacks = {}) {
  if (typeof window === "undefined") {
    return { socket: null, disconnect: () => undefined, cleanup: () => undefined };
  }

  if (!socket || socket.readyState === WebSocket.CLOSED || socket.readyState === WebSocket.CLOSING) {
    socket = new WebSocket(buildSocketUrl());
  }

  const { onOpen, onMessage, onClose, onError } = callbacks;

  if (onOpen) socket.addEventListener("open", onOpen);
  if (onMessage) socket.addEventListener("message", onMessage);
  if (onClose) socket.addEventListener("close", onClose);
  if (onError) socket.addEventListener("error", onError);

  const cleanup = () => {
    if (!socket) return;
    if (onOpen) socket.removeEventListener("open", onOpen);
    if (onMessage) socket.removeEventListener("message", onMessage);
    if (onClose) socket.removeEventListener("close", onClose);
    if (onError) socket.removeEventListener("error", onError);
  };

  const disconnect = () => {
    cleanup();
    if (socket) {
      socket.close();
      socket = null;
    }
  };

  return { socket, cleanup, disconnect };
}
