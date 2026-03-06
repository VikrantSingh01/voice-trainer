import { useState, useRef, useCallback } from "react";
import { app } from "@microsoft/teams-js";

export function useAudioRecorder(onRecordingComplete: (blob: Blob) => void) {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    setError(null);
    try {
      // In Teams, ensure the SDK is initialized so the iframe has device permissions
      if (app.isInitialized()) {
        try {
          const { DevicePermission } = await import("@microsoft/teams-js").then(m => m.media ? m : m);
          // Teams desktop grants permission via manifest devicePermissions;
          // Teams web may still prompt the browser permission dialog.
        } catch {
          // media module not available — fall through to getUserMedia
        }
      }

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
      const message = err instanceof DOMException && err.name === "NotAllowedError"
        ? "Microphone access denied. Please allow microphone permissions in your browser/Teams settings."
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
