import { getAuthHeaders } from "./authApi";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const buildUrl = (path, params = {}) => {
  const url = new URL(`${API_BASE_URL}${path}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });
  return url.toString();
};

const request = async (path, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
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

export const listRoomTemplates = async (params = {}) => {
  const url = new URL(buildUrl("/rooms", params));
  const query = url.searchParams.toString();
  return request(`/rooms${query ? `?${query}` : ""}`);
};

export const getRoomTemplateById = async (id) => request(`/rooms/${id}`);

export const createRoomTemplate = async (payload) =>
  request("/rooms", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const updateRoomTemplate = async (id, payload) =>
  request(`/rooms/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });

export const deleteRoomTemplate = async (id) =>
  request(`/rooms/${id}`, {
    method: "DELETE",
  });
