import { Router, Request, Response } from "express";

export const progressRouter = Router();

// In-memory store for now — will be replaced with Cosmos DB in Phase 2
interface PracticeSession {
  id: string;
  userId: string;
  lessonId: string;
  exerciseId: string;
  scores: {
    accuracy: number;
    fluency: number;
    completeness: number;
    prosody: number;
    overall: number;
  };
  timestamp: string;
}

const sessions: PracticeSession[] = [];

/** POST /api/progress — Save a practice session result */
progressRouter.post("/", (req: Request, res: Response) => {
  const { userId, lessonId, exerciseId, scores } = req.body;

  if (!userId || !lessonId || !exerciseId || !scores) {
    res.status(400).json({ error: "userId, lessonId, exerciseId, and scores are required" });
    return;
  }

  const session: PracticeSession = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    userId,
    lessonId,
    exerciseId,
    scores,
    timestamp: new Date().toISOString(),
  };

  sessions.push(session);
  res.status(201).json(session);
});

/** GET /api/progress/:userId — Get progress for a user */
progressRouter.get("/:userId", (req: Request, res: Response) => {
  const userSessions = sessions.filter((s) => s.userId === req.params.userId);

  // Calculate summary stats
  const totalSessions = userSessions.length;
  const avgScores = totalSessions > 0
    ? {
        accuracy: avg(userSessions.map((s) => s.scores.accuracy)),
        fluency: avg(userSessions.map((s) => s.scores.fluency)),
        completeness: avg(userSessions.map((s) => s.scores.completeness)),
        prosody: avg(userSessions.map((s) => s.scores.prosody)),
        overall: avg(userSessions.map((s) => s.scores.overall)),
      }
    : null;

  // Recent trend (last 10 sessions)
  const recentSessions = userSessions.slice(-10);

  res.json({
    totalSessions,
    averageScores: avgScores,
    recentSessions,
    lessonsCompleted: new Set(userSessions.map((s) => s.lessonId)).size,
  });
});

/** GET /api/progress/:userId/history — Get full session history */
progressRouter.get("/:userId/history", (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 50;
  const userSessions = sessions
    .filter((s) => s.userId === req.params.userId)
    .slice(-limit);
  res.json(userSessions);
});

function avg(nums: number[]): number {
  return nums.length ? Math.round(nums.reduce((a, b) => a + b, 0) / nums.length) : 0;
}
