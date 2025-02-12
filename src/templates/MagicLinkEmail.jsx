import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

export const MagicLinkEmail = ({ magicLink }) => (
  <Html>
    <Head />
    <Preview>Log in to your account</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Log in to your account</Heading>
        <Text style={text}>
          Click the button below to log in to your account. This link will
          expire in 10 minutes.
        </Text>
        <Section style={buttonContainer}>
          <Button pX={20} pY={12} style={button} href={magicLink}>
            Log In
          </Button>
        </Section>
      </Container>
    </Body>
  </Html>
);

export default MagicLinkEmail;

const main = {
  backgroundColor: "#ffffff",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "20px 0 48px",
};

const h1 = {
  color: "#333",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "40px 0",
  padding: "0",
};

const text = {
  color: "#333",
  fontSize: "16px",
  lineHeight: "26px",
};

const buttonContainer = {
  textAlign: "center",
};

const button = {
  backgroundColor: "#FF4F00",
  borderRadius: "4px",
  color: "#fff",
  fontSize: "16px",
  textDecoration: "none",
  textAlign: "center",
  display: "inline-block",
};
