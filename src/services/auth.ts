// ==========================================
// Auth Service - Firebase Authentication & Profile
// ==========================================

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile as updateFirebaseProfile,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "../config/firebase";
import api from "./api";
import type { LoginRequest, RegisterRequest, AuthResponse, User, UserProfile } from "../types/auth";

// Promise that resolves when Firebase Auth is ready
let authReadyPromise: Promise<void> | null = null;
let resolveAuthReady: (() => void) | null = null;

// Initialize auth ready promise
const initAuthReadyPromise = () => {
  if (!authReadyPromise) {
    authReadyPromise = new Promise<void>((resolve) => {
      resolveAuthReady = resolve;
    });

    // Listen for Firebase Auth to initialize
    onAuthStateChanged(auth, () => {
      if (resolveAuthReady) {
        resolveAuthReady();
      }
    });
  }
};

// Start initialization immediately when service is imported
initAuthReadyPromise();

export const authService = {
  /**
   * Đăng nhập bằng Email và Mật khẩu (Firebase Auth)
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    const cred = await signInWithEmailAndPassword(auth, data.email, data.password);
    const token = await cred.user.getIdToken();
    localStorage.setItem("admin_token", token);

    // Đồng bộ profile người dùng với Firestore backend
    let dbUser: User;
    try {
      const syncRes = await api.post<User>(
        "/api/auth/sync",
        {
          full_name: cred.user.displayName || undefined,
          avatar_url: cred.user.photoURL || undefined,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const resUser = syncRes.data;
      dbUser = {
        ...resUser,
        uid: resUser.uid || resUser.id || cred.user.uid,
        id: resUser.id || resUser.uid || cred.user.uid,
        role: resUser.role || "user",
      };
    } catch (syncErr: any) {
      if (syncErr?.response?.status === 403) {
        await auth.signOut();
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_user");
        throw new Error(syncErr?.response?.data?.detail || "Tài khoản của bạn đã bị vô hiệu hóa.");
      }
      console.warn("Sync failed, trying /api/auth/me fallback:", syncErr);
      try {
        const meRes = await api.get<User>("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const resUser = meRes.data;
        dbUser = {
          ...resUser,
          uid: resUser.uid || resUser.id || cred.user.uid,
          id: resUser.id || resUser.uid || cred.user.uid,
          role: resUser.role || "user",
        };
      } catch (meErr: any) {
        if (meErr?.response?.status === 403) {
          await auth.signOut();
          localStorage.removeItem("admin_token");
          localStorage.removeItem("admin_user");
          throw new Error(meErr?.response?.data?.detail || "Tài khoản của bạn đã bị vô hiệu hóa.");
        }
        console.warn("Failed to fetch user from backend:", meErr);
        const cached = this.getStoredUser();
        if (cached && (cached.uid === cred.user.uid || cached.id === cred.user.uid)) {
          dbUser = cached;
        } else {
          dbUser = {
            uid: cred.user.uid,
            email: cred.user.email || undefined,
            full_name: cred.user.displayName || cred.user.email?.split("@")[0] || "User",
            role: "user",
            email_verified: cred.user.emailVerified,
          };
        }
      }
    }

    const authRes: AuthResponse = {
      access_token: token,
      user: dbUser,
    };
    this.saveAuth(authRes);
    return authRes;
  },

  /**
   * Đăng ký tài khoản mới bằng Email và Mật khẩu (Firebase Auth)
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const cred = await createUserWithEmailAndPassword(auth, data.email, data.password);
    if (data.full_name) {
      await updateFirebaseProfile(cred.user, { displayName: data.full_name });
    }
    const token = await cred.user.getIdToken();
    localStorage.setItem("admin_token", token);

    // Đồng bộ profile người dùng với Firestore
    let dbUser: User;
    try {
      const syncRes = await api.post<User>(
        "/api/auth/sync",
        {
          full_name: data.full_name || undefined,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const resUser = syncRes.data;
      dbUser = {
        ...resUser,
        uid: resUser.uid || resUser.id || cred.user.uid,
        id: resUser.id || resUser.uid || cred.user.uid,
        role: resUser.role || "user",
      };
    } catch {
      dbUser = {
        uid: cred.user.uid,
        email: cred.user.email || undefined,
        full_name: data.full_name || cred.user.email?.split("@")[0] || "User",
        role: "user",
        email_verified: cred.user.emailVerified,
      };
    }

    const authRes: AuthResponse = {
      access_token: token,
      user: dbUser,
    };
    this.saveAuth(authRes);
    return authRes;
  },

  /**
   * Gửi email đặt lại mật khẩu
   */
  async resetPassword(email: string): Promise<void> {
    await sendPasswordResetEmail(auth, email);
  },

  /**
   * Đăng xuất khỏi Firebase và xóa storage
   */
  async logout(): Promise<void> {
    try {
      await signOut(auth);
    } catch (err) {
      console.warn("Firebase signout error:", err);
    }
    this.clearAuth();
  },

  /**
   * Lấy thông tin user hiện tại từ server
   */
  async getCurrentUser(): Promise<User> {
    const res = await api.get<User>("/api/auth/me");
    const data = res.data;
    return {
      ...data,
      uid: data.uid || data.id || "",
      id: data.id || data.uid || "",
      role: data.role || "user",
    };
  },

  /**
   * Kiểm tra đăng nhập
   */
  isAuthenticated(): boolean {
    return !!auth.currentUser || !!localStorage.getItem("admin_token");
  },

  /**
   * Đợi cho Firebase Auth được khởi tạo xong
   * FIX: Ngăn race condition khi API call được gọi trước khi Firebase sẵn sàng
   */
  async waitForAuth(): Promise<void> {
    if (typeof auth.authStateReady === "function") {
      await auth.authStateReady();
    } else if (authReadyPromise) {
      await authReadyPromise;
    }

    if (auth.currentUser) {
      try {
        const token = await auth.currentUser.getIdToken(false);
        localStorage.setItem("admin_token", token);
      } catch (err) {
        console.warn("waitForAuth token refresh warning:", err);
      }
    }
  },

  getToken(): string | null {
    return localStorage.getItem("admin_token");
  },

  getStoredUser(): User | null {
    const userStr = localStorage.getItem("admin_user");
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  },

  saveAuth(data: AuthResponse): void {
    localStorage.setItem("admin_token", data.access_token);
    localStorage.setItem("admin_user", JSON.stringify(data.user));
  },

  clearAuth(): void {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_refresh_token");
    localStorage.removeItem("admin_user");
    // F2: Xóa luôn timestamp ghi token để tránh fallback từ cache cũ
    // nếu user mở lại app ngay sau khi logout.
    localStorage.removeItem("admin_token_written_at");
  },

  async getProfile(): Promise<any> {
    const response = await api.get("/api/users/me");
    return response.data;
  },

  async updateProfile(data: {
    full_name?: string | null;
    phone?: string | null;
    gender?: string | null;
    birthday?: string | null;
    avatar?: string | null;
    standard_working_hours_per_day?: number | null;
    work_days_per_week?: number | null;
    average_overtime_hours_per_week?: number | null;
    job_title?: string | null;
  }): Promise<any> {
    const response = await api.put("/api/users/me", data);
    return response.data;
  },
};

export type { UserProfile };
export default authService;
