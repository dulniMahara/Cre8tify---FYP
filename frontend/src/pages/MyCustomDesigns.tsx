import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import Header from "../components/Header";
import CurvedText from "../components/CurvedText";
import "../styles/dashboard.css";

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

interface RequestItem {
  id: string;
  customer: string;
  status: "Pending" | "Accepted" | "Completed" | "Rejected";
  submittedOn: string;
  productName: string;
  productImage: string;
  message: string;
  color?: string;
  size?: string;
  price?: number;
  frontDesign?: string;
  frontPrintArea?: any;
  canvasState?: {
    imageLayers: any[];
    textLayers: any[];
  };
}

const MyCustomDesigns = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("All");
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<RequestItem | null>(
    null,
  );

  const fetchRequests = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
      if (!userInfo._id) return;

      // 🟢 Filter by 'customization' type
      const response = await fetch(
        `http://localhost:5000/api/requests/customer/${userInfo._id}?type=customization`,
      );
      const data = await response.json();

      const mappedData = data.map((req: any) => ({
        ...req,
        id: req._id,
      }));

      setRequests(mappedData);

      // 🟢 Check for deep link from notification
      if (location.state?.requestId) {
        const target = mappedData.find((r: any) => r.id === location.state.requestId);
        if (target) {
          setSelectedRequest(target);
          setActiveTab("All");
        }
      }
    } catch (err) {
      console.error("Error fetching custom designs:", err);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [location.state?.requestId]);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Pending":
        return {
          bg: "#fff7ed",
          text: "#c2410c",
          border: "#ffedd5",
          label: "Under Admin Review",
        };
      case "Accepted":
        return {
          bg: "#f0fdf4",
          text: "#15803d",
          border: "#dcfce7",
          label: "Ready for Purchase",
        };
      case "Completed":
        return {
          bg: "#f0fdf4",
          text: "#15803d",
          border: "#dcfce7",
          label: "Ready for Purchase",
        };
      case "Rejected":
        return {
          bg: "#fef2f2",
          text: "#b91c1c",
          border: "#fee2e2",
          label: "Changes Required",
        };
      default:
        return {
          bg: "#f1f5f9",
          text: "#475569",
          border: "#e2e8f0",
          label: status,
        };
    }
  };

  const filteredRequests = requests.filter(
    (req) => activeTab === "All" || req.status === activeTab,
  );

  return (
    <div className="dashboard-container">
      <Sidebar variant="customer" />

      <div
        className="main-content"
        style={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          background: "#f8fafc",
        }}
      >
        <Header showCart={true} mode="title" title="MY CUSTOM DESIGNS" />

        <div
          className="content-wrapper animate-fade"
          style={{
            padding: "90px 20px 20px 20px",
            flex: 1,
            maxWidth: "800px",
            margin: "0 auto",
            width: "100%",
          }}
        >
          <div style={{ marginBottom: "25px" }}>
            <p style={{ color: "#64748b", fontSize: "13px" }}>
              View and manage designs you've customized using our tools.
            </p>
          </div>

          <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
            {["All", "Pending", "Accepted", "Completed"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "20px",
                  border: "1px solid #e2e8f0",
                  background: activeTab === tab ? "#0d375b" : "white",
                  color: activeTab === tab ? "white" : "#64748b",
                  fontWeight: "700",
                  fontSize: "12px",
                  cursor: "pointer",
                }}
              >
                {tab === "Pending"
                  ? "In Review"
                  : tab === "Accepted"
                    ? "Approved"
                    : tab}
              </button>
            ))}
          </div>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "15px" }}
          >
            {filteredRequests.length > 0 ? (
              filteredRequests.map((req) => {
                const statusStyle = getStatusStyle(req.status);
                return (
                  <div
                    key={req.id}
                    style={{
                      background: "white",
                      borderRadius: "15px",
                      padding: "15px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      border: "1.5px solid #f1f5f9",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          marginBottom: "10px",
                        }}
                      >
                        <span
                          style={{
                            background: statusStyle.bg,
                            color: statusStyle.text,
                            padding: "4px 10px",
                            borderRadius: "20px",
                            fontSize: "10px",
                            fontWeight: "800",
                          }}
                        >
                          {statusStyle.label}
                        </span>
                        <span style={{ fontSize: "11px", color: "#94a3b8" }}>
                          ID: {req.id}
                        </span>
                      </div>
                      <h3
                        style={{
                          fontSize: "16px",
                          fontWeight: "800",
                          color: "#1e293b",
                          margin: "0 0 4px 0",
                        }}
                      >
                        {req.productName}
                      </h3>
                      <p
                        style={{
                          fontSize: "12px",
                          color: "#64748b",
                          margin: "0 0 12px 0",
                        }}
                      >
                        Created on {req.submittedOn}
                      </p>
                      <button
                        onClick={() => setSelectedRequest(req)}
                        style={{
                          background: "#f1f5f9",
                          color: "#0d375b",
                          border: "none",
                          padding: "6px 15px",
                          borderRadius: "12px",
                          fontSize: "11px",
                          fontWeight: "700",
                          cursor: "pointer",
                        }}
                      >
                        View Design
                      </button>
                    </div>
                    <div
                      style={{
                        width: "80px",
                        height: "80px",
                        background: "#f8fafc",
                        borderRadius: "12px",
                        overflow: "hidden",
                        flexShrink: 0,
                      }}
                    >
                      <div
                        style={{
                          transform: "translateX(0px) translateY(-15px)",
                        }}
                      >
                        <PerfectPreview
                          mockupSrc="/img/womenfront-mockup.png"
                          maskSrc="/img/womenfront-mockup.png"
                          tshirtColor={req.color || "#ffffff"}
                          printArea={req.frontPrintArea}
                          frontDesign={req.frontDesign}
                          containerWidth={80}
                        />
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div
                style={{
                  textAlign: "center",
                  padding: "60px 0",
                  background: "white",
                  borderRadius: "20px",
                  border: "1.5px dashed #e2e8f0",
                }}
              >
                <div style={{ fontSize: "40px", marginBottom: "10px" }}>📪</div>
                <h3 style={{ color: "#0d375b", fontWeight: "800" }}>
                  No Custom Designs Yet
                </h3>
                <p style={{ color: "#64748b", fontSize: "13px" }}>
                  Start by customizing any product from the collection.
                </p>
              </div>
            )}
          </div>
        </div>
        <Footer />
      </div>

      {selectedRequest && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(15, 23, 42, 0.8)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2000,
            padding: "20px",
          }}
        >
          <div
            style={{
              background: "white",
              padding: "30px",
              borderRadius: "24px",
              width: "500px",
              maxWidth: "100%",
              position: "relative",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <button
              onClick={() => setSelectedRequest(null)}
              style={{
                position: "absolute",
                top: "20px",
                right: "20px",
                background: "none",
                border: "none",
                fontSize: "20px",
                cursor: "pointer",
              }}
            >
              ×
            </button>

            <h2
              style={{
                fontSize: "22px",
                fontWeight: "900",
                color: "#0d375b",
                marginBottom: "20px",
              }}
            >
              Design Preview
            </h2>

            <div
              style={{
                display: "flex",
                gap: "20px",
                marginBottom: "25px",
                background: "#f8fafc",
                padding: "15px",
                borderRadius: "15px",
              }}
            >
              <div
                style={{
                  flex: 1.5,
                  overflow: "hidden",
                  background: "white",
                  borderRadius: "20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: "185px",
                  maxHeight: "185px",
                }}
              >
                <div
                  style={{ transform: "translateX(0px) translateY(-10px)" }}
                >
                  <PerfectPreview
                    mockupSrc="/img/womenfront-mockup.png"
                    maskSrc="/img/womenfront-mockup.png"
                    tshirtColor={selectedRequest.color || "#ffffff"}
                    printArea={selectedRequest.frontPrintArea}
                    frontDesign={selectedRequest.frontDesign}
                    containerWidth={185}
                  />
                </div>
              </div>
              <div>
                <h4 style={{ margin: "0 0 5px 0", fontSize: "16px" }}>
                  {selectedRequest.productName}
                </h4>
                <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>
                  Size: {selectedRequest.size || "M"} | Color:{" "}
                  <span
                    style={{
                      display: "inline-block",
                      width: "10px",
                      height: "10px",
                      borderRadius: "50%",
                      background: selectedRequest.color,
                    }}
                  ></span>
                </p>
              </div>
            </div>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "15px" }}
            >
              <div style={{ display: "flex", gap: "20px" }}>
                <div style={{ flex: 1 }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "12px",
                      fontWeight: "800",
                      color: "#94a3b8",
                      textTransform: "uppercase",
                      marginBottom: "5px",
                    }}
                  >
                    Status
                  </label>
                  <p
                    style={{
                      fontSize: "14px",
                      fontWeight: "700",
                      color: getStatusStyle(selectedRequest.status).text,
                    }}
                  >
                    {getStatusStyle(selectedRequest.status).label}
                  </p>
                </div>
                <div style={{ flex: 1 }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "12px",
                      fontWeight: "800",
                      color: "#94a3b8",
                      textTransform: "uppercase",
                      marginBottom: "5px",
                    }}
                  >
                    Created On
                  </label>
                  <p style={{ fontSize: "14px", fontWeight: "700" }}>
                    {selectedRequest.submittedOn}
                  </p>
                </div>
              </div>
            </div>

            <div
              style={{
                marginTop: "30px",
                borderTop: "1px solid #f1f5f9",
                paddingTop: "20px",
                textAlign: "center",
              }}
            >
              {(selectedRequest.status === "Completed" || selectedRequest.status === "Accepted") ? (
                <>
                  <p
                    style={{
                      fontSize: "13px",
                      color: "#15803d",
                      fontWeight: "700",
                      marginBottom: "15px",
                    }}
                  >
                    ✅ Your customization has been approved!
                  </p>
                  <button
                    onClick={() => {
                      alert("Proceeding to checkout...");
                      navigate("/checkout", {
                        state: { customProduct: selectedRequest },
                      });
                    }}
                    style={{
                      width: "100%",
                      padding: "15px",
                      borderRadius: "30px",
                      background: "#0d375b",
                      color: "white",
                      border: "none",
                      fontWeight: "800",
                      cursor: "pointer",
                      boxShadow: "0 4px 15px rgba(13, 55, 91, 0.2)",
                    }}
                  >
                    Proceed to Purchase
                  </button>
                </>
              ) : (
                <>
                  <p
                    style={{
                      fontSize: "12px",
                      color: "#64748b",
                      marginBottom: "15px",
                    }}
                  >
                    This design is currently waiting for admin approval. You
                    will be able to purchase it once it's reviewed.
                  </p>
                  <button
                    disabled
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "30px",
                      background: "#e2e8f0",
                      color: "#94a3b8",
                      border: "none",
                      fontWeight: "700",
                      cursor: "not-allowed",
                    }}
                  >
                    {selectedRequest.status === "Pending"
                      ? "Awaiting Review"
                      : "Action Required"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyCustomDesigns;
