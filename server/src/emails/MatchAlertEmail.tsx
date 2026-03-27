import * as React from "react";
import { Html, Head, Body, Container, Heading, Text, Button, Hr } from "@react-email/components";

interface MatchAlertEmailProps {
  to: string;
  studyTitle: string;
  studyId: string;
}

export default function MatchAlertEmail({ studyTitle, studyId }: MatchAlertEmailProps) {
  const studyUrl = `${process.env.CLIENT_URL ?? "http://localhost:3000"}/studies/${studyId}`;

  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: "sans-serif", backgroundColor: "#f9fafb", padding: "24px" }}>
        <Container style={{ backgroundColor: "#ffffff", borderRadius: "8px", padding: "32px", maxWidth: "560px" }}>
          <Heading style={{ color: "#1d4ed8" }}>🎯 New Study Match!</Heading>
          <Text>
            Great news! You've been matched with a new research study that fits your profile:
          </Text>
          <Text style={{ fontWeight: "bold", fontSize: "18px" }}>{studyTitle}</Text>
          <Button
            href={studyUrl}
            style={{
              backgroundColor: "#1d4ed8",
              color: "#ffffff",
              padding: "12px 24px",
              borderRadius: "6px",
              textDecoration: "none",
              display: "inline-block",
              marginTop: "16px",
            }}
          >
            View Study
          </Button>
          <Hr style={{ marginTop: "32px" }} />
          <Text style={{ color: "#6b7280", fontSize: "12px" }}>
            You're receiving this because you signed up for ResearchMatch as a participant.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
