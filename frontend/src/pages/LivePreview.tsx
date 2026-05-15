import React, { useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { getBodyKeypoints } from "../utils/poseDetection";
import Footer from "../components/Footer";
import "../styles/dashboard.css";

//  HELPER: Composite the shirt with color and design before sending to AI
const composeGarmentImage = async (
  imageUrl: string,
  hexColor: string,
  designUrl?: string,
  printArea?: any,
): Promise<Blob> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      // FIX: Add vertical padding so the try-on model doesn't over-stretch
      const paddingFactor = 0.4; // 40% padding top and bottom
      const padV = Math.round(img.height * paddingFactor);

      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height + padV * 2; // taller = less horizontal stretch
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // 1. Draw White Background (full padded canvas)
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 2. Create a temporary canvas for the colored shirt
      const shirtCanvas = document.createElement("canvas");
      shirtCanvas.width = img.width;
      shirtCanvas.height = img.height;
      const sCtx = shirtCanvas.getContext("2d");
      if (sCtx) {
        if (hexColor !== "original" && hexColor !== "transparent") {
          sCtx.fillStyle = hexColor;
          sCtx.fillRect(0, 0, img.width, img.height);
          sCtx.globalCompositeOperation = "multiply";
          sCtx.drawImage(img, 0, 0);
          sCtx.globalCompositeOperation = "destination-in";
          sCtx.drawImage(img, 0, 0);
        } else {
          sCtx.drawImage(img, 0, 0);
        }
      }

      // 3. Draw the shirt centered vertically with padding
      ctx.drawImage(shirtCanvas, 0, padV);

      // 4. Draw Design Overlay (offset by padV)
      if (designUrl) {
        const designImg = new Image();
        designImg.crossOrigin = "Anonymous";
        designImg.onload = () => {
          const area = printArea || {
            top: "45%",
            left: "50%",
            width: "35%",
            height: "45%",
          };
          const centerX = img.width * (parseFloat(area.left) / 100);
          const centerY = padV + img.height * (parseFloat(area.top) / 100); // ← offset by padV
          const drawW = img.width * (parseFloat(area.width) / 100);
          const drawH = img.height * (parseFloat(area.height) / 100);

          ctx.drawImage(
            designImg,
            centerX - drawW / 2,
            centerY - drawH / 2,
            drawW,
            drawH,
          );
          canvas.toBlob((blob) => resolve(blob as Blob), "image/png");
        };
        designImg.src = designUrl;
      } else {
        canvas.toBlob((blob) => resolve(blob as Blob), "image/png");
      }
    };
    img.onload = () => {
      //  FIX: Use the shirt's natural dimensions (no square forcing)
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // 1. Draw White Background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, img.width, img.height);

      // 2. Create a temporary canvas for the colored shirt to keep shadows
      const shirtCanvas = document.createElement("canvas");
      shirtCanvas.width = img.width;
      shirtCanvas.height = img.height;
      const sCtx = shirtCanvas.getContext("2d");
      if (sCtx) {
        if (hexColor !== "original" && hexColor !== "transparent") {
          sCtx.fillStyle = hexColor;
          sCtx.fillRect(0, 0, img.width, img.height);
          sCtx.globalCompositeOperation = "multiply";
          sCtx.drawImage(img, 0, 0);
          sCtx.globalCompositeOperation = "destination-in";
          sCtx.drawImage(img, 0, 0);
        } else {
          sCtx.drawImage(img, 0, 0);
        }
      }

      // 3. Draw the colored shirt onto the main canvas
      ctx.drawImage(shirtCanvas, 0, 0);

      // 4. Draw Design Overlay
      if (designUrl) {
        const designImg = new Image();
        designImg.crossOrigin = "Anonymous";
        designImg.onload = () => {
          const area = printArea || {
            top: "45%",
            left: "50%",
            width: "35%",
            height: "45%",
          };
          const centerX = img.width * (parseFloat(area.left) / 100);
          const centerY = img.height * (parseFloat(area.top) / 100);
          const drawW = img.width * (parseFloat(area.width) / 100);
          const drawH = img.height * (parseFloat(area.height) / 100);

          ctx.drawImage(
            designImg,
            centerX - drawW / 2,
            centerY - drawH / 2,
            drawW,
            drawH,
          );
          canvas.toBlob((blob) => resolve(blob as Blob), "image/png");
        };
        designImg.src = designUrl;
      } else {
        canvas.toBlob((blob) => resolve(blob as Blob), "image/png");
      }
    };
    img.src = imageUrl;
  });
};
const LivePreview = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null); // Hidden processing engine

  // 1. DATA RECOVERY: Ensure data from the Product Page is caught correctly
  const passedData = location.state || {};

  // Define the full color objects here so the UI can render the circles
  const colorOptions = [
    { name: "White", hex: "#FFFFFF" },
    { name: "Kiwi", hex: "#8fa749" },
    { name: "Yellow Haze", hex: "#fadfa6" },
    { name: "Cornsilk", hex: "#f7ef8f" },
    { name: "Light Blue", hex: "#d6e6f7" },
    { name: "Light Pink", hex: "#fee0eb" },
    { name: "Charcoal", hex: "#2C2C2C" },
    { name: "Khaki", hex: "#F0E68C" },
    { name: "Baby Blue", hex: "#E0FFFF" },
    { name: "Lavender", hex: "#E6E6FA" },
    { name: "Beige", hex: "#F5F5DC" },
    { name: "Standard Grey", hex: "#808080" },
    { name: "Silver", hex: "#C0C0C0" },
    { name: "Light Salmon", hex: "#FFA07A" },
    { name: "Sky Blue", hex: "#87CEFA" },
    { name: "Pale Turquoise", hex: "#AFEEEE" },
    { name: "Plum Light", hex: "#DDA0DD" },
    { name: "Mint Green", hex: "#98FB98" },
  ];

  const product = passedData.product || {
    title: "Taste & See Minimal T-shirt",
    shopName: "Artisa LK",
    baseImages: ["/img/mockups/shop1_base_front.png"],
    sizes: ["XS", "S", "M", "L", "XL", "2XL", "3XL"],
  };

  // 2. STATE: Initialize with the color originally picked on the Product page
  const [selectedColor, setSelectedColor] = useState(
    passedData.selectedColor || "#E5D3C0",
  );
  const [selectedSize, setSelectedSize] = useState(
    passedData.selectedSize || "M",
  );
  const [userImage, setUserImage] = useState<string | null>(null);
  const [userImageFile, setUserImageFile] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);

  //  FIT CONTROLS: To align the shirt onto the uploaded body
  const [shirtPos, setShirtPos] = useState({ x: 0, y: 150, scale: 0.55 });

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      setUserImageFile(file);
      const url = URL.createObjectURL(file);
      setUserImage(url);
      setResultImage(null);
      setIsGenerating(true); // Show loader while AI scans

      const img = new Image();
      img.src = url;
      img.onload = async () => {
        try {
          //  AI SCAN: Detecting body proportions
          const points = await getBodyKeypoints(img);

          if (points && points.leftShoulder && points.rightShoulder) {
            const detectedWidth = points.shoulderWidth;

            //  MATH: Calculate the scale and position based on body size
            const autoScale = (detectedWidth / img.width) * 1.5;
            const autoY = points.midChest.y - detectedWidth * 0.15;

            setShirtPos({
              x: 0,
              y: autoY,
              scale: autoScale,
            });
            console.log("AI Body Mapping Successful! ✨");
          }
        } catch (err) {
          console.error("AI Scan Error:", err);
        } finally {
          setIsGenerating(false);
        }
      };
    }
  };

  const generatePreview = async () => {
    if (!userImageFile || !product) return;
    setIsGenerating(true);
    setIsGeneratingPreview(true);

    try {
      //  THE FIX: Use our composition engine to bake the color and design into the file
      // For hardcoded kids products, we don't want to tint (hexColor = 'transparent' or skip)
      const shouldTint = !product.isKids || product.frontDesign;
      const garmBlob = await composeGarmentImage(
        product.baseImages[0],
        shouldTint ? selectedColor : "transparent",
        product.frontDesign,
        product.frontPrintArea,
      );
      const garmFile = new File([garmBlob], "garment.png", {
        type: "image/png",
      });

      const formData = new FormData();
      formData.append("humanImage", userImageFile);
      formData.append("garmImage", garmFile);
      formData.append("garmentDes", product.title);

      const response = await fetch("http://localhost:5000/api/tryon", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setResultImage(data.imageUrl);
      } else {
        alert(data.error || "AI Try-On failed");
      }
    } catch (error) {
      console.error("Error calling AI Backend:", error);
      alert("Could not connect to the AI server.");
    } finally {
      setIsGenerating(false);
      setIsGeneratingPreview(false);
    }
  };
  return (
    <div className="dashboard-container">
      {/* LOADING POPUP */}
      {isGeneratingPreview && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
            backdropFilter: "blur(5px)",
          }}
        >
          <div
            style={{
              width: "60px",
              height: "60px",
              border: "5px solid #333",
              borderTop: "5px solid #fff",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              marginBottom: "20px",
            }}
          ></div>
          <h2
            style={{
              color: "white",
              fontWeight: "900",
              fontSize: "28px",
              margin: 0,
            }}
          >
            Generating Live Preview...
          </h2>
          <p style={{ color: "#94A3B8", fontSize: "16px", marginTop: "10px" }}>
            Please wait while our AI works its magic ✨
          </p>
        </div>
      )}

      <Sidebar variant="customer" />
      <canvas ref={canvasRef} style={{ display: "none" }} />
      <div className="main-content">
        <header className="top-header">
          <div
            className="header-left"
            onClick={() => navigate(-1)}
            style={{ cursor: "pointer" }}
          >
            <img
              src="/img/back.png"
              alt="Back"
              className="nav-icon-small"
              style={{
                filter: "invert(1)",
                width: "18px",
                height: "18px",
                marginRight: "5px",
              }}
            />
            <span style={{ fontSize: "16px", fontWeight: "700" }}>Back</span>
          </div>
        </header>

        <div className="content-wrapper" style={{ padding: "5px 30px" }}>
          <h1
            style={{ fontSize: "28px", fontWeight: "900", marginBottom: "2px" }}
          >
            Live Preview
          </h1>
          <p
            style={{ fontSize: "14px", color: "#64748B", marginBottom: "20px" }}
          >
            Refine your style in real-time
          </p>
          <div
            style={{
              display: "flex",
              gap: "12px",
              justifyContent: "center",
              alignItems: "flex-start",
            }}
          >
            {/* 1. LEFT PANEL: T-SHIRT PREVIEW & CONTROLS */}
            <div
              style={{
                width: "320px",
                flexShrink: 0,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  height: "300px",
                  background: "#F8FAFC",
                  borderRadius: "16px",
                  border: "1.5px solid #E2E8F0",
                  overflow: "hidden",
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {!product.isKids || product.frontDesign ? (
                  <div
                    style={{
                      backgroundColor: selectedColor, // Dynamic color update
                      width: "100%",
                      height: "100%",
                      position: "absolute",
                      WebkitMaskImage: `url(${product.baseImages[0]})`,
                      maskImage: `url(${product.baseImages[0]})`,
                      WebkitMaskSize: "contain",
                      maskSize: "contain",
                      WebkitMaskRepeat: "no-repeat",
                      maskRepeat: "no-repeat",
                      WebkitMaskPosition: "center",
                      maskPosition: "center",
                      zIndex: 0,
                    }}
                  >
                    <img
                      src={product.baseImages[0]}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                        mixBlendMode: "multiply",
                        filter: "contrast(1.0) brightness(0.95) saturate(0)",
                      }}
                      alt="Shirt Texture"
                    />

                    {/*  ADDED: Design Overlay for Designer Products */}
                    {product.frontDesign && (
                      <div
                        style={{
                          position: "absolute",
                          ...(product.frontPrintArea || {
                            top: "45%",
                            left: "50%",
                            width: "35%",
                            height: "45%",
                          }),
                          transform: "translate(-50%, -50%)",
                          zIndex: 2,
                          pointerEvents: "none",
                        }}
                      >
                        <img
                          src={product.frontDesign}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                          }}
                          alt="Design"
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <img
                    src={product.baseImages[0]}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                    }}
                    alt={product.title}
                  />
                )}
              </div>

              <div style={{ marginTop: "35px" }}>
                <h2
                  style={{ fontSize: "18px", fontWeight: "900", margin: "0" }}
                >
                  {product.title}
                </h2>
                <p
                  style={{
                    color: "#64748B",
                    fontSize: "13px",
                    fontStyle: "italic",
                    marginBottom: "20px",
                  }}
                >
                  by {product.shopName}
                </p>

                {(!product.isKids || product.frontDesign) && (
                  <>
                    <h4
                      style={{
                        fontSize: "14px",
                        fontWeight: "800",
                        marginBottom: "12px",
                      }}
                    >
                      Change Color
                    </h4>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(9, 1fr)",
                        gap: "8px",
                        marginBottom: "25px",
                        width: "fit-content",
                      }}
                    >
                      {colorOptions.map((c) => (
                        <div
                          key={c.hex}
                          onClick={() => setSelectedColor(c.hex)}
                          style={{ cursor: "pointer" }}
                        >
                          <div
                            style={{
                              width: "22px",
                              height: "22px",
                              borderRadius: "50%",
                              background: c.hex,
                              border:
                                selectedColor === c.hex
                                  ? "2.5px solid #3B82F6"
                                  : "1.5px solid #E2E8F0",
                              margin: "0 auto",
                            }}
                          ></div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                <h4
                  style={{
                    fontSize: "14px",
                    fontWeight: "800",
                    marginBottom: "12px",
                  }}
                >
                  Change Size
                </h4>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                  {product.sizes.map((s: string, index: number) => (
                    <React.Fragment key={s}>
                      <div
                        onClick={() => setSelectedSize(s)}
                        style={{
                          padding: "6px 12px",
                          borderRadius: "8px",
                          border: "2px solid #E2E8F0",
                          background: selectedSize === s ? "#000" : "#fff",
                          color: selectedSize === s ? "#fff" : "#000",
                          fontWeight: "900",
                          fontSize: "12px",
                          cursor: "pointer",
                        }}
                      >
                        {s}
                      </div>
                      {s === "XL" && (
                        <div style={{ width: "100%", height: "0" }} />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>

            {/* 2. CENTER PANEL: UPLOAD */}
            <div
              style={{
                width: "300px",
                flexShrink: 0,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  height: "300px",
                  border: "3px dashed #CBD5E1",
                  borderRadius: "16px",
                  background: "#F1F5F9",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  overflow: "hidden",
                }}
              >
                {userImage ? (
                  <img
                    src={userImage}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                    alt="User"
                  />
                ) : (
                  <h3
                    style={{
                      fontSize: "16px",
                      fontWeight: "800",
                      color: "#64748B",
                    }}
                  >
                    Upload photo
                  </h3>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  hidden
                  onChange={handleFileChange}
                  accept="image/*"
                />
              </div>
              <div style={{ marginTop: "35px" }}>
                <button
                  onClick={generatePreview}
                  className="generate-btn"
                  style={{
                    width: "100%",
                    padding: "12px",
                    background: "#000",
                    color: "#fff",
                    borderRadius: "25px",
                    fontSize: "14px",
                    fontWeight: "900",
                    cursor: "pointer",
                    border: "none",
                    transition: "transform 0.1s ease",
                  }}
                >
                  Generate Preview
                </button>
                <div
                  style={{
                    marginTop: "20px",
                    padding: "15px",
                    background: "#FFF5F5",
                    borderRadius: "12px",
                    border: "1.5px solid #FED7D7",
                    textAlign: "center",
                  }}
                >
                  <h4
                    style={{
                      fontWeight: "900",
                      color: "#C53030",
                      fontSize: "13px",
                      marginBottom: "8px",
                    }}
                  >
                    ⚠️ PHOTO INSTRUCTIONS
                  </h4>
                  <ul
                    style={{
                      color: "#742A2A",
                      fontSize: "12px",
                      fontWeight: "700",
                      lineHeight: "1.6",
                      listStyleType: "none",
                      padding: 0,
                      margin: 0,
                    }}
                  >
                    <li>Front facing photo only</li>
                    <li>Good lighting for best results</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 3. RIGHT PANEL: RESULT */}
            <div
              style={{
                width: "300px",
                flexShrink: 0,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  height: "300px",
                  background: "#F8FAFC",
                  borderRadius: "16px",
                  border: "1.5px solid #E2E8F0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                }}
              >
                {isGenerating ? (
                  <div className="loader"></div>
                ) : resultImage ? (
                  <img
                    src={resultImage}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <p
                    style={{
                      fontSize: "14px",
                      fontWeight: "800",
                      color: "#94A3B8",
                    }}
                  >
                    Preview result
                  </p>
                )}
              </div>
              <div style={{ marginTop: "35px", textAlign: "center" }}>
                <button
                  onClick={() =>
                    navigate("/dummy-model", {
                      state: { product, selectedColor, selectedSize },
                    })
                  }
                  style={{
                    background: "none",
                    border: "none",
                    color: "#3B82F6",
                    cursor: "pointer",
                    textDecoration: "underline",
                    fontWeight: "900",
                    fontSize: "14px",
                  }}
                >
                  Use Dummy Model
                </button>
              </div>
            </div>
          </div>
          <div style={{ height: "60px" }}></div>{" "}
          {/* Spacer for gap from footer */}
        </div>
        <Footer />
      </div>
      <style>{`
                .generate-btn:active { transform: scale(0.96); opacity: 0.9; }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
    </div>
  );
};

export default LivePreview;
