"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../lib/firebase";
import { useStyleStore } from "../../lib/store";
import {
  Sparkles, ArrowRight, ArrowLeft, Loader2, Eye, EyeOff,
  User, Mail, Lock, CheckCircle, AlertCircle, Chrome,
} from "lucide-react";

// ─── Step config ────────────────────────────────────────────────────────────
const STEPS = [
  { id: "account",  label: "Account",   num: 1 },
  { id: "profile",  label: "Profile",   num: 2 },
  { id: "style",    label: "Style DNA", num: 3 },
];

const BODY_TYPES    = ["Rectangle","Pear","Hourglass","Athletic","Inverted Triangle","Apple"];
const STYLE_VIBES   = ["Minimal","Streetwear","Formal","Casual","Y2K","Bohemian","Preppy","Dark Academia"];
const SKIN_TONES    = [
  { label: "Fair",      color: "#FFE0BD" },
  { label: "Light",     color: "#F1C27D" },
  { label: "Medium",    color: "#C68642" },
  { label: "Olive",     color: "#8D5524" },
  { label: "Tan",       color: "#7B4A2D" },
  { label: "Deep",      color: "#4A2912" },
];
const OCCASIONS     = ["Daily Casual","Work / Office","Date Night","Travel","Gym","Formal Events","Parties","Outdoor"];

// ─── Field component ────────────────────────────────────────────────────────
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

// ─── Password strength ──────────────────────────────────────────────────────
function strengthScore(pw) {
  let s = 0;
  if (pw.length >= 8)            s++;
  if (/[A-Z]/.test(pw))         s++;
  if (/[0-9]/.test(pw))         s++;
  if (/[^A-Za-z0-9]/.test(pw))  s++;
  return s; // 0-4
}
const STR_LABELS = ["", "Weak", "Fair", "Good", "Strong"];
const STR_COLORS = ["", "#ef4444", "#f97316", "#eab308", "#22c55e"];

// ─── Google provider ────────────────────────────────────────────────────────
const gProvider = new GoogleAuthProvider();

