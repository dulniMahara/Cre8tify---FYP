import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { getToken } from "../utils/auth";

const API_URL = "http://localhost:5000";

const PerfectPreview = ({
  mockupSrc,
  maskSrc,
  tshirtColor,
  printArea,
  frontDesign,
  containerWidth,
}: any) => {
  const ORIGINAL_WIDTH = 550;
  const ORIGINAL_HEIGHT = 800;
  const scaleRatio = containerWidth / ORIGINAL_WIDTH;
  const safePrintArea = printArea || {
    top: "50%",
    left: "51%",
    width: "30%",
    height: "27%",
    rotation: 0,
  };
  const safeDesignSrc = frontDesign?.startsWith("/uploads")
    ? `${API_URL}${frontDesign}`
    : frontDesign;

  return (
    <div
      style={{
        width: `${containerWidth}px`,
        height: `${ORIGINAL_HEIGHT * scaleRatio}px`,
        overflow: "hidden",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "transparent",
      }}
    >
      <div
        style={{
          width: `${ORIGINAL_WIDTH}px`,
          height: `${ORIGINAL_HEIGHT}px`,
          transform: `scale(${scaleRatio})`,
          transformOrigin: "top left",
          position: "absolute",
          top: 0,
          left: 0,
        }}
      >
        <img
          src={mockupSrc}
          crossOrigin="anonymous"
          style={{
            position: "absolute",
            display: "block",
            height: "125%",
            width: "125%",
            objectFit: "contain",
            top: "-100px",
            right: "-71px",
            zIndex: 1,
          }}
          alt="mockup"
        />
        <div
          style={{
            position: "absolute",
            top: "-100px",
            right: "-71px",
            width: "125%",
            height: "125%",
            backgroundColor: tshirtColor || "#ffffff",
            display:
              (tshirtColor || "#ffffff").toLowerCase() === "#ffffff"
                ? "none"
                : "block",
            mixBlendMode: "multiply",
            WebkitMaskImage: `url(${maskSrc})`,
            maskImage: `url(${maskSrc})`,
            WebkitMaskSize: "contain",
            WebkitMaskPosition: "center",
            WebkitMaskRepeat: "no-repeat",
            zIndex: 2,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "-100px",
            right: "-71px",
            width: "125%",
            height: "125%",
            WebkitMaskImage: `url(${maskSrc})`,
            maskImage: `url(${maskSrc})`,
            WebkitMaskSize: "contain",
            WebkitMaskPosition: "center",
            WebkitMaskRepeat: "no-repeat",
            zIndex: 20,
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "100px",
              right: "71px",
              width: "550px",
              height: "800px",
            }}
          >
            <div
              style={{
                position: "absolute",
                zIndex: 20,
                top: safePrintArea.top,
                left: safePrintArea.left,
                width: safePrintArea.width,
                height: safePrintArea.height,
                marginLeft: `calc(-1 * ${safePrintArea.width} / 2)`,
                marginTop: `calc(-1 * ${safePrintArea.height} / 2)`,
                transform: `rotate(${safePrintArea.rotation ?? 0}deg)`,
              }}
            >
              {safeDesignSrc && (
                <img
                  src={safeDesignSrc}
                  alt="Design Layout"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SandboxPayment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { totalAmount, orderData: incomingData } = location.state || {};

  const [step, setStep] = useState(1); // 1: Card Details, 2: OTP, 3: Processing
  const [otp, setOtp] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  useEffect(() => {
    if (!incomingData) {
      navigate("/checkout");
    }
    window.scrollTo(0, 0);
  }, [incomingData, navigate]);

  // Scroll to top whenever the payment step changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  const handleConfirmPayment = async () => {
    setStep(3);

    // Simulate a network delay for "processing"
    setTimeout(async () => {
      try {
        const activeToken = getToken("customer");

        if (!activeToken) {
          alert("Session expired. Please log in again.");
          navigate("/login");
          return;
        }

        // 🚀 Prepare the actual order data for the database
        const finalOrderData = {
          orderItems: incomingData.items.map((item: any) => {
            const itemPrice =
              parseFloat(String(item.price || 0).replace(/[^\d.]/g, "")) || 0;
            const markup = item.markup || item.designerCharge || 0;
            const serviceFee = item.serviceFee || item.serviceCharge || 100;

            // Strip base64 images — they are too large for the order payload
            let imageUrl = item.image || "/img/womenfront-mockup.png";
            if (imageUrl.startsWith("data:image")) {
              imageUrl = "/img/womenfront-mockup.png";
            }
            if (imageUrl.startsWith("/uploads")) {
              imageUrl = `http://localhost:5000${imageUrl}`;
            }

            return {
              name: item.title || item.name || "Custom Design",
              qty: item.quantity || 1,
              image: imageUrl,
              price: itemPrice,
              basePrice:
                item.basePrice ||
                itemPrice - markup - serviceFee - (item.isCustom ? 300 : 0),
              markup: markup,
              serviceFee: serviceFee,
              isCustom: item.isCustom || false,
              customizationFee: item.isCustom ? 300 : 0,
              size: item.size || "M",
              color: item.color || "#ffffff",
              tshirtColor: item.tshirtColor,
              frontDesign: item.frontDesign,
              frontPrintArea: item.frontPrintArea,
              canvasState: item.canvasState,
              frontDesignScale: item.frontDesignScale,
              baseImages: item.baseImages,
              // Only pass product if it's a valid MongoDB ObjectId (24-char hex)
              product: /^[a-f\d]{24}$/i.test(String(item._id || item.id || ""))
                ? item._id || item.id
                : undefined,
            };
          }),
          totalPrice: incomingData.total,
          shippingAddress: incomingData.customer?.address || "",
          paymentMethod: "sandbox",
          isPaid: true,
          paidAt: new Date(),
          status: "Processing",
        };

        console.log(
          "[SandboxPayment] Submitting order:",
          JSON.stringify(finalOrderData).substring(0, 300),
        );

        const config = {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${activeToken.trim()}`,
          },
        };

        const { data } = await axios.post(
          "http://localhost:5000/api/orders",
          finalOrderData,
          config,
        );

        if (data) {
          navigate("/order-success", {
            state: {
              orderId: data._id.substring(data._id.length - 8).toUpperCase(),
              address: incomingData.customer?.address,
              customerName: incomingData.customer?.name,
              phone: incomingData.customer?.phone,
              createdAt: data.createdAt,
              method: "sandbox",
              isDigitalOnly: incomingData.isDigitalOnly,
            },
          });
        }
      } catch (error: any) {
        const errMsg =
          error.response?.data?.message ||
          error.response?.data ||
          error.message;
        const errStatus = error.response?.status;
        console.error(
          `[SandboxPayment] FAILED — Status: ${errStatus} | Error:`,
          errMsg,
        );
        alert(
          `Payment failed (${errStatus || "network error"}): ${errMsg || "Unknown error"}. Check browser console.`,
        );
        setStep(1);
      }
    }, 3000);
  };

  return (
    <div style={pageContainer}>
      <style
        dangerouslySetInnerHTML={{
          __html: `
                header {
                    left: 0 !important;
                }
            `,
        }}
      />
      <div style={{ background: "#0d375b", width: "100%" }}>
        <Header mode="title" title="SECURE PAYMENT GATEWAY" />
      </div>

      <div style={contentWrapper}>
        <div style={paymentCard}>
          {/* Header */}
          <div style={cardHeader}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={secureText}>Secure Sandbox Payment</span>
            </div>
            <img
              src="/img/visa_master.png"
              alt="Cards"
              style={{ height: "30px" }}
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
          </div>

          {step === 1 && (
            <div className="animate-fade-in">
              <div style={amountSection}>
                <span style={label}>Total Payable</span>
                <h1 style={amountText}>
                  LKR {totalAmount?.toLocaleString()}.00
                </h1>
              </div>

              <div style={formGroup}>
                <label style={inputLabel}>Card Number</label>
                <input
                  style={inputField}
                  placeholder="Enter 16-digit card number"
                  maxLength={16}
                  autoComplete="off"
                  value={cardNumber}
                  onChange={(e) =>
                    setCardNumber(e.target.value.replace(/\D/g, ""))
                  }
                />
              </div>

              <div
                style={{ display: "flex", gap: "20px", marginBottom: "20px" }}
              >
                <div style={{ flex: 1 }}>
                  <label style={inputLabel}>Expiry Date</label>
                  <input
                    style={inputField}
                    placeholder="MM/YY"
                    maxLength={5}
                    autoComplete="off"
                    value={expiry}
                    onChange={(e) => {
                      let val = e.target.value.replace(/[^0-9/]/g, "");
                      if (
                        val.length === 2 &&
                        !val.includes("/") &&
                        expiry.length !== 3
                      ) {
                        val += "/";
                      }
                      setExpiry(val);
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={inputLabel}>CVV</label>
                  <input
                    style={inputField}
                    type="password"
                    placeholder="CVV"
                    maxLength={3}
                    autoComplete="new-password"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, ""))}
                  />
                </div>
              </div>

              <button
                onClick={() => setStep(2)}
                style={{
                  ...primaryBtn,
                  opacity:
                    cardNumber.length === 16 &&
                    expiry.length === 5 &&
                    cvv.length >= 3
                      ? 1
                      : 0.5,
                }}
                disabled={
                  cardNumber.length !== 16 ||
                  expiry.length !== 5 ||
                  cvv.length < 3
                }
              >
                Pay Securely
              </button>
              <p style={noteText}>
                This is a simulated transaction for testing purposes.
              </p>
            </div>
          )}

          {step === 2 && (
            <div className="animate-fade-in" style={{ textAlign: "center" }}>
              <h2 style={stepTitle}>Verification Required</h2>
              <p style={stepDesc}>
                A dummy OTP has been sent to your registered phone number.
                Please enter it below to authorize the transaction.
              </p>

              <div style={{ margin: "30px 0" }}>
                <input
                  style={otpInput}
                  maxLength={6}
                  placeholder="0 0 0 0 0 0"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                />
              </div>

              <button
                onClick={handleConfirmPayment}
                style={{ ...primaryBtn, opacity: otp.length === 6 ? 1 : 0.5 }}
                disabled={otp.length !== 6}
              >
                Verify & Confirm
              </button>
              <button onClick={() => setStep(1)} style={backBtn}>
                Back to Details
              </button>
            </div>
          )}

          {step === 3 && (
            <div style={processingWrapper}>
              <div className="spinner" style={spinner}></div>
              <h2 style={processingTitle}>Processing Payment...</h2>
              <p style={processingDesc}>
                Please do not close this window or refresh the page. We are
                securely communicating with the bank.
              </p>

              <style>{`
                                @keyframes spin {
                                    0% { transform: rotate(0deg); }
                                    100% { transform: rotate(360deg); }
                                }
                                .spinner {
                                    border: 6px solid #f3f3f3;
                                    border-top: 6px solid #0d375b;
                                    border-radius: 50%;
                                    width: 60px;
                                    height: 60px;
                                    animation: spin 1s linear infinite;
                                }
                                .animate-fade-in {
                                    animation: fadeIn 0.4s ease-out;
                                }
                                @keyframes fadeIn {
                                    from { opacity: 0; transform: translateY(10px); }
                                    to { opacity: 1; transform: translateY(0); }
                                }
                            `}</style>
            </div>
          )}
        </div>

        <div style={orderSummaryCard}>
          <h3 style={summaryTitle}>Order Summary</h3>
          <div style={summaryContent}>
            {incomingData?.items.map((item: any, idx: number) => (
              <div key={idx} style={summaryRow}>
                <div style={{ display: "flex", gap: "12px" }}>
                  <div
                    style={{
                      ...thumb,
                      overflow: "hidden",
                      position: "relative",
                    }}
                  >
                    {item.frontDesign ? (
                      <div
                        style={{
                          transform: "translateX(-2px) translateY(-15px)",
                        }}
                      >
                        <PerfectPreview
                          mockupSrc={
                            (item.baseImages && item.baseImages[0]) ||
                            item.image
                          }
                          maskSrc={
                            (item.baseImages && item.baseImages[0]) ||
                            item.image
                          }
                          tshirtColor={item.tshirtColor || "#ffffff"}
                          printArea={item.frontPrintArea}
                          frontDesign={item.frontDesign}
                          containerWidth={60}
                        />
                      </div>
                    ) : (
                      <img
                        src={item.image}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                          transform: "scale(1.1)",
                        }}
                        alt=""
                      />
                    )}
                  </div>
                  <div>
                    <div style={itemTitle}>{item.title}</div>
                    <div style={itemMeta}>
                      Qty: {item.quantity} | {item.size}
                    </div>
                  </div>
                </div>
                <div style={itemPrice}>
                  LKR {parseFloat(item.price).toLocaleString()}
                </div>
              </div>
            ))}

            <div style={divider}></div>

            <div style={totalRow}>
              <span>Total Amount</span>
              <span>LKR {incomingData?.total.toLocaleString()}.00</span>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

// --- STYLES ---
const pageContainer: React.CSSProperties = {
  background: "#f4f7f9",
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
};
const contentWrapper: React.CSSProperties = {
  width: "75%",
  maxWidth: "1000px",
  display: "flex",
  gap: "30px",
  margin: "120px auto 40px auto",
  flex: 1,
};
const paymentCard: React.CSSProperties = {
  background: "white",
  padding: "40px",
  borderRadius: "24px",
  boxShadow: "0 15px 40px rgba(0,0,0,0.05)",
  flex: 1,
  height: "fit-content",
};
const orderSummaryCard: React.CSSProperties = {
  background: "#fff",
  padding: "30px",
  borderRadius: "24px",
  boxShadow: "0 15px 40px rgba(0,0,0,0.05)",
  flex: 0.7,
  height: "fit-content",
  border: "1px solid #e2e8f0",
};

const cardHeader: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "40px",
  borderBottom: "1px solid #f1f5f9",
  paddingBottom: "20px",
};
const secureText: React.CSSProperties = {
  fontSize: "18px",
  fontWeight: "800",
  color: "#0d375b",
};

const amountSection: React.CSSProperties = {
  background: "#f8fafc",
  padding: "25px",
  borderRadius: "16px",
  marginBottom: "30px",
  textAlign: "center",
};
const label: React.CSSProperties = {
  fontSize: "13px",
  color: "#64748b",
  textTransform: "uppercase",
  letterSpacing: "1px",
  fontWeight: "700",
};
const amountText: React.CSSProperties = {
  fontSize: "36px",
  fontWeight: "900",
  color: "#0d375b",
  margin: "5px 0 0 0",
};

const formGroup: React.CSSProperties = { marginBottom: "20px" };
const inputLabel: React.CSSProperties = {
  display: "block",
  fontSize: "13px",
  fontWeight: "700",
  color: "#475569",
  marginBottom: "8px",
};
const inputField: React.CSSProperties = {
  width: "100%",
  padding: "15px",
  borderRadius: "12px",
  border: "1.5px solid #e2e8f0",
  background: "#f8fafc",
  fontSize: "16px",
  fontWeight: "600",
  color: "#334155",
};

const primaryBtn: React.CSSProperties = {
  width: "100%",
  padding: "18px",
  borderRadius: "12px",
  background: "#0d375b",
  color: "white",
  border: "none",
  fontSize: "18px",
  fontWeight: "800",
  cursor: "pointer",
  transition: "all 0.3s",
};
const backBtn: React.CSSProperties = {
  width: "100%",
  background: "none",
  border: "none",
  color: "#64748b",
  fontSize: "14px",
  fontWeight: "600",
  marginTop: "15px",
  cursor: "pointer",
  textDecoration: "underline",
};

const stepTitle: React.CSSProperties = {
  fontSize: "24px",
  fontWeight: "900",
  color: "#0d375b",
  marginBottom: "10px",
};
const stepDesc: React.CSSProperties = {
  fontSize: "15px",
  color: "#64748b",
  lineHeight: "1.5",
};
const otpInput: React.CSSProperties = {
  width: "200px",
  textAlign: "center",
  fontSize: "32px",
  fontWeight: "800",
  letterSpacing: "10px",
  padding: "15px",
  borderRadius: "12px",
  border: "2px solid #0d375b",
  color: "#0d375b",
};

const processingWrapper: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "60px 0",
};
const spinner: React.CSSProperties = { marginBottom: "30px" };
const processingTitle: React.CSSProperties = {
  fontSize: "22px",
  fontWeight: "900",
  color: "#0d375b",
  marginBottom: "10px",
};
const processingDesc: React.CSSProperties = {
  fontSize: "14px",
  color: "#64748b",
  textAlign: "center",
  maxWidth: "300px",
  lineHeight: "1.6",
};

const summaryTitle: React.CSSProperties = {
  fontSize: "18px",
  fontWeight: "800",
  color: "#0d375b",
  marginBottom: "25px",
  borderBottom: "1px solid #f1f5f9",
  paddingBottom: "15px",
};
const summaryContent: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "20px",
};
const summaryRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};
const thumb: React.CSSProperties = {
  width: "60px",
  height: "60px",
  borderRadius: "10px",
  objectFit: "contain",
  background: "#f8fafc",
  border: "1px solid #f1f5f9",
};
const itemTitle: React.CSSProperties = {
  fontSize: "14px",
  fontWeight: "700",
  color: "#334155",
  margin: 0,
};
const itemMeta: React.CSSProperties = { fontSize: "12px", color: "#64748b" };
const itemPrice: React.CSSProperties = {
  fontSize: "14px",
  fontWeight: "800",
  color: "#0d375b",
};
const divider: React.CSSProperties = {
  height: "1px",
  background: "#f1f5f9",
  margin: "10px 0",
};
const totalRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  fontSize: "18px",
  fontWeight: "900",
  color: "#0d375b",
};
const noteText: React.CSSProperties = {
  textAlign: "center",
  fontSize: "12px",
  color: "#94a3b8",
  marginTop: "20px",
  fontStyle: "italic",
};

export default SandboxPayment;
