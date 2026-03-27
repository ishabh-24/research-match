// ============================================================
// server/src/routes/studies.ts — Study Routes
// ============================================================
//
// ROUTES:
//   GET  /api/studies          → browse all published studies (with filters)
//   POST /api/studies          → create a study (RESEARCHER only)
//   GET  /api/studies/matches  → smart-matched studies for logged-in participant
//   GET  /api/studies/:id      → single study detail
//   PUT  /api/studies/:id      → edit a study (owner only)
//   DELETE /api/studies/:id    → delete a study (owner only)
// ============================================================

import { Router, Response } from "express";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { db } from "../lib/prisma";
import { requireAuth, requireRole, AuthenticatedRequest } from "../middleware/auth";
import { createStudySchema } from "../lib/validations";
import { getMatchingStudies, getMatchingParticipants } from "../lib/matching";
import { sendMatchAlert } from "../lib/email";

const router = Router();

// GET /api/studies — public browse with optional filters
router.get("/", async (req: AuthenticatedRequest, res: Response) => {
    const category = req.query.category as string | undefined;
    const format = req.query.format as string | undefined;
    const minComp = req.query.minComp ? Number(req.query.minComp) : undefined;

    const where: Prisma.StudyWhereInput = {
        status: "PUBLISHED",
    };

    if (category) where.category = category;
    if (format) where.format = format as import("@prisma/client").StudyFormat;
    if (minComp && !isNaN(minComp)) where.compensation = { gte: minComp };

    try {
        const studies = await db.study.findMany({
            where,
            include: {
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
        });
        return res.status(200).json(studies);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// GET /api/studies/matches — smart matching for logged-in participant
router.get("/matches", requireAuth, requireRole("PARTICIPANT"), async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user!.id;
        const matches = await getMatchingStudies(userId);
        return res.status(200).json(matches);
    } catch (error: any) {
        if (error.message === "Participant profile not found") {
            return res.status(404).json({ message: "Complete your profile before browsing matches." });
        }
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// GET /api/studies/:id — single study
router.get("/:id", async (req: AuthenticatedRequest, res: Response) => {
    const studyId = req.params.id;
    const study = await db.study.findUnique({
        where: { id: studyId },
        include: {
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
    });
    res.status(200).json(study);
});

// POST /api/studies — create a study
router.post("/", requireAuth, requireRole("RESEARCHER"), async (req: AuthenticatedRequest, res: Response) => {
    try {
        const validatedData = createStudySchema.parse(req.body);

        const researcherProfile = await db.researcherProfile.findUnique({
            where: { userId: req.user!.id }
        });

        if (!researcherProfile) {
            return res.status(403).json({ message: "Researcher profile required to create a study" });
        }

        const study = await db.study.create({
            data: {
                ...validatedData,
                researcherId: researcherProfile.id,
            }
        });

        if (study.status === "PUBLISHED") {
            try {
                const matchedParticipants = await getMatchingParticipants(study.id);
                for (const participant of matchedParticipants) {
                    if (participant.user.email) {
                        await sendMatchAlert(
                            participant.user.email,
                            study.title,
                            study.id
                        );
                    }
                }
            } catch (emailError) {
                console.error("Failed to notify matched participants:", emailError);
            }
        }

        return res.status(201).json(study);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: "Validation error", errors: error.errors });
        }
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// PUT /api/studies/:id — edit a study
router.put("/:id", requireAuth, requireRole("RESEARCHER"), async (req: AuthenticatedRequest, res: Response) => {
    try {
        const studyId = req.params.id;

        const researcherProfile = await db.researcherProfile.findUnique({
            where: { userId: req.user!.id }
        });

        if (!researcherProfile) {
            return res.status(403).json({ message: "Researcher profile required to edit a study" });
        }

        const study = await db.study.findUnique({
            where: { id: studyId }
        });

        if (!study) {
            return res.status(404).json({ message: "Study not found" });
        }

        if (study.researcherId !== researcherProfile.id) {
            return res.status(403).json({ message: "Unauthorized to edit this study" });
        }

        const validatedData = createStudySchema.parse(req.body);

        const updatedStudy = await db.study.update({
            where: { id: studyId },
            data: validatedData
        });

        if (study.status !== "PUBLISHED" && updatedStudy.status === "PUBLISHED") {
            try {
                const matchedParticipants = await getMatchingParticipants(updatedStudy.id);
                for (const participant of matchedParticipants) {
                    if (participant.user.email) {
                        await sendMatchAlert(
                            participant.user.email,
                            updatedStudy.title,
                            updatedStudy.id
                        );
                    }
                }
            } catch (emailError) {
                console.error("Failed to notify matched participants:", emailError);
            }
        }

        return res.status(200).json(updatedStudy);

    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: "Validation error", errors: error.errors });
        }
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// DELETE /api/studies/:id — delete a study
router.delete("/:id", requireAuth, requireRole("RESEARCHER"), async (req: AuthenticatedRequest, res: Response) => {
    try {
        const studyId = req.params.id;

        const researcherProfile = await db.researcherProfile.findUnique({
            where: { userId: req.user!.id }
        });

        if (!researcherProfile) {
            return res.status(403).json({ message: "Researcher profile required to delete a study" });
        }

        const study = await db.study.findUnique({
            where: { id: studyId }
        });

        if (!study) {
            return res.status(404).json({ message: "Study not found" });
        }

        if (study.researcherId !== researcherProfile.id) {
            return res.status(403).json({ message: "Unauthorized to delete this study" });
        }

        await db.study.delete({
            where: { id: studyId }
        });

        return res.status(200).json({ message: "Study deleted successfully" });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: "Validation error", errors: error.errors });
        }
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

export default router;
