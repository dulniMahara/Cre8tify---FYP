import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import '../styles/dashboard.css';

const LivePreview = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // 1. DATA RECOVERY: Ensure data from the Product Page is caught correctly
    const passedData = location.state || {};
    
    // Define the full color objects here so the UI can render the circles
    const colorOptions = [
        { name: 'Light Cream', hex: '#E5D3C0' },
        { name: 'Pure White', hex: '#FFFFFF' },
        { name: 'Light Purple', hex: '#E0D7FF' },
        { name: 'Light Blue', hex: '#c7d4ee' },
        { name: 'Light Green', hex: '#b0c7a8' }
    ];

    const product = passedData.product || { 
        title: "Taste & See Minimal T-shirt", 
        shopName: "Artisa LK", 
        baseImages: ['/img/mockups/shop1_base_front.png'],
        sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL']
    };

    // 2. STATE: Initialize with the color originally picked on the Product page
    const [selectedColor, setSelectedColor] = useState(passedData.selectedColor || '#E5D3C0');
    const [selectedSize, setSelectedSize] = useState(passedData.selectedSize || 'M');
    const [userImage, setUserImage] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [resultImage, setResultImage] = useState<string | null>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setUserImage(URL.createObjectURL(file));
            setResultImage(null);
        }
    };

    const generatePreview = () => {
        if (!userImage) return;
        setIsGenerating(true);
        setTimeout(() => {
            setIsGenerating(false);
            setResultImage('/img/mockups/preview_result_demo.png'); 
        }, 2500);
    };

    return (
        <div className="dashboard-container">
            <Sidebar variant="customer" />
            <div className="main-content">
                <header className="top-header">
                    <div className="header-left" onClick={() => navigate(-1)} style={{ cursor: 'pointer' }}>
                        <img src="/img/back.png" alt="Back" className="nav-icon-small" style={{ filter: 'invert(1)' }} />
                        <span style={{ fontSize: '22px', fontWeight: '700' }}>Back</span>
                    </div>
                </header>

                <div className="content-wrapper" style={{ padding: '40px 60px' }}>
                    <h1 style={{ fontSize: '56px', fontWeight: '900', marginBottom: '10px' }}>Live Preview</h1>
                    <p style={{ fontSize: '24px', color: '#64748B', marginBottom: '60px' }}>Refine your style in real-time</p>

                    <div style={{ display: 'flex', gap: '35px', justifyContent: 'center', alignItems: 'flex-start' }}>
                        
                        {/* 1. LEFT PANEL: T-SHIRT PREVIEW & CONTROLS */}
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <div style={{ 
                                height: '550px', background: '#F8FAFC', borderRadius: '32px', 
                                border: '1.5px solid #E2E8F0', overflow: 'hidden', position: 'relative',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                {/* 🟢 THE FIX: The mask uses selectedColor state to change the shirt color */}
                                <div style={{
                                    backgroundColor: selectedColor, // Dynamic color update
                                    width: '100%', height: '100%', position: 'absolute',
                                    WebkitMaskImage: `url(${product.baseImages[0]})`,
                                    maskImage: `url(${product.baseImages[0]})`,
                                    WebkitMaskSize: 'contain', maskSize: 'contain', 
                                    WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat', 
                                    WebkitMaskPosition: 'center', maskPosition: 'center',
                                    opacity: 0.9,
                                }}>
                                    <img src={product.baseImages[0]} style={{ width: '100%', height: '100%', objectFit: 'contain', mixBlendMode: 'multiply', filter: 'brightness(1.4) contrast(1.1)' }} alt="Shirt Texture" />
                                </div>
                            </div>
                            
                            <div style={{ marginTop: '30px' }}>
                                <h2 style={{ fontSize: '32px', fontWeight: '900', margin: '0' }}>{product.title}</h2>
                                <p style={{ color: '#64748B', fontSize: '20px', fontStyle: 'italic', marginBottom: '30px' }}>by {product.shopName}</p>
                                
                                <h4 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '15px' }}>Change Color</h4>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '18px', marginBottom: '30px' }}>
                                    {colorOptions.map((c) => (
                                        <div key={c.hex} onClick={() => setSelectedColor(c.hex)} style={{ textAlign: 'center', cursor: 'pointer' }}>
                                            {/* 🟢 THE FIX: Set 'background' to c.hex so the circle isn't blank */}
                                            <div style={{ 
                                                width: '45px', 
                                                height: '45px', 
                                                borderRadius: '50%', 
                                                background: c.hex, // Shows the color
                                                border: selectedColor === c.hex ? '4px solid #3B82F6' : '1.5px solid #E2E8F0', 
                                                margin: '0 auto 6px' 
                                            }}></div>
                                            <span style={{ fontSize: '14px', fontWeight: '800', color: selectedColor === c.hex ? '#3B82F6' : '#64748B' }}>{c.name}</span>
                                        </div>
                                    ))}
                                </div>

                                <h4 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '15px' }}>Change Size</h4>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                                    {product.sizes.map((s: string) => (
                                        <div key={s} onClick={() => setSelectedSize(s)} style={{ 
                                            padding: '10px 20px', borderRadius: '12px', border: '2px solid #E2E8F0', 
                                            background: selectedSize === s ? '#000' : '#fff', color: selectedSize === s ? '#fff' : '#000',
                                            fontWeight: '900', fontSize: '16px', cursor: 'pointer'
                                        }}>{s}</div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* 2. CENTER PANEL: UPLOAD */}
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <div onClick={() => fileInputRef.current?.click()} style={{ height: '550px', border: '3px dashed #CBD5E1', borderRadius: '32px', background: '#F1F5F9', cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
                                {userImage ? <img src={userImage} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="User" /> : <h3 style={{ fontSize: '28px', fontWeight: '800', color: '#64748B' }}>Upload photo</h3>}
                                <input type="file" ref={fileInputRef} hidden onChange={handleFileChange} accept="image/*" />
                            </div>
                            <div style={{ marginTop: '30px' }}>
                                <button onClick={generatePreview} style={{ width: '100%', padding: '24px', background: '#000', color: '#fff', borderRadius: '50px', fontSize: '24px', fontWeight: '900', cursor: 'pointer' }}>Generate Preview</button>
                                <div style={{ marginTop: '25px', padding: '25px', background: '#FFF5F5', borderRadius: '24px', border: '1.5px solid #FED7D7' }}>
                                    <h4 style={{ fontWeight: '900', color: '#C53030', fontSize: '20px', marginBottom: '12px' }}>⚠️ PHOTO INSTRUCTIONS</h4>
                                    <ul style={{ color: '#742A2A', fontSize: '18px', fontWeight: '700', lineHeight: '1.8' }}>
                                        <li>Front facing photo only</li>
                                        <li>Good lighting for best results</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* 3. RIGHT PANEL: RESULT */}
                        <div style={{ flex: 1 }}>
                            <div style={{ height: '550px', background: '#F8FAFC', borderRadius: '32px', border: '1.5px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                                {isGenerating ? <div className="loader"></div> : (resultImage ? <img src={resultImage} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <p style={{ fontSize: '22px', fontWeight: '800', color: '#94A3B8' }}>Preview result</p>)}
                            </div>
                            <div style={{ marginTop: '30px', textAlign: 'center' }}> 
                                <button onClick={() => navigate('/dummy-model', { state: { product, selectedColor, selectedSize } })} style={{ background: 'none', border: 'none', color: '#3B82F6', cursor: 'pointer', textDecoration: 'underline', fontWeight: '900', fontSize: '20px' }}>Use Dummy Model</button>
                            </div>
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        </div>
    );
};

export default LivePreview;