import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';

// 🟢 Helper Function: Simplified to return only strings
const formatTrackDate = (date: Date, daysToAdd: number = 0, mode: 'FULL' | 'DATE_ONLY' = 'FULL') => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + daysToAdd);
    
    const dateOptions: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' };
    const datePart = newDate.toLocaleDateString('en-GB', dateOptions);

    if (mode === 'DATE_ONLY') {
        return datePart;
    }

    // Default time for simulation, except for the "Order Placed" step
    const timeOptions: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', hour12: true };
    const timePart = daysToAdd === 0 
        ? newDate.toLocaleTimeString('en-US', timeOptions) 
        : (daysToAdd === 1 ? "09:15 AM" : "02:00 PM");

    return `${datePart} - ${timePart}`;
};

const TrackOrder = () => {
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // 🟢 Extract data from navigation state
    const rawState = (location.state as any) || {};
    let { 
        address = "Address not found", 
        customerName = "Guest User",
        orderId = "CR8-XXXXX",
        createdAt = new Date().toISOString(),
        status = "Processing", 
        fromMyOrders = false 
    } = rawState;

    // 🟢 Shorten ID if it's a long MongoDB ID
    if (orderId && orderId.length > 15) {
        orderId = orderId.substring(orderId.length - 8).toUpperCase();
    }

    const baseDate = new Date(createdAt);
    const warehouseLocation = "Colombo Hub, Sri Lanka";
    const publicDirectionsUrl = `https://maps.google.com/maps?saddr=${encodeURIComponent(warehouseLocation)}&daddr=${encodeURIComponent(address + ", Sri Lanka")}&output=embed&t=m`;

    const deliveryStart = formatTrackDate(baseDate, 5, 'DATE_ONLY');
    const deliveryEnd = formatTrackDate(baseDate, 7, 'DATE_ONLY');

    // 🟢 Logic to determine how many ticks to show
    const isOldOrder = (new Date().getTime() - baseDate.getTime()) > (24 * 60 * 60 * 1000); // Older than 24h
    const isDelivered = status === 'Delivered';

    const steps = [
        { 
            title: "Order Placed", 
            date: formatTrackDate(baseDate, 0), 
            status: "complete", 
            desc: "We've received your order." 
        },
        { 
            title: "Processing", 
            date: formatTrackDate(baseDate, 1), 
            status: isDelivered || isOldOrder ? "complete" : "pending", 
            desc: "Item packed at Colombo Hub." 
        },
        { 
            title: "Dispatched", 
            date: formatTrackDate(baseDate, 2), 
            status: isDelivered ? "complete" : (isOldOrder ? "active" : "pending"), 
            desc: "Handled by Cre8tify Logistics." 
        },
        { 
            title: "Out for Delivery", 
            date: "Pending", 
            status: isDelivered ? "complete" : "pending", 
            desc: "Courier is on the way." 
        },
        { 
            title: "Delivered", 
            date: isDelivered ? formatTrackDate(baseDate, 6) : `Expected ${deliveryStart}`, 
            status: isDelivered ? "complete" : "pending", 
            desc: isDelivered ? "Enjoy your purchase!" : "Expected soon" 
        },
    ];

    return (
        <div style={pageWrapper}>
            <style>
                {`
                @keyframes pulse-blue {
                    0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(52, 152, 219, 0.7); }
                    70% { transform: scale(1.15); box-shadow: 0 0 0 8px rgba(52, 152, 219, 0); }
                    100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(52, 152, 219, 0); }
                }
                .header-nudge-wrapper header > div:first-child {
                    margin-left: 55px !important;
                }
                `}
            </style>

            <div className="header-nudge-wrapper">
                <Header mode="title" title="TRACK ORDER" />
            </div>

            <div style={contentContainer}>
                <div style={whiteContentBox}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h1 style={mainTitle}>Track Order #{orderId}</h1>
                        <div style={{
                            ...statusBadge,
                            background: status === 'Delivered' ? '#f0fdf4' : '#e3f2fd',
                            color: status === 'Delivered' ? '#166534' : '#0d47a1'
                        }}>
                            {status === 'Delivered' ? 'Delivered' : 'In Transit'}
                        </div>
                    </div>
                    
                    <div style={mainGrid}>
                        <div style={leftPanel}>
                            <div style={timelineContainer}>
                                {steps.map((step, index) => (
                                    <div key={index} style={stepRow}>
                                        <div style={indicatorColumn}>
                                            <div style={{
                                                ...dot, 
                                                background: step.status === 'complete' ? '#2ecc71' : step.status === 'active' ? '#0d375b' : '#ccc',
                                                border: step.status === 'active' ? '2px solid #3498db' : 'none',
                                                animation: step.status === 'active' ? 'pulse-blue 2s infinite' : 'none'
                                            }}>
                                                {step.status === 'complete' && "✔"}
                                            </div>
                                            {index !== steps.length - 1 && <div style={line} />}
                                        </div>
                                        <div style={textColumn}>
                                            <h4 style={stepTitle}>{step.title}</h4>
                                            <p style={stepDesc}>{step.desc}</p>
                                            <p style={stepDate}>{step.date}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={rightPanel}>
                            <div style={shippingCard}>
                                <h3 style={sectionHeading}>Delivery Details</h3>
                                <div style={addressBox}>
                                    <p style={{fontWeight: 800, margin: '0 0 5px 0', fontSize: '15px'}}>{customerName}</p>
                                    <p style={{margin: 0, color: '#555', lineHeight: '1.6', fontSize: '13px'}}>{address}</p>
                                </div>
                                <div style={courierSmallInfo}>
                                    <p><strong>Carrier:</strong> Cre8tify Express (Pvt) Ltd</p>
                                    <p><strong>Tracking ID:</strong> TRK-{orderId}</p>
                                    {/* 🚀 FIXED: Template literal for single child requirement */}
                                    <p><strong>Estimated:</strong> {`${deliveryStart} - ${deliveryEnd}`}</p>
                                </div>
                                <div style={mapContainer}>
                                    <iframe 
                                        width="100%" 
                                        height="350" 
                                        style={{ border: 0 }} 
                                        src={publicDirectionsUrl} 
                                        allowFullScreen 
                                        loading="lazy" 
                                        title="Tracking Map"
                                    />
                                </div>
                            </div>
                            <button 
                                style={helpBtn} 
                                onClick={() => navigate('/customer-dashboard')}
                            >
                                Back to Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <footer style={siteFooter}>
                <span>Cre8tify • Wear Your Imaginations</span>
                <div style={footerLinks}>
                    <span>Privacy Policy</span> | <span>Terms & Conditions</span> | <span>FAQ</span>
                </div>
                <span>© 2026 Cre8tify</span>
            </footer>
        </div>
    );
};

// --- STYLES ---
const pageWrapper: React.CSSProperties = { background: '#f4f7f9', minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'Inter, sans-serif' };
const headerCenterTitle: React.CSSProperties = { fontSize: '16px', fontWeight: 900, margin: 0 };
const contentContainer: React.CSSProperties = { width: '85%', margin: '30px auto', flex: 1 };
const whiteContentBox: React.CSSProperties = { background: '#fff', padding: '30px', borderRadius: '15px', boxShadow: '0 8px 20px rgba(0,0,0,0.04)' };
const mainTitle: React.CSSProperties = { fontSize: '24px', fontWeight: 900, color: '#0d375b', margin: 0 };
const statusBadge: React.CSSProperties = { background: '#e3f2fd', color: '#0d47a1', padding: '6px 16px', borderRadius: '25px', fontWeight: 800, fontSize: '12px' };
const mainGrid: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' };
const leftPanel: React.CSSProperties = { paddingRight: '10px' };
const timelineContainer: React.CSSProperties = { display: 'flex', flexDirection: 'column', padding: '10px 0' };
const stepRow: React.CSSProperties = { display: 'flex', gap: '20px', minHeight: '80px' };
const indicatorColumn: React.CSSProperties = { display: 'flex', flexDirection: 'column', alignItems: 'center' };
const dot: React.CSSProperties = { width: '28px', height: '28px', borderRadius: '50%', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800, zIndex: 2 };
const line: React.CSSProperties = { width: '3px', flex: 1, background: '#f0f0f0', margin: '3px 0' };
const textColumn: React.CSSProperties = { paddingTop: '2px' };
const stepTitle: React.CSSProperties = { margin: '0 0 5px 0', fontSize: '16px', fontWeight: 800, color: '#333' };
const stepDesc: React.CSSProperties = { margin: '0 0 5px 0', fontSize: '13px', color: '#666', fontWeight: 500 };
const stepDate: React.CSSProperties = { margin: 0, color: '#999', fontSize: '11px', fontWeight: 600 };
const rightPanel: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '15px' };
const shippingCard: React.CSSProperties = { border: '1px solid #eee', borderRadius: '15px', padding: '25px', background: '#fafafa' };
const sectionHeading: React.CSSProperties = { fontSize: '18px', fontWeight: 800, color: '#0d375b', marginBottom: '15px' };
const addressBox: React.CSSProperties = { marginBottom: '15px' };
const courierSmallInfo: React.CSSProperties = { background: '#fff', padding: '12px 15px', borderRadius: '10px', marginBottom: '15px', border: '1px solid #f0f0f0', fontSize: '13px' };
const mapContainer: React.CSSProperties = { borderRadius: '12px', overflow: 'hidden', border: '1px solid #ddd', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' };
const helpBtn: React.CSSProperties = { background: '#0d375b', color: '#fff', padding: '12px 28px', borderRadius: '25px', border: 'none', fontWeight: 800, fontSize: '13px', cursor: 'pointer', alignSelf: 'flex-end', marginTop: '15px', boxShadow: '0 4px 10px rgba(13, 55, 91, 0.2)' };
const siteFooter: React.CSSProperties = { background: '#0d375b', padding: '40px 8%', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '16px' };
const footerLinks: React.CSSProperties = { display: 'flex', gap: '18px', fontWeight: 500 };

export default TrackOrder;