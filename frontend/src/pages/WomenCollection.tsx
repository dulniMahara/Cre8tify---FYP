import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import CollectionHero from '../components/CollectionHero';
import '../styles/dashboard.css';

const API_URL = "http://localhost:5000";

export const originalProducts = [
        { id: 1, title: 'Taste & See Minimal', price: 1200, likes: 56, sales: 6, img: '/img/shop1.png', scale: 1.5, fit: 'Regular Fit' },
        { id: 2, title: 'Abstract Line Art', price: 1450, likes: 32, sales: 12, img: '/img/shop2.png', scale: 1.1, fit: 'Oversized Fit' },
        { id: 3, title: 'Vintage Oversized', price: 1350, likes: 89, sales: 24, img: '/img/shop3.png', scale: 1.2, fit: 'Oversized Fit' },
        { id: 4, title: 'Neon Genesis Print', price: 1600, likes: 45, sales: 8, img: '/img/shop4.png', scale: 1.4, fit: 'Boxy Fit' },
        { id: 5, title: 'Cherry Blossom Tee', price: 1250, likes: 120, sales: 40, img: '/img/shop1.png', scale: 1.5, fit: 'Regular Fit' },
        { id: 6, title: 'Dark Soul Graphic', price: 1550, likes: 67, sales: 15, img: '/img/shop2.png', scale: 1.1, fit: 'Boxy Fit' },
        { id: 7, title: 'Cyberpunk City', price: 1750, likes: 210, sales: 55, img: '/img/shop3.png', scale: 1.2, fit: 'Regular Fit' },
        { id: 8, title: 'Retro Wave', price: 1300, likes: 44, sales: 9, img: '/img/shop4.png', scale: 1.4, fit: 'Oversized Fit' },
        // Page 2 Items
        { id: 9, title: 'Midnight Bloom', price: 1800, likes: 12, sales: 4, img: '/img/shop1.png', scale: 1.5, fit: 'Regular Fit' },
        { id: 10, title: 'Stellar Voyage', price: 1100, likes: 98, sales: 30, img: '/img/shop2.png', scale: 1.1, fit: 'Boxy Fit' },
        { id: 11, title: 'Electric Dream', price: 1400, likes: 55, sales: 18, img: '/img/shop3.png', scale: 1.2, fit: 'Oversized Fit' },
        { id: 12, title: 'Urban Legend', price: 1650, likes: 33, sales: 7, img: '/img/shop4.png', scale: 1.4, fit: 'Boxy Fit' },
        { id: 13, title: 'Pastel Paradise', price: 1200, likes: 77, sales: 22, img: '/img/shop1.png', scale: 1.5, fit: 'Regular Fit' },
        { id: 14, title: 'Chrome Hearts', price: 1950, likes: 150, sales: 60, img: '/img/shop2.png', scale: 1.1, fit: 'Boxy Fit' },
        { id: 15, title: 'Velvet Underground', price: 1350, likes: 41, sales: 10, img: '/img/shop3.png', scale: 1.2, fit: 'Oversized Fit' },
        { id: 16, title: 'Golden Hour', price: 1500, likes: 88, sales: 25, img: '/img/shop4.png', scale: 1.4, fit: 'Regular Fit' },
        // Page 3 Items
        { id: 17, title: 'Neon Nightlife', price: 1700, likes: 20, sales: 3, img: '/img/shop1.png', scale: 1.5, fit: 'Oversized Fit' },
        { id: 18, title: 'Static Signal', price: 1250, likes: 66, sales: 14, img: '/img/shop2.png', scale: 1.1, fit: 'Boxy Fit' },
        { id: 19, title: 'Lunar Eclipse', price: 1450, likes: 92, sales: 33, img: '/img/shop3.png', scale: 1.2, fit: 'Regular Fit' },
        { id: 20, title: 'Pixel Perfect', price: 1100, likes: 110, sales: 45, img: '/img/shop4.png', scale: 1.4, fit: 'Regular Fit' },
        { id: 21, title: 'Acid Rain', price: 1850, likes: 45, sales: 9, img: '/img/shop1.png', scale: 1.5, fit: 'Oversized Fit' },
        { id: 22, title: 'Solar Flare', price: 1300, likes: 38, sales: 11, img: '/img/shop2.png', scale: 1.1, fit: 'Boxy Fit' },
        { id: 23, title: 'Deep Sea Blue', price: 1400, likes: 200, sales: 80, img: '/img/shop3.png', scale: 1.2, fit: 'Regular Fit' },
        { id: 24, title: 'Mountain Peak', price: 1550, likes: 50, sales: 12, img: '/img/shop4.png', scale: 1.4, fit: 'Regular Fit' }
    ];

