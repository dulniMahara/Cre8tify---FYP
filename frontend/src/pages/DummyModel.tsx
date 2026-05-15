import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Footer from "../components/Footer";

// ─── Garment composition (color + design overlay) ────────────────────────────
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
            const size = Math.max(img.width, img.height);
            const canvas = document.createElement("canvas");
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext("2d")!;

            const offsetX = (size - img.width) / 2;
            const offsetY = (size - img.height) / 2;

            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, size, size);

            const shirtCanvas = document.createElement("canvas");
            shirtCanvas.width = img.width;
            shirtCanvas.height = img.height;
            const sCtx = shirtCanvas.getContext("2d")!;

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

            ctx.drawImage(shirtCanvas, offsetX, offsetY);

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
                    const centerX = offsetX + img.width * (parseFloat(area.left) / 100);
                    const centerY = offsetY + img.height * (parseFloat(area.top) / 100);
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

// ─── FIX 3: Fetch a URL and optionally mirror it horizontally on a canvas ─────
const urlToBlob = async (url: string, flip = false): Promise<Blob> => {
    if (!flip) {
        const res = await fetch(url);
        return res.blob();
    }

    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext("2d")!;
            // Mirror horizontally
            ctx.translate(img.width, 0);
            ctx.scale(-1, 1);
            ctx.drawImage(img, 0, 0);
            canvas.toBlob((blob) => resolve(blob as Blob), "image/png");
        };
        img.src = url;
    });
};

