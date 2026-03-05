import express from "express";
import request from "supertest";
import { progressRouter } from "../routes/progress";

const app = express();
app.use(express.json());
app.use("/api/progress", progressRouter);

describe("Progress API", () => {
  it("POST /api/progress should save a session", async () => {
    const res = await request(app).post("/api/progress").send({
      userId: "test-user",
      lessonId: "th-sounds",
      exerciseId: "th-1",
      scores: { accuracy: 85, fluency: 80, completeness: 90, prosody: 75, overall: 82 },
    });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.userId).toBe("test-user");
    expect(res.body.scores.accuracy).toBe(85);
  });

  it("POST /api/progress should reject missing fields", async () => {
    const res = await request(app).post("/api/progress").send({ userId: "test-user" });
    expect(res.status).toBe(400);
  });

  it("GET /api/progress/:userId should return progress summary", async () => {
    // Save a couple sessions first
    await request(app).post("/api/progress").send({
      userId: "summary-user",
      lessonId: "th-sounds",
      exerciseId: "th-1",
      scores: { accuracy: 80, fluency: 75, completeness: 85, prosody: 70, overall: 78 },
    });
    await request(app).post("/api/progress").send({
      userId: "summary-user",
      lessonId: "r-l-sounds",
      exerciseId: "rl-1",
      scores: { accuracy: 90, fluency: 85, completeness: 95, prosody: 80, overall: 88 },
    });

    const res = await request(app).get("/api/progress/summary-user");
    expect(res.status).toBe(200);
    expect(res.body.totalSessions).toBe(2);
    expect(res.body.averageScores).toBeDefined();
    expect(res.body.averageScores.accuracy).toBe(85); // avg of 80,90
    expect(res.body.lessonsCompleted).toBe(2);
  });

  it("GET /api/progress/:userId should handle unknown user", async () => {
    const res = await request(app).get("/api/progress/unknown-user");
    expect(res.status).toBe(200);
    expect(res.body.totalSessions).toBe(0);
    expect(res.body.averageScores).toBeNull();
  });
});
