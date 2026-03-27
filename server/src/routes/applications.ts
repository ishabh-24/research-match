// ============================================================
// server/src/routes/applications.ts — Application Routes
// ============================================================
// ROUTES:
//   POST   /api/applications/:studyId  → apply to a study (PARTICIPANT only)
//   DELETE /api/applications/:studyId  → withdraw application
// ============================================================

import { Router, Response } from "express";
import { requireAuth, requireRole, AuthenticatedRequest } from "../middleware/auth";
import { db } from "../lib/prisma";
import { z } from "zod";
import { ApplicationStatus } from "@prisma/client";
import { sendNewApplicationEmail } from "../lib/email";

const router = Router();

// POST /api/applications/:studyId — apply to a study
router.post("/:studyId", requireAuth, requireRole("PARTICIPANT"), async (req: AuthenticatedRequest, res: Response) => {

    try {
        const studyId = req.params.studyId;
        const userId = req.user!.id;

        const study = await db.study.findUnique({
            where: { id: studyId },
            include: {
                researcher: {
                    include: {
                        user: true
                    }
                }
            }
        });

        const participantUser = await db.user.findUnique({
            where: { id: userId }
        });

        if (!study) {
            return res.status(404).json({ message: "Study not found." })
        }

        if (study.status !== "PUBLISHED") {
            return res.status(404).json({ message: "Study is not published." })
        }

        const existingApplication = await db.application.findUnique({
            where: {
                userId_studyId: {
                    userId: userId,
                    studyId: studyId
                }
            }
        });

        if (existingApplication) {
            return res.status(404).json({ message: "You have already applied to this study." })
        }

        const application = await db.application.create({
            data: {
                userId: userId,
                studyId: studyId,
                status: ApplicationStatus.PENDING,
            }
        });
        
        if (study.researcher.user.email && participantUser) {
            try {
                await sendNewApplicationEmail(
                    study.researcher.user.email,
                    participantUser.name ?? "A participant",
                    study.title
                );
            } catch (emailError) {
                console.error("Failed to send new application email:", emailError);
            }
        }
        
        return res.status(201).json(application);

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// DELETE /api/applications/:studyId — withdraw application
router.delete("/:studyId", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const studyId = req.params.studyId;
        const userId = req.user!.id;

        const application = await db.application.findUnique({
            where: {
                userId_studyId: {
                    userId: userId,
                    studyId: studyId
                }
            }
        });

        if (!application) {
            return res.status(404).json({ message: "Application not found." })
        }

        if (application.userId != userId) {
            return res.status(403).json({ message: "Unauthorized to withdraw this application." })
        }

        await db.application.delete({
            where: {
                id: application.id
            }
        });

        return res.status(200).json({ message: "Application withdrawn successfully." })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" })
    }

});

export default router;
