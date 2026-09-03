console.log("this is from server");

import dns from "dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);

import dotenv from "dotenv";
dotenv.config();

import http from "http";
import {Server} from "socket.io";

import connectDB from "./config/db.js";
import app from "./app.js";

import proposalRoutes from "./routes/proposalRoutes.js";
import resourceRoutes from "./routes/resourceRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import noticeRoutes from "./routes/noticeRoutes.js";
import intercomRoutes from "./routes/intercomRoutes.js";
import billRoutes from "./routes/billRoutes.js";
import buildingLayoutRoutes from "./routes/buildingLayoutRoutes.js";
import garageRoutes from "./routes/garageRoutes.js";
import garageBookingRoutes from "./routes/garageBookingRoutes.js";
import flatRoutes from "./routes/flatRoutes.js";
import househelpRoutes from "./routes/househelpRoutes.js";
import familyExpenseRoutes from "./routes/familyExpenseRoutes.js";

import {setIO} from "./config/socket.js";

connectDB();

const PORT = process.env.PORT || 5000;

app.use("/api/proposals", proposalRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/notices", noticeRoutes);
app.use("/api/intercom", intercomRoutes);
app.use("/api/bills", billRoutes);
app.use("/api/building-layout", buildingLayoutRoutes);
app.use("/api/garages", garageRoutes);
app.use("/api/garage-bookings", garageBookingRoutes);
app.use("/api/flats", flatRoutes);
app.use("/api/househelp", househelpRoutes);
app.use("/api/family-expenses", familyExpenseRoutes);

// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

setIO(io);

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("register", (userId) => {
    socket.join(`user-${userId}`);

    console.log(`User ${userId} registered for intercom`);
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

httpServer.listen(PORT, () => { 
  console.log(`Server running on port ${PORT}`);
});