const WomenCollection = () => { // Or KidsCollection
    const navigate = useNavigate();
    const [navProfileImg, setNavProfileImg] = useState<string>('/img/profile.png');
    
    // 🛡️ 1. Grab the context (Same as your Men's section)
    const cartContext = useCart();
    const addToCart = cartContext ? cartContext.addToCart : null;

    // 🚀 2. Paste your handleAddToCart here
    const handleAddToCart = (item: any) => {
        if (!item || !addToCart) {
            console.error("Cart error");
            return;
        }

        const productWithDefaults = {
            id: item.id, 
            title: item.title,
            price: item.price,
            // Ensures image paths are clean for Women/Kids too
            image: item.img ? (item.img.startsWith('/img/') ? item.img : `/img/${item.img}`) : (item.image || "/img/placeholder.png"),
            size: 'Choose Size', 
            color: 'Choose Color',
            quantity: 1, 
            selected: true,
            type: 'physical'
        };

        addToCart(productWithDefaults);
        alert(`${item.title} added! 🛒`);
    };

    // 🟢 1. HERO SLIDER STATE
    const [heroImageIndex, setHeroImageIndex] = useState(0);
    const heroImages = ['/img/womencollect1.png', '/img/womencollect2.png', '/img/womencollect3.png'];

    useEffect(() => {
        const interval = setInterval(() => {
            setHeroImageIndex((prev) => (prev + 1) % heroImages.length);
        }, 3000);

        const storedUser = localStorage.getItem('userInfo');
        if (storedUser) {
            const userObj = JSON.parse(storedUser);
            if (userObj.profileImage) {
                const fullUrl = userObj.profileImage.startsWith('http') 
                    ? userObj.profileImage 
                    : `${API_URL}${userObj.profileImage.startsWith('/') ? '' : '/'}${userObj.profileImage}`;
                setNavProfileImg(fullUrl);
            }
        }
        
        return () => clearInterval(interval);
    }, [heroImages.length]);

    // 🟢 2. UI & DATA STATES
    const [likedProducts, setLikedProducts] = useState<any[]>([]);
    const [sortOpen, setSortOpen] = useState(false);
    const [filterOpen, setFilterOpen] = useState(false);
    const [sortBy, setSortBy] = useState('Newest');
    const [filterBy, setFilterBy] = useState('All');
    
    // 🟢 3. PAGINATION STATE
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const toggleLike = (id: any) => { 
        setLikedProducts((prev: any) => 
            prev.includes(id) ? prev.filter((item: any) => item !== id) : [...prev, id]
        );
    };

    

    // 🟢 5. LOGIC: FILTER -> SORT -> PAGINATE
    const getProcessedProducts = () => {
        let products = [...originalProducts];

        // A. Filter
        if (filterBy !== 'All' && !filterBy.includes('LKR')) products = products.filter(p => p.fit === filterBy);
        if (filterBy === 'Under LKR 1,500') products = products.filter(p => p.price < 1500);
        else if (filterBy === 'Above LKR 1,500') products = products.filter(p => p.price >= 1500);

        // B. Sort
        if (sortBy === 'Price: Low to High') products.sort((a, b) => a.price - b.price);
        else if (sortBy === 'Price: High to Low') products.sort((a, b) => b.price - a.price);
        else if (sortBy === 'Best Selling') products.sort((a, b) => b.sales - a.sales);

        // C. Paginate
        const lastIdx = currentPage * itemsPerPage;
        const firstIdx = lastIdx - itemsPerPage;
        return {
            paginated: products.slice(firstIdx, lastIdx),
            totalFiltered: products.length
        };
    };

    const { paginated: displayProducts, totalFiltered } = getProcessedProducts();
    const totalPages = Math.ceil(totalFiltered / itemsPerPage);

    return (
        <div className="dashboard-container">
            <Sidebar variant="customer" />

            <div className="main-content">
               <Header mode="search" />
                <div className="content-wrapper" style={{ padding: '0', marginTop: '0', overflowX: 'hidden'}}>
                    <CollectionHero title="WOMEN COLLECTION" subtitle="Designed to match your vibe and comfort" image={heroImages[heroImageIndex]} />

                    <div style={{ padding: '0 60px 80px 60px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '50px', padding: '10px 5px', borderBottom: '1px solid #f1f5f9' }}>
                            <div style={{ fontSize: '18px', color: '#64748b', fontWeight: '500' }}>
                                Showing <span style={{ fontWeight: '800', color: '#0d375b' }}>{displayProducts.length}</span> of {totalFiltered} Designs
                            </div>

                            <div style={{ display: 'flex', gap: '20px' }}>
                                <div style={{ position: 'relative' }}>
                                    <FilterButton icon="/img/icon-filter.png" text={filterBy === 'All' ? "Filter" : filterBy} onClick={() => { setFilterOpen(!filterOpen); setSortOpen(false); }} active={filterOpen || filterBy !== 'All'} />
                                    {filterOpen && (
                                        <div style={{ position: 'absolute', top: '60px', right: 0, width: '260px', background: 'white', borderRadius: '20px', boxShadow: '0 20px 50px rgba(13, 55, 91, 0.15)', padding: '20px', zIndex: 100, border: '1px solid #e2e8f0' }}>
                                            <div style={{ fontSize: '13px', fontWeight: '800', color: '#94a3b8', marginBottom: '12px', textTransform: 'uppercase' }}>By Fit</div>
                                            <DropdownItem text="Oversized Fit" onClick={() => { setFilterBy('Oversized Fit'); setCurrentPage(1); setFilterOpen(false); }} />
                                            <DropdownItem text="Boxy Fit" onClick={() => { setFilterBy('Boxy Fit'); setCurrentPage(1); setFilterOpen(false); }} />
                                            <DropdownItem text="Regular Fit" onClick={() => { setFilterBy('Regular Fit'); setCurrentPage(1); setFilterOpen(false); }} />
                                            <div style={{ height: '1px', background: '#f1f5f9', margin: '15px 0' }}></div>
                                            <div style={{ fontSize: '13px', fontWeight: '800', color: '#94a3b8', marginBottom: '12px', textTransform: 'uppercase' }}>Price Range</div>
                                            <DropdownItem text="Under LKR 1,500" onClick={() => { setFilterBy('Under LKR 1,500'); setCurrentPage(1); setFilterOpen(false); }} />
                                            <DropdownItem text="Above LKR 1,500" onClick={() => { setFilterBy('Above LKR 1,500'); setCurrentPage(1); setFilterOpen(false); }} />
                                            <div style={{ height: '1px', background: '#f1f5f9', margin: '15px 0' }}></div>
                                            <DropdownItem text="Reset All" onClick={() => { setFilterBy('All'); setCurrentPage(1); setFilterOpen(false); }} />
                                        </div>
                                    )}
                                </div>

                                <div style={{ position: 'relative' }}>
                                    <FilterButton icon="/img/icon-sort.png" text={`Sort: ${sortBy}`} onClick={() => { setSortOpen(!sortOpen); setFilterOpen(false); }} active={sortOpen} />
                                    {sortOpen && (
                                        <div style={{ position: 'absolute', top: '60px', right: 0, width: '240px', background: 'white', borderRadius: '20px', boxShadow: '0 20px 50px rgba(13, 55, 91, 0.15)', padding: '12px', zIndex: 100, border: '1px solid #e2e8f0' }}>
                                            <DropdownItem text="Newest" onClick={() => { setSortBy('Newest'); setSortOpen(false); }} />
                                            <DropdownItem text="Best Selling" onClick={() => { setSortBy('Best Selling'); setSortOpen(false); }} />
                                            <DropdownItem text="Price: Low to High" onClick={() => { setSortBy('Price: Low to High'); setSortOpen(false); }} />
                                            <DropdownItem text="Price: High to Low" onClick={() => { setSortBy('Price: High to Low'); setSortOpen(false); }} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                       {/* PRODUCT GRID */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '30px' }}>
                            {displayProducts.map((item: any) => {
                                
                                // 🚀 1. THE SMART SCALER LOGIC
                                // This shrinks shop1 and shop4 specifically so they match the visual weight of others.
                                const getSmartScale = (imgName: string) => {
                                    if (imgName.includes('shop1.png') || imgName.includes('shop4.png')) {
                                        return 1.1; // Shrink these slightly
                                    }
                                    return item.scale || 1.2; // Use original item scale or default 1.2
                                };

                                // 🚀 2. THE NAVIGATION LOGIC
                                const handleNavigate = () => {
                                    navigate(`/product/${item.id}`, { 
                                        state: { 
                                            product: {
                                                ...item,
                                                price: item.price.toString().includes('LKR') 
                                                    ? item.price 
                                                    : `LKR ${item.price.toLocaleString()}`
                                            } 
                                        } 
                                    });
                                };

                               return (
                            <div key={item.id} className="product-card" style={{ background: 'white', padding: '15px', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9', transition: 'all 0.3s ease', width: '100%', position: 'relative' }}>
                                
                                {/* 🚀 CLICKABLE IMAGE WRAPPER */}
                                <div 
                                    onClick={handleNavigate}
                                    style={{ 
                                        background: '#f8fafc', 
                                        borderRadius: '18px', 
                                        display: 'flex', 
                                        justifyContent: 'center', 
                                        marginBottom: '15px', 
                                        height: '340px', 
                                        alignItems: 'center', 
                                        overflow: 'hidden', 
                                        cursor: 'pointer',
                                        padding: '15px'
                                    }}
                                >
                                    <img 
                                        src={item.img} 
                                        alt={item.title} 
                                        style={{ 
                                            maxWidth: '85%', 
                                            maxHeight: '85%', 
                                            objectFit: 'contain', 
                                            filter: 'drop-shadow(0 15px 25px rgba(0,0,0,0.08))', 
                                            transform: `scale(${getSmartScale(item.img)})` 
                                        }} 
                                    />
                                </div>

                                <div style={{ padding: '0 10px' }}>
                                    {/* Header: Brand & View Details */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '5px' }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '11px', fontStyle: 'italic', color: '#94a3b8', marginBottom: '2px' }}>Artisa LK</div>
                                            <h3 
                                                onClick={handleNavigate}
                                                style={{ fontSize: '26px', fontWeight: '800', margin: '0', color: '#1e293b', lineHeight: '1.2', cursor: 'pointer' }}
                                            >
                                                {item.title}
                                            </h3>
                                        </div>
                                        <span 
                                            onClick={handleNavigate} 
                                            style={{ fontSize: '11px', color: '#64748b', fontStyle: 'italic', textDecoration: 'underline', cursor: 'pointer', marginLeft: '10px' }}
                                        >
                                            View Details
                                        </span>
                                    </div>

                                    {/* --- 🟢 THE UPDATED FOOTER (Price Left, Icons Right) --- */}
                                    <div style={{ 
                                        display: 'flex', 
                                        justifyContent: 'space-between', 
                                        alignItems: 'center', 
                                        borderTop: '1px solid #f1f5f9', 
                                        paddingTop: '15px', 
                                        marginTop: '12px' 
                                    }}>
                                        {/* Price on the Left */}
                                        <div style={{ fontSize: '18px', fontWeight: '900', color: '#ef4444' }}>
                                            {item.price.toString().includes('LKR') ? item.price : `LKR ${item.price.toLocaleString()}.00`}
                                        </div>

                                        {/* Icons on the Right */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                            
                                            {/* Heart Section */}
                                            <div 
                                                onClick={(e) => { e.stopPropagation(); toggleLike(item.id); }} 
                                                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
                                            >
                                                <img 
                                                    src="/img/heart.png" 
                                                    alt="" 
                                                    style={{ 
                                                        width: '18px', 
                                                        filter: likedProducts.includes(item.id) ? 'invert(15%) sepia(95%) saturate(6932%) hue-rotate(358deg) brightness(95%) contrast(112%)' : 'none', 
                                                        opacity: likedProducts.includes(item.id) ? 1 : 0.6 
                                                    }} 
                                                />
                                                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '700' }}>
                                                    {likedProducts.includes(item.id) ? (item.likes || 0) + 1 : (item.likes || 0)}
                                                </span>
                                            </div>

                                            {/* Cart Section - NOW WITH POPUP LOGIC */}
                                            <div 
                                                onClick={(e) => { 
                                                    e.stopPropagation(); 
                                                    handleAddToCart(item); // 👈 This triggers the actual cart add + alert!
                                                }} 
                                                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
                                            >
                                                <img 
                                                    src="/img/cart.png" 
                                                    alt="Add to Cart" 
                                                    style={{ width: '18px', opacity: 0.7 }} 
                                                />
                                                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '700' }}>
                                                    {item.sales || 0}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                           );
                        })}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', marginTop: '80px' }}>
                            <PaginationBtn text="<" onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} />
                            {[...Array(totalPages)].map((_, i) => (
                                <PaginationBtn key={i} text={(i + 1).toString()} active={currentPage === i + 1} onClick={() => setCurrentPage(i + 1)} />
                            ))}
                            <PaginationBtn text=">" onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} />
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        </div>
    );
};

