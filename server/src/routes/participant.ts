// ============================================================
// server/src/routes/participant.ts — Participant Routes
// ============================================================
// ROUTES:
//   GET /api/participant/profile  → get logged-in participant's profile
//   PUT /api/participant/profile  → update profile
//   GET /api/participant/applications → list all applications for this participant
// ============================================================

import { Router, Response } from "express";
import { AuthenticatedRequest, requireAuth, requireRole } from "../middleware/auth";
import { db } from "../lib/prisma";
import { User } from "@prisma/client";


const router = Router();

// All participant routes require auth + PARTICIPANT role
router.use(requireAuth, requireRole("PARTICIPANT"));

// GET /api/participant/profile
router.get("/profile", async (req: AuthenticatedRequest, res: Response) => {
    try {
        const participant = await db.participantProfile.findUnique({
            where: {
                userId: req.user!.id
            }
        })

        if (!participant) {
            return res.status(404).json({ message: "Participant not found" })
        }
        return res.status(200).json(participant)
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Internal server error" })
    }
});

// PUT /api/participant/profile
router.put("/profile", async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { interests, maxTimeCommitment, desiredCompMin, remoteOk } = req.body;
        if (!Array.isArray(interests) || typeof maxTimeCommitment !== "number" || typeof desiredCompMin !== "number" || typeof remoteOk !== "boolean") {
            return res.status(400).json({ message: "Invalid profile payload" })
        }

        const updatedProfile = await db.participantProfile.upsert({
            where: { userId: req.user!.id },
            update: {
                interests,
                maxTimeCommitment,
                desiredCompMin,
                remoteOk
            },
            create: {
                userId: req.user!.id,
                interests,
                maxTimeCommitment,
                desiredCompMin,
                remoteOk
            }
        })
        return res.status(200).json(updatedProfile)
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Internal server error" })
    }
});

// GET /api/participant/applications
router.get("/applications", async (req: AuthenticatedRequest, res: Response) => {
    try {
        const applications = await db.application.findMany({
            where: { userId: req.user!.id },
            include: {
                study: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        compensation: true,
                        researcher: {
                            select: {
                                user: {
                                    select: {
                                        name: true,
                                        email: true,
                                    }
                                }
                            }
                        }
                    }
                }
            }
        })
        return res.status(200).json(applications)
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Internal server error" })
    }
});

export default router;
