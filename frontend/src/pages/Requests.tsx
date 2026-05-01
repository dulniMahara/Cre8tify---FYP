import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
    color?: string;
    frontDesign?: string;
    frontPrintArea?: any;
    canvasState?: { imageLayers: any[]; textLayers: any[] };
    extraNote?: string;
}

// --- INTERFACES FOR LAYERING ---
interface TextConfig {
    id: number;
    text: string;
    font: string;
    color: string;
    styleId?: string;
    type?: 'arc' | 'wave' | 'circle' | 'straight' | 'upward';
    zIndex: number;
    x: number;
    y: number;
    scale: number;
    rotation: number;
    letterSpacing?: number;
    curve?: number;
}

interface ImageLayer {
    id: number;
    src: string;
    zIndex: number;
    x: number;
    y: number;
    scale: number;
    rotation: number;
    flipX: boolean;
    flipY: boolean;
}

const CurvedText = ({ text, fontFamily, color, curve, letterSpacing, id, styleId }: {
    text: string,
    fontFamily: string,
    color: string,
    curve: number,
    letterSpacing: number,
    id: number,
    styleId?: string
}) => {
    const pathId = `path-req-${id}`;
    const isFullCircle = styleId === 'style-circle';
    const cx = 250;
    const cy = 250;
    const r = 160;

    let pathData = "";
    if (isFullCircle) {
        pathData = `
            M ${cx - r}, ${cy}
            a ${r},${r} 0 1,1 ${r * 2},0
            a ${r},${r} 0 1,1 -${r * 2},0
        `;
    } else {
        const intensity = curve * 2.5;
        pathData = `M 50,250 Q 250,${250 - intensity} 450,250`;
    }

    return (
        <svg
            viewBox="0 0 500 500"
            width="200"
            height="200"
            style={{ overflow: 'visible', display: 'block', pointerEvents: 'none' }}
        >
            <defs>
                <path id={pathId} d={pathData} fill="none" />
            </defs>
            <text
                fill={color}
                style={{
                    fontFamily: fontFamily,
                    fontSize: isFullCircle ? '32px' : '40px',
                    fontWeight: 'bold',
                    letterSpacing: `${letterSpacing}px`,
                }}
            >
                <textPath
                    xlinkHref={`#${pathId}`}
                    startOffset="50%"
                    textAnchor="middle"
                >
                    {text}
                </textPath>
            </text>
        </svg>
    );
};

