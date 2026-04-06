import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import Header from '../components/Header'; // 🟢 The Smart Header handles the sync
import CollectionHero from '../components/CollectionHero';
import '../styles/dashboard.css';

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
    

    // 🛡️ 1. Grab the Context (Add this now!)
    const cartContext = useCart();
    const addToCart = cartContext ? cartContext.addToCart : null;

    // 🖼️ 2. Add the Profile State (To prevent that other error we saw in Women's)
    const [navProfileImg, setNavProfileImg] = useState<string>('/img/profile.png');

    // 🚀 3. Paste the Master handleAddToCart Function
    const handleAddToCart = (item: any) => {
        if (!item || !addToCart) {
            console.error("Cart system error");
            return;
        }

        const productWithDefaults = {
            id: item.id, 
            title: item.title,
            price: item.price,
            // 🖼️ Ensure image path is clean
            image: item.img ? (item.img.startsWith('/img/') ? item.img : `/img/${item.img}`) : (item.image || "/img/placeholder.png"),
            size: 'Choose Size', 
            color: 'Choose Color',
            quantity: 1, 
            selected: true,
            type: 'physical'
        };

        addToCart(productWithDefaults);
        alert(`${item.title} added to kids' cart! 🛒`);
    };

    // 🟢 HERO SLIDER LOGIC
    const [heroImageIndex, setHeroImageIndex] = useState(0);
    const heroImages = ['/img/kidscollect1.png', '/img/kidscollect2.png', '/img/kidscollect3.png'];
    
    useEffect(() => {
        const interval = setInterval(() => {
            setHeroImageIndex((prev) => (prev + 1) % heroImages.length);
        }, 3000);
        return () => clearInterval(interval);
    }, [heroImages.length]);

    // 🟢 UI & FILTER STATES
    const [likedProducts, setLikedProducts] = useState<any[]>([]);
    const [filterBy, setFilterBy] = useState('All Ages'); 
    const [filterOpen, setFilterOpen] = useState(false);
    const [visibleGirls, setVisibleGirls] = useState(8);
    const [visibleBoys, setVisibleBoys] = useState(8);

    const toggleLike = (id: any) => {
        setLikedProducts(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
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
                
                {/* 🔵 THE SMART HEADER 
                   By using this, we don't need any local profile state in this file. 
                   It will automatically sync with the image you upload in CustomerProfile. */}
                <Header mode="search" />

                <div className="content-wrapper" style={{ padding: '0', background: '#f8fafc', marginTop: '140px' }}>
                    <CollectionHero 
                        title="KIDS COLLECTION" 
                        subtitle="Soft cotton for girls & Active play for boys" 
                        image={heroImages[heroImageIndex]} 
                    />

                    <div style={{ padding: '0 60px 80px 60px' }}>
                        {/* FILTER SECTION */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '40px', marginTop: '20px' }}>
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

                        {/* GIRLS SECTION */}
                        <div style={{ marginBottom: '80px' }}>
                            <div style={sectionHeaderStyle('#db2777')}>
                                <h2 style={{ fontSize: '32px', fontWeight: '800', color: '#db2777', margin: 0 }}>GIRLS: Soft Cotton</h2>
                                <div style={{ height: '2px', flex: 1, background: 'linear-gradient(to right, #db2777, transparent)' }}></div>
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
                                    />
                                ))}
                            </div>
                            {visibleGirls < girlsList.length && (
                                <button onClick={() => setVisibleGirls(prev => prev + 4)} style={loadMoreBtn('#db2777')}>Load More Girls Designs</button>
                            )}
                        </div>

                        {/* BOYS SECTION */}
                        <div style={{ marginBottom: '80px' }}>
                            <div style={sectionHeaderStyle('#0284c7')}>
                                <h2 style={{ fontSize: '32px', fontWeight: '800', color: '#0284c7', margin: 0 }}>BOYS: Active Play</h2>
                                <div style={{ height: '2px', flex: 1, background: 'linear-gradient(to right, #0284c7, transparent)' }}></div>
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

// --- SUB-COMPONENTS & STYLES ---

