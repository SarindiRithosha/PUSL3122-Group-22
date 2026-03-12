import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const PublicOnlyRoute = ({ children }) => {
  const { isLoggedIn, isAuthLoading } = useAuth();

  if (isAuthLoading) {
    return null;
  }

  if (isLoggedIn) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
};

export default PublicOnlyRoute;
