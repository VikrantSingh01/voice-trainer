import { Router, Request, Response } from "express";
import { OpenAIService } from "../services/openaiService";
import { MockOpenAIService } from "../services/mockOpenAIService";

export const conversationRouter = Router();

function getService(): OpenAIService | MockOpenAIService {
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const key = process.env.AZURE_OPENAI_KEY;
  const deployment = process.env.AZURE_OPENAI_DEPLOYMENT || "gpt-4o";

  if (endpoint && key) {
    return new OpenAIService(endpoint, key, deployment);
  }
  console.log("⚡ Using mock OpenAI service (no credentials configured)");
  return new MockOpenAIService();
}

/** POST /api/conversation/prompt — Generate a conversation prompt */
conversationRouter.post("/prompt", async (req: Request, res: Response) => {
  try {
    const { scenario = "small talk", level = "beginner" } = req.body;
    const service = getService();
    const prompt = await service.generateConversationPrompt(scenario, level);
    res.json({ prompt, scenario, level });
  } catch (error) {
    console.error("Conversation prompt error:", error);
    res.status(500).json({ error: "Failed to generate prompt" });
  }
});

/** POST /api/conversation/feedback — Get AI feedback on pronunciation */
conversationRouter.post("/feedback", async (req: Request, res: Response) => {
  try {
    const { spokenText, referenceText, scores } = req.body;
    if (!referenceText || !scores) {
      res.status(400).json({ error: "referenceText and scores are required" });
      return;
    }
    const service = getService();
    const feedback = await service.provideFeedback(
      spokenText || "",
      referenceText,
      scores
    );
    res.json({ feedback });
  } catch (error) {
    console.error("Feedback error:", error);
    res.status(500).json({ error: "Failed to generate feedback" });
  }
});

/** POST /api/conversation/chat — Multi-turn conversation practice */
conversationRouter.post("/chat", async (req: Request, res: Response) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      res.status(400).json({ error: "messages array is required" });
      return;
    }
    const service = getService();
    const reply = await service.chat(messages);
    res.json({ reply });
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({ error: "Failed to generate reply" });
  }
});
