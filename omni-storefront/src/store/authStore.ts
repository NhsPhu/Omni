import { create } from "zustand";
import { persist } from "zustand/middleware";
import { jwtDecode } from "jwt-decode";

interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
  exp: number;
}

interface AuthState {
  token: string | null;
  user: User | null;
  setToken: (token: string) => void;
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
          const decoded = jwtDecode<User>(token);
          set({ token, user: decoded });
          localStorage.setItem("omni_token", token);
        } catch (error) {
          console.error("Invalid token", error);
        }
      },
      logout: () => {
        set({ token: null, user: null });
        localStorage.removeItem("omni_token");
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
