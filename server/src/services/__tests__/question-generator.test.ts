import { describe, expect, it } from "vitest";
import { LocalQuestionGenerator } from "../question-generator";
import type { Requirement } from "../../models/kit";

const generator = new LocalQuestionGenerator();

describe("LocalQuestionGenerator", () => {
  it("creates a technical question linked to its source requirement", async () => {
    const requirement: Requirement = { id: "r1", text: "5+ years of React and TypeScript experience", kind: "technical", priority: "must" };
    const question = await generator.generate(requirement, "technical");

    expect(question).toMatchObject({
      id: "q-r1-technical",
      requirement_ids: ["r1"],
      category: "technical",
      difficulty: 3,
    });
    expect(question.prompt).toContain(requirement.text);
    expect(question.answer_outline).toContain(requirement.text);
  });

  it("places each requirement in an appropriate category", async () => {
    const requirements: Requirement[] = [
      { id: "r1", text: "React experience", kind: "technical", priority: "must" },
      { id: "r2", text: "Mentor junior engineers", kind: "behavioural", priority: "must" },
      { id: "r3", text: "Knowledge of payments", kind: "domain", priority: "nice" },
      { id: "r4", text: "Distributed system design", kind: "technical", priority: "must" },
    ];

    const questions = await generator.generateForRequirements(requirements);

    expect(questions.map((question) => question.category)).toEqual([
      "technical",
      "behavioural",
      "company-fit",
      "system-design",
    ]);
    expect(questions.every((question) => question.requirement_ids.length === 1)).toBe(true);
  });

  it("creates stable questions for the same requirement and category", async () => {
    const requirement: Requirement = { id: "r1", text: "Node.js experience", kind: "technical", priority: "must" };

    await expect(generator.generate(requirement, "technical")).resolves.toEqual(
      await generator.generate(requirement, "technical"),
    );
  });
});
