"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { useStyleStore } from "../../lib/store";
import { Sparkles, ArrowRight, Loader2, ShieldAlert, Key, User, Lock } from "lucide-react";

// ============================================================================
// BACKUP / DEV ACCOUNTS
// ============================================================================
const BACKUP_ACCOUNTS = [
  { id: "dev-ashish", name: "Ashish Agrawal", email: "ashish@stylesavvy.dev", role: "Lead Architect" },
  { id: "dev-manas", name: "Manas Sharma", email: "manas@stylesavvy.dev", role: "Developer" },
  { id: "dev-shriji", name: "Shriji Agarwal", email: "shriji@stylesavvy.dev", role: "Developer" },
  { id: "dev-saad", name: "Md Saad Alam", email: "saad@stylesavvy.dev", role: "Developer" }
];

const SHARED_PASSWORD = "123456789";

export default function Login() {
  const router = useRouter();
  const { setUser } = useStyleStore();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showDevAccess, setShowDevAccess] = useState(false);

  // --- STANDARD FIREBASE LOGIN ---
  const handleStandardLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      if (!auth) throw new Error("offline");
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // AuthProvider (if active) will catch this, but we route immediately
      router.push("/stylist");
    } catch (err) {
      if (err.message === "offline" || err.code === "auth/invalid-api-key") {
        setError("System Offline: Database connection severed. Use Dev Access.");
      } else {
        setError("Authentication failed. Check credentials.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // --- BYPASS / DEV LOGIN ---
  const handleBackupLogin = (account) => {
    setIsLoading(true);
    
    // Simulate slight network delay for realism
    setTimeout(() => {
      // Force inject the user into the global Zustand store
      setUser({
        uid: account.id,
        email: account.email,
        displayName: account.name,
        isDev: true
      });
      
      // Route to onboarding/dashboard
      router.push("/stylist");
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative px-6 bg-[#030303] overflow-hidden">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/4 right-1/4 w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="glass-pill w-full max-w-md p-10 rounded-[2.5rem] border border-white/10 z-10 relative overflow-hidden shadow-2xl"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-cyan-500" />
        
        <div className="text-center mb-10 relative">
          <Sparkles className="mx-auto text-cyan-400 mb-4" size={32} />
          <h2 className="font-serif text-4xl text-white mb-2">System Access</h2>
          <p className="font-sans text-[#888888] text-sm">Authenticate to sync your aesthetic.</p>
          
          {/* Secret Dev Toggle */}
          <button 
            onClick={() => setShowDevAccess(!showDevAccess)}
            className="absolute top-0 right-0 p-2 text-[#333333] hover:text-cyan-400 transition-colors"
            title="Toggle Developer Access"
          >
            <Key size={16} />
          </button>
        </div>

        <AnimatePresence mode="wait">
          {!showDevAccess ? (
            /* ==========================================
               STANDARD LOGIN FORM
               ========================================== */
            <motion.form 
              key="standard"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleStandardLogin} 
              className="space-y-6 flex flex-col"
            >
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl text-center flex items-center justify-center gap-2">
                  <ShieldAlert size={14} /> {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-sans font-bold text-[#888888] uppercase tracking-widest pl-1">Secure Email</label>
                <div className="relative">
                  <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#555555]" />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#0a0a0a]/50 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-sm text-white outline-none focus:border-cyan-500/50 transition-colors"
                    placeholder="architect@stylesavvy.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-sans font-bold text-[#888888] uppercase tracking-widest pl-1">Passcode</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#555555]" />
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#0a0a0a]/50 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-sm text-white outline-none focus:border-purple-500/50 transition-colors"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
              
              <button 
                type="submit"
                disabled={isLoading}
                className="w-full mt-4 bg-white text-black font-sans font-bold tracking-widest uppercase text-sm py-4 rounded-full hover:scale-[1.02] transition-transform shadow-[0_0_20px_rgba(255,255,255,0.1)] flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="animate-spin" size={18} /> : "Initialize Connection"} <ArrowRight size={16} />
              </button>
            </motion.form>
          ) : (
            /* ==========================================
               DEVELOPER QUICK ACCESS
               ========================================== */
            <motion.div 
              key="dev"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="mb-6 pb-4 border-b border-white/10 text-center">
                <h3 className="font-sans text-xs tracking-widest text-cyan-400 uppercase font-bold mb-1">Developer Override</h3>
                <p className="text-[10px] text-[#666666] uppercase">Bypassing Firebase Authentication</p>
              </div>

              {isLoading ? (
                <div className="py-12 flex flex-col items-center justify-center gap-4">
                  <Loader2 className="animate-spin text-cyan-400" size={32} />
                  <span className="font-sans text-xs tracking-widest uppercase text-[#888888]">Authenticating...</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {BACKUP_ACCOUNTS.map((account) => (
                    <button
                      key={account.id}
                      onClick={() => handleBackupLogin(account)}
                      className="w-full flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-cyan-500/30 transition-all group"
                    >
                      <div className="text-left">
                        <p className="font-sans text-sm text-white font-medium group-hover:text-cyan-400 transition-colors">{account.name}</p>
                        <p className="font-sans text-[10px] text-[#666666] uppercase tracking-widest">{account.role}</p>
                      </div>
                      <ArrowRight size={16} className="text-[#555555] group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                    </button>
                  ))}
                </div>
              )}
              
              <p className="text-center text-[10px] text-[#555555] mt-4 font-mono">
                Global Override Pass: {SHARED_PASSWORD}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

      </motion.div>
    </div>
  );
}