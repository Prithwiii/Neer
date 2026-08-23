console.log("this is from server");

import dns from "dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);

import dotenv from "dotenv";
dotenv.config();

import http from "http";
import connectDB from "./config/db.js";
import app from "./app.js";
import proposalRoutes from "./routes/proposalRoutes.js";
import resourceRoutes from "./routes/resourceRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import noticeRoutes from "./routes/noticeRoutes.js";
import maintenanceRoutes from "./routes/maintenanceRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import alertRoutes from "./routes/alertRoutes.js";
import { initSocket } from "./config/socket.js";

connectDB();

const PORT = process.env.PORT || 5000;

app.use("/api/proposals", proposalRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/notices", noticeRoutes);
app.use("/api/maintenance", maintenanceRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/alerts", alertRoutes);

// Wrap the Express app in a raw HTTP server so Socket.io can attach
// to the same port instead of needing a separate one.
const httpServer = http.createServer(app);
const io = initSocket(httpServer);

// Exposes the io instance to REST controllers (e.g. alertController)
// via req.app.get("io"), so a plain HTTP POST can still broadcast
// in real time to every connected socket.
app.set("io", io);

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
