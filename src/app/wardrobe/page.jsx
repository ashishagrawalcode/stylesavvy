"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Shirt, Search, Plus, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Wardrobe() {
  const [activeCategory, setActiveCategory] = useState("Tops");

  // Mock Inventory Data
  const inventory = [
    { id: 1, name: "Oversized Graphic Tee", category: "Tops", color: "bg-zinc-800" },
    { id: 2, name: "Ribbed Knit Sweater", category: "Tops", color: "bg-stone-300" },
    { id: 3, name: "Vintage Denim Jacket", category: "Tops", color: "bg-blue-900" },
    { id: 4, name: "Wide Leg Cargos", category: "Bottoms", color: "bg-green-900" },
    { id: 5, name: "Tailored Trousers", category: "Bottoms", color: "bg-zinc-900" },
    { id: 6, name: "Chunky Sneakers", category: "Shoes", color: "bg-white" },
  ];

  const categories = ["All", "Tops", "Bottoms", "Shoes", "Accessories"];

  const filteredInventory = activeCategory === "All" 
    ? inventory 
    : inventory.filter(item => item.category === activeCategory);

  return (
    <div className="max-w-[1400px] mx-auto px-6 min-h-[85vh] flex flex-col md:flex-row gap-8">
      
      {/* LEFT PANEL: The Inventory */}
      <motion.div 
        initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} 
        className="w-full md:w-1/3 glass-panel rounded-3xl p-6 flex flex-col h-[80vh]"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shirt className="text-purple-400" /> My Closet
          </h2>
          <button className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition">
            <Plus size={20} />
          </button>
        </div>

        {/* Search & Filter */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
          <input 
            type="text" 
            placeholder="Search items..." 
            className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white outline-none focus:border-cyan-500/50 transition"
          />
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide mb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all",
                activeCategory === cat ? "bg-white text-black" : "bg-white/5 text-zinc-400 hover:text-white"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Draggable Items Grid */}
        <div className="flex-1 overflow-y-auto pr-2 grid grid-cols-2 gap-4 pb-4">
          {filteredInventory.map((item) => (
            <motion.div
              key={item.id}
              drag
              dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
              dragElastic={0.2}
              whileDrag={{ scale: 1.1, zIndex: 50, cursor: "grabbing" }}
              className="glass-panel p-4 rounded-2xl aspect-square flex flex-col justify-end relative cursor-grab hover:border-purple-500/30 transition group"
            >
              {/* Fake visual representation of the clothing item */}
              <div className={`absolute inset-4 rounded-xl opacity-80 ${item.color} group-hover:opacity-100 transition`} />
              <p className="text-xs font-medium z-10 text-white drop-shadow-md">{item.name}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* RIGHT PANEL: The Mixing Canvas */}
      <motion.div 
        initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
        className="w-full md:w-2/3 glass-panel rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between border border-dashed border-white/20 h-[80vh]"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-96 border border-white/5 rounded-[40px] flex items-center justify-center pointer-events-none">
          <p className="text-zinc-600 font-medium tracking-widest uppercase text-sm">Drag items here</p>
        </div>

        <div className="flex justify-between items-center z-10">
          <h2 className="text-xl font-semibold">Outfit Builder</h2>
          <button className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition">
            <RotateCcw size={14} /> Reset Canvas
          </button>
        </div>

        <div className="flex justify-end z-10">
          <button className="px-6 py-3 bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-semibold rounded-full shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:scale-105 transition">
            Save Outfit
          </button>
        </div>
      </motion.div>

    </div>
  );
}