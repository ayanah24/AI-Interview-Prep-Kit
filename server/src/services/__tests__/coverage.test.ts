import { describe, expect, it } from "vitest";
import { findUncoveredRequirementIds } from "../coverage";
import type { Question, Requirement } from "../../models/kit";

const requirements: Requirement[] = [
  { id: "r1", text: "TypeScript", kind: "technical", priority: "must" },
  { id: "r2", text: "Mentoring", kind: "behavioural", priority: "must" },
  { id: "r3", text: "AWS", kind: "technical", priority: "nice" },
];

it("reports only uncovered must-have requirements", () => {
  const questions: Question[] = [{
    id: "q1", requirement_ids: ["r1"], category: "technical", prompt: "Explain TypeScript", answer_outline: "", difficulty: 2,
  }];
  expect(findUncoveredRequirementIds(requirements, questions)).toEqual(["r2"]);
});
