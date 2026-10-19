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

### Step 1 - Foundation (complete)

**Decision:** Make the kit format, coverage checking, and scheduling independent of the user interface and LLM.

**Why:** The assignment explicitly requires coverage checking and day allocation to be deterministic code. Keeping them in `services/` makes the web app and required batch command use identical logic.

**Completed on the server:**

- Appendix A kit validation in `src/models/kit.ts`
- Must-have coverage check in `src/services/coverage.ts`
- Deterministic schedule allocation in `src/services/schedule.ts`
- Automated tests for all three areas

### Step 2 - Requirement extraction (next)

**Decision:** Add one `generation` service with a fake local implementation first, then connect it to a real LLM provider.

**Why:** It lets us test the end-to-end pipeline before an API key, rate limit, or provider outage can block development.

## Commands

```bash
npm install
npm test
npm run dev           # starts the client
npm run dev:server    # starts the Express API
```
