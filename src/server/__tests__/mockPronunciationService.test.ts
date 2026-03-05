import { MockPronunciationService } from "../services/mockPronunciationService";

describe("MockPronunciationService", () => {
  const service = new MockPronunciationService();

  it("should return assessment results with valid scores", async () => {
    const result = await service.assessPronunciation(
      Buffer.from("fake-audio"),
      "Hello how are you"
    );

    expect(result.text).toBe("Hello how are you");
    expect(result.scores).toBeDefined();
    expect(result.scores.accuracy).toBeGreaterThanOrEqual(0);
    expect(result.scores.accuracy).toBeLessThanOrEqual(100);
    expect(result.scores.fluency).toBeGreaterThanOrEqual(0);
    expect(result.scores.fluency).toBeLessThanOrEqual(100);
    expect(result.scores.overall).toBeGreaterThanOrEqual(0);
    expect(result.scores.overall).toBeLessThanOrEqual(100);
    expect(result.scores.completeness).toBeGreaterThanOrEqual(0);
    expect(result.scores.completeness).toBeLessThanOrEqual(100);
    expect(result.scores.prosody).toBeGreaterThanOrEqual(0);
    expect(result.scores.prosody).toBeLessThanOrEqual(100);
  });

  it("should return word-level results for each word", async () => {
    const result = await service.assessPronunciation(
      Buffer.from("fake-audio"),
      "think three"
    );

    expect(result.words).toHaveLength(2);
    expect(result.words[0].word).toBe("think");
    expect(result.words[1].word).toBe("three");
    result.words.forEach((w) => {
      expect(w.accuracy).toBeGreaterThanOrEqual(0);
      expect(w.accuracy).toBeLessThanOrEqual(100);
      expect(w.phonemes.length).toBeGreaterThan(0);
    });
  });

  it("should generate phoneme breakdowns for words with digraphs", async () => {
    const result = await service.assessPronunciation(
      Buffer.from("fake-audio"),
      "the"
    );

    // "the" → "th" digraph + "e" = 2 phonemes
    expect(result.words[0].phonemes.length).toBe(2);
    expect(result.words[0].phonemes[0].phoneme).toBe("θ");
  });
});
