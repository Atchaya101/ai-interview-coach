import "dotenv/config"; // must be the first import so env vars exist before other modules read process.env
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import resumeRoutes from "./routes/resumeRoutes.js";
import interviewRoutes from "./routes/interviewRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

const app = express();

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

// Body parsing
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  message: { message: "Too many requests, please try again later." },
});
app.use("/api", apiLimiter);

// Health check
app.get("/api/health", (req, res) => res.json({ status: "ok", timestamp: new Date() }));

// Routes (no auth — single-user, in-memory, no database)
app.use("/api/resumes", resumeRoutes);
app.use("/api/interviews", interviewRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

console.log("Groq Key:", process.env.GROQ_API_KEY?.substring(0, 8));
console.log("Model:", process.env.MODEL);

app.listen(PORT, () => console.log(`Server running on port ${PORT} (in-memory storage, no database)`));
