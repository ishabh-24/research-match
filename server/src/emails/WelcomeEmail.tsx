import * as React from "react";
import { Html, Head, Body, Container, Heading, Text, Hr } from "@react-email/components";

interface WelcomeEmailProps {
  to: string;
  name: string;
  role: "PARTICIPANT" | "RESEARCHER";
}

export default function WelcomeEmail({ name, role }: WelcomeEmailProps) {
  const isResearcher = role === "RESEARCHER";

  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: "sans-serif", backgroundColor: "#f9fafb", padding: "24px" }}>
        <Container style={{ backgroundColor: "#ffffff", borderRadius: "8px", padding: "32px", maxWidth: "560px" }}>
          <Heading style={{ color: "#1d4ed8" }}>👋 Welcome to ResearchMatch, {name}!</Heading>
          <Text>
            {isResearcher
              ? "You've joined as a Researcher. You can now create studies, manage applications, and connect with participants."
              : "You've joined as a Participant. You'll be matched with studies that fit your profile — check your dashboard to get started."}
          </Text>
          <Hr style={{ marginTop: "32px" }} />
          <Text style={{ color: "#6b7280", fontSize: "12px" }}>
            You're receiving this because you signed up for ResearchMatch.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
