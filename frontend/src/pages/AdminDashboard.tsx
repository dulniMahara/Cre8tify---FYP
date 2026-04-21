import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import '../styles/dashboard.css'; 

const BackHeader = ({ title }: { title: string }) => {
    const navigate = useNavigate();
    return (
        <div style={{ padding: '20px 40px', background: '#0f2950', display: 'flex', alignItems: 'center', gap: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
            <button 
                onClick={() => navigate('/admin-dashboard')}
                style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px', transition: 'all 0.3s' }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            >
                ← Back
            </button>
            <h2 style={{ color: 'white', margin: 0 }}>{title}</h2>
        </div>
    );
};

const ManageModules = () => {
    const [pendingProducts, setPendingProducts] = useState<any[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [reason, setReason] = useState('');
    const [showRejectModal, setShowRejectModal] = useState(false);

    const API_URL = "http://localhost:5000";

    useEffect(() => {
        fetchPending();
    }, []);

    const fetchPending = async () => {
        const storedUser = localStorage.getItem('userInfo');
        if (!storedUser) return;
        const { token } = JSON.parse(storedUser);

        try {
            const res = await fetch(`${API_URL}/api/products/admin/pending`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setPendingProducts(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Error fetching pending products", err);
        }
    };

    const handleStatusUpdate = async (id: string, status: string, rejectionReason?: string) => {
        const { token } = JSON.parse(localStorage.getItem('userInfo') || '{}');
        
        try {
            const res = await fetch(`${API_URL}/api/products/${id}/status`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ status, rejectionReason })
            });

            if (res.ok) {
                setShowRejectModal(false);
                setReason('');
                fetchPending(); // Refresh the list
                alert(`Product ${status} successfully!`);
            }
        } catch (err) {
            alert("Failed to update status");
        }
    };

    const DesignOverlay = ({ mockup, canvasState, color }: any) => {
        const scaleFactor = 2.0; 
        const isFrontView = mockup?.toLowerCase().includes('front');

        return (
            <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{
                    position: 'absolute', inset: 0, backgroundColor: color || '#ffffff',
                    WebkitMaskImage: `url(${mockup})`, maskImage: `url(${mockup})`,
                    WebkitMaskSize: 'contain', maskSize: 'contain', WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat', WebkitMaskPosition: 'center', maskPosition: 'center', zIndex: 1
                }} />
                <img src={mockup} alt="Mockup" style={{ width: '100%', height: '100%', objectFit: 'contain', position: 'relative', zIndex: 2, mixBlendMode: 'multiply' }} />
                
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 10 }}>
                    {isFrontView && canvasState?.imageLayers?.map((l: any) => (
                        <img key={l.id} src={l.src} style={{
                            position: 'absolute',
                            left: `calc(50% + ${l.x / 10}%)`,
                            top: `calc(50% + ${l.y / 10}%)`,
                            transform: `translate(-50%, -50%) scale(${l.scale / scaleFactor}) rotate(${l.rotation}deg) scaleX(${l.flipX ? -1 : 1})`,
                            width: 'auto', maxWidth: '100%'
                        }} />
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#f8fafc' }}>
            <BackHeader title="Manage Modules" />
            <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto', flex: 1, width: '100%' }}>
                <div style={{ marginBottom: '30px' }}>
                    <h1 style={{ color: '#0d375b', fontSize: '32px', margin: '0 0 10px 0' }}>Pending Submissions</h1>
                    <p style={{ color: '#64748b', margin: 0 }}>Review and manage pending new designs from the community.</p>
                </div>

                {pendingProducts.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '100px', background: 'white', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                        <h3 style={{ color: '#94a3b8' }}>No pending submissions at the moment.</h3>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '30px' }}>
                        {pendingProducts.map((product: any) => (
                            <div key={product._id} className="design-card" style={cardStyle}>
                                <div style={imageContainerStyle}>
                                    <DesignOverlay 
                                        mockup={product.mockupImages?.[0]} 
                                        canvasState={product.canvasState} 
                                        color={product.tshirtColor || '#ffffff'} 
                                    />
                                </div>
                                <div style={{ padding: '20px' }}>
                                    <h3 style={{ margin: '0 0 5px 0', fontSize: '20px' }}>{product.title}</h3>
                                    <p style={{ margin: '0 0 15px 0', color: '#64748b', fontSize: '14px' }}>
                                        By: <strong>{product.designer?.name || 'Unknown'}</strong>
                                    </p>
                                    
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button 
                                            onClick={() => handleStatusUpdate(product._id, 'Approved')}
                                            style={approveBtnStyle}>Approve</button>
                                        <button 
                                            onClick={() => { setSelectedProduct(product); setShowRejectModal(true); }}
                                            style={rejectBtnStyle}>Reject</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* REJECT REASON MODAL */}
            {showRejectModal && (
                <div style={modalOverlayStyle}>
                    <div style={modalContentStyle}>
                        <h2 style={{ color: '#0d375b', marginBottom: '10px' }}>Reject Submission</h2>
                        <p style={{ color: '#64748b', marginBottom: '20px' }}>Provide a reason for the designer to fix the issue.</p>
                        
                        <textarea 
                            value={reason} 
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="e.g., Image resolution is too low..."
                            style={textareaStyle}
                        />

                        <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
                            <button 
                                onClick={() => handleStatusUpdate(selectedProduct._id, 'Rejected', reason)}
                                style={{ ...rejectBtnStyle, flex: 1 }}>Confirm Rejection</button>
                            <button 
                                onClick={() => setShowRejectModal(false)}
                                style={cancelBtnStyle}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const UserSecurityControl = () => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#f8fafc' }}>
            <BackHeader title="User & Security Control" />
            <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto', flex: 1, width: '100%' }}>
                <div style={{ marginBottom: '30px' }}>
                    <h1 style={{ color: '#0d375b', fontSize: '32px', margin: '0 0 10px 0' }}>User Overview</h1>
                    <p style={{ color: '#64748b', margin: 0 }}>Manage user roles, permissions, and security settings.</p>
                </div>
                <div style={{ background: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', textAlign: 'center' }}>
                    <span style={{ fontSize: '48px', marginBottom: '20px', display: 'block' }}>🛡️</span>
                    <h3 style={{ color: '#0d375b', fontSize: '24px', margin: '0 0 10px 0' }}>User Management Coming Soon</h3>
                    <p style={{ color: '#64748b', fontSize: '16px', margin: 0 }}>This module will allow admins to block, suspend, add, or elevate user privileges.</p>
                </div>
            </div>
        </div>
    );
};

const AnalyticsInsights = () => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#f8fafc' }}>
            <BackHeader title="Analytics & Insights" />
            <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto', flex: 1, width: '100%' }}>
                <div style={{ marginBottom: '30px' }}>
                    <h1 style={{ color: '#0d375b', fontSize: '32px', margin: '0 0 10px 0' }}>Platform Metrics</h1>
                    <p style={{ color: '#64748b', margin: 0 }}>View platform statistics, sales, and traffic data.</p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '30px' }}>
                    <div style={{ background: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', textAlign: 'center' }}>
                        <h3 style={{ color: '#64748b', margin: 0, fontSize: '18px' }}>Total Sales</h3>
                        <p style={{ color: '#22c55e', fontSize: '48px', fontWeight: 'bold', margin: '15px 0 0 0' }}>$0.00</p>
                    </div>
                    <div style={{ background: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', textAlign: 'center' }}>
                        <h3 style={{ color: '#64748b', margin: 0, fontSize: '18px' }}>Active Users</h3>
                        <p style={{ color: '#3b82f6', fontSize: '48px', fontWeight: 'bold', margin: '15px 0 0 0' }}>0</p>
                    </div>
                    <div style={{ background: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', textAlign: 'center' }}>
                        <h3 style={{ color: '#64748b', margin: 0, fontSize: '18px' }}>Pending Designs</h3>
                        <p style={{ color: '#f59e0b', fontSize: '48px', fontWeight: 'bold', margin: '15px 0 0 0' }}>0</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const HubCard = ({ title, icon, desc, onClick }: any) => {
    return (
        <div 
            onClick={onClick}
            style={{
                background: 'rgba(255,255,255,0.05)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '24px',
                padding: '40px 30px',
                width: '320px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-10px) scale(1.02)';
                e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                e.currentTarget.style.boxShadow = '0 20px 50px rgba(0,0,0,0.4), 0 0 20px rgba(56, 189, 248, 0.3)';
                e.currentTarget.style.border = '1px solid rgba(56, 189, 248, 0.5)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                e.currentTarget.style.boxShadow = '0 10px 40px rgba(0,0,0,0.2)';
                e.currentTarget.style.border = '1px solid rgba(255,255,255,0.1)';
            }}
        >
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>{icon}</div>
            <h2 style={{ color: 'white', fontSize: '24px', marginBottom: '15px' }}>{title}</h2>
            <p style={{ color: '#94a3b8', margin: 0, lineHeight: '1.6' }}>{desc}</p>
        </div>
    );
};

const AdminHub = () => {
    const navigate = useNavigate();
    
    return (
        <div style={{ 
            background: 'linear-gradient(135deg, #020617 0%, #0f172a 100%)', 
            minHeight: '100vh', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            fontFamily: "'Inter', sans-serif",
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Background glowing orbs for liveliness */}
            <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(56,189,248,0.15) 0%, rgba(0,0,0,0) 70%)', filter: 'blur(60px)', zIndex: 0 }} />
            <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, rgba(0,0,0,0) 70%)', filter: 'blur(80px)', zIndex: 0 }} />

            {/* Cre8tify Logo */}
            <div style={{ position: 'absolute', top: '40px', left: '50px', zIndex: 10, display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ color: 'white', fontSize: '28px', fontWeight: '900', letterSpacing: '1px' }}>Cre8tify</span>
                <span style={{ background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>Admin</span>
            </div>
            
            {/* Main Content */}
            <div style={{ zIndex: 10, textAlign: 'center', marginBottom: '60px' }}>
                <h1 style={{ color: 'white', fontSize: '56px', fontWeight: '800', marginBottom: '15px', textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>Admin Panel</h1>
                <p style={{ color: '#94a3b8', fontSize: '20px', fontWeight: '400', maxWidth: '600px', margin: '0 auto' }}>
                    Monitor platform activity, manage user roles, and curate new designs from the community.
                </p>
            </div>

            <div style={{ zIndex: 10, display: 'flex', gap: '40px', flexWrap: 'wrap', justifyContent: 'center', padding: '0 20px' }}>
                <HubCard 
                    title="Manage Modules" 
                    icon="📦" 
                    desc="Review pending submissions and curate the latest designs." 
                    onClick={() => navigate('/admin-dashboard/modules')} 
                />
                <HubCard 
                    title="User & Security" 
                    icon="🛡️" 
                    desc="Manage community roles, permissions, and platform security." 
                    onClick={() => navigate('/admin-dashboard/users')} 
                />
                <HubCard 
                    title="Analytics & Insights" 
                    icon="📊" 
                    desc="Track platform growth, sales metrics, and active users." 
                    onClick={() => navigate('/admin-dashboard/analytics')} 
                />
            </div>
        </div>
    );
};

const AdminDashboard = () => {
    return (
        <Routes>
            <Route path="/" element={<AdminHub />} />
            <Route path="/modules" element={<ManageModules />} />
            <Route path="/users" element={<UserSecurityControl />} />
            <Route path="/analytics" element={<AnalyticsInsights />} />
        </Routes>
    );
};

// --- STYLES ---
const cardStyle = { background: 'white', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', transition: 'transform 0.3s' };
const imageContainerStyle = { height: '320px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' };
const approveBtnStyle = { flex: 1, padding: '14px', background: '#22c55e', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', transition: 'background 0.2s' };
const rejectBtnStyle = { flex: 1, padding: '14px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', transition: 'background 0.2s' };
const cancelBtnStyle = { flex: 1, padding: '14px', background: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' };
const modalOverlayStyle: React.CSSProperties = { position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 };
const modalContentStyle = { background: 'white', padding: '40px', borderRadius: '24px', width: '90%', maxWidth: '500px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' };
const textareaStyle = { width: '100%', height: '140px', padding: '16px', borderRadius: '12px', border: '2px solid #e2e8f0', fontSize: '16px', outline: 'none', fontFamily: 'inherit', resize: 'vertical' as const, marginBottom: '10px' };

export default AdminDashboard;