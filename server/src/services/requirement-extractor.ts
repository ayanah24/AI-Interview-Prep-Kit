import type { Requirement } from "../models/kit";

export type ExtractedRole = {
  title: string;
  seniority: string;
  location: string;
  responsibilities: string[];
  requirements: Requirement[];
  warnings: string[];
};

export interface RequirementExtractor {
  extract(jobDescription: string): Promise<ExtractedRole>;
}

type Section = "other" | "responsibilities" | "must" | "nice";

/**
 * A conservative local fallback. It only returns lines supplied in the job
 * description, so a thin or unusual posting produces a thin, honest result.
 */
export class LocalRequirementExtractor implements RequirementExtractor {
  async extract(jobDescription: string): Promise<ExtractedRole> {
    const lines = jobDescription
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
    const title = findTitle(lines);
    const location = findLocation(lines);
    const seniority = findSeniority(title);
    const responsibilities: string[] = [];
    const requirements: Requirement[] = [];
    let section: Section = "other";

    for (const line of lines) {
      const heading = sectionForHeading(line);
      if (heading) {
        section = heading;
        continue;
      }

      const item = cleanListItem(line);
      if (!item || isMetadataLine(item)) continue;

      if (section === "responsibilities") {
        responsibilities.push(item);
        continue;
      }

      const priority = section === "nice" || hasNiceToHaveSignal(item) ? "nice" : "must";
      if (section === "must" || section === "nice" || isRequirementLike(item)) {
        requirements.push({
          id: `r${requirements.length + 1}`,
          text: item,
          kind: classifyRequirement(item),
          priority,
        });
      }
    }

    const warnings: string[] = [];
    if (jobDescription.trim().length < 80) warnings.push("The job description is very short; extracted detail may be limited.");
    if (requirements.length === 0) warnings.push("No explicit requirements were found in the job description.");

    return { title, seniority, location, responsibilities: unique(responsibilities), requirements: uniqueRequirements(requirements), warnings };
  }
}

function findTitle(lines: string[]): string {
  const title = lines.find((line) => !sectionForHeading(line) && !isMetadataLine(line) && line.length <= 120);
  return title ? cleanListItem(title) : "";
}

function findLocation(lines: string[]): string {
  const locationLine = lines.find((line) => /^location\s*:/i.test(line) || /\bremote\b/i.test(line));
  if (!locationLine) return "";
  return locationLine.replace(/^location\s*:\s*/i, "").trim();
}

function findSeniority(title: string): string {
  const match = title.match(/\b(intern|junior|mid(?:-level)?|senior|staff|principal|lead|manager|director)\b/i);
  return match ? match[1] : "";
}

function sectionForHeading(line: string): Section | null {
  const normalized = line.toLowerCase().replace(/[:*]/g, "").trim();
  if (/^(responsibilities|what you('ll| will) do|your impact|the role)$/.test(normalized)) return "responsibilities";
  if (/^(requirements|qualifications|what you bring|must have|required skills|minimum qualifications)$/.test(normalized)) return "must";
  if (/^(nice to have|preferred qualifications|bonus|bonus points|preferred skills)$/.test(normalized)) return "nice";
  return null;
}

function cleanListItem(line: string): string {
  return line.replace(/^(?:[-*•]|\d+[.)])\s*/, "").trim();
}

function isMetadataLine(line: string): boolean {
  return /^(location|salary|employment type|department)\s*:/i.test(line);
}

function hasNiceToHaveSignal(line: string): boolean {
  return /\b(nice to have|bonus|preferred|plus)\b/i.test(line);
}

function isRequirementLike(line: string): boolean {
  return /\b(required|experience|proficient|knowledge|ability|skills?|years?|degree|familiarity|understanding)\b/i.test(line);
}

function classifyRequirement(text: string): Requirement["kind"] {
  if (/\b(mentor|mentoring|communication|leadership|collaborat|stakeholder|teamwork|manage)\b/i.test(text)) return "behavioural";
  if (/\b(fintech|finance|payments|healthcare|e-?commerce|education|logistics|insurance)\b/i.test(text)) return "domain";
  return "technical";
}

function unique(values: string[]): string[] {
  return [...new Set(values)];
}

function uniqueRequirements(requirements: Requirement[]): Requirement[] {
  const seen = new Set<string>();
  return requirements.filter((requirement) => {
    const key = requirement.text.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
