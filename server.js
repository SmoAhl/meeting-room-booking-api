import express from "express";
import bookingsRouter from "./src/routes/bookings.js";

const app = express();

app.use(express.json());

const routes = express.Router();
routes.use(bookingsRouter);
app.use(routes);

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Centralized error handler (must be last)
app.use((err, req, res, next) => {
  const status = Number.isInteger(err?.status) ? err.status : 500;
  const code = err?.code ?? "INTERNAL_ERROR";
  const details = err?.details ?? {};
  const message =
    status >= 500 && code === "INTERNAL_ERROR"
      ? "Internal server error"
      : (err?.message ?? "Internal server error");

  res.status(status).json({
    status,
    message,
    error: {
      code,
      message,
      details,
    },
  });
});

export default app;
