import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import CustomerHeader from './components/CustomerHeader';
import CustomerFooter from './components/CustomerFooter';
import AdminLayout from './components/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import PublicOnlyRoute from './components/PublicOnlyRoute';
import CustomerProtectedRoute from './components/CustomerProtectedRoute';
import CustomerPublicOnlyRoute from './components/CustomerPublicOnlyRoute';
import './App.css';

// Customer Pages
import Home                  from './pages/Home';
import FurnitureCatalog      from './pages/FurnitureCatalog';
import FurnitureDetail       from './pages/FurnitureDetail';
import DesignCatalog         from './pages/DesignCatalog';
import Room                  from './pages/Room';
import CustomerWorkspace     from './pages/CustomerWorkspace';
import About                 from './pages/About';
import Contactus             from './pages/Contactus';
import Cart                  from './pages/Cart';
import Checkout              from './pages/Checkout';
import Myaccount             from './pages/Myaccount';
import CustomerSignIn        from './pages/CustomerSignIn';
import CustomerSignUp        from './pages/CustomerSignUp';
import CustomerForgotPassword from './pages/CustomerForgotPassword';
import CustomerResetPassword  from './pages/CustomerResetPassword';

// Admin Pages
import Dashboard         from './pages/admin/Dashboard';
import RoomManagement    from './pages/admin/RoomManagement';
import RoomForm          from './pages/admin/RoomForm';
import FurnitureManagement from './pages/admin/FurnitureManagement';
import FurnitureForm     from './pages/admin/FurnitureForm';
import DesignWorkspace   from './pages/admin/DesignWorkspace';
import DesignLibrary     from './pages/admin/DesignLibrary';
import CustomerOrders    from './pages/admin/CustomerOrder';
import Analytics         from './pages/admin/Analytics';
import AdminSignIn       from './pages/admin/SignIn';
import AdminForgotPassword from './pages/admin/ForgotPassword';
import AdminResetPassword  from './pages/admin/ResetPassword';

const WorkspaceLayout = ({ children }) => (
  <>
    <CustomerHeader/>
    <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {children}
    </main>
  </>
);

const CustomerLayout = ({ children }) => (
  <>
    <CustomerHeader/>
    <main className="main-content">{children}</main>
    <CustomerFooter/>
  </>
);

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          {/*  Public customer pages  */}
          <Route path="/"          element={<CustomerLayout><Home/></CustomerLayout>} />
          <Route path="/furniture" element={<CustomerLayout><FurnitureCatalog/></CustomerLayout>} />
          <Route path="/furniture/:id" element={<CustomerLayout><FurnitureDetail/></CustomerLayout>} />
          <Route path="/design"    element={<CustomerLayout><DesignCatalog/></CustomerLayout>} />
          <Route path="/about"     element={<CustomerLayout><About/></CustomerLayout>} />
          <Route path="/contact"   element={<CustomerLayout><Contactus/></CustomerLayout>} />
          <Route path="/cart"      element={<CustomerLayout><Cart/></CustomerLayout>} />
          <Route path="/checkout"  element={<CustomerLayout><Checkout/></CustomerLayout>} />
          <Route path="/room" element={<CustomerLayout><Room/></CustomerLayout>} />

          <Route path="/workspace/room/:roomId"
            element={
              <WorkspaceLayout>
                <CustomerWorkspace/>
              </WorkspaceLayout>
            }
          />

          <Route path="/workspace/design/:designId"
            element={
              <WorkspaceLayout>
                <CustomerWorkspace/>
              </WorkspaceLayout>
            }
          />

          {/*  Auth pages  */}
          <Route path="/sign-in" element={<CustomerPublicOnlyRoute><CustomerSignIn/></CustomerPublicOnlyRoute>} />
          <Route path="/sign-up" element={<CustomerPublicOnlyRoute><CustomerSignUp/></CustomerPublicOnlyRoute>} />
          <Route path="/forgot-password" element={<CustomerPublicOnlyRoute><CustomerForgotPassword/></CustomerPublicOnlyRoute>} />
          <Route path="/reset-password"  element={<CustomerPublicOnlyRoute><CustomerResetPassword/></CustomerPublicOnlyRoute>} />
          <Route path="/signup" element={<Navigate to="/sign-up" replace/>} />
          <Route path="/login"  element={<Navigate to="/sign-in" replace/>} />

          {/*  Protected customer page  */}
          <Route path="/myaccount"
            element={
              <CustomerProtectedRoute>
                <CustomerLayout><Myaccount/></CustomerLayout>
              </CustomerProtectedRoute>
            }
          />

          {/*  Admin routes  */}
          <Route path="/admin/signin"          element={<PublicOnlyRoute><AdminSignIn/></PublicOnlyRoute>} />
          <Route path="/admin/forgot-password" element={<PublicOnlyRoute><AdminForgotPassword/></PublicOnlyRoute>} />
          <Route path="/admin/reset-password"  element={<PublicOnlyRoute><AdminResetPassword/></PublicOnlyRoute>} />

          <Route path="/admin" element={<ProtectedRoute><AdminLayout/></ProtectedRoute>}>
            <Route index element={<Dashboard/>} />
            <Route path="dashboard"                    element={<Dashboard/>} />
            <Route path="room-management"              element={<RoomManagement/>} />
            <Route path="room-management/add"          element={<RoomForm/>} />
            <Route path="room-management/edit/:id"     element={<RoomForm/>} />
            <Route path="furniture-management"         element={<FurnitureManagement/>} />
            <Route path="furniture-management/add"     element={<FurnitureForm/>} />
            <Route path="furniture-management/edit/:id" element={<FurnitureForm/>} />
            <Route path="design-workspace"             element={<DesignWorkspace/>} />
            <Route path="design-workspace/:id"         element={<DesignWorkspace/>} />
            <Route path="design-library"               element={<DesignLibrary/>} />
            <Route path="customer-orders"              element={<CustomerOrders/>} />
            <Route path="analysis"                     element={<Analytics/>} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;