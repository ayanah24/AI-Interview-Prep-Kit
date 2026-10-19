import { z } from "zod";

const requirementSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
  kind: z.enum(["technical", "behavioural", "domain"]),
  priority: z.enum(["must", "nice"]),
});

const questionSchema = z.object({
  id: z.string().min(1),
  requirement_ids: z.array(z.string().min(1)).min(1),
  category: z.enum(["technical", "behavioural", "system-design", "company-fit"]),
  prompt: z.string().min(1),
  answer_outline: z.string(),
  difficulty: z.number().int().min(1).max(3),
});

const flashcardSchema = z.object({
  id: z.string().min(1),
  front: z.string().min(1),
  back: z.string().min(1),
  requirement_ids: z.array(z.string().min(1)),
});

const scheduleDaySchema = z.object({
  day: z.number().int().positive(),
  focus: z.string().min(1),
  question_ids: z.array(z.string().min(1)),
  minutes: z.number().int().nonnegative(),
});

/** The exact Appendix A shape, plus cross-reference validation. */
export const kitSchema = z
  .object({
    source: z.object({
      company: z.string(),
      company_url: z.string(),
      role: z.string(),
      location: z.string(),
      jd_chars: z.number().int().nonnegative(),
      researched_at: z.string(),
      pages_used: z.array(z.string()),
    }),
    company_brief: z.object({
      summary: z.string(),
      what_they_do: z.string(),
      sources: z.array(z.string()),
    }),
    role: z.object({
      title: z.string(),
      seniority: z.string(),
      responsibilities: z.array(z.string()),
      requirements: z.array(requirementSchema),
    }),
    questions: z.array(questionSchema),
    flashcards: z.array(flashcardSchema),
    schedule: z.object({
      days_available: z.number().int().positive(),
      days: z.array(scheduleDaySchema),
    }),
    coverage: z.object({
      uncovered_requirement_ids: z.array(z.string()),
      passes: z.number().int().positive(),
    }),
  })
  .superRefine((kit, context) => {
    const requirementIds = new Set(kit.role.requirements.map((item) => item.id));
    const questionIds = new Set(kit.questions.map((item) => item.id));

    assertUnique(kit.role.requirements.map((item) => item.id), "requirement", context);
    assertUnique(kit.questions.map((item) => item.id), "question", context);
    assertUnique(kit.flashcards.map((item) => item.id), "flashcard", context);

    for (const question of kit.questions) {
      for (const requirementId of question.requirement_ids) {
        if (!requirementIds.has(requirementId)) {
          context.addIssue({ code: "custom", message: `Question ${question.id} references unknown requirement ${requirementId}` });
        }
      }
    }

    for (const day of kit.schedule.days) {
      for (const questionId of day.question_ids) {
        if (!questionIds.has(questionId)) {
          context.addIssue({ code: "custom", message: `Schedule references unknown question ${questionId}` });
        }
      }
    }

    if (kit.schedule.days.length !== kit.schedule.days_available) {
      context.addIssue({ code: "custom", message: "Schedule days must equal days_available" });
    }

    const expectedDayNumbers = new Set(Array.from({ length: kit.schedule.days_available }, (_, index) => index + 1));
    for (const day of kit.schedule.days) {
      if (!expectedDayNumbers.has(day.day)) {
        context.addIssue({ code: "custom", message: `Unexpected schedule day ${day.day}` });
      }
    }
  });

function assertUnique(ids: string[], label: string, context: z.RefinementCtx) {
  if (new Set(ids).size !== ids.length) {
    context.addIssue({ code: "custom", message: `Every ${label} id must be unique` });
  }
}

export type Kit = z.infer<typeof kitSchema>;
export type Requirement = Kit["role"]["requirements"][number];
export type Question = Kit["questions"][number];

export function validateKit(input: unknown): Kit {
  return kitSchema.parse(input);
}
