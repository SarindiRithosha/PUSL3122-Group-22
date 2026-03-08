import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext'; // Add this import
import CustomerHeader from './components/CustomerHeader';
import CustomerFooter from './components/CustomerFooter';
import AdminLayout from './components/AdminLayout';
import './App.css';

// Customer Pages
import Home from './pages/Home';
import FurnitureCatalog from './pages/FurnitureCatalog';  
import FurnitureDetail from './pages/FurnitureDetail';
import Design from './pages/DesignCatalog';
import Room from './pages/Room';
import About from './pages/About';
import Contactus from './pages/Contactus';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Myaccount from './pages/Myaccount';

// Admin Pages
import Dashboard from './pages/admin/Dashboard';
import RoomManagement from './pages/admin/RoomManagement';
import RoomForm from './pages/admin/RoomForm';
import FurnitureManagement from './pages/admin/FurnitureManagement';
import FurnitureForm from './pages/admin/FurnitureForm';
import DesignLibrary from './pages/admin/DesignLibrary';
import CustomerOrders from './pages/admin/CustomerOrder';
import Analytics from './pages/admin/Analytics';
import DesignCatalog from './pages/DesignCatalog';

function App() {
  return (
    <AuthProvider> {/* Wrap everything with AuthProvider */}
      <Router>
        <div className="app">
          <Routes>
            <Route path="/" element={
              <>
                <CustomerHeader />
                <main className="main-content">
                  <Home />
                </main>
                <CustomerFooter />
              </>
            } />

            <Route path="/furniture" element={
              <>
                <CustomerHeader />
                <main className="main-content">
                  <FurnitureCatalog />
                </main>
                <CustomerFooter />
              </>
            } />

            <Route path="/furniture/:id" element={
              <>
                <CustomerHeader />
                <main className="main-content">
                  <FurnitureDetail />
                </main>
                <CustomerFooter />
              </>
            } />

            <Route path="/design" element={
              <>
                <CustomerHeader />
                <main className="main-content">
                  <DesignCatalog />
                </main>
                <CustomerFooter />
              </>
            } />

            <Route path="/room" element={
              <>
                <CustomerHeader />
                <main className="main-content">
                  <Room />
                </main>
                <CustomerFooter />
              </>
            } />

            <Route path="/about" element={
              <>
                <CustomerHeader />
                <main className="main-content">
                  <About />
                </main>
                <CustomerFooter />
              </>
            } />

            <Route path="/contact" element={
              <>
                <CustomerHeader />
                <main className="main-content">
                  <Contactus />
                </main>
                <CustomerFooter />
              </>
            } />

            {/* Admin Routes with Sidebar Layout */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="room-management" element={<RoomManagement />} />
              <Route path="room-management/add" element={<RoomForm />} />
              <Route path="room-management/edit/:id" element={<RoomForm />} />
              <Route path="furniture-management" element={<FurnitureManagement />} />
              <Route path="furniture-management/add" element={<FurnitureForm />} />
              <Route path="furniture-management/edit/:id" element={<FurnitureForm />} />
              <Route path="design-library" element={<DesignLibrary />} />
              <Route path="customer-orders" element={<CustomerOrders />} />
              <Route path="analysis" element={<Analytics />} />
            </Route>

            <Route path="/myaccount" element={
              <>
                <CustomerHeader />
                <main className="main-content">
                  <Myaccount />
                </main>
                <CustomerFooter />
              </>
            } />

            <Route path="/cart" element={
              <>
                <CustomerHeader />
                <main className="main-content">
                  <Cart />
                </main>
                <CustomerFooter />
              </>
            } />

            <Route path="/checkout" element={
              <>
                <CustomerHeader />
                <main className="main-content">
                  <Checkout />
                </main>
                <CustomerFooter />
              </>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;