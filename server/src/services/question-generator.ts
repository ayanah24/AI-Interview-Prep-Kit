import type { Question, Requirement } from "../models/kit";

export type QuestionCategory = Question["category"];

export interface QuestionGenerator {
  generate(requirement: Requirement, category: QuestionCategory): Promise<Question>;
}

/**
 * A predictable baseline generator. It creates one question per requirement
 * and always records the requirement id it covers. An LLM implementation can
 * later implement the same interface for richer, varied questions.
 */
export class LocalQuestionGenerator implements QuestionGenerator {
  async generate(requirement: Requirement, category: QuestionCategory): Promise<Question> {
    const template = templates[category];

    return {
      id: `q-${requirement.id}-${category}`,
      requirement_ids: [requirement.id],
      category,
      prompt: template.prompt(requirement.text),
      answer_outline: template.answerOutline(requirement.text),
      difficulty: difficultyFor(requirement, category),
    };
  }

  async generateForRequirements(requirements: Requirement[]): Promise<Question[]> {
    return Promise.all(requirements.map((requirement) => this.generate(requirement, categoryFor(requirement))));
  }
}

const templates: Record<QuestionCategory, { prompt: (requirement: string) => string; answerOutline: (requirement: string) => string }> = {
  technical: {
    prompt: (requirement) => `Tell me about a production problem where you used ${requirement}. What approach did you take, and what trade-offs did you make?`,
    answerOutline: (requirement) => `Explain the context, your specific use of ${requirement}, the technical decisions, how you tested the result, and the outcome.`,
  },
  behavioural: {
    prompt: (requirement) => `Tell me about a time you demonstrated this requirement: ${requirement}. What was your role and what was the result?`,
    answerOutline: (requirement) => `Use STAR: situation, task, actions demonstrating ${requirement}, and a measurable result or lesson.`,
  },
  "system-design": {
    prompt: (requirement) => `How would you design a system that needs ${requirement}? Describe the main components, trade-offs, and how you would validate the design.`,
    answerOutline: (requirement) => `Clarify the goal, outline components relevant to ${requirement}, discuss scale and failure trade-offs, then explain validation and monitoring.`,
  },
  "company-fit": {
    prompt: (requirement) => `How would your experience with ${requirement} help you contribute to this company's customers and business?`,
    answerOutline: (requirement) => `Connect ${requirement} to the company's domain, give a concrete example, and explain the value you would aim to create.`,
  },
};

function categoryFor(requirement: Requirement): QuestionCategory {
  if (requirement.kind === "behavioural") return "behavioural";
  if (requirement.kind === "domain") return "company-fit";
  if (/\b(system|architecture|distributed|scalab|design|api)\b/i.test(requirement.text)) return "system-design";
  return "technical";
}

function difficultyFor(requirement: Requirement, category: QuestionCategory): Question["difficulty"] {
  if (category === "system-design" || /(?:\b5\+|\b(?:lead|architect|principal|senior)\b)/i.test(requirement.text)) return 3;
  return requirement.priority === "must" ? 2 : 1;
}
