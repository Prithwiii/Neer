import express from "express";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import bookRoutes from "./routes/bookRoutes.js";
import complaintRoutes from "./routes/complaintRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";

const app = express();

app.use(cors());

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/contacts", contactRoutes);

export default app;
