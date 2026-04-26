import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

import Sidebar from '../components/Sidebar';
import '../styles/dashboard.css';

const API_URL = "http://localhost:5000";

// --- HELPERS ---
const VARIANT_COLORS = [
    { name: 'White', hex: '#FFFFFF', gradient: 'linear-gradient(135deg, #ffffff 0%, #f3f4f6 100%)', isAvailable: true },
    { name: 'Kiwi', hex: '#8fa749', gradient: 'linear-gradient(135deg, #a4be54 0%, #8fa749 100%)', isAvailable: true },
    { name: 'Yellow Haze', hex: '#fadfa6', gradient: 'linear-gradient(135deg, #fff2cc 0%, #fadfa6 100%)', isAvailable: true },
    { name: 'Cornsilk', hex: '#f7ef8f', gradient: 'linear-gradient(135deg, #fffbc7 0%, #f7ef8f 100%)', isAvailable: true },
    { name: 'Light Blue', hex: '#d6e6f7', gradient: 'linear-gradient(135deg, #ebf4ff 0%, #d6e6f7 100%)', isAvailable: true },
    { name: 'Light Pink', hex: '#fee0eb', gradient: 'linear-gradient(135deg, #fff0f6 0%, #fee0eb 100%)', isAvailable: true },
    { name: 'Charcoal', hex: '#2C2C2C', gradient: 'linear-gradient(135deg, #434343 0%, #2C2C2C 100%)', isAvailable: true },
    { name: 'Khaki', hex: '#F0E68C', gradient: 'linear-gradient(135deg, #f0e68c 0%, #e6d96a 100%)', isAvailable: true },
    { name: 'Baby Blue', hex: '#E0FFFF', gradient: 'linear-gradient(135deg, #e0ffff 0%, #c7f2f2 100%)', isAvailable: true },
    { name: 'Lavender', hex: '#E6E6FA', gradient: 'linear-gradient(135deg, #e6e6fa 0%, #d8d8f5 100%)', isAvailable: true },
    { name: 'Beige', hex: '#F5F5DC', gradient: 'linear-gradient(135deg, #f5f5dc 0%, #e8e8c8 100%)', isAvailable: true },
    { name: 'Standard Grey', hex: '#808080', gradient: 'linear-gradient(135deg, #a3a3a3 0%, #808080 100%)', isAvailable: true },
    { name: 'Silver', hex: '#C0C0C0', gradient: 'linear-gradient(135deg, #e0e0e0 0%, #c0c0c0 100%)', isAvailable: true },
    { name: 'Light Salmon', hex: '#FFA07A', gradient: 'linear-gradient(135deg, #ffa07a 0%, #f08d66 100%)', isAvailable: true },
    { name: 'Sky Blue', hex: '#87CEFA', gradient: 'linear-gradient(135deg, #87cefa 0%, #70b0e0 100%)', isAvailable: true },
    { name: 'Pale Turquoise', hex: '#AFEEEE', gradient: 'linear-gradient(135deg, #afeeee 0%, #96dede 100%)', isAvailable: true },
    { name: 'Plum Light', hex: '#DDA0DD', gradient: 'linear-gradient(135deg, #dda0dd 0%, #c68dc6 100%)', isAvailable: true },
    { name: 'Mint Green', hex: '#98FB98', gradient: 'linear-gradient(135deg, #98fb98 0%, #7ee07e 100%)', isAvailable: true }
];

const getColorName = (hex: string) => {
    if (!hex) return "Default White";
    const color = VARIANT_COLORS.find((c: { name: string, hex: string }) =>
        c.hex.toLowerCase() === hex.toLowerCase()
    );
    return color ? color.name : "Custom Color";
};

