"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shirt, Search, Plus, RotateCcw, SlidersHorizontal, Download, Sparkles } from "lucide-react";
import { cn } from "../../lib/utils"; // Adjust path if your utils are elsewhere

// ============================================================================
// MOCK DATA (Premium Naming)
// ============================================================================
const MOCK_INVENTORY = [
  { id: 1, name: "Obsidian Structured Tee", category: "Tops", color: "bg-[#111111]" },
  { id: 2, name: "Cashmere Ribbed Knit", category: "Tops", color: "bg-[#d4d4d8]" },
  { id: 3, name: "Vintage Selvedge Jacket", category: "Tops", color: "bg-[#1e3a8a]" },
  { id: 4, name: "Architectural Cargos", category: "Bottoms", color: "bg-[#14532d]" },
  { id: 5, name: "Wool Trousers", category: "Bottoms", color: "bg-[#0a0a0a]" },
  { id: 6, name: "Platform Derbies", category: "Shoes", color: "bg-[#e5e5e5]" },
  { id: 7, name: "Silk Camp Collar", category: "Tops", color: "bg-[#0f766e]" },
  { id: 8, name: "Distressed Denim", category: "Bottoms", color: "bg-[#3b82f6]" },
];

const CATEGORIES = ["All", "Tops", "Bottoms", "Shoes", "Accessories"];

// ============================================================================
// MAIN WARDROBE COMPONENT
// ============================================================================
export default function Wardrobe() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const canvasRef = useRef(null); // Reference for drag boundaries

  // Filter Logic
  const filteredInventory = MOCK_INVENTORY.filter(item => {
    const matchesCategory = activeCategory === "All" || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <main className="w-full min-h-screen pt-32 pb-12 px-6 max-w-[1600px] mx-auto flex flex-col xl:flex-row gap-8">
      
      {/* =======================================================================
          LEFT PANEL: THE INVENTORY
          ======================================================================= */}
      <motion.div 
        initial={{ opacity: 0, x: -40 }} 
        animate={{ opacity: 1, x: 0 }} 
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full xl:w-1/3 glass-pill rounded-[2.5rem] p-8 flex flex-col h-[80vh] border border-white/5 relative overflow-hidden"
      >
        {/* Subtle Background Glow */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-purple-500/10 to-transparent pointer-events-none" />

        {/* Header */}
        <div className="flex justify-between items-center mb-8 relative z-10">
          <div>
            <h1 className="font-serif text-3xl text-white mb-1">Digital Closet</h1>
            <p className="font-sans text-xs text-[#888888] tracking-widest uppercase">{MOCK_INVENTORY.length} Items Indexed</p>
          </div>
          <button className="w-12 h-12 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-white hover:bg-white hover:text-black transition-colors duration-300">
            <Plus size={20} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6 z-10 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#666666] group-focus-within:text-cyan-400 transition-colors" size={18} />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search assets..." 
            className="w-full bg-[#0a0a0a]/50 border border-white/10 rounded-2xl pl-12 pr-12 py-4 text-sm text-white outline-none focus:border-cyan-500/50 transition-colors placeholder:text-[#555555] font-sans"
          />
          <button className="absolute right-4 top-1/2 -translate-y-1/2 text-[#666666] hover:text-white transition-colors">
            <SlidersHorizontal size={18} />
          </button>
        </div>

        {/* Category Selector (Scrollable) */}
        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide mb-4 z-10 mask-fade-edges">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-5 py-2 rounded-full font-sans text-xs font-semibold tracking-wider whitespace-nowrap transition-all duration-300",
                activeCategory === cat 
                  ? "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]" 
                  : "bg-transparent text-[#888888] border border-white/10 hover:border-white/30 hover:text-white"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Draggable Items Grid */}
        <div className="flex-1 overflow-y-auto pr-2 grid grid-cols-2 gap-4 pb-4 z-10">
          <AnimatePresence>
            {filteredInventory.map((item) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                key={item.id}
                drag
                dragConstraints={canvasRef} // Allows dragging over to the right panel
                dragElastic={0.1}
                dragSnapToOrigin // Snaps back if dropped outside
                whileDrag={{ scale: 1.1, zIndex: 50, cursor: "grabbing" }}
                className="bg-[#050505] border border-white/5 p-4 rounded-[1.5rem] aspect-square flex flex-col justify-end relative cursor-grab hover:border-cyan-500/30 transition-colors group overflow-hidden"
              >
                {/* 3D-ish Base for Clothes */}
                <div className={`absolute inset-4 rounded-xl opacity-80 ${item.color} group-hover:scale-105 transition-transform duration-500 shadow-inner`} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                
                <p className="font-sans text-[10px] uppercase tracking-widest font-semibold z-10 text-white truncate">{item.name}</p>
                <p className="font-sans text-[9px] text-[#888888] z-10">{item.category}</p>
              </motion.div>
            ))}
          </AnimatePresence>
          {filteredInventory.length === 0 && (
            <div className="col-span-2 h-full flex flex-col items-center justify-center text-[#555555]">
               <Search size={32} className="mb-4 opacity-50" />
               <p className="font-sans text-sm tracking-widest uppercase">No assets found</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* =======================================================================
          RIGHT PANEL: THE MIXING CANVAS
          ======================================================================= */}
      <motion.div 
        ref={canvasRef}
        initial={{ opacity: 0, x: 40 }} 
        animate={{ opacity: 1, x: 0 }} 
        transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="w-full xl:w-2/3 glass-pill rounded-[2.5rem] p-8 relative overflow-hidden flex flex-col justify-between border border-white/5 h-[80vh]"
      >
        {/* Blueprint Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px]" />
        
        {/* Center Drop Zone Placeholder */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-[30rem] border-2 border-dashed border-white/10 rounded-[3rem] flex flex-col items-center justify-center pointer-events-none group">
          <div className="w-full h-full absolute inset-0 bg-cyan-500/5 blur-[100px] rounded-[3rem] group-hover:bg-cyan-500/10 transition-colors" />
          <Shirt size={48} className="text-white/10 mb-4" />
          <p className="font-sans text-[#666666] font-semibold tracking-widest uppercase text-xs text-center px-8">
            Drag assets here to synthesize outfit
          </p>
        </div>

        {/* Top Action Bar */}
        <div className="flex justify-between items-center z-10">
          <div>
            <h2 className="font-serif text-3xl text-white">Canvas <span className="italic text-cyan-400">01</span></h2>
          </div>
          <button className="flex items-center gap-2 text-xs font-sans tracking-widest uppercase text-[#888888] hover:text-white transition-colors border border-white/10 px-4 py-2 rounded-full bg-white/5 backdrop-blur-md">
            <RotateCcw size={14} /> Clear Board
          </button>
        </div>

        {/* Bottom Floating Action Bar */}
        <div className="flex justify-end items-center z-10">
          <div className="glass flex items-center gap-4 p-2 rounded-full border border-white/10 bg-[#0a0a0a]/80 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
            <button className="w-12 h-12 flex items-center justify-center rounded-full text-[#888888] hover:text-white hover:bg-white/5 transition-colors">
              <Download size={18} />
            </button>
            <div className="w-px h-8 bg-white/10" />
            <button className="px-8 py-3 bg-white text-black font-sans text-sm font-bold tracking-widest uppercase rounded-full shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:scale-105 transition-transform flex items-center gap-2">
              <Sparkles size={16} className="text-purple-500" /> Synthesize
            </button>
          </div>
        </div>
      </motion.div>

    </main>
  );
}