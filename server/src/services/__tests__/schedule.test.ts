import { describe, expect, it } from "vitest";
import { allocateSchedule } from "../schedule";
import type { Question, Requirement } from "../../models/kit";

const requirements: Requirement[] = [
  { id: "r1", text: "System design", kind: "technical", priority: "must" },
  { id: "r2", text: "React", kind: "technical", priority: "nice" },
];
const questions: Question[] = [
  { id: "q1", requirement_ids: ["r2"], category: "technical", prompt: "React", answer_outline: "", difficulty: 1 },
  { id: "q2", requirement_ids: ["r1"], category: "system-design", prompt: "Design", answer_outline: "", difficulty: 3 },
];

it("creates exactly the requested number of days and prioritises must-have work", () => {
  const schedule = allocateSchedule(requirements, questions, 2);
  expect(schedule.days).toHaveLength(2);
  expect(schedule.days[0].question_ids).toContain("q2");
  expect(schedule.days.every((day) => Number.isInteger(day.minutes))).toBe(true);
});
