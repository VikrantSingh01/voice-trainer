import React, { useState, useCallback } from "react";
import {
  makeStyles,
  tokens,
  Title2,
  Text,
  Button,
  Card,
  CardHeader,
  Input,
  Badge,
  Spinner,
} from "@fluentui/react-components";
import { Mic24Regular, MicOff24Regular } from "@fluentui/react-icons";
import { useAudioRecorder } from "../../hooks/useAudioRecorder";
import { ScoreDisplay } from "./ScoreDisplay";

const useStyles = makeStyles({
  container: {
    maxWidth: "800px",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  header: {
    textAlign: "center",
    marginBottom: "12px",
  },
  recordCard: {
    padding: "24px",
    textAlign: "center",
  },
  inputRow: {
    display: "flex",
    gap: "12px",
    alignItems: "end",
    marginBottom: "20px",
  },
  recordButton: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    minWidth: "80px",
    margin: "16px auto",
  },
  status: {
    marginTop: "8px",
  },
});

interface AssessmentResult {
  text: string;
  scores: {
    accuracy: number;
    fluency: number;
    completeness: number;
    prosody: number;
    overall: number;
  };
  words: Array<{
    word: string;
    accuracy: number;
    error: string;
    phonemes: Array<{ phoneme: string; accuracy: number }>;
  }>;
}

export const PracticePanel: React.FC = () => {
  const styles = useStyles();
  const [referenceText, setReferenceText] = useState("Hello, how are you doing today?");
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [isAssessing, setIsAssessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onRecordingComplete = useCallback(
    async (audioBlob: Blob) => {
      setIsAssessing(true);
      setError(null);
      try {
        const arrayBuffer = await audioBlob.arrayBuffer();
        const base64 = btoa(
          new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), "")
        );

        const response = await fetch("/api/speech/assess", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ audioData: base64, referenceText }),
        });

        if (!response.ok) throw new Error("Assessment failed");
        const data = await response.json();
        setResult(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Assessment failed");
      } finally {
        setIsAssessing(false);
      }
    },
    [referenceText]
  );

  const { isRecording, startRecording, stopRecording, error: micError } = useAudioRecorder(onRecordingComplete);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Title2>Pronunciation Practice</Title2>
        <Text block>Type or select a phrase, then record yourself speaking it</Text>
      </div>

      <Card className={styles.recordCard}>
        <CardHeader
          header={<Text weight="semibold">Reference Text</Text>}
          description={<Text size={200}>Say this phrase clearly into your microphone</Text>}
        />

        <div className={styles.inputRow}>
          <Input
            value={referenceText}
            onChange={(_e, data) => setReferenceText(data.value)}
            placeholder="Type a phrase to practice..."
            style={{ flex: 1 }}
            size="large"
          />
        </div>

        <Badge
          appearance="filled"
          color="informative"
          size="large"
          style={{ fontSize: "18px", padding: "12px 24px", marginBottom: "16px" }}
        >
          {referenceText}
        </Badge>

        <div>
          <Button
            className={styles.recordButton}
            shape="circular"
            appearance={isRecording ? "primary" : "secondary"}
            icon={isRecording ? <MicOff24Regular /> : <Mic24Regular />}
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isAssessing || !referenceText.trim()}
            size="large"
          />
          <Text block className={styles.status}>
            {isAssessing ? (
              <Spinner size="tiny" label="Analyzing pronunciation..." />
            ) : isRecording ? (
              "🔴 Recording... Click to stop"
            ) : (
              "Click the microphone to start recording"
            )}
          </Text>
        </div>

        {(error || micError) && (
          <Text style={{ color: tokens.colorPaletteRedForeground1, marginTop: "12px" }}>
            ⚠️ {error || micError}
          </Text>
        )}
      </Card>

      {result && <ScoreDisplay result={result} />}
    </div>
  );
};
