import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import '../styles/dashboard.css';

// 🟢 1. HELPER COMPONENTS

const ActionButton = ({ text, onClick }: { text: string; onClick?: () => void }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isActive, setIsActive] = useState(false);

    return (
        <button 
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => { setIsHovered(false); setIsActive(false); }}
            onMouseDown={() => setIsActive(true)}
            onMouseUp={() => setIsActive(false)}
            style={{ 
                padding: '24px 15px',
                background: isActive ? '#3B82F6' : (isHovered ? '#C0DFFF' : '#E0EEFF'),
                border: 'none', 
                borderRadius: '45px', 
                fontSize: '22px', 
                fontWeight: '900', 
                color: isActive ? '#FFFFFF' : '#000', 
                cursor: 'pointer',
                transition: 'all 0.2s ease', 
                transform: isActive ? 'scale(0.95)' : 'scale(1)', 
            }}
        >
            {text}
        </button>
    );
};

const DesignerCard = () => {
    const [isHovered, setIsHovered] = useState(false);
    const [isActive, setIsActive] = useState(false);

    return (
        <div style={{ 
            background: '#E0EEFF', borderRadius: '32px', padding: '50px', width: '100%', 
            display: 'flex', gap: '50px', alignItems: 'center', position: 'relative',
            boxShadow: '0 4px 25px rgba(0,0,0,0.06)',
        }}>
            <div style={{ flexShrink: 0 }}>
                <img src="/img/designer1_profile.png" alt="Designer" style={{ width: '180px', height: '180px', borderRadius: '50%', objectFit: 'cover' }} />
            </div>
            
            <div style={{ width: '2px', height: '220px', background: '#3B82F6', opacity: 0.3 }}></div>

            <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                    <div>
                        <h4 style={{ margin: 0, fontSize: '28px', fontWeight: '900', color: '#0d375b' }}>Designer Name</h4>
                        <p style={{ margin: 0, fontSize: '24px', fontStyle: 'italic', color: '#475569' }}>Ishara Deen</p>
                    </div>
                    <button 
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => { setIsHovered(false); setIsActive(false); }}
                        onMouseDown={() => setIsActive(true)}
                        onMouseUp={() => setIsActive(false)}
                        style={{ 
                            padding: '16px 35px', 
                            background: isActive ? '#1D4ED8' : (isHovered ? '#3B82F6' : '#000'), 
                            color: '#fff', border: 'none', borderRadius: '15px', 
                            fontWeight: '800', fontSize: '18px', cursor: 'pointer',
                            transition: '0.3s ease',
                            transform: isActive ? 'scale(0.96)' : 'scale(1)'
                        }}
                    >
                        Visit Shop
                    </button>
                </div>
                
                <div style={{ marginBottom: '20px' }}>
                    <h4 style={{ margin: 0, fontSize: '28px', fontWeight: '900', color: '#0d375b' }}>Shop Name</h4>
                    <p style={{ margin: 0, fontSize: '24px', fontStyle: 'italic', color: '#475569' }}>Studio Bloom</p>
                </div>
                
                <div>
                    <h4 style={{ margin: 0, fontSize: '28px', fontWeight: '900', color: '#0d375b' }}>Bio</h4>
                    <p style={{ margin: 0, fontSize: '22px', lineHeight: '1.6', color: '#475569' }}>
                        Ishara is a self-taught designer from Colombo who specializes in minimal line art and soft pastel aesthetics. 
                        Her work blends simplicity with emotion, creating wearable art inspired by nature and everyday moments.
                    </p>
                </div>
            </div>
        </div>
    );
};

