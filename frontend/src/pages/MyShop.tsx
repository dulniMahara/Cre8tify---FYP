import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import '../styles/dashboard.css';

interface DesignItem {
    id: number;
    title: string;
    price: number;
    image: string;
    status: 'Approved' | 'Submitted' | 'Rejected' | 'Draft' | 'hardcoded';
    updatedDate: string;
    sales: number;
    scale: number;
    rejectionReason?: string;
    description?: string;
    tshirtColor?: string;
    canvasState?: any;
    frontDesign?: string;
    frontPrintArea?: any;
    frontPrintAreaPx?: any;
}

const MyShop = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    // 🟢 NEW: State for live designs + combined list
    const [dbDesigns, setDbDesigns] = useState<DesignItem[]>([]);
    const [allDesigns, setAllDesigns] = useState<DesignItem[]>([]);
    const API_URL = "http://localhost:5000";

    // STATE FOR POPUPS
    const [rejectionPopup, setRejectionPopup] = useState<{ show: boolean, reason: string } | null>(null);
    const [previewPopup, setPreviewPopup] = useState<DesignItem | null>(null);

    // 🟢 NEW: State for Preview Modal Interactivity
    const [selectedColor, setSelectedColor] = useState('#e5e5e5'); // Default color
    const [selectedSize, setSelectedSize] = useState('M');         // Default size

    const hardcodedDesigns: DesignItem[] = [
        {
            id: 1, title: 'Spider Lily Abstract', price: 1450, image: '/img/shop1.png',
            status: 'Approved', updatedDate: '11 Oct 2025', sales: 2, scale: 1.3,
            description: "A minimal abstract representation of the Spider Lily flower, symbolizing memory and transformation. Perfect for casual streetwear."
        },
        {
            id: 2, title: 'Dark Moon Phase', price: 1450, image: '/img/shop2.png',
            status: 'Approved', updatedDate: '11 Oct 2025', sales: 3, scale: 0.9,
            description: "Detailed lunar cycle illustration on a dark aesthetic background. High-quality print suitable for night outs."
        },
        {
            id: 3, title: 'Evangelion Retro', price: 1450, image: '/img/shop3.png',
            status: 'Approved', updatedDate: '11 Oct 2025', sales: 3, scale: 1.0,
            description: "Retro anime style graphic featuring iconic mecha elements. A tribute to 90s classic animation."
        },
        {
            id: 4, title: 'Wave Aesthetic', price: 1450, image: '/img/shop4.png',
            status: 'Submitted', updatedDate: '12 Oct 2025', sales: 0, scale: 1.2,
            description: "Blue wave patterns inspired by Japanese woodblock prints. Calming and artistic."
        },
        {
            id: 5, title: 'One Piece Blue', price: 1450, image: '/img/shop5.png',
            status: 'Draft', updatedDate: '13 Oct 2025', sales: 0, scale: 1.4,
            description: "Fan art concept for One Piece. Draft version."
        },
        {
            id: 6, title: 'Glow Cross Tee', price: 1450, image: '/img/shop6.png',
            status: 'Rejected', updatedDate: '10 Oct 2025', sales: 0, scale: 1.1,
            description: "Neon cross design with glow effects.",
            rejectionReason: "Image resolution is too low (72 DPI). We require at least 300 DPI for printing. Please upload a higher quality file."
        },
    ];

    // 🟢 FETCH FROM BACKEND
    useEffect(() => {
        const fetchMyDesigns = async () => {
            const storedUser = localStorage.getItem('userInfo');
            if (!storedUser) {
                console.warn("User not logged in. Redirecting...");
                return;
            }

            const { token } = JSON.parse(storedUser);

            try {
                const response = await fetch(`${API_URL}/api/products/my-designs`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();

                // Convert Backend Model to Frontend DesignItem Interface
                const formattedDB = data.map((item: any) => ({
                    id: item._id, // MongoDB uses _id
                    title: item.title,
                    price: item.price,
                    image: item.mockupImages[0], // Take first mockup
                    status: item.status === 'Pending' ? 'Submitted' : item.status,
                    updatedDate: new Date(item.createdAt).toLocaleDateString('en-GB', {
                        day: 'numeric', month: 'short', year: 'numeric'
                    }),
                    sales: item.salesCount || 0,
                    scale: 1.0, // Default scale for DB items
                    description: item.description ? item.description.replace(/<[^>]*>?/gm, '') : '',
                    canvasState: item.canvasState,
                    tshirtColor: item.tshirtColor,
                    frontDesign: item.frontDesign,
                    frontPrintArea: item.frontPrintArea,
                    frontPrintAreaPx: item.frontPrintAreaPx
                }));

                setDbDesigns(formattedDB);
                // Combine: Newest DB designs first, then hardcoded ones
                setAllDesigns([...formattedDB, ...hardcodedDesigns]);
            } catch (error) {
                console.error("Failed to fetch designs", error);
                setAllDesigns(hardcodedDesigns); // Fallback to just hardcoded on error
            }
        };

        fetchMyDesigns();
    }, []);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Approved': return '/img/approved.png';
            case 'Submitted': return '/img/submit.png';
            case 'Rejected': return '/img/reject.png';
            case 'Draft': return '/img/draft.png';
            default: return '/img/draft.png';
        }
    };

    const filteredDesigns = allDesigns.filter(design => {
        const matchesTab = activeTab === 'All' || design.status === activeTab || (activeTab === 'Pending' && design.status === 'Submitted');
        const matchesSearch = design.title.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesTab && matchesSearch;
    });

    const stats = {
        total: allDesigns.length,
        approved: allDesigns.filter(d => d.status === 'Approved').length,
        pending: allDesigns.filter(d => d.status === 'Submitted').length,
        rejected: allDesigns.filter(d => d.status === 'Rejected').length,
        drafts: allDesigns.filter(d => d.status === 'Draft').length,
    };

    const handleEdit = (design: DesignItem) => {
        // 🟢 Send them back to the TOOL, not the SUBMIT page
        navigate('/design-tool', {
            state: {
                isEdit: true,
                // We pass the canvasState (layers, positions, text) 
                // so the DesignTool can "rebuild" the design
                savedLayers: (design as any).canvasState,
                selectedTshirtColor: design.tshirtColor
            }
        });
    };

    // Helper to open preview and reset selections
    const openPreview = (design: DesignItem) => {
        setPreviewPopup(design);
        setSelectedColor('#e5e5e5'); // Reset to first color
        setSelectedSize('M');        // Reset to Medium
    };
    // 🟢 PLACE IT HERE (After hooks, before the 'return')
    const handleLogout = () => {
        if (window.confirm("Are you sure you want to logout?")) {
            localStorage.removeItem('userInfo');
            localStorage.removeItem('token');
            navigate('/login');
        }
    };

    const handleProfileClick = () => {
        navigate('/profile');
    };

    return (
        <div className="dashboard-container">
            <Sidebar />

            <style>
                @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap');
                {`

                    /* 🟢 NEW SEARCH BAR STYLES */
                    .glass-search-bar {
                        display: flex;
                        align-items: center;
                        background: rgba(255, 255, 255, 0.15); /* Glassy background */
                        border: 1px solid rgba(255, 255, 255, 0.3); /* Distinct light border */
                        border-radius: 25px; /* Pill shape */
                        padding: 8px 10px;
                        width: 100%;
                        max-width: 225px;
                        backdrop-filter: blur(4px); /* Blur effect */
                        transition: all 0.3s ease;
                    }
                    .glass-search-bar:focus-within {
                        background: rgba(255, 255, 255, 0.25);
                        border-color: rgba(255, 255, 255, 0.6);
                        box-shadow: 0 0 8px rgba(255, 255, 255, 0.1);
                    }
                    .search-input {
                        background: transparent;
                        border: none;
                        outline: none;
                        color: white;
                        margin-left: 6px;
                        width: 100%;
                        font-size: 8px;
                        font-weight: 500;
                    }
                    .search-input::placeholder {
                        color: rgba(255, 255, 255, 0.8) !important;
                    }

                    .design-card { transition: transform 0.3s ease, box-shadow 0.3s ease; }
                    .design-card:hover { transform: translateY(-2px); box-shadow: 0 8px 15px rgba(0,0,0,0.1) !important; }
                    .search-input::placeholder {
                        color: white !important;
                        opacity: 0.8; /* Optional: makes it slightly transparent */
                    }
                    .tab-btn:hover { background: #e0e7ff !important; color: #0d375b !important; }
                    .tab-btn.active:hover { background: #0d375b !important; color: white !important; }
                    
                    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                    @keyframes scaleUp { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }

                    .preview-scroll::-webkit-scrollbar { width: 3px; }
                    .preview-scroll::-webkit-scrollbar-track { background: #f1f1f1; }
                    .preview-scroll::-webkit-scrollbar-thumb { background: #ccc; border-radius: 5px; }
                `}
            </style>

            <div className="main-content" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#f8fafc' }}>

                {/* HEADER */}
                <div className="top-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 20px', height: '45px' }}>
                    <div style={{ fontFamily: '"Instrument Serif", serif', fontSize: '24px', color: 'white', letterSpacing: '1px', fontStyle: 'italic', flex: 1 }}>
                        My Shop
                    </div>
                    {/* 🟢 NEW SEARCH BAR BLOCK */}
                    <div className="search-bar" style={{
                        flex: 2, maxWidth: '250px', display: 'flex', alignItems: 'center',
                        background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(3px)',
                        padding: '5px 10px', borderRadius: '15px', margin: '0 10px', border: '1px solid rgba(255,255,255,0.2)'
                    }}>
                        {/* Added filter to ensure icon is white */}
                        <img src="/img/search.png" alt="Search" style={{ width: '10px', opacity: 0.8, filter: 'brightness(0) invert(1)' }} />
                        <input
                            className="search-input"
                            type="text" placeholder="Search here" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ background: 'transparent', border: 'none', outline: 'none', color: 'white', marginLeft: '5px', width: '100%', fontSize: '8px' }}
                        />
                    </div>

                    {/* 🟢 FIXED: Increased gap to 15px */}
                    <div className="header-icons" style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', gap: '15px' }}>
                        <img src="/img/profile-picture.png" className="nav-icon" alt="Profile" style={{ cursor: 'pointer' }} onClick={() => navigate('/profile')} />
                        <img src="/img/notifi.png" className="nav-icon" alt="Notif" />
                        <img src="/img/logout.png" className="nav-icon" alt="Logout" style={{ width: '25px', height: '25px', cursor: 'pointer' }} onClick={handleLogout} />
                    </div>
                </div>

                <div className="content-wrapper" style={{ padding: '20px', flex: 1, maxWidth: '700px', margin: '0 auto', width: '100%' }}>

                    {/* STATS */}
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'space-between', marginBottom: '25px' }}>
                        <StatBox label="Total Designs" value={stats.total} />
                        <StatBox label="Approved" value={stats.approved} />
                        <StatBox label="Pending" value={stats.pending} />
                        <StatBox label="Rejected" value={stats.rejected} />
                        <StatBox label="Drafts" value={stats.drafts} />
                    </div>

                    {/* TABS */}
                    <div style={{ display: 'flex', gap: '6px', marginBottom: '18px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                        {['All', 'Submitted', 'Approved', 'Rejected', 'Draft'].map(tab => (
                            <button key={tab} onClick={() => setActiveTab(tab)} className={`tab-btn ${activeTab === tab ? 'active' : ''}`} style={{ padding: '5px 13px', borderRadius: '15px', border: activeTab === tab ? 'none' : '1px solid #cbd5e1', background: activeTab === tab ? '#0d375b' : 'white', color: activeTab === tab ? 'white' : '#64748b', fontWeight: '600', fontSize: '7px', cursor: 'pointer', transition: 'all 0.2s ease', boxShadow: activeTab === tab ? '0 2px 5px rgba(13, 55, 91, 0.2)' : 'none' }}>
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* GRID */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                        {filteredDesigns.map((design) => (
                            <div key={design.id} className="design-card" style={{ background: 'white', borderRadius: '10px', padding: '13px', boxShadow: '0 2px 10px rgba(0,0,0,0.04)', position: 'relative' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <img src={getStatusIcon(design.status)} alt={design.status} style={{ width: '9px', height: '9px' }} />
                                        <span style={{ fontSize: '7px', color: '#64748b', fontWeight: '600', letterSpacing: '0.3px' }}>{design.status.toUpperCase()}</span>
                                    </div>
                                </div>
                                <div style={{ height: '175px', background: '#f8fafc', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px', overflow: 'hidden', padding: '10px', position: 'relative' }}>
                                    <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                        {/* 1. The shirt image (Base or Snapshot) */}
                                        <img src={design.image} alt={design.title} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />

                                        {/* 2. LIVE COLOR OVERLAY - Using the base image as its own mask (requires transparent PNG) */}
                                        {design.status === 'hardcoded' && design.tshirtColor && (
                                            <div style={{
                                                position: 'absolute',
                                                top: 0, left: 0, right: 0, bottom: 0,
                                                backgroundColor: design.tshirtColor,
                                                mixBlendMode: 'multiply',
                                                WebkitMaskImage: `url(${design.image})`,
                                                maskImage: `url(${design.image})`,
                                                WebkitMaskSize: 'contain',
                                                WebkitMaskRepeat: 'no-repeat',
                                                WebkitMaskPosition: 'center',
                                                pointerEvents: 'none',
                                                zIndex: 2
                                            }}></div>
                                        )}

                                        {/* 3. LIVE DESIGN OVERLAY */}

                                    </div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                    <div style={{ fontWeight: '700', fontSize: '9px', fontFamily: '"Instrument Serif", serif', fontStyle: 'italic', color: '#1e293b' }}>{design.title}</div>
                                    <div style={{ background: '#f1f5f9', padding: '3px 6px', borderRadius: '4px', fontSize: '7px', fontWeight: '800', color: '#0d375b', border: '1px solid #e2e8f0' }}>LKR {design.price}</div>
                                </div>
                                <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
                                    {/* 🟢 UPDATED PREVIEW CLICK */}
                                    <ActionButton text="Preview" onClick={() => openPreview(design)} />
                                    <ActionButton text="Edit" onClick={() => handleEdit(design)} />
                                    <ActionButton text="Delete" isDestructive={true} onClick={() => alert(`Deleting ${design.title}`)} />
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '6px', color: '#94a3b8', borderTop: '1px solid #f1f5f9', paddingTop: '8px' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>📅 {design.updatedDate}</span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>🛍️ Sales: {design.sales.toString().padStart(2, '0')}</span>
                                </div>
                                {design.status === 'Rejected' && (
                                    <div style={{ marginTop: '10px', display: 'flex', gap: '5px' }}>
                                        <button onClick={() => setRejectionPopup({ show: true, reason: design.rejectionReason || "No reason provided." })} style={{ flex: 1, background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '5px 0', borderRadius: '15px', fontSize: '7px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}>
                                            <span style={{ fontSize: '7px', fontWeight: 'bold' }}>?</span> Reason
                                        </button>
                                        <button
                                            onClick={() => handleEdit(design)}
                                            style={{
                                                flex: 1,
                                                background: '#ef4444',
                                                color: 'white',
                                                border: 'none',
                                                padding: '5px 0',
                                                borderRadius: '15px',
                                                fontSize: '7px',
                                                fontWeight: '700',
                                                cursor: 'pointer',
                                                boxShadow: '0 2px 6px rgba(239, 68, 68, 0.3)'
                                            }}
                                        >
                                            Fix Design
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
                <Footer />
            </div>

            {/* REJECTION POPUP */}
            {rejectionPopup && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000, animation: 'fadeIn 0.2s ease-out' }}>
                    <div style={{ background: 'white', width: '250px', padding: '20px', borderRadius: '12px', boxShadow: '0 13px 25px -6px rgba(0, 0, 0, 0.25)', animation: 'scaleUp 0.3s ease-out', position: 'relative', textAlign: 'center' }}>
                        <button onClick={() => setRejectionPopup(null)} style={{ position: 'absolute', top: '10px', right: '10px', background: 'transparent', border: 'none', fontSize: '12px', cursor: 'pointer', color: '#94a3b8' }}>&times;</button>
                        <div style={{ width: '30px', height: '30px', background: '#fee2e2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px auto' }}>
                            <span style={{ fontSize: '15px' }}>⚠️</span>
                        </div>
                        <h2 style={{ fontSize: '12px', fontWeight: '800', color: '#1e293b', marginBottom: '5px' }}>Rejection Reason</h2>
                        <div style={{ height: '1px', width: '25px', background: '#ef4444', margin: '0 auto 10px auto' }}></div>
                        <p style={{ fontSize: '8px', color: '#64748b', lineHeight: '1.6', marginBottom: '15px', background: '#f8fafc', padding: '10px', borderRadius: '6px' }}>"{rejectionPopup.reason}"</p>
                        <button onClick={() => setRejectionPopup(null)} style={{ padding: '6px 15px', borderRadius: '15px', border: '1px solid #e2e8f0', background: 'white', color: '#64748b', fontSize: '7px', fontWeight: '600', cursor: 'pointer' }}>Close</button>
                    </div>
                </div>
            )}

            {/* PREVIEW POPUP */}
            {previewPopup && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000, animation: 'fadeIn 0.2s ease-out', backdropFilter: 'blur(3px)' }}>
                    <div style={{ background: 'white', width: '600px', height: '85vh', borderRadius: '10px', overflow: 'hidden', display: 'flex', animation: 'scaleUp 0.3s ease-out', position: 'relative', boxShadow: '0 25px 50px -10px rgba(0,0,0,0.3)' }}>

                        <button onClick={() => setPreviewPopup(null)} style={{ position: 'absolute', top: '13px', right: '13px', background: 'white', border: '1px solid #e2e8f0', width: '20px', height: '20px', borderRadius: '50%', fontSize: '12px', cursor: 'pointer', color: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, boxShadow: '0 2px 3px -1px rgba(0,0,0,0.1)' }}>&times;</button>

                        {/* LEFT: Image */}
                        <div style={{ flex: 1.2, background: '#f8fafc', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', borderRight: '1px solid #f1f5f9' }}>
                            <div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px' }}>
                                <img src={previewPopup.image} alt={previewPopup.title} style={{ width: '100%', maxHeight: '100%', objectFit: 'contain', filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.15))' }} />
                            </div>
                            <div style={{ display: 'flex', gap: '5px', marginTop: '10px' }}>
                                <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#334155' }}></div>
                                <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#cbd5e1' }}></div>
                                <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#cbd5e1' }}></div>
                            </div>
                        </div>

                        {/* RIGHT: Details */}
                        <div className="preview-scroll" style={{ flex: 1, padding: '25px', overflowY: 'auto' }}>
                            <h1 style={{ fontFamily: '"Instrument Serif", serif', fontSize: '21px', fontStyle: 'italic', marginBottom: '3px', lineHeight: '1.1', color: '#0f172a' }}>{previewPopup.title}</h1>
                            <div style={{ fontSize: '8px', color: '#64748b', marginBottom: '13px', fontStyle: 'italic' }}>by Artisa LK</div>

                            <div style={{ marginBottom: '15px' }}>
                                <div style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>LKR {previewPopup.price.toLocaleString()}.00</div>
                                <div style={{ fontSize: '7px', color: '#94a3b8', marginTop: '3px', fontStyle: 'italic' }}>Base: 850 | Designer: {previewPopup.price - 1100} | Service: 250</div>
                            </div>

                            <div style={{ marginBottom: '15px' }}>
                                <h3 style={{ fontSize: '9px', fontWeight: '700', fontFamily: '"Instrument Serif", serif', fontStyle: 'italic', marginBottom: '5px', color: '#1e293b' }}>Description</h3>
                                <p style={{ fontSize: '8px', color: '#475569', lineHeight: '1.7' }}>{previewPopup.description || "This uniquely crafted t-shirt blends comfort with expressive design, created to match a wide range of personal styles. The artwork features soft, minimal strokes that highlight subtle elegance while keeping the look modern."}</p>
                            </div>

                            {/* 🟢 INTERACTIVE COLORS */}
                            <div style={{ marginBottom: '13px' }}>
                                <div style={{ fontSize: '8px', fontWeight: '700', fontFamily: '"Instrument Serif", serif', fontStyle: 'italic', marginBottom: '5px', color: '#1e293b' }}>Colors</div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    {['#e5e5e5', '#ffffff', '#000000', '#bfdbfe', '#86efac'].map((c) => (
                                        <div
                                            key={c}
                                            onClick={() => setSelectedColor(c)}
                                            style={{
                                                width: '15px', height: '15px', borderRadius: '50%', background: c,
                                                border: selectedColor === c ? '1px solid #0f172a' : '1px solid #cbd5e1',
                                                cursor: 'pointer', transform: selectedColor === c ? 'scale(1.1)' : 'scale(1)',
                                                boxShadow: selectedColor === c ? '0 0 0 1px white, 0 0 0 2px #0f172a' : 'none',
                                                transition: 'all 0.2s'
                                            }}
                                        ></div>
                                    ))}
                                </div>
                            </div>

                            {/* 🟢 INTERACTIVE SIZES */}
                            <div style={{ marginBottom: '18px' }}>
                                <div style={{ fontSize: '8px', fontWeight: '700', fontFamily: '"Instrument Serif", serif', fontStyle: 'italic', marginBottom: '5px', color: '#1e293b' }}>Sizes</div>
                                <div style={{ display: 'flex', gap: '5px' }}>
                                    {['XS', 'S', 'M', 'L', 'XL'].map((s) => (
                                        <div
                                            key={s}
                                            onClick={() => setSelectedSize(s)}
                                            style={{
                                                width: '20px', height: '20px',
                                                border: selectedSize === s ? '1px solid #0f172a' : '1px solid #e2e8f0',
                                                background: selectedSize === s ? '#0f172a' : 'white',
                                                color: selectedSize === s ? 'white' : '#334155',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: '7px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s'
                                            }}
                                        >
                                            {s}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '5px', marginBottom: '13px', flexWrap: 'wrap' }}>
                                {['Try Live Preview', 'Customize Design', 'Request Designer Edit'].map(btn => (
                                    <button key={btn} style={{ padding: '4px 10px', borderRadius: '15px', background: '#e0f2fe', color: '#0369a1', border: 'none', fontSize: '7px', fontWeight: '700', cursor: 'not-allowed' }}>{btn}</button>
                                ))}
                            </div>

                            <button style={{ width: '100%', padding: '9px', background: '#0f172a', color: 'white', border: 'none', fontSize: '8px', fontWeight: '600', cursor: 'not-allowed', marginBottom: '20px' }}>Choose your purchase option</button>

                            <div style={{ background: '#dbeafe', padding: '10px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#94a3b8', overflow: 'hidden' }}>
                                    <img src="/img/profile-picture.png" alt="Designer" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '7px', fontWeight: '700', color: '#1e3a8a' }}>Designer Name</div>
                                    <div style={{ fontSize: '7px', color: '#1e40af', fontStyle: 'italic' }}>Ishara Deen</div>
                                    <div style={{ fontSize: '7px', color: '#1e40af', marginTop: '1px' }}>Shop Name: Studio Bloom</div>
                                </div>
                                <button style={{ background: '#0f172a', color: 'white', border: 'none', padding: '4px 8px', fontSize: '6px', fontWeight: '600', cursor: 'pointer' }}>Visit Shop</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const StatBox = ({ label, value }: { label: string, value: number }) => (
    <div style={{
        background: '#ffffff', padding: '10px 0', borderRadius: '6px', flex: 1, textAlign: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column',
        justifyContent: 'center', gap: '4px', transition: 'transform 0.2s, box-shadow 0.2s'
    }}
        onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 10px rgba(37,99,235,0.08)'; e.currentTarget.style.borderColor = '#bfdbfe'; }}
        onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.03)'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
    >
        <div style={{ fontSize: '7px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.3px' }}>{label}</div>
        <div style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>{value}</div>
    </div>
);

const ActionButton = ({ text, isDestructive = false, onClick }: { text: string, isDestructive?: boolean, onClick?: () => void }) => (
    <button
        onClick={onClick}
        style={{ background: isDestructive ? '#fff1f2' : '#f0f9ff', color: isDestructive ? '#be123c' : '#0369a1', border: `1px solid ${isDestructive ? '#fecdd3' : '#bae6fd'}`, padding: '5px 0', borderRadius: '6px', fontSize: '6px', cursor: 'pointer', fontWeight: '700', flex: 1, transition: 'background 0.2s' }}
        onMouseOver={(e) => { e.currentTarget.style.background = isDestructive ? '#ffe4e6' : '#e0f2fe' }}
        onMouseOut={(e) => { e.currentTarget.style.background = isDestructive ? '#fff1f2' : '#f0f9ff' }}
    >
        {text}
    </button>
);

export default MyShop;