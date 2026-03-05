import express from "express";
import request from "supertest";
import { lessonsRouter } from "../routes/lessons";

const app = express();
app.use(express.json());
app.use("/api/lessons", lessonsRouter);

describe("Lessons API", () => {
  it("GET /api/lessons should return all lessons", async () => {
    const res = await request(app).get("/api/lessons");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);

    const lesson = res.body[0];
    expect(lesson).toHaveProperty("id");
    expect(lesson).toHaveProperty("title");
    expect(lesson).toHaveProperty("category");
    expect(lesson).toHaveProperty("difficulty");
    expect(lesson).toHaveProperty("exerciseCount");
    // Summary should NOT include full exercises
    expect(lesson).not.toHaveProperty("exercises");
  });

  it("GET /api/lessons/:id should return a lesson with exercises", async () => {
    const res = await request(app).get("/api/lessons/th-sounds");
    expect(res.status).toBe(200);
    expect(res.body.id).toBe("th-sounds");
    expect(res.body.title).toBe("The TH Sounds");
    expect(Array.isArray(res.body.exercises)).toBe(true);
    expect(res.body.exercises.length).toBeGreaterThan(0);

    const exercise = res.body.exercises[0];
    expect(exercise).toHaveProperty("id");
    expect(exercise).toHaveProperty("text");
    expect(exercise).toHaveProperty("ipa");
    expect(exercise).toHaveProperty("type");
  });

  it("GET /api/lessons/:id should return 404 for unknown lesson", async () => {
    const res = await request(app).get("/api/lessons/nonexistent");
    expect(res.status).toBe(404);
  });

  it("GET /api/lessons/category/:category should filter by category", async () => {
    const res = await request(app).get("/api/lessons/category/consonants");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    res.body.forEach((lesson: { category: string }) => {
      expect(lesson.category).toBe("consonants");
    });
  });
});
