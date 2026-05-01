import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import Header from '../components/Header'; 
import CollectionHero from '../components/CollectionHero';
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
    designScale = 1.0,
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
        { id: 201, gender: 'girl', title: 'Petal Soft Tee', price: 900, age: 'Kids (5-10y)', material: 'Soft Cotton', img: '/img/girlkid1.png', scale: 1.2, likes: 22, sales: 5},
        { id: 202, gender: 'girl', title: 'Daisy Dream', price: 950, age: 'Kids (5-10y)', material: 'Soft Cotton', img: '/img/girlkid2.png', scale: 1.3, likes: 12, sales: 2 },
        { id: 203, gender: 'girl', title: 'Pink Sparkle', price: 980, age: 'Kids (5-10y)', material: 'Soft Cotton', img: '/img/girlkid3.png', scale: 1.3, likes: 45, sales: 12 },
        { id: 204, gender: 'girl', title: 'Fairy Cotton', price: 1000, age: 'Kids (5-10y)', material: 'Soft Cotton', img: '/img/girlkid4.png', scale: 1.2, likes: 30, sales: 8 },
        { id: 205, gender: 'girl', title: 'Teen Floral', price: 1100, age: 'Teens (11y+)', material: 'Soft Cotton', img: '/img/girlteen1.png', scale: 1.3, likes: 55, sales: 20 },
        { id: 206, gender: 'girl', title: 'Chic Cotton', price: 1150, age: 'Teens (11y+)', material: 'Soft Cotton', img: '/img/girlteen2.png', scale: 1.3, likes: 60, sales: 15 },
        { id: 207, gender: 'girl', title: 'Urban Rose', price: 1200, age: 'Teens (11y+)', material: 'Soft Cotton', img: '/img/girlteen3.png', scale: 1.6, likes: 40, sales: 10 },
        { id: 208, gender: 'girl', title: 'Summer Breeze', price: 1250, age: 'Teens (11y+)', material: 'Soft Cotton', img: '/img/girlteen4.png', scale: 1.6, likes: 88, sales: 30 },
        { id: 209, gender: 'girl', title: 'Butterfly Garden', price: 920, age: 'Kids (5-10y)', material: 'Soft Cotton', img: '/img/girlkid5.png', scale: 1.3, likes: 15, sales: 4 },
        { id: 210, gender: 'girl', title: 'Berry Sweet', price: 940, age: 'Kids (5-10y)', material: 'Soft Cotton', img: '/img/girlkid6.png', scale: 1.3, likes: 19, sales: 6 },
        { id: 211, gender: 'girl', title: 'Modern Muse', price: 1300, age: 'Teens (11y+)', material: 'Soft Cotton', img: '/img/girlteen5.png', scale: 1.2, likes: 95, sales: 40 },
        { id: 212, gender: 'girl', title: 'Velvet Sky', price: 1350, age: 'Teens (11y+)', material: 'Soft Cotton', img: '/img/girlteen6.png', scale: 1.3, likes: 110, sales: 50 },
        { id: 301, gender: 'boy', title: 'Dino Dash', price: 950, age: 'Kids (5-10y)', material: 'Active Play', img: '/img/boykid1.png', scale: 1.4, likes: 18, sales: 7 },
        { id: 302, gender: 'boy', title: 'Speed Racer', price: 980, age: 'Kids (5-10y)', material: 'Active Play', img: '/img/boykid2.png', scale: 1.4, likes: 25, sales: 9 },
        { id: 303, gender: 'boy', title: 'Space Explorer', price: 1000, age: 'Kids (5-10y)', material: 'Active Play', img: '/img/boykid3.png', scale: 1.5, likes: 60, sales: 20 },
        { id: 304, gender: 'boy', title: 'Arctic Fox', price: 1050, age: 'Kids (5-10y)', material: 'Active Play', img: '/img/boykid4.png', scale: 1.4, likes: 33, sales: 11 },
        { id: 305, gender: 'boy', title: 'Tech Teen', price: 1200, age: 'Teens (11y+)', material: 'Active Play', img: '/img/boyteen1.png', scale: 1.3, likes: 50, sales: 15 },
        { id: 306, gender: 'boy', title: 'Vapor Street', price: 1250, age: 'Teens (11y+)', material: 'Active Play', img: '/img/boyteen2.png', scale: 1.4, likes: 70, sales: 22 },
        { id: 307, gender: 'boy', title: 'Gamer Core', price: 1300, age: 'Teens (11y+)', material: 'Active Play', img: '/img/boyteen3.png', scale: 1.2, likes: 44, sales: 18 },
        { id: 308, gender: 'boy', title: 'Shadow Runner', price: 1350, age: 'Teens (11y+)', material: 'Active Play', img: '/img/boyteen4.png', scale: 1.3, likes: 92, sales: 33 },
        { id: 309, gender: 'boy', title: 'Jungle Beat', price: 970, age: 'Kids (5-10y)', material: 'Active Play', img: '/img/boykid5.png', scale: 1.3, likes: 14, sales: 3 },
        { id: 310, gender: 'boy', title: 'Mountain Peak', price: 990, age: 'Kids (5-10y)', material: 'Active Play', img: '/img/boykid6.png', scale: 1.3, likes: 21, sales: 8 },
        { id: 311, gender: 'boy', title: 'Circuit Teen', price: 1400, age: 'Teens (11y+)', material: 'Active Play', img: '/img/boyteen5.png', scale: 1.3, likes: 120, sales: 45 },
        { id: 312, gender: 'boy', title: 'Ultra Sonic', price: 1450, age: 'Teens (11y+)', material: 'Active Play', img: '/img/boyteen6.png', scale: 1.3, likes: 150, sales: 55 }
];

