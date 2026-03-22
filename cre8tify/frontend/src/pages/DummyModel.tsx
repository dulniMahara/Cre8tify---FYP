import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';

const DummyModel = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const passedData = location.state || {};

    const colorMap: { [key: string]: string } = {
        'Light Cream': '#E5D3C0',
        'Pure White': '#FFFFFF',
        'Light Purple': '#E0D7FF',
        'Light Blue': '#c7d4ee',
        'Light Green': '#b0c7a8'
    };

    const initialColor = passedData.selectedColor?.startsWith('#') 
        ? passedData.selectedColor 
        : (colorMap[passedData.selectedColor] || '#E5D3C0');

    const [selectedColor, setSelectedColor] = useState(initialColor);
    const [selectedSize, setSelectedSize] = useState(passedData.selectedSize || 'M');
    const [angle, setAngle] = useState(0);

    const category = passedData.product?.category || 'women';
    const product = passedData.product || { title: "Minimal T-shirt", price: 1200, shopName: "Artisa LK" };

    const modelAssets: { [key: string]: string[] } = {
        women: ['womenfront.png', 'womenright.png', 'womenback.png', 'womenleft.png'],
        men: ['menfront.png', 'menright.png', 'menback.png', 'menleft.png'],
        kids: ['boyfront.png', 'boyright.png', 'boyback.png', 'boyleft.png'], 
    };

    const sizeScales: { [key: string]: number } = {
        'XS': 0.85, 'S': 0.92, 'M': 1.0, 'L': 1.08, 'XL': 1.15, '2XL': 1.22, '3XL': 1.3
    };

    return (
        <div className="dashboard-container" style={{ background: '#FBFBFE' }}>
            <Sidebar variant="customer" />
            <div className="main-content">
                <header className="top-header" style={{ background: 'transparent', border: 'none' }}>
                    <div className="header-left" onClick={() => navigate(-1)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ background: '#fff', padding: '8px', borderRadius: '50%', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                             <img src="/img/back.png" alt="Back" style={{ width: '20px' }} />
                        </div>
                        <span style={{ fontSize: '18px', fontWeight: '700' }}>Exit Fitting Room</span>
                    </div>
                </header>

                <div className="content-wrapper" style={{ padding: '20px 60px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr 380px', gap: '30px' }}>
                        
                        {/* LEFT: COLOR & SIZE PICKER */}
                        <div style={{ padding: '30px', background: '#fff', borderRadius: '28px', border: '1px solid #E2E8F0' }}>
                            <h3 style={{ fontSize: '22px', fontWeight: '900', marginBottom: '25px' }}>Fitting Settings</h3>
                            
                            <label style={{ fontWeight: '800', color: '#64748B', display: 'block', marginBottom: '15px' }}>Body Scale</label>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '30px' }}>
                                {Object.keys(sizeScales).map(s => (
                                    <button key={s} onClick={() => setSelectedSize(s)} style={{ 
                                        padding: '12px 0', borderRadius: '12px', border: '2px solid',
                                        borderColor: selectedSize === s ? '#3B82F6' : '#F1F5F9',
                                        background: selectedSize === s ? '#EFF6FF' : '#fff',
                                        color: selectedSize === s ? '#3B82F6' : '#64748B',
                                        fontWeight: '800', cursor: 'pointer'
                                    }}>{s}</button>
                                ))}
                            </div>

                            <label style={{ fontWeight: '800', color: '#64748B', display: 'block', marginBottom: '15px' }}>Live Color Swap</label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
                                {Object.entries(colorMap).map(([name, hex]) => (
                                    <div key={hex} onClick={() => setSelectedColor(hex)} style={{ textAlign: 'center', cursor: 'pointer' }}>
                                        <div style={{ 
                                            width: '42px', height: '42px', borderRadius: '50%', 
                                            background: hex,
                                            border: selectedColor === hex ? '3px solid #3B82F6' : '1.5px solid #E2E8F0', 
                                            margin: '0 auto 6px' 
                                        }}></div>
                                        <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748B' }}>{name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* CENTER: THE VISUALIZER */}
                        <div style={{ textAlign: 'center', position: 'relative' }}>
                            <div style={{ 
                                height: '600px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                transform: `scale(${sizeScales[selectedSize]})`, transition: 'all 0.5s ease-out',
                                position: 'relative'
                            }}>
                                {/* 🟢 LAYER 1: NATURAL MANNEQUIN (Base layer) */}
                                <img 
                                    src={`/img/dummyprev/${modelAssets[category][angle]}`} 
                                    style={{ width: '100%', height: '100%', objectFit: 'contain', position: 'absolute', zIndex: 1 }} 
                                    alt="Mannequin Body" 
                                />

                                {/* 🟢 LAYER 2: THE COLOR TINT (Shirt area only) */}
                                <div style={{
                                    backgroundColor: selectedColor,
                                    width: '100%', height: '100%', position: 'absolute', zIndex: 2,
                                    WebkitMaskImage: `url(/img/dummyprev/${modelAssets[category][angle]})`,
                                    maskImage: `url(/img/dummyprev/${modelAssets[category][angle]})`,
                                    WebkitMaskSize: 'contain', maskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center',
                                    mixBlendMode: 'multiply',
                                    opacity: 0.3 // 👈 Low opacity ensures only the white shirt picks up color
                                }}></div>

                                {/* 🟢 LAYER 3: THE PRINTED DESIGN (Higher & Fitted) */}
                                {(angle === 0 || angle === 2) && (
                                    <div style={{
                                        width: '100%', height: '100%', position: 'absolute', zIndex: 3,
                                        WebkitMaskImage: `url(/img/dummyprev/${modelAssets[category][angle]})`,
                                        maskImage: `url(/img/dummyprev/${modelAssets[category][angle]})`,
                                        WebkitMaskSize: 'contain', maskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center',
                                        pointerEvents: 'none'
                                    }}>
                                        <img 
                                            src={angle === 0 ? "/img/mockups/shop1_base_front.png" : "/img/mockups/shop1_base_back.png"} 
                                            style={{ 
                                                width: '30%', // 👈 Widened to fit the mannequin's chest
                                                position: 'absolute',
                                                top: '20%', // 👈 Moved up significantly to align with neckline
                                                left: '50%',
                                                transform: 'translateX(-50%)',
                                                mixBlendMode: 'multiply', 
                                                opacity: 0.9,
                                                filter: 'contrast(1.2) brightness(1.1)'
                                            }} 
                                            alt="Design Print" 
                                        />
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '20px' }}>
                                <button onClick={() => setAngle((angle - 1 + 4) % 4)} className="rotate-btn">↺</button>
                                <button onClick={() => setAngle((angle + 1) % 4)} className="rotate-btn">↻</button>
                            </div>
                        </div>

                        {/* RIGHT: PRODUCT CARD */}
                        <div style={{ padding: '30px', background: '#fff', borderRadius: '28px', border: '1px solid #E2E8F0' }}>
                            <div style={{ background: '#F8FAFC', borderRadius: '20px', padding: '20px', marginBottom: '20px', textAlign: 'center' }}>
                                <img src="/img/mockups/shop1_base_front.png" style={{ width: '150px', mixBlendMode: 'multiply' }} alt="Product" />
                            </div>
                            <h2 style={{ fontSize: '20px', fontWeight: '900' }}>{product.title}</h2>
                            <p style={{ color: '#64748B', fontWeight: '700', marginBottom: '15px' }}>LKR {product.price}.00</p>
                            <button style={{ width: '100%', padding: '20px', background: '#000', color: '#fff', borderRadius: '15px', fontWeight: '900', border: 'none', cursor: 'pointer' }}>
                                Add to Cart
                            </button>
                        </div>

                    </div>
                </div>
                <Footer />
            </div>
            <style>{`.rotate-btn { width: 60px; height: 60px; border-radius: 50%; border: 1px solid #E2E8F0; background: #fff; font-size: 24px; cursor: pointer; display: flex; align-items: center; justify-content: center; }`}</style>
        </div>
    );
};

export default DummyModel;