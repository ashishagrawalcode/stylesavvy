"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "../../lib/firebase";
import { useStyleStore } from "../../lib/store";
import {
  Sparkles, ArrowRight, Loader2, Eye, EyeOff,
  Mail, Lock, AlertCircle, Key,
} from "lucide-react";

// ─── Dev bypass accounts ─────────────────────────────────────────────────────
const BACKUP_ACCOUNTS = [
  { id: "dev-ashish", name: "Ashish Agrawal", email: "ashish@stylesavvy.dev", role: "Lead Architect" },
  { id: "dev-manas",  name: "Manas Sharma",   email: "manas@stylesavvy.dev",  role: "Developer" },
  { id: "dev-shriji", name: "Shriji Agarwal", email: "shriji@stylesavvy.dev", role: "Developer" },
  { id: "dev-saad",   name: "Md Saad Alam",   email: "saad@stylesavvy.dev",   role: "Developer" },
];
const gProvider = new GoogleAuthProvider();

// ─── Field wrapper ────────────────────────────────────────────────────────────
function Field({ label, icon: Icon, error, children }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#888]">{label}</label>
      <div className="relative">
        {Icon && <Icon size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#555] pointer-events-none" />}
        {children}
      </div>
      {error && (
        <p className="flex items-center gap-1 text-[11px] text-red-400">
          <AlertCircle size={11} />{error}
        </p>
      )}
    </div>
  );
}

// ─── Input class ──────────────────────────────────────────────────────────────
const inp = (hasErr) =>
  `w-full bg-[#0a0a14]/60 border ${hasErr ? "border-red-500/50" : "border-white/10"} rounded-2xl px-4 py-3.5 text-[13.5px] text-white placeholder-[#444] outline-none focus:border-[#a855f7]/50 transition-colors`;

