import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
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
                    fetchData('Payouts')
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
        const storedUser = localStorage.getItem('userInfo');
        if (!storedUser) return;
        const parsedUser = JSON.parse(storedUser);
        const { token } = parsedUser;
        
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
            console.log(`[AdminFetch] ${tab} loaded: ${validatedData.length} items`);
            
            if (tab === 'Approvals') setApprovals(validatedData);
            else if (tab === 'Categories') setCategories(validatedData);
            else if (tab === 'Orders') {
                setOrders(validatedData);
                setAllOrders(validatedData);
            }
        } catch (err) {
            console.error(`[FetchData] Error fetching ${tab}:`, err);
        }
    };

    // Sub-tab: Approvals Actions
    const handleStatusUpdate = async (id: string, status: string, rejectionReason?: string) => {
        const { token } = JSON.parse(localStorage.getItem('userInfo') || '{}');
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
        const { token } = JSON.parse(localStorage.getItem('userInfo') || '{}');
        try {
            await fetch(`${API_URL}/api/admin/orders/${id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ status })
            });
            fetchData('Orders');
        } catch (err) { alert("Failed to update order"); }
    };

    const handleRefund = async (id: string) => {
        if (!window.confirm("Are you sure you want to refund this order? This will update financial records.")) return;
        const { token } = JSON.parse(localStorage.getItem('userInfo') || '{}');
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
        const { token } = JSON.parse(localStorage.getItem('userInfo') || '{}');
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
        const { token } = JSON.parse(localStorage.getItem('userInfo') || '{}');
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
        const { token } = JSON.parse(localStorage.getItem('userInfo') || '{}');
        try {
            await fetch(`${API_URL}/api/base-products/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchData('Categories');
        } catch (err) { alert("Failed to delete category"); }
    };

    // Render functions for tabs
    const renderApprovals = () => (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
            {approvals.map((product: any) => (
                <div key={product._id} style={cardStyle}>
                    <div style={{...imageContainerStyle, height: '220px', padding: '15px'}}>
                        <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            {!product.frontDesign ? (
                                <img
                                    src={product.mockupImages?.[0] || '/img/womenfront-mockup.png'}
                                    alt={product.title}
                                    style={{
                                        maxWidth: '90%',
                                        maxHeight: '90%',
                                        objectFit: 'contain',
                                        filter: 'drop-shadow(0 8px 13px rgba(0,0,0,0.08))'
                                    }}
                                />
                            ) : (
                                <MockupPreview
                                    mockupSrc="/img/womenfront-mockup.png"
                                    maskSrc="/img/womenfront-mockup.png"
                                    maskSize="contain"
                                    maskPosition="center"
                                    tshirtColor={product.tshirtColor || '#ffffff'}
                                    printArea={product.frontPrintArea || { top: '50%', left: '51%', width: '30%', height: '27%', rotation: 0 }}
                                    designSrc={product.frontDesign}
                                    overallScale={1.1}
                                    areaScale={1.3}
                                    designScale={0.9}
                                />
                            )}
                        </div>
                    </div>
                    <div style={{ padding: '15px' }}>
                        <h3 style={{ margin: '0 0 5px 0', fontSize: '15px' }}>{product.title}</h3>
                        <p style={{ margin: '0 0 10px 0', color: '#64748b', fontSize: '12px' }}>By: <strong>{product.designer?.name || 'Unknown'}</strong></p>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={() => handleStatusUpdate(product._id, 'Approved')} style={approveBtnStyle}>Approve</button>
                            <button onClick={() => { setSelectedProduct(product); setShowRejectModal(true); }} style={rejectBtnStyle}>Reject</button>
                        </div>
                    </div>
                </div>
            ))}
            {approvals.length === 0 && !loading && <p style={{color: '#64748b', fontSize: '13px'}}>No pending approvals.</p>}
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
                {categories.length === 0 && !loading && <p style={{padding: '20px', fontSize: '13px', color: '#64748b', textAlign: 'center', background: 'white', borderRadius: '12px'}}>No Base T-Shirts configured.</p>}
            </div>
        );
    };

    const renderOrders = () => {
        const statuses = ['All', 'Processing', 'Printing', 'Shipped', 'Delivered', 'Cancelled'];
        
        const getStatusColor = (status: string) => {
            switch (status) {
                case 'Pending': return { bg: '#fef3c7', text: '#92400e' };
                case 'Printing': return { bg: '#dbeafe', text: '#1e40af' };
                case 'Shipped': return { bg: '#f3e8ff', text: '#6b21a8' };
                case 'Delivered': return { bg: '#dcfce7', text: '#166534' };
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
                                <th>Total Amount</th>
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
                                            <div style={{ width: '50px', height: '50px', background: '#1e293b', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                <img 
                                                    src={order.orderItems?.[0]?.product?.mockupImages?.[0] || order.orderItems?.[0]?.image || '/img/womenfront-mockup.png'} 
                                                    style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'brightness(0.9)' }} alt=""
                                                />
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
                                            LKR {order.totalPrice ? Number(order.totalPrice).toLocaleString() : '0'}
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
                                             <select 
                                                 value={order.status} 
                                                 onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                                                 style={{ padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '11px', fontWeight: 'bold' }}
                                             >
                                                 {['Processing', 'Printing', 'Shipped', 'Delivered', 'Cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
                                             </select>
                                             {order.isPaid && !order.isRefunded && (
                                                 <button 
                                                     onClick={() => handleRefund(order._id)}
                                                     style={{ marginLeft: '10px', padding: '6px 12px', background: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: '6px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}
                                                 >
                                                     Refund
                                                 </button>
                                             )}
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
            </div>
        );
    };


    const renderPayouts = () => (
        <div style={{ padding: '0 20px' }}>
            {/* Revenue Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '25px', marginBottom: '40px' }}>
                <div style={{ ...cardStyle, background: 'linear-gradient(135deg, #0d375b 0%, #1e40af 100%)', color: 'white' }}>
                    <div style={{ fontSize: '14px', opacity: 0.8, marginBottom: '8px' }}>Total Revenue</div>
                    <div style={{ fontSize: '28px', fontWeight: '900' }}>LKR {financialSummary?.totalRevenue?.toLocaleString() || '0'}.00</div>
                    <div style={{ fontSize: '11px', marginTop: '10px', opacity: 0.7 }}>Across all paid orders</div>
                </div>
                <div style={{ ...cardStyle, background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: 'white' }}>
                    <div style={{ fontSize: '14px', opacity: 0.8, marginBottom: '8px' }}>Pending Payouts</div>
                    <div style={{ fontSize: '28px', fontWeight: '900' }}>LKR {financialSummary?.pendingPayouts?.toLocaleString() || '0'}.00</div>
                    <div style={{ fontSize: '11px', marginTop: '10px', opacity: 0.7 }}>Owed to designers</div>
                </div>
                <div style={{ ...cardStyle, background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white' }}>
                    <div style={{ fontSize: '14px', opacity: 0.8, marginBottom: '8px' }}>Platform Profit</div>
                    <div style={{ fontSize: '28px', fontWeight: '900' }}>LKR {financialSummary?.platformProfit?.toLocaleString() || '0'}.00</div>
                    <div style={{ fontSize: '11px', marginTop: '10px', opacity: 0.7 }}>Net Service Fees</div>
                </div>
            </div>

            <h3 style={{ marginBottom: '20px', color: '#0d375b', fontWeight: '800' }}>Designer Earnings & Settlements</h3>
            <div style={tableCardStyle}>
                <table style={tableStyle}>
                    <thead>
                        <tr style={thStyle}>
                            <th style={{ paddingLeft: '20px' }}>Designer</th>
                            <th>Total Earned</th>
                            <th>Already Paid</th>
                            <th>Balance Owed</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {designerPayouts.map((d: any) => (
                            <tr key={d.id} style={tdRowStyle}>
                                <td style={{ ...tdStyle, paddingLeft: '20px' }}>
                                    <div style={{ fontWeight: 'bold' }}>{d.name}</div>
                                    <div style={{ fontSize: '11px', color: '#64748b' }}>{d.email}</div>
                                </td>
                                <td style={tdStyle}>LKR {d.totalEarned.toLocaleString()}.00</td>
                                <td style={tdStyle}>LKR {d.alreadyPaid.toLocaleString()}.00</td>
                                <td style={{ ...tdStyle, color: d.balance > 0 ? '#b91c1c' : '#059669', fontWeight: 'bold' }}>LKR {d.balance.toLocaleString()}.00</td>
                                <td style={tdStyle}>
                                    <button 
                                        disabled={d.balance <= 0}
                                        onClick={() => {
                                            setPayoutForm({ ...payoutForm, designerId: d.id, name: d.name, amount: d.balance.toString() });
                                            setShowPayoutModal(true);
                                        }}
                                        style={{ 
                                            padding: '8px 15px', 
                                            background: d.balance > 0 ? '#0d375b' : '#94a3b8', 
                                            color: 'white', 
                                            border: 'none', 
                                            borderRadius: '8px', 
                                            cursor: d.balance > 0 ? 'pointer' : 'not-allowed',
                                            fontWeight: 'bold',
                                            fontSize: '11px'
                                        }}
                                    >
                                        Process Payout
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {designerPayouts.length === 0 && <p style={{ padding: '20px', color: '#64748b', textAlign: 'center' }}>No designer records available.</p>}
            </div>

            <h3 style={{ marginTop: '50px', marginBottom: '20px', color: '#0d375b', fontWeight: '800' }}>Recent Transaction History</h3>
            <div style={tableCardStyle}>
                <table style={tableStyle}>
                    <thead>
                        <tr style={thStyle}>
                            <th style={{ paddingLeft: '20px' }}>Date</th>
                            <th>Order ID</th>
                            <th>Customer</th>
                            <th>Total Amount</th>
                            <th>Payment</th>
                        </tr>
                    </thead>
                    <tbody>
                        {allOrders.slice(0, 10).map((order: any) => (
                            <tr key={order._id} style={tdRowStyle}>
                                <td style={{ ...tdStyle, paddingLeft: '20px', fontSize: '11px' }}>
                                    {new Date(order.createdAt).toLocaleDateString()}
                                </td>
                                <td style={{ ...tdStyle, fontWeight: 'bold' }}>
                                    #CR8-{order._id?.substring(order._id.length - 6).toUpperCase()}
                                </td>
                                <td style={tdStyle}>
                                    <div style={{ fontWeight: '500' }}>{order.user?.name}</div>
                                </td>
                                <td style={tdStyle}>LKR {order.totalPrice.toLocaleString()}.00</td>
                                <td style={tdStyle}>
                                    <span style={{ 
                                        padding: '4px 10px', 
                                        borderRadius: '12px', 
                                        fontSize: '10px', 
                                        fontWeight: '800',
                                        background: order.isPaid ? '#dcfce7' : '#fee2e2',
                                        color: order.isPaid ? '#15803d' : '#b91c1c'
                                    }}>
                                        {order.isPaid ? 'PAID' : 'UNPAID'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {allOrders.length === 0 && <p style={{ padding: '20px', color: '#64748b', textAlign: 'center' }}>No transactions recorded.</p>}
            </div>
        </div>
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#020617' }}>
            <BackHeader title="Marketplace Operations" />
            <div style={{ padding: '25px', maxWidth: '1200px', margin: '0 auto', flex: 1, width: '100%', textAlign: 'center' }}>
                <div style={{ display: 'flex', gap: '15px', marginBottom: '40px', justifyContent: 'center', position: 'relative' }}>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        {['Approvals', 'Categories', 'Orders', 'Payouts'].map(tab => (
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
                {activeTab === 'Orders' && renderOrders()}
                {activeTab === 'Payouts' && renderPayouts()}
                
                {localStorage.getItem('userInfo') && JSON.parse(localStorage.getItem('userInfo') || '{}').role !== 'admin' && (
                    <div style={{ marginTop: '50px', padding: '30px', background: '#fff1f2', borderRadius: '12px', border: '1px solid #fda4af', textAlign: 'center' }}>
                        <h3 style={{ color: '#be123c', margin: '0 0 10px 0' }}>Admin Authorization Required</h3>
                        <p style={{ color: '#e11d48', fontSize: '14px', margin: 0 }}>
                            You are currently logged in as a <strong>{JSON.parse(localStorage.getItem('userInfo') || '{}').role}</strong>. 
                            Please log out and sign in with an Admin account to manage orders and operations.
                        </p>
                    </div>
                )}
            </div>

            {/* Modals Section */}
            {showRejectModal && (
                <div style={modalOverlayStyle}>
                    <div style={modalContentStyle}>
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
                                <input value={categoryForm.name} placeholder="enter product name..." onChange={e => setCategoryForm({...categoryForm, name: e.target.value})} style={inputStyle} />
                            </div>
                            <div>
                                <label style={labelStyle}>Category</label>
                                <select value={categoryForm.category} onChange={e => setCategoryForm({...categoryForm, category: e.target.value})} style={{ ...inputStyle, color: 'white' }}>
                                    <option value="" disabled hidden>Select option</option>
                                    <option value="Women" style={{ background: '#1e293b' }}>Women</option>
                                    <option value="Men" style={{ background: '#1e293b' }}>Men</option>
                                    <option value="Kids" style={{ background: '#1e293b' }}>Kids</option>
                                </select>
                            </div>
                            <div>
                                <label style={labelStyle}>Base Price (LKR)</label>
                                <input type="number" value={categoryForm.basePrice} placeholder="set base price..." onChange={e => setCategoryForm({...categoryForm, basePrice: e.target.value ? parseInt(e.target.value) : ''})} style={inputStyle} />
                            </div>
                            <div>
                                <label style={labelStyle}>Image URL</label>
                                <input value={categoryForm.image} placeholder="/img/model-placeholder.png" onChange={e => setCategoryForm({...categoryForm, image: e.target.value})} style={inputStyle} />
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
        const { token } = JSON.parse(localStorage.getItem('userInfo') || '{}');
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
        const { token } = JSON.parse(localStorage.getItem('userInfo') || '{}');
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
        const { token } = JSON.parse(localStorage.getItem('userInfo') || '{}');
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
        const { token } = JSON.parse(localStorage.getItem('userInfo') || '{}');
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
                                    <th style={{paddingLeft: '30px', verticalAlign: 'middle' }}>Status</th>
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
                                                    <img src="/img/log.png" style={{ width: '16px', height: '18px', filter: 'invert(1)'}} alt="logs" />
                                                </button>
                                                <button 
                                                    title="Reset Password"
                                                    onClick={() => { setSelectedUser(user); setShowPasswordModal(true); }}
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                                                >
                                                    <img src="/img/pwd.png" style={{ width: '15px', height: 'auto',filter: 'invert(1)' }} alt="pwd" />
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
                        'Authorization': `Bearer ${localStorage.getItem('userToken')}`
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
                                        <img src={product.mockupImages?.[0] || '/img/shop4.png'} style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'brightness(0.9)' }} alt="" />
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

            <div style={{ zIndex: 10, display: 'flex', gap: '25px', flexWrap: 'wrap', justifyContent: 'center',  padding: '0 20px' }}>
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

// --- MOCKUP PREVIEW COMPONENT (Synced from MyDesigns) ---
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