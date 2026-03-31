import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import Header from '../components/Header'; // 🟢 1. Import the Smart Header
import CollectionHero from '../components/CollectionHero';
import '../styles/dashboard.css';

const MenCollection = () => {
    const navigate = useNavigate();

    // 🟢 2. HERO SLIDER STATE (Profile logic removed here)
    const [heroImageIndex, setHeroImageIndex] = useState(0);
    const heroImages = [
        '/img/mencollect1.png', 
        '/img/mencollect2.png', 
        '/img/mencollect3.png'
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setHeroImageIndex((prev) => (prev + 1) % heroImages.length);
        }, 3000);
        return () => clearInterval(interval);
    }, [heroImages.length]);

    // 🟢 UI STATES
    const [likedProducts, setLikedProducts] = useState<any[]>([]);
    const [sortOpen, setSortOpen] = useState(false);
    const [filterOpen, setFilterOpen] = useState(false);
    const [sortBy, setSortBy] = useState('Newest');
    const [filterBy, setFilterBy] = useState('All');
    
    // 🟢 PAGINATION STATE
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const toggleLike = (id: any) => { 
        setLikedProducts((prev: any) => 
            prev.includes(id) ? prev.filter((item: any) => item !== id) : [...prev, id]
        );
    };

    // 🟢 DATA
    const originalProducts = [
        { id: 101, title: 'Classic Urban Fit', price: 1350, likes: 42, sales: 10, img: '/img/men1.png', scale: 1.3, fit: 'Regular Fit' },
        { id: 102, title: 'Cyberpunk Shadow', price: 1550, likes: 65, sales: 15, img: '/img/men2.png', scale: 1.2, fit: 'Oversized Fit' },
        { id: 103, title: 'Minimalist Core', price: 1200, likes: 29, sales: 8, img: '/img/men3.png', scale: 1.3, fit: 'Boxy Fit' },
        { id: 104, title: 'Vintage Band Tee', price: 1400, likes: 88, sales: 30, img: '/img/men4.png', scale: 1.3, fit: 'Regular Fit' },
        { id: 105, title: 'Futuristic Kanji', price: 1650, likes: 110, sales: 22, img: '/img/men5.png', scale: 1.2, fit: 'Oversized Fit' },
        { id: 106, title: 'Desert Storm Tee', price: 1300, likes: 37, sales: 12, img: '/img/men6.png', scale: 1.3, fit: 'Regular Fit' },
        { id: 107, title: 'Graphite Oversized', price: 1700, likes: 210, sales: 45, img: '/img/men7.png', scale: 1.2, fit: 'Oversized Fit' },
        { id: 108, title: 'Electric Signal', price: 1450, likes: 54, sales: 19, img: '/img/men8.png', scale: 2.5, fit: 'Boxy Fit' },
        { id: 109, title: 'Midnight Stealth', price: 1800, likes: 12, sales: 4, img: '/img/men1.png', scale: 1.3, fit: 'Regular Fit' },
        { id: 110, title: 'Astral Heavy', price: 1100, likes: 98, sales: 30, img: '/img/men2.png', scale: 1.2, fit: 'Boxy Fit' },
        { id: 111, title: 'Vapor Wave', price: 1400, likes: 55, sales: 18, img: '/img/men3.png', scale: 1.3, fit: 'Oversized Fit' },
        { id: 112, title: 'Concrete Jungle', price: 1650, likes: 33, sales: 7, img: '/img/men4.png', scale: 1.3, fit: 'Boxy Fit' },
        { id: 113, title: 'Titanium Tee', price: 1200, likes: 77, sales: 22, img: '/img/men5.png', scale: 1.2, fit: 'Regular Fit' },
        { id: 114, title: 'Iron Sight', price: 1950, likes: 150, sales: 60, img: '/img/men6.png', scale: 1.3, fit: 'Boxy Fit' },
        { id: 115, title: 'Carbon Fiber', price: 1350, likes: 41, sales: 10, img: '/img/men7.png', scale: 1.2, fit: 'Oversized Fit' },
        { id: 116, title: 'Sunset Silhouette', price: 1500, likes: 88, sales: 25, img: '/img/men8.png', scale: 2.5, fit: 'Regular Fit' },
        { id: 117, title: 'Glitch Mode', price: 1700, likes: 20, sales: 3, img: '/img/men1.png', scale: 1.3, fit: 'Oversized Fit' },
        { id: 118, title: 'Static Noise', price: 1250, likes: 66, sales: 14, img: '/img/men2.png', scale: 1.2, fit: 'Boxy Fit' },
        { id: 119, title: 'Obsidian Oversized', price: 1450, likes: 92, sales: 33, img: '/img/men3.png', scale: 1.3, fit: 'Regular Fit' },
        { id: 120, title: 'Digital Nomad', price: 1100, likes: 110, sales: 45, img: '/img/men4.png', scale: 1.3, fit: 'Regular Fit' },
        { id: 121, title: 'Phantom Print', price: 1850, likes: 45, sales: 9, img: '/img/men5.png', scale: 1.2, fit: 'Oversized Fit' },
        { id: 122, title: 'Velocity Tee', price: 1300, likes: 38, sales: 11, img: '/img/men6.png', scale: 1.3, fit: 'Boxy Fit' },
        { id: 123, title: 'Abyss Depth', price: 1400, likes: 200, sales: 80, img: '/img/men7.png', scale: 1.2, fit: 'Regular Fit' },
        { id: 124, title: 'Summit Reach', price: 1550, likes: 50, sales: 12, img: '/img/men8.png', scale: 2.5, fit: 'Regular Fit' }
    ];

    // 🟢 PAGINATION & FILTER LOGIC
    const getProcessedProducts = () => {
        let products = [...originalProducts];
        if (filterBy !== 'All') products = products.filter(p => p.fit === filterBy);

        if (sortBy === 'Price: Low to High') products.sort((a, b) => a.price - b.price);
        else if (sortBy === 'Price: High to Low') products.sort((a, b) => b.price - a.price);
        else if (sortBy === 'Best Selling') products.sort((a, b) => b.sales - a.sales);

        const lastIdx = currentPage * itemsPerPage;
        const firstIdx = lastIdx - itemsPerPage;
        return { paginated: products.slice(firstIdx, lastIdx), total: products.length };
    };

    const { paginated: displayProducts, total: totalFiltered } = getProcessedProducts();
    const totalPages = Math.ceil(totalFiltered / itemsPerPage);

    return (
        <div className="dashboard-container">
            <Sidebar variant="customer" />
            
            <div className="main-content" style={{ display: 'flex', flexDirection: 'column' }}>
                
                {/* 🔵 3. THE SMART HEADER
                    This handles the navProfileImg sync automatically. */}
                <Header mode="search" />

                <div className="content-wrapper" style={{ padding: '0', overflowX: 'hidden', background: '#f8fafc', marginTop: '140px' }}>
                    <CollectionHero 
                        title="MEN COLLECTION" 
                        subtitle="Define your style with premium streetwear and comfort" 
                        image={heroImages[heroImageIndex]} 
                    />

                    <div style={{ padding: '0 60px 80px 60px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', padding: '10px 5px', borderBottom: '1px solid #f1f5f9' }}>
                            <div style={{ fontSize: '18px', color: '#64748b', fontWeight: '500' }}>
                                Showing <span style={{ fontWeight: '800', color: '#0d375b' }}>{displayProducts.length}</span> of {totalFiltered} Designs
                            </div>

                            <div style={{ display: 'flex', gap: '15px' }}>
                                <div style={{ position: 'relative' }}>
                                    <FilterButton icon="/img/icon-filter.png" text={filterBy === 'All' ? "Filter" : filterBy} onClick={() => { setFilterOpen(!filterOpen); setSortOpen(false); }} active={filterOpen || filterBy !== 'All'} />
                                    {filterOpen && (
                                        <div style={{ position: 'absolute', top: '60px', right: 0, width: '240px', background: 'white', borderRadius: '20px', boxShadow: '0 20px 50px rgba(13, 55, 91, 0.15)', padding: '20px', zIndex: 100, border: '1px solid #e2e8f0' }}>
                                            <div style={{ fontSize: '13px', fontWeight: '800', color: '#94a3b8', marginBottom: '12px', textTransform: 'uppercase' }}>By Fit</div>
                                            <DropdownItem text="Oversized Fit" onClick={() => { setFilterBy('Oversized Fit'); setCurrentPage(1); setFilterOpen(false); }} />
                                            <DropdownItem text="Boxy Fit" onClick={() => { setFilterBy('Boxy Fit'); setCurrentPage(1); setFilterOpen(false); }} />
                                            <DropdownItem text="Regular Fit" onClick={() => { setFilterBy('Regular Fit'); setCurrentPage(1); setFilterOpen(false); }} />
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
                                // 🚀 THE NAVIGATION LOGIC
                                const handleNavigate = () => {
                                    console.log("Navigating to Men Product:", item.title);
                                    navigate(`/product/${item.id}`, { 
                                        state: { 
                                            product: {
                                                ...item,
                                                // We ensure the price is passed as a string for our formatter
                                                price: `LKR ${item.price}`
                                            } 
                                        } 
                                    });
                                };

                                return (
                                    <div key={item.id} className="product-card" style={{ background: 'white', padding: '15px', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9', transition: 'all 0.3s ease', width: '100%', position: 'relative', overflow: 'visible' }}>
                                        
                                        {/* 🚀 IMAGE IS NOW CLICKABLE */}
                                        <div 
                                            onClick={handleNavigate}
                                            style={{ background: '#f8fafc', borderRadius: '18px', display: 'flex', justifyContent: 'center', marginBottom: '15px', height: '340px', alignItems: 'center', overflow: 'hidden', cursor: 'pointer' }}
                                        >
                                            <img 
                                                src={item.img} 
                                                alt={item.title} 
                                                style={{ maxWidth: '85%', maxHeight: '85%', objectFit: 'contain', filter: 'drop-shadow(0 15px 25px rgba(0,0,0,0.08))', transform: `scale(${item.scale || 1})` }} 
                                            />
                                        </div>

                                        <div style={{ padding: '0 10px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '5px' }}>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontSize: '11px', fontStyle: 'italic', color: '#94a3b8', marginBottom: '2px' }}>Artisa LK</div>
                                                    {/* 🚀 TITLE IS NOW CLICKABLE */}
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

                                            <div style={{ fontSize: '18px', fontWeight: '800', color: '#ef4444', margin: '12px 0' }}>
                                                LKR {item.price.toLocaleString()}.00
                                            </div>

                                            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '12px', gap: '15px' }}>
                                                <div onClick={(e) => { e.stopPropagation(); toggleLike(item.id); }} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                    <img src="/img/heart.png" alt="" style={{ width: '18px', filter: likedProducts.includes(item.id) ? 'invert(15%) sepia(95%) saturate(6932%) hue-rotate(358deg) brightness(95%) contrast(112%)' : 'none', opacity: likedProducts.includes(item.id) ? 1 : 0.7, transition: 'all 0.3s ease' }} />
                                                    <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>{likedProducts.includes(item.id) ? item.likes + 1 : item.likes}</span>
                                                </div>
                                                <img src="/img/cart.png" alt="" style={{ width: '18px', opacity: 0.7 }} />
                                                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>{item.sales}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* PAGINATION */}
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

export default MenCollection;