const Requests = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRequest, setSelectedRequest] = useState<RequestItem | null>(null);

    // STATES FOR LOGIC FLOW
    const [isAccepted, setIsAccepted] = useState(false);
    const [rejectPopup, setRejectPopup] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [showOfferForm, setShowOfferForm] = useState(false);
    const [allRequests, setAllRequests] = useState<RequestItem[]>([]);

    const fetchRequests = async () => {
        try {
            const response = await fetch(`${API_URL}/api/requests`);
            const data = await response.json();
            
            // Map MongoDB _id to id for frontend compatibility
            const mappedData = data.map((req: any) => ({
                ...req,
                id: req._id,
            }));

            setAllRequests(mappedData);
        } catch (err) {
            console.error("Error fetching requests:", err);
            // Fallback to empty or mock if needed
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

    const handleSendOffer = () => {
        if (!isAccepted) return;
        setShowOfferForm(true);
    };

    const handleEditRequest = () => {
        if (!selectedRequest) return;

        // Pass essential data to DesignTool
        navigate('/design-tool', {
            state: {
                fulfillmentRequest: selectedRequest,
                selectedProduct: {
                    name: selectedRequest.productName,
                    image: selectedRequest.productImage,
                    mockup: selectedRequest.productImage,
                    basePrice: "0", // Not used during fulfillment editing
                    colors: [selectedRequest.color || "#ffffff"]
                },
                // If there's an existing design, we could theoretically load it as a layer
                // but for now we'll pass the base info.
                selectedTshirtColor: selectedRequest.color || "#ffffff"
            }
        });
    };

    return (
        <div className="dashboard-container">
            <Sidebar />

            <div className="main-content" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#f1f5f9' }}>
                <Header showCart={false} onSearch={setSearchQuery} userRole="designer" />

                <div className="content-wrapper animate-fade" style={{ padding: '0 40px 40px 40px', flex: 1, width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                        <div>
                            <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Manage Requests 📩</h1>
                            <p style={{ color: '#64748b', marginTop: '5px', fontSize: '15px' }}>You have {filteredRequests.length} active requests requiring your attention.</p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
                        {['All', 'Pending', 'Accepted', 'Completed', 'Rejected'].map(tab => (
                            <button
                                key={tab}
                                className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab)}
                                style={{
                                    padding: '8px 20px',
                                    borderRadius: '8px',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    background: activeTab === tab ? '#0f172a' : 'white',
                                    color: activeTab === tab ? 'white' : '#64748b',
                                    border: '1px solid #e2e8f0',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
                        {filteredRequests.map((req) => {
                            const statusStyle = getStatusStyle(req.status);
                            return (
                                <div key={req.id} style={{
                                    background: 'white',
                                    borderRadius: '16px',
                                    padding: '24px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    border: '1px solid #e2e8f0',
                                    boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
                                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                                    cursor: 'pointer'
                                }} onClick={() => setSelectedRequest(req)}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <span style={{
                                                background: statusStyle.bg,
                                                color: statusStyle.text,
                                                padding: '4px 12px',
                                                borderRadius: '20px',
                                                fontSize: '11px',
                                                fontWeight: '800'
                                            }}>{req.status.toUpperCase()}</span>
                                            <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600' }}>ID: {req.id}</span>
                                        </div>
                                        <div style={{
                                            width: '50px', height: '50px',
                                            background: '#f8fafc', borderRadius: '10px',
                                            padding: '3px', border: '1px solid #f1f5f9',
                                            position: 'relative', overflow: 'hidden'
                                        }}>
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
                                                <img src={req.productImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', mixBlendMode: 'multiply' }} />

                                                {req.frontDesign && (
                                                    <div style={{
                                                        position: 'absolute',
                                                        ...(req.frontPrintArea || { top: '50%', left: '50%', width: '35%', height: '35%' }),
                                                        transform: 'translate(-50%, -50%)',
                                                        zIndex: 5, pointerEvents: 'none',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'
                                                    }}>
                                                        {req.canvasState ? (
                                                            <div style={{ position: 'relative', width: '100%', height: '100%', isolation: 'isolate' }}>
                                                                {[
                                                                    ...(req.canvasState.imageLayers?.map((l: any) => ({ ...l, layerType: 'image' })) || []),
                                                                    ...(req.canvasState.textLayers?.map((t: any) => ({ ...t, layerType: 'text' })) || [])
                                                                ].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0)).map((layer: any) => (
                                                                    layer.layerType === 'image' ? (
                                                                        <img
                                                                            key={layer.id}
                                                                            src={layer.src}
                                                                            style={{
                                                                                position: 'absolute',
                                                                                zIndex: layer.zIndex,
                                                                                transform: `translate(${layer.x}px, ${layer.y}px) scale(${layer.scale}) rotate(${layer.rotation}deg) scaleX(${layer.flipX ? -1 : 1}) scaleY(${layer.flipY ? -1 : 1})`,
                                                                                mixBlendMode: (req.color?.toLowerCase() !== '#ffffff') ? 'multiply' : 'normal',
                                                                                opacity: 0.95,
                                                                                width: 'auto',
                                                                                height: 'auto'
                                                                            }}
                                                                        />
                                                                    ) : (
                                                                        <div
                                                                            key={layer.id}
                                                                            style={{
                                                                                position: 'absolute',
                                                                                zIndex: layer.zIndex,
                                                                                transform: `translate(${layer.x}px, ${layer.y}px) scale(${layer.scale}) rotate(${layer.rotation}deg)`,
                                                                                display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '100px'
                                                                            }}
                                                                        >
                                                                            {layer.styleId === 'default' && (
                                                                                <>
                                                                                    {(layer.curve !== 0 && layer.curve !== undefined) ? (
                                                                                        <CurvedText
                                                                                            id={layer.id}
                                                                                            text={layer.text}
                                                                                            fontFamily={layer.font}
                                                                                            color={layer.color}
                                                                                            curve={layer.curve ?? 0}
                                                                                            letterSpacing={layer.letterSpacing || 0}
                                                                                        />
                                                                                    ) : (
                                                                                        <div style={{
                                                                                            fontFamily: layer.font,
                                                                                            color: layer.color,
                                                                                            fontSize: '24px',
                                                                                            fontWeight: 'bold',
                                                                                            whiteSpace: 'nowrap',
                                                                                            letterSpacing: `${layer.letterSpacing || 0}px`,
                                                                                            textShadow: '0px 1px 3px rgba(0,0,0,0.3)'
                                                                                        }}>
                                                                                            {layer.text}
                                                                                        </div>
                                                                                    )}
                                                                                </>
                                                                            )}
                                                                            {layer.styleId === 'style-wave' && (
                                                                                <div style={{
                                                                                    fontFamily: layer.font, color: '#00d2ff', fontSize: '28px', fontWeight: '900',
                                                                                    textTransform: 'uppercase', textShadow: '2px 2px 0px #0d375b',
                                                                                    transform: 'skewX(-10deg)', fontStyle: 'italic',
                                                                                    letterSpacing: `${layer.letterSpacing || 0}px`
                                                                                }}>
                                                                                    {layer.text}
                                                                                </div>
                                                                            )}
                                                                            {layer.styleId === 'style-stack' && (
                                                                                <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '0.9', alignItems: 'center', letterSpacing: `${layer.letterSpacing || 0}px` }}>
                                                                                    {[1, 2, 3].map((i) => (
                                                                                        <span key={i} style={{ fontFamily: layer.font, color: i === 2 ? layer.color : 'transparent', WebkitTextStroke: i === 2 ? 'none' : `1px ${layer.color}`, fontSize: '18px', fontWeight: 'bold', textTransform: 'uppercase' }}>{layer.text}</span>
                                                                                    ))}
                                                                                </div>
                                                                            )}
                                                                            {layer.styleId === 'style-fish' && (
                                                                                <div style={{ fontFamily: layer.font, color: layer.color, fontSize: '26px', fontWeight: 'bold', transform: 'scaleY(1.4) scaleX(0.9)', letterSpacing: `${(layer.letterSpacing || 0) - 1}px` }}>
                                                                                    {layer.text}
                                                                                </div>
                                                                            )}
                                                                            {!['default', 'style-wave', 'style-stack', 'style-fish'].includes(layer.styleId || '') && (
                                                                                <CurvedText
                                                                                    id={layer.id} text={layer.text} styleId={layer.styleId} fontFamily={layer.font} color={layer.color}
                                                                                    curve={layer.styleId === 'style-circle' ? (layer.curve ?? 120) : (layer.curve ?? 0)}
                                                                                    letterSpacing={layer.letterSpacing || 0}
                                                                                />
                                                                            )}
                                                                        </div>
                                                                    )
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <img src={req.frontDesign} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="Design Overlay" />
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ marginBottom: '20px' }}>
                                        <div style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>{req.customer}</div>
                                        <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>Submitted on {req.submittedOn}</div>
                                        <div style={{ fontSize: '14px', color: '#334155', marginTop: '12px', display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.5' }}>
                                            {req.message}
                                        </div>
                                    </div>
                                    <div style={{ marginTop: 'auto', paddingTop: '15px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '12px', color: '#94a3b8' }}>Due in {req.preferredTime}</span>
                                        <button style={{
                                            background: '#0f172a',
                                            color: 'white',
                                            border: 'none',
                                            padding: '8px 16px',
                                            borderRadius: '8px',
                                            fontSize: '12px',
                                            fontWeight: '700',
                                            cursor: 'pointer'
                                        }}>View Request</button>
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
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    backgroundColor: 'rgba(15, 23, 42, 0.6)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 3000,
                    animation: 'fadeIn 0.3s ease-out'
                }}>
                    <div style={{
                        width: '95%', maxWidth: '1100px',
                        height: 'auto', maxHeight: '90vh',
                        background: 'white',
                        borderRadius: '24px',
                        overflow: 'hidden',
                        display: 'flex', flexDirection: 'column',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                    }}>
                        {/* Modal Header */}
                        <div style={{
                            padding: '15px 30px',
                            borderBottom: '1px solid #f1f5f9',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <button
                                    onClick={() => setSelectedRequest(null)}
                                    style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '6px 12px', borderRadius: '10px', cursor: 'pointer', color: '#64748b', fontSize: '12px' }}
                                >← Back</button>
                                <h2 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>Request Details</h2>
                            </div>
                            <div style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '600' }}>Request ID: {selectedRequest.id}</div>
                        </div>

                        <div style={{ display: 'flex', height: '100%', overflowY: 'auto' }}>
                            {/* Left Side: Info */}
                            <div style={{ flex: 1.2, padding: '25px 30px', borderRight: '1px solid #f1f5f9' }}>
                                <div style={{ marginBottom: '20px' }}>
                                    <div style={{ fontSize: '11px', color: '#38bdf8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '5px' }}>Customer</div>
                                    <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', margin: 0 }}>{selectedRequest.customer}</h1>
                                    <p style={{ color: '#64748b', fontSize: '12px', marginTop: '3px' }}>Submitted on {selectedRequest.submittedOn}</p>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    <DetailSection label="Target Product" value={selectedRequest.productName} />
                                    <DetailSection label="Preferred Timeline" value={selectedRequest.preferredTime} />
                                    <DetailSection label="Request Message" value={selectedRequest.message} />
                                    {selectedRequest.extraNote && <DetailSection label="Additional Comments" value={selectedRequest.extraNote} />}

                                    {selectedRequest.referenceImage && (
                                        <div>
                                            <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span>Reference Image</span>
                                                <a
                                                    href={selectedRequest.referenceImage}
                                                    download={`reference-${selectedRequest.id}.png`}
                                                    style={{ color: '#38bdf8', textDecoration: 'none', fontSize: '10px', fontWeight: '700' }}
                                                >Download ↓</a>
                                            </div>
                                            <div style={{ position: 'relative', width: '80px', height: '80px', cursor: 'pointer' }} onClick={() => window.open(selectedRequest.referenceImage, '_blank')}>
                                                <img src={selectedRequest.referenceImage} alt="Reference" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '10px', border: '1px solid #e2e8f0' }} title="Click to view full size" />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #f1f5f9' }}>
                                    <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                                        <button
                                            onClick={async () => {
                                                try {
                                                    const response = await fetch(`${API_URL}/api/requests/${selectedRequest.id}`, {
                                                        method: 'PUT',
                                                        headers: { 'Content-Type': 'application/json' },
                                                        body: JSON.stringify({ status: 'Accepted' })
                                                    });
                                                    if (response.ok) {
                                                        setIsAccepted(true);
                                                        fetchRequests(); // Refresh list
                                                    }
                                                } catch (err) {
                                                    console.error("Failed to accept request:", err);
                                                }
                                            }}
                                            style={{
                                                flex: 1, padding: '10px', borderRadius: '10px',
                                                background: isAccepted ? '#10b981' : '#0f172a',
                                                color: 'white', border: 'none', fontSize: '13px',
                                                fontWeight: '700', cursor: 'pointer'
                                            }}
                                        >{isAccepted ? 'Accepted ✓' : 'Accept Request'}</button>
                                        <button
                                            onClick={() => { setIsAccepted(false); setRejectPopup(true); }}
                                            style={{
                                                flex: 0.5, padding: '10px', borderRadius: '10px',
                                                background: '#fee2e2', color: '#b91c1c',
                                                border: 'none', fontSize: '13px', fontWeight: '700',
                                                cursor: 'pointer'
                                            }}
                                        >Reject</button>
                                    </div>
                                    <button
                                        onClick={handleSendOffer}
                                        disabled={!isAccepted}
                                        style={{
                                            width: '100%', padding: '12px', borderRadius: '10px',
                                            background: isAccepted ? 'white' : '#f1f5f9',
                                            color: isAccepted ? '#0f172a' : '#94a3b8',
                                            border: `2px solid ${isAccepted ? '#0f172a' : '#e2e8f0'}`,
                                            fontSize: '13px', fontWeight: '800',
                                            cursor: isAccepted ? 'pointer' : 'not-allowed'
                                        }}
                                    >Send Offer to Customer ➜</button>
                                </div>
                            </div>

                            {/* Right Side: Visual Preview */}
                            <div style={{ flex: 1, padding: '30px', background: '#f8fafc', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                <div
                                    onClick={handleEditRequest}
                                    title="Click to edit this design in Design Tool"
                                    style={{
                                        background: 'white', padding: '25px', borderRadius: '20px',
                                        boxShadow: '0 10px 30px rgba(0,0,0,0.05)', width: '100%',
                                        maxWidth: '350px', textAlign: 'center', position: 'relative',
                                        cursor: 'pointer', transition: 'transform 0.2s',
                                        border: '2px solid transparent'
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.02)')}
                                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                                >
                                    <div style={{ fontSize: '11px', fontWeight: '700', color: '#38bdf8', marginBottom: '15px', textTransform: 'uppercase' }}>Edit This Product →</div>

                                    <div style={{
                                        width: '100%', height: '250px', position: 'relative',
                                        backgroundColor: selectedRequest.color || '#ffffff',
                                        WebkitMaskImage: `url(${selectedRequest.productImage})`,
                                        maskImage: `url(${selectedRequest.productImage})`,
                                        WebkitMaskSize: 'contain', maskSize: 'contain',
                                        WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat',
                                        WebkitMaskPosition: 'center', maskPosition: 'center',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        <img src={selectedRequest.productImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', mixBlendMode: 'multiply' }} />

                                        {selectedRequest.frontDesign && (
                                            <div style={{
                                                position: 'absolute',
                                                ...(selectedRequest.frontPrintArea || { top: '50%', left: '50%', width: '35%', height: '35%' }),
                                                transform: 'translate(-50%, -50%)',
                                                zIndex: 10, pointerEvents: 'none',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'
                                            }}>
                                                {selectedRequest.canvasState ? (
                                                    <div style={{ position: 'relative', width: '100%', height: '100%', isolation: 'isolate' }}>
                                                        {[
                                                            ...(selectedRequest.canvasState.imageLayers?.map((l: any) => ({ ...l, layerType: 'image' })) || []),
                                                            ...(selectedRequest.canvasState.textLayers?.map((t: any) => ({ ...t, layerType: 'text' })) || [])
                                                        ].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0)).map((layer: any) => (
                                                            layer.layerType === 'image' ? (
                                                                    <img
                                                                        key={layer.id}
                                                                        src={layer.src}
                                                                        style={{
                                                                            position: 'absolute',
                                                                            zIndex: layer.zIndex,
                                                                            transform: `translate(${layer.x}px, ${layer.y}px) scale(${layer.scale}) rotate(${layer.rotation}deg) scaleX(${layer.flipX ? -1 : 1}) scaleY(${layer.flipY ? -1 : 1})`,
                                                                            mixBlendMode: (selectedRequest.color?.toLowerCase() !== '#ffffff') ? 'multiply' : 'normal',
                                                                            opacity: 0.95,
                                                                            width: 'auto',
                                                                            height: 'auto'
                                                                        }}
                                                                    />
                                                                ) : (
                                                                    <div
                                                                        key={layer.id}
                                                                        style={{
                                                                            position: 'absolute',
                                                                            zIndex: layer.zIndex,
                                                                            transform: `translate(${layer.x}px, ${layer.y}px) scale(${layer.scale}) rotate(${layer.rotation}deg)`,
                                                                            display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '100px'
                                                                        }}
                                                                    >
                                                                        {layer.styleId === 'default' && (
                                                                            <>
                                                                                {(layer.curve !== 0 && layer.curve !== undefined) ? (
                                                                                    <CurvedText
                                                                                        id={layer.id}
                                                                                        text={layer.text}
                                                                                        fontFamily={layer.font}
                                                                                        color={layer.color}
                                                                                        curve={layer.curve ?? 0}
                                                                                        letterSpacing={layer.letterSpacing || 0}
                                                                                    />
                                                                                ) : (
                                                                                    <div style={{
                                                                                        fontFamily: layer.font,
                                                                                        color: layer.color,
                                                                                        fontSize: '24px',
                                                                                        fontWeight: 'bold',
                                                                                        whiteSpace: 'nowrap',
                                                                                        letterSpacing: `${layer.letterSpacing || 0}px`,
                                                                                        textShadow: '0px 1px 3px rgba(0,0,0,0.3)'
                                                                                    }}>
                                                                                        {layer.text}
                                                                                    </div>
                                                                                )}
                                                                            </>
                                                                        )}
                                                                        {layer.styleId === 'style-wave' && (
                                                                            <div style={{
                                                                                fontFamily: layer.font, color: '#00d2ff', fontSize: '28px', fontWeight: '900',
                                                                                textTransform: 'uppercase', textShadow: '2px 2px 0px #0d375b',
                                                                                transform: 'skewX(-10deg)', fontStyle: 'italic',
                                                                                letterSpacing: `${layer.letterSpacing || 0}px`
                                                                            }}>
                                                                                {layer.text}
                                                                            </div>
                                                                        )}
                                                                        {layer.styleId === 'style-stack' && (
                                                                            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '0.9', alignItems: 'center', letterSpacing: `${layer.letterSpacing || 0}px` }}>
                                                                                {[1, 2, 3].map((i) => (
                                                                                    <span key={i} style={{ fontFamily: layer.font, color: i === 2 ? layer.color : 'transparent', WebkitTextStroke: i === 2 ? 'none' : `1px ${layer.color}`, fontSize: '18px', fontWeight: 'bold', textTransform: 'uppercase' }}>{layer.text}</span>
                                                                                ))}
                                                                            </div>
                                                                        )}
                                                                        {layer.styleId === 'style-fish' && (
                                                                            <div style={{ fontFamily: layer.font, color: layer.color, fontSize: '26px', fontWeight: 'bold', transform: 'scaleY(1.4) scaleX(0.9)', letterSpacing: `${(layer.letterSpacing || 0) - 1}px` }}>
                                                                                {layer.text}
                                                                            </div>
                                                                        )}
                                                                        {!['default', 'style-wave', 'style-stack', 'style-fish'].includes(layer.styleId || '') && (
                                                                            <CurvedText
                                                                                id={layer.id} text={layer.text} styleId={layer.styleId} fontFamily={layer.font} color={layer.color}
                                                                                curve={layer.styleId === 'style-circle' ? (layer.curve ?? 120) : (layer.curve ?? 0)}
                                                                                letterSpacing={layer.letterSpacing || 0}
                                                                            />
                                                                        )}
                                                                    </div>
                                                                )
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <img src={selectedRequest.frontDesign} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="Design Overlay" />
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ marginTop: '15px', fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>{selectedRequest.productName}</div>
                                </div>
                                <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '20px', textAlign: 'center', maxWidth: '250px' }}>
                                    Review the customer's request and reference image before accepting or making an offer.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* REJECTION POPUP */}
                    {rejectPopup && (
                        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 4000 }}>
                            <div style={{ background: 'white', width: '350px', padding: '30px', borderRadius: '20px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#b91c1c', marginBottom: '10px' }}>Reject Request?</h3>
                                <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '20px' }}>Please provide a reason for the customer.</p>
                                <textarea
                                    placeholder="e.g., I am currently overbooked..."
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    style={{ width: '100%', height: '100px', padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1', marginBottom: '20px', fontSize: '14px', outline: 'none' }}
                                />
                                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                    <button onClick={() => setRejectPopup(false)} style={{ padding: '10px 20px', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontWeight: '600' }}>Cancel</button>
                                    <button onClick={async () => { 
                                        try {
                                            const response = await fetch(`${API_URL}/api/requests/${selectedRequest.id}`, {
                                                method: 'PUT',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({ status: 'Rejected', rejectionReason })
                                            });
                                            if (response.ok) {
                                                alert('Request Rejected'); 
                                                setRejectPopup(false); 
                                                setSelectedRequest(null);
                                                fetchRequests();
                                            }
                                        } catch (err) {
                                            console.error("Failed to reject request:", err);
                                        }
                                    }} style={{ padding: '10px 20px', borderRadius: '10px', background: '#b91c1c', color: 'white', border: 'none', cursor: 'pointer', fontWeight: '700' }}>Confirm Reject</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SEND OFFER FORM */}
                    {showOfferForm && (
                        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(15, 23, 42, 0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5000 }}>
                            <div style={{ background: 'white', width: '400px', padding: '40px', borderRadius: '24px', position: 'relative', boxShadow: '0 25px 50px rgba(0,0,0,0.3)' }}>
                                <button onClick={() => setShowOfferForm(false)} style={{ position: 'absolute', top: '20px', right: '20px', background: '#f1f5f9', border: 'none', width: '30px', height: '30px', borderRadius: '50%', cursor: 'pointer', fontSize: '16px' }}>&times;</button>
                                <h3 style={{ fontSize: '22px', fontWeight: '900', textAlign: 'center', marginBottom: '30px', color: '#0f172a' }}>Send Professional Offer</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontWeight: '700', fontSize: '13px', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>Your Fee (LKR)</label>
                                        <input type="number" placeholder="2500" style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '16px', outline: 'none' }} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontWeight: '700', fontSize: '13px', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>Delivery Time (Days)</label>
                                        <input type="number" placeholder="2" style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '16px', outline: 'none' }} />
                                    </div>
                                    <button
                                        onClick={async () => { 
                                            try {
                                                const response = await fetch(`${API_URL}/api/requests/${selectedRequest.id}`, {
                                                    method: 'PUT',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({ status: 'Accepted', isOfferSent: true })
                                                });
                                                if (response.ok) {
                                                    alert('Offer Sent Successfully!'); 
                                                    setShowOfferForm(false); 
                                                    setSelectedRequest(null);
                                                    fetchRequests();
                                                }
                                            } catch (err) {
                                                console.error("Failed to send offer:", err);
                                            }
                                        }}
                                        style={{ background: '#0f172a', color: 'white', padding: '16px', borderRadius: '12px', fontWeight: '800', fontSize: '16px', marginTop: '10px', border: 'none', cursor: 'pointer' }}
                                    >Submit Offer</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                .animate-fade { animation: fadeIn 0.4s ease-out; }
                .tab-btn:hover { background: #f8fafc; }
                .tab-btn.active { background: #0f172a !important; color: white !important; border-color: #0f172a !important; }
            `}</style>
        </div>
    );
};

const DetailSection = ({ label, value }: { label: string, value: string }) => (
    <div>
        <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '3px' }}>{label}</div>
        <div style={{ fontSize: '14px', color: '#334155', lineHeight: '1.4', fontWeight: '500' }}>{value}</div>
    </div>
);

export default Requests;