# copilot-instructions.md

You are a VS Code Copilot coding agent working in this repository.

## Goal

Implement a simple meeting-room booking REST API using:

- Node.js (ESM)
- Express
- In-memory persistence using `Map()`

Focus on correctness, clear separation of concerns, and small, reviewable changes.

---

## Architecture (must follow)

Repository structure:

- **/index.js**
  - Only starts the server: `app.listen(PORT)`
- **/server.js**
  - Builds and exports the Express app
  - Must include:
    - `GET /health`
    - `app.use(express.json())`
    - `app.use(routes)`
    - centralized error middleware (last)
- **/src/domain/**
  - Business logic + validations
  - No Express imports here
  - Throws domain errors (see Error Handling)
- **/src/repo/**
  - In-memory DB using `Map()`
  - No Express imports here
- **/src/routes/**
  - HTTP layer (Express routers/controllers)
  - Translates HTTP request/response ↔ domain calls
  - No persistence logic (calls repo/domain only)

Keep modules small and single-purpose.

---

## API Endpoints (required)

- `POST /rooms/:roomId/bookings`
- `GET /rooms/:roomId/bookings`
- `DELETE /rooms/:roomId/bookings/:bookingId`

### Suggested request/response conventions

- `POST` request body: `{ "start": "<ISO-8601>", "end": "<ISO-8601>" }`
- `POST` success: `201` with `{ "data": <Booking> }`
- `GET` success: `200` with `{ "data": <Booking[]> }` (sorted ascending by `start`)
- `DELETE` success: `204` (no body)

If you change these conventions, do so consistently across the API and update code accordingly.

---

## Data Model (in-memory)

`Booking` object (store exactly these fields):

- `id: string`
- `roomId: string`
- `start: string` (ISO-8601)
- `end: string` (ISO-8601)
- `createdAt: string` (ISO-8601)

### In-memory DB requirements

- Use `Map()` for storage.
- Prefer a structure that makes per-room lookups efficient, e.g.:
  - `Map<roomId, Map<bookingId, Booking>>`
  - or `Map<roomId, Booking[]>` (ensure overlap checks remain correct)
- IDs: prefer `crypto.randomUUID()` (Node 18+). If unavailable, implement a small safe fallback.

---

## Non-negotiable Booking Rules

### Time semantics

- Time ranges are **half-open**: `[start, end)`
  - Adjacent bookings are allowed: `end == nextStart` is valid.

### Validation rules

- `start < end` (strictly)
- `start` must **not** be in the past (compare against “now” at request handling time)
- Overlap rule (must use this exact logic):
  - overlap if: `newStart < existingEnd && existingStart < newEnd`

### Date handling

- Input `start/end` must be valid ISO-8601 strings.
- Convert to milliseconds for comparisons (e.g. `Date.parse(iso)`).
- Reject invalid dates (`Number.isFinite(ms)` must be true).

---

## Centralized Error Handling (required)

All errors must be unified into this response shape:

```json
{
  "error": {
    "code": "SOME_CODE",
    "message": "Human readable message",
    "details": {}
  }
}
```

## Rules

### Centralized error handling (required)

- Centralize error handling in a single Express error middleware in `/server.js`.
- Domain layer throws typed domain errors (e.g. `AppError`) without Express knowledge.
- Routes must not duplicate formatting logic; they may only:
  - validate presence of route params/body shape (basic)
  - call domain services
  - let errors bubble to the error middleware

### Status mapping guidelines

Use consistent HTTP statuses:

- `400` for malformed input (missing fields, invalid ISO, `start >= end`)
- `409` for overlaps (conflict)
- `404` for not found (e.g. deleting unknown booking)
- `500` for unexpected errors

### Recommended error codes

Use stable machine-readable codes:

- `VALIDATION_ERROR`
- `BOOKING_OVERLAP`
- `BOOKING_NOT_FOUND`
- `INTERNAL_ERROR`

Do not leak stack traces to clients. `details` may include field-level info for validation errors.

---

## Implementation Workflow (must follow)

### Prefer small, reviewable diffs

Do not implement everything in one step.

When proposing code changes, always include:

1. Files you will change
2. Short plan
3. Edge cases considered
4. How to test the change

Stop after each milestone and do not proceed to the next milestone automatically.

### Suggested milestones

1. Skeleton server + routing + health endpoint + error middleware
2. Repo layer + domain validations + POST booking
3. GET bookings (sorted)
4. DELETE booking
5. Refinements: consistent error codes, edge case coverage, minimal tests

---

## Testing Expectations

Provide a practical way to test:

- `curl` examples for each endpoint, or
- a minimal Node test script (optional)

Include test notes in your change summary.

---

## Code Style & Practices

- ESM only (`import`/`export`), no `require`.
- Keep functions small and readable.
- Avoid clever abstractions.
- Prefer pure functions in `domain/`.
- No side effects in `domain/` (other than throwing errors).
- Validate inputs early and fail fast.
- Keep logs minimal and useful (avoid noisy logging).

---

## Safety / Consistency Checks (always consider)

- Adjacent bookings: allow `end == nextStart`.
- Same millisecond times: reject if `start == end`.
- Timezone correctness: ISO parsing must behave consistently (use `Date.parse`).
- Deleting a booking must not affect other rooms.
- GET must not mutate stored bookings.
