import { Router, Request, Response } from "express";
import {
  SpeechConfig,
  AudioConfig,
  SpeechRecognizer,
  PronunciationAssessmentConfig,
  PronunciationAssessmentGradingSystem,
  PronunciationAssessmentGranularity,
} from "microsoft-cognitiveservices-speech-sdk";

export const speechRouter = Router();

const getSpeechConfig = (): SpeechConfig => {
  const key = process.env.AZURE_SPEECH_KEY;
  const region = process.env.AZURE_SPEECH_REGION;
  if (!key || !region) {
    throw new Error("Azure Speech credentials not configured");
  }
  return SpeechConfig.fromSubscription(key, region);
};

/**
 * POST /api/speech/assess
 * Accepts audio buffer and reference text, returns pronunciation assessment.
 */
speechRouter.post("/assess", async (req: Request, res: Response) => {
  try {
    const { audioData, referenceText, language = "en-US" } = req.body;

    if (!audioData || !referenceText) {
      res.status(400).json({ error: "audioData and referenceText are required" });
      return;
    }

    const speechConfig = getSpeechConfig();
    speechConfig.speechRecognitionLanguage = language;

    const pronunciationConfig = new PronunciationAssessmentConfig(
      referenceText,
      PronunciationAssessmentGradingSystem.HundredMark,
      PronunciationAssessmentGranularity.Phoneme,
      true
    );

    // Decode base64 audio data
    const audioBuffer = Buffer.from(audioData, "base64");
    const pushStream =
      AudioConfig.fromWavFileInput(audioBuffer);

    const recognizer = new SpeechRecognizer(speechConfig, pushStream);
    pronunciationConfig.applyTo(recognizer);

    const result = await new Promise<Record<string, unknown>>((resolve, reject) => {
      recognizer.recognizeOnceAsync(
        (result) => {
          const pronunciationResult = JSON.parse(
            result.properties.getProperty("PronunciationAssessment.Result") || "{}"
          );
          resolve({
            text: result.text,
            scores: {
              accuracy: pronunciationResult.NBest?.[0]?.PronunciationAssessment?.AccuracyScore ?? 0,
              fluency: pronunciationResult.NBest?.[0]?.PronunciationAssessment?.FluencyScore ?? 0,
              completeness: pronunciationResult.NBest?.[0]?.PronunciationAssessment?.CompletenessScore ?? 0,
              prosody: pronunciationResult.NBest?.[0]?.PronunciationAssessment?.ProsodyScore ?? 0,
              overall: pronunciationResult.NBest?.[0]?.PronunciationAssessment?.PronScore ?? 0,
            },
            words: pronunciationResult.NBest?.[0]?.Words?.map((w: Record<string, unknown>) => ({
              word: w.Word,
              accuracy: (w.PronunciationAssessment as Record<string, number>)?.AccuracyScore ?? 0,
              error: (w.PronunciationAssessment as Record<string, string>)?.ErrorType ?? "None",
              phonemes: (w.Phonemes as Array<Record<string, unknown>>)?.map(
                (p: Record<string, unknown>) => ({
                  phoneme: p.Phoneme,
                  accuracy: (p.PronunciationAssessment as Record<string, number>)?.AccuracyScore ?? 0,
                })
              ),
            })) ?? [],
          });
          recognizer.close();
        },
        (error) => {
          recognizer.close();
          reject(new Error(error));
        }
      );
    });

    res.json(result);
  } catch (error) {
    console.error("Pronunciation assessment error:", error);
    res.status(500).json({ error: "Failed to assess pronunciation" });
  }
});

/**
 * GET /api/speech/token
 * Returns a short-lived token for client-side speech SDK usage.
 */
speechRouter.get("/token", async (_req: Request, res: Response) => {
  try {
    const key = process.env.AZURE_SPEECH_KEY;
    const region = process.env.AZURE_SPEECH_REGION;
    if (!key || !region) {
      res.status(500).json({ error: "Speech service not configured" });
      return;
    }

    const response = await fetch(
      `https://${region}.api.cognitive.microsoft.com/sts/v1.0/issueToken`,
      {
        method: "POST",
        headers: {
          "Ocp-Apim-Subscription-Key": key,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Token fetch failed: ${response.statusText}`);
    }

    const token = await response.text();
    res.json({ token, region });
  } catch (error) {
    console.error("Token generation error:", error);
    res.status(500).json({ error: "Failed to generate speech token" });
  }
});
