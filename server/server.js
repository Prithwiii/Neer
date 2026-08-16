console.log("this is from server");

import dns from "dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);

import dotenv from "dotenv";
dotenv.config();

import connectDB from "./config/db.js";
import app from "./app.js";
import proposalRoutes from "./routes/proposalRoutes.js";
import resourceRoutes from "./routes/resourceRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import noticeRoutes from "./routes/noticeRoutes.js";
<<<<<<< HEAD
import intercomRoutes from "./routes/intercomRoutes.js";
=======
import billRoutes from "./routes/billRoutes.js";
>>>>>>> 617b0a7 (Add bill payment management feature)

connectDB();

const PORT = process.env.PORT || 5000;

app.use("/api/proposals", proposalRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/notices", noticeRoutes);
<<<<<<< HEAD
app.use("/api/intercom", intercomRoutes);
=======
app.use("/api/bills", billRoutes);
>>>>>>> 617b0a7 (Add bill payment management feature)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});