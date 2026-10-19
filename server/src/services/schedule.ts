import type { Kit, Question, Requirement } from "../models/kit";

type Schedule = Kit["schedule"];

const questionMinutes: Record<Question["difficulty"], number> = {
  1: 20,
  2: 30,
  3: 45,
};

/**
 * Deterministically places must-have and difficult material first. It creates
 * exactly `daysAvailable` days and never asks the LLM to perform allocation.
 */
export function allocateSchedule(
  requirements: Requirement[],
  questions: Question[],
  daysAvailable: number,
): Schedule {
  if (!Number.isInteger(daysAvailable) || daysAvailable < 1) {
    throw new Error("daysAvailable must be a positive integer");
  }

  const priorityByRequirement = new Map(requirements.map((item) => [item.id, item.priority]));
  const rankedQuestions = [...questions].sort((left, right) => {
    const leftHasMust = left.requirement_ids.some((id) => priorityByRequirement.get(id) === "must");
    const rightHasMust = right.requirement_ids.some((id) => priorityByRequirement.get(id) === "must");
    if (leftHasMust !== rightHasMust) return leftHasMust ? -1 : 1;
    if (left.difficulty !== right.difficulty) return right.difficulty - left.difficulty;
    return left.id.localeCompare(right.id);
  });

  const buckets = Array.from({ length: daysAvailable }, () => ({ question_ids: [] as string[], minutes: 0 }));
  const targetMinutes = Math.ceil(rankedQuestions.reduce((total, question) => total + questionMinutes[question.difficulty], 0) / daysAvailable);
  let bucketIndex = 0;

  for (const question of rankedQuestions) {
    const bucket = buckets[bucketIndex];
    bucket.question_ids.push(question.id);
    bucket.minutes += questionMinutes[question.difficulty];
    if (bucket.minutes >= targetMinutes && bucketIndex < buckets.length - 1) bucketIndex += 1;
  }

  return {
    days_available: daysAvailable,
    days: buckets.map((bucket, index) => ({
      day: index + 1,
      focus: focusForDay(bucket.question_ids, questions, priorityByRequirement, index + 1),
      question_ids: bucket.question_ids,
      minutes: bucket.minutes,
    })),
  };
}

function focusForDay(
  questionIds: string[],
  questions: Question[],
  priorityByRequirement: Map<string, Requirement["priority"]>,
  day: number,
): string {
  if (questionIds.length === 0) return "Review and reinforce previous material";
  const assigned = questions.filter((question) => questionIds.includes(question.id));
  const includesMustHave = assigned.some((question) => question.requirement_ids.some((id) => priorityByRequirement.get(id) === "must"));
  if (includesMustHave) return `Day ${day}: must-have requirement practice`;
  return `Day ${day}: supporting interview practice`;
}
