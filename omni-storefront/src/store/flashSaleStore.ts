import { create } from "zustand";
import api from "@/lib/axios";

export interface FlashSaleItem {
  id: string;
  productId: string;
  skuId: string;
  flashPrice: number;
  originalPrice: number;
  flashStock: number;
  soldCount: number;
  maxQuantityPerUser: number;
}

export interface FlashSaleEvent {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  status: string;
  items: FlashSaleItem[];
}

interface FlashSaleState {
  activeEvent: FlashSaleEvent | null;
  loading: boolean;
  fetchActiveEvent: () => Promise<void>;
  getFlashSaleItem: (productId: string) => FlashSaleItem | undefined;
}

export const useFlashSaleStore = create<FlashSaleState>((set, get) => ({
  activeEvent: null,
  loading: false,
  fetchActiveEvent: async () => {
    set({ loading: true });
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'}/public/flash-sale/active?t=${Date.now()}`);
      if (res.status === 204) {
        set({ activeEvent: null, loading: false });
        return;
      }
      const data = await res.json();
      set({ activeEvent: data, loading: false });
    } catch (e) {
      console.error("Failed to fetch flash sale event:", e);
      set({ activeEvent: null, loading: false });
    }
  },
  getFlashSaleItem: (productId: string) => {
    const { activeEvent } = get();
    if (!activeEvent || !activeEvent.items) return undefined;
    return activeEvent.items.find((item) => item.productId === productId && item.flashStock > item.soldCount);
  },
}));