// 🟢 2. MAIN COMPONENT

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [showPurchaseModal, setShowPurchaseModal] = useState(false);

    const product = {
        id: 1,
        title: 'Taste & See Minimal T-shirt',
        category: 'Women',
        shopName: 'Artisa LK',
        price: 1200,
        basePrice: 650,
        designerCharge: 350,
        serviceCharge: 200,
        descriptionPara1: "This uniquely crafted t-shirt blends comfort with expressive design, created to match a wide range of personal styles. The artwork features soft, minimal strokes that highlight subtle elegance while keeping the look modern and wearable for everyday occasions.",
        descriptionPara2: "Whether you’re dressing casually for a day out, styling a cozy evening outfit, or looking for something that expresses your individual vibe, this piece adapts effortlessly.",
        baseImages: ['/img/mockups/shop1_base_front.png', '/img/mockups/shop1_base_back.png'], 
        colors: ['#E5D3C0', '#FFFFFF', '#E0D7FF', '#c7d4ee', '#b0c7a8'],
        sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL']
    };

    const [selectedColor, setSelectedColor] = useState('#E5D3C0'); 
    const [selectedSize, setSelectedSize] = useState('M');
    const [currentImgIndex, setCurrentImgIndex] = useState(0); 

    const recommendedProducts = [
        { id: 101, title: 'Abstract Lines', price: '1,450', bgColor: '#F1F5F9', img: '/img/shop1.png' }, 
        { id: 102, title: 'Nature Bloom', price: '1,200', bgColor: '#E0EEFF', img: '/img/shop2.png' }, 
        { id: 103, title: 'Midnight Echo', price: '1,300', bgColor: '#F1F5F9', img: '/img/shop3.png' }, 
        { id: 104, title: 'Sunset Minimal', price: '1,100', bgColor: '#E0EEFF', img: '/img/shop4.png' }
    ];

    return (
        <div className="dashboard-container">
            <Sidebar variant="customer" />
            
            <div className="main-content" style={{ overflowX: 'hidden' }}>
                <header className="top-header">
                    <div className="header-left" onClick={() => navigate(-1)} style={{ cursor: 'pointer' }}>
                        <img src="/img/back.png" alt="Back" className="nav-icon-small" style={{ filter: 'invert(1)' }} />
                        <span style={{ fontSize: '20px', fontWeight: '600' }}>Back</span>
                    </div>
                </header>

                <div className="content-wrapper" style={{ padding: '40px 60px', background: 'white', maxWidth: '100%' }}>
                    
                    <div style={{ display: 'flex', gap: '80px', alignItems: 'flex-start' }}>
                        
                        {/* LEFT VISUALS */}
                        <div style={{ flex: '0 0 40%', position: 'sticky', top: '20px' }}>
                            <div style={{ borderRadius: '32px', width: '100%', height: '650px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative', background: 'white' }}>
                                <div style={{
                                    backgroundColor: selectedColor, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'absolute',
                                    transform: currentImgIndex === 0 ? 'scale(1.25)' : 'scale(0.85)', transition: 'transform 0.3s ease',
                                    WebkitMaskImage: `url(${product.baseImages[currentImgIndex]})`, maskImage: `url(${product.baseImages[currentImgIndex]})`,
                                    WebkitMaskSize: 'contain', maskSize: 'contain', WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat', WebkitMaskPosition: 'center', maskPosition: 'center',
                                }}>
                                    <img src={product.baseImages[currentImgIndex]} alt="Mockup" style={{ width: '100%', height: '100%', objectFit: 'contain', mixBlendMode: 'multiply', filter: 'brightness(1.4) contrast(1.1)', transform: currentImgIndex === 0 ? 'scale(1.25)' : 'scale(1.0)', transition: '0.3s' }} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '25px', marginBottom: '50px' }}>
                                <div onClick={() => setCurrentImgIndex(0)} style={{ width: '16px', height: '16px', borderRadius: '50%', background: currentImgIndex === 0 ? '#000' : '#CBD5E1', cursor: 'pointer' }} />
                                <div onClick={() => setCurrentImgIndex(1)} style={{ width: '16px', height: '16px', borderRadius: '50%', background: currentImgIndex === 1 ? '#000' : '#CBD5E1', cursor: 'pointer' }} />
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <h4 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '15px', color: '#64748B' }}>Size Reference Guide</h4>
                                <div style={{ borderRadius: '24px', border: '1px solid #f1f5f9', background: '#fff', padding: '15px', display: 'flex', justifyContent: 'center' }}>
                                    <img src="/img/sizechart.png" alt="Size Chart" style={{ width: '100%', height: 'auto', maxHeight: '300px', objectFit: 'contain' }} />
                                </div>
                            </div>
                        </div>

                        {/* RIGHT DETAILS */}
                        <div style={{ flex: '1', minWidth: '0' }}> 
                            <h1 style={{ fontSize: '56px', fontWeight: '900', margin: '0 0 10px 0' }}>{product.title}</h1>
                            <p style={{ fontSize: '24px', color: '#64748B', fontStyle: 'italic', marginBottom: '35px' }}>by {product.shopName}</p>

                            <div style={{ marginBottom: '40px' }}>
                                <div style={{ fontSize: '48px', fontWeight: '900', color: '#fb0606' }}>LKR {product.price.toLocaleString()}.00</div>
                                <div style={{ fontSize: '23px', color: '#94A3B8', marginTop: '15px', lineHeight: '1.8' }}>
                                    Base T-shirt: <span style={{ color: '#475569', fontWeight: '600' }}>- LKR {product.basePrice}</span><br />
                                    Designer charge: <span style={{ color: '#475569', fontWeight: '600' }}>- LKR {product.designerCharge}</span><br />
                                    Service charge: <span style={{ color: '#475569', fontWeight: '600' }}>- LKR {product.serviceCharge}</span>
                                </div>
                            </div>

                            <div style={{ marginBottom: '45px' }}>
                                <h4 style={{ fontSize: '30px', fontWeight: '800', marginBottom: '15px' }}>Description</h4>
                                <p style={{ color: '#475569', lineHeight: '1.6', fontSize: '22px', marginBottom: '20px' }}>{product.descriptionPara1}</p>
                                <p style={{ color: '#475569', lineHeight: '1.6', fontSize: '22px', margin: 0 }}>{product.descriptionPara2}</p>
                            </div>

                            <div style={{ marginBottom: '50px' }}>
                                <h4 style={{ fontSize: '26px', fontWeight: '800', marginBottom: '15px' }}>Colors</h4>
                                <div style={{ display: 'flex', gap: '20px' }}>
                                    {product.colors.map(c => (
                                        <div key={c} onClick={() => setSelectedColor(c)} style={{ width: '50px', height: '50px', borderRadius: '50%', background: c, border: selectedColor === c ? '4px solid #0d375b' : '1px solid #E2E8F0', cursor: 'pointer' }} />
                                    ))}
                                </div>
                            </div>

                            <div style={{ marginBottom: '60px' }}>
                                <h4 style={{ fontSize: '26px', fontWeight: '800', marginBottom: '15px' }}>Sizes</h4>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
                                    {product.sizes.map(s => (
                                        <div key={s} onClick={() => setSelectedSize(s)} style={{ padding: '15px 35px', border: '2px solid #E2E8F0', borderRadius: '15px', cursor: 'pointer', background: selectedSize === s ? '#000' : 'white', color: selectedSize === s ? 'white' : '#000', fontWeight: '800', fontSize: '22px' }}>{s}</div>
                                    ))}
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginTop: '40px', marginBottom: '80px' }}>
                                <ActionButton text="Try Live Preview" onClick={() => navigate('/live-preview', { state: { product, selectedColor, selectedSize } })} />
                                <ActionButton text="Customize Design" />
                                <ActionButton text="Request Designer Edit" onClick={() => navigate(`/request-edit/${product.id}`, { 
                                    state: { 
                                        product, 
                                        selectedColor, // 🟢 Sends the color they picked
                                        selectedSize,  // 🟢 Sends the size they picked
                                        selectedImage: product.baseImages[currentImgIndex] 
                                    }
                                })} />
                            </div>

                            <button 
                                onClick={() => setShowPurchaseModal(true)}
                                style={{ width: '100%', padding: '28px', background: '#000', color: 'white', border: 'none', borderRadius: '24px', fontWeight: '900', fontSize: '26px', cursor: 'pointer', marginBottom: '120px' }}
                            >
                                Choose your purchase option
                            </button>

                            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '40px' }}>
                                <DesignerCard />
                            </div>
                        </div>
                    </div>

                    {/* REVIEWS SECTION */}
                    <div style={{ marginTop: '120px', borderTop: '1px solid #E2E8F0', paddingTop: '60px', textAlign: 'left' }}>
                        <h2 style={{ fontSize: '48px', fontWeight: '900', marginBottom: '20px' }}>Reviews</h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '50px' }}>
                            <span style={{ fontSize: '38px', fontWeight: '800' }}>5.0</span>
                            <div style={{ display: 'flex', gap: '5px', color: '#000', fontSize: '30px' }}>{'★★★★★'}</div>
                        </div>

                        {[
                            { name: "Ramindi Suhurya", date: "Oct 19, 2025", color: "Off White", text: "Loved the design and the soft color blend. The preview feature really helped me decide!" },
                            { name: "S. Sachini", date: "Oct 19, 2025", color: "Black", text: "Loved the design and the soft color blend. The preview feature really helped me decide!" },
                            { name: "Thiseja Lochi", date: "Oct 19, 2025", color: "Pearl Blue", text: "Loved the design and the soft color blend. The preview feature really helped me decide!" }
                        ].map((rev, index) => (
                            <div key={index} style={{ marginBottom: '50px', maxWidth: '1000px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '10px' }}>
                                    <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: '#CBD5E1' }}></div>
                                    <span style={{ fontWeight: '800', fontSize: '24px' }}>{rev.name}</span>
                                    <span style={{ color: '#94A3B8', fontSize: '18px' }}>on {rev.date}</span>
                                </div>
                                <div style={{ color: '#FACC15', fontSize: '22px', margin: '10px 0' }}>{'★★★★★'}</div>
                                <p style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#94A3B8', fontStyle: 'italic' }}>Purchased: {rev.color}</p>
                                <p style={{ margin: 0, fontSize: '22px', color: '#475569', lineHeight: '1.6' }}>{rev.text}</p>
                            </div>
                        ))}
                    </div>

                    {/* YOU MAY ALSO LIKE SECTION */}
                    <div style={{ marginTop: '100px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', marginBottom: '80px' }}>
                            <div style={{ flex: 1, height: '1.5px', background: '#E2E8F0' }}></div>
                            <h2 style={{ fontSize: '36px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px', color: '#64748B' }}>You May Also Like</h2>
                            <div style={{ flex: 1, height: '1.5px', background: '#E2E8F0' }}></div>
                        </div>
                        
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '65px', flexWrap: 'wrap', marginBottom: '100px' }}>
                            {recommendedProducts.map((prod) => (
                                <div key={prod.id} style={{ 
                                    background: prod.bgColor, borderRadius: '24px', padding: '25px', 
                                    width: '320px', textAlign: 'left', boxShadow: '0 4px 15px rgba(0,0,0,0.03)'
                                }}>
                                    <div style={{ background: '#fff', borderRadius: '18px', padding: '20px', marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
                                        <img src={prod.img} alt={prod.title} style={{ width: '100%', height: '280px', objectFit: 'contain' }} />
                                    </div>
                                    <h4 style={{ fontSize: '22px', fontWeight: '800', margin: '0 0 5px 0' }}>{prod.title}</h4>
                                    <p style={{ fontSize: '18px', color: '#64748B', fontStyle: 'italic' }}>by Artisa LK</p>
                                    <p style={{ fontSize: '24px', fontWeight: '900', color: '#000', marginTop: '10px' }}>LKR {prod.price}.00</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 🟢 PURCHASE MODAL IMPLEMENTATION */}
                {showPurchaseModal && (
                    <div style={{
                        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                        backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(5px)'
                    }}>
                        <div style={{
                            background: 'white', padding: '50px', borderRadius: '32px',
                            width: '600px', textAlign: 'center', position: 'relative', boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
                        }}>
                            <h2 style={{ fontSize: '32px', fontWeight: '900', marginBottom: '10px' }}>Purchase Options</h2>
                            <p style={{ color: '#64748B', fontSize: '18px', marginBottom: '40px' }}>Select how you'd like to receive your design</p>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                {/* FULL T-SHIRT */}
                                <div 
                                    onClick={() => navigate('/cart', { state: { type: 'full', product, color: selectedColor, size: selectedSize } })}
                                    style={{ 
                                        padding: '25px', border: '2px solid #E2E8F0', borderRadius: '20px', 
                                        cursor: 'pointer', textAlign: 'left', transition: '0.3s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.borderColor = '#3B82F6'}
                                    onMouseLeave={(e) => e.currentTarget.style.borderColor = '#E2E8F0'}
                                >
                                    <h4 style={{ margin: 0, fontSize: '22px', fontWeight: '800' }}>Buy Full T-shirt</h4>
                                    <p style={{ margin: '5px 0', color: '#64748B' }}>Get the high-quality physical T-shirt delivered to your home.</p>
                                    <span style={{ fontWeight: '900', color: '#fb0606', fontSize: '20px' }}>LKR 1,200.00</span>
                                </div>

                                {/* DESIGN ONLY */}
                                <div 
                                    onClick={() => navigate('/cart', { state: { type: 'digital', product } })}
                                    style={{ 
                                        padding: '25px', border: '2px solid #E2E8F0', borderRadius: '20px', 
                                        cursor: 'pointer', textAlign: 'left', transition: '0.3s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.borderColor = '#3B82F6'}
                                    onMouseLeave={(e) => e.currentTarget.style.borderColor = '#E2E8F0'}
                                >
                                    <h4 style={{ margin: 0, fontSize: '22px', fontWeight: '800' }}>Digital Design Only</h4>
                                    <p style={{ margin: '5px 0', color: '#64748B' }}>Download the high-res PNG/SVG to print it yourself.</p>
                                    <span style={{ fontWeight: '900', color: '#fb0606', fontSize: '20px' }}>LKR 350.00</span>
                                </div>
                            </div>

                            <button 
                                onClick={() => setShowPurchaseModal(false)}
                                style={{ marginTop: '30px', background: 'none', border: 'none', color: '#94A3B8', fontWeight: '700', fontSize: '18px', cursor: 'pointer' }}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}
                <Footer />
            </div>
        </div>
    );
};

export default ProductDetail;