// ============================================================
// types/index.ts — Shared TypeScript Types
// ============================================================

export type Role = "PARTICIPANT" | "RESEARCHER" | "ADMIN";
export type StudyStatus = "DRAFT" | "PUBLISHED" | "PAUSED" | "CLOSED";
export type StudyFormat = "IN_PERSON" | "REMOTE" | "HYBRID";
export type ApplicationStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "WITHDRAWN" | "COMPLETED";

export interface StudyResearcher {
    user: {
        name: string | null;
        email: string;
    };
    institution?: string | null;
    title?: string | null;
}

export interface StudyWithRelations {
    id: string;
    title: string;
    description: string;
    category: string;
    status: StudyStatus;
    format: StudyFormat;
    city: string | null;
    state: string | null;
    country: string | null;
    minAge: number | null;
    maxAge: number | null;
    genderRequirement: string | null;
    durationMinutes: number;
    sessions: number;
    compensation: number; // in cents
    compensationType: string;
    targetParticipants: number;
    tags: string[];
    instructions: string | null;
    consentFormUrl: string | null;
    researcherId: string;
    researcher: StudyResearcher;
    createdAt: string;
    updatedAt: string;
}

export interface MatchedStudy extends StudyWithRelations {
    score: number;
}

export interface ApplicationWithRelations {
    id: string;
    userId: string;
    studyId: string;
    status: ApplicationStatus;
    message: string | null;
    notes: string | null;
    createdAt: string;
    updatedAt: string;
    study: StudyWithRelations;
}

export interface DashboardStats {
    totalStudies: number;
    activeStudies: number;
    totalApplications: number;
    acceptedApplications: number;
}

export interface CurrentUser {
    id: string;
    email: string;
    role: Role;
    name?: string;
    exp: number;
}
