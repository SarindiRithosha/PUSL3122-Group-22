const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const ADMIN_TOKEN_STORAGE_KEY = "furniplan_admin_token";
const ADMIN_USER_STORAGE_KEY = "furniplan_admin_user";
const CUSTOMER_TOKEN_STORAGE_KEY = "furniplan_customer_token";
const CUSTOMER_USER_STORAGE_KEY = "furniplan_customer_user";

const parseResponseBody = async (response) => {
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    return null;
  }
  return response.json();
};

const toApiError = (response, body, fallbackMessage) => {
  const error = new Error(body?.message || fallbackMessage);
  error.status = response.status;
  error.body = body;
  return error;
};

export const getAdminToken = () => localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY) || "";

export const getStoredAdminUser = () => {
  const raw = localStorage.getItem(ADMIN_USER_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (error) {
    return null;
  }
};

export const saveAdminSession = ({ token, user }) => {
  if (token) {
    localStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, token);
  }
  if (user) {
    localStorage.setItem(ADMIN_USER_STORAGE_KEY, JSON.stringify(user));
  }
};

export const clearAdminSession = () => {
  localStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
  localStorage.removeItem(ADMIN_USER_STORAGE_KEY);
};

export const getAuthHeaders = (headers = {}) => {
  const token = getAdminToken();
  return token ? { ...headers, Authorization: `Bearer ${token}` } : headers;
};

export const getCustomerToken = () => localStorage.getItem(CUSTOMER_TOKEN_STORAGE_KEY) || "";

export const getStoredCustomerUser = () => {
  const raw = localStorage.getItem(CUSTOMER_USER_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (error) {
    return null;
  }
};

export const saveCustomerSession = ({ token, user }) => {
  if (token) {
    localStorage.setItem(CUSTOMER_TOKEN_STORAGE_KEY, token);
  }
  if (user) {
    localStorage.setItem(CUSTOMER_USER_STORAGE_KEY, JSON.stringify(user));
  }
};

export const clearCustomerSession = () => {
  localStorage.removeItem(CUSTOMER_TOKEN_STORAGE_KEY);
  localStorage.removeItem(CUSTOMER_USER_STORAGE_KEY);
};

export const getCustomerAuthHeaders = (headers = {}) => {
  const token = getCustomerToken();
  return token ? { ...headers, Authorization: `Bearer ${token}` } : headers;
};

const request = async (path, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const body = await parseResponseBody(response);
  if (!response.ok) {
    throw toApiError(response, body, `Request failed with ${response.status}`);
  }

  return body;
};

export const loginAdmin = async ({ email, password }) => {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
};

export const forgotPassword = async (email) => {
  return request("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
};

export const resetPassword = async ({ token, password, confirmPassword }) => {
  return request(`/auth/reset-password/${token}`, {
    method: "POST",
    body: JSON.stringify({ password, confirmPassword }),
  });
};

export const fetchCurrentAdmin = async () => {
  return request("/auth/me", {
    headers: getAuthHeaders(),
  });
};

export const signUpCustomer = async ({ name, email, password, confirmPassword }) => {
  return request("/auth/customer/signup", {
    method: "POST",
    body: JSON.stringify({ name, email, password, confirmPassword }),
  });
};

export const loginCustomer = async ({ email, password }) => {
  return request("/auth/customer/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
};

export const forgotCustomerPassword = async (email) => {
  return request("/auth/customer/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
};

export const resetCustomerPassword = async ({ token, password, confirmPassword }) => {
  return request(`/auth/customer/reset-password/${token}`, {
    method: "POST",
    body: JSON.stringify({ password, confirmPassword }),
  });
};

export const fetchCurrentCustomer = async () => {
  return request("/auth/customer/me", {
    headers: getCustomerAuthHeaders(),
  });
};

export const updateCustomerProfile = async ({ firstName, lastName, phone, address }) => {
  return request("/auth/customer/profile", {
    method: "PUT",
    headers: getCustomerAuthHeaders(),
    body: JSON.stringify({
      firstName,
      lastName,
      phone,
      address: {
        street: address?.street || "",
        city: address?.city || "",
        province: address?.province || "",
        postalCode: address?.postalCode || "",
      },
    }),
  });
};

export const changeCustomerPassword = async ({ currentPassword, newPassword, confirmPassword }) => {
  return request("/auth/customer/change-password", {
    method: "POST",
    headers: getCustomerAuthHeaders(),
    body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
  });
};

export const deleteCustomerAccount = async ({ password, confirmationText }) => {
  return request("/auth/customer/account", {
    method: "DELETE",
    headers: getCustomerAuthHeaders(),
    body: JSON.stringify({ password, confirmationText }),
  });
};
