const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");

dotenv.config();
const app = express();

// connectDB();

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(500).json({ message: "DB connection failed" });
  }
});

// Middleware
const allowedOrigins = [
  "http://localhost:3000",
  "https://event-management-system-frontend-hzla-bh943c3n1.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  }),
);

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
