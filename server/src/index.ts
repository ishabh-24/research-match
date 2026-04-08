// ============================================================
// server/src/index.ts — Express App Entry Point
// ============================================================
// This is the main entry point for the ResearchMatch API server.
//
// SETUP:
//   - cors: allows the React client (localhost:5173) to call this API
//   - helmet: sets secure HTTP headers
//   - express.json(): parses incoming JSON request bodies
//
// ROUTES:
//   /api/auth          → register, login
//   /api/studies       → CRUD for studies + smart matching
//   /api/participant   → participant profile
//   /api/researcher    → researcher profile + application management
//   /api/notifications → in-app notifications
//
// USAGE:
//   npm run dev  → starts with nodemon (auto-restarts on file changes)
//   Server runs on PORT env var, defaults to 4000
// ============================================================

import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";

// Route imports
import authRouter from "./routes/auth";
import studiesRouter from "./routes/studies";
import participantRouter from "./routes/participant";
import researcherRouter from "./routes/researcher";
import notificationsRouter from "./routes/notifications";
import applicationsRouter from "./routes/applications";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// ── Middleware ──────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json());

// Minimal request logging (useful on Render when debugging 500s)
app.use((req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    res.on("finish", () => {
        const ms = Date.now() - start;
        console.log(`[http] ${req.method} ${req.path} -> ${res.statusCode} (${ms}ms)`);
    });
    next();
});

// ── Health Check ────────────────────────────────────────────
app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
});

// ── API Routes ──────────────────────────────────────────────
app.use("/api/auth", authRouter);
app.use("/api/studies", studiesRouter);
app.use("/api/participant", participantRouter);
app.use("/api/researcher", researcherRouter);
app.use("/api/notifications", notificationsRouter);
app.use("/api/applications", applicationsRouter);

// Error handler (ensures exceptions show up in logs)
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    console.error("[unhandled]", err);
    res.status(500).json({ message: "Internal server error" });
});

// ── Start ───────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});

export default app;
