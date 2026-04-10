import React from 'react';

const AdminSettings = ({ activeTab }: { activeTab: string }) => {
    return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
            <h2 style={{ color: '#0d375b', fontSize: '28px', fontWeight: 900 }}>Admin Command Center</h2>
            <p style={{ color: '#888', marginTop: '10px' }}>Current Tab: {activeTab}</p>
            <div style={{ marginTop: '50px', padding: '40px', border: '2px dashed #ccc', borderRadius: '20px' }}>
                <p>System monitoring and user verification modules will appear here.</p>
            </div>
        </div>
    );
};

export default AdminSettings;