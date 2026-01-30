export class AppError extends Error {
  constructor({ code, message, status = 500, details = {} }) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export const parseIsoToMs = (value, fieldName) => {
  if (typeof value !== "string") {
    throw new AppError({
      code: "VALIDATION_ERROR",
      status: 400,
      message: "Invalid booking time",
      details: { [fieldName]: "Must be an ISO-8601 string" },
    });
  }

  const ms = Date.parse(value);
  if (!Number.isFinite(ms)) {
    throw new AppError({
      code: "VALIDATION_ERROR",
      status: 400,
      message: "Invalid booking time",
      details: { [fieldName]: "Invalid ISO-8601 date" },
    });
  }

  return ms;
};

export const validateBookingWindow = (start, end, nowMs = Date.now()) => {
  const startMs = parseIsoToMs(start, "start");
  const endMs = parseIsoToMs(end, "end");

  if (startMs >= endMs) {
    throw new AppError({
      code: "VALIDATION_ERROR",
      status: 400,
      message: "Start time must be before end time",
      details: { start, end },
    });
  }

  if (startMs < nowMs) {
    throw new AppError({
      code: "VALIDATION_ERROR",
      status: 400,
      message: "Start time cannot be in the past",
      details: { start },
    });
  }

  return { startMs, endMs };
};

export const assertNoOverlap = (existingBookings, newStartMs, newEndMs) => {
  for (const booking of existingBookings) {
    const existingStartMs = Date.parse(booking.start);
    const existingEndMs = Date.parse(booking.end);

    if (
      Number.isFinite(existingStartMs) &&
      Number.isFinite(existingEndMs) &&
      newStartMs < existingEndMs &&
      existingStartMs < newEndMs
    ) {
      throw new AppError({
        code: "BOOKING_OVERLAP",
        status: 409,
        message: "Booking overlaps with an existing booking",
        details: { bookingId: booking.id },
      });
    }
  }
};

export const buildBooking = ({ id, roomId, start, end, createdAt }) => ({
  id,
  roomId,
  start,
  end,
  createdAt,
});
