import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Footer from '../components/Footer';

const RequestEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { product: passedProduct, selectedColor, selectedSize, selectedImage } = location.state || {};

    const [product, setProduct] = useState<any>(passedProduct || null);
    const [currentColor] = useState(selectedColor || '#E5D3C0');
    const [currentSize] = useState(selectedSize || 'M');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    // 🟢 FORM STATE
    const [formData, setFormData] = useState({
        preferredChanges: '',
        preferredTime: '',
        extraNote: ''
    });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    useEffect(() => {
        if (!passedProduct) {
            const mockProduct = {
                id: id,
                title: "Evangelon Anime T-shirt",
                designer: "Artisa LK",
                price: 1800,
                baseImages: ["/img/mockups/shop1_base_front.png"]
            };
            setProduct(mockProduct);
        }
    }, [id, passedProduct]);

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
        // 🟢 1. Check if the required fields are empty
        if (!formData.preferredChanges.trim() || !formData.preferredTime) {
            alert("Please fill in the required fields (Changes and Preferred Time).");
            return; // Stop the function here
        }

        setStatus('loading');
        
        try {
            // Simulate API Call
            setTimeout(() => {
                setStatus('success'); 
            }, 1500);
        } catch (err) {
            setStatus('error');
        }
    };

    return (
        <div style={pageWrapper}>
            <div style={headerNav}>
                <div 
                    style={{ ...backBtn, display: 'flex', alignItems: 'center', cursor: 'pointer' }} 
                    onClick={() => navigate(-1)}
                >
                    <img src="/img/back.png" alt="Back" style={{ width: '24px', marginRight: '10px', position: 'relative', top: '3px' }} />
                    <span style={{ fontSize: '18px', fontWeight: '700' }}>Back</span>
                </div>
            </div>

            <div style={mainContent}>
                <h1 style={pageTitle}>Request Designer Edit</h1>
                <p style={pageSubtitle}>Send a custom edit request directly to the designer.</p>

                <div style={layoutGrid}>
                    {/* LEFT COLUMN: Product Preview */}
                    <div style={leftColumn}>
                        <p style={disclaimerText}>Your request will be sent to the designer of this item.</p>
                        
                        <div style={imageContainer}>
                            <div style={{
                                backgroundColor: currentColor,
                                width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                WebkitMaskImage: `url(${selectedImage || product?.baseImages?.[0]})`,
                                maskImage: `url(${selectedImage || product?.baseImages?.[0]})`,
                                WebkitMaskSize: 'contain', maskSize: 'contain', WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat', WebkitMaskPosition: 'center', maskPosition: 'center',
                            }}>
                                <img src={selectedImage || product?.baseImages?.[0]} alt="Mockup" 
                                    style={{ width: '100%', height: '100%', objectFit: 'contain', mixBlendMode: 'multiply', filter: 'brightness(1.2) contrast(1.1)' }} 
                                />
                            </div>
                        </div>

                        {/* 🟢 ALIGNMENT FIX: New textDetailsContainer to keep text aligned with shirt on all screens */}
                        <div style={textDetailsContainer}>
                            <h2 style={productTitle}>{product?.title}</h2>
                            <p style={designerName}>by {product?.shopName || product?.designer}</p>
                            <p style={priceText}>LKR {product?.price}.00</p>
                            <div style={selectionDetails}>
                                <p>Selected colour : <span style={{ ...colorDot, background: currentColor }}></span></p>
                                <p style={{marginTop: '10px'}}>Selected size: {currentSize}</p>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Request Form */}
                    <div style={formCard}>
                        <h2 style={formHeader}>Request Form</h2>
                        
                        <div style={fieldGroup}>
                            <label style={fieldLabel}>Preferred Changes :</label>
                            <textarea 
                                name="preferredChanges"
                                style={textArea} 
                                value={formData.preferredChanges}
                                onChange={handleInputChange}
                                placeholder="Explain what you want edited..."
                            />
                        </div>

                        <div style={fieldGroup}>
                            <label style={fieldLabel}>Preferred Time :</label>
                            <select name="preferredTime" style={selectInput} value={formData.preferredTime} onChange={handleInputChange}>
                                <option value="">Choose your preferred time </option>
                                <option value="1-2 Days">1-2 Days</option>
                                <option value="3-5 Days">3-5 Days</option>
                            </select>
                            <p style={fieldHint}>(Designer may adjust the time period based on the request complexity).</p>
                        </div>

                        <div style={fieldGroup}>
                            <label style={fieldLabel}>Reference Image :</label>
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} accept=".jpg,.png,.pdf" />
                            <div style={uploadZone} onClick={handleUploadClick}>
                                {selectedFile ? `✅ ${selectedFile.name}` : "Click to Upload or drag and drop (JPG, PNG, PDF)"}
                            </div>
                        </div>

                        <div style={fieldGroup}>
                            <label style={fieldLabel}>Anything else you want the designer to know?</label>
                            <input name="extraNote" type="text" style={textInput} value={formData.extraNote} onChange={handleInputChange} placeholder="Type here........" />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <button 
                                style={{
                                    ...sendRequestBtn,
                                    opacity: status === 'loading' ? 0.7 : 1,
                                    cursor: status === 'loading' ? 'not-allowed' : 'pointer'
                                }} 
                                onClick={handleSubmit}
                                disabled={status === 'loading'}
                            >
                                {status === 'loading' ? 'Sending...' : 'Send Request'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

        {/* FEEDBACK MODALS */}
            {(status === 'success' || status === 'error') && (
                <div style={modalOverlay}>
                    <div style={modalContent}>
                        <div style={{ fontSize: '60px', marginBottom: '20px' }}>
                            {status === 'success' ? '✅' : '❌'}
                        </div>
                        <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#0d375b' }}>
                            {status === 'success' ? 'Request Sent Successfully!' : 'Something went wrong'}
                        </h2>
                        <p style={{ fontSize: '18px', color: '#666', margin: '20px 0', lineHeight: '1.5' }}>
                            {status === 'success' 
                                ? 'The designer will review your request. Please check the "Requests" section in your dashboard for updates and messages.' 
                                : 'We couldn\'t process your request. Please check your connection or file size and try again.'}
                        </p>
                        <button 
                            style={status === 'success' ? successBtn : errorBtn}
                            onClick={() => {
                                if (status === 'success') {
                                    // 🟢 Instead of navigate(), use window.location.href 
                                    // This forces the dashboard to load fresh and avoids the white screen.
                                    window.location.href = '/buyer-dashboard'; 
                                } else {
                                    setStatus('idle');
                                }
                            }}
                        >
                            {status === 'success' ? 'Go to Dashboard' : 'Try Again'}
                        </button>
                    </div>
                </div>
            )}

            <div style={footerStyle}>
                <span>Cre8tify • Wear Your Imaginations</span>
                <div style={footerLinks}>
                    <span>Privacy Policy</span> | <span>Terms & Conditions</span> | <span>FAQ</span>
                </div>
                <span> © 2025 Cre8tify</span>
            </div>
        </div>
    );
    };

