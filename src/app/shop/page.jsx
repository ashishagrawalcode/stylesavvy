"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, X, ExternalLink, Tag, Trash2, Search,
  ShoppingBag, Heart, TrendingDown, Loader2,
  AlertCircle, CheckCircle, Link as LinkIcon,
  Star, Package, Filter, Sparkles, ArrowUpRight,
  Clock, Globe,
} from "lucide-react";
import { useStyleStore } from "../../lib/store";
import { db } from "../../lib/firebase";
import {
  collection, addDoc, onSnapshot, deleteDoc,
  doc, serverTimestamp, query, orderBy,
} from "firebase/firestore";

// ─── Categories ───────────────────────────────────────────────────────────────
const CATEGORIES = ["All", "Tops", "Bottoms", "Outerwear", "Shoes", "Accessories", "Bags", "Other"];

const CATEGORY_COLORS = {
  Tops:        { bg: "rgba(168,85,247,0.12)", border: "rgba(168,85,247,0.3)", text: "#c084fc" },
  Bottoms:     { bg: "rgba(6,182,212,0.12)",  border: "rgba(6,182,212,0.3)",  text: "#67e8f9" },
  Outerwear:   { bg: "rgba(16,185,129,0.12)", border: "rgba(16,185,129,0.3)", text: "#6ee7b7" },
  Shoes:       { bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.3)", text: "#fcd34d" },
  Accessories: { bg: "rgba(239,68,68,0.12)",  border: "rgba(239,68,68,0.3)",  text: "#fca5a5" },
  Bags:        { bg: "rgba(236,72,153,0.12)", border: "rgba(236,72,153,0.3)", text: "#f9a8d4" },
  Other:       { bg: "rgba(255,255,255,0.05)", border: "rgba(255,255,255,0.1)", text: "#888" },
};

// ─── Domain extraction helper ─────────────────────────────────────────────────
function extractDomain(url) {
  try {
    const u = new URL(url.startsWith("http") ? url : `https://${url}`);
    return u.hostname.replace("www.", "");
  } catch {
    return url;
  }
}

// ─── Animation variants ───────────────────────────────────────────────────────
const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };
const cardVariants = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.94 },
};

