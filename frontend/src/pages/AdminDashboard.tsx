import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import '../styles/dashboard.css'; 

const API_URL = "http://localhost:5000";

// --- GLOBAL STYLES ---
const cardStyle = { background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.06)', position: 'relative' as const };
const imageContainerStyle = { background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '15px', position: 'relative' as const };
const approveBtnStyle = { flex: 1, padding: '10px', background: '#22c55e', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' };
const rejectBtnStyle = { flex: 1, padding: '10px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' };
const cancelBtnStyle = { flex: 1, padding: '10px', background: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' };
const tabBtnStyle: React.CSSProperties = { border: '1px solid #cbd5e1', padding: '10px 25px', borderRadius: '30px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s', minWidth: '120px', textAlign: 'center' };

const tableCardStyle = { background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' };
const tableStyle = { width: '100%', borderCollapse: 'collapse' as const, textAlign: 'left' as const };
const thStyle = { background: '#f8fafc', color: '#475569', fontSize: '11px', textTransform: 'uppercase' as const, padding: '12px 15px', borderBottom: '1px solid #e2e8f0' };
const tdRowStyle = { borderBottom: '1px solid #f1f5f9' };
const tdStyle = { padding: '15px', fontSize: '13px', color: '#1e293b' };
const selectStyle = { padding: '6px', fontSize: '12px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' };

const modalOverlayStyle = { position: 'fixed' as const, inset: 0, background: 'rgba(15, 23, 42, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 };
const modalContentStyle = { background: 'white', padding: '30px', borderRadius: '16px', width: '90%', maxWidth: '400px', maxHeight: '90vh', overflowY: 'auto' as const };
const textareaStyle = { width: '100%', height: '100px', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px', outline: 'none', marginBottom: '15px' };
const inputStyle = { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', outline: 'none', background: '#f8fafc' };
const labelStyle = { display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#475569', marginBottom: '4px' };

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
    const [activeTab, setActiveTab] = useState('Approvals');
    const [data, setData] = useState<any[]>([]);
    
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
    const [categoryForm, setCategoryForm] = useState({
        name: '', category: 'Women', material: 'Premium Cotton', basePrice: 1200, 
        image: '', colorsStr: 'White, Black', sizesStr: 'S, M, L, XL', fit: 'Standard', gsm: '200 GSM'
    });

    // Payouts & Financials State
    const [financialSummary, setFinancialSummary] = useState<any>(null);
    const [designerPayouts, setDesignerPayouts] = useState<any[]>([]);
    const [showPayoutModal, setShowPayoutModal] = useState(false);
    const [payoutForm, setPayoutForm] = useState({ designerId: '', name: '', amount: '', method: 'Bank Transfer', note: '' });
    const [allOrders, setAllOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    
    // Create a ref to track current tab to prevent race conditions
    const activeTabRef = React.useRef(activeTab);
    useEffect(() => {
        activeTabRef.current = activeTab;
    }, [activeTab]);

    useEffect(() => {
        fetchData(activeTab);
    }, [activeTab]);

    const fetchData = async (tab: string) => {
        const storedUser = localStorage.getItem('userInfo');
        if (!storedUser) return;
        const parsedUser = JSON.parse(storedUser);
        const { token } = parsedUser;
        
        console.log(`[FetchData] Starting fetch for: ${tab}`);
        
        if (parsedUser.role !== 'admin') {
            console.error("Access denied: User is not an admin");
            return;
        }

        setLoading(true);
        try {
            let endpoint = '';
            if (tab === 'Approvals') endpoint = '/api/products/admin/pending';
            else if (tab === 'Categories') endpoint = '/api/base-products';
            else if (tab === 'Orders') endpoint = '/api/admin/orders';
            else if (tab === 'Payouts') {
                // Fetch summary, designers, AND orders for transaction table
                const [sumRes, desRes, ordRes] = await Promise.all([
                    fetch(`${API_URL}/api/admin/financial/summary`, { headers: { 'Authorization': `Bearer ${token}` } }),
                    fetch(`${API_URL}/api/admin/financial/designers`, { headers: { 'Authorization': `Bearer ${token}` } }),
                    fetch(`${API_URL}/api/admin/orders`, { headers: { 'Authorization': `Bearer ${token}` } })
                ]);
                const summary = await sumRes.json();
                const designers = await desRes.json();
                const orders = await ordRes.json();
                
                setFinancialSummary(summary);
                setDesignerPayouts(Array.isArray(designers) ? designers : []);
                setAllOrders(Array.isArray(orders) ? orders : []);
                return;
            }

            const res = await fetch(`${API_URL}${endpoint}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) {
                if (res.status === 401 || res.status === 403) {
                    alert("Not authorized. Please log in as an Admin.");
                }
                setData([]);
                return;
            }

            const result = await res.json();
            
            // Critical check: only update if we are still on the same tab
            if (activeTabRef.current !== tab) {
                console.log(`[FetchData] Tab changed from ${tab} to ${activeTabRef.current}. Aborting update.`);
                return;
            }

            console.log(`[FetchData] Updating data for ${tab} with ${Array.isArray(result) ? result.length : 'non-array'} items`);
            const validatedData = Array.isArray(result) ? result : [];
            setData(validatedData);
            if (tab === 'Orders') setAllOrders(validatedData);
        } catch (err) {
            console.error(`[FetchData] Error fetching ${tab}:`, err);
            // Only clear data if we are still on that tab
            if (activeTabRef.current === tab) setData([]);
        } finally {
            if (activeTabRef.current === tab) setLoading(false);
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
            ...categoryForm,
            colors: categoryForm.colorsStr.split(',').map(s => s.trim()),
            sizes: categoryForm.sizesStr.split(',').map(s => s.trim())
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
            {data.map((product: any) => (
                <div key={product._id} style={cardStyle}>
                    <div style={{...imageContainerStyle, height: '220px'}}>
                        {/* Simplified overlay for admin view */}
                        <img src={product.mockupImages?.[0] || '/img/womenfront-mockup.png'} style={{ width: '100%', height: '100%', objectFit: 'contain', zIndex: 1 }} alt="" />
                        {product.frontDesign && (
                            <img src={product.frontDesign} style={{ position: 'absolute', width: '30%', height: '30%', zIndex: 10, objectFit: 'contain' }} alt="" />
                        )}
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
            {data.length === 0 && <p style={{color: '#64748b', fontSize: '13px'}}>No pending approvals.</p>}
        </div>
    );

    const renderCategories = () => {
        const groups = ['Women', 'Men', 'Kids', 'Unisex'];
        
        return (
            <div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
                    <button onClick={() => {
                        setEditingCategory(null);
                        setCategoryForm({ name: '', category: 'Women', material: '100% Cotton', basePrice: 1200, image: '', colorsStr: 'White, Black', sizesStr: 'S, M, L, XL', fit: 'Standard', gsm: '200 GSM' });
                        setShowCategoryModal(true);
                    }} style={{ ...approveBtnStyle, padding: '10px 20px', background: '#0284c7' }}>+ Add Base T-Shirt</button>
                </div>

                {groups.map(group => {
                    const groupData = data.filter((item: any) => (item.category || 'Unisex') === group);
                    if (groupData.length === 0) return null;
                    return (
                        <div key={group} style={{ marginBottom: '35px' }}>
                            <h2 style={{ fontSize: '18px', color: '#0d375b', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px', marginBottom: '15px' }}>{group}'s Collection</h2>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '20px' }}>
                                {groupData.map((item: any) => (
                                    <div key={item._id} style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.06)' }}>
                                        <div style={{ height: '240px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px' }}>
                                            <img src={item.image || '/img/womenfront-mockup.png'} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="" />
                                        </div>
                                        <div style={{ padding: '15px' }}>
                                            <h3 style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#1e293b' }}>{item.name}</h3>
                                            <p style={{ margin: '0 0 8px 0', color: '#ef4444', fontWeight: 'bold', fontSize: '13px' }}>LKR {item.basePrice || 850}</p>
                                            <p style={{ margin: '0 0 12px 0', color: '#64748b', fontSize: '11px' }}>
                                                {item.sizes?.length || 4} sizes • {item.colors?.length || 5} colors
                                            </p>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button onClick={() => {
                                                    setEditingCategory(item);
                                                    setCategoryForm({
                                                        ...item,
                                                        colorsStr: item.colors?.join(', ') || '',
                                                        sizesStr: item.sizes?.join(', ') || ''
                                                    });
                                                    setShowCategoryModal(true);
                                                }} style={{ flex: 1, padding: '8px', background: '#0f2950', color: 'white', border: 'none', borderRadius: '6px', fontSize: '11px', cursor: 'pointer' }}>Edit Specs</button>
                                                <button onClick={() => handleDeleteCategory(item._id)} style={{ padding: '8px 12px', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '6px', fontSize: '11px', cursor: 'pointer' }}>Delete</button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
                {data.length === 0 && <p style={{padding: '20px', fontSize: '13px', color: '#64748b', textAlign: 'center', background: 'white', borderRadius: '12px'}}>No Base T-Shirts configured.</p>}
            </div>
        );
    };

    const renderOrders = () => {
        const statuses = ['All', 'Pending', 'Printing', 'Shipped', 'Delivered', 'Cancelled'];
        
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

        const filteredOrders = data.filter((order: any) => {
            const matchesStatus = filterStatus === 'All' || order.status === filterStatus;
            const matchesSearch = (order._id?.toLowerCase() || '').includes(searchQuery.toLowerCase()) || 
                                 (order.user?.name?.toLowerCase() || '').includes(searchQuery.toLowerCase());
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
                                    border: '1px solid #cbd5e1',
                                    fontSize: '11px',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    background: filterStatus === s ? '#0d375b' : 'white',
                                    color: filterStatus === s ? 'white' : '#64748b',
                                    transition: 'all 0.2s',
                                    boxShadow: filterStatus === s ? '0 4px 10px rgba(13, 55, 91, 0.2)' : 'none'
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
                                        <td style={{ ...tdStyle, fontWeight: 'bold', color: '#0d375b', paddingLeft: '30px' }}>
                                            #CR8-{order._id?.substring(order._id.length - 6).toUpperCase() || '?????'}
                                        </td>
                                        <td style={tdStyle}>
                                            <div style={{ width: '50px', height: '50px', background: '#f8fafc', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                                                <img 
                                                    src={order.orderItems?.[0]?.product?.mockupImages?.[0] || order.orderItems?.[0]?.image || '/img/womenfront-mockup.png'} 
                                                    style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt=""
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
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#f8fafc' }}>
            <BackHeader title="Marketplace Operations" />
            <div style={{ padding: '25px', maxWidth: '1200px', margin: '0 auto', flex: 1, width: '100%', textAlign: 'center' }}>
                <div style={{ display: 'flex', gap: '15px', marginBottom: '40px', justifyContent: 'center' }}>
                    {['Approvals', 'Categories', 'Orders', 'Payouts'].map(tab => (
                        <button 
                            key={tab} 
                            onClick={() => setActiveTab(tab)}
                            style={{ ...tabBtnStyle, background: activeTab === tab ? '#0d375b' : 'white', color: activeTab === tab ? 'white' : '#64748b' }}
                        >
                            {tab}
                        </button>
                    ))}
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
                        <h2 style={{ fontSize: '18px', color: '#0d375b', marginBottom: '10px' }}>Reject Submission</h2>
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
                        <h2 style={{ fontSize: '18px', color: '#0d375b', marginBottom: '20px' }}>{editingCategory ? 'Edit Base T-Shirt' : 'Add Base T-Shirt'}</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                            <div>
                                <label style={labelStyle}>Product Name</label>
                                <input value={categoryForm.name} onChange={e => setCategoryForm({...categoryForm, name: e.target.value})} style={inputStyle} />
                            </div>
                            <div>
                                <label style={labelStyle}>Category</label>
                                <select value={categoryForm.category} onChange={e => setCategoryForm({...categoryForm, category: e.target.value})} style={inputStyle}>
                                    <option>Women</option><option>Men</option><option>Kids</option><option>Unisex</option>
                                </select>
                            </div>
                            <div>
                                <label style={labelStyle}>Base Price (LKR)</label>
                                <input type="number" value={categoryForm.basePrice} onChange={e => setCategoryForm({...categoryForm, basePrice: parseInt(e.target.value)})} style={inputStyle} />
                            </div>
                            <div>
                                <label style={labelStyle}>Image URL</label>
                                <input value={categoryForm.image} placeholder="/img/model-placeholder.png" onChange={e => setCategoryForm({...categoryForm, image: e.target.value})} style={inputStyle} />
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
    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#f8fafc' }}>
            <BackHeader title="User Management" />
            <div style={{ padding: '25px', maxWidth: '1000px', margin: '0 auto', flex: 1, width: '100%' }}>
                <div style={{ background: 'white', padding: '30px', borderRadius: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', textAlign: 'center' }}>
                    <img src="/img/admin-security.png" style={{ width: '40px', marginBottom: '15px', opacity: 0.8 }} alt="" />
                    <h3 style={{ color: '#0d375b', fontSize: '18px', margin: '0 0 8px 0' }}>User Management Coming Soon</h3>
                    <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>This module will allow admins to block, suspend, add, or elevate user privileges.</p>
                </div>
            </div>
        </div>
    );
};

// -------------------------------------------------------------
// 3. ANALYTICS & INSIGHTS
// -------------------------------------------------------------
const AnalyticsInsights = () => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#f8fafc' }}>
            <BackHeader title="Analytics & Insights" />
            <div style={{ padding: '25px', maxWidth: '1000px', margin: '0 auto', flex: 1, width: '100%' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
                    <div style={{ background: 'white', padding: '25px', borderRadius: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', textAlign: 'center' }}>
                        <h3 style={{ color: '#64748b', margin: 0, fontSize: '13px' }}>Total Sales</h3>
                        <p style={{ color: '#22c55e', fontSize: '32px', fontWeight: 'bold', margin: '10px 0 0 0' }}>$0.00</p>
                    </div>
                </div>
            </div>
        </div>
    );
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