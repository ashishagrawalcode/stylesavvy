"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Shirt,
  Calendar,
  Heart,
  ArrowUpRight,
  TrendingUp,
  Zap,
  ChevronRight,
  MoreHorizontal,
  Plus,
} from "lucide-react";

/* ── animation helpers ── */
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] },
});

const fadeScale = (delay = 0) => ({
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] },
});

/* ── data ── */
const stats = [
  {
    label: "Wardrobe Items",
    value: "42",
    delta: "+6 this week",
    icon: Shirt,
    accent: "#9b59ff",
    accentBg: "rgba(155,89,255,0.1)",
  },
  {
    label: "Outfits Generated",
    value: "18",
    delta: "+3 today",
    icon: Zap,
    accent: "#06b6d4",
    accentBg: "rgba(6,182,212,0.1)",
  },
  {
    label: "Saved Looks",
    value: "7",
    delta: "All time",
    icon: Heart,
    accent: "#f472b6",
    accentBg: "rgba(244,114,182,0.1)",
  },
  {
    label: "Style Score",
    value: "94",
    delta: "↑ 12 pts",
    icon: TrendingUp,
    accent: "#10b981",
    accentBg: "rgba(16,185,129,0.1)",
  },
];

const recentOutfits = [
  { id: 1, name: "Casual Friday", items: 3, mood: "Relaxed", color: "from-zinc-800 to-zinc-900" },
  { id: 2, name: "Board Meeting", items: 4, mood: "Sharp", color: "from-slate-800 to-slate-900" },
  { id: 3, name: "Night Out", items: 5, mood: "Elevated", color: "from-purple-950 to-zinc-900" },
  { id: 4, name: "Weekend Brunch", items: 3, mood: "Effortless", color: "from-stone-800 to-stone-900" },
];

const trendAlerts = [
  { text: "Quiet Luxury dominates SS25", tag: "Trending", color: "#9b59ff" },
  { text: "Oversized blazers returning", tag: "New", color: "#06b6d4" },
  { text: "Your olive palette is peak right now", tag: "Personal", color: "#10b981" },
];

