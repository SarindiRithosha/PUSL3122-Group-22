import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import '../styles/AdminLayout.css';

const AdminLayout = () => {
  const location = useLocation();

  const isCollapsed =
    location.pathname.includes('/add') ||
    location.pathname.includes('/edit') ||
    location.pathname.includes('/design-workspace');

  return (
    <div className="admin-layout">
      <AdminSidebar collapsed={isCollapsed} />
      <main className={`admin-content ${isCollapsed ? 'collapsed' : ''}`}>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;