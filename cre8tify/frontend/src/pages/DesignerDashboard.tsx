import React from 'react';
import { Outlet, Link } from 'react-router-dom';

const DesignerDashboard = () => {
  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '20px auto' }}>
      <h2>🎨 Designer Panel</h2>
      <p>Welcome to your creative workspace. Manage your existing designs or create a new one.</p>

      {/* Navigation for sub-pages */}
      <nav style={{ marginBottom: '20px', borderBottom: '1px solid #ddd', paddingBottom: '10px' }}>
        <Link to="/designer/dashboard" style={{ marginRight: '20px', textDecoration: 'none', fontWeight: 'bold', color: '#333' }}>My Designs</Link>
        <Link to="/designer/dashboard/new" style={{ textDecoration: 'none', fontWeight: 'bold', color: '#333' }}>Create New Design</Link>
      </nav>

      {/* Outlet renders the nested route component (MyDesigns or NewDesign) */}
      <Outlet /> 
    </div>
  );
};

export default DesignerDashboard;