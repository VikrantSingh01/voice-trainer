import { AssessmentResult } from "./pronunciationService";

/**
 * Mock pronunciation service for demo/development mode.
 * Works without Azure credentials — generates realistic fake scores.
 */
export class MockPronunciationService {
  async assessPronunciation(
    _audioBuffer: Buffer,
    referenceText: string,
    _language: string = "en-US"
  ): Promise<AssessmentResult> {
    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const words = referenceText.split(/\s+/).filter(Boolean);
    const baseAccuracy = 65 + Math.random() * 30; // 65-95 range

    return {
      text: referenceText,
      scores: {
        accuracy: round(baseAccuracy + jitter(5)),
        fluency: round(baseAccuracy + jitter(10)),
        completeness: round(Math.min(100, baseAccuracy + 10 + jitter(5))),
        prosody: round(baseAccuracy - 5 + jitter(10)),
        overall: round(baseAccuracy + jitter(5)),
      },
      words: words.map((word) => {
        const wordAccuracy = baseAccuracy + jitter(15);
        return {
          word,
          accuracy: round(wordAccuracy),
          error: wordAccuracy < 60 ? "Mispronunciation" : "None",
          phonemes: generateMockPhonemes(word, wordAccuracy),
        };
      }),
    };
  }
}

function generateMockPhonemes(
  word: string,
  baseAccuracy: number
): Array<{ phoneme: string; accuracy: number }> {
  // Simple phoneme approximation
  const phonemeMap: Record<string, string[]> = {
    th: ["θ"],
    sh: ["ʃ"],
    ch: ["tʃ"],
    ng: ["ŋ"],
    ph: ["f"],
  };

  const phonemes: Array<{ phoneme: string; accuracy: number }> = [];
  let i = 0;
  const lower = word.toLowerCase();

  while (i < lower.length) {
    const digraph = lower.slice(i, i + 2);
    if (phonemeMap[digraph]) {
      phonemes.push({
        phoneme: phonemeMap[digraph][0],
        accuracy: round(baseAccuracy + jitter(10)),
      });
      i += 2;
    } else {
      phonemes.push({
        phoneme: lower[i],
        accuracy: round(baseAccuracy + jitter(10)),
      });
      i++;
    }
  }

  return phonemes;
}

function jitter(range: number): number {
  return (Math.random() - 0.5) * 2 * range;
}

function round(n: number): number {
  return Math.round(Math.max(0, Math.min(100, n)));
}
