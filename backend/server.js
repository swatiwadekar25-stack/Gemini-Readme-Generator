import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";

import connectDB from "./config/db.js";
import historyRoutes from "./routes/historyRoutes.js";
import readmeRoutes from "./routes/readmeRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();
const PORT = process.env.PORT || 5000;
const frontendPath = path.join(__dirname, "../frontend");
const allowedOrigins = new Set([
  "https://gemini-readme-generator-frontend.vercel.app"
]);

app.use(express.json({ limit: "20kb" }));

app.use(cors({
  origin(origin, callback) {
    const isLocalhost =
      origin && /^http:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?$/.test(origin);

    callback(null, !origin || allowedOrigins.has(origin) || isLocalhost);
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// API health check.
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "README Generator API is running."
  });
});

app.use("/api/readme/history", historyRoutes);
app.use("/api/readme", readmeRoutes);

// Serve HTML, CSS and JavaScript.
app.use(express.static(frontendPath));

// Handle unknown API routes.
app.use("/api", (req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found."
  });
});


/* Central error handler */
app.use((err, req, res, next) => {
    console.error("Server error:", err);

    if (res.headersSent) {
        return next(err);
    }

    if (err.status === 400 && err.type === "entity.parse.failed") {
        return res.status(400).json({
            success: false,
            message: "Invalid JSON request body."
        });
    }

    res.status(err.status || 500).json({
        success: false,
        message:
            process.env.NODE_ENV === "production"
                ? "Unable to generate README. Please try again."
                : err.message || "An unexpected server error occurred."
    });
});

await connectDB();

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});