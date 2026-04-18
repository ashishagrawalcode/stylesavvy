import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useStyleStore = create(
  persist(
    (set) => ({
      // --- AUTHENTICATION (Mocked for now) ---
      user: { uid: "local-dev-user", name: "Guest" }, 
      isAuthLoading: false,
      setUser: (user) => set({ user, isAuthLoading: false }),
      clearUser: () => set({ user: null, isAuthLoading: false }),

      // --- STYLE PROFILE ---
      profile: {
        height: "",
        bodyShape: "",
        skinUndertone: "",
        styleVibe: "Minimalist",
      },
      updateProfile: (newProfile) => set((state) => ({ 
        profile: { ...state.profile, ...newProfile } 
      })),

      // --- DIGITAL WARDROBE ---
      inventory: [
        { id: 1, name: "Obsidian Structured Tee", category: "Tops", color: "bg-[#111111]" },
        { id: 2, name: "Architectural Cargos", category: "Bottoms", color: "bg-[#14532d]" },
      ],
      setInventory: (items) => set({ inventory: items }),
      addItem: (item) => set((state) => ({ 
        inventory: [...state.inventory, item] 
      })),

      // --- CHAT HISTORY ---
      chatHistory: [
        { role: "assistant", content: "System initialized in Local Mode. Waiting for Neural Link (API Keys)." }
      ],
      addMessage: (message) => set((state) => ({ 
        chatHistory: [...state.chatHistory, message] 
      })),
    }),
    {
      name: 'stylesavvy-storage', // The name of the backup in localStorage
    }
  )
);