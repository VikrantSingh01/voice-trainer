import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { speechRouter } from "./routes/speech";
import { lessonsRouter } from "./routes/lessons";
import { progressRouter } from "./routes/progress";

dotenv.config({ path: path.resolve(__dirname, "../../env/.env.local") });

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Serve static client files in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.resolve(__dirname, "../client")));
}

// API routes
app.use("/api/speech", speechRouter);
app.use("/api/lessons", lessonsRouter);
app.use("/api/progress", progressRouter);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// SPA fallback in production
if (process.env.NODE_ENV === "production") {
  app.get("*", (_req, res) => {
    res.sendFile(path.resolve(__dirname, "../client/index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`🎤 Voice Trainer server running on port ${PORT}`);
});

export default app;
