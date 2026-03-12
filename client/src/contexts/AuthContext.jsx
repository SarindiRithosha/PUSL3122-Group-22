import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  clearAdminSession,
  fetchCurrentAdmin,
  forgotPassword as forgotPasswordRequest,
  getAdminToken,
  getStoredAdminUser,
  loginAdmin as loginAdminRequest,
  resetPassword as resetPasswordRequest,
  saveAdminSession,
} from "../services/authApi";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getStoredAdminUser());
  const [token, setToken] = useState(getAdminToken());
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const logout = useCallback(() => {
    clearAdminSession();
    setToken("");
    setUser(null);
  }, []);

  const bootstrapSession = useCallback(async () => {
    const existingToken = getAdminToken();
    if (!existingToken) {
      logout();
      setIsAuthLoading(false);
      return;
    }

    try {
      const response = await fetchCurrentAdmin();
      setToken(existingToken);
      setUser(response?.data?.user || null);
      if (response?.data?.user) {
        saveAdminSession({ token: existingToken, user: response.data.user });
      }
    } catch (error) {
      logout();
    } finally {
      setIsAuthLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    bootstrapSession();
  }, [bootstrapSession]);

  const login = useCallback(async ({ email, password }) => {
    const response = await loginAdminRequest({ email, password });
    const nextToken = response?.data?.token || "";
    const nextUser = response?.data?.user || null;

    if (!nextToken || !nextUser) {
      throw new Error("Invalid login response.");
    }

    saveAdminSession({ token: nextToken, user: nextUser });
    setToken(nextToken);
    setUser(nextUser);
    return response;
  }, []);

  const forgotPassword = useCallback(async (email) => {
    return forgotPasswordRequest(email);
  }, []);

  const resetPassword = useCallback(async ({ token: resetToken, password, confirmPassword }) => {
    return resetPasswordRequest({
      token: resetToken,
      password,
      confirmPassword,
    });
  }, []);

  const contextValue = useMemo(
    () => ({
      user,
      token,
      isLoggedIn: Boolean(user && token),
      isAuthLoading,
      login,
      logout,
      forgotPassword,
      resetPassword,
    }),
    [forgotPassword, isAuthLoading, login, logout, resetPassword, token, user]
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
};
