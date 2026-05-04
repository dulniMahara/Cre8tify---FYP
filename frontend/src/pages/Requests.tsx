import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import Header from '../components/Header';
import MockupPreview from '../components/MockupPreview';
import '../styles/dashboard.css';

const API_URL = "http://localhost:5000";

interface RequestItem {
    id: string;
    customer: string;
    status: 'Pending' | 'Accepted' | 'Completed' | 'Rejected';
    submittedOn: string;
    productName: string;
    productImage: string;
    message: string;
    preferredTime: string;
    referenceImage?: string;
    color?: string;
    frontDesign?: string;
    frontPrintArea?: any;
    frontDesignScale?: number;
    canvasState?: { imageLayers: any[]; textLayers: any[] };
    extraNote?: string;
}

const Requests = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRequest, setSelectedRequest] = useState<RequestItem | null>(null);

    const [isAccepted, setIsAccepted] = useState(false);
    const [rejectPopup, setRejectPopup] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [showOfferForm, setShowOfferForm] = useState(false);
    const [allRequests, setAllRequests] = useState<RequestItem[]>([]);

    const fetchRequests = async () => {
        try {
            const response = await fetch(`${API_URL}/api/requests`);
            const data = await response.json();
            const mappedData = data.map((req: any) => ({ ...req, id: req._id }));
            setAllRequests(mappedData);
        } catch (err) {
            console.error("Error fetching requests:", err);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const filteredRequests = allRequests.filter(req => {
        const matchesTab = activeTab === 'All' || req.status === activeTab;
        const matchesSearch = req.id.toLowerCase().includes(searchQuery.toLowerCase()) || req.customer.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesTab && matchesSearch;
    });

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'Pending': return { bg: '#fff7ed', text: '#c2410c', border: '#ffedd5' };
            case 'Accepted': return { bg: '#eff6ff', text: '#1d4ed8', border: '#dbeafe' };
            case 'Completed': return { bg: '#f0fdf4', text: '#15803d', border: '#dcfce7' };
            case 'Rejected': return { bg: '#fef2f2', text: '#b91c1c', border: '#fee2e2' };
            default: return { bg: '#f1f5f9', text: '#475569', border: '#e2e8f0' };
        }
    };

    const handleEditRequest = () => {
        if (!selectedRequest) return;
        navigate('/design-tool', {
            state: {
                fulfillmentRequest: selectedRequest,
                selectedProduct: {
                    name: selectedRequest.productName,
                    image: selectedRequest.productImage,
                    mockup: selectedRequest.productImage,
                    basePrice: "0",
                    colors: [selectedRequest.color || "#ffffff"]
                },
                selectedTshirtColor: selectedRequest.color || "#ffffff"
            }
        });
    };

    return (
        <div className="dashboard-container">
            <Sidebar />

            <div className="main-content" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#f1f5f9' }}>
                <Header mode="title" title="CUSTOMER REQUESTS" />

                <div className="content-wrapper animate-fade" style={{ padding: '0 40px 40px 40px', flex: 1, width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                        <div>
                            <p style={{ color: '#64748b', marginTop: '20px', fontSize: '15px' }}>You have {filteredRequests.length} active requests requiring your attention.</p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
                        {['All', 'Pending', 'Accepted', 'Completed', 'Rejected'].map(tab => (
                            <button
                                key={tab}
                                className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab)}
                                style={{
                                    padding: '8px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: '600',
                                    cursor: 'pointer', background: activeTab === tab ? '#0f172a' : 'white',
                                    color: activeTab === tab ? 'white' : '#64748b', border: '1px solid #e2e8f0', transition: 'all 0.2s'
                                }}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
                        {filteredRequests.map((req) => {
                            const statusStyle = getStatusStyle(req.status);
                            const productMask = req.productImage?.startsWith?.('/uploads') ? `${API_URL}${req.productImage}` : req.productImage;

                            return (
                                <div key={req.id} style={{
                                    background: 'white', borderRadius: '16px', padding: '24px', display: 'flex',
                                    flexDirection: 'column', border: '1px solid #e2e8f0', boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
                                    transition: 'transform 0.3s ease, box-shadow 0.3s ease', cursor: 'pointer'
                                }} onClick={() => setSelectedRequest(req)}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <span style={{ background: statusStyle.bg, color: statusStyle.text, padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '800' }}>{req.status.toUpperCase()}</span>
                                            <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600' }}>ID: {req.id}</span>
                                        </div>
                                        <div style={{ width: '50px', height: '50px', background: '#f8fafc', borderRadius: '10px', padding: '3px', border: '1px solid #f1f5f9', position: 'relative', overflow: 'hidden' }}>
                                            {(() => {
                                                const productMask = req.productImage?.startsWith?.('/uploads') ? `${API_URL}${req.productImage}` : req.productImage;
                                                const isBase64 = productMask?.startsWith('data:image');
                                                const finalMaskUrl = isBase64 ? '/img/womenfront-mockup.png' : productMask;
                                                return (
                                                    <MockupPreview
                                                        mockupSrc={finalMaskUrl}
                                                        maskSrc={finalMaskUrl}
                                                        tshirtColor={req.color || '#ffffff'}
                                                        canvasState={req.canvasState}
                                                        designSrc={req.frontDesign}
                                                        printArea={req.frontPrintArea}
                                                        designScale={req.frontDesignScale || 1.0}
                                                        overallScale={1.5}
                                                    />
                                                );
                                            })()}
                                        </div>
                                    </div>
                                    <div style={{ marginBottom: '20px' }}>
                                        <div style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>{req.customer}</div>
                                        <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>Submitted on {req.submittedOn}</div>
                                        <div style={{ fontSize: '14px', color: '#334155', marginTop: '12px', display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.5' }}>{req.message}</div>
                                    </div>
                                    <div style={{ marginTop: 'auto', paddingTop: '15px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '12px', color: '#94a3b8' }}>Due in {req.preferredTime}</span>
                                        <button style={{ background: '#0f172a', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>View Request</button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
                <Footer />
            </div>

            {selectedRequest && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000 }}>
                    <div style={{ width: '95%', maxWidth: '1100px', maxHeight: '90vh', background: 'white', borderRadius: '24px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px rgba(0,0,0,0.25)' }}>
                        <div style={{ padding: '15px 30px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <button onClick={() => setSelectedRequest(null)} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '6px 12px', borderRadius: '10px', cursor: 'pointer', color: '#64748b', fontSize: '12px' }}>← Back</button>
                                <h2 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>Request Details</h2>
                            </div>
                            <div style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '600' }}>Request ID: {selectedRequest.id}</div>
                        </div>
                        <div style={{ display: 'flex', height: '100%', overflowY: 'auto' }}>
                            <div style={{ flex: 1.2, padding: '25px 30px', borderRight: '1px solid #f1f5f9' }}>
                                <div style={{ marginBottom: '20px' }}>
                                    <div style={{ fontSize: '11px', color: '#38bdf8', fontWeight: '700', textTransform: 'uppercase', marginBottom: '5px' }}>Customer</div>
                                    <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', margin: 0 }}>{selectedRequest.customer}</h1>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    <DetailSection label="Target Product" value={selectedRequest.productName} />
                                    <DetailSection label="Timeline" value={selectedRequest.preferredTime} />
                                    <DetailSection label="Message" value={selectedRequest.message} />
                                    {selectedRequest.extraNote && <DetailSection label="Note" value={selectedRequest.extraNote} />}
                                    
                                    {selectedRequest.referenceImage && (
                                        <div style={{ marginTop: '20px', padding: '15px', background: '#f0f9ff', borderRadius: '15px', border: '1px solid #bae6fd' }}>
                                            <div style={{ fontSize: '11px', color: '#0369a1', fontWeight: '800', textTransform: 'uppercase', marginBottom: '10px' }}>Customer Reference Image</div>
                                            <img src={selectedRequest.referenceImage} alt="Reference" style={{ width: '100%', maxHeight: '160px', objectFit: 'contain', borderRadius: '10px', marginBottom: '10px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', background: '#f8fafc' }} />
                                            <a 
                                                href={selectedRequest.referenceImage} 
                                                download={`reference-${selectedRequest.id}.png`}
                                                style={{ display: 'block', textAlign: 'center', padding: '8px', background: 'white', color: '#0369a1', border: '1px solid #bae6fd', borderRadius: '8px', fontSize: '12px', fontWeight: '700', textDecoration: 'none' }}
                                            >
                                                Download Reference ↓
                                            </a>
                                        </div>
                                    )}
                                </div>
                                <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #f1f5f9' }}>
                                    <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                                        <button onClick={async () => {
                                            const res = await fetch(`${API_URL}/api/requests/${selectedRequest.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'Accepted' }) });
                                            if (res.ok) { setIsAccepted(true); fetchRequests(); }
                                        }} style={{ flex: 1, padding: '10px', borderRadius: '10px', background: isAccepted ? '#10b981' : '#0f172a', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer' }}>{isAccepted ? 'Accepted ✓' : 'Accept Request'}</button>
                                        <button onClick={() => setRejectPopup(true)} style={{ flex: 0.5, padding: '10px', borderRadius: '10px', background: '#fee2e2', color: '#b91c1c', border: 'none', fontWeight: '700', cursor: 'pointer' }}>Reject</button>
                                    </div>
                                    <button onClick={() => setShowOfferForm(true)} disabled={!isAccepted} style={{ width: '100%', padding: '12px', borderRadius: '10px', background: isAccepted ? 'white' : '#f1f5f9', color: isAccepted ? '#0f172a' : '#94a3b8', border: `2px solid ${isAccepted ? '#0f172a' : '#e2e8f0'}`, fontSize: '13px', fontWeight: '800', cursor: isAccepted ? 'pointer' : 'not-allowed' }}>Send Offer ➜</button>
                                </div>
                            </div>
                            <div style={{ flex: 1, padding: '30px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <div onClick={handleEditRequest} style={{ background: 'white', padding: '25px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', width: '100%', maxWidth: '350px', textAlign: 'center', cursor: 'pointer' }}>
                                    <div style={{ fontSize: '11px', fontWeight: '700', color: '#38bdf8', marginBottom: '15px', textTransform: 'uppercase' }}>Edit Design →</div>
                                    <div style={{ width: '100%', height: '160px', position: 'relative' }}>
                                        {(() => {
                                            const productMask = selectedRequest.productImage?.startsWith?.('/uploads') ? `${API_URL}${selectedRequest.productImage}` : selectedRequest.productImage;
                                            const isBase64 = productMask?.startsWith('data:image');
                                            const finalMaskUrl = isBase64 ? '/img/womenfront-mockup.png' : productMask;
                                            return (
                                                <MockupPreview
                                                    mockupSrc={finalMaskUrl}
                                                    maskSrc={finalMaskUrl}
                                                    tshirtColor={selectedRequest.color || '#ffffff'}
                                                    canvasState={selectedRequest.canvasState}
                                                    designSrc={selectedRequest.frontDesign}
                                                    printArea={selectedRequest.frontPrintArea}
                                                    designScale={selectedRequest.frontDesignScale || 1.0}
                                                    overallScale={1.2}
                                                />
                                            );
                                        })()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <style>{`.animate-fade { animation: fadeIn 0.4s ease-out; } @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } } .tab-btn.active { background: #0f172a !important; color: white !important; }`}</style>
        </div>
    );
};

const DetailSection = ({ label, value }: { label: string, value: string }) => (
    <div>
        <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '3px' }}>{label}</div>
        <div style={{ fontSize: '14px', color: '#334155', fontWeight: '500' }}>{value}</div>
    </div>
);

export default Requests;