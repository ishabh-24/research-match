// ============================================================
// server/src/routes/auth.ts — Authentication Routes
// ============================================================

import { Router } from "express";
import { JsonWebTokenError } from "jsonwebtoken";
import { Prisma } from "@prisma/client";
import { db } from "../lib/prisma";
import { User } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendWelcomeEmail } from "../lib/email";

const router = Router();

// POST /api/auth/register
router.post("/register", async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        if (!name || !email || !password || !role) {
            return res.status(400).json({ message: "All fields are required" })
        }
        const existingUser = await db.user.findUnique({ where: { email } })
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" })
        }
        const hashedPassword = await bcrypt.hash(password, 10)
        const user = await db.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role,
            }
        })
        if (role == "PARTICIPANT") {
            await db.participantProfile.create({
                data: {
                    userId: user.id,
                    interests: [],
                    desiredCompMin: 0,
                    maxTimeCommitment: 0,
                    remoteOk: true,
                }
            })
        }

        else if (role == "RESEARCHER") {
            await db.researcherProfile.create({
                data: {
                    userId: user.id,
                    institution: "",
                    department: "",
                    title: "",
                    website: "",
                    bio: "",
                    verified: false,
                }
            })
        }
        const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET as string, { expiresIn: "7d" })
        try {
            await sendWelcomeEmail(user.email, user.name ?? "", role);
        } catch (error) {
            console.log(error);
        }
        return res.status(201).json({ token })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Internal server error" })
    }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
    try {
        const { email, password, role } = req.body;
        if (!email || !password || !role) {
            return res.status(400).json({ message: "All fields are required" })
        }
        const user = await db.user.findUnique({ where: { email } })
        if (!user || !user.password) {
            return res.status(401).json({ message: "Invalid credentials" })
        }
        if (user.role !== role) {
            return res.status(401).json({ message: "Invalid account profile for this type." })
        }
        const isPasswordValid = await bcrypt.compare(password, user.password)
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid credentials" })
        }
        const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET as string, { expiresIn: "7d" })
        return res.status(200).json({ token })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Internal server error" })
    }
});

export default router;
