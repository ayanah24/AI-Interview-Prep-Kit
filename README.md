# AI Interview Prep Kit

An application that turns a job description, company URL, and interview deadline into an editable interview-preparation kit.

## Client-server MVC layout

```text
client/
  src/app/      Next.js pages and reusable UI components (View)
server/
  src/controllers/  Express API request handlers (Controller)
  src/models/       Data shapes and validation rules (Model)
  src/services/     Business rules, AI generation, research, and persistence
    __tests__/      Tests for service behaviour
```

## Build roadmap and decisions

Detailed decisions are recorded in [DECISIONS.md](./DECISIONS.md).

### Step 1 - Foundation (complete)

**Decision:** Make the kit format, coverage checking, and scheduling independent of the user interface and LLM.

**Why:** The assignment explicitly requires coverage checking and day allocation to be deterministic code. Keeping them in `services/` makes the web app and required batch command use identical logic.

**Completed on the server:**

- Appendix A kit validation in `src/models/kit.ts`
- Must-have coverage check in `src/services/coverage.ts`
- Deterministic schedule allocation in `src/services/schedule.ts`
- Automated tests for all three areas

### Step 2 - Requirement extraction (complete)

**Decision:** Start with a deterministic local extractor behind an async interface, then add an LLM-backed implementation.

**Why:** It avoids invented requirements, handles thin job descriptions honestly, and lets us test the pipeline before an API key, rate limit, or provider outage can block development.

**Completed:**

- Extract role title, seniority, location, responsibilities, requirements, priority, and kind.
- Keep requirement IDs stable in source order.
- Add automated tests for normal and thin job descriptions.

### Step 3 - Category-specific question generation (complete)

**Decision:** Generate stable, category-specific baseline questions locally before adding an LLM-backed generator.

**Why:** Each question must identify the requirement it covers. This makes coverage a code-based decision and prevents an LLM response from breaking the kit's required references.

**Completed:**

- Generate technical, behavioural, company-fit, and system-design questions.
- Link every question to its exact source requirement ID.
- Calculate deterministic question difficulty and add automated tests.

## Commands

```bash
npm install
npm test
npm run dev           # starts the client
npm run dev:server    # starts the Express API
```
