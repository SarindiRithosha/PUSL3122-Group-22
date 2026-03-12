import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useCustomerAuth } from "../contexts/CustomerAuthContext";

const CustomerProtectedRoute = ({ children }) => {
  const { isCustomerLoggedIn, isCustomerAuthLoading } = useCustomerAuth();
  const location = useLocation();

  if (isCustomerAuthLoading) {
    return null;
  }

  if (!isCustomerLoggedIn) {
    return (
      <Navigate
        to="/sign-in"
        replace
        state={{ from: `${location.pathname}${location.search || ""}` }}
      />
    );
  }

  return children;
};

export default CustomerProtectedRoute;

