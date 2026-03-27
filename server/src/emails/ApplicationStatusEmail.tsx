import * as React from "react";
import { Html, Head, Body, Container, Heading, Text, Hr } from "@react-email/components";

interface ApplicationStatusEmailProps {
  to: string;
  status: "ACCEPTED" | "REJECTED";
  studyTitle: string;
}

export default function ApplicationStatusEmail({ status, studyTitle }: ApplicationStatusEmailProps) {
  const accepted = status === "ACCEPTED";

  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: "sans-serif", backgroundColor: "#f9fafb", padding: "24px" }}>
        <Container style={{ backgroundColor: "#ffffff", borderRadius: "8px", padding: "32px", maxWidth: "560px" }}>
          <Heading style={{ color: accepted ? "#15803d" : "#b91c1c" }}>
            {accepted ? "🎉 Application Accepted!" : "Application Update"}
          </Heading>
          <Text>
            {accepted
              ? `Congratulations! Your application to participate in "${studyTitle}" has been accepted.`
              : `Thank you for your interest in "${studyTitle}". Unfortunately, your application was not selected at this time.`}
          </Text>
          {accepted && (
            <Text>The research team will be in touch with next steps.</Text>
          )}
          <Hr style={{ marginTop: "32px" }} />
          <Text style={{ color: "#6b7280", fontSize: "12px" }}>
            You're receiving this because you applied to a study on ResearchMatch.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
