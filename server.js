import express from "express";
import bookingsRouter from "./src/routes/bookings.js";

const app = express();

app.use(express.json());

app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const durationMs = Date.now() - start;
    console.log(
      `${req.method} ${req.originalUrl} ${res.statusCode} ${durationMs}ms`,
    );
  });
  next();
});

const routes = express.Router();
routes.use(bookingsRouter);
app.use(routes);

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "Meeting Room API",
  });
});

app.use((err, req, res, next) => {
  const status = Number.isInteger(err?.status) ? err.status : 500;
  const code = err?.code ?? "INTERNAL_ERROR";
  const details = err?.details ?? {};
  const message =
    status >= 500 && code === "INTERNAL_ERROR"
      ? "Internal server error"
      : (err?.message ?? "Internal server error");

  res.status(status).json({
    error: {
      code,
      message,
      details,
    },
  });
});

export default app;