// ════════════════════════════════════════════════════════════════════════════
export default function Signup() {
  const router   = useRouter();
  const { setUser } = useStyleStore();

  // ── Step state ──
  const [step, setStep] = useState(0); // 0-based index into STEPS

  // ── Step 1: Account ──
  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [showCf,   setShowCf]   = useState(false);

  // ── Step 2: Profile ──
  const [height,    setHeight]    = useState("");
  const [weight,    setWeight]    = useState("");
  const [bodyType,  setBodyType]  = useState("");
  const [skinTone,  setSkinTone]  = useState("");

  // ── Step 3: Style DNA ──
  const [vibes,     setVibes]     = useState([]);
  const [occasions, setOccasions] = useState([]);
  const [gender,    setGender]    = useState("");

  // ── UI state ──
  const [errors,    setErrors]    = useState({});
  const [loading,   setLoading]   = useState(false);
  const [gLoading,  setGLoading]  = useState(false);
  const [success,   setSuccess]   = useState(false);

  const strength = strengthScore(password);

  // ── Validation ───────────────────────────────────────────────────────────
  function validateStep0() {
    const e = {};
    if (!name.trim())                      e.name     = "Name is required";
    if (!/\S+@\S+\.\S+/.test(email))       e.email    = "Valid email required";
    if (password.length < 8)              e.password = "Minimum 8 characters";
    if (password !== confirm)             e.confirm  = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function validateStep1() {
    const e = {};
    if (!height)                           e.height   = "Enter your height";
    if (!weight)                           e.weight   = "Enter your weight";
    if (!bodyType)                         e.bodyType = "Select a body type";
    if (!skinTone)                         e.skinTone = "Select a skin tone";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function validateStep2() {
    const e = {};
    if (!gender)                           e.gender   = "Select your gender";
    if (vibes.length === 0)               e.vibes    = "Pick at least one vibe";
    if (occasions.length === 0)           e.occasions= "Pick at least one occasion";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function nextStep() {
    const validators = [validateStep0, validateStep1, validateStep2];
    if (validators[step]()) setStep(s => s + 1);
  }

  function prevStep() {
    setErrors({});
    setStep(s => s - 1);
  }

  function toggleArr(arr, setArr, val) {
    setArr(prev => prev.includes(val) ? prev.filter(x => x !== val) : [...prev, val]);
  }

  // ── Write user profile to Firestore ─────────────────────────────────────
  async function writeUserDoc(uid, extra = {}) {
    await setDoc(doc(db, "users", uid), {
      uid,
      displayName: name || extra.displayName || "",
      email: email || extra.email || "",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      profileComplete: step >= 2,
      styleDNA: {
        height:    height  || "",
        weight:    weight  || "",
        bodyType:  bodyType|| "",
        skinTone:  skinTone|| "",
        gender:    gender  || "",
        vibes,
        occasions,
      },
      ...extra,
    });
  }

  // ── Email/Password signup ────────────────────────────────────────────────
  async function handleSignup() {
    if (!validateStep2()) return;
    setLoading(true);
    setErrors({});

    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name });
      await writeUserDoc(cred.user.uid);
      try { await sendEmailVerification(cred.user); } catch {}

      setUser({
        uid:         cred.user.uid,
        email:       cred.user.email,
        displayName: name,
      });

      setSuccess(true);
      setTimeout(() => router.push("/stylist"), 1800);
    } catch (err) {
      const msg = err.code === "auth/email-already-in-use"
        ? "This email is already registered. Try logging in."
        : err.code === "auth/invalid-api-key"
        ? "Firebase not configured. Check .env.local"
        : err.message;
      setErrors({ submit: msg });
    } finally {
      setLoading(false);
    }
  }

  // ── Google signup ────────────────────────────────────────────────────────
  async function handleGoogle() {
    setGLoading(true);
    setErrors({});
    try {
      const result = await signInWithPopup(auth, gProvider);
      const u = result.user;
      await writeUserDoc(u.uid, {
        displayName: u.displayName || "",
        email: u.email || "",
        photoURL: u.photoURL || "",
        profileComplete: false,
      });
      setUser({ uid: u.uid, email: u.email, displayName: u.displayName });
      setSuccess(true);
      setTimeout(() => router.push("/stylist"), 1600);
    } catch (err) {
      if (err.code !== "auth/popup-closed-by-user") {
        setErrors({ submit: err.message });
      }
    } finally {
      setGLoading(false);
    }
  }

  // ════════════════════════════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════════════════════════════
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#030308]">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center gap-6 text-center px-6"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{ background: "linear-gradient(135deg,#a855f7,#06b6d4)" }}
          >
            <CheckCircle size={38} color="#fff" />
          </motion.div>
          <h2 className="text-3xl font-bold text-white" style={{ fontFamily: "'Syne',sans-serif" }}>
            Welcome to StyleSavvy
          </h2>
          <p className="text-[#666] text-sm">Your style universe is ready. Taking you to the AI Stylist…</p>
          <Loader2 size={20} className="animate-spin text-[#a855f7]" />
        </motion.div>
      </div>
    );
  }

  // ── Input class helper ──
  const inp = (hasErr) =>
    `w-full bg-[#0a0a14]/60 border ${hasErr ? "border-red-500/50" : "border-white/10"} rounded-2xl px-4 py-3.5 text-[13.5px] text-white placeholder-[#444] outline-none focus:border-[#a855f7]/50 transition-colors`;

  return (
    <div
      className="min-h-screen flex items-center justify-center relative px-4 py-10 overflow-hidden"
      style={{ background: "#030308" }}
    >
      {/* Ambient glows */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle,rgba(168,85,247,0.13) 0%,transparent 65%)", filter: "blur(80px)" }} />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle,rgba(6,182,212,0.1) 0%,transparent 65%)", filter: "blur(80px)" }} />

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
        {/* Top gradient line */}
        <div className="absolute top-0 inset-x-0 h-[1.5px]"
          style={{ background: "linear-gradient(90deg,transparent,#a855f7,#06b6d4,transparent)" }} />

        <div className="p-8 sm:p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              animate={{ rotate: [0, 15, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 4 }}
              className="inline-block mb-4"
            >
              <Sparkles size={30} style={{ color: "#a855f7" }} />
            </motion.div>
            <h1 className="text-3xl font-extrabold text-white mb-2" style={{ fontFamily: "'Syne',sans-serif", letterSpacing: "-0.03em" }}>
              Create Account
            </h1>
            <p className="text-[#666] text-[13px]">
              Already a member?{" "}
              <Link href="/login" className="text-[#a855f7] hover:text-[#c084fc] transition-colors font-medium">
                Sign in
              </Link>
            </p>
          </div>

          {/* Step indicator */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center gap-2">
                <div
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all duration-400"
                  style={{
                    background: i < step ? "rgba(168,85,247,0.2)" : i === step ? "rgba(168,85,247,0.15)" : "rgba(255,255,255,0.04)",
                    border: i <= step ? "1px solid rgba(168,85,247,0.35)" : "1px solid rgba(255,255,255,0.07)",
                    color: i < step ? "#c084fc" : i === step ? "#a855f7" : "#444",
                  }}
                >
                  {i < step ? <CheckCircle size={11} /> : <span>{s.num}</span>}
                  <span className="hidden sm:inline">{s.label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="w-6 h-px" style={{ background: i < step ? "rgba(168,85,247,0.4)" : "rgba(255,255,255,0.08)" }} />
                )}
              </div>
            ))}
          </div>

          {/* ── STEP PANELS ── */}
          <AnimatePresence mode="wait">

            {/* ──────────── STEP 0: Account ──────────── */}
            {step === 0 && (
              <motion.div
                key="s0"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
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

                <Field label="Full Name" icon={User} error={errors.name}>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Alex Sharma"
                    className={inp(errors.name) + " pl-11"}
                  />
                </Field>

                <Field label="Email Address" icon={Mail} error={errors.email}>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="alex@example.com"
                    className={inp(errors.email) + " pl-11"}
                  />
                </Field>

                <Field label="Password" icon={Lock} error={errors.password}>
                  <input
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    className={inp(errors.password) + " pl-11 pr-11"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(v => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#555] hover:text-[#999] transition-colors"
                  >
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </Field>

                {/* Strength bar */}
                {password.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="flex gap-1">
                      {[1,2,3,4].map(i => (
                        <div key={i} className="flex-1 h-1 rounded-full transition-all duration-400"
                          style={{ background: i <= strength ? STR_COLORS[strength] : "rgba(255,255,255,0.07)" }} />
                      ))}
                    </div>
                    <p className="text-[10.5px]" style={{ color: STR_COLORS[strength] }}>
                      {STR_LABELS[strength]} password
                    </p>
                  </div>
                )}

                <Field label="Confirm Password" icon={Lock} error={errors.confirm}>
                  <input
                    type={showCf ? "text" : "password"}
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    placeholder="Re-enter password"
                    className={inp(errors.confirm) + " pl-11 pr-11"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCf(v => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#555] hover:text-[#999] transition-colors"
                  >
                    {showCf ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </Field>

                {errors.submit && (
                  <div className="p-3.5 rounded-2xl flex items-start gap-2 text-[12.5px] text-red-300"
                    style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
                    <AlertCircle size={14} className="shrink-0 mt-0.5" />{errors.submit}
                  </div>
                )}

                <ActionBtn onClick={nextStep}>
                  Continue <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                </ActionBtn>

                <p className="text-center text-[11px] text-[#444] leading-relaxed">
                  By signing up you agree to our{" "}
                  <span className="text-[#a855f7] cursor-pointer">Terms</span> &{" "}
                  <span className="text-[#a855f7] cursor-pointer">Privacy Policy</span>
                </p>
              </motion.div>
            )}

            {/* ──────────── STEP 1: Physical Profile ──────────── */}
            {step === 1 && (
              <motion.div
                key="s1"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-6"
              >
                <div className="mb-2">
                  <h3 className="text-white font-bold text-base mb-1" style={{ fontFamily: "'Syne',sans-serif" }}>
                    Your Physical Profile
                  </h3>
                  <p className="text-[#555] text-[12.5px]">This helps the AI personalise fits for your exact proportions.</p>
                </div>

                {/* Height + Weight */}
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Height (cm)" error={errors.height}>
                    <input
                      type="number"
                      value={height}
                      onChange={e => setHeight(e.target.value)}
                      placeholder="170"
                      min={100} max={230}
                      className={inp(errors.height)}
                    />
                  </Field>
                  <Field label="Weight (kg)" error={errors.weight}>
                    <input
                      type="number"
                      value={weight}
                      onChange={e => setWeight(e.target.value)}
                      placeholder="65"
                      min={30} max={200}
                      className={inp(errors.weight)}
                    />
                  </Field>
                </div>

                {/* Body type */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#888]">Body Type</label>
                  <div className="grid grid-cols-3 gap-2">
                    {BODY_TYPES.map(bt => (
                      <button
                        key={bt}
                        onClick={() => setBodyType(bt)}
                        className="py-2.5 rounded-xl text-[12px] font-medium transition-all duration-250"
                        style={{
                          background: bodyType === bt ? "rgba(168,85,247,0.18)" : "rgba(255,255,255,0.04)",
                          border: bodyType === bt ? "1px solid rgba(168,85,247,0.4)" : "1px solid rgba(255,255,255,0.07)",
                          color: bodyType === bt ? "#c084fc" : "#555",
                        }}
                      >
                        {bt}
                      </button>
                    ))}
                  </div>
                  {errors.bodyType && <p className="text-red-400 text-[11px] flex items-center gap-1"><AlertCircle size={11}/>{errors.bodyType}</p>}
                </div>

                {/* Skin tone */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#888]">Skin Tone</label>
                  <div className="flex gap-3 flex-wrap">
                    {SKIN_TONES.map(st => (
                      <button
                        key={st.label}
                        onClick={() => setSkinTone(st.label)}
                        className="flex flex-col items-center gap-1.5 group"
                        title={st.label}
                      >
                        <div
                          className="w-9 h-9 rounded-full transition-all duration-250"
                          style={{
                            background: st.color,
                            border: skinTone === st.label ? "2px solid #a855f7" : "2px solid rgba(255,255,255,0.12)",
                            boxShadow: skinTone === st.label ? `0 0 12px rgba(168,85,247,0.5)` : "none",
                            transform: skinTone === st.label ? "scale(1.15)" : "scale(1)",
                          }}
                        />
                        <span className="text-[9.5px]" style={{ color: skinTone === st.label ? "#c084fc" : "#444" }}>{st.label}</span>
                      </button>
                    ))}
                  </div>
                  {errors.skinTone && <p className="text-red-400 text-[11px] flex items-center gap-1"><AlertCircle size={11}/>{errors.skinTone}</p>}
                </div>

                <div className="flex gap-3 pt-2">
                  <BackBtn onClick={prevStep} />
                  <ActionBtn onClick={nextStep} flex>
                    Continue <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                  </ActionBtn>
                </div>
              </motion.div>
            )}

            {/* ──────────── STEP 2: Style DNA ──────────── */}
            {step === 2 && (
              <motion.div
                key="s2"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-6"
              >
                <div className="mb-2">
                  <h3 className="text-white font-bold text-base mb-1" style={{ fontFamily: "'Syne',sans-serif" }}>
                    Your Style DNA
                  </h3>
                  <p className="text-[#555] text-[12.5px]">Teach the AI your aesthetic so it curates perfectly for you.</p>
                </div>

                {/* Gender */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#888]">I shop for</label>
                  <div className="flex gap-2">
                    {["Men","Women","All / Non-binary"].map(g => (
                      <button
                        key={g}
                        onClick={() => setGender(g)}
                        className="flex-1 py-3 rounded-xl text-[12px] font-medium transition-all duration-250"
                        style={{
                          background: gender === g ? "rgba(168,85,247,0.18)" : "rgba(255,255,255,0.04)",
                          border: gender === g ? "1px solid rgba(168,85,247,0.4)" : "1px solid rgba(255,255,255,0.07)",
                          color: gender === g ? "#c084fc" : "#555",
                        }}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                  {errors.gender && <p className="text-red-400 text-[11px] flex items-center gap-1"><AlertCircle size={11}/>{errors.gender}</p>}
                </div>

                {/* Style vibes */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#888]">Style Vibes <span className="text-[#444] normal-case tracking-normal">(pick all that apply)</span></label>
                  <div className="flex flex-wrap gap-2">
                    {STYLE_VIBES.map(v => {
                      const on = vibes.includes(v);
                      return (
                        <button
                          key={v}
                          onClick={() => toggleArr(vibes, setVibes, v)}
                          className="px-3.5 py-2 rounded-full text-[12px] font-medium transition-all duration-250"
                          style={{
                            background: on ? "rgba(168,85,247,0.18)" : "rgba(255,255,255,0.04)",
                            border: on ? "1px solid rgba(168,85,247,0.4)" : "1px solid rgba(255,255,255,0.07)",
                            color: on ? "#c084fc" : "#555",
                          }}
                        >
                          {on && "✓ "}{v}
                        </button>
                      );
                    })}
                  </div>
                  {errors.vibes && <p className="text-red-400 text-[11px] flex items-center gap-1"><AlertCircle size={11}/>{errors.vibes}</p>}
                </div>

                {/* Occasions */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#888]">Occasions <span className="text-[#444] normal-case tracking-normal">(pick all that apply)</span></label>
                  <div className="flex flex-wrap gap-2">
                    {OCCASIONS.map(o => {
                      const on = occasions.includes(o);
                      return (
                        <button
                          key={o}
                          onClick={() => toggleArr(occasions, setOccasions, o)}
                          className="px-3.5 py-2 rounded-full text-[12px] font-medium transition-all duration-250"
                          style={{
                            background: on ? "rgba(6,182,212,0.15)" : "rgba(255,255,255,0.04)",
                            border: on ? "1px solid rgba(6,182,212,0.35)" : "1px solid rgba(255,255,255,0.07)",
                            color: on ? "#67e8f9" : "#555",
                          }}
                        >
                          {on && "✓ "}{o}
                        </button>
                      );
                    })}
                  </div>
                  {errors.occasions && <p className="text-red-400 text-[11px] flex items-center gap-1"><AlertCircle size={11}/>{errors.occasions}</p>}
                </div>

                {errors.submit && (
                  <div className="p-3.5 rounded-2xl flex items-start gap-2 text-[12.5px] text-red-300"
                    style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
                    <AlertCircle size={14} className="shrink-0 mt-0.5" />{errors.submit}
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <BackBtn onClick={prevStep} />
                  <button
                    onClick={handleSignup}
                    disabled={loading}
                    className="group flex-1 flex items-center justify-center gap-2.5 py-4 rounded-2xl font-bold text-[13.5px] text-white transition-all duration-300 disabled:opacity-50"
                    style={{
                      background: "linear-gradient(135deg,#a855f7 0%,#7c3aed 45%,#06b6d4 100%)",
                      boxShadow: "0 4px 28px rgba(168,85,247,0.4)",
                    }}
                  >
                    {loading
                      ? <><Loader2 size={17} className="animate-spin" />Creating your universe…</>
                      : <><Sparkles size={15} />Launch StyleSavvy</>
                    }
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────
function ActionBtn({ onClick, children, flex }) {
  return (
    <button
      onClick={onClick}
      className={`group ${flex ? "flex-1" : "w-full"} flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-[13.5px] text-white transition-all duration-300 hover:opacity-90 hover:scale-[1.01]`}
      style={{
        background: "linear-gradient(135deg,#a855f7 0%,#7c3aed 50%,#06b6d4 100%)",
        boxShadow: "0 4px 24px rgba(168,85,247,0.35)",
      }}
    >
      {children}
    </button>
  );
}

function BackBtn({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center gap-2 px-5 py-4 rounded-2xl font-semibold text-[13px] text-[#666] transition-all duration-300 hover:text-white hover:bg-white/[0.06]"
      style={{ border: "1px solid rgba(255,255,255,0.08)" }}
    >
      <ArrowLeft size={15} />Back
    </button>
  );
}