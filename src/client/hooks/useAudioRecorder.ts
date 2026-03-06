import { useState, useRef, useCallback } from "react";

export function useAudioRecorder(onRecordingComplete: (blob: Blob) => void) {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus"
          : "audio/webm",
      });

      chunksRef.current = [];
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        stream.getTracks().forEach((track) => track.stop());
        onRecordingComplete(blob);
      };

      mediaRecorder.start(100); // Collect data every 100ms
      setIsRecording(true);
    } catch (err) {
      const inIframe = window.self !== window.top;
      const message = err instanceof DOMException && err.name === "NotAllowedError"
        ? inIframe
          ? "Microphone is not available in Teams web. Please use the Teams desktop app for recording."
          : "Microphone blocked by browser. Click the lock icon in your address bar, allow Microphone, and reload."
        : err instanceof DOMException && err.name === "NotFoundError"
        ? "No microphone found. Please connect a microphone and try again."
        : `Microphone error: ${err instanceof Error ? err.message : String(err)}`;
      console.error("Failed to start recording:", err);
      setError(message);
    }
  }, [onRecordingComplete]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  return { isRecording, startRecording, stopRecording, error };
}
