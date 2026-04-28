import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import Header from '../components/Header'; 
import CollectionHero from '../components/CollectionHero';
import { useCart } from '../context/CartContext';
import '../styles/dashboard.css';

// --- 🟢 SHARED MOCKUP PREVIEW COMPONENT ---
type PrintArea = { top: string; left: string; width: string; height: string; rotation?: number };
type MockupPreviewProps = {
    mockupSrc: string;
    maskSrc: string;
    maskSize: string;
    maskPosition: string;
    tshirtColor: string;
    printArea?: PrintArea;
    designSrc?: string;
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
    areaScale = 1.0,
    designScale = 0.7,
    overallScale = 1.0
}: MockupPreviewProps) => {
    return (
        <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
            <div style={{ width: '100%', height: '100%', transform: `scale(${overallScale})`, transformOrigin: 'center center', position: 'relative' }}>
                {/* 1. Color Layer (Bottom) */}
                {tshirtColor && (
                    <div style={{
                        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: tshirtColor,
                        WebkitMaskImage: `url(${maskSrc || mockupSrc})`, maskImage: `url(${maskSrc || mockupSrc})`,
                        WebkitMaskSize: maskSize || 'contain', WebkitMaskPosition: maskPosition || 'center',
                        WebkitMaskRepeat: 'no-repeat', pointerEvents: 'none', zIndex: 0
                    }}></div>
                )}

                {/* 2. Mockup Image with Shadows (Top) */}
                <img 
                    src={mockupSrc} 
                    alt="Mockup" 
                    style={{ 
                        width: '100%', height: '100%', objectFit: 'contain', 
                        position: 'relative', zIndex: 1,
                        mixBlendMode: 'multiply',
                        filter: 'contrast(1.0) brightness(0.95) saturate(0)'
                    }} 
                />
                {printArea && designSrc && (
                    <div style={{
                        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                        WebkitMaskImage: `url(${maskSrc || mockupSrc})`, maskImage: `url(${maskSrc || mockupSrc})`,
                        WebkitMaskSize: maskSize || 'contain', WebkitMaskPosition: maskPosition || 'center',
                        WebkitMaskRepeat: 'no-repeat', zIndex: 3, pointerEvents: 'none'
                    }}>
                        <div style={{
                            position: 'absolute', top: printArea.top, left: printArea.left,
                            width: `calc(${printArea.width} * ${areaScale})`,
                            height: `calc(${printArea.height} * ${areaScale})`,
                            transform: `translate(-50%, -50%) rotate(${printArea.rotation || 0}deg)`,
                            transformOrigin: 'center center', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', overflow: 'hidden'
                        }}>
                            <img src={designSrc} alt="Design" style={{
                                width: '100%', height: '100%', objectFit: 'contain',
                                transform: `scale(${designScale})`, transformOrigin: 'center center'
                            }} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// Collection data
export const originalProducts = [
        { id: 1, title: 'Cotton Summer Tee', price: 1200, likes: 24, sales: 8, img: '/img/shop1.png', scale: 1.3, material: 'Premium Cotton' },
        { id: 2, title: 'Linen Comfort Top', price: 1550, likes: 18, sales: 5, img: '/img/shop2.png', scale: 0.9, material: 'Linen Blend' },
        { id: 3, title: 'Silk Dream Blouse', price: 2100, likes: 45, sales: 12, img: '/img/shop3.png', scale: 1.0, material: 'Pure Silk' },
        { id: 4, title: 'Boho Chic Tunic', price: 1400, likes: 32, sales: 10, img: '/img/shop4.png', scale: 1.2, material: 'Cotton Mix' },
        { id: 5, title: 'Velvet Evening Tee', price: 1750, likes: 55, sales: 15, img: '/img/shop5.png', scale: 1.4, material: 'Soft Velvet' },
        { id: 6, title: 'Denim Style Top', price: 1300, likes: 21, sales: 7, img: '/img/shop6.png', scale: 1.1, material: 'Light Denim' },
];

const WomenCollection = () => {
    const navigate = useNavigate();
    
    // 🛡️ 1. Grab the context for Cart Sync
    const cartContext = useCart();
    const addToCart = cartContext ? cartContext.addToCart : null;
    const cartItems = cartContext ? cartContext.cartItems : [];

    const handleAddToCart = (item: any) => {
        if (!item || !addToCart) return;

        const productWithDefaults = {
            id: item.id, 
            title: item.title,
            price: item.price,
            image: item.img,
            size: 'Choose Size', 
            color: 'Choose Color',
            quantity: 1, 
            selected: true,
            type: 'physical'
        };

        addToCart(productWithDefaults);
        alert(`${item.title} added! 🛒`);
    };

    const [heroImageIndex, setHeroImageIndex] = useState(0);
    const heroImages = ['/img/womencollect1.png', '/img/womencollect2.png', '/img/womencollect3.png'];
    const [backendProducts, setBackendProducts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // 🟢 FETCH APPROVED PRODUCTS FROM BACKEND
    useEffect(() => {
        const fetchDesignerProducts = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/products?category=women');
                const data = await response.json();
                
                // Map backend products to match the UI format
                const mapped = data.map((p: any) => ({
                    ...p, // 🟢 IMPORTANT: Keep all design data
                    id: p._id,
                    title: p.title,
                    price: p.price,
                    likes: Math.floor(Math.random() * 50),
                    sales: p.salesCount || 0,
                    img: p.mockupImages[0] || '/img/shop1.png',
                    scale: 1.0,
                    material: 'Designer Edition',
                    isDesignerProduct: true,
                    designer: p.designer
                }));
                
                setBackendProducts(mapped);
            } catch (error) {
                console.error("Error fetching designer products:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchDesignerProducts();
    }, []);
    
    useEffect(() => {
        const interval = setInterval(() => {
            setHeroImageIndex((prev) => (prev + 1) % heroImages.length);
        }, 3000);
        return () => clearInterval(interval);
    }, [heroImages.length]);

    const [likedProducts, setLikedProducts] = useState<any[]>([]);
    const toggleLike = (id: any) => { 
        setLikedProducts((prev: any) => {
            const updated = prev.includes(id) 
                ? prev.filter((item: any) => item !== id) 
                : [...prev, id];
            
            // SAVE TO LOCAL STORAGE
            localStorage.setItem('wishlist', JSON.stringify(updated));
            return updated;
        });
    };

    return (
        <div className="dashboard-container">
            <Sidebar variant="customer" />
            <div className="main-content" style={{ display: 'flex', flexDirection: 'column' }}>
                <Header mode="search" userRole="customer" />

                <div className="content-wrapper collection-content" style={{ padding: '0', background: '#f8fafc', marginTop: '0px' }}>
                    <CollectionHero 
                        title="WOMEN COLLECTION" 
                        subtitle="Elegance meets comfort in every thread" 
                        image={heroImages[heroImageIndex]} 
                    />

                    <div style={{ padding: '0 30px 40px 30px' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px', marginTop: '10px' }}>
                            <FilterButton text="Filter" icon="/img/icon-filter.png" onClick={() => {}} />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }}>
                            {[...backendProducts, ...originalProducts].map((item: any) => {
                                // 🚀 LIVE CART SYNC
                                const quantityInCart = cartItems?.find((c: any) => c.id === item.id)?.quantity || 0;

                                const handleNavigate = () => {
                                    navigate(`/product/${item.id}`, { state: { product: item } });
                                };

                                return (
                                    <div key={item.id} className="product-card" style={{ background: 'white', padding: '8px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' }}>
                                        <div onClick={handleNavigate} style={{ background: '#f8fafc', borderRadius: '9px', height: '210px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px', overflow: 'hidden', cursor: 'pointer', position: 'relative', padding: item.isDesignerProduct ? '0' : '8px' }}>
                                            {item.isDesignerProduct ? (
                                                <MockupPreview 
                                                    mockupSrc="/img/womenfront-mockup.png"
                                                    maskSrc="/img/womenfront-mockup.png"
                                                    maskSize="contain"
                                                    maskPosition="center"
                                                    tshirtColor={item.tshirtColor || '#ffffff'}
                                                    printArea={item.frontPrintArea || { top: '50%', left: '51%', width: '30%', height: '27%', rotation: 0 }}
                                                    designSrc={item.frontDesign}
                                                    overallScale={1.5}
                                                />
                                            ) : (
                                                <img src={item.img} alt="" style={{ maxWidth: '85%', maxHeight: '85%', objectFit: 'contain', transform: `scale(${item.scale || 1})`, filter: 'drop-shadow(0 5px 8px rgba(0,0,0,0.05))' }} />
                                            )}
                                        </div>
                                        <div style={{ display: 'inline-block', padding: '2px 6px', borderRadius: '5px', background: '#fce7f3', color: '#db2777', fontSize: '6px', fontWeight: '800', marginBottom: '5px' }}>{item.material}</div>
                                        <h3 onClick={handleNavigate} style={{ fontSize: '13px', fontWeight: '800', margin: '0 0 6px 0', color: '#1e293b', cursor: 'pointer' }}>{item.title}</h3>
                                        
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '8px' }}>
                                            <div style={{ fontSize: '9px', fontWeight: '900', color: '#ef4444' }}>LKR {item.price.toLocaleString()}.00</div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                {/* --- LIVE LIKE SYNC --- */}
                                                <div onClick={() => toggleLike(item.id)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                                    <img src="/img/heart.png" alt="" style={{ width: '9px', filter: likedProducts.includes(item.id) ? 'invert(15%) sepia(95%) saturate(6932%) hue-rotate(358deg)' : 'none', opacity: likedProducts.includes(item.id) ? 1 : 0.6 }} />
                                                    <span style={{ fontSize: '6px', color: '#64748b', fontWeight: '700' }}>{likedProducts.includes(item.id) ? item.likes + 1 : item.likes}</span>
                                                </div>

                                                {/* --- LIVE CART SYNC --- */}
                                                <div onClick={() => handleAddToCart(item)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                                    <img src="/img/cart.png" alt="" style={{ width: '9px', opacity: 0.7 }} />
                                                    <span style={{ fontSize: '6px', color: '#64748b', fontWeight: '600' }}>{quantityInCart}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        </div>
    );
};

const FilterButton = ({ icon, text, onClick }: any) => (
    <button onClick={onClick} style={{ padding: '8px 16px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '800', fontSize: '8px' }}>
        <img src={icon} alt="" style={{ width: '10px' }} /> {text}
    </button>
);

export default WomenCollection;