// ─── Component ────────────────────────────────────────────────────────────────
const DummyModel = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const passedData = location.state || {};

    const colorMap: { [key: string]: string } = {
        White: "#FFFFFF",
        Kiwi: "#8fa749",
        "Yellow Haze": "#fadfa6",
        Cornsilk: "#f7ef8f",
        "Light Blue": "#d6e6f7",
        "Light Pink": "#fee0eb",
        Charcoal: "#2C2C2C",
        Khaki: "#F0E68C",
        "Baby Blue": "#E0FFFF",
        Lavender: "#E6E6FA",
        Beige: "#F5F5DC",
        "Standard Grey": "#808080",
        Silver: "#C0C0C0",
        "Light Salmon": "#FFA07A",
        "Sky Blue": "#87CEFA",
        "Pale Turquoise": "#AFEEEE",
        "Plum Light": "#DDA0DD",
        "Mint Green": "#98FB98",
    };

    const initialColor = passedData.selectedColor?.startsWith("#")
        ? passedData.selectedColor
        : colorMap[passedData.selectedColor] || "#E5D3C0";

    const [selectedColor, setSelectedColor] = useState(initialColor);
    const [selectedSize, setSelectedSize] = useState(
        passedData.selectedSize || "M",
    );
    const [angle, setAngle] = useState(0);
    const [category, setCategory] = useState("female");
    const [isGenerating, setIsGenerating] = useState(false);
    const [aiResult, setAiResult] = useState<string | null>(null);

    const product = passedData.product || {
        title: "Minimal T-shirt",
        price: 1200,
        shopName: "Artisa LK",
        baseImages: ["/img/mockups/shop1_base_front.png"],
    };

    const modelAssets: { [key: string]: string[] } = {
        female: [
            "female_front.png",
            "female_side.png",
            "female_back.png",
            "female_side.png",
        ],
        male: ["male_front.png", "male_side.png", "male_back.png", "male_side.png"],
        child: [
            "child_front.png",
            "child_side.png",
            "child_back.png",
            "child_side.png",
        ],
    };

    // ── FIX 2: Pick the correct garment image per angle ──────────────────────
    // angle 0 = front, 1 = right side, 2 = back, 3 = left side
    // If product has multiple base images use them; otherwise always fall back to [0]
    const garmentImageForAngle = (): string => {
        const images = product.baseImages || [];
        if (angle === 2 && images[1]) return images[1]; // back image at index 1 if provided
        return images[0]; // front for all other angles
    };

    const sizeScales: { [key: string]: number } = {
        XS: 0.85,
        S: 0.92,
        M: 1.0,
        L: 1.08,
        XL: 1.15,
        "2XL": 1.22,
        "3XL": 1.3,
    };

    const categoryBaseScales: { [key: string]: number } = {
        female: 1.0,
        male: 1.4,
        child: 0.75,
    };

    // angle 3 = left side → mirror the side image
    const isFlipped = angle === 3;

    const handleAngleChange = (newAngle: number) => {
        setAngle(newAngle);
        setAiResult(null);
    };

    const handleColorChange = (hex: string) => {
        setSelectedColor(hex);
        setAiResult(null);
    };

    const generateAIPreview = async () => {
        setIsGenerating(true);
        setAiResult(null);
        try {
            // 1. Fetch dummy model image — FIX 3: pass flip=true for left-side angle
            const dummyUrl = `/img/dummymodels/${modelAssets[category][angle]}`;
            const humanBlob = await urlToBlob(dummyUrl, isFlipped);
            const humanFile = new File([humanBlob], "human.png", {
                type: "image/png",
            });

            // 2. Compose garment — FIX 2: use angle-appropriate garment image
            const shouldTint = !product.isKids || product.frontDesign;
            const garmBlob = await composeGarmentImage(
                garmentImageForAngle(),
                shouldTint ? selectedColor : "transparent",
                product.frontDesign,
                product.frontPrintArea,
            );
            const garmFile = new File([garmBlob], "garment.png", {
                type: "image/png",
            });

            // 3. Send to backend (unchanged — same endpoint, same field names)
            const formData = new FormData();
            formData.append("humanImage", humanFile);
            formData.append("garmImage", garmFile);
            formData.append("garmentDes", "t-shirt");

            const response = await fetch("http://localhost:5000/api/tryon", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();
            if (response.ok && data.success) {
                setAiResult(data.imageUrl);
            } else {
                alert(data.error || "AI Generation Failed");
            }
        } catch (err) {
            alert("Failed to connect to AI backend.");
        } finally {
            setIsGenerating(false);
        }
    };

    // ── Shirt overlay component (FIX 1) ──────────────────────────────────────
    // Renders the colored + designed shirt on top of the mannequin so the user
    // can see the correct garment BEFORE clicking "Generate".
    const ShirtOverlay = () => {
        // Only show front-facing shirt overlay; for side/back just show the body
        if (angle !== 0) return null;
        if (product.isKids && !product.frontDesign) return null;

        return (
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    pointerEvents: "none",
                    zIndex: 2,
                }}
            >
                {/* Colored shirt using CSS mask (same technique as LivePreview) */}
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        backgroundColor: selectedColor,
                        WebkitMaskImage: `url(${product.baseImages[0]})`,
                        maskImage: `url(${product.baseImages[0]})`,
                        WebkitMaskSize: "contain",
                        maskSize: "contain",
                        WebkitMaskRepeat: "no-repeat",
                        maskRepeat: "no-repeat",
                        WebkitMaskPosition: "center",
                        maskPosition: "center",
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
                                zIndex: 3,
                                pointerEvents: "none",
                            }}
                        >
                            <img
                                src={product.frontDesign}
                                style={{ width: "100%", height: "100%", objectFit: "contain" }}
                                alt="Design"
                            />
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="dashboard-container" style={{ background: "#FBFBFE" }}>
            <Sidebar variant="customer" />
            <div className="main-content">
                <Header mode="title" title="Dummy Preview" userRole="customer" />

                <div
                    className="content-wrapper"
                    style={{ padding: "0 40px", marginTop: "100px" }}
                >
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "260px 1fr 260px",
                            gap: "20px",
                        }}
                    >
                        {/* LEFT: SETTINGS */}
                        <div
                            style={{
                                padding: "15px",
                                background: "#fff",
                                borderRadius: "20px",
                                border: "1px solid #E2E8F0",
                            }}
                        >
                            <h3
                                style={{
                                    fontSize: "16px",
                                    fontWeight: "900",
                                    marginBottom: "15px",
                                }}
                            >
                                Fitting Settings
                            </h3>

                            <label
                                style={{
                                    fontWeight: "800",
                                    color: "#64748B",
                                    display: "block",
                                    marginBottom: "8px",
                                    fontSize: "13px",
                                }}
                            >
                                Model Gender
                            </label>
                            <div
                                style={{
                                    display: "flex",
                                    flexWrap: "wrap",
                                    gap: "6px",
                                    marginBottom: "20px",
                                }}
                            >
                                {Object.keys(modelAssets).map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => {
                                            setCategory(cat);
                                            setAiResult(null);
                                        }}
                                        style={{
                                            padding: "6px 10px",
                                            borderRadius: "8px",
                                            border: "2px solid",
                                            borderColor: category === cat ? "#000" : "#E2E8F0",
                                            background: category === cat ? "#000" : "#fff",
                                            color: category === cat ? "#fff" : "#64748B",
                                            fontWeight: "800",
                                            cursor: "pointer",
                                            textTransform: "capitalize",
                                            fontSize: "12px",
                                        }}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>

                            <label
                                style={{
                                    fontWeight: "800",
                                    color: "#64748B",
                                    display: "block",
                                    marginBottom: "8px",
                                    fontSize: "13px",
                                }}
                            >
                                Body Scale
                            </label>
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(4, 1fr)",
                                    gap: "6px",
                                    marginBottom: "20px",
                                }}
                            >
                                {Object.keys(sizeScales).map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => setSelectedSize(s)}
                                        style={{
                                            padding: "8px 0",
                                            borderRadius: "8px",
                                            border: "2px solid",
                                            borderColor: selectedSize === s ? "#3B82F6" : "#F1F5F9",
                                            background: selectedSize === s ? "#EFF6FF" : "#fff",
                                            color: selectedSize === s ? "#3B82F6" : "#64748B",
                                            fontWeight: "800",
                                            cursor: "pointer",
                                            fontSize: "12px",
                                        }}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>

                            {(!product.isKids || product.frontDesign) && (
                                <>
                                    <label
                                        style={{
                                            fontWeight: "800",
                                            color: "#64748B",
                                            display: "block",
                                            marginBottom: "8px",
                                            fontSize: "13px",
                                        }}
                                    >
                                        Live Color Swap
                                    </label>
                                    <div
                                        style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}
                                    >
                                        {Object.values(colorMap).map((hex) => (
                                            <div
                                                key={hex}
                                                onClick={() => handleColorChange(hex)}
                                                style={{
                                                    width: "24px",
                                                    height: "24px",
                                                    borderRadius: "50%",
                                                    background: hex,
                                                    border:
                                                        selectedColor === hex
                                                            ? "2.5px solid #3B82F6"
                                                            : "1.5px solid #E2E8F0",
                                                    cursor: "pointer",
                                                    transition: "0.2s",
                                                }}
                                            />
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* CENTER: THE VISUALIZER */}
                        <div style={{ textAlign: "center", position: "relative" }}>
                            <div
                                style={{
                                    height: "400px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    position: "relative",
                                    background: "#F8FAFC",
                                    borderRadius: "24px",
                                    overflow: "hidden",
                                }}
                            >
                                {isGenerating ? (
                                    <div
                                        style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "center",
                                            zIndex: 10,
                                        }}
                                    >
                                        <div
                                            className="spinner"
                                            style={{
                                                width: "35px",
                                                height: "35px",
                                                border: "4px solid #E2E8F0",
                                                borderTop: "4px solid #000",
                                                borderRadius: "50%",
                                                animation: "spin 1s linear infinite",
                                            }}
                                        />
                                        <h3
                                            style={{
                                                marginTop: "12px",
                                                fontWeight: "800",
                                                fontSize: "14px",
                                            }}
                                        >
                                            AI Fitting in Progress...
                                        </h3>
                                        <p style={{ color: "#64748B", fontSize: "12px" }}>
                                            Takes ~10–20 seconds.
                                        </p>
                                    </div>
                                ) : aiResult ? (
                                    <img
                                        src={aiResult}
                                        style={{
                                            width: "100%",
                                            height: "100%",
                                            objectFit: "contain",
                                        }}
                                        alt="AI Result"
                                    />
                                ) : (
                                    // Static preview: mannequin body + shirt overlay
                                    <div
                                        style={{
                                            width: "100%",
                                            height: "100%",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            transform: `scale(${sizeScales[selectedSize] * categoryBaseScales[category]})`,
                                            transition: "transform 0.5s ease-out",
                                            position: "relative",
                                        }}
                                    >
                                        {/* LAYER 1: Mannequin body */}
                                        <img
                                            src={`/img/dummymodels/${modelAssets[category]?.[angle] || "female_front.png"}`}
                                            style={{
                                                width: "100%",
                                                height: "100%",
                                                objectFit: "contain",
                                                zIndex: 1,
                                                transform: isFlipped ? "scaleX(-1)" : "scaleX(1)",
                                            }}
                                            alt={`${category} Body`}
                                            onError={(e) => (e.currentTarget.style.display = "none")}
                                        />
                                        {/* FIX 1: LAYER 2 — Shirt overlay on front angle */}
                                    </div>
                                )}
                            </div>

                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "center",
                                    gap: "20px",
                                    marginTop: "20px",
                                }}
                            >
                                <button
                                    onClick={() => handleAngleChange((angle - 1 + 4) % 4)}
                                    className="rotate-btn"
                                    disabled={isGenerating}
                                >
                                    ↺
                                </button>
                                <button
                                    onClick={() => handleAngleChange((angle + 1) % 4)}
                                    className="rotate-btn"
                                    disabled={isGenerating}
                                >
                                    ↻
                                </button>
                            </div>

                            {/* Angle label so user knows which view they're on */}
                            <p
                                style={{
                                    color: "#94A3B8",
                                    fontSize: "12px",
                                    fontWeight: "700",
                                    marginTop: "8px",
                                }}
                            >
                                {["Front", "Right Side", "Back", "Left Side"][angle]} View
                                {angle !== 0 && (
                                    <span style={{ color: "#CBD5E1" }}>
                                        {" "}
                                        — AI will use front garment image
                                    </span>
                                )}
                            </p>

                            <button
                                onClick={generateAIPreview}
                                disabled={isGenerating}
                                style={{
                                    marginTop: "12px",
                                    width: "250px",
                                    padding: "15px",
                                    background: isGenerating ? "#94A3B8" : "#0d375b",
                                    color: "#fff",
                                    borderRadius: "15px",
                                    fontWeight: "900",
                                    border: "none",
                                    cursor: "pointer",
                                    fontSize: "16px",
                                    boxShadow: "0 4px 15px rgba(13, 55, 91, 0.4)",
                                }}
                            >
                                {isGenerating
                                    ? "Generating..."
                                    : "✨ Generate Realistic AI Fit"}
                            </button>
                        </div>

                        {/* RIGHT: PRODUCT CARD */}
                        <div
                            style={{
                                padding: "20px",
                                background: "#fff",
                                borderRadius: "24px",
                                border: "1px solid #E2E8F0",
                                height: "fit-content",
                                boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
                            }}
                        >
                            <div
                                style={{
                                    background: "#F8FAFC",
                                    borderRadius: "18px",
                                    padding: "15px",
                                    marginBottom: "15px",
                                    textAlign: "center",
                                    height: "180px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    position: "relative",
                                    overflow: "hidden",
                                }}
                            >
                                {!product.isKids || product.frontDesign ? (
                                    <div
                                        style={{
                                            backgroundColor: selectedColor,
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
                                            alt="Texture"
                                        />
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
                            <h2
                                style={{
                                    fontSize: "18px",
                                    fontWeight: "900",
                                    marginBottom: "5px",
                                }}
                            >
                                {product.title}
                            </h2>
                            <p
                                style={{
                                    color: "#FB0606",
                                    fontWeight: "900",
                                    marginBottom: "15px",
                                    fontSize: "16px",
                                }}
                            >
                                {product.price}
                            </p>
                            <button
                                style={{
                                    width: "100%",
                                    padding: "14px",
                                    background: "#000",
                                    color: "#fff",
                                    borderRadius: "50px",
                                    fontWeight: "900",
                                    border: "none",
                                    cursor: "pointer",
                                    fontSize: "14px",
                                    transition: "0.3s",
                                }}
                            >
                                Add to Cart
                            </button>
                        </div>
                    </div>
                </div>
                <Footer />
            </div>

            <style>{`
                .rotate-btn {
                    width: 45px; height: 45px; border-radius: 50%;
                    border: 1px solid #E2E8F0; background: #fff;
                    font-size: 18px; cursor: pointer;
                    display: flex; align-items: center; justify-content: center;
                    transition: all 0.2s ease;
                }
                .rotate-btn:hover { background: #F1F5F9; }
                .rotate-btn:disabled { opacity: 0.4; cursor: not-allowed; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default DummyModel;
