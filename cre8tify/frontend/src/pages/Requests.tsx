import React, { useState, useEffect } from 'react'; // Added useEffect
import { useNavigate } from 'react-router-dom'; // Added useNavigate
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
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

    // 🟢 DYNAMIC USER STATE
    const [navProfileImg, setNavProfileImg] = useState("/img/profile-picture.png");

    // 🟢 STATES FOR LOGIC FLOW
    const [isAccepted, setIsAccepted] = useState(false); 
    const [rejectPopup, setRejectPopup] = useState(false); 
    const [rejectionReason, setRejectionReason] = useState('');
    const [showOfferForm, setShowOfferForm] = useState(false);

    // 🟢 LOAD USER PROFILE DATA
    useEffect(() => {
        const storedUser = localStorage.getItem('userInfo');
        if (storedUser) {
            const userObj = JSON.parse(storedUser);
            if (userObj.profileImage) {
                const fullUrl = userObj.profileImage.startsWith('http') 
                    ? userObj.profileImage 
                    : `${API_URL}${userObj.profileImage.startsWith('/') ? '' : '/'}${userObj.profileImage}`;
                setNavProfileImg(fullUrl);
            }
        }
    }, []);

    // 🟢 SECURE LOGOUT
    const handleLogout = () => {
        if (window.confirm("Are you sure you want to logout?")) {
            localStorage.removeItem('userInfo');
            sessionStorage.clear();
            navigate('/');
        }
    };

    const requests: RequestItem[] = [
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
        },
        { 
            id: '#108882', 
            customer: 'Mike Ross', 
            status: 'Completed', 
            submittedOn: '10 Oct 2025', 
            productName: 'Dark Moon Phase', 
            productImage: '/img/shop2.png',
            message: "Please add '2025' text in small font at the bottom right.",
            preferredTime: "1 Day" 
        },
    ];

    const filteredRequests = requests.filter(req => {
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
                    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                    @keyframes scaleUp { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }

                    .request-card {
                        background: #eff6ff;
                        border-radius: 20px;
                        padding: 25px;
                        display: flex; justify-content: space-between; align-items: center;
                        transition: all 0.3s ease;
                        border: 1px solid #f1f5f9;
                        box-shadow: 0 4px 6px rgba(0,0,0,0.02);
                        position: relative;
                        overflow: hidden;
                    }
                    .request-card:hover {
                        transform: translateY(-5px);
                        box-shadow: 0 15px 30px rgba(0,0,0,0.08);
                        border-color: #e2e8f0;
                    }
                    .request-card::before {
                        content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 6px;
                        background: #0d375b; border-top-left-radius: 20px; border-bottom-left-radius: 20px;
                    }

                    .tab-btn { padding: 10px 24px; border: 1px solid #e2e8f0; background: white; color: #64748b; cursor: pointer; font-weight: 600; font-size: 14px; transition: 0.2s; }
                    .tab-btn:hover { background: #f8fafc; color: #0f172a; }
                    .tab-btn.active { background: #0d375b; color: white; border-color: #0d375b; }
                    
                    .glass-search-bar { display: flex; align-items: center; background: rgba(255, 255, 255, 0.15); border: 1px solid rgba(255, 255, 255, 0.3); border-radius: 50px; padding: 10px 20px; width: 100%; max-width: 450px; backdrop-filter: blur(8px); }
                    .search-input { background: transparent; border: none; outline: none; color: white; margin-left: 12px; width: 100%; font-size: 15px; }
                    .search-input::placeholder { color: rgba(255, 255, 255, 0.8) !important; }

                    .detail-label { width: 180px; font-size: 15px; color: #334155; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
                    .detail-value { flex: 1; font-size: 16px; color: #0f172a; font-weight: 500; line-height: 1.6; }
                `}
            </style>

            <div className="main-content" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#f8fafc' }}>
                
                {/* HEADER */}
                <div className="top-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 40px', height: '90px', background: '#0d375b' }}>
                    <div style={{ fontFamily: '"Instrument Serif", serif', fontSize: '48px', color: 'white', letterSpacing: '1px', fontStyle: 'italic', flex: 1 }}>
                        Requests
                    </div>
                    <div className="search-bar" style={{ flex: 2, maxWidth: '500px', display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(5px)', padding: '10px 20px', borderRadius: '30px', margin: '0 20px', border: '1px solid rgba(255,255,255,0.2)' }}>
                        <img src="/img/search.png" alt="Search" style={{ width: '20px', opacity: 0.8, filter: 'brightness(0) invert(1)' }} />
                        <input className="search-input" type="text" placeholder="Search ID or Customer" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ background: 'transparent', border: 'none', outline: 'none', color: 'white', marginLeft: '10px', width: '100%', fontSize: '16px' }} />
                    </div>
                    <div className="header-icons" style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', gap: '25px', alignItems: 'center' }}>
                        {/* 🟢 DYNAMIC PROFILE IMAGE */}
                        <img 
                            src={navProfileImg} 
                            className="nav-icon" 
                            alt="Profile" 
                            style={{ width: '45px', height: '45px', borderRadius: '50%', objectFit: 'cover', cursor: 'pointer', border: '2px solid rgba(255,255,255,0.2)' }}
                            onClick={() => navigate('/profile')}
                            onError={(e) => { (e.target as HTMLImageElement).src = "/img/profile-picture.png"; }}
                        />
                        <img src="/img/notifi.png" className="nav-icon" alt="Notif" />
                        <img src="/img/logout.png" className="nav-icon" alt="Logout" style={{ width: '50px', height: '50px', cursor: 'pointer' }} onClick={handleLogout} />
                    </div>
                </div>

                <div className="content-wrapper animate-fade" style={{ padding: '40px', flex: 1, maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '35px' }}>
                        <div>
                            <h2 style={{ fontFamily: "'Inter', sans-serif", fontSize: '28px', fontWeight: '700', color: '#1e293b', marginBottom: '8px' }}>Manage Requests 📩</h2>
                            <p style={{ color: '#64748b', fontSize: '15px' }}>You have {filteredRequests.length} active requests requiring attention.</p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', marginBottom: '30px' }}>
                        {['All', 'Pending', 'Accepted', 'Completed', 'Rejected'].map(tab => (
                            <button key={tab} className={`tab-btn ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>{tab}</button>
                        ))}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                        {filteredRequests.map((req) => {
                            const statusStyle = getStatusStyle(req.status);
                            return (
                                <div key={req.id} className="request-card">
                                    <div style={{ flex: 1, paddingLeft: '15px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                                            <span style={{ background: statusStyle.bg, color: statusStyle.text, border: `1px solid ${statusStyle.border}`, padding: '6px 14px', borderRadius: '30px', fontSize: '12px', fontWeight: '800', letterSpacing: '0.5px' }}>{req.status.toUpperCase()}</span>
                                            <span style={{ fontSize: '14px', color: '#64748b', fontWeight: '500' }}>ID: {req.id}</span>
                                        </div>
                                        <div style={{ marginBottom: '20px' }}>
                                            <div style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', marginBottom: '4px' }}>{req.customer}</div>
                                            <div style={{ fontSize: '14px', color: '#64748b' }}>Submitted on {req.submittedOn}</div>
                                        </div>
                                        <button onClick={() => setSelectedRequest(req)} style={{ background: '#0d375b', color: 'white', border: 'none', padding: '10px 28px', borderRadius: '30px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 12px rgba(13, 55, 91, 0.25)' }}>View Request Details</button>
                                    </div>
                                    <div style={{ width: '120px', height: '120px', background: '#f8fafc', borderRadius: '15px', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #f1f5f9' }}>
                                        <img src={req.productImage} alt="Product" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
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
                    <div style={{ width: '100%', maxWidth: '1300px', height: '90vh', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ padding: '15px 0' }}>
                            <button onClick={() => setSelectedRequest(null)} style={{ background: 'transparent', border: 'none', fontSize: '16px', fontWeight: '600', color: '#334155', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>← Back</button>
                        </div>
                        <div style={{ background: '#dbeafe', flex: 1, borderRadius: '24px', padding: '50px', display: 'flex', gap: '50px', boxShadow: '0 20px 50px rgba(0,0,0,0.05)', position: 'relative' }}>
                            <div style={{ flex: 1.5, display: 'flex', flexDirection: 'column', height: '100%' }}>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '20px', marginBottom: '30px' }}>
                                    <h1 style={{ fontFamily: '"Instrument Serif", serif', fontSize: '56px', fontStyle: 'italic', color: '#0f172a', margin: 0 }}>{selectedRequest.customer}</h1>
                                    <span style={{ fontSize: '20px', color: '#64748b', fontWeight: '500', fontFamily: 'monospace' }}>{selectedRequest.id}</span>
                                </div>
                                <div style={{ background: 'rgba(255, 255, 255, 0.6)', backdropFilter: 'blur(15px)', border: '1px solid rgba(255, 255, 255, 0.9)', padding: '40px', borderRadius: '30px', display: 'flex', flexDirection: 'column', flex: 1, boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', marginBottom: '40px' }}>
                                        <div style={{ display: 'flex' }}><div className="detail-label">Preferred Changes</div><div className="detail-value">{selectedRequest.message}</div></div>
                                        <div style={{ display: 'flex' }}><div className="detail-label">Preferred Time</div><div className="detail-value">{selectedRequest.preferredTime}</div></div>
                                        {selectedRequest.referenceImage && (
                                            <div style={{ display: 'flex' }}><div className="detail-label">Reference Image</div><div style={{ flex: 1 }}><img src={selectedRequest.referenceImage} alt="Ref" style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '16px', border: '3px solid white', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }} /></div></div>
                                        )}
                                    </div>
                                    <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', width: '100%', paddingTop: '20px', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
                                            <button onClick={() => setIsAccepted(true)} style={{ padding: '14px 60px', borderRadius: '40px', background: isAccepted ? '#16a34a' : '#0f172a', color: 'white', border: 'none', fontSize: '16px', fontWeight: '700', cursor: isAccepted ? 'default' : 'pointer' }}>{isAccepted ? 'Accepted ✓' : 'Accept'}</button>
                                            <button onClick={() => { setIsAccepted(false); setRejectPopup(true); }} style={{ padding: '14px 60px', borderRadius: '40px', background: '#b91c1c', color: 'white', border: 'none', fontSize: '16px', fontWeight: '700', cursor: 'pointer' }}>Reject</button>
                                        </div>
                                        <button onClick={handleSendOffer} disabled={!isAccepted} style={{ padding: '15px 80px', borderRadius: '40px', background: isAccepted ? 'white' : 'rgba(255,255,255,0.5)', color: isAccepted ? '#0f172a' : '#94a3b8', border: '2px solid #0f172a', fontSize: '16px', fontWeight: '800' }}>Send Offer ➜</button>
                                    </div>
                                </div>
                            </div>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
                                <div style={{ height: '70px', marginBottom: '30px' }}></div>
                                <div style={{ background: 'white', borderRadius: '30px', padding: '20px', boxShadow: '0 20px 60px rgba(0,0,0,0.08)', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <img src={selectedRequest.productImage} alt="Product" style={{ width: '100%', maxWidth: '450px', objectFit: 'contain' }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* REJECTION POPUP */}
                    {rejectPopup && (
                        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 4000 }}>
                            <div style={{ background: 'white', width: '500px', padding: '40px', borderRadius: '24px' }}>
                                <h3 style={{ fontSize: '24px', fontWeight: '800', color: '#b91c1c', marginBottom: '10px' }}>Reject Request?</h3>
                                <textarea placeholder="Reason for rejection..." value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} style={{ width: '100%', height: '100px', padding: '15px', borderRadius: '12px', border: '1px solid #cbd5e1', marginBottom: '25px' }} />
                                <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end' }}>
                                    <button onClick={() => setRejectPopup(false)} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white' }}>Cancel</button>
                                    <button onClick={() => { alert('Request Rejected'); setRejectPopup(false); setSelectedRequest(null); }} style={{ padding: '10px 25px', borderRadius: '8px', background: '#b91c1c', color: 'white' }}>Confirm Reject</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SEND OFFER FORM */}
                    {showOfferForm && (
                        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5000 }}>
                            <div style={{ background: 'white', width: '550px', padding: '50px', borderRadius: '16px', position: 'relative' }}>
                                <button onClick={() => setShowOfferForm(false)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', fontSize: '24px' }}>&times;</button>
                                <h3 style={{ fontSize: '26px', fontWeight: '700', textAlign: 'center', marginBottom: '40px' }}>Send Offer</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    <div><label style={{ display: 'block', fontWeight: '600' }}>Fee (LKR):</label><input type="text" style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }} /></div>
                                    <div><label style={{ display: 'block', fontWeight: '600' }}>Time (Days):</label><input type="text" style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }} /></div>
                                    <button onClick={() => { alert('Offer Sent!'); setShowOfferForm(false); setSelectedRequest(null); }} style={{ background: '#0d375b', color: 'white', padding: '12px', borderRadius: '30px', fontWeight: '700', marginTop: '20px' }}>Submit Offer</button>
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