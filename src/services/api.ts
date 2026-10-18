// ==========================================
// API Service - Axios instance with Firebase Auth interceptors
// ==========================================

import axios, { AxiosError } from "axios";
import { auth } from "../config/firebase";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// F2: Cache timestamp khi token được ghi vào localStorage, để tránh dùng
// token cũ (> 5 phút) khi Firebase auth chưa kịp đồng bộ user mới.
const TOKEN_LAST_WRITTEN_KEY = "admin_token_written_at";
const TOKEN_STALE_MS = 5 * 60 * 1000; // 5 phút

function markTokenWritten(): void {
  try {
    localStorage.setItem(TOKEN_LAST_WRITTEN_KEY, String(Date.now()));
  } catch {
    /* ignore */
  }
}

function isTokenStale(): boolean {
  try {
    const raw = localStorage.getItem(TOKEN_LAST_WRITTEN_KEY);
    if (!raw) return true;
    const written = Number(raw);
    if (!Number.isFinite(written)) return true;
    return Date.now() - written > TOKEN_STALE_MS;
  } catch {
    return true;
  }
}

// Helper to set authorization header safely across Axios versions
function setAuthHeader(headers: any, token: string | null) {
  if (!headers) return;
  const value = token ? `Bearer ${token}` : undefined;
  if (typeof headers.set === "function") {
    if (value) {
      headers.set("Authorization", value);
    } else {
      headers.delete("Authorization");
    }
  } else {
    if (value) {
      headers.Authorization = value;
      headers["Authorization"] = value;
    } else {
      delete headers.Authorization;
      delete headers["Authorization"];
    }
  }
}

async function getAuthToken(forceRefresh = false): Promise<string | null> {
  try {
    // 1. Chờ Firebase Auth sẵn sàng khởi tạo nếu chưa xong
    if (typeof auth.authStateReady === "function") {
      await auth.authStateReady();
    }
    const currentUser = auth.currentUser;
    if (currentUser) {
      // F2: Truyền forceRefresh để Firebase tự refresh token nếu sắp hết hạn
      const token = await currentUser.getIdToken(forceRefresh);
      localStorage.setItem("admin_token", token);
      markTokenWritten();
      return token;
    }
  } catch (err) {
    console.warn("Could not get Firebase ID token:", err);
  }

  // F2: Khi forceRefresh=true (đang xử lý 401) mà KHÔNG có currentUser,
  // KHÔNG trả về token cũ từ localStorage — vì có thể là token của user
  // trước (khi user vừa đổi account trong cùng 1 SPA session).
  if (forceRefresh) {
    return null;
  }

  // F2: Fallback cho cold start (refresh page): chỉ trả token cũ nếu
  // chưa quá stale. Nếu stale thì return null để ép user login lại.
  if (isTokenStale()) {
    return null;
  }
  return localStorage.getItem("admin_token");
}

// Create main axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000, // 120s buffer for DeepFace CPU inference + Gemini AI
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - add Firebase auth token
api.interceptors.request.use(async (config) => {
  const token = await getAuthToken();
  if (token && config.headers) {
    setAuthHeader(config.headers, token);
  }
  return config;
});

// Response interceptor - handle 401 with Firebase token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;
    if (!originalRequest || error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;
    try {
      const newToken = await getAuthToken(true);
      if (newToken) {
        setAuthHeader(originalRequest.headers, newToken);
        return api(originalRequest);
      }
    } catch (refreshErr) {
      console.warn("Token refresh on 401 failed:", refreshErr);
    }

    // Token refresh failed or token expired - clear storage and redirect
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    localStorage.removeItem(TOKEN_LAST_WRITTEN_KEY);
    if (window.location.pathname !== "/login") {
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Extended timeout instance for heavy operations
export const apiLongTimeout = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiLongTimeout.interceptors.request.use(async (config) => {
  const token = await getAuthToken();
  if (token && config.headers) {
    setAuthHeader(config.headers, token);
  }
  return config;
});

apiLongTimeout.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;
    if (!originalRequest || error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;
    try {
      const newToken = await getAuthToken(true);
      if (newToken) {
        setAuthHeader(originalRequest.headers, newToken);
        return apiLongTimeout(originalRequest);
      }
    } catch (refreshErr) {
      console.warn("apiLongTimeout token refresh failed:", refreshErr);
    }

    // Token refresh failed or token expired - clear storage and redirect
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    localStorage.removeItem(TOKEN_LAST_WRITTEN_KEY);
    if (window.location.pathname !== "/login") {
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
