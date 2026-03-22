import React, { useState, useEffect } from 'react';

const CustomerSettings = ({ activeTab }: { activeTab: string }) => {
    const [innerTab, setInnerTab] = useState("Personal");
    const [notifs, setNotifs] = useState({ orders: true, news: false, promo: true });

    // 🟢 1. STATE FOR PERSONAL DETAILS
    const [personalInfo, setPersonalInfo] = useState({
        name: "Dilara Perera",
        email: "dilara@cre8tify.lk",
        phone: "+94 77 123 4567"
    });

    // 🟢 2. STATE FOR STYLE TAGS
    const [selectedTags, setSelectedTags] = useState<string[]>(['Streetwear', 'Oversized']);

    // 🟢 3. LOAD DATA ON MOUNT
    useEffect(() => {
        const saved = localStorage.getItem('userInfo');
        if (saved) {
            const parsed = JSON.parse(saved);
            setPersonalInfo({
                name: parsed.name || "Dilara Perera",
                email: parsed.email || "dilara@cre8tify.lk",
                phone: parsed.contact || "+94 77 123 4567"
            });
            if (parsed.tags) setSelectedTags(parsed.tags);
        }
    }, []);

    // 🟢 4. SAVE FUNCTION
    const handleSavePersonal = () => {
        const existingData = JSON.parse(localStorage.getItem('userInfo') || '{}');
        
        const updatedData = {
            ...existingData,
            name: personalInfo.name,
            email: personalInfo.email,
            contact: personalInfo.phone, // mapping phone to your 'contact' key
            tags: selectedTags
        };

        localStorage.setItem('userInfo', JSON.stringify(updatedData));
        
        // Trigger global sync for Header/Dashboard
        window.dispatchEvent(new Event('storage'));
        
        alert("Personal details and style preferences saved!");
    };

    const toggleTag = (tag: string) => {
        setSelectedTags(prev => 
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        );
    };

    return (
        <div style={settingsWrapper}>
            {/* TOP NAVIGATION */}
            <div style={tabBar}>
                {["Personal", "Addresses", "Security", "Notifications"].map(t => (
                    <button 
                        key={t}
                        onClick={() => setInnerTab(t)}
                        style={{
                            ...tabBtn,
                            color: innerTab === t ? '#0d375b' : '#aaa',
                            borderBottom: innerTab === t ? '5px solid #0d375b' : '5px solid transparent'
                        }}
                    >
                        {t}
                    </button>
                ))}
            </div>

            <div style={settingsContent}>
                {innerTab === "Personal" && (
                    <div style={slideIn}>
                        <div style={largeCard}>
                            <h3 style={cardTitle}>Basic Details</h3>
                            <div style={inputRow}>
                                <div style={inputGroup}>
                                    <label style={label}>Full Name</label>
                                    <input 
                                        style={inputField} 
                                        value={personalInfo.name} 
                                        onChange={(e) => setPersonalInfo({...personalInfo, name: e.target.value})}
                                    />
                                </div>
                                <div style={inputGroup}>
                                    <label style={label}>Email Address</label>
                                    <input 
                                        style={inputField} 
                                        value={personalInfo.email} 
                                        onChange={(e) => setPersonalInfo({...personalInfo, email: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div style={{...inputGroup, width: '48.5%'}}>
                                <label style={label}>Phone Number</label>
                                <input 
                                    style={inputField} 
                                    value={personalInfo.phone} 
                                    onChange={(e) => setPersonalInfo({...personalInfo, phone: e.target.value})}
                                />
                            </div>
                        </div>

                        <div style={{...largeCard, marginTop: '40px'}}>
                            <h3 style={cardTitle}>Style Preference Studio</h3>
                            <p style={subHeading}>Select tags that match your vibe so we can curate your feed.</p>
                            <div style={tagCloud}>
                                {['Streetwear', 'Minimalist', 'Vintage', 'Anime', 'Cyberpunk', 'Graphic Art', 'Oversized', 'Typography'].map(tag => {
                                    const isSelected = selectedTags.includes(tag);
                                    return (
                                        <div 
                                            key={tag} 
                                            onClick={() => toggleTag(tag)}
                                            style={{
                                                ...tagStyle,
                                                background: isSelected ? '#0d375b' : 'transparent',
                                                color: isSelected ? '#fff' : '#0d375b',
                                                boxShadow: isSelected ? '0 10px 20px rgba(13, 55, 91, 0.2)' : 'none'
                                            }}
                                        >
                                            {tag} {isSelected && ' ✓'}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        {/* 🟢 Click handler added here */}
                        <button style={megaSaveBtn} onClick={handleSavePersonal}>
                            Save Personal Details
                        </button>
                    </div>
                )}

                {/* ... (Keep your Addresses, Security, and Notifications code as is) ... */}
            </div>
        </div>
    );
};

// --- STYLES (Keep your existing styles) ---
const settingsWrapper: React.CSSProperties = { width: '100%', paddingLeft: '20px' };
const slideIn: React.CSSProperties = { animation: 'fadeIn 0.5s ease' };
const tabBar: React.CSSProperties = { display: 'flex', gap: '60px', borderBottom: '2px solid #eee', marginBottom: '50px' };
const tabBtn: React.CSSProperties = { background: 'none', border: 'none', padding: '20px 5px', fontSize: '22px', fontWeight: 900, cursor: 'pointer' };
const settingsContent: React.CSSProperties = { width: '100%' };
const largeCard: React.CSSProperties = { background: '#fff', padding: '60px', borderRadius: '35px', boxShadow: '0 20px 60px rgba(0,0,0,0.03)', border: '1px solid #f0f0f0' };
const cardTitle: React.CSSProperties = { fontSize: '36px', fontWeight: 900, color: '#0d375b', marginBottom: '40px', marginTop: 0 };
const subHeading: React.CSSProperties = { fontSize: '18px', color: '#888', marginBottom: '30px', marginTop: '-20px' };
const inputRow: React.CSSProperties = { display: 'flex', gap: '40px', marginBottom: '40px' };
const inputGroup: React.CSSProperties = { flex: 1, display: 'flex', flexDirection: 'column', gap: '15px' };
const label: React.CSSProperties = { fontWeight: 900, color: '#333', fontSize: '18px' };
const inputField: React.CSSProperties = { padding: '22px', borderRadius: '18px', border: '2px solid #f4f4f4', background: '#fcfcfc', fontSize: '20px', outline: 'none' };
const megaSaveBtn: React.CSSProperties = { background: '#0d375b', color: '#fff', padding: '22px 70px', borderRadius: '15px', border: 'none', fontWeight: 900, fontSize: '22px', cursor: 'pointer', marginTop: '20px', boxShadow: '0 10px 30px rgba(13, 55, 91, 0.3)' };
const tagCloud: React.CSSProperties = { display: 'flex', gap: '15px', flexWrap: 'wrap' };
const tagStyle: React.CSSProperties = { padding: '12px 25px', borderRadius: '50px', border: '2px solid #0d375b', fontWeight: 800, cursor: 'pointer', fontSize: '16px', transition: '0.3s ease' };

export default CustomerSettings;