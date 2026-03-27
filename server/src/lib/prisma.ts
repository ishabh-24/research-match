// ============================================================
// lib/prisma.ts — Prisma Client Singleton
// ============================================================
// WHAT TO PUT HERE:
//   - A single PrismaClient instance reused across hot reloads in dev.
//   - import db from "@/lib/prisma" everywhere you need database access.
// HOW:
//   Use a global singleton pattern to avoid "too many connections" in dev.
// ============================================================

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

export const db =
    globalForPrisma.prisma ??
    new PrismaClient({
        log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