const ProductCard = ({ item, likedProducts, toggleLike, color, onAddToCart }: any) => {
const navigate = useNavigate(); // 🚀 Hook for navigation

    const handleProductClick = () => {
    navigate(`/product/${item.id}`, { 
        state: { 
            product: {
                ...item,
                isKids: true,
                sizes: item.age.includes('5-10y') 
                    ? ['5-6y', '7-8y', '9-10y'] 
                    : ['11-12y', '13-14y', '15y+'],
                basePrice: 500, 
                designerCharge: 250, 
                serviceCharge: 150
            },
            // ✅ This is now correctly inside the state object
            selectedColor: '#FFFFFF' 
        } 
    });
};

    return (
        <div 
            className="product-card" 
            style={{ ...productCardMain, cursor: 'pointer' }} 
            onClick={handleProductClick}
        >
            <div style={productImgBox}>
                <img src={item.img} alt="" style={{ maxWidth: '85%', maxHeight: '85%', objectFit: 'contain', transform: `scale(${item.scale || 1})`, filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.05))' }} />
            </div>
            <div style={{ display: 'inline-block', padding: '4px 12px', borderRadius: '10px', background: `${color}15`, color: color, fontSize: '11px', fontWeight: '800', marginBottom: '10px', textTransform: 'uppercase' }}>{item.material}</div>
            <h3 style={{ fontSize: '24px', fontWeight: '800', margin: '0 0 5px 0', color: '#1e293b' }}>{item.title}</h3>
            <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '12px' }}>{item.age}</div>
            
            {/* Prevent like button from triggering navigation */}
            <div style={cardFooterStyle} onClick={(e) => e.stopPropagation()}>
                <div style={{ fontSize: '18px', fontWeight: '900', color: '#ef4444' }}>LKR {item.price.toLocaleString()}.00</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div onClick={() => toggleLike(item.id)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <img src="/img/heart.png" alt="" style={{ width: '18px', filter: likedProducts.includes(item.id) ? 'invert(15%) sepia(95%) saturate(6932%) hue-rotate(358deg)' : 'none', opacity: likedProducts.includes(item.id) ? 1 : 0.6 }} />
                        <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '700' }}>{likedProducts.includes(item.id) ? item.likes + 1 : item.likes}</span>
                    </div>
                    {/* 🛒 CART SECTION */}
                    <div 
                        onClick={(e) => { 
                            e.stopPropagation(); 
                            onAddToCart(item);
                        }} 
                        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
                    >
                        <img 
                            src="/img/cart.png" // 👈 Add the leading slash!
                            alt="Add to Cart" 
                            style={{ width: '18px', opacity: 0.7 }} 
                        />
                        <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>
                            {item.sales}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const FilterButton = ({ icon, text, onClick, active }: any) => (
    <button onClick={onClick} style={{ 
        padding: '16px 32px', background: active ? '#0d375b' : 'white', color: active ? 'white' : '#1e293b', 
        border: '2px solid #e2e8f0', borderRadius: '35px', cursor: 'pointer', display: 'flex', alignItems: 'center', 
        gap: '12px', fontWeight: '800', fontSize: '16px', transition: 'all 0.3s'
    }}>
        <img src={icon} alt="" style={{ width: '20px', filter: active ? 'invert(1)' : 'none' }} /> 
        {text}
    </button>
);

const DropdownItem = ({ text, onClick }: any) => (
    <div onClick={onClick} style={dropdownItemStyle} onMouseOver={(e) => (e.currentTarget.style.background = '#f1f5f9')} onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}>{text}</div>
);

// --- REUSABLE STYLE CONSTANTS ---
const dropdownStyle: React.CSSProperties = { position: 'absolute', top: '70px', right: 0, width: '240px', background: 'white', borderRadius: '20px', boxShadow: '0 20px 50px rgba(0,0,0,0.15)', padding: '10px', zIndex: 100, border: '1px solid #e2e8f0' };
const dropdownItemStyle: React.CSSProperties = { padding: '14px 20px', cursor: 'pointer', fontSize: '15px', color: '#334155', borderRadius: '12px', fontWeight: '600' };
const productGridStyle: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '30px' };
const sectionHeaderStyle = (color: string): React.CSSProperties => ({ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px' });
const loadMoreBtn = (color: string): React.CSSProperties => ({ marginTop: '50px', padding: '18px 45px', borderRadius: '40px', border: `3px solid ${color}`, color: color, background: 'transparent', fontSize: '18px', fontWeight: '900', cursor: 'pointer', display: 'block', margin: '50px auto 0', transition: '0.3s' });
const productCardMain: React.CSSProperties = { background: 'white', padding: '15px', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' };
const productImgBox: React.CSSProperties = { background: '#f8fafc', borderRadius: '18px', height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '15px', overflow: 'hidden' };
const cardFooterStyle: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '15px' };

export default KidsCollection;