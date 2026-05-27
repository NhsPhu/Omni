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
  shopId: string | null;
  setAuth: (token: string) => void;
  setShopId: (shopId: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      shopId: null,
      setAuth: (token: string) => {
        try {
          const decoded = jwtDecode<User>(token);
          set({ token, user: decoded });
        } catch (error) {
          console.error("Invalid token", error);
        }
      },
      setShopId: (shopId: string) => set({ shopId }),
      logout: () => set({ token: null, user: null, shopId: null }),
    }),
    {
      name: "omni-dashboard-auth",
    }
  )
);