// ==================== SUB-COMPONENTS ====================
const FilterButton = ({ icon, text, onClick, active }: any) => (
    <button onClick={onClick} style={{ padding: '12px 24px', background: active ? '#0d375b' : 'white', color: active ? 'white' : '#1e293b', border: '1px solid #e2e8f0', borderRadius: '30px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', boxShadow: '0 4px 10px rgba(0,0,0,0.03)', transition: 'all 0.2s', minWidth: '140px', justifyContent: 'center' }}>
        <img src={icon} alt="" style={{ width: '16px', opacity: active ? 1 : 0.7, filter: active ? 'invert(1)' : 'none' }} /> {text}
    </button>
);

const DropdownItem = ({ text, onClick }: any) => (
    <div onClick={onClick} style={{ padding: '10px 15px', borderRadius: '10px', fontSize: '14px', color: '#334155', cursor: 'pointer', transition: 'background 0.2s', fontWeight: '500' }} onMouseOver={(e) => e.currentTarget.style.background = '#f1f5f9'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>{text}</div>
);

const PaginationBtn = ({ text, active, onClick }: any) => (
    <button onClick={onClick} style={{ width: '45px', height: '45px', borderRadius: '12px', border: 'none', background: active ? '#0d375b' : 'white', color: active ? 'white' : '#64748b', fontSize: '16px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>{text}</button>
);

export default WomenCollection;