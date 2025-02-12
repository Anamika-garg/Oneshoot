import {
  Html,
  Head,
  Body,
  Heading,
  Text,
  Container,
  Section,
  Hr,
} from "@react-email/components";

export const ContactFormEmail = ({ name, message }) => (
  <Html>
    <Head />
    <Body
      style={{
        backgroundColor: "#191919",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif',
        padding: "0",
        margin: "0",
        width: "100%",
      }}
    >
      <table
        width='100%'
        style={{ backgroundColor: "#191919" }}
        cellPadding='0'
        cellSpacing='0'
      >
        <tr>
          <td align='center'>
            <Container
              style={{
                width: "100%",
                maxWidth: "560px",
                margin: "0 auto",
                padding: "20px",
              }}
            >
              {/* Gradient Title */}
              <Heading
                style={{
                  fontSize: "32px",
                  fontWeight: "bold",
                  textAlign: "center",
                  textTransform: "uppercase",
                  color: "#FFB800", // Fallback color
                  background:
                    "linear-gradient(to right, #FFDD55, #E39319, #FFDD55)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  padding: "17px 0 0",
                  margin: "0",
                }}
              >
                New Contact Form Submission
              </Heading>

              {/* Message Section */}
              <Section>
                <table
                  width='100%'
                  style={{
                    backgroundColor: "#1a1a1a",
                    borderRadius: "12px",
                    padding: "24px",
                    marginTop: "24px",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    textAlign: "left",
                  }}
                >
                  <tr>
                    <td>
                      <Text
                        style={{
                          color: "#FFB800",
                          fontSize: "16px",
                          fontWeight: "600",
                          marginBottom: "8px",
                        }}
                      >
                        Telegram Name:
                      </Text>
                      <Text
                        style={{
                          color: "#ffffff",
                          fontSize: "16px",
                          lineHeight: "26px",
                          marginBottom: "20px",
                        }}
                      >
                        {name}
                      </Text>

                      <Hr
                        style={{
                          borderColor: "rgba(255, 255, 255, 0.1)",
                          margin: "20px 0",
                        }}
                      />

                      <Text
                        style={{
                          color: "#FFB800",
                          fontSize: "16px",
                          fontWeight: "600",
                          marginBottom: "8px",
                        }}
                      >
                        Message:
                      </Text>
                      <Text
                        style={{
                          color: "#ffffff",
                          fontSize: "16px",
                          lineHeight: "26px",
                          marginBottom: "20px",
                        }}
                      >
                        {message}
                      </Text>
                    </td>
                  </tr>
                </table>
              </Section>
            </Container>
          </td>
        </tr>
      </table>
    </Body>
  </Html>
);

export default ContactFormEmail;