// ─── Add Item Modal ───────────────────────────────────────────────────────────
function AddItemModal({ onClose, onAdd, loading }) {
  const [url,      setUrl]      = useState("");
  const [title,    setTitle]    = useState("");
  const [category, setCategory] = useState("Other");
  const [notes,    setNotes]    = useState("");
  const [price,    setPrice]    = useState("");
  const [error,    setError]    = useState("");

  function handleAdd() {
    if (!url.trim()) { setError("Please paste a product URL."); return; }
    if (!title.trim()) { setError("Please give this item a name."); return; }
    setError("");
    onAdd({ url: url.trim(), title: title.trim(), category, notes: notes.trim(), price: price.trim() });
  }

  const inp = "w-full bg-[#0a0a14]/60 border border-white/10 rounded-xl px-4 py-3 text-[13.5px] text-white placeholder-[#444] outline-none focus:border-[#a855f7]/50 transition-colors";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(12px)" }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-lg overflow-hidden"
        style={{
          background: "rgba(12,12,20,0.95)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "1.5rem",
          boxShadow: "0 40px 100px rgba(0,0,0,0.7)",
        }}
      >
        {/* Accent top bar */}
        <div className="absolute top-0 inset-x-0 h-[1.5px]"
          style={{ background: "linear-gradient(90deg,transparent,#a855f7,#06b6d4,transparent)" }} />

        <div className="p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-white" style={{ fontFamily: "'Playfair Display',serif" }}>
                Add to Wishlist
              </h2>
              <p className="text-xs text-[#666] mt-0.5">Paste any product link from any store</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5 text-[#555] hover:text-white transition-colors">
              <X size={18} />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl flex items-center gap-2 text-[12.5px] text-red-300"
              style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
              <AlertCircle size={14} className="shrink-0" />{error}
            </div>
          )}

          <div className="space-y-4">
            {/* URL */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#888]">Product URL *</label>
              <div className="relative">
                <LinkIcon size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#555]" />
                <input
                  type="url"
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  placeholder="https://zara.com/product/..."
                  className={inp + " pl-10"}
                />
              </div>
            </div>

            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#888]">Item Name *</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Oversized Linen Blazer"
                className={inp}
              />
            </div>

            {/* Price + Category row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#888]">Price (optional)</label>
                <input
                  type="text"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  placeholder="₹2,999 / $45"
                  className={inp}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#888]">Category</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className={inp + " appearance-none"}
                  style={{ background: "rgba(10,10,20,0.8)" }}
                >
                  {CATEGORIES.filter(c => c !== "All").map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#888]">Notes (optional)</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Size M, check sale in July..."
                rows={2}
                className={inp + " resize-none"}
              />
            </div>

            {/* Submit */}
            <button
              onClick={handleAdd}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-[13.5px] text-white transition-all duration-300 disabled:opacity-50"
              style={{
                background: "linear-gradient(135deg,#a855f7 0%,#7c3aed 45%,#06b6d4 100%)",
                boxShadow: "0 4px 24px rgba(168,85,247,0.35)",
              }}
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <><Plus size={15} />Add to Wishlist</>}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Wishlist Item Card ───────────────────────────────────────────────────────
function WishlistCard({ item, onDelete }) {
  const [deleting, setDeleting] = useState(false);
  const col = CATEGORY_COLORS[item.category] || CATEGORY_COLORS.Other;

  async function handleDelete() {
    setDeleting(true);
    await onDelete(item.id);
  }

  return (
    <motion.div
      layout
      variants={cardVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="group relative rounded-2xl overflow-hidden"
      style={{
        background: "linear-gradient(180deg, rgba(18,18,28,0.8) 0%, rgba(10,10,18,0.8) 100%)",
        border: "1px solid rgba(255,255,255,0.06)",
        backdropFilter: "blur(20px)",
      }}
    >
      {/* Hover accent */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `radial-gradient(circle at top left, ${col.bg} 0%, transparent 60%)` }}
      />

      <div className="relative p-5">
        {/* Top row */}
        <div className="flex items-start justify-between mb-3">
          <div
            className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
            style={{ background: col.bg, border: `1px solid ${col.border}`, color: col.text }}
          >
            {item.category}
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg hover:bg-white/10 text-[#555] hover:text-white transition-colors"
              title="Open product"
            >
              <ExternalLink size={13} />
            </a>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="p-1.5 rounded-lg hover:bg-red-500/10 text-[#555] hover:text-red-400 transition-colors disabled:opacity-50"
              title="Remove"
            >
              {deleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
            </button>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-white font-semibold text-sm leading-snug mb-1 line-clamp-2">{item.title}</h3>

        {/* Domain */}
        <div className="flex items-center gap-1 mb-3">
          <Globe size={10} style={{ color: "#555" }} />
          <span className="text-[10px] text-[#555] truncate">{extractDomain(item.url)}</span>
        </div>

        {/* Price */}
        {item.price && (
          <div className="mb-3">
            <span
              className="text-sm font-bold"
              style={{
                background: "linear-gradient(135deg,#a855f7,#06b6d4)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {item.price}
            </span>
          </div>
        )}

        {/* Notes */}
        {item.notes && (
          <p className="text-[11px] text-[#666] leading-relaxed mb-3 italic">"{item.notes}"</p>
        )}

        {/* Price History Placeholder */}
        <div
          className="rounded-xl p-3 flex items-center gap-3"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}
        >
          <TrendingDown size={14} style={{ color: "#555", flexShrink: 0 }} />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-[#555] leading-tight">Price history unavailable</p>
            <p className="text-[9px] text-[#444] mt-0.5">Add PRICE_API_KEY to .env to enable tracking</p>
          </div>
          <span
            className="shrink-0 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase"
            style={{ background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.25)", color: "#fcd34d" }}
          >
            Soon
          </span>
        </div>

        {/* Date added */}
        <div className="flex items-center gap-1 mt-3">
          <Clock size={9} style={{ color: "#444" }} />
          <span className="text-[10px] text-[#444]">
            {item.createdAt?.toDate?.()?.toLocaleDateString("en-IN", { month: "short", day: "numeric" }) || "Just now"}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({ onAdd }) {
  return (
    <motion.div
      {...fadeUp}
      transition={{ duration: 0.6 }}
      className="flex flex-col items-center justify-center py-32 text-center px-6"
    >
      <div
        className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6"
        style={{
          background: "linear-gradient(135deg,rgba(168,85,247,0.15),rgba(6,182,212,0.15))",
          border: "1px solid rgba(168,85,247,0.2)",
        }}
      >
        <ShoppingBag size={32} style={{ color: "#a855f7" }} />
      </div>
      <h3 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "'Playfair Display',serif" }}>
        Your wishlist is empty
      </h3>
      <p className="text-[#666] text-sm mb-8 max-w-xs leading-relaxed">
        Save products from any store — Zara, H&M, SSENSE, anywhere. Paste a link and we'll track it.
      </p>
      <button
        onClick={onAdd}
        className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-white"
        style={{
          background: "linear-gradient(135deg,#a855f7,#06b6d4)",
          boxShadow: "0 4px 24px rgba(168,85,247,0.3)",
        }}
      >
        <Plus size={15} />Add your first item
      </button>
    </motion.div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// MAIN SHOP PAGE
// ═════════════════════════════════════════════════════════════════════════════
export default function ShopPage() {
  const { user } = useStyleStore();

  const [items,       setItems]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [adding,      setAdding]      = useState(false);
  const [showModal,   setShowModal]   = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");
  const [search,      setSearch]      = useState("");
  const [toast,       setToast]       = useState(null);

  // ── Firestore listener ────────────────────────────────────────────────────
  useEffect(() => {
    if (!user || !db) { setLoading(false); return; }
    const q = query(
      collection(db, "users", user.uid, "wishlist"),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, snap => {
      setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, () => setLoading(false));
    return () => unsub();
  }, [user]);

  // ── Add item ──────────────────────────────────────────────────────────────
  const handleAdd = useCallback(async (data) => {
    if (!user || !db) return;
    setAdding(true);
    try {
      await addDoc(collection(db, "users", user.uid, "wishlist"), {
        ...data,
        createdAt: serverTimestamp(),
      });
      setShowModal(false);
      setToast({ msg: "Added to wishlist!", type: "success" });
    } catch {
      setToast({ msg: "Failed to add item.", type: "error" });
    } finally {
      setAdding(false);
      setTimeout(() => setToast(null), 3000);
    }
  }, [user]);

  // ── Delete item ───────────────────────────────────────────────────────────
  const handleDelete = useCallback(async (id) => {
    if (!user || !db) return;
    await deleteDoc(doc(db, "users", user.uid, "wishlist", id));
    setToast({ msg: "Removed from wishlist.", type: "info" });
    setTimeout(() => setToast(null), 2500);
  }, [user]);

  // ── Filtered items ────────────────────────────────────────────────────────
  const filtered = items.filter(item => {
    const matchCat = activeFilter === "All" || item.category === activeFilter;
    const matchSearch = !search || item.title.toLowerCase().includes(search.toLowerCase()) || item.url.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen relative" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* Ambient glow */}
      <div
        className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[70vw] h-[40vh]"
        style={{ background: "radial-gradient(ellipse,rgba(168,85,247,0.05) 0%,transparent 70%)", filter: "blur(80px)" }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-10">

        {/* ── Page Header ── */}
        <motion.div {...fadeUp} transition={{ duration: 0.6 }} className="flex items-start justify-between mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Heart size={14} style={{ color: "#a855f7" }} />
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#555]">Wishlist & Price Tracker</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2" style={{ fontFamily: "'Playfair Display',serif" }}>
              Your Shop
            </h1>
            <p className="text-sm text-[#666]">
              Save items from any store — track prices, compare deals, curate your next purchase.
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowModal(true)}
            className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white"
            style={{
              background: "linear-gradient(135deg,#a855f7,#06b6d4)",
              boxShadow: "0 4px 24px rgba(168,85,247,0.3)",
            }}
          >
            <Plus size={15} />Add Item
          </motion.button>
        </motion.div>

        {/* ── Stats bar ── */}
        {items.length > 0 && (
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex items-center gap-6 mb-8 px-5 py-3 rounded-2xl"
            style={{ background: "rgba(18,18,28,0.5)", border: "1px solid rgba(255,255,255,0.05)", backdropFilter: "blur(20px)" }}
          >
            {[
              { icon: Package,   label: "Total Items",    value: items.length },
              { icon: Tag,       label: "Categories",     value: new Set(items.map(i => i.category)).size },
              { icon: TrendingDown, label: "Price Tracked", value: "Connect API" },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-2.5">
                <Icon size={14} style={{ color: "#555" }} />
                <div>
                  <p className="text-[10px] text-[#555] uppercase tracking-wider">{label}</p>
                  <p className="text-sm font-semibold text-white">{value}</p>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* ── Filters + Search ── */}
        {items.length > 0 && (
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8"
          >
            {/* Category pills */}
            <div className="flex items-center gap-2 flex-wrap">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveFilter(cat)}
                  className="px-3 py-1.5 rounded-full text-[11px] font-medium transition-all duration-200"
                  style={{
                    background: activeFilter === cat ? "rgba(168,85,247,0.15)" : "rgba(255,255,255,0.04)",
                    border: activeFilter === cat ? "1px solid rgba(168,85,247,0.35)" : "1px solid rgba(255,255,255,0.06)",
                    color: activeFilter === cat ? "#c084fc" : "#555",
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative sm:ml-auto">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555]" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search items..."
                className="pl-9 pr-4 py-2 rounded-xl text-sm text-white placeholder-[#444] outline-none transition-colors"
                style={{
                  background: "rgba(18,18,28,0.8)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  backdropFilter: "blur(12px)",
                  minWidth: 180,
                }}
              />
            </div>
          </motion.div>
        )}

        {/* ── Content ── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
            <Loader2 className="animate-spin text-[#a855f7]" size={28} />
            <span className="text-xs text-[#555] uppercase tracking-widest">Loading wishlist…</span>
          </div>
        ) : items.length === 0 ? (
          <EmptyState onAdd={() => setShowModal(true)} />
        ) : (
          <AnimatePresence mode="popLayout">
            {filtered.length === 0 ? (
              <motion.div
                key="no-results"
                {...fadeUp}
                transition={{ duration: 0.4 }}
                className="py-24 text-center"
              >
                <p className="text-[#555] text-sm">No items match your filter.</p>
              </motion.div>
            ) : (
              <motion.div
                key="grid"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
              >
                {filtered.map((item, i) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.04, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <WishlistCard item={item} onDelete={handleDelete} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* Mobile add button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowModal(true)}
          className="md:hidden fixed bottom-24 right-5 w-14 h-14 rounded-2xl flex items-center justify-center text-white z-50 shadow-2xl"
          style={{ background: "linear-gradient(135deg,#a855f7,#06b6d4)" }}
        >
          <Plus size={22} />
        </motion.button>
      </div>

      {/* ── Add Item Modal ── */}
      <AnimatePresence>
        {showModal && (
          <AddItemModal
            onClose={() => setShowModal(false)}
            onAdd={handleAdd}
            loading={adding}
          />
        )}
      </AnimatePresence>

      {/* ── Toast ── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 10, x: "-50%" }}
            className="fixed bottom-8 left-1/2 z-[300] flex items-center gap-2 px-5 py-3 rounded-full text-sm font-medium text-white"
            style={{
              background: toast.type === "success" ? "rgba(16,185,129,0.9)" : toast.type === "error" ? "rgba(239,68,68,0.9)" : "rgba(30,30,45,0.95)",
              border: "1px solid rgba(255,255,255,0.1)",
              backdropFilter: "blur(20px)",
            }}
          >
            {toast.type === "success" ? <CheckCircle size={14} /> : toast.type === "error" ? <AlertCircle size={14} /> : <Sparkles size={14} />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
