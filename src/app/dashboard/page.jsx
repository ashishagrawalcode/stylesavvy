"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Shirt, Heart, Zap, TrendingUp, ArrowUpRight, Plus,
  ChevronRight, Sparkles, ShoppingBag, Users, Star,
  MoreHorizontal, ExternalLink, Loader2, RefreshCw,
  Calendar, Clock, Package, Palette, Info
} from "lucide-react";
import { useStyleStore } from "../../lib/store";
import { db } from "../../lib/firebase";
import {
  doc, onSnapshot, collection, query,
  orderBy, limit, getDoc, updateDoc, serverTimestamp,
} from "firebase/firestore";

/* ── animation helpers ── */
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] },
});

/* ── animated counter ── */
function AnimatedNumber({ value }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = parseInt(value) || 0;
    if (start === end) { setDisplay(end); return; }
    const step = Math.ceil(end / 20);
    const timer = setInterval(() => {
      start = Math.min(start + step, end);
      setDisplay(start);
      if (start >= end) clearInterval(timer);
    }, 40);
    return () => clearInterval(timer);
  }, [value]);
  return <span>{display}</span>;
}

/* ── stat card ── */
function StatCard({ label, value, delta, icon: Icon, accent, accentBg, loading }) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative rounded-2xl p-5 overflow-hidden cursor-default"
      style={{
        background: "linear-gradient(180deg,rgba(20,20,28,0.5) 0%,rgba(10,10,18,0.5) 100%)",
        backdropFilter: "blur(20px)",
        border: hovered ? `1px solid ${accent}33` : "1px solid rgba(255,255,255,0.05)",
        boxShadow: hovered ? `0 0 30px ${accent}12` : "none",
        transition: "all 0.35s ease",
      }}
    >
      <div
        className="absolute inset-0 rounded-2xl transition-opacity duration-500"
        style={{
          background: `radial-gradient(circle at top left,${accentBg} 0%,transparent 60%)`,
          opacity: hovered ? 1 : 0,
        }}
      />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.12em] mb-3" style={{ color: "#555", fontWeight: 500 }}>{label}</p>
          <p className="text-4xl leading-none mb-1.5" style={{ color: "#f5f5f5", fontWeight: 700 }}>
            {loading ? <Loader2 size={24} className="animate-spin" style={{ color: "#555" }} /> : <AnimatedNumber value={value} />}
          </p>
          <p className="text-xs" style={{ color: "#555" }}>{delta}</p>
        </div>
        <div className="p-2.5 rounded-xl" style={{ background: accentBg }}>
          <Icon size={18} style={{ color: accent }} />
        </div>
      </div>
    </motion.div>
  );
}

