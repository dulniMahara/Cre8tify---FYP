import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import Header from '../components/Header';
import '../styles/dashboard.css';

interface RequestItem {
    id: string;
    customer: string;
    status: 'Pending' | 'Accepted' | 'Completed' | 'Rejected';
    submittedOn: string;
    productName: string;
    productImage: string;
    message: string;
    preferredTime: string;
    color?: string;
    size?: string;
    price?: number;
}

const CustomerRequests = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('All');
    const [requests, setRequests] = useState<RequestItem[]>([]);
    const [selectedRequest, setSelectedRequest] = useState<RequestItem | null>(null);

    const fetchRequests = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
            if (!userInfo._id) return;

            const response = await fetch(`http://localhost:5000/api/requests/customer/${userInfo._id}`);
            const data = await response.json();
            
            // Map MongoDB _id to id for frontend compatibility
            const mappedData = data.map((req: any) => ({
                ...req,
                id: req._id,
            }));

            setRequests(mappedData);
        } catch (err) {
            console.error("Error fetching customer requests:", err);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'Pending': return { bg: '#fff7ed', text: '#c2410c', border: '#ffedd5' };
            case 'Accepted': return { bg: '#eff6ff', text: '#1d4ed8', border: '#dbeafe' };
            case 'Completed': return { bg: '#f0fdf4', text: '#15803d', border: '#dcfce7' };
            case 'Rejected': return { bg: '#fef2f2', text: '#b91c1c', border: '#fee2e2' };
            default: return { bg: '#f1f5f9', text: '#475569', border: '#e2e8f0' };
        }
    };

    const filteredRequests = requests.filter(req => activeTab === 'All' || req.status === activeTab);

    return (
        <div className="dashboard-container">
            <Sidebar variant="customer" />

            <div className="main-content" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#f8fafc' }}>
                <Header showCart={true} mode="title" title="" />

                <div className="content-wrapper animate-fade" style={{ padding: '20px', flex: 1, maxWidth: '800px', margin: '0 auto', width: '100%' }}>
                    <div style={{ marginBottom: '25px' }}>
                        <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#0d375b', margin: '0 0 5px 0' }}>My Edit Requests 📝</h2>
                        <p style={{ color: '#64748b', fontSize: '13px' }}>Track and manage your custom design requests sent to designers.</p>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                        {['All', 'Pending', 'Accepted', 'Completed'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                style={{
                                    padding: '8px 16px', borderRadius: '20px', border: '1px solid #e2e8f0',
                                    background: activeTab === tab ? '#0d375b' : 'white',
                                    color: activeTab === tab ? 'white' : '#64748b',
                                    fontWeight: '700', fontSize: '12px', cursor: 'pointer'
                                }}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {filteredRequests.length > 0 ? filteredRequests.map((req) => {
                            const statusStyle = getStatusStyle(req.status);
                            return (
                                <div key={req.id} style={{
                                    background: 'white', borderRadius: '15px', padding: '15px',
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    border: '1.5px solid #f1f5f9', boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
                                }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                                            <span style={{ background: statusStyle.bg, color: statusStyle.text, padding: '4px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: '800' }}>{req.status}</span>
                                            <span style={{ fontSize: '11px', color: '#94a3b8' }}>ID: {req.id}</span>
                                        </div>
                                        <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#1e293b', margin: '0 0 4px 0' }}>{req.productName}</h3>
                                        <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 12px 0' }}>Sent on {req.submittedOn}</p>
                                        <button
                                            onClick={() => setSelectedRequest(req)}
                                            style={{ background: '#f1f5f9', color: '#0d375b', border: 'none', padding: '6px 15px', borderRadius: '12px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}
                                        >
                                            View Progress
                                        </button>
                                    </div>
                                    <div style={{ width: '80px', height: '80px', background: '#f8fafc', borderRadius: '12px', padding: '5px', position: 'relative', overflow: 'hidden' }}>
                                        {/* Dynamic T-shirt Preview for List Item */}
                                        <div style={{
                                            width: '100%', height: '100%',
                                            backgroundColor: req.color || '#ffffff',
                                            WebkitMaskImage: `url(${req.productImage})`,
                                            maskImage: `url(${req.productImage})`,
                                            WebkitMaskSize: 'contain', maskSize: 'contain',
                                            WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat',
                                            WebkitMaskPosition: 'center', maskPosition: 'center',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}>
                                            <img src={req.productImage} style={{ width: '100%', height: '100%', objectFit: 'contain', mixBlendMode: 'multiply' }} alt="Product" />

                                            {(req as any).frontDesign && (
                                                <div style={{
                                                    position: 'absolute',
                                                    ...((req as any).frontPrintArea || { top: '50%', left: '51%', width: '30%', height: '27%' }),
                                                    transform: 'translate(-50%, -50%)',
                                                    zIndex: 999, pointerEvents: 'none'
                                                }}>
                                                    <img src={(req as any).frontDesign} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        }) : (
                            <div style={{ textAlign: 'center', padding: '60px 0', background: 'white', borderRadius: '20px', border: '1.5px dashed #e2e8f0' }}>
                                <div style={{ fontSize: '40px', marginBottom: '10px' }}>📪</div>
                                <h3 style={{ color: '#0d375b', fontWeight: '800' }}>No requests yet</h3>
                                <p style={{ color: '#64748b', fontSize: '13px' }}>Start by requesting an edit on any product page.</p>
                            </div>
                        )}
                    </div>
                </div>
                <Footer />
            </div>

            {/* DETAIL MODAL */}
            {selectedRequest && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
                    <div style={{ background: 'white', padding: '30px', borderRadius: '24px', width: '500px', maxWidth: '90%', position: 'relative' }}>
                        <button onClick={() => setSelectedRequest(null)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>×</button>

                        <h2 style={{ fontSize: '22px', fontWeight: '900', color: '#0d375b', marginBottom: '20px' }}>Request Details</h2>

                        <div style={{ display: 'flex', gap: '20px', marginBottom: '25px', background: '#f8fafc', padding: '15px', borderRadius: '15px' }}>
                            <div style={{ flex: 1.5, position: 'relative', overflow: 'hidden', background: 'white', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '220px' }}>
                                {/* High-Fidelity Modal Preview */}
                                <div style={{
                                    width: '100%', height: '100%',
                                    backgroundColor: selectedRequest.color || '#ffffff',
                                    WebkitMaskImage: `url(${selectedRequest.productImage})`,
                                    maskImage: `url(${selectedRequest.productImage})`,
                                    WebkitMaskSize: 'contain', maskSize: 'contain',
                                    WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat',
                                    WebkitMaskPosition: 'center', maskPosition: 'center',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    transform: (selectedRequest as any).frontDesign ? 'scale(1.7)' : 'scale(1)'
                                }}>
                                    <img src={selectedRequest.productImage} style={{ width: '100%', height: '100%', objectFit: 'contain', mixBlendMode: 'multiply' }} alt="Product" />

                                    {(selectedRequest as any).frontDesign && (
                                        <div style={{
                                            position: 'absolute',
                                            ...((selectedRequest as any).frontPrintArea || { top: '50%', left: '51%', width: '30%', height: '27%' }),
                                            transform: 'translate(-50%, -50%) scale(0.85)',
                                            zIndex: 999, pointerEvents: 'none'
                                        }}>
                                            <img src={(selectedRequest as any).frontDesign} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="" />
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div>
                                <h4 style={{ margin: '0 0 5px 0', fontSize: '16px' }}>{selectedRequest.productName}</h4>
                                <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Size: {selectedRequest.size || 'M'} | Color: <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: selectedRequest.color }}></span></p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '5px' }}>Your Message</label>
                                <p style={{ fontSize: '14px', color: '#1e293b', margin: 0, background: '#f1f5f9', padding: '12px', borderRadius: '10px' }}>{selectedRequest.message}</p>
                            </div>
                            <div style={{ display: 'flex', gap: '20px' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '5px' }}>Timeframe</label>
                                    <p style={{ fontSize: '14px', fontWeight: '700' }}>{selectedRequest.preferredTime}</p>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '5px' }}>Status</label>
                                    <p style={{ fontSize: '14px', fontWeight: '700', color: getStatusStyle(selectedRequest.status).text }}>{selectedRequest.status}</p>
                                </div>
                            </div>
                        </div>

                        <div style={{ marginTop: '30px', borderTop: '1px solid #f1f5f9', paddingTop: '20px', textAlign: 'center' }}>
                            {selectedRequest.status === 'Completed' ? (
                                <>
                                    <p style={{ fontSize: '13px', color: '#15803d', fontWeight: '700', marginBottom: '15px' }}>
                                        🎉 The designer has finished your edit! Review it above.
                                    </p>
                                    <button
                                        onClick={() => {
                                            // Handle checkout logic here - e.g., add to cart and navigate
                                            alert("Proceeding to checkout with your custom design...");
                                            navigate('/checkout', { state: { customProduct: selectedRequest } });
                                        }}
                                        style={{
                                            width: '100%', padding: '15px', borderRadius: '30px',
                                            background: '#0d375b', color: 'white', border: 'none',
                                            fontWeight: '800', cursor: 'pointer', boxShadow: '0 4px 15px rgba(13, 55, 91, 0.2)'
                                        }}
                                    >
                                        Proceed to Checkout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '15px' }}>
                                        Communication with the designer will be enabled once the request is accepted.
                                    </p>
                                    <button disabled style={{ width: '100%', padding: '12px', borderRadius: '30px', background: '#e2e8f0', color: '#94a3b8', border: 'none', fontWeight: '700', cursor: 'not-allowed' }}>
                                        {selectedRequest.status === 'Pending' ? 'Waiting for Designer' : 'Open Chat (Accepted)'}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerRequests;