// ═════════════════════════════════════════════════════════════════════════════
export default function Login() {
  const router = useRouter();
  const { setUser } = useStyleStore();

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [gLoading, setGLoading] = useState(false);
  const [error,    setError]    = useState("");
  const [showDev,  setShowDev]  = useState(false);

  // ── Email / Password login ────────────────────────────────────────────────
  async function handleLogin(e) {
    e?.preventDefault();
    if (!email || !password) { setError("Please fill in all fields."); return; }
    setLoading(true);
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (err) {
      const msg =
        err.code === "auth/user-not-found"     ? "No account found with this email." :
        err.code === "auth/wrong-password"      ? "Incorrect password. Try again." :
        err.code === "auth/invalid-email"       ? "Please enter a valid email." :
        err.code === "auth/invalid-api-key"     ? "Firebase offline. Use Dev Access below." :
        err.message;
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  // ── Google login ──────────────────────────────────────────────────────────
  async function handleGoogle() {
    setGLoading(true);
    setError("");
    try {
      const result = await signInWithPopup(auth, gProvider);
      const u = result.user;
      setUser({ uid: u.uid, email: u.email, displayName: u.displayName, photoURL: u.photoURL });
      router.push("/dashboard");
    } catch (err) {
      if (err.code !== "auth/popup-closed-by-user") setError(err.message);
    } finally {
      setGLoading(false);
    }
  }

  // ── Dev bypass ────────────────────────────────────────────────────────────
  function handleDevLogin(account) {
    setLoading(true);
    setTimeout(() => {
      setUser({ uid: account.id, email: account.email, displayName: account.name, isDev: true });
      router.push("/dashboard");
    }, 800);
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center relative px-4 py-10 overflow-hidden"
      style={{ background: "#080810" }}
    >
      {/* Ambient glows */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle,rgba(168,85,247,0.1) 0%,transparent 65%)", filter: "blur(80px)" }} />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle,rgba(6,182,212,0.07) 0%,transparent 65%)", filter: "blur(80px)" }} />

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-lg z-10"
        style={{
          background: "rgba(255,255,255,0.028)",
          border: "1px solid rgba(255,255,255,0.09)",
          borderRadius: "2.25rem",
          backdropFilter: "blur(40px)",
          boxShadow: "0 40px 100px rgba(0,0,0,0.6)",
          overflow: "hidden",
        }}
      >
        {/* Top gradient accent */}
        <div className="absolute top-0 inset-x-0 h-[1.5px]"
          style={{ background: "linear-gradient(90deg,transparent,#a855f7,#06b6d4,transparent)" }} />

        <div className="p-8 sm:p-10">
          {/* Header */}
          <div className="text-center mb-8 relative">
            <motion.div
              animate={{ rotate: [0, 15, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 4 }}
              className="inline-block mb-4"
            >
              <Sparkles size={30} style={{ color: "#a855f7" }} />
            </motion.div>
            <h1 className="text-3xl font-extrabold text-white mb-2" style={{ fontFamily: "'Playfair Display',serif", letterSpacing: "-0.03em" }}>
              Welcome Back
            </h1>
            <p className="text-[#666] text-[13px]">
              Don't have an account?{" "}
              <Link href="/signup" className="text-[#a855f7] hover:text-[#c084fc] transition-colors font-medium">
                Sign up free
              </Link>
            </p>

            {/* Hidden dev toggle */}
            <button
              onClick={() => setShowDev(v => !v)}
              className="absolute top-0 right-0 p-2 text-[#222] hover:text-[#555] transition-colors"
              title="Developer Access"
            >
              <Key size={14} />
            </button>
          </div>

          <AnimatePresence mode="wait">
            {/* ── Standard Login ── */}
            {!showDev ? (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-5"
              >
                {/* Google button */}
                <button
                  onClick={handleGoogle}
                  disabled={gLoading}
                  className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl text-[13.5px] font-semibold text-white transition-all duration-300 hover:bg-white/[0.07] disabled:opacity-50"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" }}
                >
                  {gLoading ? (
                    <Loader2 size={17} className="animate-spin" />
                  ) : (
                    <>
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                      Continue with Google
                    </>
                  )}
                </button>

                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
                  <span className="text-[11px] text-[#444] uppercase tracking-widest">or</span>
                  <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
                </div>

                {error && (
                  <div className="p-3.5 rounded-2xl flex items-start gap-2 text-[12.5px] text-red-300"
                    style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
                    <AlertCircle size={14} className="shrink-0 mt-0.5" />{error}
                  </div>
                )}

                <Field label="Email Address" icon={Mail}>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="alex@example.com"
                    className={inp(false) + " pl-11"}
                    onKeyDown={e => e.key === "Enter" && handleLogin()}
                  />
                </Field>

                <Field label="Password" icon={Lock}>
                  <input
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={inp(false) + " pl-11 pr-11"}
                    onKeyDown={e => e.key === "Enter" && handleLogin()}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(v => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#555] hover:text-[#999] transition-colors"
                  >
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </Field>

                <div className="flex justify-end">
                  <Link href="/login" className="text-[11px] text-[#555] hover:text-[#a855f7] transition-colors">
                    Forgot password?
                  </Link>
                </div>

                <button
                  onClick={handleLogin}
                  disabled={loading}
                  className="group w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl font-bold text-[13.5px] text-white transition-all duration-300 disabled:opacity-50"
                  style={{
                    background: "linear-gradient(135deg,#a855f7 0%,#7c3aed 45%,#06b6d4 100%)",
                    boxShadow: "0 4px 28px rgba(168,85,247,0.4)",
                  }}
                >
                  {loading ? <Loader2 size={17} className="animate-spin" /> : <>Sign In <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" /></>}
                </button>
              </motion.div>
            ) : (
              /* ── Dev Bypass ── */
              <motion.div
                key="dev"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.35 }}
                className="space-y-3"
              >
                <div className="mb-4 pb-3 border-b border-white/10 text-center">
                  <p className="text-[10px] text-[#555] uppercase tracking-widest">Developer Override</p>
                </div>
                {loading ? (
                  <div className="py-10 flex flex-col items-center gap-3">
                    <Loader2 className="animate-spin text-[#a855f7]" size={28} />
                    <span className="text-xs text-[#555]">Authenticating…</span>
                  </div>
                ) : (
                  BACKUP_ACCOUNTS.map(acc => (
                    <button
                      key={acc.id}
                      onClick={() => handleDevLogin(acc)}
                      className="w-full flex items-center justify-between p-4 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-purple-500/30 transition-all group"
                    >
                      <div className="text-left">
                        <p className="text-sm text-white font-medium group-hover:text-[#c084fc] transition-colors">{acc.name}</p>
                        <p className="text-[10px] text-[#555] uppercase tracking-widest">{acc.role}</p>
                      </div>
                      <ArrowRight size={14} className="text-[#444] group-hover:text-[#a855f7] group-hover:translate-x-1 transition-all" />
                    </button>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}