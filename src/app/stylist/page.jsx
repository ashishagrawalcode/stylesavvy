"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Camera, Sliders, ArrowRight, UploadCloud, Loader2, CheckCircle2 } from "lucide-react";
import { useStyleStore } from "../../lib/store";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";

export default function StylistOnboarding() {
  const router = useRouter();
  const { user, profile, updateProfile } = useStyleStore();
  
  const [activeMode, setActiveMode] = useState("ai"); // 'ai' or 'manual'
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);

  // Upgraded comprehensive local state
  const [formData, setFormData] = useState({
    gender: profile.gender || "",
    height: profile.height || "",
    bodyShape: profile.bodyShape || "",
    skinUndertone: profile.skinUndertone || "",
    styleVibe: profile.styleVibe || "Minimalist",
    fitPreference: profile.fitPreference || "Tailored"
  });

  // --- MOCK AI VISION HANDLER ---
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedImage(URL.createObjectURL(file));
      simulateAIVisionAnalysis();
    }
  };

  const simulateAIVisionAnalysis = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      // Mocking what the AI vision model would extract
      setFormData({
        gender: "Female",
        height: "Average Frame",
        bodyShape: "Hourglass",
        skinUndertone: "Warm",
        styleVibe: "Modern Elegance",
        fitPreference: "Tailored"
      });
      setIsAnalyzing(false);
      setActiveMode("manual"); // Switch to manual to review
    }, 2500);
  };

  // --- SAFE DATABASE SAVE ---
  const handleSaveToDatabase = async () => {
    setIsAnalyzing(true);
    try {
      // 1. Update Global Frontend Store (Works 100% offline)
      updateProfile(formData);

      // 2. Safe Firebase Attempt (Catches the invalid-api-key proxy error)
      try {
        if (user?.uid && db) {
          const userRef = doc(db, "users", user.uid);
          await updateDoc(userRef, {
            profile: formData,
            setupComplete: true
          });
        }
      } catch (dbError) {
        console.warn("⚠️ Offline Mode Active: Saved to local memory. Database skipped.");
      }

      // 3. Route to Wardrobe
      router.push("/wardrobe");
    } catch (error) {
      console.error("Critical Save Error:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-24 px-6 flex flex-col items-center max-w-4xl mx-auto selection:bg-cyan-500/30">
      
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
        <h1 className="font-serif text-5xl md:text-6xl text-white mb-4">Calibrate <span className="italic text-cyan-400">Matrix.</span></h1>
        <p className="text-[#888888] text-lg max-w-xl mx-auto font-sans">
          Establish your geometric profile. Our neural engine uses this baseline to calculate optimal fabrics, fits, and color palettes.
        </p>
      </motion.div>

      {/* Mode Toggle */}
      <div className="glass-pill flex p-1 rounded-full mb-12 border border-white/10 relative z-10 w-full max-w-md mx-auto bg-black/40 backdrop-blur-xl">
        <button 
          onClick={() => setActiveMode("ai")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-full text-sm font-sans font-bold tracking-widest uppercase transition-all duration-300 ${activeMode === "ai" ? "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]" : "text-[#888888] hover:text-white"}`}
        >
          <Camera size={16} /> Neural Scan
        </button>
        <button 
          onClick={() => setActiveMode("manual")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-full text-sm font-sans font-bold tracking-widest uppercase transition-all duration-300 ${activeMode === "manual" ? "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]" : "text-[#888888] hover:text-white"}`}
        >
          <Sliders size={16} /> Manual Input
        </button>
      </div>

      {/* Forms Container */}
      <div className="w-full relative">
        <AnimatePresence mode="wait">
          
          {/* ==========================================
              AI VISION TAB
              ========================================== */}
          {activeMode === "ai" && (
            <motion.div
              key="ai"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="glass-pill w-full border border-white/5 p-10 md:p-16 rounded-[2.5rem] flex flex-col items-center justify-center text-center relative overflow-hidden"
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />
              
              {!uploadedImage ? (
                <>
                  <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6 shadow-inner">
                    <UploadCloud size={40} className="text-cyan-400" />
                  </div>
                  <h3 className="font-serif text-3xl text-white mb-2">Upload a Full-Body Photo</h3>
                  <p className="font-sans text-[#888888] mb-8 max-w-md">Our vision model will instantly map your gender presentation, frame, body geometry, and skin undertone.</p>
                  
                  <label className="cursor-pointer relative group inline-flex items-center justify-center px-10 py-5 bg-white text-black rounded-full font-sans text-sm font-bold tracking-widest uppercase hover:scale-105 transition-transform shadow-[0_0_40px_rgba(255,255,255,0.1)]">
                    <span>Select Image</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                </>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="relative w-48 h-64 rounded-2xl overflow-hidden border border-white/10 mb-8 shadow-2xl">
                    <img src={uploadedImage} alt="Uploaded" className="object-cover w-full h-full opacity-50" />
                    {isAnalyzing && (
                      <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/0 via-cyan-500/20 to-cyan-500/0 animate-[scan_2s_ease-in-out_infinite]" />
                    )}
                  </div>
                  
                  {isAnalyzing ? (
                    <div className="flex items-center gap-3 text-cyan-400">
                      <Loader2 className="animate-spin" size={20} />
                      <span className="font-sans tracking-widest uppercase text-sm font-bold">Extracting Geometry...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 text-green-400">
                      <CheckCircle2 size={20} />
                      <span className="font-sans tracking-widest uppercase text-sm font-bold">Analysis Complete</span>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* ==========================================
              MANUAL / REVIEW TAB (Upgraded Parameters)
              ========================================== */}
          {activeMode === "manual" && (
            <motion.div
              key="manual"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="glass-pill w-full border border-white/5 p-8 md:p-12 rounded-[2.5rem] relative shadow-2xl"
            >
              <h3 className="font-serif text-3xl text-white mb-8 border-b border-white/10 pb-4">Aesthetic Parameters</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* 1. Gender Identity */}
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] tracking-widest text-[#888888] uppercase font-bold">Gender Presentation</label>
                  <select 
                    value={formData.gender}
                    onChange={(e) => setFormData({...formData, gender: e.target.value})}
                    className="bg-[#0a0a0a] border border-white/10 rounded-xl p-4 text-white outline-none focus:border-cyan-400 transition-colors font-sans text-sm"
                  >
                    <option value="" disabled>Select...</option>
                    <option value="Male">Male / Masculine</option>
                    <option value="Female">Female / Feminine</option>
                    <option value="Androgynous">Androgynous / Unisex</option>
                  </select>
                </div>

                {/* 2. Height / Frame */}
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] tracking-widest text-[#888888] uppercase font-bold">Height & Frame</label>
                  <select 
                    value={formData.height}
                    onChange={(e) => setFormData({...formData, height: e.target.value})}
                    className="bg-[#0a0a0a] border border-white/10 rounded-xl p-4 text-white outline-none focus:border-cyan-400 transition-colors font-sans text-sm"
                  >
                    <option value="" disabled>Select Frame...</option>
                    <option value="Short Frame">Short Frame</option>
                    <option value="Average Frame">Average Frame</option>
                    <option value="Long Frame">Long / Tall Frame</option>
                  </select>
                </div>

                {/* 3. Body Shape */}
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] tracking-widest text-[#888888] uppercase font-bold">Body Geometry</label>
                  <select 
                    value={formData.bodyShape}
                    onChange={(e) => setFormData({...formData, bodyShape: e.target.value})}
                    className="bg-[#0a0a0a] border border-white/10 rounded-xl p-4 text-white outline-none focus:border-cyan-400 transition-colors font-sans text-sm"
                  >
                    <option value="" disabled>Select Shape...</option>
                    <option value="Straight">Straight / Rectangle</option>
                    <option value="Pear">Pear / Triangle</option>
                    <option value="Inverted Triangle">Inverted Triangle</option>
                    <option value="Apple">Apple / Round</option>
                    <option value="Hourglass">Hourglass</option>
                  </select>
                </div>

                {/* 4. Skin Undertone */}
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] tracking-widest text-[#888888] uppercase font-bold">Skin Undertone</label>
                  <select 
                    value={formData.skinUndertone}
                    onChange={(e) => setFormData({...formData, skinUndertone: e.target.value})}
                    className="bg-[#0a0a0a] border border-white/10 rounded-xl p-4 text-white outline-none focus:border-cyan-400 transition-colors font-sans text-sm"
                  >
                    <option value="" disabled>Select Tone...</option>
                    <option value="Cool">Cool (Pink/Blue/Red hues)</option>
                    <option value="Warm">Warm (Yellow/Peach/Golden hues)</option>
                    <option value="Neutral">Neutral (Mix of Cool & Warm)</option>
                  </select>
                </div>

                {/* 5. Fit Preference */}
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] tracking-widest text-[#888888] uppercase font-bold">Drape & Fit</label>
                  <select 
                    value={formData.fitPreference}
                    onChange={(e) => setFormData({...formData, fitPreference: e.target.value})}
                    className="bg-[#0a0a0a] border border-white/10 rounded-xl p-4 text-white outline-none focus:border-cyan-400 transition-colors font-sans text-sm"
                  >
                    <option value="Tailored">Tailored / Form-fitting</option>
                    <option value="Oversized">Oversized / Relaxed</option>
                    <option value="Draped">Draped / Flowing</option>
                    <option value="Boxy">Boxy / Structured</option>
                  </select>
                </div>

                {/* 6. General Vibe */}
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] tracking-widest text-[#888888] uppercase font-bold">Target Aesthetic</label>
                  <input 
                    type="text"
                    value={formData.styleVibe}
                    onChange={(e) => setFormData({...formData, styleVibe: e.target.value})}
                    placeholder="e.g., Old Money, Streetwear..."
                    className="bg-[#0a0a0a] border border-white/10 rounded-xl p-4 text-white outline-none focus:border-cyan-400 transition-colors font-sans text-sm placeholder:text-[#555555]"
                  />
                </div>

              </div>

              {/* Action Button */}
              <div className="mt-12 flex justify-end">
                <button 
                  onClick={handleSaveToDatabase}
                  disabled={isAnalyzing}
                  className="px-10 py-4 bg-white text-black font-sans font-bold tracking-widest uppercase text-sm rounded-full hover:bg-gray-200 transition-colors flex items-center gap-3 shadow-[0_0_30px_rgba(255,255,255,0.2)] disabled:opacity-50"
                >
                  {isAnalyzing ? <Loader2 className="animate-spin text-black" size={18} /> : "Save & Initialize Matrix"} <ArrowRight size={18} />
                </button>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Global Style for Scanner Line */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
      `}} />
    </div>
  );
}