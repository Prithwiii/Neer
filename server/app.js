import express from "express";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import bookRoutes from "./routes/bookRoutes.js";
import complaintRoutes from "./routes/complaintRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";

const app = express();

app.use(cors());

// the default 100kb body is too small for the optional lost and found photo,
// which is shrunk in the browser and sent inline as a data URI
app.use(express.json({ limit: "1mb" }));

app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/contacts", contactRoutes);

export default app;
