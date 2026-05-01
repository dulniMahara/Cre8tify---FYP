import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Footer from '../components/Footer';
import Header from '../components/Header';

const RequestEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // 🟢 1. DATA RECOVERY
    const { product: passedProduct, selectedColor, selectedSize } = location.state || {};

    const [product, setProduct] = useState<any>(passedProduct || null);
    const [currentColor] = useState(selectedColor || '#FFFFFF');
    const [currentSize] = useState(selectedSize || 'M');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    // 🟢 FORM STATE
    const [formData, setFormData] = useState({
        preferredChanges: '',
        preferredTime: '',
        extraNote: ''
    });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    // 🚀 Scroll to top
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        if (!passedProduct) {
            // If user refreshes, we might need to fetch or redirect
            // For now, use a fallback mock or stay with the ID
            console.log("No passed product data found in state.");
        }
    }, [passedProduct]);

    // 🟢 HANDLERS
    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLSelectElement | HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleUploadClick = () => fileInputRef.current?.click();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleSubmit = async () => {
        if (!formData.preferredChanges.trim() || !formData.preferredTime) {
            alert("Please fill in the required fields (Changes and Preferred Time).");
            return;
        }

        setStatus('loading');
        
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
            
            // Helper to convert File to Base64
            const toBase64 = (file: File) => new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = error => reject(error);
            });

            let base64File = null;
            if (selectedFile) {
                base64File = await toBase64(selectedFile);
            }

            const requestPayload = {
                productId: product?._id || product?.id,
                productName: product?.title || 'Custom T-shirt',
                productImage: product?.baseImages?.[0] || '/img/womenfront-mockup.png',
                customer: userInfo.name || 'Customer',
                customerId: userInfo._id,
                message: formData.preferredChanges,
                preferredTime: formData.preferredTime,
                extraNote: formData.extraNote,
                color: currentColor,
                referenceImage: base64File,
                status: 'Pending',
                frontDesign: product?.frontDesign,
                frontPrintArea: product?.frontPrintArea ? JSON.stringify(product.frontPrintArea) : null
            };

            const response = await fetch('http://localhost:5000/api/requests', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestPayload),
            });

            if (response.ok) {
                setStatus('success');
            } else {
                throw new Error('Failed to submit request');
            }
        } catch (err) {
            console.error("Submission error:", err);
            setStatus('error');
        }
    };

    // Helper for color name
    const colorNames: any = {
        '#FFFFFF': 'White', '#8fa749': 'Kiwi', '#fadfa6': 'Yellow Haze',
        '#f7ef8f': 'Cornsilk', '#d6e6f7': 'Light Blue', '#fee0eb': 'Light Pink',
        '#2C2C2C': 'Charcoal', '#F0E68C': 'Khaki', '#E0FFFF': 'Baby Blue',
        '#E6E6FA': 'Lavender', '#F5F5DC': 'Beige', '#808080': 'Standard Grey',
        '#C0C0C0': 'Silver', '#FFA07A': 'Light Salmon', '#87CEFA': 'Sky Blue',
        '#AFEEEE': 'Pale Turquoise', '#DDA0DD': 'Plum Light', '#98FB98': 'Mint Green'
    };

    return (
        <div style={pageWrapper}>
            <Header mode="title" title="" userRole="customer" />
            
            <div className="content-wrapper" style={mainContent}>
                <div style={headerSection}>
                    <div style={backBtn} onClick={() => navigate(-1)}>
                        <img src="/img/back.png" alt="Back" style={{ width: '16px', marginRight: '6px', filter: 'invert(0.4)' }} />
                        <span>Back</span>
                    </div>
                    <h1 style={pageTitle}>Request Designer Edit</h1>
                    <p style={pageSubtitle}>Collaborate with the creator to refine this design exactly how you want it.</p>
                </div>

                <div style={layoutGrid}>
                    {/* LEFT COLUMN: Product Preview */}
                    <div style={leftColumn}>
                        <div style={disclaimerBox}>
                            Your request will be sent to <strong>{product?.shopName || "the designer"}</strong>.
                        </div>
                        
                        <div style={imageContainer}>
                            <div style={{
                                width: '100%', height: '100%',
                                backgroundColor: currentColor,
                                WebkitMaskImage: `url(${product?.baseImages?.[0] || '/img/womenfront-mockup.png'})`,
                                maskImage: `url(${product?.baseImages?.[0] || '/img/womenfront-mockup.png'})`,
                                WebkitMaskSize: 'contain', maskSize: 'contain', 
                                WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat', 
                                WebkitMaskPosition: 'center', maskPosition: 'center',
                                position: 'relative',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <img src={product?.baseImages?.[0] || '/img/womenfront-mockup.png'} alt="Mockup" 
                                    style={{ width: '100%', height: '100%', objectFit: 'contain', mixBlendMode: 'multiply', filter: 'contrast(1.0) brightness(0.95) saturate(0)' }} 
                                />

                                {/* Design Overlay */}
                                {product?.frontDesign && (
                                    <div style={{
                                        position: 'absolute',
                                        ...(product?.frontPrintArea || { top: '50%', left: '51%', width: '30%', height: '27%' }),
                                        transform: 'translate(-50%, -50%)',
                                        zIndex: 999, pointerEvents: 'none'
                                    }}>
                                        <img src={product.frontDesign} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="Design" />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div style={textDetailsContainer}>
                            <h2 style={productTitle}>{product?.title}</h2>
                            <p style={designerSub}>{product?.shopName || "Artisa Studio"}</p>
                            <p style={priceHighlight}>{product?.price?.startsWith('LKR') ? product.price : `LKR ${product?.price?.toLocaleString()}.00`}</p>
                            
                            <div style={selectionBadgeContainer}>
                                <div style={selectionBadge}>
                                    <span>Color:</span>
                                    <span style={{ ...colorCircle, background: currentColor }}></span>
                                    <span style={{fontSize: '11px'}}>{colorNames[currentColor] || 'Custom'}</span>
                                </div>
                                <div style={selectionBadge}>
                                    <span>Size:</span>
                                    <span style={{fontWeight: '800'}}>{currentSize}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Request Form */}
                    <div style={formCard}>
                        <h2 style={formHeader}>Request Form</h2>
                        
                        <div style={fieldGroup}>
                            <label style={fieldLabel}>Preferred Changes</label>
                            <textarea 
                                name="preferredChanges"
                                style={textArea} 
                                value={formData.preferredChanges}
                                onChange={handleInputChange}
                                placeholder="Example: Could you change the text color to gold and move it slightly higher?"
                            />
                        </div>

                        <div style={fieldRow}>
                            <div style={{ flex: 1 }}>
                                <label style={fieldLabel}>Preferred Delivery Time</label>
                                <select name="preferredTime" style={selectInput} value={formData.preferredTime} onChange={handleInputChange}>
                                    <option value="">Select timeframe</option>
                                    <option value="1-2 Days">Express (1-2 Days)</option>
                                    <option value="3-5 Days">Standard (3-5 Days)</option>
                                </select>
                                <p style={fieldHint}>Designer may adjust this based on complexity.</p>
                            </div>
                        </div>

                        <div style={fieldGroup}>
                            <label style={fieldLabel}>Reference Image (Optional)</label>
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} accept=".jpg,.png,.pdf" />
                            <div style={uploadZone} onClick={handleUploadClick}>
                                {selectedFile ? (
                                    <span style={{color: '#2ecc71', fontWeight: '800'}}>✓ {selectedFile.name}</span>
                                ) : (
                                    <div style={{display: 'flex', flexDirection: 'column', gap: '5px'}}>
                                        <span style={{fontSize: '18px'}}>📤</span>
                                        <span style={{fontSize: '12px'}}>Upload or drag inspiration image (JPG, PNG)</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div style={fieldGroup}>
                            <label style={fieldLabel}>Additional Comments</label>
                            <input name="extraNote" type="text" style={textInput} value={formData.extraNote} onChange={handleInputChange} placeholder="Anything else we should know?" />
                        </div>

                        <button 
                            style={{
                                ...sendRequestBtn,
                                opacity: status === 'loading' ? 0.7 : 1,
                                cursor: status === 'loading' ? 'not-allowed' : 'pointer'
                            }} 
                            onClick={handleSubmit}
                            disabled={status === 'loading'}
                        >
                            {status === 'loading' ? 'Processing...' : 'Submit Request'}
                        </button>
                    </div>
                </div>
            </div>

            {/* FEEDBACK MODALS */}
            {(status === 'success' || status === 'error') && (
                <div style={modalOverlay}>
                    <div style={modalContent}>
                        <div style={{ fontSize: '40px', marginBottom: '15px' }}>
                            {status === 'error' && '⚠️'}
                        </div>
                        <h2 style={{ fontSize: '22px', fontWeight: '900', color: '#0d375b', margin: '0 0 10px 0' }}>
                            {status === 'success' ? 'Request Sent!' : 'Oops! Failed'}
                        </h2>
                        <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 25px 0', lineHeight: '1.6' }}>
                            {status === 'success' 
                                ? 'The designer will review your request shortly. Keep an eye on your "Requests" tab for updates.' 
                                : 'We encountered an error. Please check your connection and try again.'}
                        </p>
                        <button 
                            style={status === 'success' ? successBtn : errorBtn}
                            onClick={() => {
                                if (status === 'success') navigate('/customer-requests');
                                else setStatus('idle');
                            }}
                        >
                            {status === 'success' ? 'Go to Requests' : 'Try Again'}
                        </button>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
};

// --- SCALED STYLES FOR 100% ZOOM ---
const pageWrapper: React.CSSProperties = { background: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column' };
const mainContent: React.CSSProperties = { padding: '10px 40px 60px', flex: 1, maxWidth: '1100px', margin: '0 auto', width: '100%' };

const headerSection: React.CSSProperties = { textAlign: 'center', marginBottom: '25px' };
const backBtn: React.CSSProperties = { display: 'flex', alignItems: 'center', cursor: 'pointer', fontWeight: 700, color: '#64748b', fontSize: '13px', position: 'absolute', top: '25px', left: '40px' };
const pageTitle: React.CSSProperties = { fontSize: '28px', fontWeight: 900, color: '#1e293b', margin: '0 0 6px 0' };
const pageSubtitle: React.CSSProperties = { fontSize: '14px', color: '#64748b', margin: 0 };

const layoutGrid: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '40px', alignItems: 'start' };

const leftColumn: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '15px' };
const disclaimerBox: React.CSSProperties = { background: '#ebf5ff', border: '1px solid #bae6fd', color: '#0369a1', fontSize: '12px', padding: '10px 15px', borderRadius: '10px', textAlign: 'center' };
const imageContainer: React.CSSProperties = { width: '100%', aspectRatio: '1/1', background: 'white', borderRadius: '16px', border: '1.5px solid #e2e8f0', padding: '20px', overflow: 'hidden' };

const textDetailsContainer: React.CSSProperties = { padding: '0 5px' };
const productTitle: React.CSSProperties = { fontSize: '22px', fontWeight: 900, color: '#1e293b', margin: '0 0 2px 0' };
const designerSub: React.CSSProperties = { fontSize: '13px', color: '#64748b', fontStyle: 'italic', margin: '0 0 10px 0' };
const priceHighlight: React.CSSProperties = { fontSize: '20px', fontWeight: 900, color: '#ef4444', margin: '0 0 15px 0' };

const selectionBadgeContainer: React.CSSProperties = { display: 'flex', gap: '10px' };
const selectionBadge: React.CSSProperties = { background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '6px 12px', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' };
const colorCircle: React.CSSProperties = { width: '12px', height: '12px', borderRadius: '50%', border: '1px solid #e2e8f0' };

const formCard: React.CSSProperties = { background: 'white', border: '1.5px solid #e2e8f0', borderRadius: '20px', padding: '30px', boxShadow: '0 10px 25px rgba(0,0,0,0.03)' };
const formHeader: React.CSSProperties = { fontSize: '20px', fontWeight: 900, color: '#0d375b', marginBottom: '25px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' };
const fieldGroup: React.CSSProperties = { marginBottom: '20px' };
const fieldRow: React.CSSProperties = { display: 'flex', gap: '20px', marginBottom: '20px' };
const fieldLabel: React.CSSProperties = { display: 'block', fontSize: '14px', fontWeight: 800, color: '#334155', marginBottom: '8px' };

const textArea: React.CSSProperties = { width: '100%', height: '100px', padding: '12px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '13px', background: '#f8fafc', resize: 'none' };
const selectInput: React.CSSProperties = { width: '100%', padding: '10px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '13px', background: '#f8fafc', fontWeight: '600' };
const textInput: React.CSSProperties = { width: '100%', padding: '12px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '13px', background: '#f8fafc' };
const fieldHint: React.CSSProperties = { fontSize: '11px', color: '#94a3b8', marginTop: '5px', fontStyle: 'italic' };
const uploadZone: React.CSSProperties = { width: '100%', padding: '25px', border: '2px dashed #bae6fd', borderRadius: '12px', background: '#f0f9ff', textAlign: 'center', cursor: 'pointer', transition: '0.2s' };
const sendRequestBtn: React.CSSProperties = { width: '100%', padding: '14px', background: '#0d375b', color: 'white', border: 'none', borderRadius: '30px', fontSize: '15px', fontWeight: 900, marginTop: '10px', transition: '0.2s' };

const modalOverlay: React.CSSProperties = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 };
const modalContent: React.CSSProperties = { background: 'white', padding: '35px', borderRadius: '24px', width: '400px', textAlign: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.2)' };
const successBtn: React.CSSProperties = { width: '100%', padding: '12px', background: '#0d375b', color: 'white', border: 'none', borderRadius: '25px', fontSize: '14px', fontWeight: 900, cursor: 'pointer' };
const errorBtn: React.CSSProperties = { ...successBtn, background: '#ef4444' };

export default RequestEdit;