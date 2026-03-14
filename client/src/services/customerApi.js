// client/src/services/customerApi.js
// Public and customer-authenticated API helpers (no admin token needed).

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

/** Resolve a relative asset path returned by the backend into a full URL. */
export const resolveAssetUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  const base = API_BASE.replace("/api", "");
  return `${base}${url.startsWith("/") ? "" : "/"}${url}`;
};

const getCustomerHeaders = () => {
  const token = localStorage.getItem("furniplan_customer_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const request = async (path, options = {}) => {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...getCustomerHeaders(),
      ...(options.headers || {}),
    },
    ...options,
  });
  const ct   = response.headers.get("content-type") || "";
  const body = ct.includes("application/json") ? await response.json() : null;
  if (!response.ok) {
    const err   = new Error(body?.message || `Request failed: ${response.status}`);
    err.status  = response.status;
    throw err;
  }
  return body;
};

// ── Public (no auth required) ─────────────────────────────────────────────────
export const listPublishedRooms = () =>
  request("/public/rooms");

export const getPublishedRoom = (id) =>
  request(`/public/rooms/${id}`);

export const listPublishedFurniture = (params = {}) => {
  const qs = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== ""))
  ).toString();
  return request(`/public/furniture${qs ? "?" + qs : ""}`);
};

export const listPublishedDesigns = () =>
  request("/public/designs");

export const getPublishedDesign = (id) =>
  request(`/public/designs/${id}`);

// ── Customer authenticated ────────────────────────────────────────────────────
export const listMyDesigns   = ()            => request("/customer/designs");
export const getMyDesignById = (id)          => request(`/customer/designs/${id}`);
export const createMyDesign  = (payload)     => request("/customer/designs",       { method: "POST",   body: JSON.stringify(payload) });
export const updateMyDesign  = (id, payload) => request(`/customer/designs/${id}`, { method: "PUT",    body: JSON.stringify(payload) });
export const deleteMyDesign  = (id)          => request(`/customer/designs/${id}`, { method: "DELETE" });