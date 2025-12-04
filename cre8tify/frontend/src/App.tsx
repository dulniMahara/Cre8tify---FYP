import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './layout/Header';
import Footer from './layout/Footer';
import Home from './pages/Home';

function App() {
  return (
    // Router component wraps the entire application for navigation
    <Router> 
      <div className="App" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Header />
        
        {/* Main Content Area: Routes */}
        <Routes>
          {/* Public Home Page */}
          <Route path='/' element={<Home />} />
          
          {/* Placeholder Routes (Will be built next) */}
          <Route path='/login' element={<h1>Login Page</h1>} />
          <Route path='/designer/dashboard' element={<h1>Designer Dashboard</h1>} />

          {/* Fallback Route for 404 Not Found */}
          <Route path='*' element={<h1>404 Not Found</h1>} />
        </Routes>

        <Footer />
      </div>
    </Router>
  );
}

export default App;