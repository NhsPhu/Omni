import { create } from "zustand";
import { persist } from "zustand/middleware";
import { jwtDecode } from "jwt-decode";
import { useChatStore } from "./chatStore";

interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
  exp: number;
  avatarUrl?: string;
  hasPassword?: boolean;
}

interface AuthState {
  token: string | null;
  user: User | null;
  setToken: (token: string) => void;
  updateUser: (data: Partial<User>) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      setToken: (token: string) => {
        try {
          const decoded = jwtDecode<any>(token);
          // Map sub to email if email claim doesn't exist
          const existingAvatar = get().user?.avatarUrl;
          const user: User = {
            id: decoded.userId || decoded.id || "",
            email: decoded.email || decoded.sub || "",
            fullName: decoded.fullName || "",
            role: decoded.role || "ROLE_CUSTOMER",
            exp: decoded.exp,
            avatarUrl: existingAvatar,
            hasPassword: decoded.hasPassword !== undefined ? decoded.hasPassword : true
          };
          set({ token, user });
          localStorage.setItem("omni_token", token);
        } catch (error) {
          console.error("Invalid token", error);
        }
      },
      updateUser: (data: Partial<User>) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...data } : null
        }));
      },
      logout: () => {
        set({ token: null, user: null });
        localStorage.removeItem("omni_token");
        // Reset chat state so new account starts fresh
        useChatStore.getState().reset();
      },
      isAuthenticated: () => {
        const { token, user } = get();
        if (!token || !user) return false;
        // Check if token is expired
        if (user.exp * 1000 < Date.now()) {
          get().logout();
          return false;
        }
        return true;
      },
    }),
    {
      name: "auth-storage",
    }
  )
);
