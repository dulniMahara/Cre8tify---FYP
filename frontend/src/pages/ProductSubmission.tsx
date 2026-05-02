import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

import Sidebar from '../components/Sidebar';
import '../styles/dashboard.css';

const API_URL = "http://localhost:5000";

// --- INTERFACES ---
interface TextConfig {
    id: number;
    text: string;
    font: string;
    color: string;
    styleId?: string;
    type?: 'arc' | 'wave' | 'circle' | 'straight' | 'upward';
    zIndex: number;
    x: number;
    y: number;
    scale: number;
    rotation: number;
    letterSpacing?: number;
    curve?: number;
}

interface ImageLayer {
    id: number;
    src: string;
    zIndex: number;
    x: number;
    y: number;
    scale: number;
    rotation: number;
    flipX: boolean;
    flipY: boolean;
}

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

        // Design Snapshots
        frontDesign = location.state?.frontDesign || fallbackSnapshots.frontDesign || "",
        backDesign = location.state?.backDesign || fallbackSnapshots.backDesign || "",
        neckDesign = location.state?.neckDesign || fallbackSnapshots.neckDesign || "",
        foldedDesign = location.state?.foldedDesign || fallbackSnapshots.foldedDesign || "",

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
        originalDesign,
        category = 'Unisex',
        canvasState: passedCanvasState
    } = (location.state || {});

    // Ensure canvasState is never undefined
    const canvasState = passedCanvasState || { imageLayers: [], textLayers: [] };

    // 🚀 ADJUST THIS LINE to change the size of the T-shirt in the Pricing Setup box
    const pricingMockupScale = 1.5;

    // 🚀 Manually increased design dimensions and shifted position to top-right
    const submitPageFrontPrintArea = {
        ...frontPrintArea,
        width: '112%',
        height: '108%',
        top: '50%',
        left: '50%',
        rotation: 0
    };

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

    const getCleanDescription = (fullDesc?: string) => {
        if (!fullDesc) return '';
        const adminSpecsHtml = ADMIN_SPECS + "<br/>";
        if (fullDesc.includes(adminSpecsHtml)) {
            return fullDesc.split(adminSpecsHtml)[1] || '';
        } else if (fullDesc.includes(ADMIN_SPECS)) {
            return fullDesc.split(ADMIN_SPECS)[1] || '';
        }
        return fullDesc;
    };

    const [formData, setFormData] = useState({
        title: originalDesign?.title || '',
        designDescription: getCleanDescription(originalDesign?.description),
        markup: originalDesign?.markup || 0,
        allowCustomization: originalDesign?.allowCustomization || false,
        allowEditRequests: originalDesign?.allowEditRequests || false,
        status: originalDesign?.status || 'Pending'
    });

    const BASE_PRICE = 1200;
    const SERVICE_FEE = 100;
    const [finalPrice, setFinalPrice] = useState(0);
    const [showSuccessModal, setShowSuccessModal] = useState({ show: false, type: 'Draft' });
    const [isSubmitting, setIsSubmitting] = useState(false);

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
        setIsSubmitting(true);
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
                    category: category,
                    markup: formData.markup,
                    price: finalPrice,
                    mockupImages: [thumbnailImage, ...productImages.slice(1)],
                    canvasState: canvasState,
                    tshirtColor: tshirtColor,
                    allowCustomization: formData.allowCustomization,
                    allowEditRequests: formData.allowEditRequests,
                    status: submissionStatus,
                    frontDesign: frontDesign,
                    frontPrintArea: submitPageFrontPrintArea,
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
            setIsSubmitting(false);
        } catch (err) {
            console.error(err);
            setIsSubmitting(false);
            alert("Error connecting to server.");
        }
    };

    // 🟢 PREMIUM LOADING OVERLAY
    const LoadingOverlay = () => (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(8px)',
            zIndex: 9999, display: 'flex', flexDirection: 'column',
            justifyContent: 'center', alignItems: 'center',
            transition: 'opacity 0.3s ease'
        }}>
            <div style={{
                width: '60px', height: '60px', border: '4px solid #0d375b',
                borderTop: '4px solid transparent', borderRadius: '50%',
                animation: 'spin 1s linear infinite', marginBottom: '20px'
            }}></div>
            <h2 style={{ color: '#0d375b', fontWeight: '900', letterSpacing: '-0.5px', animation: 'pulse 2s ease-in-out infinite' }}>
                Finalizing your masterpiece...
            </h2>
            <p style={{ color: '#64748b', fontSize: '14px', marginTop: '8px' }}>Uploading high-resolution design assets</p>
            <style>{`
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
            `}</style>
        </div>
    );

    return (
        <div className="dashboard-container" style={{ background: '#f8fafc' }}>
            {isSubmitting && <LoadingOverlay />}
            <Sidebar />
            <div className="main-content">
                <style>{`
                    .main-content { padding-top: 60px !important; }
                    .top-header {
                        display: flex; align-items: center; justify-content: center;
                        position: fixed; top: 0; left: 200px; right: 0; height: 50px;
                        background: #0d375b; z-index: 2000; box-sizing: border-box;
                        padding: 0 20px; border-left: 1px solid #0d375b; shadow: 0 2px 5px rgba(0,0,0,0.1);
                    }
                    .header-left { position: absolute; left: 20px; display: flex; align-items: center; gap: 10px; cursor: pointer; color: white; }
                    .top-header h2 { margin: 0; color: white; font-size: 16px; font-weight: 700; }
                    .price-item { display: grid; grid-template-columns: 240px 20px 1fr; gap: 10px; align-items: center; font-size: 15px; margin-bottom: 18px; font-weight: 600; }
                    .final-price-text { font-size: 28px; font-weight: 900; color: #0d375b; }
                    .admin-specs-box { background: #f1f5f9; padding: 14px; border-radius: 10px 10px 0 0; border: 1px solid #cbd5e1; border-bottom: none; font-size: 13px; color: #475569; }
                `}</style>

                <div className="top-header">
                    <div className="header-left" onClick={() => navigate('/design-tool', {
                        state: {
                            isEdit: true,
                            savedLayers: canvasState,
                            selectedTshirtColor: tshirtColor,
                            product: originalDesign || { name: productType }
                        }
                    })}>
                        <img src="/img/back.png" alt="Back" style={{ width: '14px', filter: 'invert(1)' }} />
                        <span style={{ fontWeight: 'bold' }}>Back to Editor</span>
                    </div>
                    <h2>Submit Product</h2>
                </div>

                <div className="content-wrapper" style={{ marginTop: '20px', paddingBottom: '50px' }}>
                    <div style={blueCardStyle}>
                        <h3 style={{ color: '#0d375b', marginBottom: '15px' }}>Product Portfolio Details</h3>
                        <label style={largeLabelStyle}>Title</label>
                        <input type="text" value={formData.title} onChange={(e) => handleInputChange('title', e.target.value)} style={largeInputStyle} placeholder="Enter a title..." />
                        <label style={{ ...largeLabelStyle, marginTop: '20px' }}>Description</label>
                        <div className="admin-specs-box" dangerouslySetInnerHTML={{ __html: ADMIN_SPECS }} />
                        <div style={{ background: 'white', borderRadius: '0 0 10px 10px', border: '1px solid #cbd5e1', overflow: 'hidden' }}>
                            <ReactQuill theme="snow" value={formData.designDescription} onChange={(val: string) => handleInputChange('designDescription', val)} />
                        </div>
                    </div>

                    <div style={blueCardStyle}>
                        <h3 style={{ color: '#0d375b', marginBottom: '15px' }}>Design Personalization Policy</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                            {/* Option 1: Live Customization */}
                            <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                                <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px' }}>
                                    <input type="checkbox" checked={formData.allowCustomization} onChange={(e) => handleInputChange('allowCustomization', e.target.checked)} style={{ opacity: 0, width: 0, height: 0 }} />
                                    <span style={{ position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: formData.allowCustomization ? '#0d375b' : '#ccc', transition: '.4s', borderRadius: '34px' }}></span>
                                    <span style={{ position: 'absolute', content: '""', height: '18px', width: '18px', left: formData.allowCustomization ? '23px' : '3px', bottom: '3px', backgroundColor: 'white', transition: '.4s', borderRadius: '50%' }}></span>
                                </label>
                                <div>
                                    <div style={{ fontWeight: '700', fontSize: '14px' }}>Allow User Customization</div>
                                    <div style={{ color: '#555', fontSize: '12px' }}>Users can use the Live Editor for small edits.</div>
                                </div>
                            </div>

                            {/* Option 2: Edit Requests */}
                            <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                                <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px' }}>
                                    <input type="checkbox" checked={formData.allowEditRequests} onChange={(e) => handleInputChange('allowEditRequests', e.target.checked)} style={{ opacity: 0, width: 0, height: 0 }} />
                                    <span style={{ position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: formData.allowEditRequests ? '#0d375b' : '#ccc', transition: '.4s', borderRadius: '34px' }}></span>
                                    <span style={{ position: 'absolute', content: '""', height: '18px', width: '18px', left: formData.allowEditRequests ? '23px' : '3px', bottom: '3px', backgroundColor: 'white', transition: '.4s', borderRadius: '50%' }}></span>
                                </label>
                                <div>
                                    <div style={{ fontWeight: '700', fontSize: '14px' }}>Allow Designer-Handled Edit Requests</div>
                                    <div style={{ color: '#555', fontSize: '12px' }}>Users can request custom edits through you.</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={blueCardStyle}>
                        <div style={{ display: 'flex', gap: '40px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                            <div style={{ flex: 1 }}>
                                <h3 style={{ color: '#0d375b', marginBottom: '20px' }}>Pricing Setup</h3>
                                <div className="price-item"><span>Base Price</span><span>:</span><span style={{ fontWeight: '800' }}>{formatPrice(BASE_PRICE)}</span></div>
                                <div className="price-item">
                                    <span>Designer Markup</span><span>:</span>
                                    <div style={{ display: 'flex', alignItems: 'center', border: '2px solid #0d375b', borderRadius: '8px', padding: '8px 12px', width: '160px', background: 'white' }}>
                                        <span style={{ marginRight: '6px', fontWeight: 'bold' }}>LKR</span>
                                        <input type="number" value={formData.markup} onChange={(e) => handleInputChange('markup', e.target.value)} style={{ border: 'none', outline: 'none', width: '100%', fontWeight: '800' }} />
                                    </div>
                                </div>
                                <div className="price-item"><span>Service Fee</span><span>:</span><span style={{ fontWeight: '800' }}>{formatPrice(SERVICE_FEE)}</span></div>
                                <div style={{ display: 'grid', gridTemplateColumns: '200px 20px 1fr', gap: '10px', marginTop: '20px', borderTop: '1px solid #cbd5e1', paddingTop: '20px' }}>
                                    <strong style={{ color: '#0d375b' }}>Final Selling Price</strong><strong>:</strong><strong className="final-price-text">{formatPrice(finalPrice)}</strong>
                                </div>
                            </div>

                            <div style={{ width: '220px', height: '265px', background: 'white', borderRadius: '16px', overflow: 'hidden', position: 'relative', border: '1px solid #e2e8f0' }}>
                                <MockupPreview
                                    mockupSrc={frontMockup}
                                    maskSrc={frontMockup}
                                    tshirtColor={tshirtColor}
                                    printArea={submitPageFrontPrintArea}
                                    designSrc={frontDesign}
                                    overallScale={pricingMockupScale}
                                />
                                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(255,255,255,0.9)', padding: '6px', textAlign: 'center', fontSize: '11px', fontWeight: '700', color: '#0d375b', borderTop: '1px solid #eee' }}>FRONT PREVIEW</div>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '30px' }}>
                        <button
                            disabled={isSubmitting}
                            onClick={() => submitProduct('Draft')}
                            style={{ padding: '10px 28px', borderRadius: '24px', border: '2px solid #ccc', background: 'white', fontWeight: 'bold', cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.7 : 1 }}
                        >
                            {isSubmitting ? "..." : "Save Draft"}
                        </button>
                        <button
                            disabled={isSubmitting || !formData.title}
                            onClick={() => submitProduct('Pending')}
                            style={{
                                padding: '10px 40px', borderRadius: '24px',
                                background: (formData.title && !isSubmitting) ? '#0d375b' : '#94a3b8',
                                color: 'white', fontWeight: '900',
                                cursor: (formData.title && !isSubmitting) ? 'pointer' : 'not-allowed',
                                display: 'flex', alignItems: 'center', gap: '8px'
                            }}
                        >
                            {isSubmitting && <div style={{ width: '14px', height: '14px', border: '2px solid #fff', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>}
                            {isSubmitting ? "Publishing..." : "Publish"}
                        </button>
                    </div>
                </div>
            </div>

            {showSuccessModal.show && (
                <div style={{
                    position: 'fixed', inset: 0,
                    backgroundColor: 'rgba(13, 55, 91, 0.7)',
                    backdropFilter: 'blur(8px)',
                    zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    animation: 'fadeIn 0.3s ease-out'
                }}>
                    <div style={{
                        background: 'white', padding: '40px', borderRadius: '32px',
                        width: '400px', textAlign: 'center',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                        animation: 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}>
                        <style>{`
                            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                            @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                        `}</style>

                        <div style={{
                            width: '80px', height: '80px', background: '#dcfce7',
                            borderRadius: '50%', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', margin: '0 auto 24px'
                        }}>
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                        </div>

                        <h2 style={{
                            color: '#0d375b', fontSize: '32px', fontWeight: '900',
                            marginBottom: '12px', fontFamily: '"Outfit", sans-serif',
                            letterSpacing: '-1px'
                        }}>Success!</h2>

                        <p style={{
                            color: '#475569', fontSize: '16px', fontWeight: '500',
                            marginBottom: '32px', lineHeight: '1.5'
                        }}>
                            {showSuccessModal.type === 'Draft'
                                ? "Your draft has been saved successfully. You can find it in your shop portfolio."
                                : "Your design has been submitted for review. We'll notify you once it's live!"}
                        </p>

                        <button
                            onClick={() => navigate('/my-shop')}
                            style={{
                                padding: '16px', background: '#0d375b', color: 'white',
                                border: 'none', borderRadius: '16px', width: '100%',
                                cursor: 'pointer', fontSize: '16px', fontWeight: '800',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                boxShadow: '0 4px 12px rgba(13, 55, 91, 0.25)'
                            }}
                            onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(13, 55, 91, 0.3)'; }}
                            onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(13, 55, 91, 0.25)'; }}
                        >
                            Go to My Shop
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

const MockupPreview = ({ mockupSrc, maskSrc, tshirtColor, designSrc, printArea, overallScale }: any) => {
    return (
        <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
            <div style={{ width: '100%', height: '100%', transform: `scale(${overallScale || 1})`, transformOrigin: 'center center', position: 'relative' }}>
                <img src={mockupSrc} alt="Shirt" style={{ width: '100%', height: '100%', objectFit: 'contain', position: 'absolute' }} />
                {tshirtColor && (
                    <div style={{
                        position: 'absolute', inset: 0, backgroundColor: tshirtColor, mixBlendMode: 'multiply',
                        WebkitMaskImage: `url(${maskSrc || mockupSrc})`, maskImage: `url(${maskSrc || mockupSrc})`,
                        WebkitMaskSize: 'contain', WebkitMaskPosition: 'center', WebkitMaskRepeat: 'no-repeat', zIndex: 2
                    }}></div>
                )}
                {printArea && designSrc && (
                    <div style={{
                        position: 'absolute', inset: 0, zIndex: 10, pointerEvents: 'none',
                        WebkitMaskImage: `url(${maskSrc || mockupSrc})`, maskImage: `url(${maskSrc || mockupSrc})`,
                        WebkitMaskSize: 'contain', WebkitMaskPosition: 'center', WebkitMaskRepeat: 'no-repeat',
                    }}>
                        <div style={{
                            position: 'absolute', top: printArea.top, left: printArea.left,
                            width: printArea.width, height: printArea.height,
                            transform: `translate(-50%, -50%) rotate(${printArea.rotation || 0}deg)`,
                            transformOrigin: 'center center', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'
                        }}>
                            <img src={designSrc} alt="Design" style={{ width: '100%', height: '100%', objectFit: 'contain', mixBlendMode: (tshirtColor.toLowerCase() !== '#ffffff') ? 'multiply' : 'normal' }} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const blueCardStyle: React.CSSProperties = { background: '#dfe9f5', padding: '16px 20px', borderRadius: '12px', marginBottom: '16px' };
const largeLabelStyle: React.CSSProperties = { display: 'block', fontWeight: '800', fontSize: '13px', marginBottom: '6px' };
const largeInputStyle: React.CSSProperties = { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '2px solid #cbd5e1', fontSize: '13px', fontWeight: '700', outline: 'none', boxSizing: 'border-box' };

export default ProductSubmission;