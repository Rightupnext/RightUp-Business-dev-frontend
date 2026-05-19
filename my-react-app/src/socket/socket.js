import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

const socket = io(SOCKET_URL, {
  transports: ["websocket"],
  autoConnect: true,
  reconnection: true,
});

socket.on("connect", () => {
  console.log("✅ FRONTEND SOCKET CONNECTED:", socket.id);
});

socket.on("disconnect", () => {
  console.log("❌ FRONTEND SOCKET DISCONNECTED");
});

export default socket;