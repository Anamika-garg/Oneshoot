import {
  Body,
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
  products = [],
  orderId = "",
  expiryTime = "",
  hasPendingProducts = false,
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

              {hasPendingProducts && (
                <Text
                  style={{
                    color: "#FFB800",
                    fontSize: "16px",
                    lineHeight: "24px",
                    marginBottom: "20px",
                    textAlign: "center",
                    padding: "10px",
                    border: "1px solid #FFB800",
                    borderRadius: "8px",
                  }}
                >
                  Some items in your order are currently being prepared. We'll
                  notify you when they're ready for download.
                </Text>
              )}

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
                  }}
                >
                  <tr>
                    <td>
                      <Text
                        style={{
                          fontSize: "16px",
                          fontWeight: "bold",
                          marginBottom: "16px",
                          color: "#ffffff",
                          textAlign: "center",
                        }}
                      >
                        Order #{orderId}
                      </Text>

                      {/* Products List */}
                      {Array.isArray(products) && products.length > 0 ? (
                        products.map((product, index) => (
                          <div key={index}>
                            <table
                              width='100%'
                              style={{
                                marginBottom:
                                  index < products.length - 1 ? "16px" : "0",
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
                                    {product.productName || "Product"}
                                  </Text>
                                  <Text
                                    style={{
                                      fontSize: "16px",
                                      color: "rgba(255, 255, 255, 0.7)",
                                      marginBottom: "12px",
                                    }}
                                  >
                                    {product.variantName || "Variant"}
                                  </Text>

                                  {product.downloadLinks &&
                                  product.downloadLinks.length > 0 ? (
                                    <div>
                                      {product.downloadLinks.map(
                                        (link, linkIndex) => (
                                          <table
                                            key={linkIndex}
                                            align='center'
                                            style={{
                                              textAlign: "center",
                                              width: "100%",
                                              maxWidth: "200px",
                                              margin: "8px auto",
                                              borderRadius: "8px",
                                              backgroundColor: "#FFB800",
                                            }}
                                          >
                                            <tr>
                                              <td
                                                align='center'
                                                style={{ padding: "8px 16px" }}
                                              >
                                                <a
                                                  href={link}
                                                  style={{
                                                    display: "inline-block",
                                                    fontSize: "14px",
                                                    fontWeight: "600",
                                                    color: "#000000",
                                                    textDecoration: "none",
                                                    textAlign: "center",
                                                  }}
                                                >
                                                  Download{" "}
                                                  {product.downloadLinks
                                                    .length > 1
                                                    ? `#${linkIndex + 1}`
                                                    : ""}
                                                </a>
                                              </td>
                                            </tr>
                                          </table>
                                        )
                                      )}
                                    </div>
                                  ) : null}
                                </td>
                              </tr>
                            </table>
                            {index < products.length - 1 && (
                              <Hr
                                style={{
                                  borderColor: "rgba(255, 255, 255, 0.1)",
                                  margin: "12px 0",
                                }}
                              />
                            )}
                          </div>
                        ))
                      ) : (
                        <Text
                          style={{
                            fontSize: "16px",
                            color: "#ffffff",
                            textAlign: "center",
                          }}
                        >
                          Your order has been received.{" "}
                          {hasPendingProducts &&
                            "Products will be available for download soon."}
                        </Text>
                      )}
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
                You can access your purchase details and download your files
                from your account.
              </Text>

              {expiryTime && (
                <Text
                  style={{
                    color: "rgba(255, 255, 255, 0.7)",
                    fontSize: "14px",
                    marginTop: "16px",
                    textAlign: "center",
                  }}
                >
                  Download links will expire on{" "}
                  {new Date(expiryTime).toLocaleDateString()} at{" "}
                  {new Date(expiryTime).toLocaleTimeString()}.
                </Text>
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
