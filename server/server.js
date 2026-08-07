console.log("this is from server");

import dns from "dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);

import dotenv from "dotenv";
dotenv.config();

import connectDB from "./config/db.js";
import app from "./app.js";
import proposalRoutes from "./routes/proposalRoutes.js";

connectDB();

const PORT = process.env.PORT || 5000;

app.use("/api/proposals", proposalRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});