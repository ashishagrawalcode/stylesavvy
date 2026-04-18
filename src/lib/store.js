import { create } from 'zustand';

export const useStyleStore = create((set) => ({
  // 1. User's Geometric Profile
  profile: {
    height: "",
    bodyShape: "",
    skinUndertone: "",
    styleVibe: "Minimalist",
  },
  updateProfile: (newProfile) => set((state) => ({ profile: { ...state.profile, ...newProfile } })),

  // 2. Digital Wardrobe
  inventory: [
    { id: 1, name: "Obsidian Structured Tee", category: "Tops", color: "bg-[#111111]" },
    { id: 2, name: "Architectural Cargos", category: "Bottoms", color: "bg-[#14532d]" },
  ],
  addItem: (item) => set((state) => ({ inventory: [...state.inventory, item] })),

  // 3. AI Chat History
  chatHistory: [
    { role: "assistant", content: "System initialized. How can I optimize your aesthetic today?" }
  ],
  addMessage: (message) => set((state) => ({ chatHistory: [...state.chatHistory, message] })),
}));