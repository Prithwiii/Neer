import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Message from "../models/Message.js";

let io;

export const setIO = (socketIO) => {
  io = socketIO;
};

export const getIO = () => {
  return io;
};

// Wraps the existing HTTP server with a single shared Socket.io server
// used by three features: Intercom ("register" event), community Chat
// ("sendMessage"/"newMessage"), and Alerts/Messages (via req.app.get("io")
// in server.js, using the same io instance set here).
export function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      // Matches your Vite dev server. Update this (or read from an
      // env var) if the frontend runs somewhere else in production.
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      credentials: true,
    },
  });

  // Socket-level auth: if the client sends a JWT in the handshake,
  // verify it the same way authMiddleware.js does for REST and attach
  // the user to the socket. This is OPTIONAL at the connection level so
  // other features (e.g. Intercom) that connect without a token still
  // work — chat-specific events below enforce the requirement themselves.
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) {
        return next();
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-password");

      if (user) {
        socket.user = user;
      }
      next();
    } catch (error) {
      // Invalid token: proceed unauthenticated rather than rejecting the
      // connection outright, so other features aren't affected.
      next();
    }
  });

  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.user?.username || socket.id}`);

    // --- Community Chat ---
    socket.on("sendMessage", async (payload, callback) => {
      try {
        if (!socket.user) {
          if (callback) callback({ ok: false, error: "Not authenticated" });
          return;
        }

        const text = (payload?.text || "").trim();
        if (!text) return;

        const message = await Message.create({
          user: socket.user._id,
          username: socket.user.username,
          role: socket.user.role,
          text,
        });

        // Broadcast to everyone connected, so all clients render from
        // the same source of truth.
        io.emit("newMessage", {
          _id: message._id,
          user: message.user,
          username: message.username,
          role: message.role,
          text: message.text,
          createdAt: message.createdAt,
        });

        if (callback) callback({ ok: true });
      } catch (error) {
        if (callback) callback({ ok: false, error: error.message });
      }
    });

    // --- Intercom ---
    socket.on("register", (userId) => {
      socket.join(`user-${userId}`);
      console.log(`User ${userId} registered for intercom`);
    });

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.user?.username || socket.id}`);
    });
  });

  setIO(io);
  return io;
}