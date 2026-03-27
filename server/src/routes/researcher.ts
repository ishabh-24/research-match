// ============================================================
// server/src/routes/researcher.ts — Researcher Routes
// ============================================================
// Replaces: app/api/researcher/* + app/api/studies/[id]/apply PATCH
//
// ROUTES:
//   GET   /api/researcher/profile        → get researcher's profile
//   PUT   /api/researcher/profile        → update profile
//   GET   /api/researcher/studies        → list researcher's own studies
//   GET   /api/researcher/applications   → all applicants across researcher's studies
//   PATCH /api/researcher/applications/:id → accept or reject an application
// ============================================================

import { Router, Response } from "express";
import { AuthenticatedRequest, requireAuth, requireRole } from "../middleware/auth";
import { db } from "../lib/prisma";
import { User } from "@prisma/client";
import { sendApplicationStatusEmail } from "../lib/email";

const router = Router();

// all researcher routes require auth + RESEARCHER role
router.use(requireAuth, requireRole("RESEARCHER"));

// GET /api/researcher/profile
router.get("/profile", async (req: AuthenticatedRequest, res: Response) => {
    try {
        const researcher = await db.researcherProfile.findUnique({
            where: { userId: req.user!.id }
        });

        if (!researcher) {
            return res.status(404).json({ message: "Researcher not found" });
        }
        return res.status(200).json({ message: "Researcher profile fetched successfully" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// PUT /api/researcher/profile
router.put("/profile", async (req: AuthenticatedRequest, res: Response) => {
    try {
        const researcher = await db.researcherProfile.findUnique({
            where: { userId: req.user!.id }
        });

        if (!researcher) {
            return res.status(404).json({ message: "Researcher not found" });
        }

        const updatedProfile = await db.researcherProfile.upsert({
            where: { userId: req.user!.id },
            update: {
                institution: req.body.institution,
                department: req.body.department,
                title: req.body.title,
                website: req.body.website,
                bio: req.body.bio,
            },
            create: {
                userId: req.user!.id,
                institution: req.body.institution,
                department: req.body.department,
                title: req.body.title,
                website: req.body.website,
                bio: req.body.bio,
                verified: false,
            }
        });
        return res.status(200).json({ message: "Researcher profile updated successfully" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// GET /api/researcher/studies
router.get("/studies", async (req: AuthenticatedRequest, res: Response) => {
    try {
        const studies = await db.study.findMany({
            where: {
                researcher: {
                    userId: req.user!.id
                }
            }
        });
        return res.status(200).json(studies);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// GET /api/researcher/applications
router.get("/applications", async (req: AuthenticatedRequest, res: Response) => {
    try {
        const applications = await db.application.findMany({
            where: {
                study: {
                    researcher: {
                        userId: req.user!.id
                    }
                }
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        participantProfile: true
                    }
                },
                study: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        compensation: true
                    }
                }
            }
        });
        return res.status(200).json(applications);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// PATCH /api/researcher/applications/:id — accept or reject
router.patch("/applications/:id", async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { status } = req.body;
        if (status !== "ACCEPTED" && status !== "REJECTED") {
            return res.status(400).json({ message: "Invalid status" });
        }

        const application = await db.application.findUnique({
            where: { id: req.params.id },
            include: { study: { include: { researcher: true } } }
        });

        if (!application) {
            return res.status(404).json({ message: "Application not found" });
        }

        if (application.study.researcher.userId !== req.user!.id) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        const updatedApplication = await db.application.update({
            where: { id: req.params.id },
            data: { status },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                    }
                },
                study: {
                    select: {
                        title: true,
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
        });

        try {
            await sendApplicationStatusEmail(
                updatedApplication.user.email,
                status as "ACCEPTED" | "REJECTED",
                updatedApplication.study.title
            );
        } catch (error) {
            console.log(error);
        }
        return res.status(200).json(updatedApplication);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

export default router;