const KidsCollection = () => {
    const navigate = useNavigate();
    
    // 🛡️ 1. Grab the Context (Including cartItems for live sync)
    const cartContext = useCart();
    const addToCart = cartContext ? cartContext.addToCart : null;
    const cartItems = cartContext ? cartContext.cartItems : [];

    // 🚀 2. handleAddToCart with alert
    const handleAddToCart = (item: any) => {
        if (!item || !addToCart) {
            console.error("Cart system error");
            return;
        }

        const productWithDefaults = {
            id: item.id, 
            title: item.title,
            price: item.price,
            image: item.img ? (item.img.startsWith('/img/') ? item.img : `/img/${item.img}`) : "/img/placeholder.png",
            size: 'Choose Size', 
            color: 'Choose Color',
            quantity: 1, 
            selected: true,
            type: 'physical'
        };

        addToCart(productWithDefaults);
        alert(`${item.title} added to kids' cart! 🛒`);
    };

    const [heroImageIndex, setHeroImageIndex] = useState(0);
    const heroImages = ['/img/kidscollect1.png', '/img/kidscollect2.png', '/img/kidscollect3.png'];
    const [backendProducts, setBackendProducts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // 🟢 FETCH APPROVED PRODUCTS FROM BACKEND
    useEffect(() => {
        const fetchDesignerProducts = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/products?category=kids');
                const data = await response.json();
                
                // Map backend products to match the UI format
                const mapped = data.map((p: any) => ({
                    ...p, // 🟢 Keep all design data
                    id: p._id,
                    title: p.title,
                    price: p.price,
                    likes: Math.floor(Math.random() * 50),
                    sales: p.salesCount || 0,
                    img: p.mockupImages[0] || '/img/kids1.png',
                    scale: 1.0,
                    fit: 'Kids Designer',
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
    const [filterBy, setFilterBy] = useState('All Ages'); 
    const [filterOpen, setFilterOpen] = useState(false);
    const [visibleGirls, setVisibleGirls] = useState(8);
    const [visibleBoys, setVisibleBoys] = useState(8);

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

    const getFiltered = (gender: string) => {
        let items = originalProducts.filter(p => p.gender === gender);
        if (filterBy !== 'All Ages') items = items.filter(p => p.age === filterBy);
        return items;
    };

    const girlsList = getFiltered('girl');
    const boysList = getFiltered('boy');

    return (
        <div className="dashboard-container">
            <Sidebar variant="customer" />
            <div className="main-content" style={{ display: 'flex', flexDirection: 'column' }}>
                <Header mode="search" userRole="customer" />

                <div className="content-wrapper collection-content" style={{ padding: '0', background: '#f8fafc', marginTop: '0px' }}>
                    <CollectionHero 
                        title="KIDS COLLECTION" 
                        subtitle="Soft cotton for girls & Active play for boys" 
                        image={heroImages[heroImageIndex]} 
                    />

                    <div style={{ padding: '0 30px 40px 30px' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px', marginTop: '10px' }}>
                            <div style={{ position: 'relative' }}>
                                <FilterButton 
                                    text={filterBy} 
                                    icon="/img/icon-filter.png" 
                                    onClick={() => setFilterOpen(!filterOpen)} 
                                    active={filterOpen || filterBy !== 'All Ages'} 
                                />
                                {filterOpen && (
                                    <div style={dropdownStyle}>
                                        <DropdownItem text="All Ages" onClick={() => { setFilterBy('All Ages'); setFilterOpen(false); }} />
                                        <DropdownItem text="Kids (5-10y)" onClick={() => { setFilterBy('Kids (5-10y)'); setFilterOpen(false); }} />
                                        <DropdownItem text="Teens (11y+)" onClick={() => { setFilterBy('Teens (11y+)'); setFilterOpen(false); }} />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* DESIGNER PICKS SECTION */}
                        {backendProducts.length > 0 && (
                            <div style={{ marginBottom: '40px' }}>
                                <div style={sectionHeaderStyle('#0d375b')}>
                                    <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#0d375b', margin: 0 }}>DESIGNER PICKS: Latest Creations</h2>
                                    <div style={{ height: '1px', flex: 1, background: 'linear-gradient(to right, #0d375b, transparent)' }}></div>
                                </div>
                                <div style={productGridStyle}>
                                    {backendProducts.map((item: any) => (
                                        <ProductCard 
                                            key={item.id} 
                                            item={item} 
                                            likedProducts={likedProducts} 
                                            toggleLike={toggleLike} 
                                            color="#0d375b" 
                                            onAddToCart={handleAddToCart} 
                                            cartItems={cartItems}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* GIRLS SECTION */}
                        <div style={{ marginBottom: '40px' }}>
                            <div style={sectionHeaderStyle('#db2777')}>
                                <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#db2777', margin: 0 }}>GIRLS: Soft Cotton</h2>
                                <div style={{ height: '1px', flex: 1, background: 'linear-gradient(to right, #db2777, transparent)' }}></div>
                            </div>
                            <div style={productGridStyle}>
                                {girlsList.slice(0, visibleGirls).map((item: any) => (
                                    <ProductCard 
                                        key={item.id} 
                                        item={item} 
                                        likedProducts={likedProducts} 
                                        toggleLike={toggleLike} 
                                        color="#db2777" 
                                        onAddToCart={handleAddToCart} 
                                        cartItems={cartItems} 
                                    />
                                ))}
                            </div>
                            {visibleGirls < girlsList.length && (
                                <button onClick={() => setVisibleGirls(prev => prev + 4)} style={loadMoreBtn('#db2777')}>Load More Girls Designs</button>
                            )}
                        </div>

                        {/* BOYS SECTION */}
                        <div style={{ marginBottom: '40px' }}>
                            <div style={sectionHeaderStyle('#0284c7')}>
                                <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#0284c7', margin: 0 }}>BOYS: Active Play</h2>
                                <div style={{ height: '1px', flex: 1, background: 'linear-gradient(to right, #0284c7, transparent)' }}></div>
                            </div>
                            <div style={productGridStyle}>
                                {boysList.slice(0, visibleBoys).map((item: any) => (
                                    <ProductCard 
                                        key={item.id} 
                                        item={item} 
                                        likedProducts={likedProducts} 
                                        toggleLike={toggleLike} 
                                        color="#0284c7" 
                                        onAddToCart={handleAddToCart}
                                        cartItems={cartItems} 
                                    />
                                ))}
                            </div>
                            {visibleBoys < boysList.length && (
                                <button onClick={() => setVisibleBoys(prev => prev + 4)} style={loadMoreBtn('#0284c7')}>Load More Boys Designs</button>
                            )}
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        </div>
    );
};

// --- SUB-COMPONENTS ---

const ProductCard = ({ item, likedProducts, toggleLike, color, onAddToCart, cartItems }: any) => {
    const navigate = useNavigate();

    // 🚀 LIVE SYNC LOGIC: Find quantity in the context
    const quantityInCart = cartItems?.find((c: any) => c.id === item.id)?.quantity || 0;

    const handleProductClick = () => {
        navigate(`/product/${item.id}`, { 
            state: { 
                product: {
                    ...item,
                    isKids: true,
                    sizes: item.age && item.age.includes('5-10y') ? ['5-6y', '7-8y', '9-10y'] : ['11-12y', '13-14y', '15y+'],
                    basePrice: 500, designerCharge: 250, serviceCharge: 150
                },
                selectedColor: '#FFFFFF' 
            } 
        });
    };

    return (
        <div className="product-card" style={{ ...productCardMain, cursor: 'pointer' }} onClick={handleProductClick}>
            <div style={{ ...productImgBox, position: 'relative', padding: item.isDesignerProduct ? '0' : '8px', height: '210px' }}>
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
            <div style={{ display: 'inline-block', padding: '2px 6px', borderRadius: '5px', background: `${color}15`, color: color, fontSize: '6px', fontWeight: '800', marginBottom: '5px', textTransform: 'uppercase' }}>{item.material || 'Kids Designer'}</div>
            <h3 style={{ fontSize: '12px', fontWeight: '800', margin: '0 0 3px 0', color: '#1e293b' }}>{item.title}</h3>
            <div style={{ fontSize: '6px', color: '#94a3b8', marginBottom: '6px' }}>{item.age || 'All Ages'}</div>
            
            <div style={cardFooterStyle} onClick={(e) => e.stopPropagation()}>
                <div style={{ fontSize: '9px', fontWeight: '900', color: '#ef4444' }}>LKR {item.price.toLocaleString()}.00</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div onClick={() => toggleLike(item.id)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <img src="/img/heart.png" alt="" style={{ width: '9px', filter: likedProducts.includes(item.id) ? 'invert(15%) sepia(95%) saturate(6932%) hue-rotate(358deg)' : 'none', opacity: likedProducts.includes(item.id) ? 1 : 0.6 }} />
                        <span style={{ fontSize: '6px', color: '#64748b', fontWeight: '700' }}>{likedProducts.includes(item.id) ? (item.likes || 0) + 1 : (item.likes || 0)}</span>
                    </div>

                    {/* 🟢 DYNAMIC CART SECTION */}
                    <div onClick={() => onAddToCart(item)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <img src="/img/cart.png" alt="Add to Cart" style={{ width: '9px', opacity: 0.7 }} />
                        <span style={{ fontSize: '6px', color: '#64748b', fontWeight: '600' }}>
                            {quantityInCart}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ... Styles remain the same ...
const FilterButton = ({ icon, text, onClick, active }: any) => (
    <button onClick={onClick} style={{ padding: '8px 16px', background: active ? '#0d375b' : 'white', color: active ? 'white' : '#1e293b', border: '1px solid #e2e8f0', borderRadius: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '800', fontSize: '8px', transition: 'all 0.3s' }}>
        <img src={icon} alt="" style={{ width: '10px', filter: active ? 'invert(1)' : 'none' }} /> {text}
    </button>
);

const DropdownItem = ({ text, onClick }: any) => (
    <div onClick={onClick} style={dropdownItemStyle} onMouseOver={(e) => (e.currentTarget.style.background = '#f1f5f9')} onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}>{text}</div>
);

const dropdownStyle: React.CSSProperties = { position: 'absolute', top: '35px', right: 0, width: '120px', background: 'white', borderRadius: '10px', boxShadow: '0 10px 25px rgba(0,0,0,0.15)', padding: '5px', zIndex: 100, border: '1px solid #e2e8f0' };
const dropdownItemStyle: React.CSSProperties = { padding: '7px 10px', cursor: 'pointer', fontSize: '8px', color: '#334155', borderRadius: '6px', fontWeight: '600' };
const productGridStyle: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' };
const sectionHeaderStyle = (color: string): React.CSSProperties => ({ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' });
const loadMoreBtn = (color: string): React.CSSProperties => ({ marginTop: '25px', padding: '9px 23px', borderRadius: '20px', border: `2px solid ${color}`, color: color, background: 'transparent', fontSize: '9px', fontWeight: '900', cursor: 'pointer', display: 'block', margin: '25px auto 0', transition: '0.3s' });
const productCardMain: React.CSSProperties = { background: 'white', padding: '8px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' };
const productImgBox: React.CSSProperties = { background: '#f8fafc', borderRadius: '9px', height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px', overflow: 'hidden' };
const cardFooterStyle: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '8px' };

export default KidsCollection;