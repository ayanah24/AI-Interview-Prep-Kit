# Project Decisions

This file records the decisions made while building the assessment. Each new milestone adds its decision, reason, and consequence.

## Step 1 - Client-server foundation

**Decision:** Use a lightweight client-server MVC layout.

**Reason:** The Next.js client can focus on the interview-prep experience, while the Express server owns validation, generation, research, and persistence. The required batch evaluator can then use the same server services as the web application.

**Result:**

- `client/` contains the Next.js frontend.
- `server/src/models/` contains data shapes and validation.
- `server/src/services/` contains business rules.
- `server/src/controllers/` is reserved for Express API handlers.

## Step 2 - Requirement extraction

**Decision:** Start with a deterministic local extractor behind an async `RequirementExtractor` interface, then add an LLM-backed implementation later.

**Reason:** The assignment penalises invented requirements and tests thin job descriptions. A local extractor provides a reliable fallback, is easy to test, and keeps the later LLM integration replaceable.

**Result:**

- The extractor only returns text present in the job description.
- It identifies role title, seniority, location, responsibilities, requirements, priority, and category.
- It reports warnings for thin descriptions instead of fabricating information.
- Stable requirement IDs are assigned in source order.
