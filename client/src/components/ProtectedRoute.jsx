import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { isLoggedIn, isAuthLoading } = useAuth();
  const location = useLocation();

  if (isAuthLoading) {
    return null;
  }

  if (!isLoggedIn) {
    return (
      <Navigate
        to="/admin/signin"
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    );
  }

  return children || <Outlet />;
};

export default ProtectedRoute;
