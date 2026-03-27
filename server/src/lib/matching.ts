// ============================================================
// lib/matching.ts — Smart Matching Engine
// ============================================================
// Core algorithm that returns studies a participant qualifies for.
// ============================================================

import { db } from "./prisma";

const MAX_IN_PERSON_DISTANCE_MILES = 50;

export async function getMatchingStudies(userId: string) {
    const participant = await db.participantProfile.findUnique({
        where: { userId },
        include: {
            user: true,
        }
    })

    if (!participant) {
        throw new Error("Participant profile not found")
    }

    const publishedStudies = await db.study.findMany({
        where: {
            status: "PUBLISHED",
            OR: [
                { endDate: null },
                { endDate: { gte: new Date() } }
            ]
        },
        include: {
            researcher: {
                include: {
                    user: true,
                }
            }
        }

    })

    // Compute participant's age from dateOfBirth
    const participantAge = participant.dateOfBirth
        ? Math.floor((Date.now() - participant.dateOfBirth.getTime()) / (1000 * 60 * 60 * 24 * 365.25))
        : null;

    const normalizedInterests = participant.interests.map((interest) => interest.toLowerCase());

    const scoredStudies = publishedStudies.map(study => {
        let score = 0;

        // hard filters (return null = disqualified) 

        // age within [minAge, maxAge]
        if (study.minAge && (participantAge === null || participantAge < study.minAge)) {
            return null;
        }
        if (study.maxAge && (participantAge === null || participantAge > study.maxAge)) {
            return null;
        }

        // gender requirement matches (or study has no requirement)
        if (study.genderRequirement && study.genderRequirement !== participant.gender) {
            return null;
        }

        // remote OK or within distance radius
        const isRemote = study.format === "REMOTE";
        if (isRemote && !participant.remoteOk) {
            return null;
        }

        if (!isRemote) {
            // for in-person / hybrid: require location data and check radius
            if (
                participant.latitude != null && participant.longitude != null &&
                study.latitude != null && study.longitude != null
            ) {
                const distanceMiles = haversineDistance(
                    participant.latitude, participant.longitude,
                    study.latitude, study.longitude
                );
                if (distanceMiles > MAX_IN_PERSON_DISTANCE_MILES) {
                    return null;
                }
            } else if (!participant.remoteOk) {
                // participant not remote-ok and no location data to verify proximity
                return null;
            }
        }

        // time commitment ≤ maxTimeCommitment (both stored in minutes)
        if (
            participant.maxTimeCommitment != null &&
            study.durationMinutes > participant.maxTimeCommitment
        ) {
            return null;
        }

        // compensation ≥ desiredCompMin (both in cents)
        if (
            participant.desiredCompMin != null &&
            study.compensation < participant.desiredCompMin
        ) {
            return null;
        }

        // soft scoring

        // tighten matching: require at least one interest to match category or tags
        const categoryMatchesInterest = normalizedInterests.includes(study.category.toLowerCase());
        const tagMatchesInterest = study.tags.some((tag) => normalizedInterests.includes(tag.toLowerCase()));
        const hasInterestMatch = normalizedInterests.length === 0 || categoryMatchesInterest || tagMatchesInterest;
        if (!hasInterestMatch) {
            return null;
        }

        if (categoryMatchesInterest) {
            score += 10;
        }
        if (tagMatchesInterest) {
            score += 10;
        }

        // location within 25mi → +20 pts
        if (
            participant.latitude != null && participant.longitude != null &&
            study.latitude != null && study.longitude != null
        ) {
            const distanceMiles = haversineDistance(
                participant.latitude, participant.longitude,
                study.latitude, study.longitude
            );
            if (distanceMiles <= 25) {
                score += 20;
            }
        }

        // remote study + remoteOk → +15 pts
        if (isRemote && participant.remoteOk) {
            score += 15;
        }

        return { study, score };
    });

    // filter nulls, sort by score descending, return studies
    return scoredStudies
        .filter((s): s is NonNullable<typeof s> => s != null)
        .sort((a, b) => b.score - a.score)
        .map(({ study }) => study);
}

export function haversineDistance(
    lat1: number, lon1: number,
    lat2: number, lon2: number
): number {
    const R = 3958.8; // earth radius in miles
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

export async function getMatchingParticipants(studyId: string) {
    const study = await db.study.findUnique({
        where: { id: studyId }
    });

    if (!study || study.status !== "PUBLISHED") {
        return [];
    }

    const participants = await db.participantProfile.findMany({
        include: { user: true }
    });

    const isRemote = study.format === "REMOTE";

    return participants.filter(participant => {
        const normalizedInterests = participant.interests.map((interest) => interest.toLowerCase());
        const categoryMatchesInterest = normalizedInterests.includes(study.category.toLowerCase());
        const tagMatchesInterest = study.tags.some((tag) => normalizedInterests.includes(tag.toLowerCase()));
        const hasInterestMatch = normalizedInterests.length === 0 || categoryMatchesInterest || tagMatchesInterest;

        const participantAge = participant.dateOfBirth
            ? Math.floor((Date.now() - participant.dateOfBirth.getTime()) / (1000 * 60 * 60 * 24 * 365.25))
            : null;

        if (study.minAge && (participantAge === null || participantAge < study.minAge)) return false;
        if (study.maxAge && (participantAge === null || participantAge > study.maxAge)) return false;
        if (study.genderRequirement && study.genderRequirement !== participant.gender) return false;

        if (!hasInterestMatch) return false;

        if (isRemote && !participant.remoteOk) return false;

        if (!isRemote) {
            if (
                participant.latitude != null && participant.longitude != null &&
                study.latitude != null && study.longitude != null
            ) {
                const distanceMiles = haversineDistance(
                    participant.latitude, participant.longitude,
                    study.latitude, study.longitude
                );
                if (distanceMiles > MAX_IN_PERSON_DISTANCE_MILES) return false;
            } else if (!participant.remoteOk) {
                return false;
            }
        }

        if (
            participant.maxTimeCommitment != null &&
            study.durationMinutes > participant.maxTimeCommitment
        ) return false;

        if (
            participant.desiredCompMin != null &&
            study.compensation < participant.desiredCompMin
        ) return false;

        return true;
    });
}
