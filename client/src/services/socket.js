import { io } from "socket.io-client";
import API_URL from "../config/api";

let socket = null;

// Creates (or reuses) a single socket connection authenticated with
// the current user's JWT. Call disconnectSocket() on logout/unmount.
export function getSocket() {
  if (socket) return socket;

  const token = localStorage.getItem("token");

  socket = io(API_URL, {
    auth: { token },
    autoConnect: true,
  });

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}