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

export const OrderReadyEmail = ({ products = [], orderId = "" }) => (
  <Html>
    <Head />
    <Preview>Your order is ready for download</Preview>

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
              <Heading
                style={{
                  fontSize: "32px",
                  fontWeight: "bold",
                  marginBottom: "24px",
                  textAlign: "center",
                  textTransform: "uppercase",
                  color: "#FFB800",
                }}
              >
                Your Order is Ready!
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
                Good news! Your order #{orderId} is now ready for download.
              </Text>

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
                                                  Download Now{" "}
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
                                  ) : (
                                    <table
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
                                            href={product.downloadFilePath}
                                            style={{
                                              display: "inline-block",
                                              fontSize: "14px",
                                              fontWeight: "600",
                                              color: "#000000",
                                              textDecoration: "none",
                                              textAlign: "center",
                                            }}
                                          >
                                            Download Now
                                          </a>
                                        </td>
                                      </tr>
                                    </table>
                                  )}
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
                          Your order is now ready for download.
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

export default OrderReadyEmail;