/* ── outfit card placeholder ── */
function OutfitCard({ outfit, index }) {
  const [hovered, setHovered] = useState(false);
  const colors = [
    "from-purple-950 to-zinc-900",
    "from-zinc-800 to-zinc-900",
    "from-slate-800 to-slate-900",
    "from-stone-800 to-stone-900",
  ];
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 + index * 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative rounded-2xl overflow-hidden cursor-pointer group"
      style={{ aspectRatio: "3/4" }}
    >
      <div
        className={`absolute inset-0 bg-gradient-to-br ${colors[index % colors.length]} transition-transform duration-500`}
        style={{ transform: hovered ? "scale(1.04)" : "scale(1)" }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
      <div
        className="absolute top-3 right-3 p-1.5 rounded-full transition-all duration-200"
        style={{
          background: "rgba(0,0,0,0.4)",
          backdropFilter: "blur(8px)",
          opacity: hovered ? 1 : 0,
          transform: hovered ? "scale(1)" : "scale(0.8)",
        }}
      >
        <ExternalLink size={11} style={{ color: "#fff" }} />
      </div>
      <div className="absolute bottom-4 left-4 right-4 z-10">
        <p className="text-sm leading-tight mb-0.5" style={{ color: "#f0f0f0", fontWeight: 500 }}>{outfit.name}</p>
        <div className="flex items-center gap-2">
          <p className="text-xs" style={{ color: "#888" }}>{outfit.itemCount || 0} items</p>
          {outfit.aesthetic && (
            <>
              <span style={{ color: "#444", fontSize: 8 }}>•</span>
              <p className="text-xs" style={{ color: "#888" }}>{outfit.aesthetic}</p>
            </>
          )}
        </div>
        {outfit.score && (
          <div className="mt-1 flex items-center gap-1">
            <Star size={9} style={{ color: "#f59e0b" }} />
            <span className="text-[10px]" style={{ color: "#f59e0b" }}>{outfit.score}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   MAIN DASHBOARD
════════════════════════════════════════════════════════════════════════════ */
export default function Dashboard() {
  const router = useRouter();
  const { user, setInventory } = useStyleStore();

  const [userData,      setUserData]      = useState(null);
  const [wardrobe,      setWardrobe]      = useState([]);
  const [wishlist,      setWishlist]      = useState([]);
  const [outfits,       setOutfits]       = useState([]);
  const [loading,       setLoading]       = useState(true);

  // ── Firestore realtime listeners ─────────────────────────────────────────
  useEffect(() => {
    if (!user?.uid || !db) { setLoading(false); return; }

    const uid = user.uid;
    const unsubs = [];

    // 1. User profile doc
    unsubs.push(onSnapshot(doc(db, "users", uid), snap => {
      if (snap.exists()) setUserData(snap.data());
      setLoading(false);
    }, () => setLoading(false)));

    // 2. Wardrobe collection
    unsubs.push(onSnapshot(
      query(collection(db, "users", uid, "wardrobe"), orderBy("createdAt", "desc")),
      snap => {
        const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setWardrobe(items);
        setInventory(items); // Sync to Zustand for chatbot context
      }
    ));

    // 3. Wishlist collection
    unsubs.push(onSnapshot(
      collection(db, "users", uid, "wishlist"),
      snap => setWishlist(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    ));

    // 4. Outfits collection (generated looks)
    unsubs.push(onSnapshot(
      query(collection(db, "users", uid, "outfits"), orderBy("createdAt", "desc"), limit(4)),
      snap => setOutfits(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    ));

    return () => unsubs.forEach(u => u());
  }, [user?.uid, setInventory]);

  // ── Derived data ──────────────────────────────────────────────────────────
  const styleDNA = userData?.styleDNA || {};
  const analysis = userData?.styleAnalysis;
  
  const displayName = userData?.displayName || user?.displayName || "Stylist";
  const firstName = displayName.split(" ")[0];
  const initials = displayName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  const memberSince = userData?.createdAt?.toDate?.()?.toLocaleDateString("en-IN", { month: "short", year: "numeric" }) || "Recently";
  const profileComplete = [styleDNA.bodyType, styleDNA.skinTone, styleDNA.gender, styleDNA.vibes?.length].filter(Boolean).length;
  const profilePct = Math.round((profileComplete / 4) * 100);
  const styleScore = Math.min(98, 60 + wardrobe.length * 2 + profileComplete * 4 + outfits.length);

  const stats = [
    { label: "Wardrobe Items", value: wardrobe.length, delta: wardrobe.length > 0 ? `${wardrobe.length} pieces synced` : "Add your first item", icon: Shirt, accent: "#9b59ff", accentBg: "rgba(155,89,255,0.1)" },
    { label: "Outfits Generated", value: outfits.length, delta: outfits.length > 0 ? "Realtime from AI" : "Generate in RoomSpace", icon: Zap, accent: "#06b6d4", accentBg: "rgba(6,182,212,0.1)" },
    { label: "Wishlist Items", value: wishlist.length, delta: wishlist.length > 0 ? "Across stores" : "Save from any store", icon: Heart, accent: "#f472b6", accentBg: "rgba(244,114,182,0.1)" },
    { label: "Style Score", value: styleScore, delta: `${profilePct}% profile complete`, icon: TrendingUp, accent: "#10b981", accentBg: "rgba(16,185,129,0.1)" },
  ];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 rounded-full animate-spin" style={{ border: "2px solid rgba(155,89,255,0.2)", borderTopColor: "#9b59ff" }} />
        <p className="text-xs uppercase tracking-widest" style={{ color: "#555" }}>Loading your dashboard…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Ambient */}
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[60vw] h-[40vh]"
        style={{ background: "radial-gradient(ellipse,rgba(155,89,255,0.04) 0%,transparent 70%)", filter: "blur(80px)" }} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* ── Header ── */}
        <motion.div {...fadeUp(0)} className="flex items-start justify-between mb-10">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-bold text-white"
                style={{ background: "linear-gradient(135deg,#9b59ff,#06b6d4)", boxShadow: "0 0 24px rgba(155,89,255,0.3)" }}>
                {initials}
              </div>
              {/* Profile ring */}
              <svg className="absolute -inset-1 w-16 h-16" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="29" fill="none" stroke="rgba(155,89,255,0.15)" strokeWidth="2" />
                <circle cx="32" cy="32" r="29" fill="none" stroke="rgba(155,89,255,0.7)" strokeWidth="2"
                  strokeDasharray={`${(profilePct / 100) * 182} 182`}
                  strokeLinecap="round"
                  style={{ transform: "rotate(-90deg)", transformOrigin: "32px 32px" }}
                />
              </svg>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.15em] mb-0.5" style={{ color: "#444" }}>{greeting}</p>
              <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight" style={{ fontFamily: "'Playfair Display',serif" }}>
                {firstName}
              </h1>
              <p className="text-xs mt-0.5" style={{ color: "#555" }}>Member since {memberSince} · {profilePct}% profile complete</p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2">
            <Link href="/wardrobe"
              className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-colors"
              style={{ border: "1px solid rgba(255,255,255,0.07)", color: "#888" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.color = "#888"; }}>
              <Plus size={12} />Add Clothes
            </Link>
            <Link href="/roomspace"
              className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold text-white"
              style={{ background: "linear-gradient(135deg,#9b59ff,#06b6d4)", boxShadow: "0 4px 20px rgba(155,89,255,0.25)" }}>
              <Sparkles size={12} />Generate Outfit
            </Link>
          </div>
        </motion.div>

        {/* ── Stats Grid ── */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-6">
          {stats.map((s, i) => (
            <motion.div key={i} {...fadeUp(0.05 * i)}>
              <StatCard {...s} loading={false} />
            </motion.div>
          ))}
        </div>

        {/* ── Main grid ── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

          {/* Left Side: Recent Looks & Style Analysis */}
          <div className="xl:col-span-2 space-y-6">
            
            {/* Style Verdict (If analysis exists) */}
            {analysis && (
              <motion.div {...fadeUp(0.15)} className="rounded-3xl p-8 relative overflow-hidden"
                style={{ background: "linear-gradient(135deg,rgba(168,85,247,0.1),rgba(6,182,212,0.1))", border: "1px solid rgba(255,255,255,0.06)", backdropFilter: "blur(20px)" }}>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                       <Sparkles size={14} className="text-[#a855f7]" />
                       <span className="text-[10px] uppercase tracking-widest font-bold text-[#a855f7]">AI Style Verdict</span>
                    </div>
                    <Link href="/stylist" className="text-[10px] uppercase tracking-widest font-bold text-white/40 hover:text-white transition-colors">
                      Full Profile →
                    </Link>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "'Playfair Display',serif" }}>{analysis.styleArchetype}</h3>
                  <p className="text-sm leading-relaxed text-[#999] max-w-2xl italic">"{analysis.summary}"</p>
                  
                  <div className="mt-6 flex flex-wrap gap-4">
                    <div>
                      <p className="text-[9px] uppercase tracking-widest text-[#555] mb-2">Hero Palette</p>
                      <div className="flex gap-1.5">
                        {analysis.colorPalette?.hero?.map((c, i) => (
                          <div key={i} className="w-6 h-6 rounded-md shadow-sm border border-white/5" style={{ background: c }} />
                        ))}
                      </div>
                    </div>
                    <div className="h-10 w-px bg-white/5" />
                    <div>
                      <p className="text-[9px] uppercase tracking-widest text-[#555] mb-2">Key Material</p>
                      <p className="text-xs font-medium text-[#888]">{analysis.fabricRecommendations?.[0]} & {analysis.fabricRecommendations?.[1]}</p>
                    </div>
                  </div>
                </div>
                <div className="absolute top-0 right-0 p-6 opacity-5">
                   <Palette size={100} />
                </div>
              </motion.div>
            )}

            {/* Recent Looks */}
            <motion.div {...fadeUp(0.2)}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold" style={{ color: "#e0e0e0", fontFamily: "'Playfair Display',serif" }}>Recent Looks</h2>
                <Link href="/roomspace" className="flex items-center gap-1 text-xs transition-colors" style={{ color: "#06b6d4" }}
                  onMouseEnter={e => e.currentTarget.style.color = "#38d4ee"}
                  onMouseLeave={e => e.currentTarget.style.color = "#06b6d4"}>
                  Open RoomSpace <ArrowUpRight size={12} />
                </Link>
              </div>
              {outfits.length === 0 ? (
                <div className="rounded-2xl flex flex-col items-center justify-center py-16 text-center"
                  style={{ background: "rgba(14,14,22,0.5)", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <Zap size={28} style={{ color: "#333" }} className="mb-3" />
                  <p className="text-sm text-white font-medium mb-1">No outfits yet</p>
                  <p className="text-xs mb-4" style={{ color: "#555" }}>Head to RoomSpace to generate AI-curated looks</p>
                  <Link href="/roomspace" className="px-5 py-2 rounded-full text-xs font-semibold text-white"
                    style={{ background: "linear-gradient(135deg,#9b59ff,#06b6d4)" }}>
                    Start Styling
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {outfits.map((o, i) => <OutfitCard key={o.id} outfit={o} index={i} />)}
                </div>
              )}
            </motion.div>

          </div>

          {/* Right column: Style DNA & Quick Actions */}
          <div className="space-y-5">

            {/* Style DNA Card */}
            <motion.div {...fadeUp(0.25)}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold" style={{ color: "#e0e0e0", fontFamily: "'Playfair Display',serif" }}>Style DNA</h2>
                <Link href="/stylist" className="p-1.5 rounded-lg transition-colors" style={{ color: "#444" }}
                  onMouseEnter={e => e.currentTarget.style.color = "#888"}
                  onMouseLeave={e => e.currentTarget.style.color = "#444"}>
                  <ChevronRight size={14} />
                </Link>
              </div>
              <div className="rounded-2xl p-5"
                style={{ background: "linear-gradient(180deg,rgba(20,20,28,0.5) 0%,rgba(10,10,18,0.5) 100%)", border: "1px solid rgba(255,255,255,0.05)", backdropFilter: "blur(20px)" }}>
                
                <div className="flex items-center gap-3 mb-5 pb-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
                    style={{ background: "linear-gradient(135deg,#9b59ff,#06b6d4)" }}>{initials}</div>
                  <div>
                    <p className="text-sm text-white font-medium">{displayName}</p>
                    <p className="text-[10px]" style={{ color: "#555" }}>{user?.email}</p>
                  </div>
                </div>

                {[
                  { label: "Build",    value: styleDNA.bodyType  || "—" },
                  { label: "Skin",     value: styleDNA.skinTone  || "—" },
                  { label: "Gender",   value: styleDNA.gender    || "—" },
                  { label: "Height",   value: styleDNA.height ? `${styleDNA.height} cm` : "—" },
                  { label: "Fit Pref", value: styleDNA.fitPreference || "—" },
                ].map((a, i, arr) => (
                  <div key={i} className="flex items-center justify-between py-2.5"
                    style={{ borderBottom: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                    <span className="text-xs" style={{ color: "#555" }}>{a.label}</span>
                    <span className="text-xs font-medium" style={{ color: "#c0c0c0" }}>{a.value}</span>
                  </div>
                ))}

                <Link href="/stylist"
                  className="w-full mt-4 flex items-center justify-between px-4 py-3 rounded-xl text-xs transition-all duration-200"
                  style={{ background: "rgba(155,89,255,0.08)", border: "1px solid rgba(155,89,255,0.15)", color: "#c084fc" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(155,89,255,0.14)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(155,89,255,0.08)"; }}>
                  {profilePct < 100 ? "Complete Style Profile" : "Edit Style Profile"}
                  <ChevronRight size={13} />
                </Link>
              </div>
            </motion.div>

            {/* Quick actions */}
            <motion.div {...fadeUp(0.3)}>
              <h2 className="text-base font-semibold mb-4" style={{ color: "#e0e0e0", fontFamily: "'Playfair Display',serif" }}>Quick Actions</h2>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Wardrobe",  icon: Shirt,       href: "/wardrobe",  accent: "#9b59ff" },
                  { label: "RoomSpace", icon: Sparkles,    href: "/roomspace", accent: "#06b6d4" },
                  { label: "Shop",      icon: ShoppingBag, href: "/shop",      accent: "#f472b6" },
                  { label: "Stylist",   icon: Star,        href: "/stylist",   accent: "#10b981" },
                ].map(({ label, icon: Icon, href, accent }) => (
                  <Link key={label} href={href}
                    className="flex flex-col items-center justify-center gap-2 py-4 rounded-2xl transition-all duration-200 group"
                    style={{ background: "rgba(14,14,22,0.5)", border: "1px solid rgba(255,255,255,0.05)" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = `${accent}30`; e.currentTarget.style.background = `${accent}08`; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)"; e.currentTarget.style.background = "rgba(14,14,22,0.5)"; }}>
                    <Icon size={18} style={{ color: accent }} />
                    <span className="text-xs" style={{ color: "#888" }}>{label}</span>
                  </Link>
                ))}
              </div>
            </motion.div>

          </div>
        </div>

        {/* ── Wardrobe preview (if items exist) ── */}
        {wardrobe.length > 0 && (
          <motion.div {...fadeUp(0.35)} className="mt-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold" style={{ color: "#e0e0e0", fontFamily: "'Playfair Display',serif" }}>Your Wardrobe</h2>
              <Link href="/wardrobe" className="flex items-center gap-1 text-xs" style={{ color: "#06b6d4" }}>
                View all ({wardrobe.length}) <ArrowUpRight size={12} />
              </Link>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {wardrobe.slice(0, 8).map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05, duration: 0.4 }}
                  className="shrink-0 rounded-xl overflow-hidden"
                  style={{ width: 100, height: 120, background: item.color || "rgba(30,30,40,0.8)", border: "1px solid rgba(255,255,255,0.06)", position: "relative" }}
                >
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-1 p-2">
                      <Shirt size={20} style={{ color: "#444" }} />
                      <p className="text-[9px] text-center" style={{ color: "#555", lineHeight: 1.3 }}>{item.name}</p>
                    </div>
                  )}
                  {item.category && (
                    <div className="absolute bottom-0 inset-x-0 px-2 py-1"
                      style={{ background: "linear-gradient(to top,rgba(0,0,0,0.8),transparent)" }}>
                      <p className="text-[8px] truncate" style={{ color: "#aaa" }}>{item.category}</p>
                    </div>
                  )}
                </motion.div>
              ))}
              <Link href="/wardrobe"
                className="shrink-0 rounded-xl flex flex-col items-center justify-center gap-2 border-dashed"
                style={{ width: 100, height: 120, border: "1px dashed rgba(255,255,255,0.1)", color: "#444" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(155,89,255,0.3)"; e.currentTarget.style.color = "#9b59ff"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "#444"; }}>
                <Plus size={18} />
                <span className="text-[9px] text-center">Add item</span>
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}