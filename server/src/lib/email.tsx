// ============================================================
// lib/email.ts — Email Notifications via Resend
// ============================================================
// WHAT TO PUT HERE:
//   Helper functions that send transactional emails.
//   Use the Resend SDK (already in package.json).
//
// FUNCTIONS TO IMPLEMENT:
//
//   sendMatchAlert(to: string, studyTitle: string, studyId: string)
//     → Notifies participant they matched a new study.
//
//   sendApplicationStatusEmail(to: string, status: "ACCEPTED"|"REJECTED", studyTitle: string)
//     → Notifies participant their application was accepted or rejected.
//
//   sendNewApplicationEmail(to: string, participantName: string, studyTitle: string)
//     → Notifies researcher that someone applied to their study.
//
//   sendWelcomeEmail(to: string, name: string, role: "PARTICIPANT"|"RESEARCHER")
//     → Welcome email on first sign-up.
//
// NOTES:
//   - Use @react-email/components to build email templates as React components.
//   - Store email templates in /emails/ folder at the project root.
//   - Always handle errors gracefully — email failure should not break the app.
// ============================================================

import * as React from "react";
import { Resend } from "resend";
import MatchAlertEmail from "../emails/MatchAlertEmail";
import ApplicationStatusEmail from "../emails/ApplicationStatusEmail";
import NewApplicationEmail from "../emails/NewApplicationEmail";
import WelcomeEmail from "../emails/WelcomeEmail";


const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendMatchAlert(to: string, studyTitle: string, studyId: string) {
    try {
        await resend.emails.send({
            from: "[EMAIL_ADDRESS]",
            to,
            subject: "New Study Match!",
            react: <MatchAlertEmail to={ to } studyTitle = { studyTitle } studyId = { studyId } />    
        })
} catch (error) {
    console.log(error);
}
}

export async function sendApplicationStatusEmail(
    to: string,
    status: "ACCEPTED" | "REJECTED",
    studyTitle: string
) {
    try {
        await resend.emails.send({
            from: "[EMAIL_ADDRESS]",
            to,
            subject: "Application Status Update",
            react: <ApplicationStatusEmail to={ to } status = { status } studyTitle = { studyTitle } />
        })
} catch (error) {
    console.log(error);
}   
}

export async function sendNewApplicationEmail(
    to: string,
    participantName: string,
    studyTitle: string
) {
    try {
        await resend.emails.send({
            from: "[EMAIL_ADDRESS]",
            to,
            subject: "New Application for Your Study",
            react: <NewApplicationEmail to={ to } participantName = { participantName } studyTitle = { studyTitle } />
        })
} catch (error) {
    console.log(error);
}   
}

export async function sendWelcomeEmail(
    to: string,
    name: string,
    role: "PARTICIPANT" | "RESEARCHER"
) {
    try {
        await resend.emails.send({
            from: "[EMAIL_ADDRESS]",
            to,
            subject: "Welcome to ResearchMatch!",
            react: <WelcomeEmail to={ to } name = { name } role = { role } />
        })
} catch (error) {
    console.log(error);
}
}
