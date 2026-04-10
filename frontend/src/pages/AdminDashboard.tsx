import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import '../styles/dashboard.css';

const AdminDashboard = () => {
    const [pendingProducts, setPendingProducts] = useState([]);
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
            setPendingProducts(data);
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

    // 🟢 Add the DesignOverlay helper (Matches your Submission Page logic)
    const DesignOverlay = ({ mockup, canvasState, color }: any) => {
        const scaleFactor = 2.0; 
        const isFrontView = mockup.toLowerCase().includes('front');

        return (
            <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {/* Color Layer */}
                <div style={{
                    position: 'absolute', inset: 0, backgroundColor: color || '#ffffff',
                    WebkitMaskImage: `url(${mockup})`, maskImage: `url(${mockup})`,
                    WebkitMaskSize: 'contain', maskSize: 'contain', WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat', WebkitMaskPosition: 'center', maskPosition: 'center', zIndex: 1
                }} />
                {/* T-shirt Texture */}
                <img src={mockup} alt="Mockup" style={{ width: '100%', height: '100%', objectFit: 'contain', position: 'relative', zIndex: 2, mixBlendMode: 'multiply' }} />
                
                {/* Design Layers */}
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
        <div className="dashboard-container">
            <Sidebar />
            
            <div className="main-content" style={{ background: '#f8fafc' }}>
                <div className="top-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '90px', background: '#0d375b' }}>
                    <h2 style={{ color: 'white', margin: 0 }}>Admin Approval Center</h2>
                </div>

                <div className="content-wrapper" style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ marginBottom: '30px' }}>
                        <h1 style={{ color: '#0d375b', fontSize: '32px' }}>Pending Submissions</h1>
                        <p style={{ color: '#64748b' }}>Review new designs from your community.</p>
                    </div>

                    {pendingProducts.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '100px', background: 'white', borderRadius: '20px' }}>
                            <h3 style={{ color: '#94a3b8' }}>No pending submissions at the moment.</h3>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '30px' }}>
                            {pendingProducts.map((product: any) => (
                                <div key={product._id} className="design-card" style={cardStyle}>
                                    <div style={imageContainerStyle}>
                                        <DesignOverlay 
                                            mockup={product.mockupImages[0]} 
                                            canvasState={product.canvasState} 
                                            color={product.tshirtColor || '#ffffff'} // Fallback to white
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
                            placeholder="e.g., Image resolution is too low, design is off-center..."
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

// --- STYLES ---
const cardStyle = { background: 'white', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' };
const imageContainerStyle = { height: '300px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' };
const approveBtnStyle = { flex: 1, padding: '12px', background: '#22c55e', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' };
const rejectBtnStyle = { flex: 1, padding: '12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' };
const cancelBtnStyle = { flex: 1, padding: '12px', background: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' };
const modalOverlayStyle: React.CSSProperties = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 };
const modalContentStyle = { background: 'white', padding: '40px', borderRadius: '24px', width: '90%', maxWidth: '500px' };
const textareaStyle = { width: '100%', height: '120px', padding: '15px', borderRadius: '12px', border: '2px solid #e2e8f0', fontSize: '16px', outline: 'none', fontFamily: 'inherit' };

export default AdminDashboard;