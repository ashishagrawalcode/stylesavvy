"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  ArrowUpRight,
  Wand2,
  ArrowRight,
  CheckCircle,
  Mail,
  MapPin,
  Zap,
} from "lucide-react";
import { FaTwitter, FaInstagram, FaGithub } from "react-icons/fa";

/* ─────────────────────────────────────────
   DATA
───────────────────────────────────────── */
const footerLinks = {
  Product: [
    { label: "AI Stylist", href: "/stylist" },
    { label: "Roomspace 3D", href: "/roomspace" },
    { label: "Wardrobe", href: "/wardrobe" },
    { label: "Shop", href: "/shop" },
    { label: "Trend Radar", href: "/stylist/trends" },
  ],
  Company: [
    { label: "About", href: "/about" },
    { label: "Blog", href: "/blog" },
    { label: "Careers", href: "/careers" },
    { label: "Press Kit", href: "/press" },
    { label: "Contact", href: "/contact" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Cookie Policy", href: "/cookies" },
    { label: "Accessibility", href: "/accessibility" },
  ],
};

const socials = [
  { icon: FaTwitter, href: "https://twitter.com", label: "Twitter", hoverColor: "#1d9bf0" },
  { icon: FaInstagram, href: "https://instagram.com", label: "Instagram", hoverColor: "#e1306c" },
  { icon: FaGithub, href: "https://github.com", label: "GitHub", hoverColor: "#e0e0e0" },
];

const stats = [
  { value: "50K+", label: "Wardrobes Digitized" },
  { value: "2M+", label: "Outfits Generated" },
  { value: "98%", label: "Satisfaction Rate" },
];

/* ─────────────────────────────────────────
   LOGO — identical to Navbar
───────────────────────────────────────── */
import StyleSavvyLogo from "../ui/StyleSavvyLogo";

function FooterLogo() {
  return (
    <Link href="/" className="flex items-center group w-fit">
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        style={{ transformOrigin: "left center" }}
      >
        <StyleSavvyLogo scale={0.6} />
      </motion.div>
    </Link>
  );
}

/* ─────────────────────────────────────────
   NEWSLETTER
───────────────────────────────────────── */
function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");
    await new Promise((r) => setTimeout(r, 1200));
    setStatus("success");
    setEmail("");
  };

  return (
    <div>
      <p
        className="text-[10px] uppercase tracking-[0.15em] mb-2"
        style={{ color: "#444", fontWeight: 500, fontFamily: "'Inter', sans-serif" }}
      >
        Trend Alerts
      </p>
      <p
        className="text-sm mb-4 leading-relaxed"
        style={{ color: "#4a4a4a", fontFamily: "'Inter', sans-serif", fontWeight: 400 }}
      >
        Weekly AI-curated fashion drops to your inbox.
      </p>

      <AnimatePresence mode="wait">
        {status === "success" ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-2.5 px-4 py-3 rounded-xl"
            style={{
              background: "rgba(16,185,129,0.1)",
              border: "1px solid rgba(16,185,129,0.2)",
            }}
          >
            <CheckCircle size={14} style={{ color: "#10b981", flexShrink: 0 }} />
            <p className="text-sm" style={{ color: "#10b981", fontFamily: "'Inter', sans-serif" }}>
              You&apos;re in! First drop lands soon.
            </p>
          </motion.div>
        ) : (
          <motion.form key="form" onSubmit={handleSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Mail size={12} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#444" }} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full pl-8 pr-3 py-3 text-sm rounded-xl outline-none transition-all"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.09)",
                  color: "#e0e0e0",
                  fontFamily: "'Inter', sans-serif",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "rgba(155,89,255,0.4)";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(155,89,255,0.08)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
            </div>
            <motion.button
              type="submit"
              disabled={status === "loading" || !email.trim()}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="px-4 py-3 rounded-xl text-sm flex items-center gap-1 shrink-0"
              style={{
                background: email.trim()
                  ? "linear-gradient(135deg, #9b59ff, #06b6d4)"
                  : "rgba(255,255,255,0.06)",
                color: email.trim() ? "#fff" : "#444",
                fontFamily: "'Inter', sans-serif",
                fontWeight: 500,
                border: "none",
                cursor: email.trim() ? "pointer" : "default",
                boxShadow: email.trim() ? "0 0 16px rgba(155,89,255,0.35)" : "none",
                transition: "all 0.2s ease",
              }}
            >
              {status === "loading" ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 0.7, ease: "linear" }}
                >
                  <Zap size={14} />
                </motion.div>
              ) : (
                <>Join <ArrowRight size={12} /></>
              )}
            </motion.button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────────────────────────────
   ANIMATED LINK
───────────────────────────────────────── */
function FooterLink({ href, label, delay, inView }) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.li
      initial={{ opacity: 0, x: -10 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link
        href={href}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="flex items-center gap-1"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        <motion.span
          animate={{ color: hovered ? "#d0d0d0" : "#4a4a4a" }}
          transition={{ duration: 0.15 }}
          style={{ fontSize: 14, fontWeight: 400 }}
        >
          {label}
        </motion.span>
        <motion.span
          animate={{ opacity: hovered ? 1 : 0, x: hovered ? 0 : -4 }}
          transition={{ duration: 0.15 }}
        >
          <ArrowUpRight size={10} style={{ color: "#06b6d4" }} />
        </motion.span>
      </Link>
    </motion.li>
  );
}

