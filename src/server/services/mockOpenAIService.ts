/**
 * Mock OpenAI service for demo/development mode.
 * Works without Azure OpenAI credentials.
 */
export class MockOpenAIService {
  private scenarioResponses: Record<string, string[]> = {
    "ordering food": [
      "I would like to order a large coffee with milk, please.",
      "Could I have the grilled chicken sandwich with a side salad?",
      "Do you have any vegetarian options on the menu today?",
    ],
    "job interview": [
      "I have three years of experience in software development.",
      "My greatest strength is my ability to work well in a team.",
      "I am very interested in this position because it aligns with my career goals.",
    ],
    "team meeting": [
      "I would like to share an update on the project timeline.",
      "Could we schedule a follow-up meeting to discuss this further?",
      "I think we should prioritize the customer feedback from last week.",
    ],
    "small talk": [
      "The weather has been really nice this week, hasn't it?",
      "Did you do anything fun over the weekend?",
      "Have you tried the new restaurant that just opened downtown?",
    ],
    default: [
      "Hello, it is nice to meet you. How are you doing today?",
      "Thank you for your help. I really appreciate it.",
      "Could you please explain that one more time? I want to make sure I understand.",
    ],
  };

  private feedbackTemplates = [
    "Great effort! Your pronunciation of '{text}' was {quality}. {tip}",
    "Nice work! You scored {score}% overall. {tip}",
    "Keep it up! {tip} Practice this phrase a few more times to build muscle memory.",
  ];

  private tips = [
    "Try slowing down slightly to improve clarity on consonant clusters.",
    "Focus on the 'th' sound by placing your tongue between your teeth.",
    "Your vowel sounds are getting stronger — great progress!",
    "Pay attention to word stress — emphasize the right syllables.",
    "Your fluency is improving! Keep practicing at a natural pace.",
    "Try recording yourself and listening back to catch areas for improvement.",
  ];

  async generateConversationPrompt(
    scenario: string,
    _userLevel: "beginner" | "intermediate" | "advanced"
  ): Promise<string> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const responses =
      this.scenarioResponses[scenario.toLowerCase()] || this.scenarioResponses["default"];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  async provideFeedback(
    _spokenText: string,
    referenceText: string,
    scores: Record<string, number>
  ): Promise<string> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const quality =
      scores.overall >= 80 ? "excellent" : scores.overall >= 60 ? "good" : "showing improvement";
    const tip = this.tips[Math.floor(Math.random() * this.tips.length)];
    const template =
      this.feedbackTemplates[Math.floor(Math.random() * this.feedbackTemplates.length)];

    return template
      .replace("{text}", referenceText)
      .replace("{quality}", quality)
      .replace("{score}", String(scores.overall))
      .replace("{tip}", tip);
  }

  async chat(
    messages: Array<{ role: string; content: string }>
  ): Promise<string> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const lastUserMessage = messages.filter((m) => m.role === "user").pop();
    if (!lastUserMessage) return "Hello! What would you like to practice today?";

    const responses = [
      "That's a great response! Now try saying: 'I think we should schedule a meeting to discuss the project timeline.'",
      "Well done! Let's practice another phrase: 'Could you please share the quarterly report with the team?'",
      "Nice work! Here's your next challenge: 'I would appreciate your feedback on this presentation.'",
      "Good job! Try this one: 'The weather forecast says it will be sunny throughout the week.'",
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
}
