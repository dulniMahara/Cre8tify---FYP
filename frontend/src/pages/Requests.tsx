import React, { useState, useEffect } from 'react'; // Added useEffect
import { useNavigate } from 'react-router-dom'; // Added useNavigate
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import Header from '../components/Header';
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
}

const Requests = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRequest, setSelectedRequest] = useState<RequestItem | null>(null);

    // 🟢 STATES FOR LOGIC FLOW
    const [isAccepted, setIsAccepted] = useState(false); 
    const [rejectPopup, setRejectPopup] = useState(false); 
    const [rejectionReason, setRejectionReason] = useState('');
    const [showOfferForm, setShowOfferForm] = useState(false);

    // 🟢 LOAD USER PROFILE DATA & PERSISTED REQUESTS
    const [allRequests, setAllRequests] = useState<RequestItem[]>([]);

    useEffect(() => {
        const mockRequests: RequestItem[] = [
            { 
                id: '#123900', 
                customer: 'Pavani Subasinghe', 
                status: 'Pending', 
                submittedOn: '20 Oct 2025', 
                productName: 'Evangelion Retro', 
                productImage: '/img/shop3.png',
                message: "I want to change the original design, will provide the preferred design below.",
                preferredTime: "2 Days",
                referenceImage: "/img/shop1.png" 
            },
            { 
                id: '#111780', 
                customer: 'Ashan Amarasingha', 
                status: 'Pending', 
                submittedOn: '18 Oct 2025', 
                productName: 'Neon Waves', 
                productImage: '/img/shop4.png',
                message: "Can we change the background color to a darker navy blue instead of black?",
                preferredTime: "1 Day" 
            },
            { 
                id: '#109221', 
                customer: 'Sarah J.', 
                status: 'Accepted', 
                submittedOn: '15 Oct 2025', 
                productName: 'Spider Lily Abstract', 
                productImage: '/img/shop1.png',
                message: "Is it possible to make the spider lily red instead of white?",
                preferredTime: "3 Days" 
            }
        ];

        const savedRequests = JSON.parse(localStorage.getItem('designer_requests') || '[]');
        setAllRequests([...savedRequests, ...mockRequests]);
    }, []);

    const filteredRequests = allRequests.filter(req => {
        const matchesTab = activeTab === 'All' || req.status === activeTab;
        const matchesSearch = req.id.toLowerCase().includes(searchQuery.toLowerCase()) || req.customer.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesTab && matchesSearch;
    });

    const getStatusStyle = (status: string) => {
        switch(status) {
            case 'Pending': return { bg: '#fff7ed', text: '#c2410c', border: '#ffedd5' }; 
            case 'Accepted': return { bg: '#eff6ff', text: '#1d4ed8', border: '#dbeafe' }; 
            case 'Completed': return { bg: '#f0fdf4', text: '#15803d', border: '#dcfce7' }; 
            case 'Rejected': return { bg: '#fef2f2', text: '#b91c1c', border: '#fee2e2' }; 
            default: return { bg: '#f1f5f9', text: '#475569', border: '#e2e8f0' };
        }
    };

    const handleSendOffer = () => {
        if (!isAccepted) return; 
        setShowOfferForm(true);
    };

    return (
        <div className="dashboard-container">
            <Sidebar />
            
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap');
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

                {`
                    .animate-fade { animation: fadeIn 0.5s ease-out; }
                    @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
                    @keyframes scaleUp { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }

                    .request-card {
                        background: #eff6ff;
                        border-radius: 10px;
                        padding: 13px;
                        display: flex; justify-content: space-between; align-items: center;
                        transition: all 0.3s ease;
                        border: 1px solid #f1f5f9;
                        box-shadow: 0 2px 3px rgba(0,0,0,0.02);
                        position: relative;
                        overflow: hidden;
                    }
                    .request-card:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 8px 15px rgba(0,0,0,0.08);
                        border-color: #e2e8f0;
                    }
                    .request-card::before {
                        content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 3px;
                        background: #0d375b; border-top-left-radius: 10px; border-bottom-left-radius: 10px;
                    }

                    .tab-btn { padding: 5px 12px; border: 1px solid #e2e8f0; background: white; color: #64748b; cursor: pointer; font-weight: 600; font-size: 7px; transition: 0.2s; }
                    .tab-btn:hover { background: #f8fafc; color: #0f172a; }
                    .tab-btn.active { background: #0d375b; color: white; border-color: #0d375b; }
                    
                    .glass-search-bar { display: flex; align-items: center; background: rgba(255, 255, 255, 0.15); border: 1px solid rgba(255, 255, 255, 0.3); border-radius: 25px; padding: 5px 10px; width: 100%; max-width: 225px; backdrop-filter: blur(4px); }
                    .search-input { background: transparent; border: none; outline: none; color: white; margin-left: 6px; width: 100%; font-size: 8px; }
                    .search-input::placeholder { color: rgba(255, 255, 255, 0.8) !important; }

                    .detail-label { width: 90px; font-size: 8px; color: #334155; font-weight: 700; text-transform: uppercase; letter-spacing: 0.3px; }
                    .detail-value { flex: 1; font-size: 8px; color: #0f172a; font-weight: 500; line-height: 1.6; }
                `}
            </style>

            <div className="main-content" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#f8fafc' }}>
                
                <Header showCart={false} onSearch={setSearchQuery} userRole="designer" />

                <div className="content-wrapper animate-fade" style={{ padding: '20px', flex: 1, maxWidth: '600px', margin: '0 auto', width: '100%' }}>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '18px' }}>
                        <div>
                            <h2 style={{ fontFamily: "'Inter', sans-serif", fontSize: '14px', fontWeight: '700', color: '#1e293b', marginBottom: '4px' }}>Manage Requests 📩</h2>
                            <p style={{ color: '#64748b', fontSize: '8px' }}>You have {filteredRequests.length} active requests requiring attention.</p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', marginBottom: '15px' }}>
                        {['All', 'Pending', 'Accepted', 'Completed', 'Rejected'].map(tab => (
                            <button key={tab} className={`tab-btn ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>{tab}</button>
                        ))}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {filteredRequests.map((req) => {
                            const statusStyle = getStatusStyle(req.status);
                            return (
                                <div key={req.id} className="request-card">
                                    <div style={{ flex: 1, paddingLeft: '8px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                            <span style={{ background: statusStyle.bg, color: statusStyle.text, border: `1px solid ${statusStyle.border}`, padding: '3px 7px', borderRadius: '15px', fontSize: '6px', fontWeight: '800', letterSpacing: '0.3px' }}>{req.status.toUpperCase()}</span>
                                            <span style={{ fontSize: '7px', color: '#64748b', fontWeight: '500' }}>ID: {req.id}</span>
                                        </div>
                                        <div style={{ marginBottom: '10px' }}>
                                            <div style={{ fontSize: '9px', fontWeight: '700', color: '#1e293b', marginBottom: '2px' }}>{req.customer}</div>
                                            <div style={{ fontSize: '7px', color: '#64748b' }}>Submitted on {req.submittedOn}</div>
                                        </div>
                                        <button onClick={() => setSelectedRequest(req)} style={{ background: '#0d375b', color: 'white', border: 'none', padding: '5px 14px', borderRadius: '15px', fontSize: '7px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 2px 6px rgba(13, 55, 91, 0.25)' }}>View Request Details</button>
                                    </div>
                                    <div style={{ 
                                        width: '60px', height: '60px', background: '#f8fafc', borderRadius: '8px', 
                                        padding: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                        border: '1px solid #f1f5f9', position: 'relative', overflow: 'hidden' 
                                    }}>
                                        {/* Dynamic T-shirt Preview for List Item */}
                                        <div style={{
                                            width: '100%', height: '100%',
                                            backgroundColor: (req as any).color || '#ffffff',
                                            WebkitMaskImage: `url(${req.productImage})`,
                                            maskImage: `url(${req.productImage})`,
                                            WebkitMaskSize: 'contain', maskSize: 'contain', 
                                            WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat', 
                                            WebkitMaskPosition: 'center', maskPosition: 'center',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}>
                                            <img src={req.productImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', mixBlendMode: 'multiply' }} />
                                            
                                            {(req as any).frontDesign && (
                                                <div style={{
                                                    position: 'absolute',
                                                    ...((req as any).frontPrintArea || { top: '50%', left: '51%', width: '30%', height: '27%' }),
                                                    transform: 'translate(-50%, -50%)',
                                                    zIndex: 999, pointerEvents: 'none'
                                                }}>
                                                    <img src={(req as any).frontDesign} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="Design Overlay" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
                <Footer />
            </div>

            {/* FULL PAGE DETAIL MODAL */}
            {selectedRequest && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(255,255,255,0.98)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000, animation: 'fadeIn 0.2s ease-out' }}>
                    <div style={{ width: '100%', maxWidth: '650px', height: '90vh', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ padding: '8px 0' }}>
                            <button onClick={() => setSelectedRequest(null)} style={{ background: 'transparent', border: 'none', fontSize: '8px', fontWeight: '600', color: '#334155', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>← Back</button>
                        </div>
                        <div style={{ background: '#dbeafe', flex: 1, borderRadius: '12px', padding: '25px', display: 'flex', gap: '25px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', position: 'relative' }}>
                            <div style={{ flex: 1.5, display: 'flex', flexDirection: 'column', height: '100%' }}>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '15px' }}>
                                    <h1 style={{ fontFamily: '"Instrument Serif", serif', fontSize: '28px', fontStyle: 'italic', color: '#0f172a', margin: 0 }}>{selectedRequest.customer}</h1>
                                    <span style={{ fontSize: '10px', color: '#64748b', fontWeight: '500', fontFamily: 'monospace' }}>{selectedRequest.id}</span>
                                </div>
                                <div style={{ background: 'rgba(255, 255, 255, 0.6)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.9)', padding: '20px', borderRadius: '15px', display: 'flex', flexDirection: 'column', flex: 1, boxShadow: '0 5px 15px rgba(0,0,0,0.05)' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '20px' }}>
                                        <div style={{ display: 'flex' }}><div className="detail-label">Product</div><div className="detail-value">{selectedRequest.productName}</div></div>
                                        <div style={{ display: 'flex' }}><div className="detail-label">Preferred Changes</div><div className="detail-value">{selectedRequest.message}</div></div>
                                        <div style={{ display: 'flex' }}><div className="detail-label">Preferred Time</div><div className="detail-value">{selectedRequest.preferredTime}</div></div>
                                        {selectedRequest.referenceImage && (
                                            <div style={{ display: 'flex' }}><div className="detail-label">Reference Image</div><div style={{ flex: 1 }}><img src={selectedRequest.referenceImage} alt="Ref" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px', border: '2px solid white', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }} /></div></div>
                                        )}
                                    </div>
                                    <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', width: '100%', paddingTop: '10px', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                            <button onClick={() => setIsAccepted(true)} style={{ padding: '7px 30px', borderRadius: '20px', background: isAccepted ? '#16a34a' : '#0f172a', color: 'white', border: 'none', fontSize: '8px', fontWeight: '700', cursor: isAccepted ? 'default' : 'pointer' }}>{isAccepted ? 'Accepted ✓' : 'Accept'}</button>
                                            <button onClick={() => { setIsAccepted(false); setRejectPopup(true); }} style={{ padding: '7px 30px', borderRadius: '20px', background: '#b91c1c', color: 'white', border: 'none', fontSize: '8px', fontWeight: '700', cursor: 'pointer' }}>Reject</button>
                                        </div>
                                        <button onClick={handleSendOffer} disabled={!isAccepted} style={{ padding: '8px 40px', borderRadius: '20px', background: isAccepted ? 'white' : 'rgba(255,255,255,0.5)', color: isAccepted ? '#0f172a' : '#94a3b8', border: '1px solid #0f172a', fontSize: '8px', fontWeight: '800' }}>Send Offer ➜</button>
                                    </div>
                                </div>
                            </div>
                            <div style={{ flex: 1.5, display: 'flex', flexDirection: 'column', height: '100%' }}>
                                <div style={{ height: '35px', marginBottom: '15px' }}></div>
                                <div style={{ background: 'white', borderRadius: '15px', padding: '5px', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                                    {/* High-Fidelity Modal Preview */}
                                    <div style={{
                                        width: '100%', height: '100%',
                                        backgroundColor: (selectedRequest as any).color || '#ffffff',
                                        WebkitMaskImage: `url(${selectedRequest.productImage})`,
                                        maskImage: `url(${selectedRequest.productImage})`,
                                        WebkitMaskSize: 'contain', maskSize: 'contain', 
                                        WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat', 
                                        WebkitMaskPosition: 'center', maskPosition: 'center',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        transform: (selectedRequest as any).frontDesign ? 'scale(1.7)' : 'scale(1)'
                                    }}>
                                        <img src={selectedRequest.productImage} alt="Product" style={{ width: '100%', height: '100%', objectFit: 'contain', mixBlendMode: 'multiply' }} />
                                        
                                        {(selectedRequest as any).frontDesign && (
                                            <div style={{
                                                position: 'absolute',
                                                ...((selectedRequest as any).frontPrintArea || { top: '50%', left: '51%', width: '30%', height: '27%' }),
                                                transform: 'translate(-50%, -50%) scale(0.85)',
                                                zIndex: 999, pointerEvents: 'none'
                                            }}>
                                                <img src={(selectedRequest as any).frontDesign} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="Design" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* REJECTION POPUP */}
                    {rejectPopup && (
                        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 4000 }}>
                            <div style={{ background: 'white', width: '250px', padding: '20px', borderRadius: '12px' }}>
                                <h3 style={{ fontSize: '12px', fontWeight: '800', color: '#b91c1c', marginBottom: '5px' }}>Reject Request?</h3>
                                <textarea placeholder="Reason for rejection..." value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} style={{ width: '100%', height: '50px', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', marginBottom: '13px' }} />
                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                    <button onClick={() => setRejectPopup(false)} style={{ padding: '5px 10px', borderRadius: '4px', border: '1px solid #e2e8f0', background: 'white' }}>Cancel</button>
                                    <button onClick={() => { alert('Request Rejected'); setRejectPopup(false); setSelectedRequest(null); }} style={{ padding: '5px 13px', borderRadius: '4px', background: '#b91c1c', color: 'white' }}>Confirm Reject</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SEND OFFER FORM */}
                    {showOfferForm && (
                        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5000 }}>
                            <div style={{ background: 'white', width: '275px', padding: '25px', borderRadius: '8px', position: 'relative' }}>
                                <button onClick={() => setShowOfferForm(false)} style={{ position: 'absolute', top: '10px', right: '10px', background: 'transparent', border: 'none', fontSize: '12px' }}>&times;</button>
                                <h3 style={{ fontSize: '13px', fontWeight: '700', textAlign: 'center', marginBottom: '20px' }}>Send Offer</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <div><label style={{ display: 'block', fontWeight: '600' }}>Fee (LKR):</label><input type="text" style={{ width: '100%', padding: '6px', border: '1px solid #ddd', borderRadius: '4px' }} /></div>
                                    <div><label style={{ display: 'block', fontWeight: '600' }}>Time (Days):</label><input type="text" style={{ width: '100%', padding: '6px', border: '1px solid #ddd', borderRadius: '4px' }} /></div>
                                    <button onClick={() => { alert('Offer Sent!'); setShowOfferForm(false); setSelectedRequest(null); }} style={{ background: '#0d375b', color: 'white', padding: '6px', borderRadius: '15px', fontWeight: '700', marginTop: '10px' }}>Submit Offer</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Requests;