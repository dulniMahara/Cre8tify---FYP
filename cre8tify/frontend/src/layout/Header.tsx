const Header = () => {
  return (
    <header style={{ padding: '10px 20px', borderBottom: '1px solid #ccc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ fontWeight: 'bold', fontSize: '24px', color: '#333' }}>Cre8tify</div>
      <nav>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', gap: '20px' }}>
          <li><a href="/" style={{ textDecoration: 'none', color: '#555' }}>Home</a></li>
          <li><a href="/login" style={{ textDecoration: 'none', color: '#555' }}>Login</a></li>
          <li><a href="/designer/dashboard" style={{ textDecoration: 'none', color: '#555' }}>Designer Panel</a></li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;