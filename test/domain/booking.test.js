import test from "node:test";
import assert from "node:assert/strict";

import {
  assertNoOverlap,
  validateBookingWindow,
  AppError,
} from "../../src/domain/booking.js";

const baseNow = Date.parse("2026-01-30T12:00:00.000Z");

const booking = (start, end, id = "b1") => ({
  id,
  roomId: "r1",
  start,
  end,
  createdAt: "2026-01-30T11:00:00.000Z",
});

test("adjacency allowed when end equals next start", () => {
  const existing = [
    booking("2026-01-31T09:00:00.000Z", "2026-01-31T10:00:00.000Z"),
  ];
  const { startMs, endMs } = validateBookingWindow(
    "2026-01-31T10:00:00.000Z",
    "2026-01-31T11:00:00.000Z",
    baseNow,
  );

  assert.doesNotThrow(() => assertNoOverlap(existing, startMs, endMs));
});

test("partial overlap is rejected", () => {
  const existing = [
    booking("2026-01-31T09:00:00.000Z", "2026-01-31T10:00:00.000Z"),
  ];
  const { startMs, endMs } = validateBookingWindow(
    "2026-01-31T09:30:00.000Z",
    "2026-01-31T10:30:00.000Z",
    baseNow,
  );

  assert.throws(
    () => assertNoOverlap(existing, startMs, endMs),
    (error) => {
      assert.ok(error instanceof AppError);
      assert.equal(error.code, "BOOKING_OVERLAP");
      assert.equal(error.status, 409);
      return true;
    },
  );
});

test("fully contained overlap is rejected", () => {
  const existing = [
    booking("2026-01-31T09:00:00.000Z", "2026-01-31T11:00:00.000Z"),
  ];
  const { startMs, endMs } = validateBookingWindow(
    "2026-01-31T09:30:00.000Z",
    "2026-01-31T10:30:00.000Z",
    baseNow,
  );

  assert.throws(
    () => assertNoOverlap(existing, startMs, endMs),
    (error) => {
      assert.ok(error instanceof AppError);
      assert.equal(error.code, "BOOKING_OVERLAP");
      assert.equal(error.status, 409);
      return true;
    },
  );
});

test("non-overlapping bookings are allowed", () => {
  const existing = [
    booking("2026-01-31T09:00:00.000Z", "2026-01-31T10:00:00.000Z"),
  ];
  const { startMs, endMs } = validateBookingWindow(
    "2026-01-31T10:30:00.000Z",
    "2026-01-31T11:00:00.000Z",
    baseNow,
  );

  assert.doesNotThrow(() => assertNoOverlap(existing, startMs, endMs));
});

test("start time must be before end time", () => {
  assert.throws(
    () =>
      validateBookingWindow(
        "2026-01-31T10:00:00.000Z",
        "2026-01-31T10:00:00.000Z",
        baseNow,
      ),
    (error) => {
      assert.ok(error instanceof AppError);
      assert.equal(error.code, "VALIDATION_ERROR");
      assert.equal(error.status, 400);
      return true;
    },
  );
});

test("start time cannot be in the past", () => {
  assert.throws(
    () =>
      validateBookingWindow(
        "2026-01-30T11:59:59.000Z",
        "2026-01-30T12:30:00.000Z",
        baseNow,
      ),
    (error) => {
      assert.ok(error instanceof AppError);
      assert.equal(error.code, "VALIDATION_ERROR");
      assert.equal(error.status, 400);
      return true;
    },
  );
});
