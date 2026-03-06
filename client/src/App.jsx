import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CustomerHeader from './components/CustomerHeader';
import CustomerFooter from './components/CustomerFooter';
import AdminLayout from './components/AdminLayout';
import './App.css';

// Customer Pages
import Home from './pages/Home';
import Furniture from './pages/FurnitureCatalog';
import FurnitureDetail from './pages/FurnitureDetail';
import Design from './pages/DesignCatalog';
import Room from './pages/Room';
import About from './pages/About';

// Admin Pages
import Dashboard from './pages/admin/Dashboard';
import RoomManagement from './pages/admin/RoomManagement';
import RoomForm from './pages/admin/RoomForm';
import FurnitureManagement from './pages/admin/FurnitureManagement';
import FurnitureForm from './pages/admin/FurnitureForm';
import DesignLibrary from './pages/admin/DesignLibrary';
//import DesignWorkspace from './pages/admin/DesignWorkspace';
//import CustomerOrders from './pages/admin/CustomerOrders';
import Analysis from './pages/admin/Analytics';

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          {/* Customer Routes with Header & Footer */}
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
                <Furniture />
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
                <Design />
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
            <Route path="analysis" element={<Analysis />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;