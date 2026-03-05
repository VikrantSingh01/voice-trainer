import OpenAI from "openai";

export interface ConversationMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export class OpenAIService {
  private client: OpenAI;
  private deploymentName: string;

  constructor(endpoint: string, apiKey: string, deploymentName: string = "gpt-4o") {
    this.client = new OpenAI({
      apiKey,
      baseURL: `${endpoint}/openai/deployments/${deploymentName}`,
      defaultQuery: { "api-version": "2024-10-21" },
      defaultHeaders: { "api-key": apiKey },
    });
    this.deploymentName = deploymentName;
  }

  async generateConversationPrompt(
    scenario: string,
    userLevel: "beginner" | "intermediate" | "advanced"
  ): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: this.deploymentName,
      messages: [
        {
          role: "system",
          content: `You are an English pronunciation coach. Generate a short conversational prompt for a ${userLevel}-level non-English speaker to practice speaking. 
          The scenario is: ${scenario}.
          Keep it to 1-2 sentences. Use vocabulary appropriate for the level.
          Include words that exercise common pronunciation challenges (th, r/l, v/w, consonant clusters).`,
        },
        {
          role: "user",
          content: `Generate a practice sentence for the "${scenario}" scenario.`,
        },
      ],
      max_tokens: 150,
      temperature: 0.8,
    });

    return response.choices[0]?.message?.content || "Please try again.";
  }

  async provideFeedback(
    spokenText: string,
    referenceText: string,
    scores: Record<string, number>
  ): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: this.deploymentName,
      messages: [
        {
          role: "system",
          content: `You are a friendly English pronunciation coach. Based on the pronunciation scores, give brief, encouraging feedback (2-3 sentences max). Focus on what the learner did well and one specific thing to improve. Be culturally sensitive.`,
        },
        {
          role: "user",
          content: `The learner tried to say: "${referenceText}"
They actually said: "${spokenText}"
Scores: Accuracy ${scores.accuracy}%, Fluency ${scores.fluency}%, Overall ${scores.overall}%
Give brief feedback.`,
        },
      ],
      max_tokens: 200,
      temperature: 0.7,
    });

    return response.choices[0]?.message?.content || "Great effort! Keep practicing.";
  }

  async chat(messages: ConversationMessage[]): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: this.deploymentName,
      messages,
      max_tokens: 300,
      temperature: 0.7,
    });

    return response.choices[0]?.message?.content || "";
  }
}