// --- UPDATED STYLES ---
const pageWrapper: React.CSSProperties = { fontFamily: 'Inter, sans-serif', color: '#333', background: '#fff', minHeight: '100vh', display: 'flex', flexDirection: 'column' };
const headerNav: React.CSSProperties = { padding: '40px 10%', display: 'flex', alignItems: 'center' };
const backBtn: React.CSSProperties = { cursor: 'pointer', fontWeight: 600, color: '#0d375b', fontSize: '18px' };
const mainContent: React.CSSProperties = { padding: '0 10% 100px', textAlign: 'center', flex: 1 };
const pageTitle: React.CSSProperties = { fontSize: '42px', fontWeight: 800, margin: '0 0 10px' };
const pageSubtitle: React.CSSProperties = { fontSize: '18px', color: '#666', marginBottom: '60px' };

const layoutGrid: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '80px', textAlign: 'left', alignItems: 'start' };

// Left column styles
const leftColumn: React.CSSProperties = { display: 'flex', flexDirection: 'column', alignItems: 'center', flex: '0 0 450px' };

const textDetailsContainer: React.CSSProperties = {
    width: '100%',
    maxWidth: '400px',       // Matches the imageContainer width for perfect alignment
    textAlign: 'left',
    marginTop: '10px'
};

const disclaimerText: React.CSSProperties = { fontSize: '16px', color: '#888', fontStyle: 'italic', marginBottom: '15px', textAlign: 'center', background: '#f8f9fa', padding: '12px', borderRadius: '8px', width: '100%' };
const imageContainer: React.CSSProperties = { width: '400px', height: '450px', border: '4px solid #3498db', borderRadius: '15px', padding: '10px', marginBottom: '30px', background: '#fff' };
const productTitle: React.CSSProperties = { fontSize: '28px', fontWeight: 800, margin: '0' };
const designerName: React.CSSProperties = { fontSize: '18px', color: '#666', fontStyle: 'italic' };
const priceText: React.CSSProperties = { fontSize: '24px', fontWeight: 900, margin: '15px 0' };
const selectionDetails: React.CSSProperties = { fontSize: '18px', fontWeight: 700, marginTop: '10px' };
const colorDot: React.CSSProperties = { display: 'inline-block', width: '18px', height: '18px', borderRadius: '50%', border: '1px solid #ddd', marginLeft: '8px', verticalAlign: 'middle' };
const productInfo: React.CSSProperties = { width: '100%', textAlign: 'left', marginTop: '10px', paddingLeft: '40px' };

