import { getAuthHeaders } from "./authApi";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const buildUrl = (path, params = {}) => {
  const url = new URL(`${API_BASE}${path}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });
  return url.toString();
};

const request = async (path, options = {}) => {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
      ...(options.headers || {}),
    },
    ...options,
  });

  const contentType = response.headers.get("content-type") || "";
  const body = contentType.includes("application/json")
    ? await response.json()
    : null;

  if (!response.ok) {
    const error = new Error(body?.message || `Request failed with ${response.status}`);
    error.status = response.status;
    throw error;
  }

  return body;
};

const qs = (params = {}) => {
  const url = new URL(buildUrl("/designs", params));
  const query = url.searchParams.toString();
  return query ? `?${query}` : "";
};

export const listDesigns   = (params = {}) => request(`/designs${qs(params)}`);
export const getDesignById = (id)           => request(`/designs/${id}`);
export const createDesign  = (payload)      => request("/designs", { method: "POST",   body: JSON.stringify(payload) });
export const updateDesign  = (id, payload)  => request(`/designs/${id}`, { method: "PUT",    body: JSON.stringify(payload) });
export const deleteDesign  = (id)           => request(`/designs/${id}`, { method: "DELETE" });
export const publishDesign = (id)           => request(`/designs/${id}/publish`, { method: "PATCH" });