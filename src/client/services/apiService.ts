const API_BASE = "/api";

export async function fetchLessons() {
  const res = await fetch(`${API_BASE}/lessons`);
  if (!res.ok) throw new Error("Failed to fetch lessons");
  return res.json();
}

export async function fetchLesson(id: string) {
  const res = await fetch(`${API_BASE}/lessons/${id}`);
  if (!res.ok) throw new Error("Failed to fetch lesson");
  return res.json();
}

export async function assessPronunciation(audioData: string, referenceText: string) {
  const res = await fetch(`${API_BASE}/speech/assess`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ audioData, referenceText }),
  });
  if (!res.ok) throw new Error("Assessment failed");
  return res.json();
}

export async function getSpeechToken() {
  const res = await fetch(`${API_BASE}/speech/token`);
  if (!res.ok) throw new Error("Failed to get speech token");
  return res.json();
}

export async function saveProgress(data: {
  userId: string;
  lessonId: string;
  exerciseId: string;
  scores: Record<string, number>;
}) {
  const res = await fetch(`${API_BASE}/progress`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to save progress");
  return res.json();
}

export async function fetchProgress(userId: string) {
  const res = await fetch(`${API_BASE}/progress/${userId}`);
  if (!res.ok) throw new Error("Failed to fetch progress");
  return res.json();
}
