import { getAuthHeaders } from "./authApi";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");

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

export const listFurniture = async (params = {}) => {
  const url = new URL(buildUrl("/furniture", params));
  const query = url.searchParams.toString();
  return request(`/furniture${query ? `?${query}` : ""}`);
};

export const getFurnitureById = async (id) => request(`/furniture/${id}`);

export const resolveAssetUrl = (assetPath) => {
  if (!assetPath) {
    return "";
  }

  if (
    assetPath.startsWith("http://") ||
    assetPath.startsWith("https://") ||
    assetPath.startsWith("blob:") ||
    assetPath.startsWith("data:")
  ) {
    return assetPath;
  }

  if (assetPath.startsWith("/uploads/")) {
    return `${API_ORIGIN}${assetPath}`;
  }

  // Backward compatibility for legacy paths saved before upload API migration.
  if (assetPath.startsWith("/models/")) {
    return `${API_ORIGIN}/uploads/models/${assetPath.split("/").pop()}`;
  }

  if (assetPath.startsWith("/images/furniture/")) {
    return `${API_ORIGIN}/uploads/images/${assetPath.split("/").pop()}`;
  }

  return assetPath;
};

export const uploadFurnitureAsset = async (type, file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/uploads/${type}`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: formData,
  });

  const body = await response.json();
  if (!response.ok) {
    const error = new Error(body?.message || "Asset upload failed.");
    error.status = response.status;
    throw error;
  }

  return body;
};

export const createFurniture = async (payload) =>
  request("/furniture", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const updateFurniture = async (id, payload) =>
  request(`/furniture/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });

export const updateFurnitureScale = async (id, payload) =>
  request(`/furniture/${id}/scale`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

export const deleteFurniture = async (id) =>
  request(`/furniture/${id}`, {
    method: "DELETE",
  });
