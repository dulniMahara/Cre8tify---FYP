import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { getUserInfo, getToken } from '../utils/auth';
import MockupPreview from '../components/MockupPreview';
import '../styles/dashboard.css';

const API_URL = "http://localhost:5000";

// --- GLOBAL STYLES ---
const cardStyle = { background: '#0f172a', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.3)', position: 'relative' as const, border: '1px solid rgba(255,255,255,0.1)' };
const imageContainerStyle = { background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '15px', position: 'relative' as const };
const approveBtnStyle = { flex: 1, padding: '10px', background: '#22c55e', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold' as const, fontSize: '12px', cursor: 'pointer' };
const rejectBtnStyle = { flex: 1, padding: '10px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold' as const, fontSize: '12px', cursor: 'pointer' };
const cancelBtnStyle = {
    background: 'transparent',
    color: '#94a3b8',
    padding: '10px 20px',
    borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.1)',
    fontWeight: 'bold' as const,
    cursor: 'pointer'
};
const tabBtnStyle: React.CSSProperties = { border: '1px solid rgba(255,255,255,0.1)', padding: '10px 25px', borderRadius: '30px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s', minWidth: '120px', textAlign: 'center' };

const tableCardStyle = {
    background: '#0f172a',
    borderRadius: '16px',
    padding: '0',
    overflow: 'hidden',
    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
    border: '1px solid rgba(255,255,255,0.1)'
};

const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse' as const,
    color: '#f1f5f9'
};

const thStyle = {
    background: 'rgba(255,255,255,0.03)',
    color: '#94a3b8',
    fontSize: '11px',
    textTransform: 'uppercase' as const,
    fontWeight: '700',
    textAlign: 'left' as const,
    borderBottom: '1px solid rgba(255,255,255,0.1)'
};

const tdStyle = {
    padding: '16px 20px',
    fontSize: '13px',
    color: '#cbd5e1',
    borderBottom: '1px solid rgba(255,255,255,0.05)'
};

const tdRowStyle = {
    transition: 'background 0.2s ease'
};

const inputStyle = {
    width: '100%',
    padding: '10px 15px',
    borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.1)',
    background: '#1e293b',
    color: 'white',
    fontSize: '13px',
    outline: 'none',
    transition: 'border 0.3s'
};

const selectStyle = {
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.1)',
    background: '#1e293b',
    color: 'white',
    fontSize: '12px',
    cursor: 'pointer',
    outline: 'none'
};

const modalOverlayStyle = {
    position: 'fixed' as const,
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.8)',
    backdropFilter: 'blur(5px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
};

const modalContentStyle = {
    background: '#0f172a',
    padding: '30px',
    borderRadius: '20px',
    width: '90%',
    boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: 'white'
};

const primaryBtnStyle = {
    background: '#38bdf8',
    color: 'white',
    padding: '10px 20px',
    borderRadius: '8px',
    border: 'none',
    fontWeight: 'bold' as const,
    cursor: 'pointer',
    transition: 'all 0.3s'
};

const textareaStyle = { width: '100%', height: '100px', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: '#1e293b', color: 'white', fontSize: '13px', outline: 'none', marginBottom: '15px' };
const labelStyle = { display: 'block', fontSize: '11px', fontWeight: 'bold' as const, color: '#94a3b8', marginBottom: '4px' };

