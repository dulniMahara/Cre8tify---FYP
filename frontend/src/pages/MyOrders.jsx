import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import Sidebar from '../components/Sidebar'; 
import Footer from '../components/Footer'; 
import Header from '../components/Header'; 
import '../styles/dashboard.css'; 

const MyOrders = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    // 🟢 DYNAMIC NAVIGATION LOGIC
    const handleTrackButtonClick = (order) => {
        if (order.status === 'Processing') {
            // Goes to the ongoing tracking page (image_a51e6b.png style)
            navigate(`/track-order/${order._id}`);
        } else {
            // 🚀 GOES TO THE NEW COMPLETED HISTORY PAGE
            navigate(`/order-history-detail/${order._id}`);
        }
    };

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const userInfoRaw = localStorage.getItem('userInfo');
                const userInfo = userInfoRaw ? JSON.parse(userInfoRaw) : null;
                const config = {
                    headers: { Authorization: userInfo?.token ? `Bearer ${userInfo.token}` : '' },
                };

                const { data } = await axios.get('http://localhost:5000/api/orders/myorders', config);
                
                let orderList = [];
                if (data && data.length > 0) {
                    orderList = data;
                } else {
                    // 🔵 FALLBACK DATA: Teen Spirit Girl at the top
                    orderList = [
                        { _id: 'CR8-1003', createdAt: '2026-03-22', status: 'Processing', totalPrice: 2800, orderItems: [{ name: 'Teen Spirit Girl', image: '/img/girlteen2.png' }] },
                        { _id: 'CR8-1001', createdAt: '2026-03-10', status: 'Delivered', totalPrice: 2500, orderItems: [{ name: 'Kid Classic Tee', image: '/img/boykid6.png' }] },
                        { _id: 'CR8-1002', createdAt: '2026-03-15', status: 'Delivered', totalPrice: 3200, orderItems: [{ name: 'Urban Boy Tee', image: '/img/boykid3.png' }] },
                    ];
                }

                // 🟢 PRIORITY LOGIC: Processing (Index 0) always at the top, Delivered below
                const sortedOrders = orderList.sort((a, b) => {
                    if (a.status === 'Processing') return -1;
                    if (b.status === 'Processing') return 1;
                    return 0;
                });

                setOrders(sortedOrders);
            } catch (error) {
                console.error("Fetch error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    if (loading) return <div className="loading">Loading...</div>;

    return (
        <div style={{ display: 'flex', height: '100vh', width: '100%', backgroundColor: '#f4f7f9', overflow: 'hidden' }}>
            
            {/* 1. SIDEBAR */}
            <Sidebar variant="customer" />

            {/* 2. MAIN SCROLLABLE AREA */}
            <div style={{ 
                flex: 1, 
                marginLeft: '280px', 
                display: 'flex', 
                flexDirection: 'column',
                height: '100vh',
                overflowY: 'auto', // 🚀 SCROLL ENABLED
                position: 'relative'
            }}>
                
                {/* 🟢 HEADER: Using a wrapper to nudge the internal 'Back' button */}
                <div className="header-nudge-wrapper">
                    <Header mode="title" title="MY ORDERS" />
                </div>

                {/* 📦 TABLE SECTION - Lowered for spacing */}
                <main style={{ padding: '240px 40px 100px 40px', flex: 1 }}>
                    
                    <div style={styles.tableCard}>
                        <table style={styles.orderTable}>
                            <thead style={styles.thead}>
                                <tr>
                                    <th style={styles.th}>Item Details</th>
                                    <th style={styles.th}>Order Date</th>
                                    <th style={styles.th}>Delivery Date</th>
                                    <th style={styles.th}>Status</th>
                                    <th style={styles.th}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((order) => (
                                    <tr key={order._id} style={styles.tr}>
                                        <td style={styles.td}>
                                            <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
                                                <img src={order.orderItems[0].image} style={styles.shirtImg} alt="shirt" />
                                                <div>
                                                    <div style={styles.itemName}>{order.orderItems[0].name}</div>
                                                    <div style={styles.itemPrice}>LKR {order.totalPrice}.00</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={styles.tdCenter}>{new Date(order.createdAt).toLocaleDateString()}</td>
                                        <td style={styles.tdCenter}>Dec 17, 2025</td>
                                        <td style={styles.tdCenter}>
                                            <span style={order.status === 'Processing' ? styles.statusProcessing : styles.statusDelivered}>
                                                ● {order.status}
                                            </span>
                                        </td>
                                        <td style={styles.tdCenter}>
                                            <button 
                                                style={styles.trackBtn} 
                                                onClick={() => handleTrackButtonClick(order)}
                                            >
                                                Track Order
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </main>

                <Footer />
            </div>

            {/* CSS to nudge ONLY the Back option and keep UI clean */}
            <style>{`
                .header-nudge-wrapper header > div:first-child {
                    margin-left: 55px !important;
                }
                /* Smooth scrolling */
                div {
                    scrollbar-width: thin;
                    scrollbar-color: #0d375b #f4f7f9;
                }
            `}</style>
        </div>
    );
};

const styles = {
    tableCard: { 
        backgroundColor: '#fff', 
        borderRadius: '25px', 
        boxShadow: '0 15px 45px rgba(0,0,0,0.1)', 
        overflow: 'hidden',
        margin: '0 auto', 
        maxWidth: '1500px' 
    },
    orderTable: { width: '100%', borderCollapse: 'collapse' },
    thead: { backgroundColor: '#0d375b', color: '#fff' },
    th: { padding: '30px', textAlign: 'center', fontSize: '22px', fontWeight: '900' },
    tr: { borderBottom: '2px solid #f0f0f0' },
    td: { padding: '35px 30px', verticalAlign: 'middle', fontSize: '20px', textAlign: 'left' },
    tdCenter: { padding: '35px 30px', verticalAlign: 'middle', fontSize: '20px', textAlign: 'center' },
    shirtImg: { width: '120px', height: '120px', borderRadius: '15px', objectFit: 'cover' },
    itemName: { fontWeight: '900', fontSize: '24px', color: '#0d375b', marginBottom: '8px' },
    itemPrice: { color: '#666', fontSize: '18px', fontWeight: '700' },
    trackBtn: { 
        backgroundColor: '#0d375b', 
        color: '#fff', 
        border: 'none', 
        padding: '18px 40px', 
        borderRadius: '45px', 
        cursor: 'pointer', 
        fontWeight: '900', 
        fontSize: '18px' 
    },
    statusDelivered: { color: '#27ae60', fontWeight: '900' },
    statusProcessing: { color: '#f39c12', fontWeight: '900' }
};

export default MyOrders;