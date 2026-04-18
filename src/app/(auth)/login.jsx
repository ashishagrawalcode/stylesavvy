"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Eye, EyeOff, ArrowRight, Sparkles } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] },
  }),
};

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [focused, setFocused] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 1800));
    setIsLoading(false);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#050505] px-4">

      {/* ── Ambient background ── */}
      <motion.div
        animate={{ scale: [1, 1.15, 1], rotate: [0, 120, 0] }}
        transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[80vw] h-[80vw] max-w-[900px] max-h-[900px] rounded-full"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(155,89,255,0.12) 0%, rgba(6,182,212,0.05) 50%, transparent 70%)",
          filter: "blur(80px)",
        }}
      />
      <motion.div
        animate={{ scale: [1, 1.08, 1], rotate: [0, -90, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear", delay: 5 }}
        className="pointer-events-none absolute bottom-0 right-0 w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] rounded-full"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(0,212,255,0.07) 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
      />

      {/* ── Floating grid lines ── */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

      {/* ── Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-[420px] z-10"
      >
        {/* Glow halo behind card */}
        <div
          className="absolute -inset-px rounded-[28px] opacity-50 blur-xl"
          style={{
            background:
              "linear-gradient(135deg, rgba(155,89,255,0.15) 0%, rgba(0,212,255,0.1) 100%)",
          }}
        />

        <div
          className="relative rounded-[24px] overflow-hidden"
          style={{
            background: "rgba(10, 10, 14, 0.85)",
            backdropFilter: "blur(32px) saturate(180%)",
            WebkitBackdropFilter: "blur(32px) saturate(180%)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.06), 0 32px 80px rgba(0,0,0,0.7)",
          }}
        >
          {/* Top accent line */}
          <div
            className="absolute top-0 inset-x-0 h-px"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, rgba(155,89,255,0.6) 40%, rgba(0,212,255,0.6) 60%, transparent 100%)",
            }}
          />

          <div className="px-8 pt-10 pb-8">

            {/* Logo */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={0}
              className="flex items-center gap-2 mb-10"
            >
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, #9b59ff, #06b6d4)",
                  boxShadow: "0 0 16px rgba(155,89,255,0.4)",
                }}
              >
                <Sparkles size={14} className="text-white" />
              </div>
              <span className="font-serif text-xl text-white font-semibold tracking-tight">
                Style<span className="italic font-light text-gradient-neon">Savvy</span>
              </span>
            </motion.div>

            {/* Heading */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={1}
              className="mb-8"
            >
              <h1
                className="text-[28px] font-semibold text-white tracking-tight leading-tight mb-2"
                style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600 }}
              >
                Welcome back
              </h1>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "#6b6b6b", fontWeight: 400 }}
              >
                Sign in to sync your digital wardrobe.
              </p>
            </motion.div>

            {/* Social Buttons */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={2}
              className="grid grid-cols-2 gap-3 mb-6"
            >
              {["Google", "Apple"].map((provider) => (
                <button
                  key={provider}
                  className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm transition-all duration-200"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "#e0e0e0",
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 400,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.07)";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.14)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                  }}
                >
                  {provider === "Google" ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                  ) : (
                    <svg width="15" height="15" viewBox="0 0 814 1000" fill="currentColor" style={{ color: "#e0e0e0" }}>
                      <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-42.8-157.3-111.8C158.8 674.4 98.5 544.3 98.5 421.2c0-195.8 127.4-299.2 253.4-299.2 66.1 0 121.2 43.4 162.7 43.4 39.5 0 101.1-46 176.3-46 28.5 0 130.9 2.6 198.3 99.2zm-234-181.5c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z"/>
                    </svg>
                  )}
                  {provider}
                </button>
              ))}
            </motion.div>

            {/* Divider */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={3}
              className="flex items-center gap-4 mb-6"
            >
              <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
              <span className="text-xs" style={{ color: "#444", fontFamily: "'Inter', sans-serif" }}>
                or continue with email
              </span>
              <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
            </motion.div>

            {/* Form */}
            <motion.form
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={4}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              {/* Email */}
              <div className="space-y-1.5">
                <label
                  className="block text-[11px] uppercase tracking-[0.1em]"
                  style={{ color: "#555", fontFamily: "'Inter', sans-serif", fontWeight: 500 }}
                >
                  Email address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocused("email")}
                    onBlur={() => setFocused(null)}
                    placeholder="you@example.com"
                    className="input-field"
                    style={{
                      borderColor:
                        focused === "email"
                          ? "rgba(155,89,255,0.45)"
                          : "rgba(255,255,255,0.08)",
                      boxShadow:
                        focused === "email"
                          ? "0 0 0 3px rgba(155,89,255,0.1)"
                          : "none",
                    }}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    className="block text-[11px] uppercase tracking-[0.1em]"
                    style={{ color: "#555", fontFamily: "'Inter', sans-serif", fontWeight: 500 }}
                  >
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-[11px] transition-colors"
                    style={{ color: "#9b59ff", fontFamily: "'Inter', sans-serif" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#b07eff")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#9b59ff")}
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocused("password")}
                    onBlur={() => setFocused(null)}
                    placeholder="••••••••"
                    className="input-field pr-12"
                    style={{
                      borderColor:
                        focused === "password"
                          ? "rgba(0,212,255,0.4)"
                          : "rgba(255,255,255,0.08)",
                      boxShadow:
                        focused === "password"
                          ? "0 0 0 3px rgba(0,212,255,0.08)"
                          : "none",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
                    style={{ color: "#444" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#888")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#444")}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full relative overflow-hidden rounded-xl py-3.5 text-sm font-medium transition-all duration-200"
                  style={{
                    background: isLoading
                      ? "rgba(255,255,255,0.06)"
                      : "#ffffff",
                    color: isLoading ? "#555" : "#000000",
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 500,
                    border: "none",
                    cursor: isLoading ? "not-allowed" : "pointer",
                    boxShadow: isLoading
                      ? "none"
                      : "0 4px 20px rgba(255,255,255,0.1)",
                  }}
                  onMouseEnter={(e) => {
                    if (!isLoading) e.currentTarget.style.background = "#f0f0f0";
                  }}
                  onMouseLeave={(e) => {
                    if (!isLoading) e.currentTarget.style.background = "#ffffff";
                  }}
                >
                  <AnimatePresence mode="wait">
                    {isLoading ? (
                      <motion.span
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center justify-center gap-2"
                      >
                        {[0, 1, 2].map((i) => (
                          <span
                            key={i}
                            className="block w-1.5 h-1.5 rounded-full bg-zinc-500"
                            style={{
                              animation: `dotBlink 1.2s ease-in-out infinite`,
                              animationDelay: `${i * 0.2}s`,
                            }}
                          />
                        ))}
                      </motion.span>
                    ) : (
                      <motion.span
                        key="text"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center justify-center gap-2"
                      >
                        Sign In
                        <ArrowRight size={14} />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              </div>
            </motion.form>

            {/* Footer link */}
            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={5}
              className="text-center text-[13px] mt-6"
              style={{ color: "#444", fontFamily: "'Inter', sans-serif" }}
            >
              Don't have an account?{" "}
              <Link
                href="/signup"
                className="transition-colors"
                style={{ color: "#06b6d4" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#38d4ee")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#06b6d4")}
              >
                Create one →
              </Link>
            </motion.p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}