const ProductSubmission = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const fallbackSnapshots = (() => {
        try {
            const raw = localStorage.getItem('temp_design_snapshots');
            return raw ? JSON.parse(raw) : {};
        } catch {
            return {};
        }
    })();

    // We get the data passed from DesignTool.tsx
    const {
        productImages = [],
        productType = 'Boxy T-shirt',
        tshirtColor = '#ffffff',
        canvasState = { imageLayers: [], textLayers: [] },

        // Design Snapshots
        frontDesign = fallbackSnapshots.frontDesign || "",
        backDesign = fallbackSnapshots.backDesign || "",
        neckDesign = fallbackSnapshots.neckDesign || "",
        foldedDesign = fallbackSnapshots.foldedDesign || "",

        // Mockups
        frontMockup = "/img/womenfront-mockup.png",
        backMockup = "/img/womenback-mockup.png",
        neckMockup = "/img/mockups/collar.png",
        foldedMockup = "/img/mockups/folded.png",
        foldedMask = "/img/mockups/foldedmask.png",

        // Print Areas (passed from MOCKUP_CONFIG)
        frontPrintArea = { top: '50%', left: '51%', width: '30%', height: '27%', rotation: 0 },
        backPrintArea = { top: '35%', left: '50%', width: '45%', height: '22%', rotation: 0 },
        neckPrintArea = { top: '70%', left: '60%', width: '35%', height: '25%', rotation: 0 },
        foldedPrintArea = { top: '56%', left: '46%', width: '30%', height: '42%', rotation: 5 },

        // Scaling Helpers
        frontPrintAreaPx = fallbackSnapshots.frontPrintAreaPx || null,
        neckPrintAreaPx = fallbackSnapshots.neckPrintAreaPx || null,
        foldedPrintAreaPx = fallbackSnapshots.foldedPrintAreaPx || null,
        backPrintAreaPx = fallbackSnapshots.backPrintAreaPx || null,

        frontDesignScale = 1.0,
        neckDesignScale = 1.3,
        foldedDesignScale = 0.9,
        backDesignScale = 1.0,

        frontAreaScale = 1.0,
        neckAreaScale = 1.0,
        foldedAreaScale = 1.0,
        backAreaScale = 1.0,

        editorMockupScale = 1,
        foldedMaskPosition = "center",
        foldedMaskSize = "contain",
    } = (location.state || {});

    // 🚀 ADJUST THIS LINE to change the size of the T-shirt in the Pricing Setup box
    const pricingMockupScale = 1.5;


    const ADMIN_SPECS = `
        <div style="margin-bottom: 25px;">
            <h4 style="color: #0d375b; margin-bottom: 10px; font-size: 20px;">🛠 Product Specifications & Quality Assurance</h4>
            <ul style="list-style-type: none; padding: 0; line-height: 1.8;">
                <li><strong>Material:</strong> Premium Heavyweight 100% Combed Ring-Spun Cotton.</li>
                <li><strong>Fabric Weight:</strong> 240 GSM (Grams per Square Meter) for a substantial, premium feel.</li>
                <li><strong>Finish:</strong> Bio-washed for a buttery-smooth texture and Pre-shrunk to maintain fit after washing.</li>
                <li><strong>Fit:</strong> Contemporary Relaxed Street-Style Fit with dropped shoulders.</li>
                <li><strong>Durability:</strong> Double-needle stitched neck and hems for long-lasting wear.</li>
            </ul>
            <div style="background: #eef4fb; padding: 15px; border-radius: 10px; margin-top: 15px; border-left: 5px solid #0d375b;">
                <strong>🧺 Care Instructions:</strong><br/>
                To preserve the design quality, machine wash cold inside out with similar colors. 
                Tumble dry low or hang dry. Do not iron directly on the printed area.
            </div>
        </div>
        <hr style="border: 0; border-top: 2px solid #cbd5e1; margin: 30px 0;"/>
    `;

    const [formData, setFormData] = useState({
        title: '',
        designDescription: '',
        markup: 0,
        allowUserCustomization: false,
        allowEditRequests: false,
        status: 'Pending'
    });

    const BASE_PRICE = 1200;
    const SERVICE_FEE = 100;
    const [finalPrice, setFinalPrice] = useState(0);
    const [showSuccessModal, setShowSuccessModal] = useState({ show: false, type: 'Draft' });

    useEffect(() => {
        const markupValue = Number(formData.markup) || 0;
        setFinalPrice(BASE_PRICE + SERVICE_FEE + markupValue);
    }, [formData.markup]);

    const handleInputChange = (field: string, value: any) => {
        setFormData({ ...formData, [field]: value });
    };

    const formatPrice = (price: number) => {
        return `LKR ${price.toLocaleString('en-US')}.00`;
    };

    const submitProduct = async (submissionStatus: string) => {
        const storedUser = localStorage.getItem('userInfo');
        if (!storedUser) return alert("Please log in.");
        const { token } = JSON.parse(storedUser);

        const thumbnailImage = productImages[0] || frontDesign;

        try {
            const response = await fetch(`${API_URL}/api/products`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    title: formData.title,
                    description: ADMIN_SPECS + "<br/>" + formData.designDescription,
                    baseProduct: productType,
                    markup: formData.markup,
                    price: finalPrice,
                    mockupImages: [thumbnailImage, ...productImages.slice(1)],
                    canvasState: canvasState,
                    tshirtColor: tshirtColor,
                    allowUserCustomization: formData.allowUserCustomization,
                    allowEditRequests: formData.allowEditRequests,
                    status: submissionStatus,
                    // 🟢 Passing design snapshots using destructured variables
                    frontDesign: frontDesign,
                    frontPrintArea: frontPrintArea,
                    frontPrintAreaPx: frontPrintAreaPx,

                    backDesign: backDesign,
                    backPrintArea: backPrintArea,
                    backPrintAreaPx: backPrintAreaPx,

                    neckDesign: neckDesign,
                    neckPrintArea: neckPrintArea,
                    neckPrintAreaPx: neckPrintAreaPx,

                    foldedDesign: foldedDesign,
                    foldedPrintArea: foldedPrintArea,
                    foldedPrintAreaPx: foldedPrintAreaPx
                })
            });

            if (response.ok) {
                localStorage.removeItem('temp_design_state');
                localStorage.removeItem('RECOVERY_DESIGN');
                setShowSuccessModal({ show: true, type: submissionStatus });
            } else {
                const result = await response.json();
                alert(result.message || "Failed to submit product.");
            }
        } catch (err) {
            console.error(err);
            alert("Error connecting to server.");
        }
    };
    return (
        <div className="dashboard-container">
            <style>{`
        .main-content { padding-top: 60px !important; } /* Increased to clear the fixed header */
                .top-header {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: fixed;
                    top: 0;
                    left: 200px; /* 🚀 Matches sidebar width so it's not hidden behind it */
                    right: 0;
                    height: 50px;
                    background: #0d375b;
                    z-index: 2000; /* 🚀 High z-index to stay on top of everything */
                    box-sizing: border-box;
                    padding: 0 20px;
                    border-left: 1px solid #0d375b; 
                    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                }
                .header-left {
                    position: absolute;
                    left: 20px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    cursor: pointer;
                    color: white;
                    transition: opacity 0.2s;
                }
                .header-left:hover { opacity: 0.8; }
                .top-header h2 {
                    margin: 0 !important;
                    color: white !important;
                    font-size: 16px !important;
                    font-weight: 700;
                }
                body { font-size: 14px; }
                .main-content h3 { font-size: 18px !important; margin-bottom: 14px; }
                .switch { position: relative; display: inline-block; width: 44px; height: 24px; }
                .switch input { opacity: 0; width: 0; height: 0; }
                .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #ccc; transition: .4s; border-radius: 34px; }
                .slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px; background-color: white; transition: .4s; border-radius: 50%; }
                input:checked + .slider { background-color: #0d375b; }
                input:checked + .slider:before { transform: translateX(20px); }
                .ql-toolbar.ql-snow button { scale: 1; margin-right: 6px !important; }
                .ql-editor { font-size: 14px !important; min-height: 120px; }
                .admin-specs-box { 
                    background: #f1f5f9; padding: 14px; border-radius: 10px 10px 0 0; 
                    border: 1px solid #cbd5e1; border-bottom: none; font-size: 13px; color: #475569;
                }
                .price-item { 
                    display: grid; 
                    grid-template-columns: 240px 20px 1fr; 
                    gap: 10px; 
                    align-items: center; 
                    font-size: 15px; 
                    margin-bottom: 18px; 
                    font-weight: 600; 
                }
                .final-price-text {
                    font-size: 28px !important;
                    font-weight: 900 !important;
                    color: #0d375b !important;
                }
            `}</style>

            <Sidebar />

            <div className="main-content">
                <div className="top-header">
                    <div className="header-left" onClick={() => navigate(-1)}>
                        <img src="/img/back.png" alt="Back" style={{ width: '12px', filter: 'invert(1)' }} />
                        <span style={{ fontWeight: 'bold' }}>Back to Editor</span>
                    </div>
                    <h2>Submit Product</h2>
                </div>


                <div className="content-wrapper" style={{ marginTop: '20px', paddingBottom: '50px' }}>


                    {/* DETAILS SECTION */}
                    <div style={blueCardStyle}>
                        <h3 style={{ color: '#0d375b' }}>Product Portfolio Details</h3>
                        <label style={largeLabelStyle}>Title</label>
                        <input type="text" value={formData.title} onChange={(e) => handleInputChange('title', e.target.value)} style={largeInputStyle} placeholder="Enter a title to your design..." />

                        <label style={{ ...largeLabelStyle, marginTop: '20px' }}>Description</label>
                        <div className="admin-specs-box" dangerouslySetInnerHTML={{ __html: ADMIN_SPECS }} />
                        <div style={{ background: 'white', borderRadius: '0 0 10px 10px', border: '1px solid #cbd5e1', overflow: 'hidden' }}>
                            <ReactQuill
                                theme="snow"
                                value={formData.designDescription}
                                onChange={(val: string) => handleInputChange('designDescription', val)}
                                placeholder="Type here..."
                            />
                        </div>
                    </div>

                    {/* POLICY SECTION */}
                    <div style={blueCardStyle}>
                        <h3 style={{ color: '#0d375b' }}>Design Personalization Policy</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                            <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                                <label className="switch">
                                    <input type="checkbox" checked={formData.allowUserCustomization} onChange={(e) => handleInputChange('allowUserCustomization', e.target.checked)} />
                                    <span className="slider"></span>
                                </label>
                                <div>
                                    <div style={{ fontWeight: '700', fontSize: '14px' }}>Allow User Customization</div>
                                    <div style={{ color: '#555', fontSize: '12px' }}>Users can use the Live Editor for small edits.</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                                <label className="switch">
                                    <input type="checkbox" checked={formData.allowEditRequests} onChange={(e) => handleInputChange('allowEditRequests', e.target.checked)} />
                                    <span className="slider"></span>
                                </label>
                                <div>
                                    <div style={{ fontWeight: '700', fontSize: '14px' }}>Allow Designer-Handled Edit Requests</div>
                                    <div style={{ color: '#555', fontSize: '12px' }}>Users can request custom edits through you.</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* PRICING SECTION */}
                    <div style={blueCardStyle}>
                        <div style={{ display: 'flex', gap: '40px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                            <div style={{ flex: 1, minWidth: '300px' }}>
                                <h3 style={{ color: '#0d375b', marginBottom: '20px' }}>Pricing Setup</h3>

                                <div className="price-item">
                                    <span>Base Price <small style={{ fontSize: '11px', color: '#666' }}>(Fixed Production Cost)</small></span>
                                    <span>:</span>
                                    <span style={{ fontWeight: '800' }}>{formatPrice(BASE_PRICE)}</span>
                                </div>

                                <div className="price-item">
                                    <span>Designer Markup (Your Profit)</span>
                                    <span>:</span>
                                    <div style={{ display: 'flex', alignItems: 'center', border: '2px solid #0d375b', borderRadius: '8px', padding: '8px 12px', width: '160px', background: 'white' }}>
                                        <span style={{ marginRight: '6px', fontWeight: 'bold', fontSize: '13px' }}>LKR</span>
                                        <input type="number" value={formData.markup} onChange={(e) => handleInputChange('markup', e.target.value)} style={{ border: 'none', outline: 'none', width: '100%', fontWeight: '800', fontSize: '14px' }} />
                                    </div>
                                </div>

                                <div className="price-item">
                                    <span>Service Fee <small style={{ fontSize: '11px', color: '#666' }}>(Platform Hosting)</small></span>
                                    <span>:</span>
                                    <span style={{ fontWeight: '800' }}>{formatPrice(SERVICE_FEE)}</span>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '200px 20px 1fr', gap: '10px', marginTop: '20px', borderTop: '1px solid #cbd5e1', paddingTop: '20px' }}>
                                    <strong style={{ color: '#0d375b', fontSize: '16px' }}>Final Selling Price</strong>
                                    <strong style={{ fontSize: '16px' }}>:</strong>
                                    <strong className="final-price-text">{formatPrice(finalPrice)}</strong>
                                </div>
                            </div>

                            {/* Preview image next to pricing */}
                            <div style={{ width: '220px', height: '220px', background: 'white', borderRadius: '16px', boxShadow: '0 8px 20px rgba(0,0,0,0.08)', overflow: 'hidden', position: 'relative', flexShrink: 0, border: '1px solid #e2e8f0' }}>
                                <MockupPreview
                                    mockupSrc={frontMockup || productImages[0]}
                                    maskSrc={frontMockup || productImages[0]}
                                    maskSize="contain"
                                    maskPosition="center"
                                    tshirtColor={tshirtColor}
                                    printArea={frontPrintArea}
                                    designSrc={frontDesign}
                                    originalPrintAreaPx={frontPrintAreaPx}
                                    areaScale={frontAreaScale}
                                    designScale={frontDesignScale}
                                    overallScale={pricingMockupScale}
                                />
                                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(255,255,255,0.9)', padding: '6px', textAlign: 'center', fontSize: '11px', fontWeight: '700', color: '#0d375b', borderTop: '1px solid #eee' }}>
                                    FRONT PREVIEW
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '30px' }}>
                        <button
                            onClick={() => submitProduct('Draft')}
                            style={{ padding: '10px 28px', borderRadius: '24px', border: '2px solid #ccc', background: 'white', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}
                        >
                            Save Draft
                        </button>

                        <button
                            onClick={() => submitProduct('Pending')}
                            style={(formData.title && formData.designDescription) ? { padding: '10px 40px', borderRadius: '24px', background: '#0d375b', color: 'white', fontWeight: '900', fontSize: '14px', cursor: 'pointer', boxShadow: '0 6px 14px rgba(13,55,91,0.3)' } : { padding: '10px 40px', borderRadius: '24px', background: '#94a3b8', color: 'white', fontWeight: '900', fontSize: '14px', cursor: 'not-allowed', opacity: 0.7 }}
                        >
                            Publish
                        </button>
                    </div>
                </div>
            </div>

            {showSuccessModal.show && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(13, 55, 91, 0.8)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
                    <div style={{ background: 'white', padding: '40px', borderRadius: '24px', width: '420px', textAlign: 'center', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
                        <div style={{ width: '60px', height: '60px', background: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
                            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#166534" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        </div>
                        <h2 style={{ color: '#0d375b', fontSize: '24px', fontWeight: '900', marginBottom: '10px' }}>Success!</h2>
                        <p style={{ color: '#64748b', fontSize: '16px', marginBottom: '25px', lineHeight: '1.5' }}>
                            {showSuccessModal.type === 'Draft'
                                ? "Your design draft is successfully stored in My Shop."
                                : "Your design is successfully sent for admin review."
                            }
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <button onClick={() => navigate('/my-shop')} style={{ padding: '12px', background: '#0d375b', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}>
                                Go to My Shop
                            </button>
                            <button onClick={() => navigate('/')} style={{ padding: '12px', background: 'transparent', color: '#64748b', border: 'none', borderRadius: '12px', fontWeight: '600', cursor: 'pointer', fontSize: '13px' }}>
                                Back to Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
};

const blueCardStyle: React.CSSProperties = { background: '#dfe9f5', padding: '16px 20px', borderRadius: '12px', marginBottom: '16px' };
const largeLabelStyle: React.CSSProperties = { display: 'block', fontWeight: '800', fontSize: '13px', marginBottom: '6px' };
const largeInputStyle: React.CSSProperties = { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '2px solid #cbd5e1', fontSize: '13px', fontWeight: '700', outline: 'none', boxSizing: 'border-box' };

type PrintArea = { top: string; left: string; width: string; height: string; rotation?: number };
type MockupPreviewProps = {
    mockupSrc: string;
    maskSrc: string;
    maskSize: string;
    maskPosition: string;
    tshirtColor: string;
    printArea?: PrintArea;
    designSrc?: string;
    originalPrintAreaPx?: { width: number; height: number } | null;
    editorMockupScale?: number;
    areaScale?: number;
    designScale?: number;
    overallScale?: number;
};

const MockupPreview = ({
    mockupSrc,
    maskSrc,
    maskSize,
    maskPosition,
    tshirtColor,
    printArea,
    designSrc,
    originalPrintAreaPx,
    areaScale = 1.0,
    designScale = 1.0,
    overallScale = 1.0
}: MockupPreviewProps) => {
    const containerRef = useRef<HTMLDivElement>(null);

    // 🚀 LOGIC CHECK: 
    // If designSrc is a full snapshot from our new capture logic, 
    // it will ALREADY contain the T-shirt and the design.
    // We check if printArea is missing – if so, we treat it as a full-image preview.
    const isFullSnapshot = designSrc && !printArea;

    if (isFullSnapshot) {
        return (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
                <img
                    src={designSrc}
                    alt="Final Product"
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
            </div>
        );
    }

    return (
        <div ref={containerRef} style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
            {/* Wrapper to scale the entire mockup (Shirt + Design) */}
            <div style={{ width: '100%', height: '100%', transform: `scale(${overallScale})`, transformOrigin: 'center center', position: 'relative' }}>
                {/* 1. Base Mockup Image */}
                <img src={mockupSrc} alt="Mockup" style={{ width: '100%', height: '100%', objectFit: 'contain', position: 'relative', zIndex: 1 }} />

                {/* 2. Color Overlay */}
                {tshirtColor && (
                    <div style={{
                        position: 'absolute',
                        top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: tshirtColor,
                        mixBlendMode: 'multiply',
                        WebkitMaskImage: `url(${maskSrc || mockupSrc})`,
                        maskImage: `url(${maskSrc || mockupSrc})`,
                        WebkitMaskSize: maskSize || 'contain',
                        WebkitMaskPosition: maskPosition || 'center',
                        WebkitMaskRepeat: 'no-repeat',
                        pointerEvents: 'none',
                        zIndex: 2
                    }}></div>
                )}

                {/* 3. Proportional Design Layer (Masked to T-shirt silhouette) */}
                {printArea && designSrc && (
                    <div style={{
                        position: 'absolute',
                        top: 0, left: 0, right: 0, bottom: 0,
                        WebkitMaskImage: `url(${maskSrc || mockupSrc})`,
                        maskImage: `url(${maskSrc || mockupSrc})`,
                        WebkitMaskSize: maskSize || 'contain',
                        WebkitMaskPosition: maskPosition || 'center',
                        WebkitMaskRepeat: 'no-repeat',
                        zIndex: 3,
                        pointerEvents: 'none'
                    }}>
                        <div style={{
                            position: 'absolute',
                            top: printArea.top,
                            left: printArea.left,
                            width: `calc(${printArea.width} * ${areaScale})`,
                            height: `calc(${printArea.height} * ${areaScale})`,
                            transform: `translate(-50%, -50%) rotate(${printArea.rotation || 0}deg)`,
                            transformOrigin: 'center center',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden'
                        }}>
                            <img
                                src={designSrc}
                                alt="Design"
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'contain',
                                    transform: `scale(${designScale})`,
                                    transformOrigin: 'center center'
                                }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductSubmission