// ============================================================
// server/src/middleware/auth.ts — JWT Auth Middleware
// ============================================================
//   Reads the Authorization header: "Bearer <token>"
//   Verifies the JWT using JWT_SECRET from env
//   Attaches the decoded user payload to req.user
//   If invalid/missing → responds 401 Unauthorized
//
// USAGE:
//   import { requireAuth } from "@/middleware/auth"
//   router.get("/protected-route", requireAuth, handler)
//
//   For role-based guards:
//   router.post("/studies", requireAuth, requireRole("RESEARCHER"), handler)
// ============================================================

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// extend express request to carry the authenticated user
export interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        email: string;
        role: "PARTICIPANT" | "RESEARCHER" | "ADMIN";
    };
}

export function requireAuth(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer")) {
        return res.status(401).json({ error: "Unauthorized" })
    }
    const token = authHeader.split(" ")[1];
    try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET!)
        req.user = decodedToken as any;
    } catch (error) {
        return res.status(401).json({ error: "Unauthorized" })
    }
    next();
}

export function requireRole(role: "PARTICIPANT" | "RESEARCHER" | "ADMIN") {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" })
        }
        if (req.user.role != role) {
            return res.status(403).json({ error: "Forbidden" })
        }
        else {
            next();
        }
    };
}