/* ─────────────────────────────────────────
   MAIN FOOTER
───────────────────────────────────────── */
export default function Footer() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [hoveredSocial, setHoveredSocial] = useState(null);

  return (
    <footer
      ref={ref}
      className="relative mt-24 overflow-hidden"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Ambient glows */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 w-[50vw] h-[50vh]"
        style={{
          background: "radial-gradient(ellipse at bottom left, rgba(155,89,255,0.06) 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
      />
      <div
        className="pointer-events-none absolute bottom-0 right-0 w-[40vw] h-[40vh]"
        style={{
          background: "radial-gradient(ellipse at bottom right, rgba(6,182,212,0.05) 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
      />

      {/* Top animated line */}
      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        animate={isInView ? { scaleX: 1, opacity: 1 } : {}}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="absolute top-0 inset-x-0 h-px origin-left"
        style={{
          background: "linear-gradient(90deg, transparent 0%, rgba(155,89,255,0.5) 30%, rgba(6,182,212,0.4) 70%, transparent 100%)",
        }}
      />

      <div style={{ background: "rgba(6,6,8,0.92)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)" }}>

        {/* Stats row */}
        <div style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
          <div className="max-w-7xl mx-auto px-6 py-7">
            <div className="grid grid-cols-3 gap-4">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 14 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.1 + i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="text-center md:text-left"
                >
                  <p
                    className="text-2xl md:text-3xl leading-none mb-1"
                    style={{
                      background: "linear-gradient(135deg, #e0e0e0, #666)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                      fontWeight: 600,
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    {stat.value}
                  </p>
                  <p className="text-xs" style={{ color: "#3a3a3a", fontWeight: 400 }}>
                    {stat.label}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="max-w-7xl mx-auto px-6 pt-14 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 mb-14">

            {/* Brand col — 2 */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="mb-5">
                  <FooterLogo />
                </div>

                <p
                  className="text-sm leading-relaxed mb-5 max-w-[280px]"
                  style={{ color: "#4a4a4a", fontWeight: 400 }}
                >
                  The intelligent fashion ecosystem. AI-powered curation meets your unique geometry.
                </p>

                <div className="flex items-center gap-1.5 mb-7">
                  <MapPin size={11} style={{ color: "#3a3a3a" }} />
                  <span className="text-xs" style={{ color: "#3a3a3a" }}>
                    San Francisco, CA
                  </span>
                </div>

                {/* Socials */}
                <div className="flex items-center gap-2 mb-8">
                  {socials.map(({ icon: Icon, href, label, hoverColor }) => (
                    <motion.a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ y: -3, scale: 1.06 }}
                      whileTap={{ scale: 0.93 }}
                      onMouseEnter={() => setHoveredSocial(label)}
                      onMouseLeave={() => setHoveredSocial(null)}
                      aria-label={label}
                      className="w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-200"
                      style={{
                        background: hoveredSocial === label ? `${hoverColor}18` : "rgba(255,255,255,0.04)",
                        border: hoveredSocial === label ? `1px solid ${hoverColor}40` : "1px solid rgba(255,255,255,0.08)",
                        color: hoveredSocial === label ? hoverColor : "#4a4a4a",
                      }}
                    >
                      <Icon size={14} />
                    </motion.a>
                  ))}
                </div>

                <NewsletterForm />
              </motion.div>
            </div>

            {/* Link cols — 4 */}
            <div className="lg:col-span-4 grid grid-cols-2 md:grid-cols-3 gap-10">
              {Object.entries(footerLinks).map(([section, items], si) => (
                <div key={section}>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={isInView ? { opacity: 1 } : {}}
                    transition={{ delay: 0.2 + si * 0.08, duration: 0.5 }}
                    className="text-[10px] uppercase tracking-[0.15em] mb-5"
                    style={{ color: "#333", fontWeight: 500 }}
                  >
                    {section}
                  </motion.p>
                  <ul className="space-y-3.5">
                    {items.map((item, ii) => (
                      <FooterLink
                        key={item.label}
                        href={item.href}
                        label={item.label}
                        delay={0.25 + si * 0.05 + ii * 0.04}
                        inView={isInView}
                      />
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.6, duration: 0.7 }}
            className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6"
            style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}
          >
            <p className="text-xs" style={{ color: "#2e2e2e", fontWeight: 400 }}>
              © 2025 StyleSavvy, Inc. All rights reserved.
            </p>

            {/* Animated status pill */}
            <motion.div
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full"
              style={{
                background: "rgba(16,185,129,0.07)",
                border: "1px solid rgba(16,185,129,0.15)",
              }}
            >
              <motion.span
                animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                className="block w-1.5 h-1.5 rounded-full"
                style={{ background: "#10b981", boxShadow: "0 0 6px rgba(16,185,129,0.9)" }}
              />
              <span className="text-xs" style={{ color: "#10b981" }}>
                All systems operational
              </span>
            </motion.div>

            {/* Back to top */}
            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="text-xs"
              style={{
                color: "#333",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                fontFamily: "'Inter', sans-serif",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#888")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#333")}
            >
              Back to top ↑
            </motion.button>
          </motion.div>
        </div>
      </div>
    </footer>
  );
}