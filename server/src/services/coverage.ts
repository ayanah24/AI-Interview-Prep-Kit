import type { Question, Requirement } from "../models/kit";

/**
 * Deterministic coverage check. The model may propose links, but only this
 * function decides which extracted requirements remain uncovered.
 */
export function findUncoveredRequirementIds(
  requirements: Requirement[],
  questions: Question[],
  priority: Requirement["priority"] = "must",
): string[] {
  const covered = new Set(questions.flatMap((question) => question.requirement_ids));
  return requirements
    .filter((requirement) => requirement.priority === priority && !covered.has(requirement.id))
    .map((requirement) => requirement.id);
}

export function hasCompleteMustHaveCoverage(requirements: Requirement[], questions: Question[]): boolean {
  return findUncoveredRequirementIds(requirements, questions).length === 0;
}
