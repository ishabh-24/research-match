// ============================================================
// lib/validations.ts — Zod Schemas
// ============================================================
//   Zod schemas used for form validation on the client and
//   request validation in API routes (server).
// ============================================================

import { z } from "zod";

export const signUpSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters long"),
    name: z.string().min(1, "Name is required"),
    role: z.enum(["PARTICIPANT", "RESEARCHER"]),
});

export const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters long"),
});

export const participantProfileSchema = z.object({
    bio: z.string().optional(),
    dateOfBirth: z.string().optional(),
    gender: z.string().optional(),
    ethnicity: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    interests: z.array(z.string()).optional(),
    desiredCompMin: z.number().optional(),
    maxTimeCommitment: z.string().optional(),
    remoteOk: z.boolean().optional(),

});

export const researcherProfileSchema = z.object({
    institution: z.string().optional(),
    department: z.string().optional(),
    title: z.string().optional(),
    website: z.string().url("Must be a valid URL").optional().or(z.literal('')),
    bio: z.string().optional(),
});

export const createStudySchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    category: z.string().min(1, "Category is required"),
    format: z.enum(["IN_PERSON", "REMOTE", "HYBRID"]).default("REMOTE"),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    minAge: z.number().int().positive().optional(),
    maxAge: z.number().int().positive().optional(),
    genderRequirement: z.string().optional(),
    durationMinutes: z.number().int().positive("Duration must be a positive number"),
    sessions: z.number().int().positive().default(1),
    compensation: z.number().int().nonnegative(),
    compensationType: z.string().default("cash"),
    targetParticipants: z.number().int().positive().default(10),
    tags: z.array(z.string()).default([]),
    instructions: z.string().optional(),
    consentFormUrl: z.string().url("Must be a valid URL").optional().or(z.literal('')),
});

export const applicationSchema = z.object({
    message: z.string().optional(),
});

// Infer TypeScript types from Zod schemas
export type SignUpInput = z.infer<typeof signUpSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ParticipantProfileInput = z.infer<typeof participantProfileSchema>;
export type ResearcherProfileInput = z.infer<typeof researcherProfileSchema>;
export type CreateStudyInput = z.infer<typeof createStudySchema>;
export type ApplicationInput = z.infer<typeof applicationSchema>;
