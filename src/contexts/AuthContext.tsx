// ==========================================
// Auth Context - React Context with Firebase Auth
// ==========================================

import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../config/firebase";
import type { User } from "../types/auth";
import authService from "../services/auth";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAuthReady: boolean; // NEW: Firebase Auth is fully initialized
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName?: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // FIX: Track when Firebase Auth is fully initialized
  const [isAuthReady, setIsAuthReady] = useState(false);
  const authInitPromise = useRef<Promise<void> | null>(null);
  const resolveAuthInit = useRef<(() => void) | null>(null);

  // FIX: Create a promise that resolves when Firebase Auth is ready
  useEffect(() => {
    // Create a promise that we'll resolve when Firebase Auth initializes
    authInitPromise.current = new Promise<void>((resolve) => {
      resolveAuthInit.current = resolve;
    });

    // F1: KHÔNG setUser từ localStorage cache TRƯỚC khi Firebase auth thay đổi.
    // Lý do: Khi user A logout và user B login trong cùng 1 SPA session,
    // localStorage cache của A vẫn còn (chỉ bị ghi đè SAU khi onAuthStateChanged
    // bắn với user B). Nếu setUser(cache A) ở đây, UI sẽ flash user A trước
    // khi chuyển sang B, và nếu có race, có thể hiển thị nhầm user.
    // Fix: Chờ onAuthStateChanged quyết định user thật, dựa trên
    // `auth.currentUser` — đây là source of truth từ Firebase SDK.

    // 2. Listen to Firebase Auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        try {
          const token = await fbUser.getIdToken();
          localStorage.setItem("admin_token", token);

          // Try to get latest user info from backend
          let currentUser: User;
          try {
            currentUser = await authService.getCurrentUser();
          } catch {
            // F1: Chỉ fallback về cache nếu cache thuộc về user HIỆN TẠI
            // (không phải user cũ từ session trước).
            const stored = authService.getStoredUser();
            currentUser = (stored && (stored.uid === fbUser.uid || stored.id === fbUser.uid))
              ? stored
              : {
                  uid: fbUser.uid,
                  id: fbUser.uid,
                  email: fbUser.email || undefined,
                  full_name: fbUser.displayName || fbUser.email?.split("@")[0] || "User",
                  role: "user",
                  email_verified: fbUser.emailVerified,
                };
          }

          setUser(currentUser);
          localStorage.setItem("admin_user", JSON.stringify(currentUser));
        } catch (err) {
          console.error("Error setting auth user:", err);
        }
      } else {
        // F1: Firebase báo user null → clearAuth để tránh cache cũ "sống" thêm
        setUser(null);
        authService.clearAuth();
      }

      // FIX: Mark Firebase Auth as ready
      setIsAuthReady(true);
      setIsLoading(false);

      // Resolve the promise so any waiting components can proceed
      if (resolveAuthInit.current) {
        resolveAuthInit.current();
      }
    });

    return () => unsubscribe();
  }, []);

  // FIX: Expose method to wait for auth to be ready before API calls
  const waitForAuth = async (): Promise<void> => {
    if (isAuthReady) return;
    if (authInitPromise.current) {
      await authInitPromise.current;
    }
  };

  const login = async (email: string, password: string) => {
    const response = await authService.login({ email, password });
    setUser(response.user);
  };

  const register = async (email: string, password: string, fullName?: string) => {
    const response = await authService.register({ email, password, full_name: fullName });
    setUser(response.user);
  };

  const resetPassword = async (email: string) => {
    await authService.resetPassword(email);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        isAuthReady, // NEW: Export auth ready state
        login,
        register,
        resetPassword,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
