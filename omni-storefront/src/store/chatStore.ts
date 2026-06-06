import { create } from 'zustand';

interface ChatState {
  isWidgetOpen: boolean;
  activeRoomId: string | null;
  contextMessage: string | null;
  toggleWidget: () => void;
  openWidget: () => void;
  closeWidget: () => void;
  setActiveRoom: (roomId: string | null) => void;
  startChatWithShop: (roomId: string, message?: string) => void;
  reset: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  isWidgetOpen: false,
  activeRoomId: null,
  contextMessage: null,
  toggleWidget: () => set((state) => ({ isWidgetOpen: !state.isWidgetOpen })),
  openWidget: () => set({ isWidgetOpen: true }),
  closeWidget: () => set({ isWidgetOpen: false }),
  setActiveRoom: (roomId) => set({ activeRoomId: roomId }),
  startChatWithShop: (roomId, message) => set({ 
    isWidgetOpen: true, 
    activeRoomId: roomId,
    contextMessage: message || null
  }),
  reset: () => set({
    isWidgetOpen: false,
    activeRoomId: null,
    contextMessage: null,
  }),
}));
