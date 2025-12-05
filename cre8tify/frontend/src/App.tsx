import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './layout/Header';
import Footer from './layout/Footer';
import Home from './pages/Home';
import Login from './pages/Login'; 
import Register from './pages/Register'; // NEW IMPORT

function App() {
  return (
    <Router> 
      <div className="App" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Header />

        {/* Main Content Area: Routes */}
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/login' element={<Login />} />

          {/* Working Register Component */}
          <Route path='/register' element={<Register />} /> {/* Updated to use Register component */}

          {/* Placeholder Route */}
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