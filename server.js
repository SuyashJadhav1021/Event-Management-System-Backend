const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");

dotenv.config();

connectDB();

const app = express();

// Middleware
const allowedOrigins = [
  "http://localhost:3000",
  "https://event-management-system-frontend-hz.vercel.app",
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// IMPORTANT: handle preflight
app.options("*", cors());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/events", require("./routes/eventRoutes"));
app.use("/api/users", require("./routes/userRoutes"));

// Health check
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "Server is running 🚀" });
});

// 404 handler for unknown routes
app.use((req, res) => {
  res
    .status(404)
    .json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ── Central Error Handler (must be last) ─────────────────────────────────────
app.use(errorHandler);
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(` Server running on port ${PORT}`);
  });
}

module.exports = app;
