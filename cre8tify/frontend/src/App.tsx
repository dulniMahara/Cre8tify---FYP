import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './layout/Header';
import Footer from './layout/Footer';

// Page Components
import Home from './pages/Home';
import Login from './pages/Login'; 
import Register from './pages/Register'; 
import DesignerDashboard from './pages/DesignerDashboard'; 

// Components
import PrivateRoute from './components/PrivateRoute'; 
import NewDesignForm from './components/designer/NewDesignForm'; // Single, correct import

function App() {
  return (
    <Router> 
      <div className="App" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Header />
        
        {/* Main Content Area: Routes */}
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />

          {/* ------------------------------------------------------------- */}
          {/* PRIVATE ROUTES WRAPPED BY THE GUARD COMPONENT */}
          {/* ------------------------------------------------------------- */}
          
          {/* 1. Designer Panel Route - Requires 'designer' role */}
          <Route element={<PrivateRoute requiredRole={['designer', 'admin']} />}>
            {/* The main dashboard wrapper uses Outlet to render its children */}
            <Route path='/designer/dashboard' element={<DesignerDashboard />}>
              {/* Nested Routes within the dashboard component */}
              
              {/* This is the default path: /designer/dashboard */}
              <Route index element={<h1>[My Designs] - List of all your designs</h1>} />
              
              {/* THIS IS THE CRITICAL FIX: Render the actual component */}
              <Route path='new' element={<NewDesignForm />} /> 
            </Route>
          </Route>
          
          {/* 2. Buyer Panel Route - Requires 'buyer' role */}
          <Route element={<PrivateRoute requiredRole={['buyer', 'admin']} />}>
            <Route path='/buyer/dashboard' element={<h1>[BUYER PANEL] - You are logged in as a Buyer/Admin</h1>} />
          </Route>

          {/* 3. Admin Panel Route - Requires 'admin' role */}
          <Route element={<PrivateRoute requiredRole={['admin']} />}>
            <Route path='/admin/dashboard' element={<h1>[ADMIN PANEL] - You are logged in as an Admin</h1>} />
          </Route>

          {/* Fallback Route for 404 Not Found */}
          <Route path='*' element={<h1>404 Not Found</h1>} />
        </Routes>

        <Footer />
      </div>
    </Router>
  );
}

export default App;