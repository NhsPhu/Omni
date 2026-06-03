import { create } from "zustand";
import api from "@/lib/axios";

interface CartState {
  itemCount: number;
  fetchCart: () => Promise<void>;
}

export const useCartStore = create<CartState>((set) => ({
  itemCount: 0,
  fetchCart: async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) {
        set({ itemCount: 0 });
        return;
      }
      const res = await api.get("/cart");
      let count = 0;
      if (res.data && res.data.itemsByShop) {
        Object.values(res.data.itemsByShop).forEach((shopItems: any) => {
          count += shopItems.reduce((acc: number, item: any) => acc + item.quantity, 0);
        });
      }
      set({ itemCount: count });
    } catch (error) {
      console.error("Failed to fetch cart", error);
      set({ itemCount: 0 });
    }
  }
}));
