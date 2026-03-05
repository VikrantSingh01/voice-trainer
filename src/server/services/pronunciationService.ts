import * as sdk from "microsoft-cognitiveservices-speech-sdk";

export interface AssessmentResult {
  text: string;
  scores: {
    accuracy: number;
    fluency: number;
    completeness: number;
    prosody: number;
    overall: number;
  };
  words: WordResult[];
}

export interface WordResult {
  word: string;
  accuracy: number;
  error: string;
  phonemes: PhonemeResult[];
}

export interface PhonemeResult {
  phoneme: string;
  accuracy: number;
}

export class PronunciationService {
  private speechConfig: sdk.SpeechConfig;

  constructor(subscriptionKey: string, region: string) {
    this.speechConfig = sdk.SpeechConfig.fromSubscription(subscriptionKey, region);
  }

  async assessPronunciation(
    audioBuffer: Buffer,
    referenceText: string,
    language: string = "en-US"
  ): Promise<AssessmentResult> {
    this.speechConfig.speechRecognitionLanguage = language;

    const pronunciationConfig = new sdk.PronunciationAssessmentConfig(
      referenceText,
      sdk.PronunciationAssessmentGradingSystem.HundredMark,
      sdk.PronunciationAssessmentGranularity.Phoneme,
      true
    );

    const audioConfig = sdk.AudioConfig.fromWavFileInput(audioBuffer);
    const recognizer = new sdk.SpeechRecognizer(this.speechConfig, audioConfig);
    pronunciationConfig.applyTo(recognizer);

    return new Promise((resolve, reject) => {
      recognizer.recognizeOnceAsync(
        (result) => {
          try {
            const raw = JSON.parse(
              result.properties.getProperty("PronunciationAssessment.Result") || "{}"
            );
            const best = raw.NBest?.[0];
            const assessment = best?.PronunciationAssessment;

            resolve({
              text: result.text,
              scores: {
                accuracy: assessment?.AccuracyScore ?? 0,
                fluency: assessment?.FluencyScore ?? 0,
                completeness: assessment?.CompletenessScore ?? 0,
                prosody: assessment?.ProsodyScore ?? 0,
                overall: assessment?.PronScore ?? 0,
              },
              words:
                best?.Words?.map((w: Record<string, unknown>) => ({
                  word: w.Word as string,
                  accuracy: (w.PronunciationAssessment as Record<string, number>)?.AccuracyScore ?? 0,
                  error: (w.PronunciationAssessment as Record<string, string>)?.ErrorType ?? "None",
                  phonemes:
                    (w.Phonemes as Array<Record<string, unknown>>)?.map((p) => ({
                      phoneme: p.Phoneme as string,
                      accuracy: (p.PronunciationAssessment as Record<string, number>)?.AccuracyScore ?? 0,
                    })) ?? [],
                })) ?? [],
            });
          } catch (e) {
            reject(e);
          } finally {
            recognizer.close();
          }
        },
        (error) => {
          recognizer.close();
          reject(new Error(error));
        }
      );
    });
  }

  async getAuthToken(): Promise<{ token: string; region: string }> {
    const key = this.speechConfig.subscriptionKey;
    const region = this.speechConfig.region;

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
      throw new Error(`Token generation failed: ${response.statusText}`);
    }

    return { token: await response.text(), region };
  }
}
