import express from "express";
import compression from "compression";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { speechRouter } from "./routes/speech";
import { lessonsRouter } from "./routes/lessons";
import { progressRouter } from "./routes/progress";
import { conversationRouter } from "./routes/conversation";
import { authRouter } from "./routes/auth";

dotenv.config({ path: path.resolve(__dirname, "../../env/.env.local") });

const app = express();
const PORT = process.env.PORT || 3001;

const isDemoMode =
  !process.env.AZURE_SPEECH_KEY || !process.env.AZURE_OPENAI_KEY;

app.use(compression());
app.use(cors());
app.use(express.json({ limit: "10mb" }));


// Serve static client files (built by `npm run build:client` → dist/client/)
// Always active so the Teams tunnel (port 3978) can serve index.html in all envs.
const clientDistPath = path.resolve(__dirname, "../../dist/client");
app.use(express.static(clientDistPath));

// API routes
app.use("/api/auth", authRouter);
app.use("/api/speech", speechRouter);
app.use("/api/lessons", lessonsRouter);
app.use("/api/progress", progressRouter);
app.use("/api/conversation", conversationRouter);

// Health + config check
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    demoMode: isDemoMode,
    services: {
      speech: !!process.env.AZURE_SPEECH_KEY,
      openai: !!process.env.AZURE_OPENAI_KEY,
      sso: !!process.env.AAD_APP_CLIENT_ID,
    },
  });
});

// SPA fallback — return index.html for any non-API route so React Router works
app.get("*", (_req, res) => {
  res.sendFile(path.resolve(clientDistPath, "index.html"));
});

app.listen(PORT, () => {
  console.log(`🎤 Voice Trainer server running on port ${PORT}`);
  if (isDemoMode) {
    console.log("⚡ Running in DEMO MODE — using mock services (no Azure keys needed)");
    console.log("   Set AZURE_SPEECH_KEY and AZURE_OPENAI_KEY for real AI features");
  }
});

export default app;
