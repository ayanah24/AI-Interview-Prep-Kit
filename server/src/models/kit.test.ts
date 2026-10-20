import { describe, expect, it } from "vitest";
import { validateKit } from "./kit.js";

function validKit() {
  return {
    source: { company: "Acme", company_url: "https://acme.example", role: "Engineer", location: "Remote", jd_chars: 12, researched_at: "2026-10-19T00:00:00Z", pages_used: [] },
    company_brief: { summary: "", what_they_do: "", sources: [] },
    role: { title: "Engineer", seniority: "Senior", responsibilities: [], requirements: [{ id: "r1", text: "TypeScript", kind: "technical", priority: "must" }] },
    questions: [{ id: "q1", requirement_ids: ["r1"], category: "technical", prompt: "Explain TypeScript", answer_outline: "", difficulty: 2 }],
    flashcards: [],
    schedule: { days_available: 1, days: [{ day: 1, focus: "Practice", question_ids: ["q1"], minutes: 30 }] },
    coverage: { uncovered_requirement_ids: [], passes: 1 },
  };
}

describe("kit structure validation", () => {
  it("accepts the required Appendix A shape", () => {
    expect(() => validateKit(validKit())).not.toThrow();
  });

  it("rejects unknown question references in the schedule", () => {
    const kit = validKit();
    kit.schedule.days[0].question_ids = ["not-a-question"];
    expect(() => validateKit(kit)).toThrow(/unknown question/);
  });
});
