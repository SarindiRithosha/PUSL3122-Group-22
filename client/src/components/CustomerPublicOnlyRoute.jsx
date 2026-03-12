import React from "react";
import { Navigate } from "react-router-dom";
import { useCustomerAuth } from "../contexts/CustomerAuthContext";

const CustomerPublicOnlyRoute = ({ children }) => {
  const { isCustomerLoggedIn, isCustomerAuthLoading } = useCustomerAuth();

  if (isCustomerAuthLoading) {
    return null;
  }

  if (isCustomerLoggedIn) {
    return <Navigate to="/myaccount" replace />;
  }

  return children;
};

export default CustomerPublicOnlyRoute;

