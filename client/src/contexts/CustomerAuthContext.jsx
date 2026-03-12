import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  clearCustomerSession,
  changeCustomerPassword as changeCustomerPasswordRequest,
  deleteCustomerAccount as deleteCustomerAccountRequest,
  fetchCurrentCustomer,
  forgotCustomerPassword as forgotCustomerPasswordRequest,
  getCustomerToken,
  getStoredCustomerUser,
  loginCustomer as loginCustomerRequest,
  resetCustomerPassword as resetCustomerPasswordRequest,
  saveCustomerSession,
  signUpCustomer as signUpCustomerRequest,
  updateCustomerProfile as updateCustomerProfileRequest,
} from "../services/authApi";

const CustomerAuthContext = createContext(null);

export const CustomerAuthProvider = ({ children }) => {
  const [customer, setCustomer] = useState(getStoredCustomerUser());
  const [customerToken, setCustomerToken] = useState(getCustomerToken());
  const [isCustomerAuthLoading, setIsCustomerAuthLoading] = useState(true);

  const logoutCustomer = useCallback(() => {
    clearCustomerSession();
    setCustomerToken("");
    setCustomer(null);
  }, []);

  const bootstrapCustomerSession = useCallback(async () => {
    const existingToken = getCustomerToken();
    if (!existingToken) {
      logoutCustomer();
      setIsCustomerAuthLoading(false);
      return;
    }

    try {
      const response = await fetchCurrentCustomer();
      const nextCustomer = response?.data?.user || null;
      setCustomerToken(existingToken);
      setCustomer(nextCustomer);
      if (nextCustomer) {
        saveCustomerSession({ token: existingToken, user: nextCustomer });
      }
    } catch (error) {
      logoutCustomer();
    } finally {
      setIsCustomerAuthLoading(false);
    }
  }, [logoutCustomer]);

  useEffect(() => {
    bootstrapCustomerSession();
  }, [bootstrapCustomerSession]);

  const loginCustomer = useCallback(async ({ email, password }) => {
    const response = await loginCustomerRequest({ email, password });
    const nextToken = response?.data?.token || "";
    const nextCustomer = response?.data?.user || null;

    if (!nextToken || !nextCustomer) {
      throw new Error("Invalid sign in response.");
    }

    saveCustomerSession({ token: nextToken, user: nextCustomer });
    setCustomerToken(nextToken);
    setCustomer(nextCustomer);
    return response;
  }, []);

  const signUpCustomer = useCallback(async ({ name, email, password, confirmPassword }) => {
    const response = await signUpCustomerRequest({
      name,
      email,
      password,
      confirmPassword,
    });
    const nextToken = response?.data?.token || "";
    const nextCustomer = response?.data?.user || null;

    if (!nextToken || !nextCustomer) {
      throw new Error("Invalid sign up response.");
    }

    saveCustomerSession({ token: nextToken, user: nextCustomer });
    setCustomerToken(nextToken);
    setCustomer(nextCustomer);
    return response;
  }, []);

  const forgotCustomerPassword = useCallback(async (email) => {
    return forgotCustomerPasswordRequest(email);
  }, []);

  const resetCustomerPassword = useCallback(async ({ token, password, confirmPassword }) => {
    return resetCustomerPasswordRequest({ token, password, confirmPassword });
  }, []);

  const updateCustomerProfile = useCallback(async ({ firstName, lastName, phone, address }) => {
    const response = await updateCustomerProfileRequest({
      firstName,
      lastName,
      phone,
      address,
    });
    const updatedCustomer = response?.data?.user || null;
    if (updatedCustomer) {
      saveCustomerSession({ token: customerToken, user: updatedCustomer });
      setCustomer(updatedCustomer);
    }
    return response;
  }, [customerToken]);

  const changeCustomerPassword = useCallback(async ({ currentPassword, newPassword, confirmPassword }) => {
    return changeCustomerPasswordRequest({
      currentPassword,
      newPassword,
      confirmPassword,
    });
  }, []);

  const deleteCustomerAccount = useCallback(async ({ password, confirmationText }) => {
    const response = await deleteCustomerAccountRequest({ password, confirmationText });
    clearCustomerSession();
    setCustomerToken("");
    setCustomer(null);
    return response;
  }, []);

  const contextValue = useMemo(
    () => ({
      customer,
      customerToken,
      isCustomerLoggedIn: Boolean(customer && customerToken),
      isCustomerAuthLoading,
      loginCustomer,
      signUpCustomer,
      forgotCustomerPassword,
      resetCustomerPassword,
      updateCustomerProfile,
      changeCustomerPassword,
      deleteCustomerAccount,
      logoutCustomer,
    }),
    [
      customer,
      customerToken,
      isCustomerAuthLoading,
      forgotCustomerPassword,
      loginCustomer,
      logoutCustomer,
      resetCustomerPassword,
      updateCustomerProfile,
      changeCustomerPassword,
      deleteCustomerAccount,
      signUpCustomer,
    ]
  );

  return (
    <CustomerAuthContext.Provider value={contextValue}>
      {children}
    </CustomerAuthContext.Provider>
  );
};

export const useCustomerAuth = () => {
  const ctx = useContext(CustomerAuthContext);
  if (!ctx) {
    throw new Error("useCustomerAuth must be used within CustomerAuthProvider");
  }
  return ctx;
};
