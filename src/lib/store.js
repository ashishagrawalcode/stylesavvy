import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useStyleStore = create(
  persist(
    (set) => ({
      // ── AUTH ──────────────────────────────────────────────────────────────
      user: null,
      isAuthLoading: false,
      setUser: (user) => set({ user, isAuthLoading: false }),
      clearUser: () => set({ user: null, isAuthLoading: false }),

      // ── STYLE PROFILE (synced from Firestore) ─────────────────────────────
      profile: {
        height: "",
        bodyShape: "",
        skinUndertone: "",
        styleVibe: "Minimalist",
        fitPreference: "Tailored",
        gender: "",
      },
      updateProfile: (newProfile) => set((state) => ({
        profile: { ...state.profile, ...newProfile }
      })),

      // ── DIGITAL WARDROBE (synced from Firestore, not hardcoded) ───────────
      inventory: [],
      setInventory: (items) => set({ inventory: items }),
      addItem: (item) => set((state) => ({
        inventory: [...state.inventory, item]
      })),
      removeItem: (id) => set((state) => ({
        inventory: state.inventory.filter(i => i.id !== id)
      })),

      // ── CHAT HISTORY ──────────────────────────────────────────────────────
      chatHistory: [],
      addMessage: (message) => set((state) => ({
        chatHistory: [...state.chatHistory, message]
      })),
      clearChat: () => set({ chatHistory: [] }),
    }),
    {
      name: 'stylesavvy-storage',
      // Only persist auth and profile — wardrobe comes from Firestore live
      partialize: (state) => ({
        user: state.user,
        profile: state.profile,
      }),
    }
  )
);