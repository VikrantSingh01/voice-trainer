import { MockOpenAIService } from "../services/mockOpenAIService";

describe("MockOpenAIService", () => {
  const service = new MockOpenAIService();

  it("should generate a conversation prompt", async () => {
    const prompt = await service.generateConversationPrompt("ordering food", "beginner");
    expect(typeof prompt).toBe("string");
    expect(prompt.length).toBeGreaterThan(0);
  });

  it("should provide feedback with scores", async () => {
    const feedback = await service.provideFeedback(
      "Hello how are you",
      "Hello, how are you?",
      { overall: 85, accuracy: 90, fluency: 80 }
    );
    expect(typeof feedback).toBe("string");
    expect(feedback.length).toBeGreaterThan(0);
  });

  it("should handle chat messages", async () => {
    const reply = await service.chat([
      { role: "system", content: "You are a conversation partner." },
      { role: "user", content: "Hello!" },
    ]);
    expect(typeof reply).toBe("string");
    expect(reply.length).toBeGreaterThan(0);
  });

  it("should return default response for unknown scenarios", async () => {
    const prompt = await service.generateConversationPrompt("unknown scenario", "advanced");
    expect(typeof prompt).toBe("string");
    expect(prompt.length).toBeGreaterThan(0);
  });
});
