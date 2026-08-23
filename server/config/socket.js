import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Message from "../models/Message.js";

// Wraps the existing HTTP server with a Socket.io server for the
// community chat room. Every resident who connects joins the same
// room, so this is a single shared group chat (not 1-on-1 DMs).
export function initSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      // Matches your Vite dev server. Update this (or read from an
      // env var) if the frontend runs somewhere else in production.
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      credentials: true,
    },
  });

  // Socket-level auth: the client sends its JWT in the handshake,
  // and we verify it the same way authMiddleware.js does for REST.
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) {
        return next(new Error("No token provided"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        return next(new Error("Token is invalid"));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error("Token is invalid"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`Chat: ${socket.user.username} connected`);

    socket.on("sendMessage", async (payload, callback) => {
      try {
        const text = (payload?.text || "").trim();
        if (!text) return;

        const message = await Message.create({
          user: socket.user._id,
          username: socket.user.username,
          text,
        });

        // Broadcast to everyone in the room, including the sender,
        // so all clients render from the same source of truth.
        io.emit("newMessage", {
          _id: message._id,
          user: message.user,
          username: message.username,
          text: message.text,
          createdAt: message.createdAt,
        });

        if (callback) callback({ ok: true });
      } catch (error) {
        if (callback) callback({ ok: false, error: error.message });
      }
    });

    socket.on("disconnect", () => {
      console.log(`Chat: ${socket.user.username} disconnected`);
    });
  });

  return io;
}
