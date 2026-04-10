import React from 'react';

const DesignerSettings = ({ activeTab }: { activeTab: string }) => {
    
    const stats = [
        { label: "Total Sales", value: "$4,250.00", growth: "+12%" },
        { label: "Active Designs", value: "24", growth: "+2" },
        { label: "Pending Payout", value: "$890.00", growth: "Ready" }
    ];

    const myDesigns = [
        { name: "Cyber Punk 2077 Tribute", sales: 45, status: "Active", img: "/img/design_a.png" },
        { name: "Minimalist Lotus", sales: 128, status: "Best Seller", img: "/img/design_b.png" },
        { name: "Retro Vibe 80s", sales: 12, status: "Draft", img: "/img/design_c.png" }
    ];

    return (
        <div style={container}>
            {activeTab === "Dashboard" && (
                <div style={slideIn}>
                    <h2 style={sectionTitle}>Revenue Overview</h2>
                    <div style={statsGrid}>
                        {stats.map(stat => (
                            <div key={stat.label} style={statCard}>
                                <p style={statLabel}>{stat.label}</p>
                                <h3 style={statValue}>{stat.value}</h3>
                                <span style={statGrowth}>{stat.growth}</span>
                            </div>
                        ))}
                    </div>

                    <h2 style={{...sectionTitle, marginTop: '50px'}}>Quick Actions</h2>
                    <div style={actionRow}>
                        <button style={primaryActionBtn}>+ Upload New Design</button>
                        <button style={secondaryActionBtn}>View Public Shop</button>
                    </div>
                </div>
            )}

            {activeTab === "My Designs" && (
                <div style={slideIn}>
                    <h2 style={sectionTitle}>Portfolio Management</h2>
                    <div style={designList}>
                        {myDesigns.map(design => (
                            <div key={design.name} style={designRow}>
                                <div style={designThumb} />
                                <div style={{flex: 1}}>
                                    <h4 style={designName}>{design.name}</h4>
                                    <p style={designMeta}>{design.sales} Units Sold</p>
                                </div>
                                <span style={{
                                    ...statusBadge,
                                    background: design.status === 'Best Seller' ? '#fff9c4' : '#f0f0f0',
                                    color: design.status === 'Best Seller' ? '#fbc02d' : '#666'
                                }}>
                                    {design.status}
                                </span>
                                <button style={editBtn}>Edit</button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === "Earnings" && (
                <div style={slideIn}>
                    <h2 style={sectionTitle}>Financial Summary</h2>
                    <div style={earningsCard}>
                        <div style={balanceBox}>
                            <p style={balanceLabel}>Available Balance</p>
                            <h1 style={balanceAmount}>$1,240.50</h1>
                        </div>
                        <div style={payoutInfo}>
                            <p style={payoutText}>Linked Bank: <strong>HNB Colombo - ****4421</strong></p>
                            <button style={payoutBtn}>Withdraw to Bank</button>
                        </div>
                    </div>
                    
                    <h3 style={{...sectionTitle, fontSize: '20px', marginTop: '40px'}}>Payout History</h3>
                    <div style={historyTable}>
                        <div style={tableHeader}>
                            <span>Date</span><span>Amount</span><span>Status</span>
                        </div>
                        <div style={tableRow}>
                            <span>Oct 12, 2025</span><span>$450.00</span><span style={{color: '#2ecc71'}}>Success</span>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === "Profile" && (
                <div style={slideIn}>
                    <h2 style={sectionTitle}>Designer Identity</h2>
                    <div style={designerForm}>
                        <div style={inputGroup}>
                            <label style={label}>Studio Name</label>
                            <input style={input} defaultValue="Cre8tive Mind Studio" />
                        </div>
                        <div style={inputGroup}>
                            <label style={label}>Bio / Creative Vision</label>
                            <textarea style={{...input, height: '120px', resize: 'none'}} defaultValue="Specializing in minimalist Sri Lankan typography and street art." />
                        </div>
                        <button style={saveBtn}>Update Designer Profile</button>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- STYLES ---
const container: React.CSSProperties = { padding: '10px' };
const slideIn: React.CSSProperties = { animation: 'fadeIn 0.5s ease-out' };
const sectionTitle: React.CSSProperties = { fontSize: '28px', fontWeight: 900, color: '#0d375b', marginBottom: '25px' };

const statsGrid: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '25px' };
const statCard: React.CSSProperties = { background: '#fff', padding: '30px', borderRadius: '25px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', border: '1px solid #f0f0f0', textAlign: 'center' };
const statLabel: React.CSSProperties = { color: '#888', fontWeight: 600, margin: '0 0 10px 0' };
const statValue: React.CSSProperties = { fontSize: '32px', fontWeight: 900, color: '#111', margin: 0 };
const statGrowth: React.CSSProperties = { display: 'inline-block', marginTop: '10px', color: '#2ecc71', fontWeight: 800, fontSize: '14px' };

const actionRow: React.CSSProperties = { display: 'flex', gap: '20px' };
const primaryActionBtn: React.CSSProperties = { background: '#0d375b', color: '#fff', padding: '18px 40px', borderRadius: '15px', border: 'none', fontWeight: 800, cursor: 'pointer', boxShadow: '0 8px 20px rgba(13, 55, 91, 0.2)' };
const secondaryActionBtn: React.CSSProperties = { background: '#fff', color: '#0d375b', padding: '18px 40px', borderRadius: '15px', border: '2px solid #0d375b', fontWeight: 800, cursor: 'pointer' };

const designList: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '15px' };
const designRow: React.CSSProperties = { display: 'flex', alignItems: 'center', background: '#fff', padding: '20px', borderRadius: '20px', border: '1px solid #f0f0f0' };
const designThumb: React.CSSProperties = { width: '60px', height: '60px', background: '#f8f9fa', borderRadius: '12px', marginRight: '20px' };
const designName: React.CSSProperties = { margin: 0, fontSize: '18px', fontWeight: 800 };
const designMeta: React.CSSProperties = { margin: 0, color: '#888', fontSize: '14px' };
const statusBadge: React.CSSProperties = { padding: '6px 15px', borderRadius: '50px', fontSize: '12px', fontWeight: 800, marginRight: '20px' };
const editBtn: React.CSSProperties = { padding: '8px 20px', borderRadius: '10px', background: 'transparent', border: '1px solid #ddd', fontWeight: 700, cursor: 'pointer' };

const earningsCard: React.CSSProperties = { background: 'linear-gradient(135deg, #0d375b, #1565c0)', padding: '50px', borderRadius: '30px', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
// 🟢 FIXED: Added missing styles
const balanceBox: React.CSSProperties = { display: 'flex', flexDirection: 'column' };
const payoutInfo: React.CSSProperties = { textAlign: 'right' };

const balanceLabel: React.CSSProperties = { opacity: 0.8, fontSize: '18px' };
const balanceAmount: React.CSSProperties = { fontSize: '48px', fontWeight: 900, margin: '10px 0 0 0' };
const payoutBtn: React.CSSProperties = { background: '#fff', color: '#0d375b', padding: '15px 30px', borderRadius: '12px', border: 'none', fontWeight: 800, cursor: 'pointer' };
const payoutText: React.CSSProperties = { margin: '0 0 15px 0', opacity: 0.9 };

const designerForm: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '25px' };
const inputGroup: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '10px' };
const label: React.CSSProperties = { fontWeight: 700, color: '#444' };
const input: React.CSSProperties = { padding: '15px', borderRadius: '12px', border: '2px solid #f0f0f0', fontSize: '16px' };
const saveBtn: React.CSSProperties = { background: '#0d375b', color: '#fff', padding: '18px', borderRadius: '12px', border: 'none', fontWeight: 800, cursor: 'pointer', marginTop: '20px' };

const historyTable: React.CSSProperties = { background: '#fff', borderRadius: '20px', border: '1px solid #f0f0f0', overflow: 'hidden' };
const tableHeader: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', padding: '20px', background: '#f8f9fa', fontWeight: 800, color: '#0d375b' };
const tableRow: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', padding: '20px', borderTop: '1px solid #f0f0f0' };

export default DesignerSettings;