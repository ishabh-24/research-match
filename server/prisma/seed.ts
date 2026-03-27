// ============================================================
// prisma/seed.ts — Database Seed Script
// ============================================================
// Run with: npm run db:seed
// ============================================================

import { PrismaClient, Role, StudyStatus, StudyFormat } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
    console.log("🌱 Seeding database...");

    // Clean existing data to ensure proper upserts
    await db.application.deleteMany();
    await db.study.deleteMany();
    await db.participantProfile.deleteMany();
    await db.researcherProfile.deleteMany();
    await db.user.deleteMany();

    const passwordHash = await bcrypt.hash("password123", 12);

    console.log("Creating 10 Researchers and 10 Studies...");
    for (let i = 1; i <= 10; i++) {
        const email = `researcher${i}@test.com`;
        
        // Upsert Researcher User
        const user = await db.user.upsert({
            where: { email },
            update: { password: passwordHash },
            create: {
                email,
                name: `Test Researcher ${i}`,
                password: passwordHash,
                role: Role.RESEARCHER,
                researcherProfile: {
                    create: {
                        institution: `University of Testing ${i}`,
                        department: "Computer Science",
                        title: "Lead Investigator",
                        bio: "I am a test researcher created by the seed script."
                    }
                }
            }
        });

        const profile = await db.researcherProfile.findUnique({ where: { userId: user.id } });

        // Upsert 1 Study per Researcher
        if (profile) {
            // Check if study already exists for this researcher to avoid infinite duplicates on re-run
            const existingStudy = await db.study.findFirst({ where: { researcherId: profile.id } });
            
            if (!existingStudy) {
                await db.study.create({
                    data: {
                        researcherId: profile.id,
                        title: `Test Study ${i}: Understanding Human Behavior`,
                        description: `This is a test study created automatically for Researcher ${i}. It involves participating in a brief remote survey about human behavior.`,
                        category: i % 2 === 0 ? "UX" : "Psychology",
                        status: StudyStatus.PUBLISHED,
                        format: StudyFormat.REMOTE,
                        durationMinutes: 30 + (i * 5),
                        compensation: 1500 + (i * 500), // $15.00 + 
                        compensationType: "cash",
                        targetParticipants: 20
                    }
                });
            }
        }
    }

    console.log("Creating 10 Participants with Match Preferences...");
    for (let i = 1; i <= 10; i++) {
        const email = `participant${i}@test.com`;
        
        // Randomize interests to demonstrate matching
        const allInterests = ["Psychology", "UX", "Medical", "Education"];
        const randomInterests = [allInterests[i % 4], allInterests[(i + 1) % 4]];

        await db.user.upsert({
            where: { email },
            update: { password: passwordHash },
            create: {
                email,
                name: `Test Participant ${i}`,
                password: passwordHash,
                role: Role.PARTICIPANT,
                participantProfile: {
                    create: {
                        bio: `I am a test participant eager to join ${randomInterests.join(" and ")} studies.`,
                        city: "Test City",
                        state: "TS",
                        interests: randomInterests, // to hit the 'category' of the studies
                        remoteOk: true, // to match REMOTE formats
                        desiredCompMin: 0, // to match any compensation
                        maxTimeCommitment: 120, // max 2 hours, matches 30-80 min studies
                    }
                }
            }
        });
    }

    console.log("✅ Seeding complete!");
    console.log("\n==========================================");
    console.log("🧪 TEST CREDENTIALS (Password for all: password123)");
    console.log("==========================================");
    console.log("Researchers (Each has 1 published study):");
    for (let i = 1; i <= 10; i++) console.log(`  researcher${i}@test.com`);
    console.log("\nParticipants:");
    for (let i = 1; i <= 10; i++) console.log(`  participant${i}@test.com`);
    console.log("==========================================\n");
}

main()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(async () => { await db.$disconnect(); });