const BackHeader = ({ title }: { title: string }) => {
    const navigate = useNavigate();
    return (
        <div style={{ padding: '15px 30px', background: '#0f2950', display: 'flex', alignItems: 'center', gap: '15px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', height: '60px' }}>
            <button
                onClick={() => navigate('/admin-dashboard')}
                style={{ background: 'none', border: 'none', color: 'white', padding: '8px 15px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.3s' }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
            >
                <img src="/img/back.png" style={{ width: '14px', height: '14px', objectFit: 'contain', filter: 'invert(1)' }} alt="back" /> Back
            </button>
            <h2 style={{ color: 'white', margin: 0, fontSize: '18px', flex: 1, textAlign: 'center', marginRight: '50px' }}>{title}</h2>
        </div>
    );
};

// -------------------------------------------------------------
// 1. MARKETPLACE OPERATIONS (The Heart of the App)
// -------------------------------------------------------------
const MarketplaceOperations = () => {
    const [activeTab, setActiveTab] = useState('Categories');
    const [approvals, setApprovals] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [orders, setOrders] = useState<any[]>([]);
    const [requests, setRequests] = useState<any[]>([]);
    const [selectedOrderDetails, setSelectedOrderDetails] = useState<any>(null);
    const [showOrderDetailsModal, setShowOrderDetailsModal] = useState(false);

    // Order Filtering & Search
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');

    // Approvals State
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [reason, setReason] = useState('');

    // Category State
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState<any>(null);
    const PREDEFINED_COLORS = [
        { name: 'White', hex: '#FFFFFF' }, { name: 'Kiwi', hex: '#8fa749' }, { name: 'Yellow Haze', hex: '#fadfa6' },
        { name: 'Cornsilk', hex: '#f7ef8f' }, { name: 'Light Blue', hex: '#d6e6f7' }, { name: 'Light Pink', hex: '#fee0eb' },
        { name: 'Charcoal', hex: '#2C2C2C' }, { name: 'Khaki', hex: '#F0E68C' }, { name: 'Baby Blue', hex: '#E0FFFF' },
        { name: 'Lavender', hex: '#E6E6FA' }, { name: 'Beige', hex: '#F5F5DC' }, { name: 'Standard Grey', hex: '#808080' },
        { name: 'Silver', hex: '#C0C0C0' }, { name: 'Light Salmon', hex: '#FFA07A' }, { name: 'Sky Blue', hex: '#87CEFA' },
        { name: 'Pale Turquoise', hex: '#AFEEEE' }, { name: 'Plum Light', hex: '#DDA0DD' }, { name: 'Mint Green', hex: '#98FB98' }
    ];
    const PREDEFINED_SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'];

    const [categoryForm, setCategoryForm] = useState<{
        name: string; category: string; material: string; basePrice: number | string;
        image: string; colors: string[]; sizes: string[]; fit: string; gsm: string;
    }>({
        name: '', category: '', material: 'Premium Cotton', basePrice: '',
        image: '', colors: [], sizes: [], fit: 'Standard', gsm: '200 GSM'
    });

    // Payouts & Financials State
    const [financialSummary, setFinancialSummary] = useState<any>(null);
    const [designerPayouts, setDesignerPayouts] = useState<any[]>([]);
    const [showPayoutModal, setShowPayoutModal] = useState(false);
    const [payoutForm, setPayoutForm] = useState({ designerId: '', name: '', amount: '', method: 'Bank Transfer', note: '' });
    const [allOrders, setAllOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [settings, setSettings] = useState<any[]>([]);
    const [selectedDesignerHistory, setSelectedDesignerHistory] = useState<any>(null);
    const [showDesignerHistoryModal, setShowDesignerHistoryModal] = useState(false);

    // Helper to get a dynamic setting with a fallback
    const getSettingValue = (key: string, fallback: any) => {
        const s = settings.find(st => st.key === key);
        return s ? s.value : fallback;
    };

    const activeTabRef = React.useRef(activeTab);
    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
        activeTabRef.current = tab;
    };

    useEffect(() => {
        const fetchAll = async () => {
            setLoading(true);
            console.log("[Admin] Initializing parallel data fetch...");

            // We'll run them all in parallel but won't let one hang the whole UI
            // Payouts can be slow, so we prioritize the others
            try {
                await Promise.allSettled([
                    fetchData('Approvals'),
                    fetchData('Categories'),
                    fetchData('Orders'),
                    fetchData('Payouts'),
                    fetchData('Requests'),
                    fetchData('Customizations'),
                    fetchData('Settings')
                ]);
            } catch (err) {
                console.error("[Admin] Parallel fetch error:", err);
            } finally {
                setLoading(false);
                console.log("[Admin] Initial load complete.");
            }
        };
        fetchAll();
    }, []);

    const fetchData = async (tab: string) => {
        const parsedUser = getUserInfo('admin');
        if (!parsedUser) return;
        const token = getToken('admin');

        if (parsedUser.role !== 'admin') return;

        try {
            if (tab === 'Payouts') {
                const [sumRes, desRes] = await Promise.all([
                    fetch(`${API_URL}/api/admin/financial/summary`, { headers: { 'Authorization': `Bearer ${token}` } }),
                    fetch(`${API_URL}/api/admin/financial/designers`, { headers: { 'Authorization': `Bearer ${token}` } })
                ]);
                if (sumRes.ok) setFinancialSummary(await sumRes.json());
                if (desRes.ok) {
                    const designers = await desRes.json();
                    setDesignerPayouts(Array.isArray(designers) ? designers : []);
                }
                return;
            }

            let endpoint = '';
            if (tab === 'Approvals') endpoint = '/api/products/admin/pending';
            else if (tab === 'Categories') endpoint = '/api/base-products';
            else if (tab === 'Orders') endpoint = '/api/admin/orders';
            else if (tab === 'Requests') endpoint = '/api/requests?type=fulfillment';
            else if (tab === 'Customizations') endpoint = '/api/requests?type=customization';
            else if (tab === 'Settings') endpoint = '/api/admin/settings';

            if (!endpoint) return;

            const res = await fetch(`${API_URL}${endpoint}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) {
                console.error(`Fetch failed for ${tab}:`, res.status);
                return;
            }

            const result = await res.json();
            const validatedData = Array.isArray(result) ? result : [];

            if (tab === 'Approvals') setApprovals(validatedData);
            else if (tab === 'Categories') setCategories(validatedData);
            else if (tab === 'Orders') {
                setOrders(validatedData);
                setAllOrders(validatedData);
            }
            else if (tab === 'Requests') setRequests(validatedData);
            else if (tab === 'Customizations') setRequests(validatedData);
            else if (tab === 'Settings') setSettings(validatedData);
        } catch (err) {
            console.error(`[FetchData] Error fetching ${tab}:`, err);
        }
    };

    // Sub-tab: Approvals Actions
    const handleStatusUpdate = async (id: string, status: string, rejectionReason?: string) => {
        const token = getToken('admin');
        try {
            const res = await fetch(`${API_URL}/api/products/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ status, rejectionReason })
            });
            if (res.ok) {
                setShowRejectModal(false);
                setReason('');
                fetchData('Approvals');
                alert(`Product ${status}!`);
            }
        } catch (err) { alert("Failed to update status"); }
    };

    // Sub-tab: Orders Actions
    const updateOrderStatus = async (id: string, status: string) => {
        console.log(`[Admin] Updating order ${id} to status: ${status}`);
        const token = getToken('admin');
        
        // Optimistic UI Update
        const previousOrders = [...allOrders];
        setAllOrders(prev => prev.map(o => o._id === id ? { ...o, status } : o));
        
        try {
            const res = await fetch(`${API_URL}/api/admin/orders/${id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ status })
            });
            
            if (!res.ok) {
                const errorData = await res.json();
                console.error("[Admin] Update failed:", errorData);
                throw new Error(errorData.message || "Failed to update");
            }
            
            console.log(`[Admin] Order ${id} updated successfully.`);
            fetchData('Orders');
        } catch (err: any) { 
            console.error("[Admin] Error updating order:", err);
            setAllOrders(previousOrders); // Rollback
            
            // Extract the most specific error message possible
            let msg = err.message;
            if (err.response && err.response.data && err.response.data.error) {
                msg = err.response.data.error;
            }
            alert("Failed to update order: " + msg); 
        }
    };

    const handleRefund = async (id: string) => {
        if (!window.confirm("Are you sure you want to refund this order? This will update financial records.")) return;
        const token = getToken('admin');
        try {
            const res = await fetch(`${API_URL}/api/admin/orders/${id}/refund`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                alert("Order Refunded!");
                fetchData('Orders');
            }
        } catch (err) { alert("Refund failed"); }
    };

    const submitPayout = async () => {
        const token = getToken('admin');
        try {
            const res = await fetch(`${API_URL}/api/admin/financial/payout`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    designerId: payoutForm.designerId,
                    amount: Number(payoutForm.amount),
                    paymentMethod: payoutForm.method,
                    note: payoutForm.note
                })
            });
            if (res.ok) {
                alert("Payout processed!");
                setShowPayoutModal(false);
                fetchData('Payouts');
            }
        } catch (err) { alert("Failed to process payout"); }
    };

    // Sub-tab: Categories Actions
    const handleSaveCategory = async () => {
        const token = getToken('admin');
        const Method = editingCategory ? 'PUT' : 'POST';
        const Url = editingCategory ? `${API_URL}/api/base-products/${editingCategory._id}` : `${API_URL}/api/base-products`;

        const payload = {
            ...categoryForm
        };

        try {
            const res = await fetch(Url, {
                method: Method,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                setShowCategoryModal(false);
                setEditingCategory(null);
                fetchData('Categories');
            } else {
                const err = await res.json();
                alert("Failed to save: " + err.message);
            }
        } catch (err) { alert("Server error updating category"); }
    };

    const handleDeleteCategory = async (id: string) => {
        if (!window.confirm("Delete this base template? This action cannot be undone.")) return;
        const token = getToken('admin');
        try {
            await fetch(`${API_URL}/api/base-products/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchData('Categories');
        } catch (err) { alert("Failed to delete category"); }
    };

    // Render functions for tabs
    const AdminCurvedText = ({ text, fontFamily, color, curve, letterSpacing, id, styleId }: any) => {
        const pathId = `path-admin-${id}`;
        const isFullCircle = styleId === 'style-circle';
        const cx = 250; const cy = 250; const r = 160;
        let pathData = "";
        if (isFullCircle) {
            pathData = `M ${cx - r}, ${cy} a ${r},${r} 0 1,1 ${r * 2},0 a ${r},${r} 0 1,1 -${r * 2},0`;
        } else {
            const intensity = (curve || 0) * 2.5;
            pathData = `M 50,250 Q 250,${250 - intensity} 450,250`;
        }
        return (
            <svg viewBox="0 0 500 500" width="200" height="200" style={{ overflow: 'visible', display: 'block', pointerEvents: 'none' }}>
                <defs><path id={pathId} d={pathData} fill="none" /></defs>
                <text fill={color} style={{ fontFamily: fontFamily, fontSize: isFullCircle ? '32px' : '40px', fontWeight: 'bold', letterSpacing: `${letterSpacing}px` }}>
                    <textPath xlinkHref={`#${pathId}`} startOffset="50%" textAnchor="middle">{text}</textPath>
                </text>
            </svg>
        );
    };

    const AdminMockupPreview = ({ mockupSrc, maskSrc, tshirtColor, canvasState, overallScale = 1.0 }: any) => {
        const imageLayers = canvasState?.imageLayers || [];
        const textLayers = canvasState?.textLayers || [];

        return (
            <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '100%', aspectRatio: '550 / 800', transform: `scale(${overallScale})`, transformOrigin: 'center center', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img src={mockupSrc} alt="Shirt" style={{ width: '100%', height: '100%', objectFit: 'contain', position: 'absolute', top: 0, left: 0, zIndex: 1 }} />
                    {tshirtColor && (
                        <div style={{ position: 'absolute', inset: 0, backgroundColor: tshirtColor, display: tshirtColor.toLowerCase() === '#ffffff' ? 'none' : 'block', mixBlendMode: 'multiply', WebkitMaskImage: `url(${maskSrc || mockupSrc})`, maskImage: `url(${maskSrc || mockupSrc})`, WebkitMaskSize: 'contain', WebkitMaskPosition: 'center', WebkitMaskRepeat: 'no-repeat', zIndex: 2 }}></div>
                    )}
                    <div style={{ position: 'absolute', inset: 0, zIndex: 10, pointerEvents: 'none', WebkitMaskImage: `url(${maskSrc || mockupSrc})`, maskImage: `url(${maskSrc || mockupSrc})`, WebkitMaskSize: 'contain', WebkitMaskPosition: 'center', WebkitMaskRepeat: 'no-repeat' }}>
                        {imageLayers.map((layer: any) => (
                            <img key={layer.id} src={layer.src.startsWith('/uploads') ? `http://localhost:5000${layer.src}` : layer.src} alt="Design Layer" style={{
                                position: 'absolute', zIndex: layer.zIndex,
                                transform: `translate(-250px, -130px) scale(0.13)`,
                                mixBlendMode: (tshirtColor && tshirtColor.toLowerCase() !== '#ffffff') ? 'multiply' : 'normal',
                                opacity: 0.95, width: 'auto', height: 'auto', maxWidth: 'none'
                            }} />
                        ))}
                        {textLayers.map((t: any) => (
                            <div key={t.id} style={{
                                position: 'absolute', zIndex: t.zIndex,
                                transform: `translate(70px, 185px) scale(0.40)`,
                                display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '100px'
                            }}>
                                {t.styleId === 'default' ? (
                                    (t.curve !== 0 && t.curve !== undefined) ? (
                                        <AdminCurvedText id={t.id} text={t.text} fontFamily={t.font} color={t.color} curve={t.curve ?? 0} letterSpacing={t.letterSpacing || 0} />
                                    ) : (
                                        <div style={{ fontFamily: t.font, color: t.color, fontSize: '24px', fontWeight: 'bold', whiteSpace: 'nowrap', letterSpacing: `${t.letterSpacing || 0}px` }}>{t.text}</div>
                                    )
                                ) : (
                                    <>
                                        {t.styleId === 'style-wave' && (
                                            <div style={{ fontFamily: t.font, color: '#00d2ff', fontSize: '28px', fontWeight: '900', textTransform: 'uppercase', textShadow: '2px 2px 0px #0d375b', transform: 'skewX(-10deg)', fontStyle: 'italic', letterSpacing: `${t.letterSpacing || 0}px` }}>{t.text}</div>
                                        )}
                                        {t.styleId === 'style-stack' && (
                                            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '0.9', alignItems: 'center', letterSpacing: `${t.letterSpacing || 0}px` }}>
                                                {[1, 2, 3].map((i: any) => (
                                                    <span key={i} style={{ fontFamily: t.font, color: i === 2 ? t.color : 'transparent', WebkitTextStroke: i === 2 ? 'none' : `1px ${t.color}`, fontSize: '18px', fontWeight: 'bold', textTransform: 'uppercase' }}>{t.text}</span>
                                                ))}
                                            </div>
                                        )}
                                        {t.styleId === 'style-fish' && (
                                            <div style={{ fontFamily: t.font, color: t.color, fontSize: '26px', fontWeight: 'bold', transform: 'scaleY(1.4) scaleX(0.9)', letterSpacing: `${(t.letterSpacing || 0) - 1}px` }}>{t.text}</div>
                                        )}
                                        {!['style-wave', 'style-stack', 'style-fish'].includes(t.styleId || '') && (
                                            <AdminCurvedText id={t.id} text={t.text} styleId={t.styleId} fontFamily={t.font} color={t.color} curve={t.styleId === 'style-circle' ? (t.curve ?? 120) : (t.curve ?? 0)} letterSpacing={t.letterSpacing || 0} />
                                        )}
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    const renderApprovals = () => (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
            {approvals.map((product: any) => (
                <div key={product._id} style={cardStyle}>
                    <div style={{ ...imageContainerStyle, height: '220px', padding: '15px' }}>
                        <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            {!product.frontDesign ? (
                                <img
                                    src={(product.mockupImages && product.mockupImages.length > 0) ? (product.mockupImages[0].startsWith('/uploads') ? `http://localhost:5000${product.mockupImages[0]}` : product.mockupImages[0]) : '/img/womenfront-mockup.png'}
                                    alt={product.title}
                                    style={{
                                        maxWidth: '90%',
                                        maxHeight: '90%',
                                        objectFit: 'contain',
                                        filter: 'drop-shadow(0 8px 13px rgba(0,0,0,0.08))'
                                    }}
                                />
                            ) : (
                                <AdminMockupPreview
                                    mockupSrc="/img/womenfront-mockup.png"
                                    maskSrc="/img/womenfront-mockup.png"
                                    tshirtColor={product.tshirtColor || '#ffffff'}
                                    printArea={product.frontPrintArea}
                                    designSrc={product.frontDesign}
                                    canvasState={product.canvasState}
                                    overallScale={1.2}
                                />
                            )}
                        </div>
                    </div>
                    <div style={{ padding: '15px' }}>
                        <h3 style={{ margin: '0 0 5px 0', fontSize: '15px', color: 'white' }}>{product.title}</h3>
                        <p style={{ margin: '0 0 10px 0', color: '#64748b', fontSize: '12px' }}>By: <strong>{product.designer?.name || 'Unknown'}</strong></p>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={() => handleStatusUpdate(product._id, 'Approved')} style={approveBtnStyle}>Approve</button>
                            <button onClick={() => { setSelectedProduct(product); setShowRejectModal(true); }} style={rejectBtnStyle}>Reject</button>
                        </div>
                    </div>
                </div>
            ))}
            {approvals.length === 0 && !loading && <p style={{ color: '#64748b', fontSize: '13px' }}>No pending approvals.</p>}
        </div>
    );

    const renderCategories = () => {
        const groups = ['Women', 'Men', 'Kids'];



        return (
            <div>

                {groups.map(group => {
                    const groupData = categories.filter((item: any) => (item.category || 'Unisex') === group);
                    if (groupData.length === 0) return null;


                    return (
                        <div key={group} style={{ marginBottom: '50px', textAlign: 'center' }}>
                            <h2 style={{ fontSize: '18px', color: '#38bdf8', borderBottom: '2px solid rgba(255,255,255,0.05)', paddingBottom: '10px', marginBottom: '30px', display: 'inline-block', minWidth: '350px' }}>{group}'s Collection</h2>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', maxWidth: '1000px', margin: '0 auto' }}>
                                {groupData.map((item: any) => (
                                    <div key={item._id} style={{ background: '#0f172a', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 4px 20px rgba(0,0,0,0.3)', width: '210px', margin: group === 'Kids' ? '0 15px' : '0 auto' }}>
                                        <div style={{ height: '220px', background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                            <img src={item.image || '/img/womenfront-mockup.png'} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', filter: 'brightness(0.9)' }} alt="" />
                                        </div>
                                        <div style={{ padding: '15px' }}>
                                            <h3 style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#f1f5f9' }}>{item.name}</h3>
                                            <p style={{ margin: '0 0 8px 0', color: '#fbbf24', fontWeight: 'bold', fontSize: '13px' }}>LKR {item.basePrice ? Number(item.basePrice).toLocaleString() : '850'}</p>
                                            <p style={{ margin: '0 0 12px 0', color: '#94a3b8', fontSize: '11px' }}>
                                                {item.sizes ? item.sizes.length : 4} sizes • {item.colors ? item.colors.length : 5} colors
                                            </p>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button onClick={() => {
                                                    setEditingCategory(item);
                                                    setCategoryForm({
                                                        ...item,
                                                        colors: item.colors || [],
                                                        sizes: Array.from(new Set(['xs', ...(item.sizes || []).map((s: string) => s.toLowerCase())])),
                                                        category: item.category || ''
                                                    });
                                                    setShowCategoryModal(true);
                                                }} style={{ flex: 1, padding: '8px', background: '#38bdf8', color: 'white', border: 'none', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}>Edit Specs</button>
                                                <button onClick={() => handleDeleteCategory(item._id)} style={{ padding: '8px 12px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '6px', fontSize: '11px', cursor: 'pointer' }}>Delete</button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
                {categories.length === 0 && !loading && <p style={{ padding: '20px', fontSize: '13px', color: '#64748b', textAlign: 'center', background: 'white', borderRadius: '12px' }}>No Base T-Shirts configured.</p>}
            </div>
        );
    };

    const renderOrders = () => {
        const statuses = ['All', 'Awaiting Verification', 'Processing', 'Printing', 'Dispatched', 'Delivered', 'Approved', 'Cancelled'];

        const getStatusColor = (status: string) => {
            switch (status) {
                case 'Awaiting Verification': return { bg: '#fef3c7', text: '#d97706' };
                case 'Pending': return { bg: '#fef3c7', text: '#92400e' };
                case 'Processing': return { bg: '#e0e7ff', text: '#4338ca' };
                case 'Printing': return { bg: '#dbeafe', text: '#1e40af' };
                case 'Dispatched': return { bg: '#ffedd5', text: '#c2410c' };
                case 'Delivered': return { bg: '#dcfce7', text: '#166534' };
                case 'Approved': return { bg: '#d1fae5', text: '#059669' };
                case 'Cancelled': return { bg: '#fee2e2', text: '#991b1b' };
                default: return { bg: '#f1f5f9', text: '#475569' };
            }
        };

        // Compute filtered orders during render for accuracy
        const filteredOrders = allOrders.filter((order: any) => {
            const matchesStatus = filterStatus === 'All' || order.status === filterStatus;
            const matchesSearch = (order._id?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
                (order.user?.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
                (order.user?.email?.toLowerCase() || '').includes(searchQuery.toLowerCase());
            return matchesStatus && matchesSearch;
        });



        return (
            <div>
                {/* Search and Filter Row */}
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '35px', gap: '20px', flexWrap: 'wrap', marginTop: '10px' }}>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center' }}>
                        {statuses.map(s => (
                            <button
                                key={s}
                                onClick={() => setFilterStatus(s)}
                                style={{
                                    padding: '8px 18px',
                                    borderRadius: '20px',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    fontSize: '11px',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    background: filterStatus === s ? '#38bdf8' : '#0f172a',
                                    color: filterStatus === s ? 'white' : '#94a3b8',
                                    transition: 'all 0.2s',
                                    boxShadow: filterStatus === s ? '0 4px 10px rgba(56, 189, 248, 0.2)' : 'none'
                                }}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                    <div style={{ flex: 1, maxWidth: '280px', position: 'relative' }}>
                        <input
                            type="text"
                            placeholder="Search Order ID or Customer..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ ...inputStyle, paddingLeft: '40px', height: '40px', borderRadius: '10px' }}
                        />
                        <img
                            src="/img/search.png"
                            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', opacity: 0.6 }}
                            alt="search"
                        />
                    </div>
                </div>

                <div style={{ ...tableCardStyle, marginTop: '15px' }}>
                    <table style={tableStyle}>
                        <thead>
                            <tr style={thStyle}>
                                <th style={{ paddingLeft: '30px' }}>Order ID</th>
                                <th>Thumbnail</th>
                                <th>Customer</th>
                                <th>Product Details</th>
                                <th>Total & Payment</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.map((order: any) => {
                                if (!order) return null;


                                return (
                                    <tr key={order._id} style={tdRowStyle}>
                                        <td style={{ ...tdStyle, fontWeight: 'bold', color: '#38bdf8', paddingLeft: '30px' }}>
                                            #CR8-{order._id?.substring(order._id.length - 6).toUpperCase() || '?????'}
                                        </td>
                                        <td style={tdStyle}>
                                            <div style={{ width: '50px', height: '50px', background: '#1e293b', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', position: 'relative' }}>
                                                {order.orderItems?.[0]?.frontDesign || order.orderItems?.[0]?.canvasState ? (
                                                    <MockupPreview
                                                        mockupSrc={(() => {
                                                            const img = (order.orderItems[0].baseImages && order.orderItems[0].baseImages[0]) || order.orderItems[0].image;
                                                            if (!img) return "/img/placeholder.png";
                                                            if (img.startsWith('http') || img.startsWith('data:')) return img;
                                                            if (img.startsWith('/uploads')) return `http://localhost:5000${img}`;
                                                            if (img.startsWith('uploads')) return `http://localhost:5000/${img}`;
                                                            if (img.startsWith('/')) return img;
                                                            return `/img/${img}`;
                                                        })()}
                                                        maskSrc={(() => {
                                                            const img = (order.orderItems[0].baseImages && order.orderItems[0].baseImages[0]) || order.orderItems[0].image;
                                                            if (!img) return "/img/placeholder.png";
                                                            if (img.startsWith('http') || img.startsWith('data:')) return img;
                                                            if (img.startsWith('/uploads')) return `http://localhost:5000${img}`;
                                                            if (img.startsWith('uploads')) return `http://localhost:5000/${img}`;
                                                            if (img.startsWith('/')) return img;
                                                            return `/img/${img}`;
                                                        })()}
                                                        tshirtColor={order.orderItems[0].tshirtColor || '#ffffff'}
                                                        printArea={order.orderItems[0].frontPrintArea}
                                                        designSrc={order.orderItems[0].frontDesign}
                                                        canvasState={order.orderItems[0].canvasState}
                                                        designScale={order.orderItems[0].frontDesignScale || 1.0}
                                                        overallScale={1.5}
                                                    />
                                                ) : (
                                                    <img
                                                        src={(() => {
                                                            const img = (order.orderItems?.[0]?.product?.mockupImages && order.orderItems[0].product.mockupImages.length > 0) 
                                                                ? order.orderItems[0].product.mockupImages[0] 
                                                                : (order.orderItems?.[0]?.image || '/img/womenfront-mockup.png');
                                                            if (!img) return "/img/placeholder.png";
                                                            if (img.startsWith('http') || img.startsWith('data:')) return img;
                                                            if (img.startsWith('/uploads')) return `http://localhost:5000${img}`;
                                                            if (img.startsWith('uploads')) return `http://localhost:5000/${img}`;
                                                            if (img.startsWith('/')) return img;
                                                            return `/img/${img}`;
                                                        })()}
                                                        style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'brightness(0.9)' }} alt=""
                                                    />
                                                )}
                                            </div>
                                        </td>
                                        <td style={tdStyle}>
                                            <div style={{ fontWeight: '600' }}>{order.user?.name || 'Guest'}</div>
                                            <div style={{ fontSize: '11px', color: '#64748b' }}>{order.user?.email || 'No Email'}</div>
                                        </td>
                                        <td style={tdStyle}>
                                            {order.orderItems?.map((item: any, idx: number) => (
                                                <div key={idx} style={{ marginBottom: '4px' }}>
                                                    <div style={{ fontWeight: '500' }}>{item?.size || 'M'} • {item?.color || 'White'}</div>
                                                    <div style={{ fontSize: '11px', color: '#64748b' }}>Qty: {item?.qty || 0}</div>
                                                </div>
                                            ))}
                                        </td>
                                        <td style={{ ...tdStyle, fontWeight: 'bold' }}>
                                            <div style={{ marginBottom: '8px', fontSize: '14px' }}>LKR {order.totalPrice ? Number(order.totalPrice).toLocaleString() : '0'}</div>
                                            <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                                <span style={{ fontWeight: 'bold', color: '#cbd5e1' }}>
                                                    {order.paymentMethod === 'bank' ? '🏦 Bank Deposit' : order.paymentMethod === 'card' ? '💳 Card' : order.paymentMethod === 'sandbox' ? '🧪 Sandbox' : order.paymentMethod || 'Unknown'}
                                                </span>
                                                {order.paymentMethod === 'bank' && order.paymentSlipUrl && (
                                                    <a 
                                                        href={order.paymentSlipUrl.startsWith('http') ? order.paymentSlipUrl : `http://localhost:5000${order.paymentSlipUrl}`}
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        style={{ color: '#38bdf8', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(56, 189, 248, 0.1)', padding: '4px 8px', borderRadius: '4px', width: 'fit-content' }}
                                                    >
                                                        📄 View Slip
                                                    </a>
                                                )}
                                            </div>
                                        </td>
                                        <td style={tdStyle}>
                                            <span style={{
                                                padding: '5px 12px',
                                                borderRadius: '20px',
                                                fontSize: '11px',
                                                fontWeight: '700',
                                                background: getStatusColor(order.status || '').bg,
                                                color: getStatusColor(order.status || '').text,
                                                display: 'inline-block',
                                                minWidth: '70px',
                                                textAlign: 'center'
                                            }}>
                                                {order.status || 'Processing'}
                                            </span>
                                        </td>
                                        <td style={tdStyle}>
                                            {(() => {
                                                const isDigitalOnly = order.orderItems?.length > 0 && order.orderItems.every((i: any) => i.name?.includes('(Digital)') || i.image?.includes('digital_download_icon'));
                                                
                                                if (isDigitalOnly) {
                                                    if (order.status === 'Approved') {
                                                        return <span style={{ display: 'inline-block', fontSize: '11px', fontWeight: 'bold', color: '#10b981', padding: '6px 12px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '6px' }}>✔️ Approved</span>;
                                                    }
                                                    return (
                                                        <button 
                                                            onClick={() => updateOrderStatus(order._id, 'Approved')}
                                                            style={{ padding: '6px 12px', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
                                                        >
                                                            Approve Payment
                                                        </button>
                                                    );
                                                }

                                                return (
                                                    <select
                                                        value={order.status}
                                                        onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                                                        style={{ padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '11px', fontWeight: 'bold', background: 'white' }}
                                                    >
                                                        {['Awaiting Verification', 'Processing', 'Printing', 'Dispatched', 'Delivered', 'Cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
                                                    </select>
                                                );
                                            })()}
                                            {order.isPaid && !order.isRefunded && (
                                                <button
                                                    onClick={() => handleRefund(order._id)}
                                                    style={{ marginLeft: '10px', padding: '6px 12px', background: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: '6px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}
                                                >
                                                    Refund
                                                </button>
                                            )}
                                            <button
                                                onClick={() => { setSelectedOrderDetails(order); setShowOrderDetailsModal(true); }}
                                                style={{ marginLeft: '10px', padding: '6px 12px', background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.2)', borderRadius: '6px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}
                                            >
                                                Details
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {filteredOrders.length === 0 && (
                        <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                            <img src="/img/no-orders.png" style={{ width: '50px', opacity: 0.3, marginBottom: '15px' }} alt="" onError={(e) => (e.currentTarget.style.display = 'none')} />
                            <p style={{ fontSize: '14px', fontWeight: '600' }}>No orders found matching your criteria.</p>
                            <p style={{ fontSize: '12px', marginTop: '5px' }}>Try adjusting your status filter or search query.</p>
                        </div>
                    )}
                </div>

                {/* Order Details Modal */}
                {showOrderDetailsModal && selectedOrderDetails && (
                    <div style={modalOverlayStyle}>
                        <div style={{ ...modalContentStyle, maxWidth: '600px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <h2 style={{ fontSize: '20px', color: '#38bdf8', margin: 0 }}>Order Financial Breakdown</h2>
                                <button onClick={() => setShowOrderDetailsModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '24px', cursor: 'pointer' }}>&times;</button>
                            </div>
                            
                            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                                    <div>
                                        <div style={labelStyle}>Order ID</div>
                                        <div style={{ fontWeight: 'bold', color: 'white' }}>#CR8-{selectedOrderDetails._id.substring(selectedOrderDetails._id.length - 8).toUpperCase()}</div>
                                    </div>
                                    <div>
                                        <div style={labelStyle}>Customer</div>
                                        <div style={{ fontWeight: 'bold', color: 'white' }}>{selectedOrderDetails.user?.name}</div>
                                    </div>
                                    <div>
                                        <div style={labelStyle}>Payment Method</div>
                                        <div style={{ fontWeight: 'bold', color: 'white', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            {selectedOrderDetails.paymentMethod === 'bank' ? 'Bank Deposit' : selectedOrderDetails.paymentMethod === 'card' ? 'Card' : selectedOrderDetails.paymentMethod === 'sandbox' ? 'Sandbox' : selectedOrderDetails.paymentMethod || 'Unknown'}
                                            {selectedOrderDetails.paymentMethod === 'bank' && selectedOrderDetails.paymentSlipUrl && (
                                                <a href={selectedOrderDetails.paymentSlipUrl.startsWith('http') ? selectedOrderDetails.paymentSlipUrl : `http://localhost:5000${selectedOrderDetails.paymentSlipUrl}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: '11px', color: '#38bdf8', textDecoration: 'underline' }}>View Slip</a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {selectedOrderDetails.orderItems?.map((item: any, idx: number) => (
                                    <div key={idx} style={{ padding: '10px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                            <span style={{ fontWeight: 'bold' }}>{item.name} (x{item.qty})</span>
                                            <span style={{ color: '#fbbf24' }}>LKR {(item.price * item.qty).toLocaleString()}</span>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '11px', color: '#94a3b8', marginTop: '5px' }}>
                                            <div>Base: LKR {(item.basePrice || 1200).toLocaleString()}</div>
                                            <div>Markup: LKR {(item.markup || 0).toLocaleString()}</div>
                                            <div>Service Fee: LKR {(item.serviceFee || 100).toLocaleString()}</div>
                                            {item.isCustom && (
                                                <div style={{ color: '#fbbf24', fontWeight: 'bold' }}>Customization: LKR {(item.customizationFee || 300).toLocaleString()}</div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            <div style={{ marginTop: '20px', borderTop: '2px dashed rgba(255,255,255,0.1)', paddingTop: '15px' }}>
                                {!(selectedOrderDetails.orderItems?.length > 0 && selectedOrderDetails.orderItems.every((i: any) => i.name?.includes('(Digital)') || i.image?.includes('digital_download_icon'))) && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                                        <span style={{ color: '#94a3b8' }}>Delivery Fee</span>
                                        <span>LKR {(selectedOrderDetails.shippingFee || 300).toLocaleString()}</span>
                                    </div>
                                )}
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontSize: '18px', fontWeight: '900', color: '#fbbf24' }}>
                                    <span>Grand Total</span>
                                    <span>LKR {(selectedOrderDetails.totalPrice).toLocaleString()}</span>
                                </div>

                                <div style={{ background: 'rgba(34, 197, 94, 0.1)', padding: '15px', borderRadius: '10px', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#22c55e', fontWeight: 'bold' }}>
                                        <span>Platform Profit</span>
                                        <span>LKR {(selectedOrderDetails.platformProfit || 0).toLocaleString()}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px', color: '#38bdf8', fontSize: '12px' }}>
                                        <span>Designer Payouts</span>
                                        <span>LKR {(selectedOrderDetails.designerEarnings || 0).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };


    const renderPayouts = () => {
        return (
        <div style={{ padding: '0 20px', textAlign: 'left' }}>
            {/* Revenue Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '25px', marginBottom: '50px' }}>
                <div style={{ ...cardStyle, padding: '30px', background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(10px)', border: '1px solid rgba(56, 189, 248, 0.1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                        <div style={{ fontSize: '12px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Revenue</div>
                        <div style={{ width: '32px', height: '32px', background: 'rgba(56, 189, 248, 0.1)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ color: '#38bdf8', fontSize: '16px' }}>$</span>
                        </div>
                    </div>
                    <div style={{ fontSize: '32px', fontWeight: '800', color: '#f8fafc' }}>
                        LKR {financialSummary?.totalRevenue?.toLocaleString() || '0'}.00
                    </div>
                    <div style={{ fontSize: '12px', marginTop: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span style={{ color: '#22c55e' }}>↑ 100%</span> Across all paid orders
                    </div>
                </div>

                <div style={{ ...cardStyle, padding: '30px', background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(10px)', border: '1px solid rgba(245, 158, 11, 0.1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                        <div style={{ fontSize: '12px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>Pending Payouts</div>
                        <div style={{ width: '32px', height: '32px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ color: '#f59e0b', fontSize: '16px' }}>◔</span>
                        </div>
                    </div>
                    <div style={{ fontSize: '32px', fontWeight: '800', color: '#f8fafc' }}>
                        LKR {financialSummary?.pendingPayouts?.toLocaleString() || '0'}.00
                    </div>
                    <div style={{ fontSize: '12px', marginTop: '12px', color: '#64748b' }}>Owed to designers</div>
                </div>

                <div style={{ ...cardStyle, padding: '30px', background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(10px)', border: '1px solid rgba(16, 185, 129, 0.1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                        <div style={{ fontSize: '12px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>Platform Profit</div>
                        <div style={{ width: '32px', height: '32px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ color: '#10b981', fontSize: '16px' }}>📈</span>
                        </div>
                    </div>
                    <div style={{ fontSize: '32px', fontWeight: '800', color: '#f8fafc' }}>
                        LKR {financialSummary?.platformProfit?.toLocaleString() || '0'}.00
                    </div>
                    <div style={{ fontSize: '12px', marginTop: '12px', color: '#64748b' }}>Net Service Fees</div>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                <h3 style={{ margin: 0, color: 'white', fontWeight: '700', fontSize: '20px' }}>Designer Earnings & Settlements</h3>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>Total Designers: {designerPayouts.length}</div>
            </div>

            <div style={tableCardStyle}>
                <table style={tableStyle}>
                    <thead>
                        <tr style={thStyle}>
                            <th style={{ padding: '15px 20px' }}>Designer</th>
                            <th style={{ padding: '15px 20px' }}>Total Earned</th>
                            <th style={{ padding: '15px 20px' }}>Already Paid</th>
                            <th style={{ padding: '15px 20px' }}>Balance Owed</th>
                            <th style={{ padding: '15px 20px' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {designerPayouts.map((d: any) => (
                            <tr key={d.id} style={tdRowStyle}>
                                <td style={{ ...tdStyle, padding: '16px 20px' }}>
                                    <div style={{ fontWeight: '600', color: '#f8fafc' }}>{d.name}</div>
                                    <div style={{ fontSize: '11px', color: '#64748b' }}>{d.email}</div>
                                </td>
                                <td style={tdStyle}>LKR {d.totalEarned.toLocaleString()}.00</td>
                                <td style={tdStyle}>LKR {d.alreadyPaid.toLocaleString()}.00</td>
                                <td style={{ ...tdStyle, color: d.balance > 0 ? '#f43f5e' : '#10b981', fontWeight: '700' }}>LKR {d.balance.toLocaleString()}.00</td>
                                <td style={tdStyle}>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button
                                            disabled={d.balance <= 0}
                                            onClick={() => {
                                                setPayoutForm({ ...payoutForm, designerId: d.id, name: d.name, amount: d.balance.toString() });
                                                setShowPayoutModal(true);
                                            }}
                                            style={{
                                                padding: '8px 16px',
                                                background: d.balance > 0 ? '#38bdf8' : 'rgba(148, 163, 184, 0.1)',
                                                color: d.balance > 0 ? 'white' : '#64748b',
                                                border: 'none',
                                                borderRadius: '8px',
                                                cursor: d.balance > 0 ? 'pointer' : 'not-allowed',
                                                fontWeight: '700',
                                                fontSize: '11px',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            Process Payout
                                        </button>
                                        <button
                                            onClick={async () => {
                                                const token = getToken('admin');
                                                const res = await fetch(`${API_URL}/api/admin/financial/designers/${d.id}`, {
                                                    headers: { 'Authorization': `Bearer ${token}` }
                                                });
                                                if (res.ok) {
                                                    setSelectedDesignerHistory(await res.json());
                                                    setShowDesignerHistoryModal(true);
                                                }
                                            }}
                                            style={{
                                                padding: '8px 16px',
                                                background: 'rgba(255,255,255,0.05)',
                                                color: 'white',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                fontWeight: '700',
                                                fontSize: '11px'
                                            }}
                                        >
                                            View History
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {designerPayouts.length === 0 && <p style={{ padding: '40px', color: '#64748b', textAlign: 'center' }}>No designer records available.</p>}
            </div>

            {/* Designer History Modal */}
            {showDesignerHistoryModal && selectedDesignerHistory && (
                <div style={modalOverlayStyle}>
                    <div style={{ ...modalContentStyle, maxWidth: '700px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ fontSize: '20px', color: '#38bdf8', margin: 0 }}>Transaction History: {selectedDesignerHistory.designer?.name}</h2>
                            <button onClick={() => setShowDesignerHistoryModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '24px', cursor: 'pointer' }}>&times;</button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '25px' }}>
                            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '15px', borderRadius: '10px', textAlign: 'center' }}>
                                <div style={labelStyle}>Total Earned</div>
                                <div style={{ fontSize: '18px', fontWeight: 'bold' }}>LKR {selectedDesignerHistory.summary?.totalEarned.toLocaleString()}</div>
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '15px', borderRadius: '10px', textAlign: 'center' }}>
                                <div style={labelStyle}>Already Paid</div>
                                <div style={{ fontSize: '18px', fontWeight: 'bold' }}>LKR {selectedDesignerHistory.summary?.alreadyPaid.toLocaleString()}</div>
                            </div>
                            <div style={{ background: 'rgba(56, 189, 248, 0.1)', padding: '15px', borderRadius: '10px', textAlign: 'center' }}>
                                <div style={{ ...labelStyle, color: '#38bdf8' }}>Current Balance</div>
                                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#38bdf8' }}>LKR {selectedDesignerHistory.summary?.balance.toLocaleString()}</div>
                            </div>
                        </div>

                        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                            <table style={tableStyle}>
                                <thead>
                                    <tr style={thStyle}>
                                        <th style={{ padding: '10px' }}>Date</th>
                                        <th style={{ padding: '10px' }}>Type</th>
                                        <th style={{ padding: '10px' }}>Description</th>
                                        <th style={{ padding: '10px', textAlign: 'right' }}>Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedDesignerHistory.history?.map((h: any, idx: number) => (
                                        <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                            <td style={{ ...tdStyle, padding: '10px', fontSize: '12px' }}>{new Date(h.date).toLocaleDateString()}</td>
                                            <td style={{ ...tdStyle, padding: '10px' }}>
                                                <span style={{
                                                    padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold',
                                                    background: h.type === 'sale' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(244, 63, 94, 0.1)',
                                                    color: h.type === 'sale' ? '#22c55e' : '#f43f5e'
                                                }}>
                                                    {h.type.toUpperCase()}
                                                </span>
                                            </td>
                                            <td style={{ ...tdStyle, padding: '10px', fontSize: '12px' }}>{h.description}</td>
                                            <td style={{ ...tdStyle, padding: '10px', textAlign: 'right', fontWeight: 'bold', color: h.amount > 0 ? '#22c55e' : '#f43f5e' }}>
                                                {h.amount > 0 ? '+' : ''}{h.amount.toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            <h3 style={{ marginTop: '60px', marginBottom: '25px', color: 'white', fontWeight: '700', fontSize: '20px' }}>Recent Transaction History</h3>
            <div style={tableCardStyle}>
                <table style={tableStyle}>
                    <thead>
                        <tr style={thStyle}>
                            <th style={{ padding: '15px 20px' }}>Date</th>
                            <th style={{ padding: '15px 20px' }}>Order ID</th>
                            <th style={{ padding: '15px 20px' }}>Customer</th>
                            <th style={{ padding: '15px 20px' }}>Total Amount</th>
                            <th style={{ padding: '15px 20px' }}>Payment</th>
                        </tr>
                    </thead>
                    <tbody>
                        {allOrders.slice(0, 10).map((order: any) => (
                            <tr key={order._id} style={tdRowStyle}>
                                <td style={{ ...tdStyle, padding: '16px 20px', fontSize: '12px' }}>
                                    {new Date(order.createdAt).toLocaleDateString()}
                                </td>
                                <td style={{ ...tdStyle, fontWeight: '700', color: '#38bdf8' }}>
                                    #CR8-{order._id?.substring(order._id.length - 6).toUpperCase()}
                                </td>
                                <td style={tdStyle}>
                                    <div style={{ fontWeight: '500', color: '#f1f5f9' }}>{order.user?.name}</div>
                                </td>
                                <td style={{ ...tdStyle, fontWeight: '600' }}>LKR {order.totalPrice.toLocaleString()}.00</td>
                                <td style={tdStyle}>
                                    <span style={{
                                        padding: '4px 12px',
                                        borderRadius: '20px',
                                        fontSize: '10px',
                                        fontWeight: '800',
                                        background: order.isPaid ? 'rgba(34, 197, 94, 0.1)' : 'rgba(244, 63, 94, 0.1)',
                                        color: order.isPaid ? '#22c55e' : '#f43f5e',
                                        border: order.isPaid ? '1px solid rgba(34, 197, 94, 0.2)' : '1px solid rgba(244, 63, 94, 0.2)'
                                    }}>
                                        {order.isPaid ? 'PAID' : 'UNPAID'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {allOrders.length === 0 && <p style={{ padding: '40px', color: '#64748b', textAlign: 'center' }}>No transactions recorded.</p>}
            </div>
        </div>
        );
    };

    const renderRequests = () => {


        return (
            <div style={{ padding: '0 0 50px 0' }}>
                <h3 style={{ marginBottom: '25px', color: 'white', fontWeight: '700', fontSize: '20px', textAlign: 'left' }}>Design Collaboration Requests</h3>
                <div style={tableCardStyle}>
                    <table style={tableStyle}>
                        <thead>
                            <tr style={thStyle}>
                                <th style={{ padding: '15px 20px' }}>Date</th>
                                <th style={{ padding: '15px 20px' }}>Product</th>
                                <th style={{ padding: '15px 20px' }}>Customer</th>
                                <th style={{ padding: '15px 20px' }}>Designer</th>
                                <th style={{ padding: '15px 20px' }}>Status</th>
                                <th style={{ padding: '15px 20px' }}>Message</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requests.map((req: any) => (
                                <tr key={req._id} style={tdRowStyle}>
                                    <td style={{ ...tdStyle, padding: '16px 20px', fontSize: '12px' }}>
                                        {req.submittedOn}
                                    </td>
                                    <td style={{ ...tdStyle, fontWeight: '700', color: '#38bdf8' }}>
                                        {req.productName}
                                    </td>
                                    <td style={tdStyle}>
                                        <div style={{ fontWeight: '500', color: '#f1f5f9' }}>{req.customer}</div>
                                    </td>
                                    <td style={tdStyle}>
                                        <div style={{ fontWeight: '500', color: '#94a3b8' }}>{req.designerName || 'Not Assigned'}</div>
                                    </td>
                                    <td style={tdStyle}>
                                        <span style={{
                                            padding: '4px 12px',
                                            borderRadius: '20px',
                                            fontSize: '10px',
                                            fontWeight: '800',
                                            background: req.status === 'Completed' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(56, 189, 248, 0.1)',
                                            color: req.status === 'Completed' ? '#22c55e' : '#38bdf8',
                                            border: req.status === 'Completed' ? '1px solid rgba(34, 197, 94, 0.2)' : '1px solid rgba(56, 189, 248, 0.2)'
                                        }}>
                                            {req.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td style={{ ...tdStyle, maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {req.message}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {requests.length === 0 && <p style={{ padding: '40px', color: '#64748b', textAlign: 'center' }}>No design requests found.</p>}
                </div>
            </div>
        );
    };

    const renderCustomizations = () => {
        const pendingCustomizations = requests.filter(r => r.requestType === 'customization' && r.status === 'Pending');

        return (
            <div style={{ padding: '0 0 50px 0' }}>
                <h3 style={{ marginBottom: '25px', color: 'white', fontWeight: '700', fontSize: '20px', textAlign: 'left' }}>User Customization Approvals </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                    {pendingCustomizations.map((req: any) => {
                        // REVENUE SPLIT CALCULATION (Now Dynamic)
                        const baseDesignerCharge = getSettingValue('base_designer_charge', 500);
                        const designerBonus = getSettingValue('customization_bonus', 100);
                        const platformFee = getSettingValue('platform_customization_fee', 300);
                        const baseProductCost = getSettingValue('base_product_cost', 1000);

                        const designerPayout = baseDesignerCharge + designerBonus;
                        const totalPrice = designerPayout + platformFee + baseProductCost;

                        return (
                            <div key={req._id} style={cardStyle}>
                                <div style={{ ...imageContainerStyle, height: '180px' }}>
                                    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                                        <MockupPreview
                                            mockupSrc="/img/womenfront-mockup.png"
                                            maskSrc="/img/womenfront-mockup.png"
                                            tshirtColor={req.color || '#ffffff'}
                                            printArea={req.frontPrintArea ? {
                                                ...req.frontPrintArea,
                                                left: `calc(${req.frontPrintArea.left} - 1%)`
                                            } : undefined}
                                            designSrc={req.frontDesign}
                                            canvasState={req.canvasState}
                                            overallScale={1.0}
                                        />
                                    </div>
                                </div>
                                <div style={{ padding: '20px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                        <h3 style={{ margin: 0, fontSize: '16px', color: 'white' }}>{req.productName}</h3>
                                        <span style={{ fontSize: '11px', color: '#94a3b8' }}>ID: {req._id.substring(req._id.length - 6)}</span>
                                    </div>
                                    <p style={{ margin: '0 0 15px 0', color: '#cbd5e1', fontSize: '13px' }}>Customer: <strong>{req.customer}</strong></p>

                                    <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '12px', marginBottom: '20px' }}>
                                        <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '8px', fontWeight: 'bold', textTransform: 'uppercase' }}>Proposed Revenue Split</div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '5px' }}>
                                            <span style={{ color: '#cbd5e1' }}>Designer Payout (+100 Bonus)</span>
                                            <span style={{ color: '#22c55e', fontWeight: 'bold' }}>LKR {designerPayout}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '5px' }}>
                                            <span style={{ color: '#cbd5e1' }}>Platform Fee</span>
                                            <span style={{ color: '#38bdf8', fontWeight: 'bold' }}>LKR {platformFee}</span>
                                        </div>
                                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: '8px', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 'bold' }}>
                                            <span style={{ color: 'white' }}>Estimated Customer Price</span>
                                            <span style={{ color: '#fbbf24' }}>LKR {totalPrice}</span>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button
                                            onClick={async () => {
                                                const token = getToken('admin');
                                                const res = await fetch(`${API_URL}/api/requests/${req._id}`, {
                                                    method: 'PUT',
                                                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                                    body: JSON.stringify({ status: 'Completed', approvedBy: 'Admin', price: totalPrice })
                                                });
                                                if (res.ok) { alert("Customization Approved!"); fetchData('Customizations'); }
                                            }}
                                            style={approveBtnStyle}
                                        >
                                            Approve Design
                                        </button>
                                        <button
                                            onClick={async () => {
                                                const token = getToken('admin');
                                                const res = await fetch(`${API_URL}/api/requests/${req._id}`, {
                                                    method: 'PUT',
                                                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                                    body: JSON.stringify({ status: 'Rejected' })
                                                });
                                                if (res.ok) { alert("Customization Rejected"); fetchData('Customizations'); }
                                            }}
                                            style={rejectBtnStyle}
                                        >
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    {pendingCustomizations.length === 0 && <p style={{ color: '#64748b', fontSize: '14px' }}>No pending user customizations.</p>}
                </div>
            </div>
        );
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#020617' }}>
            <BackHeader title="Marketplace Operations" />
            <div style={{ padding: '25px', maxWidth: '1200px', margin: '0 auto', flex: 1, width: '100%', textAlign: 'center' }}>
                <div style={{ display: 'flex', gap: '15px', marginBottom: '40px', justifyContent: 'center', position: 'relative' }}>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        {['Categories', 'Approvals', 'Requests', 'Customizations', 'Orders', 'Payouts'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => handleTabChange(tab)}
                                style={{ ...tabBtnStyle, border: '1px solid rgba(255,255,255,0.1)', background: activeTab === tab ? '#38bdf8' : '#0f172a', color: activeTab === tab ? 'white' : '#94a3b8' }}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                    {activeTab === 'Categories' && (
                        <button
                            onClick={() => {
                                setEditingCategory(null);
                                setCategoryForm({ name: '', category: '', material: '100% Cotton', basePrice: '', image: '', colors: [], sizes: [], fit: 'Standard', gsm: '200 GSM' });
                                setShowCategoryModal(true);
                            }}
                            style={{ position: 'absolute', right: 0, padding: '8px 18px', background: '#0284c7', color: 'white', border: 'none', borderRadius: '30px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 10px rgba(2, 132, 199, 0.2)', height: '40px' }}
                        >
                            + Add Base T-Shirt
                        </button>
                    )}
                </div>

                {loading && <p style={{ color: '#0d375b', fontWeight: 'bold' }}>Loading platform data...</p>}

                {activeTab === 'Approvals' && renderApprovals()}
                {activeTab === 'Categories' && renderCategories()}
                {activeTab === 'Requests' && renderRequests()}
                {activeTab === 'Customizations' && renderCustomizations()}
                {activeTab === 'Orders' && renderOrders()}
                {activeTab === 'Payouts' && renderPayouts()}

                {(() => {
                    const adminSession = getUserInfo('admin');
                    const globalSession = JSON.parse(localStorage.getItem('userInfo') || '{}');
                    if (!adminSession && globalSession.role && globalSession.role !== 'admin') {


                        return (
                            <div style={{ marginTop: '50px', padding: '30px', background: '#fff1f2', borderRadius: '12px', border: '1px solid #fda4af', textAlign: 'center' }}>
                                <h3 style={{ color: '#be123c', margin: '0 0 10px 0' }}>Admin Authorization Required</h3>
                                <p style={{ color: '#e11d48', fontSize: '14px', margin: 0 }}>
                                    You are currently logged in as a <strong>{globalSession.role}</strong>.
                                    Please log out and sign in with an Admin account to manage orders and operations.
                                </p>
                            </div>
                        );
                    }
                    return null;
                })()}
            </div>

            {/* Modals Section */}
            {showRejectModal && (
                <div style={modalOverlayStyle}>
                    <div style={{ ...modalContentStyle, width: '400px', maxWidth: '90%' }}>
                        <h2 style={{ fontSize: '18px', color: '#38bdf8', marginBottom: '10px' }}>Reject Submission</h2>
                        <textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason..." style={textareaStyle} />
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={() => handleStatusUpdate(selectedProduct._id, 'Rejected', reason)} style={{ ...rejectBtnStyle, flex: 1 }}>Confirm</button>
                            <button onClick={() => setShowRejectModal(false)} style={cancelBtnStyle}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {showCategoryModal && (
                <div style={modalOverlayStyle}>
                    <div style={{ ...modalContentStyle, maxWidth: '600px' }}>
                        <h2 style={{ fontSize: '18px', color: 'white', marginBottom: '20px' }}>{editingCategory ? 'Edit Base T-Shirt' : 'Add Base T-Shirt'}</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                            <div>
                                <label style={labelStyle}>Product Name</label>
                                <input value={categoryForm.name} placeholder="enter product name..." onChange={e => setCategoryForm({ ...categoryForm, name: e.target.value })} style={inputStyle} />
                            </div>
                            <div>
                                <label style={labelStyle}>Category</label>
                                <select value={categoryForm.category} onChange={e => setCategoryForm({ ...categoryForm, category: e.target.value })} style={{ ...inputStyle, color: 'white' }}>
                                    <option value="" disabled hidden>Select option</option>
                                    <option value="Women" style={{ background: '#1e293b' }}>Women</option>
                                    <option value="Men" style={{ background: '#1e293b' }}>Men</option>
                                    <option value="Kids" style={{ background: '#1e293b' }}>Kids</option>
                                </select>
                            </div>
                            <div>
                                <label style={labelStyle}>Base Price (LKR)</label>
                                <input type="number" value={categoryForm.basePrice} placeholder="set base price..." onChange={e => setCategoryForm({ ...categoryForm, basePrice: e.target.value ? parseInt(e.target.value) : '' })} style={inputStyle} />
                            </div>
                            <div>
                                <label style={labelStyle}>Image URL</label>
                                <input value={categoryForm.image} placeholder="/img/model-placeholder.png" onChange={e => setCategoryForm({ ...categoryForm, image: e.target.value })} style={inputStyle} />
                            </div>
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={labelStyle}>
                                Available Colors
                                <span style={{ fontWeight: 'normal', color: '#94a3b8', fontSize: '10px', marginLeft: '5px', textTransform: 'lowercase' }}>
                                    {editingCategory ? '(click to disable)' : '(click to enable)'}
                                </span>
                            </label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '5px' }}>
                                {PREDEFINED_COLORS.map(color => (
                                    <div
                                        key={color.name}
                                        onClick={() => {
                                            const newColors = categoryForm.colors.includes(color.name)
                                                ? categoryForm.colors.filter((c: string) => c !== color.name)
                                                : [...categoryForm.colors, color.name];
                                            setCategoryForm({ ...categoryForm, colors: newColors });
                                        }}
                                        style={{
                                            padding: '4px 8px', borderRadius: '20px', border: `1px solid ${categoryForm.colors.includes(color.name) ? '#38bdf8' : '#cbd5e1'}`,
                                            background: categoryForm.colors.includes(color.name) ? '#38bdf8' : 'white',
                                            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: '#000'
                                        }}
                                    >
                                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: color.hex, border: '1px solid rgba(0,0,0,0.1)' }} />
                                        {color.name}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={labelStyle}>
                                Available Sizes
                                <span style={{ fontWeight: 'normal', color: '#94a3b8', fontSize: '10px', marginLeft: '5px', textTransform: 'lowercase' }}>
                                    {editingCategory ? '(click to disable)' : '(click to enable)'}
                                </span>
                            </label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '5px' }}>
                                {PREDEFINED_SIZES.map(size => (
                                    <div
                                        key={size}
                                        onClick={() => {
                                            const newSizes = categoryForm.sizes.includes(size)
                                                ? categoryForm.sizes.filter((s: string) => s !== size)
                                                : [...categoryForm.sizes, size];
                                            setCategoryForm({ ...categoryForm, sizes: newSizes });
                                        }}
                                        style={{
                                            padding: '4px 12px', borderRadius: '6px', border: `1px solid ${categoryForm.sizes.includes(size) ? '#0d375b' : '#cbd5e1'}`,
                                            background: categoryForm.sizes.includes(size) ? '#0d375b' : 'white', color: categoryForm.sizes.includes(size) ? 'white' : '#475569',
                                            cursor: 'pointer', fontSize: '11px', fontWeight: 'bold'
                                        }}
                                    >
                                        {size}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={handleSaveCategory} style={{ ...approveBtnStyle, flex: 1, background: '#0284c7' }}>Save Configuration</button>
                            <button onClick={() => setShowCategoryModal(false)} style={cancelBtnStyle}>Discard</button>
                        </div>
                    </div>
                </div>
            )}

            {showPayoutModal && (
                <div style={modalOverlayStyle}>
                    <div style={{ ...modalContentStyle, width: '450px' }}>
                        <h2 style={{ fontSize: '22px', fontWeight: '900', color: '#0d375b', marginBottom: '10px' }}>Process Payout</h2>
                        <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '25px' }}>Settle earnings for <strong>{payoutForm.name}</strong></p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', textAlign: 'left' }}>
                            <div>
                                <label style={labelStyle}>Amount (LKR)</label>
                                <input type="number" value={payoutForm.amount} onChange={(e) => setPayoutForm({ ...payoutForm, amount: e.target.value })} style={inputStyle} />
                            </div>
                            <div>
                                <label style={labelStyle}>Method</label>
                                <select value={payoutForm.method} onChange={(e) => setPayoutForm({ ...payoutForm, method: e.target.value })} style={inputStyle}>
                                    <option>Bank Transfer</option><option>Cash</option><option>Online</option>
                                </select>
                            </div>
                            <div>
                                <label style={labelStyle}>Note</label>
                                <textarea value={payoutForm.note} onChange={(e) => setPayoutForm({ ...payoutForm, note: e.target.value })} style={{ ...inputStyle, height: '60px', resize: 'none' }} placeholder="Transaction reference..." />
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '10px', marginTop: '30px' }}>
                            <button onClick={submitPayout} style={{ ...approveBtnStyle, flex: 1 }}>Confirm Payment</button>
                            <button onClick={() => setShowPayoutModal(false)} style={cancelBtnStyle}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// -------------------------------------------------------------
// 2. USER MANAGEMENT
// -------------------------------------------------------------
const UserManagement = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('All');

    // Modals
    const [showLogsModal, setShowLogsModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [newPassword, setNewPassword] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        const token = getToken('admin');
        try {
            const res = await fetch(`${API_URL}/api/admin/users`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            }
        } catch (err) {
            console.error("Failed to fetch users", err);
        } finally {
            setLoading(false);
        }
    };

    const handleRoleUpdate = async (id: string, role: string) => {
        const token = getToken('admin');
        try {
            const res = await fetch(`${API_URL}/api/admin/users/${id}/role`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ role })
            });
            if (res.ok) {
                alert("Role updated successfully!");
                fetchUsers();
            }
        } catch (err) { alert("Failed to update role"); }
    };

    const handleStatusUpdate = async (id: string, status: string) => {
        const token = getToken('admin');
        try {
            const res = await fetch(`${API_URL}/api/admin/users/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ status })
            });
            if (res.ok) {
                alert(`User ${status} successfully!`);
                fetchUsers();
            }
        } catch (err) { alert("Failed to update status"); }
    };

    const handlePasswordReset = async () => {
        if (!newPassword) return alert("Please enter a new password");
        const token = getToken('admin');
        try {
            const res = await fetch(`${API_URL}/api/admin/users/${selectedUser._id}/reset-password`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ password: newPassword })
            });
            if (res.ok) {
                alert("Password reset successful!");
                setShowPasswordModal(false);
                setNewPassword('');
            }
        } catch (err) { alert("Failed to reset password"); }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase());

        let targetRole = roleFilter.toLowerCase();
        if (targetRole === 'customer') targetRole = 'buyer';

        const matchesRole = roleFilter === 'All' || user.role === targetRole;
        return matchesSearch && matchesRole;
    });

    const getRoleBadgeStyle = (role: string) => {
        switch (role) {
            case 'admin': return { bg: '#fee2e2', color: '#991b1b' };
            case 'designer': return { bg: '#e0e7ff', color: '#3730a3' };
            default: return { bg: '#f1f5f9', color: '#475569' };
        }
    };

    const getStatusBadgeStyle = (status: string) => {
        switch (status) {
            case 'active': return { bg: '#dcfce7', color: '#166534' };
            case 'suspended': return { bg: '#fef3c7', color: '#92400e' };
            case 'blocked': return { bg: '#fee2e2', color: '#991b1b' };
            default: return { bg: '#f1f5f9', color: '#475569' };
        }
    };

    // USER AMANAGEMENT //


    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#020617' }}>
            <BackHeader title="User Management" />
            <div style={{ padding: '25px', maxWidth: '1200px', margin: '0 auto', flex: 1, width: '100%' }}>

                {/* Search and Filters */}
                <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, maxWidth: '400px', position: 'relative' }}>
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            autoComplete="off"
                            style={{ ...inputStyle, paddingLeft: '40px', height: '45px', borderRadius: '12px' }}
                        />
                        <img src="/img/search.png" style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', width: '18px', opacity: 0.9 }} alt="" />
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        {['All', 'Customer', 'Designer', 'Admin'].map(role => (
                            <button
                                key={role}
                                onClick={() => setRoleFilter(role)}
                                style={{
                                    padding: '8px 20px',
                                    borderRadius: '25px',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    background: roleFilter === role ? '#38bdf8' : '#0f172a',
                                    color: roleFilter === role ? 'white' : '#94a3b8',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {role}s
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '50px' }}>
                        <p style={{ color: '#0d375b', fontWeight: 'bold' }}>Fetching users...</p>
                    </div>
                ) : (
                    <div style={tableCardStyle}>
                        <table style={tableStyle}>
                            <thead>
                                <tr style={thStyle}>
                                    <th style={{ paddingLeft: '150px', verticalAlign: 'middle' }}>User</th>
                                    <th style={{ paddingLeft: '55px', verticalAlign: 'middle' }}>Role</th>
                                    <th style={{ paddingLeft: '18px', verticalAlign: 'middle' }}>Join Date</th>
                                    <th style={{ paddingLeft: '30px', verticalAlign: 'middle' }}>Status</th>
                                    <th style={{ textAlign: 'right', paddingRight: '240px', verticalAlign: 'middle' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((user: any) => (
                                    <tr key={user._id} style={tdRowStyle}>
                                        <td style={{ ...tdStyle, paddingLeft: '80px', verticalAlign: 'middle' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                                    <img src={user.profileImage ? (user.profileImage.startsWith('http') ? user.profileImage : `${API_URL}${user.profileImage}`) : '/img/user.png'} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.9)' }} alt="" />
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 'bold', color: '#f1f5f9' }}>{user.name}</div>
                                                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ ...tdStyle, paddingLeft: '33px', verticalAlign: 'middle' }}>
                                            <span style={{
                                                padding: '4px 12px', borderRadius: '20px', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase',
                                                background: getRoleBadgeStyle(user.role).bg, color: getRoleBadgeStyle(user.role).color
                                            }}>
                                                {user.role === 'buyer' ? 'CUSTOMER' : user.role}
                                            </span>
                                        </td>
                                        <td style={{ ...tdStyle, paddingLeft: '18px', verticalAlign: 'middle' }}>
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                        <td style={{ ...tdStyle, paddingLeft: '25px', verticalAlign: 'middle' }}>
                                            <span style={{
                                                padding: '4px 12px', borderRadius: '20px', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase',
                                                background: getStatusBadgeStyle(user.accountStatus || 'active').bg, color: getStatusBadgeStyle(user.accountStatus || 'active').color
                                            }}>
                                                {user.accountStatus || 'active'}
                                            </span>
                                        </td>
                                        <td style={{ ...tdStyle, textAlign: 'right', paddingRight: '150px', verticalAlign: 'middle' }}>
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                                                <button
                                                    title="Security Logs"
                                                    onClick={() => { setSelectedUser(user); setShowLogsModal(true); }}
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                                                >
                                                    <img src="/img/log.png" style={{ width: '16px', height: '18px', filter: 'invert(1)' }} alt="logs" />
                                                </button>
                                                <button
                                                    title="Reset Password"
                                                    onClick={() => { setSelectedUser(user); setShowPasswordModal(true); }}
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                                                >
                                                    <img src="/img/pwd.png" style={{ width: '15px', height: 'auto', filter: 'invert(1)' }} alt="pwd" />
                                                </button>
                                                <select
                                                    value={user.role}
                                                    onChange={(e) => handleRoleUpdate(user._id, e.target.value)}
                                                    style={{ ...selectStyle, padding: '6px 8px' }}
                                                >
                                                    <option value="buyer">Customer</option>
                                                    <option value="designer">Designer</option>
                                                    <option value="admin">Admin</option>
                                                </select>
                                                <select
                                                    value={user.accountStatus || 'active'}
                                                    onChange={(e) => handleStatusUpdate(user._id, e.target.value)}
                                                    style={{ ...selectStyle, padding: '6px 8px', border: user.accountStatus === 'blocked' ? '1px solid #ef4444' : '1px solid #cbd5e1' }}
                                                >
                                                    <option value="active">Active</option>
                                                    <option value="suspended">Suspend</option>
                                                    <option value="blocked">Block</option>
                                                </select>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredUsers.length === 0 && (
                            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                                <p>No users found matching your criteria.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Security Logs Modal */}
            {showLogsModal && selectedUser && (
                <div style={modalOverlayStyle}>
                    <div style={{ ...modalContentStyle, maxWidth: '500px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ fontSize: '18px', color: '#38bdf8', margin: 0 }}>Security Logs: {selectedUser.name}</h2>
                            <button onClick={() => setShowLogsModal(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>&times;</button>
                        </div>
                        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                            {selectedUser.securityLogs && selectedUser.securityLogs.length > 0 ? (
                                selectedUser.securityLogs.map((log: any, idx: number) => (
                                    <div key={idx} style={{ padding: '12px', borderBottom: '1px solid #f1f5f9', fontSize: '13px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                            <strong style={{ color: '#0d375b' }}>{log.event}</strong>
                                            <span style={{ fontSize: '11px', color: '#94a3b8' }}>{new Date(log.timestamp).toLocaleString()}</span>
                                        </div>
                                        <div style={{ color: '#64748b', fontSize: '12px' }}>IP: {log.ip} | Location: {log.location || 'Unknown'}</div>
                                    </div>
                                ))
                            ) : (
                                <p style={{ textAlign: 'center', color: '#64748b', padding: '20px' }}>No activity logs recorded yet.</p>
                            )}
                        </div>
                        <button type="button" onClick={() => setShowLogsModal(false)} style={{ ...cancelBtnStyle, width: '100%', marginTop: '20px' }}>Close</button>
                    </div>
                </div>
            )}

            {/* Password Reset Modal */}
            {showPasswordModal && selectedUser && (
                <div style={modalOverlayStyle}>
                    <div style={{ ...modalContentStyle, maxWidth: '400px' }}>
                        <h2 style={{ fontSize: '18px', color: '#0d375b', marginBottom: '10px' }}>Reset Password</h2>
                        <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '20px' }}>Set a new password for <strong>{selectedUser.name}</strong></p>
                        <label style={labelStyle}>New Password</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Enter new password..."
                            autoComplete="new-password"
                            style={{ ...inputStyle, marginBottom: '20px' }}
                        />
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button type="button" onClick={handlePasswordReset} style={{ ...approveBtnStyle, flex: 1 }}>Reset Password</button>
                            <button type="button" onClick={() => { setShowPasswordModal(false); setNewPassword(''); }} style={cancelBtnStyle}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// -------------------------------------------------------------
// 3. ANALYTICS & INSIGHTS
// -------------------------------------------------------------
const AnalyticsInsights = () => {
    const [analytics, setAnalytics] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const response = await fetch(`${API_URL}/api/admin/analytics`, {
                    headers: {
                        'Authorization': `Bearer ${getToken('admin')}`
                    }
                });
                const data = await response.json();
                setAnalytics(data);
            } catch (error) {
                console.error("Error fetching analytics:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    if (loading) return <div style={{ textAlign: 'center', padding: '100px' }}><p>Analyzing data...</p></div>;

    const salesData = analytics?.salesData || [];
    const userGrowth = analytics?.userGrowth || [];
    const health = analytics?.health || { pendingApprovals: 0, completedOrders: 0, activeOrders: 0 };
    const trending = analytics?.trendingProducts || [];
    const financials = analytics?.financials || { totalRevenue: 0, platformProfit: 0, totalOrders: 0, totalUsers: 0 };



    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#020617', color: '#f1f5f9' }}>
            <BackHeader title="Analytics & Insights" />
            <div style={{ padding: '25px', maxWidth: '1200px', margin: '0 auto', flex: 1, width: '100%' }}>

                {/* Platform-Wide Financial Statistics */}
                <div style={{ ...sectionHeaderStyle, marginTop: '10px' }}>
                    <span style={sectionTitleStyle}>Platform Performance Overview</span>
                    <div style={sectionDividerStyle} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px', marginBottom: '50px' }}>
                    <div style={premiumStatCardStyle}>
                        <div style={statIconBoxStyle}>💰</div>
                        <div style={statContentStyle}>
                            <div style={statLabelStyle}>TOTAL REVENUE</div>
                            <div style={statValueStyle}>LKR {(financials.totalRevenue || 0).toLocaleString()}</div>
                        </div>
                    </div>
                    <div style={premiumStatCardStyle}>
                        <div style={statIconBoxStyle}>🛒</div>
                        <div style={statContentStyle}>
                            <div style={statLabelStyle}>TOTAL ORDERS</div>
                            <div style={statValueStyle}>{(financials.totalOrders || 0)} ORDERS</div>
                        </div>
                    </div>
                    <div style={premiumStatCardStyle}>
                        <div style={statIconBoxStyle}>📈</div>
                        <div style={statContentStyle}>
                            <div style={statLabelStyle}>PLATFORM PROFIT</div>
                            <div style={statValueStyle}>LKR {(financials.platformProfit || 0).toLocaleString()}</div>
                        </div>
                    </div>
                    <div style={premiumStatCardStyle}>
                        <div style={statIconBoxStyle}>👥</div>
                        <div style={statContentStyle}>
                            <div style={statLabelStyle}>TOTAL USERS</div>
                            <div style={statValueStyle}>{(financials.totalUsers || 0)} USERS</div>
                        </div>
                    </div>
                </div>

                {/* Platform Health Stats (To-Do List) */}
                <div style={sectionHeaderStyle}>
                    <span style={sectionTitleStyle}>Administrative Tasks & Platform Health</span>
                    <div style={sectionDividerStyle} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', marginBottom: '50px' }}>
                    <div style={statCardStyle}>
                        <div style={{ ...iconCircleStyle, background: '#fff7ed' }}>⏳</div>
                        <div>
                            <div style={statLabelStyle}>PENDING APPROVALS</div>
                            <div style={statValueStyle}>{health.pendingApprovals}</div>
                        </div>
                    </div>
                    <div style={statCardStyle}>
                        <div style={{ ...iconCircleStyle, background: '#eff6ff' }}>📦</div>
                        <div>
                            <div style={statLabelStyle}>ACTIVE ORDERS</div>
                            <div style={statValueStyle}>{health.activeOrders}</div>
                        </div>
                    </div>
                    <div style={statCardStyle}>
                        <div style={{ ...iconCircleStyle, background: '#f0fdf4' }}>✅</div>
                        <div>
                            <div style={statLabelStyle}>COMPLETED ORDERS</div>
                            <div style={statValueStyle}>{health.completedOrders}</div>
                        </div>
                    </div>
                </div>

                <div style={sectionHeaderStyle}>
                    <span style={sectionTitleStyle}>Detailed Insights</span>
                    <div style={sectionDividerStyle} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '25px' }}>
                    {/* Sales Performance Chart */}
                    <div style={{ background: '#0f172a', padding: '25px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
                        <h3 style={{ color: '#38bdf8', fontSize: '16px', marginBottom: '20px' }}>Sales Performance (Last 30 Days)</h3>
                        <div style={{ height: '250px', display: 'flex', alignItems: 'flex-end', gap: '8px', paddingBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                            {salesData.length > 0 ? (
                                salesData.map((day: any, i: number) => {
                                    const maxRev = Math.max(...salesData.map((d: any) => d.totalRevenue), 1);
                                    const height = (day.totalRevenue / maxRev) * 200;


                                    return (
                                        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                            <div
                                                title={`LKR ${day.totalRevenue}`}
                                                style={{
                                                    width: '100%',
                                                    height: `${height}px`,
                                                    background: '#38bdf8',
                                                    borderRadius: '4px 4px 0 0',
                                                    boxShadow: '0 0 10px rgba(56, 189, 248, 0.3)',
                                                    transition: 'all 0.3s ease'
                                                }}
                                            />
                                        </div>
                                    );
                                })
                            ) : (
                                <div style={{ width: '100%', textAlign: 'center', color: '#64748b' }}>No sales data available for this period.</div>
                            )}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '11px', color: '#94a3b8' }}>
                            <span>{salesData[0]?._id || ''}</span>
                            <span>{salesData[salesData.length - 1]?._id || ''}</span>
                        </div>
                    </div>

                    {/* Trending Designs */}
                    <div style={{ background: '#0f172a', padding: '25px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
                        <h3 style={{ color: '#38bdf8', fontSize: '16px', marginBottom: '20px' }}>🔥 Trending Products</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {trending.length > 0 ? trending.map((product: any, i: number) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '45px', height: '45px', background: '#1e293b', borderRadius: '8px', padding: '4px' }}>
                                        <img src={(product.mockupImages && product.mockupImages.length > 0) ? (product.mockupImages[0].startsWith('/uploads') ? `http://localhost:5000${product.mockupImages[0]}` : product.mockupImages[0]) : '/img/shop4.png'} style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'brightness(0.9)' }} alt="" />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#f1f5f9' }}>{product.title}</div>
                                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>by {product.designer?.name || 'Unknown'}</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#10b981' }}>{product.salesCount}</div>
                                        <div style={{ fontSize: '9px', color: '#64748b' }}>Sales</div>
                                    </div>
                                </div>
                            )) : <p style={{ color: '#64748b', fontSize: '13px' }}>No trending products yet.</p>}
                        </div>
                    </div>
                </div>

                {/* User Growth */}
                <div style={{ background: '#0f172a', padding: '25px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 4px 20px rgba(0,0,0,0.3)', marginTop: '25px' }}>
                    <h3 style={{ color: '#38bdf8', fontSize: '16px', marginBottom: '20px' }}>User Growth (New Sign-ups)</h3>
                    <div style={{ height: '150px', display: 'flex', alignItems: 'flex-end', gap: '4px' }}>
                        {userGrowth.length > 0 ? (
                            userGrowth.map((day: any, i: number) => {
                                const maxUsers = Math.max(...userGrowth.map((d: any) => d.newUsers), 1);
                                const height = (day.newUsers / maxUsers) * 120;


                                return (
                                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <div
                                            title={`${day.newUsers} New Users`}
                                            style={{
                                                width: '100%',
                                                height: `${height}px`,
                                                background: '#f59e0b',
                                                borderRadius: '2px',
                                                boxShadow: '0 0 8px rgba(245, 158, 11, 0.2)'
                                            }}
                                        />
                                    </div>
                                );
                            })
                        ) : <p style={{ width: '100%', textAlign: 'center', color: '#64748b' }}>No new sign-ups in the last 30 days.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Sub-styles for Analytics & Shared Modules
const statCardStyle = {
    background: '#0f172a',
    padding: '20px',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    border: '1px solid rgba(255,255,255,0.05)'
};

const iconCircleStyle = {
    width: '45px',
    height: '45px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    opacity: 0.9
};

const statLabelStyle = {
    fontSize: '11px',
    fontWeight: 'bold',
    color: '#94a3b8',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px'
};

const statValueStyle = {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#f1f5f9',
    marginTop: '2px'
};

const premiumStatCardStyle = {
    background: '#0f172a',
    padding: '15px 20px',
    borderRadius: '12px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    border: '1px solid rgba(255,255,255,0.1)'
};

const statIconBoxStyle = {
    fontSize: '22px',
    background: '#1e293b',
    width: '42px',
    height: '42px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '10px',
    border: '1px solid rgba(255,255,255,0.05)'
};

const statContentStyle = {
    display: 'flex',
    flexDirection: 'column' as const
};

const sectionHeaderStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    marginBottom: '25px',
    marginTop: '45px'
};

const sectionTitleStyle = {
    color: '#38bdf8',
    fontSize: '13px',
    fontWeight: '600',
    whiteSpace: 'nowrap' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px'
};

const sectionDividerStyle = {
    height: '1px',
    background: 'rgba(255,255,255,0.1)',
    flex: 1
};


// -------------------------------------------------------------
// MAIN ADMIN HUB DASHBOARD
// -------------------------------------------------------------
const HubCard = ({ title, imgSrc, desc, onClick }: any) => {


    return (
        <div
            onClick={onClick}
            style={{
                background: 'rgba(255,255,255,0.05)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '16px',
                padding: '25px 20px',
                width: '260px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                e.currentTarget.style.boxShadow = '0 10px 25px rgba(56, 189, 248, 0.2)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
            }}
        >
            <img src={imgSrc} style={{ width: '45px', height: '45px', marginBottom: '15px', objectFit: 'contain', filter: 'invert(1) drop-shadow(0 0 10px rgba(255,255,255,0.3))' }} alt={title} />
            <h2 style={{ color: 'white', fontSize: '16px', marginBottom: '10px' }}>{title}</h2>
            <p style={{ color: '#94a3b8', margin: 0, lineHeight: '1.5', fontSize: '12px' }}>{desc}</p>
        </div>
    );
};

const AdminHub = () => {
    const navigate = useNavigate();


    return (
        <div style={{
            background: 'linear-gradient(135deg, #020617 0%, #0f172a 100%)',
            minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Inter', sans-serif", position: 'relative', overflow: 'hidden'
        }}>
            {/* Decors */}
            <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(56,189,248,0.15) 0%, rgba(0,0,0,0) 70%)', filter: 'blur(60px)', zIndex: 0 }} />

            <div style={{ position: 'absolute', top: '25px', left: '35px', zIndex: 10, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                    onClick={() => navigate('/')}
                    style={{ color: 'white', fontSize: '20px', fontWeight: '900', letterSpacing: '1px', cursor: 'pointer' }}
                >
                    Cre8tify
                </span>
                <span style={{ background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', padding: '3px 10px', borderRadius: '15px', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}>Admin</span>
            </div>

            <div style={{ zIndex: 10, textAlign: 'center', marginBottom: '45px', marginTop: '40px' }}>
                <h1 style={{ color: 'white', fontSize: '36px', fontWeight: '800', marginBottom: '10px' }}>Admin Panel</h1>
                <p style={{ color: '#94a3b8', fontSize: '14px', maxWidth: '500px', margin: '0 auto' }}>Monitor platform activity, curate designs, and manage payouts natively.</p>
            </div>

            <div style={{ zIndex: 10, display: 'flex', gap: '25px', flexWrap: 'wrap', justifyContent: 'center', padding: '0 20px' }}>
                <HubCard
                    title="Marketplace Operations"
                    imgSrc="/img/admin-modules.png"
                    desc="Manage design approvals, product catalogs, order fulfillment, and designer payouts."
                    onClick={() => navigate('/admin-dashboard/operations')}
                />
                <HubCard
                    title="User Management"
                    imgSrc="/img/admin-manage.png"
                    desc="Manage community roles, block accounts, and oversee security."
                    onClick={() => navigate('/admin-dashboard/users')}
                />
                <HubCard
                    title="Analytics & Insights"
                    imgSrc="/img/admin-analytics.png"
                    desc="Track platform growth, sales metrics, and evaluate active users."
                    onClick={() => navigate('/admin-dashboard/analytics')}
                />
            </div>
        </div>
    );
};

// Routing Shell
const AdminDashboard = () => {


    return (
        <Routes>
            <Route path="/" element={<AdminHub />} />
            <Route path="/operations" element={<MarketplaceOperations />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="/analytics" element={<AnalyticsInsights />} />
        </Routes>
    );
};

export default AdminDashboard;