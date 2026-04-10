import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Added useNavigate
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import '../styles/dashboard.css'; 

const API_URL = "http://localhost:5000";

// Mock Data Interfaces
interface Order {
    id: string;
    item: string;
    date: string;
    earned: string;
    status: 'Completed' | 'Pending' | 'Cancelled';
    img: string;
}

const MySales = () => {
    const navigate = useNavigate();
    const [orderFilter, setOrderFilter] = useState('Today');
    const [chartFilter, setChartFilter] = useState('Last 7 Days');
    const [searchQuery, setSearchQuery] = useState(''); 

    // 🟢 DYNAMIC USER STATE
    const [navProfileImg, setNavProfileImg] = useState("/img/profile-picture.png");

    // 🟢 LOAD USER DATA ON MOUNT
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

    const orders: Order[] = [
        { id: '#12245', item: 'Neon Waves T-shirt', date: '2 Oct 2025', earned: 'LKR 1300', status: 'Completed', img: '/img/shop4.png' },
        { id: '#12246', item: 'Neon Waves T-shirt', date: '2 Sep 2025', earned: 'LKR 1100', status: 'Completed', img: '/img/shop4.png' },
        { id: '#12247', item: 'Neon Waves T-shirt', date: '2 Oct 2025', earned: 'LKR 1100', status: 'Pending', img: '/img/shop4.png' },
    ];

    return (
        <div className="dashboard-container">
            <Sidebar />
            
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap');
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

                {`
                    .animate-fade { animation: fadeIn 0.5s ease-out; }
                    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                    
                    .glass-search-bar {
                        display: flex;
                        align-items: center;
                        background: rgba(255, 255, 255, 0.15);
                        border: 1px solid rgba(255, 255, 255, 0.3);
                        border-radius: 50px;
                        padding: 15px 20px;
                        width: 100%;
                        max-width: 450px;
                        backdrop-filter: blur(8px);
                        transition: all 0.3s ease;
                    }
                    .search-input::placeholder {
                        color: rgba(255, 255, 255, 0.8) !important;
                    }

                    .sales-table { width: 100%; border-collapse: separate; border-spacing: 0; margin-top: 25px; }
                    .sales-table th { 
                        background: #0f172a; color: white; padding: 22px; text-align: left; 
                        font-size: 16px; font-family: 'Inter', sans-serif; letter-spacing: 0.5px; text-transform: uppercase;
                    }
                    .sales-table th:first-child { border-top-left-radius: 16px; }
                    .sales-table th:last-child { border-top-right-radius: 16px; }
                    
                    .sales-table td { 
                        padding: 25px 22px;
                        border-bottom: 1px solid #f1f5f9; 
                        color: #334155; 
                        font-size: 16px;
                        font-weight: 600; 
                        font-family: 'Inter', sans-serif; 
                        background: white;
                    }

                    .filter-btn { padding: 10px 24px; border: 1px solid #e2e8f0; background: white; color: #64748b; cursor: pointer; font-weight: 600; font-size: 14px; transition: 0.2s; }
                    .filter-btn.active { background: #0d375b; color: white; border-color: #0d375b; }

                    .donut-chart {
                        position: relative;
                        width: 200px; height: 200px;
                        border-radius: 50%;
                        display: flex; justify-content: center; alignItems: center;
                        box-shadow: 0 10px 25px rgba(0,0,0,0.2);
                    }
                    .donut-inner {
                        width: 160px; height: 160px;
                        background: #0d375b;
                        border-radius: 50%;
                        display: flex; justify-content: center; alignItems: center;
                        flex-direction: column;
                        z-index: 2;
                    }
                `}
            </style>

            <div className="main-content" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#f8fafc' }}>
                
                {/* HEADER */}
                <div className="top-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 40px', height: '90px', background: '#0d375b' }}>
                    <div style={{ fontFamily: '"Instrument Serif", serif', fontSize: '48px', color: 'white', letterSpacing: '1px', fontStyle: 'italic', flex: 1 }}>
                        My Sales
                    </div>
                    <div className="search-bar" style={{ 
                        flex: 2, maxWidth: '500px', display: 'flex', alignItems: 'center', 
                        background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(5px)',
                        padding: '10px 20px', borderRadius: '30px', margin: '0 20px', border: '1px solid rgba(255,255,255,0.2)'
                    }}>
                        <img src="/img/search.png" alt="Search" style={{ width: '20px', opacity: 0.8, filter: 'brightness(0) invert(1)' }} />
                        <input 
                            className="search-input"
                            type="text" placeholder="Search here" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} 
                            style={{ background: 'transparent', border: 'none', outline: 'none', color: 'white', marginLeft: '10px', width: '100%', fontSize: '16px' }} 
                        />
                    </div>
                    <div className="header-icons" style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', gap: '25px', alignItems: 'center' }}>
                        {/* 🟢 UPDATED PROFILE ICON */}
                        <img 
                            src={navProfileImg} 
                            className="nav-icon" 
                            alt="Profile" 
                            style={{ width: '45px', height: '45px', borderRadius: '50%', objectFit: 'cover', cursor: 'pointer', border: '2px solid rgba(255,255,255,0.2)' }}
                            onClick={() => navigate('/profile')}
                            onError={(e) => { (e.target as HTMLImageElement).src = "/img/profile-picture.png"; }}
                        />
                        <img src="/img/notifi.png" className="nav-icon" alt="Notif" style={{ width: '40px', height: '40px' }} />
                        <img 
                            src="/img/logout.png" 
                            className="nav-icon" 
                            alt="Logout" 
                            style={{ width: '40px', height: '40px', cursor: 'pointer' }} 
                            onClick={handleLogout}
                        />
                    </div>
                </div>

                <div className="content-wrapper animate-fade" style={{ padding: '40px', flex: 1, maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
                    
                    <h2 style={{ 
                        fontFamily: "'Inter', sans-serif", 
                        fontSize: '28px', 
                        fontWeight: '700', 
                        marginBottom: '35px', 
                        color: '#1e293b',
                        display: 'flex', alignItems: 'center', gap: '10px'
                    }}>
                        Track your income and orders 📈
                    </h2>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '25px', marginBottom: '50px' }}>
                        <StatCard title="TOTAL EARNING" value="LKR 9,500.00" gradient="linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)" icon="💰" />
                        <StatCard title="TOTAL ORDERS" value="8 ORDERS" gradient="linear-gradient(135deg, #10b981 0%, #059669 100%)" icon="📦" />
                        <StatCard title="PENDING" value="2 PENDING" gradient="linear-gradient(135deg, #f59e0b 0%, #d97706 100%)" icon="⏳" />
                        <StatCard title="THIS MONTH" value="LKR 3,780.00" gradient="linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)" icon="📅" />
                    </div>

                    <div style={{ marginBottom: '60px' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '25px' }}>
                            {['All', 'Today', 'Last 7 Days', 'Last 30 Days', 'This Year'].map(f => (
                                <button key={f} className={`filter-btn ${orderFilter === f ? 'active' : ''}`} onClick={() => setOrderFilter(f)}>{f}</button>
                            ))}
                        </div>
                        
                        <div style={{ textAlign: 'center', fontSize: '15px', fontStyle: 'italic', color: '#64748b', marginBottom: '15px' }}>
                            Viewing: <b>{orderFilter}</b>
                        </div>

                        <div style={{ borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                            <table className="sales-table">
                                <thead>
                                    <tr>
                                        <th>Product Name</th>
                                        <th>Date</th>
                                        <th>Earned</th>
                                        <th>Status</th>
                                        <th>Preview</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((order, i) => (
                                        <tr key={i}>
                                            <td style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                                <span style={{ fontWeight: '700', fontSize: '18px', color: '#0f172a' }}>{order.item}</span>
                                                <span style={{ fontSize: '14px', color: '#64748b', fontFamily:'monospace' }}>{order.id}</span>
                                            </td>
                                            <td style={{ fontSize: '16px' }}>{order.date}</td>
                                            <td style={{ fontWeight: '700', fontSize: '18px', color: '#0f172a' }}>{order.earned}</td>
                                            <td>
                                                <span style={{ padding: '8px 16px', borderRadius: '30px', fontSize: '13px', fontWeight: '700', background: order.status === 'Completed' ? '#dcfce7' : '#fff7ed', color: order.status === 'Completed' ? '#166534' : '#c2410c', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>{order.status}</span>
                                            </td>
                                            <td>
                                                <img src={order.img} alt="Product" style={{ width: '70px', height: '70px', objectFit: 'contain', background: '#f8fafc', borderRadius: '12px', padding: '5px', border: '1px solid #e2e8f0' }} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '25px' }}>
                            {['Today', 'Last 7 Days', 'Last Week', 'Last Month', 'Last Year'].map(f => (
                                <button key={f} className={`filter-btn ${chartFilter === f ? 'active' : ''}`} onClick={() => setChartFilter(f)}>{f}</button>
                            ))}
                        </div>

                        <div style={{ background: '#0d375b', borderRadius: '24px', padding: '60px', color: 'white', textAlign: 'center', boxShadow: '0 20px 50px rgba(13, 55, 91, 0.25)', position: 'relative', overflow: 'hidden' }}>
                            <div style={{ position: 'absolute', top: '-50%', left: '-20%', width: '500px', height: '500px', background: '#1e40af', filter: 'blur(100px)', opacity: 0.5, borderRadius: '50%' }}></div>
                            <div style={{ position: 'relative', zIndex: 2 }}>
                                <h3 style={{ fontSize: '24px', fontWeight: '700', fontStyle: 'italic', marginBottom: '10px' }}>Earning Breakdown</h3>
                                <p style={{ fontSize: '16px', opacity: 0.7, marginBottom: '50px' }}>Period: {chartFilter}</p>
                                <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '60px' }}>
                                    <DonutChart percent={75} value="LKR 6,400" label="Design Revenue" />
                                    <DonutChart percent={25} value="LKR 2,000" label="Customization" />
                                    <DonutChart percent={100} value="LKR 8,400" label="Total Net Earnings" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        </div>
    );
};

// ... (Keep StatCard and DonutChart sub-components exactly as they were)
const StatCard = ({ title, value, gradient, icon }: { title: string, value: string, gradient: string, icon: string }) => (
    <div style={{ 
        background: gradient, padding: '25px', borderRadius: '16px', textAlign: 'center',
        boxShadow: '0 10px 20px rgba(0,0,0,0.1)', color: 'white',
        position: 'relative', overflow: 'hidden', transition: 'transform 0.2s'
    }}
    onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
    onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
    >
        <div style={{ fontSize: '30px', marginBottom: '10px', opacity: 0.8 }}>{icon}</div>
        <div style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', opacity: 0.9, letterSpacing: '1px' }}>{title}</div>
        <div style={{ fontSize: '24px', fontWeight: '800', marginTop: '5px', textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>{value}</div>
    </div>
);

const DonutChart = ({ percent, value, label }: { percent: number, value: string, label: string }) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div className="donut-chart" style={{ background: `conic-gradient(#38bdf8 ${percent}%, rgba(255,255,255,0.1) 0)` }}>
            <div className="donut-inner">
                <div style={{ fontSize: '23px', fontWeight: '800', color: 'white', fontStyle: 'italic' }}>{value}</div>
                <div style={{ fontSize: '16px', color: '#9fadbfff', marginTop: '5px' }}>{percent}%</div>
            </div>
        </div>
        <div style={{ marginTop: '25px', background: 'rgba(255,255,255,0.1)', padding: '10px 25px', borderRadius: '30px', fontSize: '14px', fontWeight: '600', fontStyle: 'italic', letterSpacing: '0.5px', border: '1px solid rgba(255,255,255,0.2)' }}>{label}</div>
    </div>
);

export default MySales;