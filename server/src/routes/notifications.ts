// ============================================================
// server/src/routes/notifications.ts — Notification Routes
// ============================================================
// ROUTES:
//   GET   /api/notifications        → list notifications for logged-in user
//   PATCH /api/notifications/:id    → mark a notification as read
//   PATCH /api/notifications/read-all → mark all as read
// ============================================================

import { Router, Response } from "express";
import { requireAuth, AuthenticatedRequest } from "../middleware/auth";
import { db } from "../lib/prisma";

const router = Router();

router.use(requireAuth);

// GET /api/notifications
router.get("/", async (req: AuthenticatedRequest, res: Response) => {
    try {
        const notifications = await db.notification.findMany({
            where: { userId: req.user!.id },
            orderBy: { createdAt: "desc" }
        });
        return res.status(200).json(notifications);
    } catch (error) {
        console.error("Failed to fetch notifications:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// PATCH /api/notifications/:id — mark single as read
router.patch("/:id", async (req: AuthenticatedRequest, res: Response) => {
    try {
        const notificationId = req.params.id;

        // 1. get notifications & verify that they exist
        const notification = await db.notification.findUnique({
            where: { id: notificationId }
        });

        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }

        // 2. verify the user owns these notifs  
        if (notification.userId !== req.user!.id) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        // 3. mark single notif as read
        const updated = await db.notification.update({
            where: { id: notificationId },
            data: { read: true }
        });

        return res.status(200).json(updated);
    } catch (error) {
        console.error("Failed to update notification:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// PATCH /api/notifications/read-all — mark all as read
router.patch("/read-all", async (req: AuthenticatedRequest, res: Response) => {
    try {
        // update all unread notifications belonging to this user
        await db.notification.updateMany({
            where: {
                userId: req.user!.id,
                read: false
            },
            data: { read: true }
        });

        return res.status(200).json({ message: "All notifications marked as read" });
    } catch (error) {
        console.error("Failed to mark all as read:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

export default router;