const formCard: React.CSSProperties = { background: '#ebf5ff', borderRadius: '20px', padding: '50px', border: '1px solid #c2e0ff', boxShadow: '0 10px 30px rgba(13, 55, 91, 0.05)' };
const formHeader: React.CSSProperties = { textAlign: 'center', fontSize: '32px', fontWeight: 800, marginBottom: '40px', color: '#0d375b' };
const fieldGroup: React.CSSProperties = { marginBottom: '30px' };
const fieldLabel: React.CSSProperties = { display: 'block', fontSize: '20px', fontWeight: 700, fontStyle: 'italic', marginBottom: '12px', color: '#0d375b' };

// 🟢 MODAL & POPUP STYLES
const modalOverlay: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.7)', // Darker background
    backdropFilter: 'blur(8px)',        // Blurs the page behind the popup
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999                       // Ensures it stays on top of everything
};

const modalContent: React.CSSProperties = {
    background: '#fff',
    padding: '50px',
    borderRadius: '32px',
    width: '550px',
    textAlign: 'center',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
};

const successBtn: React.CSSProperties = {
    padding: '16px 45px',
    background: '#2ecc71',             // Professional green
    color: '#fff',
    borderRadius: '50px',
    border: 'none',
    fontSize: '20px',
    fontWeight: '700',
    cursor: 'pointer',
    marginTop: '10px',
    transition: '0.3s'
};

const errorBtn: React.CSSProperties = {
    padding: '16px 45px',
    background: '#e74c3c',             // Professional red
    color: '#fff',
    borderRadius: '50px',
    border: 'none',
    fontSize: '20px',
    fontWeight: '700',
    cursor: 'pointer',
    marginTop: '10px'
};

// 🟢 INPUTS UPDATED TO BLACK FONT
const textArea: React.CSSProperties = { width: '100%', height: '130px', padding: '15px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '18px', color: '#000', fontWeight: '500', resize: 'none' };
const selectInput: React.CSSProperties = { width: '100%', padding: '15px', borderRadius: '8px', border: '1px solid #ccc', background: '#fff', fontSize: '18px', color: '#000', fontWeight: '500' };
const textInput: React.CSSProperties = { width: '100%', padding: '18px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '18px', color: '#000', fontWeight: '500' };

const fieldHint: React.CSSProperties = { fontSize: '14px', color: '#666', fontStyle: 'italic', marginTop: '6px' };
const uploadZone: React.CSSProperties = { width: '100%', padding: '40px', border: '2px dashed #3498db', borderRadius: '10px', background: '#fff', textAlign: 'center', color: '#3498db', cursor: 'pointer', fontWeight: '600', transition: '0.3s' };
const sendRequestBtn: React.CSSProperties = { width: '50%', padding: '18px', background: '#0d375b', color: '#fff', borderRadius: '50px', fontSize: '22px', fontWeight: 700, border: 'none', cursor: 'pointer', marginTop: '10px', boxShadow: '0 4px 15px rgba(13, 55, 91, 0.3)' };

// 🟢 FOOTER UPDATED
const footerStyle: React.CSSProperties = { background: '#0d375b', padding: '50px 10% 40px', display: 'flex', justifyContent: 'space-between', color: '#fff', fontSize: '25px', alignItems: 'center', marginTop: 'auto', fontFamily: 'Inter, sans-serif' };
const footerLinks: React.CSSProperties = { display: 'flex', gap: '30px', fontWeight: '400' };

export default RequestEdit;