export default function Dashboard() {
  const [hoveredStat, setHoveredStat] = useState(null);
  const [hoveredOutfit, setHoveredOutfit] = useState(null);

  return (
    <div
      className="min-h-screen relative"
      style={{ background: "#050505", fontFamily: "'Inter', sans-serif" }}
    >
      {/* Ambient background glow */}
      <div
        className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2"
        style={{
          width: "60vw",
          height: "40vh",
          background:
            "radial-gradient(ellipse, rgba(155,89,255,0.03) 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-10 pb-20">

        {/* ── Header ── */}
        <motion.div {...fadeUp(0)} className="flex items-start justify-between mb-12">
          <div>
            <p
              className="text-[11px] uppercase tracking-[0.15em] mb-3"
              style={{ color: "#444", fontWeight: 500 }}
            >
              Good morning
            </p>
            <h1
              className="text-4xl md:text-5xl tracking-tight leading-none mb-3"
              style={{ color: "#ffffff", fontWeight: 700 }}
            >
              Your{" "}
              <span
                style={{
                  background: "linear-gradient(135deg, #ffffff 0%, #aaaaaa 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Dashboard
              </span>
            </h1>
            <p className="text-sm tracking-wide" style={{ color: "#666", fontWeight: 400 }}>
              Style geometry tuned to:{" "}
              <span style={{ color: "#b0b0b0", fontWeight: 500 }}>
                Athletic Build, Deep Winter
              </span>
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-full text-sm"
            style={{
              background: "#ffffff",
              color: "#000",
              fontWeight: 500,
              border: "none",
              cursor: "pointer",
            }}
          >
            <Plus size={14} />
            Add Item
          </motion.button>
        </motion.div>

        {/* ── Stats Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              {...fadeScale(0.05 * i)}
              onMouseEnter={() => setHoveredStat(i)}
              onMouseLeave={() => setHoveredStat(null)}
              className="relative rounded-2xl p-5 overflow-hidden cursor-default group"
              style={{
                background: "linear-gradient(180deg, rgba(20,20,24,0.4) 0%, rgba(10,10,14,0.4) 100%)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                border: hoveredStat === i
                  ? `1px solid ${stat.accent}33`
                  : "1px solid rgba(255,255,255,0.04)",
                boxShadow: hoveredStat === i
                  ? `0 0 30px ${stat.accent}15, inset 0 1px 0 rgba(255,255,255,0.03)`
                  : "inset 0 1px 0 rgba(255,255,255,0.02)",
                transition: "all 0.4s ease",
              }}
            >
              {/* subtle gradient overlay on hover */}
              <div
                className="absolute inset-0 rounded-2xl transition-opacity duration-300"
                style={{
                  background: `radial-gradient(circle at top left, ${stat.accent}08 0%, transparent 60%)`,
                  opacity: hoveredStat === i ? 1 : 0,
                }}
              />

              <div className="relative flex items-start justify-between">
                <div>
                  <p
                    className="text-[11px] uppercase tracking-[0.1em] mb-3"
                    style={{ color: "#555", fontWeight: 500 }}
                  >
                    {stat.label}
                  </p>
                  <p
                    className="text-4xl leading-none mb-2"
                    style={{ color: "#f0f0f0", fontWeight: 600 }}
                  >
                    {stat.value}
                  </p>
                  <p className="text-xs" style={{ color: "#555" }}>
                    {stat.delta}
                  </p>
                </div>
                <div
                  className="p-2.5 rounded-xl"
                  style={{ background: stat.accentBg }}
                >
                  <stat.icon size={18} style={{ color: stat.accent }} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── Trend Ticker ── */}
        <motion.div
          {...fadeUp(0.2)}
          className="flex items-center gap-4 rounded-2xl px-5 py-3.5 mb-8 overflow-x-auto scrollbar-hide"
          style={{
            background: "linear-gradient(90deg, rgba(20,20,24,0.3) 0%, rgba(10,10,14,0.3) 100%)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.04)",
          }}
        >
          <span
            className="text-[10px] uppercase tracking-[0.15em] shrink-0"
            style={{ color: "#444", fontWeight: 500 }}
          >
            Trend Radar
          </span>
          <div className="w-px h-4 shrink-0" style={{ background: "rgba(255,255,255,0.08)" }} />
          <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide">
            {trendAlerts.map((alert, i) => (
              <div key={i} className="flex items-center gap-2 shrink-0">
                <span
                  className="text-[10px] px-2 py-0.5 rounded-full"
                  style={{
                    background: `${alert.color}18`,
                    color: alert.color,
                    fontWeight: 500,
                    border: `1px solid ${alert.color}30`,
                  }}
                >
                  {alert.tag}
                </span>
                <span className="text-xs" style={{ color: "#888" }}>
                  {alert.text}
                </span>
                {i < trendAlerts.length - 1 && (
                  <span style={{ color: "#333", fontSize: 10, marginLeft: 4 }}>•</span>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Main content row ── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* Recent Looks — takes 2/3 */}
          <motion.div {...fadeUp(0.25)} className="xl:col-span-2">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg" style={{ color: "#e0e0e0", fontWeight: 500 }}>
                Recently Generated Looks
              </h2>
              <button
                className="flex items-center gap-1.5 text-xs transition-colors"
                style={{ color: "#06b6d4", fontWeight: 400 }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#38d4ee")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#06b6d4")}
              >
                View All
                <ArrowUpRight size={13} />
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {recentOutfits.map((outfit, i) => (
                <motion.div
                  key={outfit.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.07, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  onMouseEnter={() => setHoveredOutfit(i)}
                  onMouseLeave={() => setHoveredOutfit(null)}
                  className="relative rounded-2xl overflow-hidden cursor-pointer group"
                  style={{ aspectRatio: "3/4" }}
                >
                  {/* Background */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${outfit.color} transition-transform duration-500`}
                    style={{
                      transform: hoveredOutfit === i ? "scale(1.04)" : "scale(1)",
                    }}
                  />

                  {/* Noise texture */}
                  <div
                    className="absolute inset-0 opacity-30"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.1'/%3E%3C/svg%3E")`,
                    }}
                  />

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                  {/* More button */}
                  <div
                    className="absolute top-3 right-3 p-1.5 rounded-full transition-all duration-200"
                    style={{
                      background: "rgba(0,0,0,0.4)",
                      backdropFilter: "blur(8px)",
                      opacity: hoveredOutfit === i ? 1 : 0,
                      transform: hoveredOutfit === i ? "scale(1)" : "scale(0.8)",
                    }}
                  >
                    <MoreHorizontal size={13} style={{ color: "#fff" }} />
                  </div>

                  {/* Info */}
                  <div className="absolute bottom-4 left-4 right-4 z-10">
                    <p
                      className="text-sm leading-tight mb-0.5"
                      style={{ color: "#f0f0f0", fontWeight: 500 }}
                    >
                      {outfit.name}
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="text-xs" style={{ color: "#888" }}>
                        {outfit.items} items
                      </p>
                      <span style={{ color: "#444", fontSize: 8 }}>•</span>
                      <p className="text-xs" style={{ color: "#888" }}>
                        {outfit.mood}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Style Profile — takes 1/3 */}
          <motion.div {...fadeUp(0.3)}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg" style={{ color: "#e0e0e0", fontWeight: 500 }}>
                Style Profile
              </h2>
              <button
                className="p-1 rounded-lg transition-colors"
                style={{ color: "#444" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#888")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#444")}
              >
                <MoreHorizontal size={16} />
              </button>
            </div>

            <div
              className="rounded-2xl p-5 h-full"
              style={{
                background: "linear-gradient(180deg, rgba(20,20,24,0.4) 0%, rgba(10,10,14,0.4) 100%)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                border: "1px solid rgba(255,255,255,0.04)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.02)",
              }}
            >
              {/* Avatar */}
              <div className="flex items-center gap-3 mb-6 pb-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold"
                  style={{
                    background: "linear-gradient(135deg, #9b59ff, #06b6d4)",
                    color: "#fff",
                  }}
                >
                  AS
                </div>
                <div>
                  <p className="text-sm" style={{ color: "#e0e0e0", fontWeight: 500 }}>
                    Alex S.
                  </p>
                  <p className="text-xs" style={{ color: "#555" }}>
                    Member since Jan 2025
                  </p>
                </div>
              </div>

              {/* Attributes */}
              {[
                { label: "Build", value: "Athletic" },
                { label: "Season", value: "Deep Winter" },
                { label: "Fit Pref", value: "Tailored" },
                { label: "Palette", value: "Cool Neutrals" },
              ].map((attr, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-3"
                  style={{
                    borderBottom: i < 3 ? "1px solid rgba(255,255,255,0.04)" : "none",
                  }}
                >
                  <span className="text-xs" style={{ color: "#555" }}>
                    {attr.label}
                  </span>
                  <span className="text-xs" style={{ color: "#c0c0c0", fontWeight: 500 }}>
                    {attr.value}
                  </span>
                </div>
              ))}

              {/* CTA */}
              <button
                className="w-full mt-5 flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-all duration-200"
                style={{
                  background: "rgba(155,89,255,0.1)",
                  border: "1px solid rgba(155,89,255,0.2)",
                  color: "#c084fc",
                  fontWeight: 400,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(155,89,255,0.15)";
                  e.currentTarget.style.borderColor = "rgba(155,89,255,0.35)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(155,89,255,0.1)";
                  e.currentTarget.style.borderColor = "rgba(155,89,255,0.2)";
                }}
              >
                Update Style Profile
                <ChevronRight size={14} />
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}