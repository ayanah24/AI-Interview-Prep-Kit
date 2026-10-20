import { describe, expect, it } from "vitest";
import { LocalRequirementExtractor } from "../requirement-extractor";

const extractor = new LocalRequirementExtractor();

describe("LocalRequirementExtractor", () => {
  it("extracts only explicit requirements and preserves their priority", async () => {
    const result = await extractor.extract(`Senior Frontend Engineer
Location: Remote, India

Responsibilities
- Mentor junior engineers
- Build accessible user interfaces

Requirements
- 5+ years of React and TypeScript experience
- Strong communication skills

Nice to have
- AWS experience`);

    expect(result.title).toBe("Senior Frontend Engineer");
    expect(result.seniority).toBe("Senior");
    expect(result.location).toBe("Remote, India");
    expect(result.responsibilities).toEqual(["Mentor junior engineers", "Build accessible user interfaces"]);
    expect(result.requirements).toEqual([
      { id: "r1", text: "5+ years of React and TypeScript experience", kind: "technical", priority: "must" },
      { id: "r2", text: "Strong communication skills", kind: "behavioural", priority: "must" },
      { id: "r3", text: "AWS experience", kind: "technical", priority: "nice" },
    ]);
  });

  it("reports a thin description instead of inventing requirements", async () => {
    const result = await extractor.extract("Software Engineer");

    expect(result.requirements).toEqual([]);
    expect(result.warnings).toContain("No explicit requirements were found in the job description.");
  });

  it("uses stable ids when extracting the same description again", async () => {
    const jobDescription = "Requirements\n- Node.js experience\n- Knowledge of payments";
    const first = await extractor.extract(jobDescription);
    const second = await extractor.extract(jobDescription);

    expect(first.requirements).toEqual(second.requirements);
    expect(first.requirements.map((requirement) => requirement.id)).toEqual(["r1", "r2"]);
  });
});
