"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Camera, Sliders, ArrowRight, UploadCloud,
  Loader2, CheckCircle2, Sparkles, Save, RefreshCw,
  Palette, Shirt, Zap, Info, AlertCircle, TrendingUp,
  Maximize2, ChevronDown, ChevronUp, Star
} from "lucide-react";
import { useStyleStore } from "../../lib/store";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../lib/firebase";

const SEL = "bg-[#0c0c18] border border-white/10 rounded-xl p-4 text-white outline-none focus:border-[#a855f7]/50 transition-colors text-sm appearance-none w-full";
const INP = "bg-[#0c0c18] border border-white/10 rounded-xl p-4 text-white outline-none focus:border-[#a855f7]/50 transition-colors text-sm placeholder-[#333] w-full";

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[10px] tracking-[0.15em] uppercase font-bold" style={{ color: "#666" }}>{label}</label>
      {children}
    </div>
  );
}

export default function StylistPage() {
  const router  = useRouter();
  const { user, updateProfile } = useStyleStore();

  const [activeMode,    setActiveMode]    = useState("manual");
  const [saving,        setSaving]        = useState(false);
  const [saved,         setSaved]         = useState(false);
  const [loading,       setLoading]       = useState(true);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isAnalyzing,   setIsAnalyzing]   = useState(false);
  const [lastUpdated,   setLastUpdated]   = useState(null);
  
  // Analysis state
  const [analysis,      setAnalysis]      = useState(null);
  const [isAnalysingProfile, setIsAnalysingProfile] = useState(false);

  const [formData, setFormData] = useState({
    gender: "", height: "", bodyType: "", skinTone: "",
    fitPreference: "Tailored", styleVibe: "",
    occasions: [], vibes: [],
  });

  const set = (k, v) => setFormData(p => ({ ...p, [k]: v }));

  // ── Load existing profile from Firestore ──────────────────────────────────
  useEffect(() => {
    if (!user?.uid || !db) { setLoading(false); return; }
    getDoc(doc(db, "users", user.uid)).then(snap => {
      if (snap.exists()) {
        const data = snap.data();
        const dna = data.styleDNA || {};
        setFormData(p => ({
          ...p,
          gender:        dna.gender        || "",
          height:        dna.height        || "",
          bodyType:      dna.bodyType      || "",
          skinTone:      dna.skinTone      || "",
          fitPreference: dna.fitPreference || "Tailored",
          styleVibe:     dna.styleVibe     || "",
          occasions:     dna.occasions     || [],
          vibes:         dna.vibes         || [],
        }));
        
        if (data.styleAnalysis) {
          setAnalysis(data.styleAnalysis);
        }

        if (data.styleDNAUpdatedAt?.toDate) {
          setLastUpdated(data.styleDNAUpdatedAt.toDate().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }));
        }
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [user?.uid]);

  // ── AI Image Scan (Real Gemini/OpenAI Vision) ─────────────────────────────
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview
    setUploadedImage(URL.createObjectURL(file));
    setIsAnalyzing(true);

    try {
      // Convert to base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64 = reader.result.split(",")[1];
        const mimeType = file.type;

        const res = await fetch("/api/scan-profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageBase64: base64, mimeType }),
        });

        const data = await res.json();
        if (data.success) {
          const r = data.result;
          setFormData(p => ({
            ...p,
            gender: r.gender,
            bodyType: r.bodyType,
            skinTone: r.skinTone,
            fitPreference: r.fitPreference,
            styleVibe: r.vibes?.[0] || p.styleVibe,
            vibes: Array.from(new Set([...p.vibes, ...(r.vibes || [])])),
          }));
          setIsAnalyzing(false);
          setActiveMode("manual");
        }
      };
    } catch (err) {
      console.error("Scan error:", err);
      setIsAnalyzing(false);
    }
  };

  // ── Style Analysis Generation ─────────────────────────────────────────────
  const generateAnalysis = async () => {
    if (!formData.bodyType || !formData.gender) {
      alert("Please fill in at least gender and body type for analysis.");
      return;
    }

    setIsAnalysingProfile(true);
    try {
      const res = await fetch("/api/style-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ styleDNA: formData }),
      });

      const data = await res.json();
      if (data.success) {
        setAnalysis(data.result);
        // Save analysis to firestore too
        if (user?.uid) {
          await setDoc(doc(db, "users", user.uid), {
            styleAnalysis: data.result,
          }, { merge: true });
        }
      }
    } catch (err) {
      console.error("Analysis error:", err);
    } finally {
      setIsAnalysingProfile(false);
    }
  };

  // ── Toggle array fields ───────────────────────────────────────────────────
  const toggleArr = (key, val) => {
    setFormData(p => ({
      ...p,
      [key]: p[key].includes(val) ? p[key].filter(v => v !== val) : [...p[key], val],
    }));
  };

  // ── Save to Firestore ─────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    updateProfile(formData);
    try {
      if (user?.uid && db) {
        await setDoc(doc(db, "users", user.uid), {
          styleDNA: formData,
          displayName: user.displayName || "",
          email: user.email || "",
          styleDNAUpdatedAt: serverTimestamp(),
        }, { merge: true });
        
        setLastUpdated(new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }));
        setSaved(true);
        
        // Auto-generate analysis if not present
        if (!analysis) {
          generateAnalysis();
        }

        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err) {
      console.warn("Offline — saved locally:", err.message);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  const VIBES = ["Old Money", "Streetwear", "Minimalist", "Dark Academic", "Y2K", "Techwear", "Preppy", "Boho", "Cottagecore", "Avant-garde"];
  const OCCASIONS = ["Office", "Casual", "Evening Out", "Date Night", "Gym", "Travel", "Formal", "Festival"];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center gap-3">
        <Loader2 className="animate-spin" size={24} style={{ color: "#9b59ff" }} />
        <span className="text-xs uppercase tracking-widest" style={{ color: "#555" }}>Loading profile…</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-32 px-4 sm:px-6" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="max-w-4xl mx-auto pt-10">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4 text-[10px] uppercase tracking-[0.15em]"
            style={{ background: "rgba(155,89,255,0.1)", border: "1px solid rgba(155,89,255,0.2)", color: "#c084fc" }}>
            <Sparkles size={10} />Style Profile
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3" style={{ fontFamily: "'Playfair Display',serif" }}>
            Calibrate Your <span className="italic" style={{ WebkitTextFillColor: "transparent", background: "linear-gradient(135deg,#a855f7,#06b6d4)", WebkitBackgroundClip: "text" }}>DNA</span>
          </h1>
          <p className="text-sm mb-2 max-w-md mx-auto leading-relaxed" style={{ color: "#666" }}>
            Your style profile powers AI outfit curation across RoomSpace, Wardrobe, and the AI Stylist.
          </p>
          {lastUpdated && (
            <p className="text-[10px]" style={{ color: "#444" }}>Last updated: {lastUpdated}</p>
          )}
        </motion.div>

        {/* Mode toggle */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          className="flex p-1 rounded-full mb-10 max-w-sm mx-auto"
          style={{ background: "rgba(14,14,22,0.8)", border: "1px solid rgba(255,255,255,0.06)" }}>
          {[{ id: "ai", icon: Camera, label: "AI Scan" }, { id: "manual", icon: Sliders, label: "Manual" }].map(m => (
            <button key={m.id} onClick={() => setActiveMode(m.id)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-xs font-semibold uppercase tracking-widest transition-all duration-300"
              style={activeMode === m.id ? { background: "#fff", color: "#000" } : { color: "#555" }}>
              <m.icon size={13} />{m.label}
            </button>
          ))}
        </motion.div>

        <AnimatePresence mode="wait">

          {/* AI Scan tab */}
          {activeMode === "ai" && (
            <motion.div key="ai" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
              className="rounded-3xl p-10 md:p-16 flex flex-col items-center text-center mb-8 relative overflow-hidden"
              style={{ background: "linear-gradient(180deg,rgba(20,20,28,0.6) 0%,rgba(10,10,18,0.6) 100%)", border: "1px solid rgba(255,255,255,0.06)", backdropFilter: "blur(20px)" }}>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full pointer-events-none"
                style={{ background: "radial-gradient(circle,rgba(6,182,212,0.06) 0%,transparent 70%)", filter: "blur(60px)" }} />
              {!uploadedImage ? (
                <>
                  <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6"
                    style={{ background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.2)" }}>
                    <UploadCloud size={32} style={{ color: "#06b6d4" }} />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "'Playfair Display',serif" }}>Upload a Full-Body Photo</h3>
                  <p className="text-sm mb-8 max-w-md leading-relaxed" style={{ color: "#666" }}>
                    Our vision model will instantly detect your frame, body geometry, and skin undertone.
                  </p>
                  <label className="cursor-pointer px-8 py-3.5 rounded-full font-semibold text-sm text-white inline-block transition-all"
                    style={{ background: "linear-gradient(135deg,#9b59ff,#06b6d4)", boxShadow: "0 4px 24px rgba(155,89,255,0.3)" }}>
                    Select Image
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                </>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="relative w-44 h-60 rounded-2xl overflow-hidden border mb-6 shadow-2xl" style={{ borderColor: "rgba(6,182,212,0.3)" }}>
                    <img src={uploadedImage} alt="scan" className="w-full h-full object-cover" style={{ opacity: isAnalyzing ? 0.4 : 1 }} />
                    {isAnalyzing && (
                      <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/0 via-cyan-500/40 to-cyan-500/0"
                        style={{ animation: "scan 1.5s ease-in-out infinite" }} />
                    )}
                  </div>
                  {isAnalyzing ? (
                    <div className="flex items-center gap-3" style={{ color: "#06b6d4" }}>
                      <Loader2 className="animate-spin" size={18} />
                      <span className="text-xs uppercase tracking-widest font-bold">Vision Analysis in Progress…</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-4">
                      <div className="flex items-center gap-3" style={{ color: "#10b981" }}>
                        <CheckCircle2 size={18} />
                        <span className="text-xs uppercase tracking-widest font-bold">DNA Extracted Successfully</span>
                      </div>
                      <button onClick={() => setActiveMode("manual")} className="text-[10px] uppercase tracking-widest text-[#555] hover:text-white transition-colors">
                        Review Details Below ↓
                      </button>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* Manual form */}
          {activeMode === "manual" && (
            <motion.div key="manual" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="rounded-3xl p-8 md:p-10 mb-8"
              style={{ background: "linear-gradient(180deg,rgba(20,20,28,0.6) 0%,rgba(10,10,18,0.6) 100%)", border: "1px solid rgba(255,255,255,0.06)", backdropFilter: "blur(20px)" }}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <Field label="Gender">
                  <select value={formData.gender} onChange={e => set("gender", e.target.value)} className={SEL}>
                    <option value="" disabled>Select…</option>
                    <option>Male / Masculine</option>
                    <option>Female / Feminine</option>
                    <option>Androgynous / Unisex</option>
                  </select>
                </Field>
                <Field label="Height (cm)">
                  <input type="number" value={formData.height} onChange={e => set("height", e.target.value)} placeholder="e.g. 175" className={INP} />
                </Field>
                <Field label="Body Build">
                  <select value={formData.bodyType} onChange={e => set("bodyType", e.target.value)} className={SEL}>
                    <option value="" disabled>Select build…</option>
                    {["Slim / Lean", "Athletic", "Average", "Broad / Muscular", "Plus Size", "Petite"].map(v => <option key={v}>{v}</option>)}
                  </select>
                </Field>
                <Field label="Skin Undertone">
                  <select value={formData.skinTone} onChange={e => set("skinTone", e.target.value)} className={SEL}>
                    <option value="" disabled>Select tone…</option>
                    <option>Cool (Pink / Blue hues)</option>
                    <option>Warm (Yellow / Golden hues)</option>
                    <option>Neutral (Mix)</option>
                  </select>
                </Field>
                <Field label="Fit Preference">
                  <select value={formData.fitPreference} onChange={e => set("fitPreference", e.target.value)} className={SEL}>
                    {["Tailored / Form-fitting", "Oversized / Relaxed", "Draped / Flowing", "Boxy / Structured"].map(v => <option key={v}>{v}</option>)}
                  </select>
                </Field>
                <Field label="Target Aesthetic">
                  <input type="text" value={formData.styleVibe} onChange={e => set("styleVibe", e.target.value)} placeholder="e.g. Old Money, Dark Minimal…" className={INP} />
                </Field>
              </div>

              {/* Vibes */}
              <div className="mb-6">
                <p className="text-[10px] uppercase tracking-[0.15em] font-bold mb-3" style={{ color: "#666" }}>Style Vibes (pick a few)</p>
                <div className="flex flex-wrap gap-2">
                  {VIBES.map(v => (
                    <button key={v} onClick={() => toggleArr("vibes", v)}
                      className="px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200"
                      style={{
                        background: formData.vibes.includes(v) ? "rgba(168,85,247,0.15)" : "rgba(255,255,255,0.03)",
                        border: formData.vibes.includes(v) ? "1px solid rgba(168,85,247,0.35)" : "1px solid rgba(255,255,255,0.07)",
                        color: formData.vibes.includes(v) ? "#c084fc" : "#555",
                      }}>
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              {/* Occasions */}
              <div>
                <p className="text-[10px] uppercase tracking-[0.15em] font-bold mb-3" style={{ color: "#666" }}>Occasions you dress for</p>
                <div className="flex flex-wrap gap-2">
                  {OCCASIONS.map(o => (
                    <button key={o} onClick={() => toggleArr("occasions", o)}
                      className="px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200"
                      style={{
                        background: formData.occasions.includes(o) ? "rgba(6,182,212,0.12)" : "rgba(255,255,255,0.03)",
                        border: formData.occasions.includes(o) ? "1px solid rgba(6,182,212,0.3)" : "1px solid rgba(255,255,255,0.07)",
                        color: formData.occasions.includes(o) ? "#67e8f9" : "#555",
                      }}>
                      {o}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action buttons */}
        <div className="flex items-center justify-between mb-16">
          <button onClick={() => router.push("/dashboard")} className="text-xs transition-colors" style={{ color: "#444" }}
            onMouseEnter={e => e.currentTarget.style.color = "#888"}
            onMouseLeave={e => e.currentTarget.style.color = "#444"}>
            ← Back to Dashboard
          </button>
          
          <div className="flex items-center gap-3">
             {analysis && (
               <button onClick={generateAnalysis} disabled={isAnalysingProfile}
                 className="flex items-center gap-2 px-6 py-3.5 rounded-full font-bold text-xs transition-all border border-white/5 text-[#888] hover:bg-white/5 hover:text-white disabled:opacity-50">
                 {isAnalysingProfile ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
                 Refresh Analysis
               </button>
             )}
             
             <button onClick={handleSave} disabled={saving}
               className="flex items-center gap-2.5 px-8 py-3.5 rounded-full font-bold text-sm text-white transition-all disabled:opacity-50"
               style={{ background: "linear-gradient(135deg,#a855f7,#06b6d4)", boxShadow: saved ? "0 0 30px rgba(16,185,129,0.4)" : "0 4px 24px rgba(168,85,247,0.35)" }}>
               {saving ? (
                 <><Loader2 size={15} className="animate-spin" />Saving…</>
               ) : saved ? (
                 <><CheckCircle2 size={15} style={{ color: "#d1fae5" }} />Saved!</>
               ) : (
                 <><Save size={15} />Save Profile</>
               )}
             </button>
          </div>
        </div>

        {/* ── ANALYSIS SECTION ── */}
        <AnimatePresence>
          {(isAnalysingProfile || analysis) && (
            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
              
              <div className="flex items-center gap-4 mb-2">
                <div className="h-px flex-1" style={{ background: "linear-gradient(to right,transparent,rgba(255,255,255,0.05),rgba(255,255,255,0.1))" }} />
                <h2 className="text-xs uppercase tracking-[0.3em] font-bold" style={{ color: "#444" }}>Deep Style Analysis</h2>
                <div className="h-px flex-1" style={{ background: "linear-gradient(to left,transparent,rgba(255,255,255,0.05),rgba(255,255,255,0.1))" }} />
              </div>

              {isAnalysingProfile ? (
                <div className="rounded-3xl p-20 flex flex-col items-center justify-center text-center space-y-4"
                  style={{ background: "rgba(10,10,18,0.4)", border: "1px solid rgba(255,255,255,0.03)" }}>
                  <div className="relative">
                    <Loader2 size={40} className="animate-spin text-[#a855f7]/30" />
                    <Sparkles size={20} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#a855f7]" />
                  </div>
                  <p className="text-lg font-medium text-white" style={{ fontFamily: "'Playfair Display',serif" }}>Synthesizing Style DNA…</p>
                  <p className="text-xs text-[#555] max-w-xs mx-auto">Gemini is curating your personalized editorial identity based on your build, undertone, and vibes.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Left Column: Archetype & Summary */}
                  <div className="lg:col-span-2 space-y-6">
                    <div className="rounded-3xl p-8 relative overflow-hidden"
                      style={{ background: "linear-gradient(135deg,rgba(168,85,247,0.08),rgba(6,182,212,0.08))", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-4">
                           <Zap size={14} className="text-[#a855f7]" />
                           <span className="text-[10px] uppercase tracking-widest font-bold text-[#a855f7]">AI Editorial Verdict</span>
                        </div>
                        <h3 className="text-3xl font-bold text-white mb-4" style={{ fontFamily: "'Playfair Display',serif" }}>{analysis.styleArchetype}</h3>
                        <p className="text-base leading-relaxed text-[#999] italic">"{analysis.summary}"</p>
                      </div>
                      <div className="absolute top-0 right-0 p-8 opacity-10">
                         <Sparkles size={120} />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="rounded-2xl p-6" style={{ background: "rgba(20,20,28,0.4)", border: "1px solid rgba(255,255,255,0.04)" }}>
                        <div className="flex items-center gap-2 mb-4">
                           <Shirt size={14} className="text-[#06b6d4]" />
                           <span className="text-[10px] uppercase tracking-widest font-bold text-[#06b6d4]">Signature Pieces</span>
                        </div>
                        <div className="space-y-4">
                          {analysis.keyPieces?.map((p, i) => (
                            <div key={i}>
                              <p className="text-sm font-semibold text-white mb-0.5">{p.item}</p>
                              <p className="text-[11px] text-[#555] leading-relaxed">{p.why}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-2xl p-6" style={{ background: "rgba(20,20,28,0.4)", border: "1px solid rgba(255,255,255,0.04)" }}>
                        <div className="flex items-center gap-2 mb-4">
                           <TrendingUp size={14} className="text-emerald-400" />
                           <span className="text-[10px] uppercase tracking-widest font-bold text-emerald-400">Proportional Guidance</span>
                        </div>
                        <p className="text-sm leading-relaxed text-[#999] mb-4">{analysis.fitGuidance}</p>
                        <div className="pt-4 border-t border-white/5">
                           <p className="text-[10px] uppercase tracking-widest font-bold text-[#444] mb-2">Seasonal Strategy</p>
                           <p className="text-[11px] text-[#666] leading-relaxed">{analysis.seasonalAdvice}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Palette & Details */}
                  <div className="space-y-6">
                    <div className="rounded-2xl p-6" style={{ background: "rgba(20,20,28,0.4)", border: "1px solid rgba(255,255,255,0.04)" }}>
                      <div className="flex items-center gap-2 mb-4">
                         <Palette size={14} className="text-pink-400" />
                         <span className="text-[10px] uppercase tracking-widest font-bold text-pink-400">Color Palette</span>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <p className="text-[10px] uppercase tracking-widest text-[#444] mb-2">Hero Tones</p>
                          <div className="flex gap-2">
                            {analysis.colorPalette?.hero?.map((c, i) => (
                              <div key={i} className="group relative">
                                <div className="w-10 h-10 rounded-lg shadow-lg border border-white/10" style={{ background: c }} />
                                <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[8px] opacity-0 group-hover:opacity-100 transition-opacity text-[#555]">{c}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-[10px] uppercase tracking-widest text-[#444] mb-2">Accents</p>
                          <div className="flex gap-2">
                            {analysis.colorPalette?.accent?.map((c, i) => (
                              <div key={i} className="w-8 h-8 rounded-lg shadow-lg border border-white/10" style={{ background: c }} />
                            ))}
                          </div>
                        </div>

                        <div>
                          <p className="text-[10px] uppercase tracking-widest text-[#444] mb-2">Palette Labels</p>
                          <div className="flex flex-wrap gap-1">
                            {analysis.colorPalette?.labels?.map(l => (
                              <span key={l} className="px-2 py-0.5 rounded bg-white/5 text-[9px] text-[#777]">{l}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl p-6" style={{ background: "rgba(20,20,28,0.4)", border: "1px solid rgba(255,255,255,0.04)" }}>
                      <div className="flex items-center gap-2 mb-4">
                         <Info size={14} className="text-amber-400" />
                         <span className="text-[10px] uppercase tracking-widest font-bold text-amber-400">Avoidance & Materials</span>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <p className="text-[10px] uppercase tracking-widest text-rose-500/60 mb-2">Avoid</p>
                          <ul className="space-y-1">
                            {analysis.avoidList?.map(a => (
                              <li key={a} className="text-[11px] text-[#666] flex items-center gap-2">
                                <div className="w-1 h-1 rounded-full bg-rose-500/40" /> {a}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <p className="text-[10px] uppercase tracking-widest text-[#444] mb-2">Fabrics</p>
                          <div className="flex flex-wrap gap-1.5">
                            {analysis.fabricRecommendations?.map(f => (
                              <span key={f} className="text-[11px] text-[#888]">{f} ·</span>
                            ))}
                          </div>
                        </div>

                        <div>
                          <p className="text-[10px] uppercase tracking-widest text-[#444] mb-2">Keywords</p>
                          <div className="flex flex-wrap gap-1.5">
                            {analysis.inspirationKeywords?.map(k => (
                              <span key={k} className="text-[11px] font-medium text-[#555] italic">#{k}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>

                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
      ` }} />
    </div>
  );
}