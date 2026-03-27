import * as React from "react";
import { Html, Head, Body, Container, Heading, Text, Hr } from "@react-email/components";

interface NewApplicationEmailProps {
  to: string;
  participantName: string;
  studyTitle: string;
}

export default function NewApplicationEmail({ participantName, studyTitle }: NewApplicationEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: "sans-serif", backgroundColor: "#f9fafb", padding: "24px" }}>
        <Container style={{ backgroundColor: "#ffffff", borderRadius: "8px", padding: "32px", maxWidth: "560px" }}>
          <Heading style={{ color: "#1d4ed8" }}>📋 New Application Received</Heading>
          <Text>
            <strong>{participantName}</strong> has applied to your study:
          </Text>
          <Text style={{ fontWeight: "bold", fontSize: "18px" }}>{studyTitle}</Text>
          <Text>
            Log in to your ResearchMatch dashboard to review their profile and accept or reject the application.
          </Text>
          <Hr style={{ marginTop: "32px" }} />
          <Text style={{ color: "#6b7280", fontSize: "12px" }}>
            You're receiving this because you are a researcher on ResearchMatch.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
