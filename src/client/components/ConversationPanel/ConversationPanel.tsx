import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  makeStyles,
  tokens,
  Title2,
  Text,
  Button,
  Card,
  Select,
  Badge,
  Spinner,
  Textarea,
} from "@fluentui/react-components";
import {
  Mic24Regular,
  MicOff24Regular,
  Send24Regular,
  ArrowReset24Regular,
} from "@fluentui/react-icons";
import { useAudioRecorder } from "../../hooks/useAudioRecorder";

const useStyles = makeStyles({
  container: {
    maxWidth: "800px",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  header: { textAlign: "center", marginBottom: "8px" },
  scenarioRow: { display: "flex", gap: "12px", alignItems: "end" },
  chatArea: { minHeight: "300px", maxHeight: "450px", overflow: "auto", padding: "16px" },
  message: { display: "flex", marginBottom: "12px" },
  assistantMsg: {
    backgroundColor: tokens.colorNeutralBackground3,
    padding: "12px 16px",
    borderRadius: "12px 12px 12px 4px",
    maxWidth: "80%",
  },
  userMsg: {
    backgroundColor: tokens.colorBrandBackground,
    color: tokens.colorNeutralForegroundOnBrand,
    padding: "12px 16px",
    borderRadius: "12px 12px 4px 12px",
    maxWidth: "80%",
    marginLeft: "auto",
  },
  inputArea: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
    padding: "12px 16px",
    borderTop: `1px solid ${tokens.colorNeutralStroke1}`,
  },
  recordBtn: { width: "48px", height: "48px", minWidth: "48px", borderRadius: "50%" },
  feedbackCard: {
    padding: "12px 16px",
    marginBottom: "12px",
    backgroundColor: tokens.colorNeutralBackground3,
    borderLeft: `4px solid ${tokens.colorBrandForeground1}`,
    borderRadius: tokens.borderRadiusMedium,
  },
});

interface ChatMessage {
  role: "assistant" | "user";
  content: string;
  scores?: { overall: number; accuracy: number; fluency: number };
  feedback?: string;
}

const scenarios = [
  { value: "small talk", label: "☕ Small Talk" },
  { value: "ordering food", label: "🍽️ Ordering Food" },
  { value: "job interview", label: "💼 Job Interview" },
  { value: "team meeting", label: "📋 Team Meeting" },
  { value: "asking directions", label: "🗺️ Asking Directions" },
  { value: "phone call", label: "📞 Phone Call" },
];

export const ConversationPanel: React.FC = () => {
  const styles = useStyles();
  const [scenario, setScenario] = useState("small talk");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [textInput, setTextInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startConversation = async () => {
    setIsLoading(true);
    setMessages([]);
    try {
      const res = await fetch("/api/conversation/prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenario, level: "beginner" }),
      });
      const data = await res.json();
      setMessages([
        {
          role: "assistant",
          content: `🎯 Scenario: ${scenario}\n\nTry saying this:\n\n"${data.prompt}"`,
        },
      ]);
    } catch {
      setMessages([
        { role: "assistant", content: "Let's practice! Say something and I'll give you feedback." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const processUserInput = async (
    text: string,
    scores?: { overall: number; accuracy: number; fluency: number }
  ) => {
    const userMessage: ChatMessage = { role: "user", content: text, scores };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      let feedback: string | undefined;
      if (scores) {
        const fbRes = await fetch("/api/conversation/feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ spokenText: text, referenceText: text, scores }),
        });
        const fbData = await fbRes.json();
        feedback = fbData.feedback;
      }

      const chatRes = await fetch("/api/conversation/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content: `You are a friendly English conversation partner for "${scenario}". Keep responses to 1-2 sentences with a new phrase to practice.`,
            },
            ...messages.map((m) => ({ role: m.role, content: m.content })),
            { role: "user", content: text },
          ],
        }),
      });
      const chatData = await chatRes.json();
      setMessages((prev) => [...prev, { role: "assistant", content: chatData.reply, feedback }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Great job! Let's keep practicing. Try another phrase." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const sendText = async () => {
    if (!textInput.trim()) return;
    const text = textInput.trim();
    setTextInput("");
    await processUserInput(text);
  };

  const onRecordingComplete = useCallback(
    async (audioBlob: Blob) => {
      try {
        const arrayBuffer = await audioBlob.arrayBuffer();
        const base64 = btoa(
          new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), "")
        );
        const lastAssistant = messages.filter((m) => m.role === "assistant").pop();
        const match = lastAssistant?.content.match(/"([^"]+)"/);
        const referenceText = match?.[1] || "Hello, how are you?";

        const assessRes = await fetch("/api/speech/assess", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ audioData: base64, referenceText }),
        });
        const data = await assessRes.json();
        await processUserInput(data.text || referenceText, data.scores);
      } catch {
        await processUserInput("[Audio recording]");
      }
    },
    [messages]
  );

  const { isRecording, startRecording, stopRecording, error: micError } = useAudioRecorder(onRecordingComplete);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Title2>Conversation Practice</Title2>
        <Text block>Practice speaking in real-world scenarios with AI feedback</Text>
      </div>

      <div className={styles.scenarioRow}>
        <Select value={scenario} onChange={(_e, data) => setScenario(data.value)} style={{ flex: 1 }}>
          {scenarios.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </Select>
        <Button appearance="primary" icon={<ArrowReset24Regular />} onClick={startConversation} disabled={isLoading}>
          {messages.length ? "Restart" : "Start"}
        </Button>
      </div>

      <Card>
        <div className={styles.chatArea}>
          {messages.length === 0 && (
            <Text style={{ color: tokens.colorNeutralForeground3, textAlign: "center", display: "block", padding: "40px" }}>
              Select a scenario and click Start to begin practicing!
            </Text>
          )}
          {messages.map((msg, idx) => (
            <div key={idx}>
              <div className={styles.message}>
                <div className={msg.role === "user" ? styles.userMsg : styles.assistantMsg}>
                  <Text>{msg.content}</Text>
                  {msg.scores && (
                    <div style={{ marginTop: "8px" }}>
                      <Badge appearance="outline" color="informative" size="small">Overall: {msg.scores.overall}%</Badge>{" "}
                      <Badge appearance="outline" color="informative" size="small">Accuracy: {msg.scores.accuracy}%</Badge>{" "}
                      <Badge appearance="outline" color="informative" size="small">Fluency: {msg.scores.fluency}%</Badge>
                    </div>
                  )}
                </div>
              </div>
              {msg.feedback && (
                <div className={styles.feedbackCard}>
                  <Text size={200}>💡 {msg.feedback}</Text>
                </div>
              )}
            </div>
          ))}
          {isLoading && <Spinner size="tiny" label="Thinking..." />}
          {micError && (
            <Text style={{ color: tokens.colorPaletteRedForeground1, padding: "8px 0" }}>
              ⚠️ {micError}
            </Text>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className={styles.inputArea}>
          <Textarea
            value={textInput}
            onChange={(_e, data) => setTextInput(data.value)}
            placeholder="Type what you'd say (or use the mic)..."
            style={{ flex: 1 }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendText(); }
            }}
          />
          <Button appearance="subtle" icon={<Send24Regular />} onClick={sendText} disabled={!textInput.trim() || isLoading} />
          <Button
            className={styles.recordBtn}
            appearance={isRecording ? "primary" : "secondary"}
            shape="circular"
            icon={isRecording ? <MicOff24Regular /> : <Mic24Regular />}
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isLoading}
          />
        </div>
      </Card>
    </div>
  );
};
