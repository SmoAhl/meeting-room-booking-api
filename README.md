# Meeting Room Booking API

## About

Simple REST API for booking meeting rooms with in-memory storage.

## Functionality

- Create a booking
- List bookings for a room (sorted by start time)
- Delete a booking
- Health check

## Tech Stack

- Node.js (ESM)
- Express
- In-memory `Map` storage

## Endpoints

- `GET /health`
- `POST /rooms/:roomId/bookings`
- `GET /rooms/:roomId/bookings`
- `DELETE /rooms/:roomId/bookings/:bookingId`

## Environment Setup

1. Install Node.js (18+).
2. Install dependencies:
   - `npm install`
3. Start the server:
   - `npm run dev`
4. Health check:
   - `http://localhost:3000/health`

## Testing

- Run unit tests:
  - `npm test`
