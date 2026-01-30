import crypto from "crypto";
import { Router } from "express";

import {
  assertNoOverlap,
  buildBooking,
  validateBookingWindow,
} from "../domain/booking.js";
import {
  addBooking,
  listBookings,
  removeBooking,
} from "../repo/bookingsrepo.js";
import { AppError } from "../domain/booking.js";

const router = Router();

const generateId = () => {
  if (typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
};

router.post("/rooms/:roomId/bookings", (req, res, next) => {
  try {
    const { roomId } = req.params;
    const { start, end } = req.body ?? {};

    const { startMs, endMs } = validateBookingWindow(start, end);
    const existingBookings = listBookings(roomId);
    assertNoOverlap(existingBookings, startMs, endMs);

    const booking = buildBooking({
      id: generateId(),
      roomId,
      start,
      end,
      createdAt: new Date().toISOString(),
    });

    addBooking(roomId, booking);

    res.status(201).json({ data: booking });
  } catch (error) {
    next(error);
  }
});

router.get("/rooms/:roomId/bookings", (req, res, next) => {
  try {
    const { roomId } = req.params;
    const bookings = listBookings(roomId)
      .slice()
      .sort((a, b) => Date.parse(a.start) - Date.parse(b.start));

    res.status(200).json({ data: bookings });
  } catch (error) {
    next(error);
  }
});

router.delete("/rooms/:roomId/bookings/:bookingId", (req, res, next) => {
  try {
    const { roomId, bookingId } = req.params;
    const removed = removeBooking(roomId, bookingId);

    if (!removed) {
      throw new AppError({
        code: "BOOKING_NOT_FOUND",
        status: 404,
        message: "Booking not found",
        details: { bookingId },
      });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
