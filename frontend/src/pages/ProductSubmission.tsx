import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill-new'; 
import 'react-quill-new/dist/quill.snow.css';

import Sidebar from '../components/Sidebar';
import '../styles/dashboard.css'; 

const API_URL = "http://localhost:5000";

// --- HELPERS ---
const VARIANT_COLORS = [
    { name: "White", hex: "#ffffff" },
    { name: "Black", hex: "#000000" },
    { name: "Athletic Heather", hex: "#cfcfcf" }, 
    { name: "Dark Grey", hex: "#555555" },
    { name: "Navy", hex: "#000080" },
    { name: "Red", hex: "#d32f2f" },
    { name: "Royal Blue", hex: "#1565c0" },
    { name: "Maroon", hex: "#800000" },
    { name: "Forest Green", hex: "#228b22" },
    { name: "Gold", hex: "#ffd700" },
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
        frontMockup = "/img/womenfront-mockup.png",
        frontPrintArea = { top: '50%', left: '50%', width: '25%', height: '40%', rotation: 0 },
        frontDesign = fallbackSnapshots.frontDesign || "",
        foldedMockup = "/img/mockups/folded.png",
        foldedMask = "/img/mockups/foldedmask.png",
        foldedMaskPosition = "center",
        foldedMaskSize = "contain",
        foldedPrintArea = { top: '56%', left: '46%', width: '36%', height: '42%', rotation: 5 },
        foldedDesign = fallbackSnapshots.foldedDesign || "",
        frontPrintAreaPx = fallbackSnapshots.frontPrintAreaPx || null,
        foldedPrintAreaPx = fallbackSnapshots.foldedPrintAreaPx || null,
    } = (location.state || {});

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
        allowUserCustomization: true,
        allowEditRequests: false,
        status: 'Pending'
    });

    const BASE_PRICE = 1200;
    const SERVICE_FEE = 100;
    const [finalPrice, setFinalPrice] = useState(0);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const markupValue = Number(formData.markup) || 0;
        setFinalPrice(BASE_PRICE + SERVICE_FEE + markupValue);
    }, [formData.markup]);


    const handleInputChange = (field: string, value: any) => {
        setFormData({ ...formData, [field]: value });
    };

   const submitProduct = async (submissionStatus: string) => {
        const storedUser = localStorage.getItem('userInfo');
        if (!storedUser) return alert("Please log in.");
        const { token } = JSON.parse(storedUser);

        let finalImage = productImages[0];

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
                    mockupImages: [finalImage],
                    canvasState: canvasState,
                    allowCustomization: formData.allowUserCustomization,
                    // 🟢 We set the status to 'Awaiting Payment' initially
                    status: 'Awaiting Payment' 
                })
            });

            const result = await response.json();

            if (response.ok) {
                // Remove temporary drafts
                localStorage.removeItem('temp_design_state');
                
                // 🟢 NAVIGATE TO CHECKOUT
                // We pass the product ID and the price so the checkout page knows what to bill
                navigate('/checkout', { 
                    state: { 
                        productId: result._id, // Ensure your backend returns the new product object
                        amount: finalPrice,
                        title: formData.title,
                        previewImage: productImages[0] // Pass the design snapshot
                    } 
                });
            } else {
                alert(result.message || "Failed to create product.");
            }
        } catch (err) { 
            console.error(err);
            alert("Server error."); 
        }
    };
    return (
        <div className="dashboard-container"> 
            <style>{`
                .main-content { padding-top: 48px !important; }
                .top-header {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 44px;
                    background: #0d375b;
                    z-index: 500;
                    box-sizing: border-box;
                    padding: 0 16px;
                }
                .header-left {
                    position: absolute;
                    left: 20px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    cursor: pointer;
                    color: white;
                }
                .top-header h2 {
                    margin: 0 !important;
                    text-align: center;
                    color: white !important;
                    font-size: 14px !important;
                    width: auto;
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
                        <img src="/img/back.png" alt="Back" className="nav-icon-small" style={{ width: '12px', height: '12px' }} />
                        <span style={{ fontSize: '10px', fontWeight: 'bold' }}>Back</span>
                    </div>
                    <h2>Submit Product</h2>
                </div>

                <div className="content-wrapper" style={{ marginTop: '20px', paddingBottom: '50px' }}>
                    
                    {/* PREVIEW SECTION */}
                    <div style={blueCardStyle}> 
                        <h2 style={{ color: '#0d375b', fontWeight: '800', marginBottom: '10px', fontSize: '22px' }}>{productType}</h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '700', fontSize: '14px', marginBottom: '20px' }}>
                            <span style={{ width: '16px', height: '16px', background: tshirtColor, borderRadius: '50%', border: '2px solid black' }}></span>
                            Color: {getColorName(tshirtColor)}
                        </div>

                        <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                            {/* Main image: front mockup + color + front design */}
                            <div style={{ width: '260px', height: '260px', background: 'white', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
                                <MockupPreview
                                    mockupSrc={frontMockup || productImages[0]}
                                    maskSrc={frontMockup || productImages[0]}
                                    maskSize="contain"
                                    maskPosition="center"
                                    tshirtColor={tshirtColor}
                                    printArea={frontPrintArea}
                                    designSrc={frontDesign}
                                    originalPrintAreaPx={frontPrintAreaPx}
                                />
                            </div>

                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                                <div>
                                    <div style={{ width: '90px', height: '90px', background: 'white', borderRadius: '10px', border: '1px solid #ddd', overflow: 'hidden' }}>
                                        <MockupPreview
                                            mockupSrc={frontMockup || productImages[0]}
                                            maskSrc={frontMockup || productImages[0]}
                                            maskSize="contain"
                                            maskPosition="center"
                                            tshirtColor={tshirtColor}
                                            printArea={frontPrintArea}
                                            designSrc={frontDesign}
                                        />
                                    </div>
                                    <div style={{ fontSize: '11px', marginTop: '6px', color: '#666', textAlign: 'center', fontWeight: '600' }}>Front</div>
                                </div>

                                <div>
                                    <div style={{ width: '90px', height: '90px', background: 'white', borderRadius: '10px', border: '1px solid #ddd', overflow: 'hidden' }}>
                                        <MockupPreview
                                            mockupSrc={productImages[1] || "/img/womenback-mockup.png"}
                                            maskSrc={productImages[1] || "/img/womenback-mockup.png"}
                                            maskSize="contain"
                                            maskPosition="center"
                                            tshirtColor={tshirtColor}
                                        />
                                    </div>
                                    <div style={{ fontSize: '11px', marginTop: '6px', color: '#666', textAlign: 'center', fontWeight: '600' }}>Back</div>
                                </div>

                                <div>
                                    <div style={{ width: '90px', height: '90px', background: 'white', borderRadius: '10px', border: '1px solid #ddd', overflow: 'hidden' }}>
                                        <MockupPreview
                                            mockupSrc={productImages[2] || "/img/mockups/collar.png"}
                                            maskSrc={productImages[2] || "/img/mockups/collar.png"}
                                            maskSize="contain"
                                            maskPosition="center"
                                            tshirtColor={tshirtColor}
                                        />
                                    </div>
                                    <div style={{ fontSize: '11px', marginTop: '6px', color: '#666', textAlign: 'center', fontWeight: '600' }}>Neck</div>
                                </div>

                                <div>
                                    <div style={{ width: '90px', height: '90px', background: 'white', borderRadius: '10px', border: '1px solid #ddd', overflow: 'hidden' }}>
                                        <MockupPreview
                                            mockupSrc={foldedMockup || productImages[3]}
                                            maskSrc={foldedMask || foldedMockup || productImages[3]}
                                            maskSize={foldedMaskSize || "contain"}
                                            maskPosition={foldedMaskPosition || "center"}
                                            tshirtColor={tshirtColor}
                                            printArea={foldedPrintArea}
                                            designSrc={foldedDesign}
                                        />
                                    </div>
                                    <div style={{ fontSize: '11px', marginTop: '6px', color: '#666', textAlign: 'center', fontWeight: '600' }}>Folded</div>
                                </div>
                            </div>
                        </div>
                    </div>

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
                        <h3 style={{ color: '#0d375b' }}>Pricing Setup</h3>
                        
                        <div className="price-item">
                            <span>Base Price <small style={{fontSize:'11px', color:'#666'}}>(Fixed Production Cost)</small></span>
                            <span>:</span>
                            <span style={{ fontWeight: '800' }}>LKR {BASE_PRICE}</span>
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
                            <span>Service Fee <small style={{fontSize:'11px', color:'#666'}}>(Platform Hosting)</small></span>
                            <span>:</span>
                            <span style={{ fontWeight: '800' }}>LKR {SERVICE_FEE}</span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '200px 20px 1fr', gap: '10px', marginTop: '20px', borderTop: '1px solid #cbd5e1', paddingTop: '20px' }}>
                            <strong style={{ color: '#0d375b', fontSize: '16px' }}>Final Selling Price</strong>
                            <strong style={{ fontSize: '16px' }}>:</strong>
                            <strong className="final-price-text">LKR {finalPrice}</strong>
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
                            style={{ padding: '10px 40px', borderRadius: '24px', background: '#0d375b', color: 'white', fontWeight: '900', fontSize: '14px', cursor: 'pointer', boxShadow: '0 6px 14px rgba(13,55,91,0.3)' }}
                        >
                            Publish
                        </button>
                    </div>
                </div>
            </div>

            {showModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
                    <div style={{ background: 'white', padding: '60px', borderRadius: '30px', textAlign: 'center' }}>
                        <h2>Success!</h2>
                        <button onClick={() => navigate('/designer-dashboard')} style={{ padding: '15px 45px', background: '#0d375b', color: 'white', border: 'none', borderRadius: '30px' }}>Back to Dashboard</button>
                    </div>
                </div>
            )}
        </div>
    );
};

const blueCardStyle: React.CSSProperties = { background: '#dfe9f5', padding: '28px', borderRadius: '20px', marginBottom: '24px' };
const largeLabelStyle: React.CSSProperties = { display: 'block', fontWeight: '800', fontSize: '15px', marginBottom: '8px' };
const largeInputStyle: React.CSSProperties = { width: '100%', padding: '12px 14px', borderRadius: '10px', border: '2px solid #cbd5e1', fontSize: '14px', fontWeight: '700', outline: 'none', boxSizing: 'border-box' };

type PrintArea = { top: string; left: string; width: string; height: string; rotation?: number };
type MockupPreviewProps = {
    mockupSrc: string;
    maskSrc: string;
    maskSize: string;
    maskPosition: string;
    tshirtColor: string;
    printArea?: PrintArea;
    designSrc?: string;
};

const MockupPreview = ({
    mockupSrc,
    maskSrc,
    maskSize,
    maskPosition,
    tshirtColor,
    printArea,
    designSrc,
    // 🟢 New prop to help with math
    originalPrintAreaPx 
}: any) => {
    const containerRef = React.useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);

    useEffect(() => {
        if (containerRef.current && originalPrintAreaPx) {
            // Calculate how much smaller this container is compared to the original
            // We compare the width of the current container * printArea % to the original PX width
            const currentContainerWidth = containerRef.current.offsetWidth;
            const currentPrintAreaWidthPx = currentContainerWidth * (parseFloat(printArea.width) / 100);
            
            const factor = currentPrintAreaWidthPx / originalPrintAreaPx.width;
            setScale(factor);
        }
    }, [originalPrintAreaPx, printArea]);

    return (
        <div ref={containerRef} style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
            {/* 1. Base Mockup Image */}
            <img src={mockupSrc} alt="Mockup" style={{ width: '100%', height: '100%', objectFit: 'contain', position: 'relative', zIndex: 1 }} />
            
            {/* 2. Color Layer with Mask */}
            <div style={{
                position: 'absolute', inset: 0,
                backgroundColor: tshirtColor || '#ffffff',
                WebkitMaskImage: `url(${maskSrc})`, maskImage: `url(${maskSrc})`,
                WebkitMaskSize: maskSize || 'contain', maskSize: maskSize || 'contain',
                WebkitMaskPosition: maskPosition || 'center', maskPosition: maskPosition || 'center',
                WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat',
                mixBlendMode: 'multiply', zIndex: 2, pointerEvents: 'none'
            }} />

            {/* 3. Proportional Design Layer */}
            {printArea && designSrc && (
                <div style={{
                    position: 'absolute',
                    top: printArea.top,
                    left: printArea.left,
                    width: printArea.width,
                    height: printArea.height,
                    transform: `translate(-50%, -50%) rotate(${printArea.rotation || 0}deg)`,
                    zIndex: 3,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <img 
                        src={designSrc} 
                        alt="Design" 
                        style={{ 
                            // 🟢 This is the secret: The design inside the area 
                            // is scaled by the difference in container sizes
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain'
                        }} 
                    />
                </div>
            )}
        </div>
    );
};

export default ProductSubmission;
