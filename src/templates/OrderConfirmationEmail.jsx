import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

export const OrderConfirmationEmail = ({
  productName,
  variantName,
  downloadFilePath,
}) => (
  <Html>
    <Head />
    <Preview>Your order confirmation</Preview>

    {/* Force full background */}
    <Body
      style={{
        backgroundColor: "#0E0E0E",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif',
        padding: "0",
        margin: "0",
        width: "100%",
      }}
    >
      <table
        width='100%'
        style={{ backgroundColor: "#0E0E0E" }}
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
                  marginBottom: "24px",
                  textAlign: "center",
                  textTransform: "uppercase",
                  color: "#FFB800", // Fallback color
                  background:
                    "linear-gradient(to right, #FFDD55, #E39319, #FFDD55)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Order Confirmation
              </Heading>

              <Text
                style={{
                  color: "#FFFFFF",
                  fontSize: "16px",
                  lineHeight: "24px",
                  marginBottom: "20px",
                  textAlign: "center",
                }}
              >
                Thank you for your purchase! Your order details are below:
              </Text>

              {/* Order Info Section */}
              <Section>
                <table
                  width='100%'
                  style={{
                    backgroundColor: "#1a1a1a",
                    borderRadius: "12px",
                    padding: "24px",
                    marginBottom: "24px",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    textAlign: "center",
                  }}
                >
                  <tr>
                    <td>
                      <Text
                        style={{
                          fontSize: "18px",
                          fontWeight: "bold",
                          marginBottom: "8px",
                          color: "#ffffff",
                        }}
                      >
                        {productName}
                      </Text>
                      <Text
                        style={{
                          fontSize: "16px",
                          color: "rgba(255, 255, 255, 0.7)",
                        }}
                      >
                        {variantName}
                      </Text>
                    </td>
                  </tr>
                </table>
              </Section>

              <Hr
                style={{
                  borderColor: "rgba(255, 255, 255, 0.1)",
                  margin: "20px 0",
                }}
              />

              <Text
                style={{
                  color: "#FFFFFF",
                  fontSize: "16px",
                  lineHeight: "24px",
                  marginBottom: "20px",
                  textAlign: "center",
                }}
              >
                You can access your purchase details and download your file from
                your account.
              </Text>

              {downloadFilePath && (
                <>
                  <Text
                    style={{
                      color: "#FFFFFF",
                      fontSize: "16px",
                      lineHeight: "24px",
                      marginBottom: "20px",
                      textAlign: "center",
                    }}
                  >
                    Or you can download your purchase directly using the link
                    below:
                  </Text>

                  {/* Gradient Button with a Table Wrapper */}
                  <table
                    align='center'
                    style={{
                      textAlign: "center",
                      width: "100%",
                      maxWidth: "460px",
                      margin: "0 auto",
                      borderRadius: "8px",
                      background:
                        "linear-gradient(to right, #FFDD55, #E39319, #FFDD55)",
                    }}
                  >
                    <tr>
                      <td align='center'>
                        <Button
                          style={{
                            display: "inline-block",
                            padding: "12px 24px",
                            fontSize: "16px",
                            fontWeight: "600",
                            color: "#000000",
                            textDecoration: "none",
                            textAlign: "center",
                            background: "none", // Remove background from Button
                          }}
                          href={downloadFilePath}
                        >
                          Download Your Purchase
                        </Button>
                      </td>
                    </tr>
                  </table>
                </>
              )}

              <Hr
                style={{
                  borderColor: "rgba(255, 255, 255, 0.1)",
                  margin: "20px 0",
                }}
              />

              <Text
                style={{
                  color: "rgba(255, 255, 255, 0.5)",
                  fontSize: "14px",
                  marginTop: "24px",
                  textAlign: "center",
                }}
              >
                If you have any questions, please don't hesitate to contact us.
              </Text>
            </Container>
          </td>
        </tr>
      </table>
    </Body>
  </Html>
);

export default OrderConfirmationEmail;
