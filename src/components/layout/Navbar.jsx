"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  motion,
  useScroll,
  useMotionValueEvent,
  AnimatePresence,
} from "framer-motion";
import {
  Wand2,
  Box,
  Shirt,
  ShoppingBag,
  Menu,
  X,
  ChevronDown,
  Sparkles,
  Zap,
  TrendingUp,
  User,
  LogIn,
  UserPlus,
  ArrowRight,
  Star,
  Layers,
} from "lucide-react";
import { cn } from "../../lib/utils";

/* ─────────────────────────────────────────
   NAV DATA
───────────────────────────────────────── */
const navLinks = [
  {
    name: "Stylist",
    href: "/stylist",
    icon: Wand2,
    description: "AI-powered outfit curation",
    hasDropdown: true,
    dropdown: [
      {
        label: "AI Outfit Generator",
        desc: "Neural engine builds your look",
        href: "/stylist",
        icon: Zap,
      },
      {
        label: "Style Profile",
        desc: "Tune your aesthetic DNA",
        href: "/stylist/profile",
        icon: User,
      },
      {
        label: "Trend Radar",
        desc: "Real-time fashion intelligence",
        href: "/stylist/trends",
        icon: TrendingUp,
      },
      {
        label: "Occasion Planner",
        desc: "Perfect fits for any event",
        href: "/stylist/occasions",
        icon: Star,
      },
    ],
  },
  {
    name: "Roomspace",
    href: "/roomspace",
    icon: Box,
    description: "3D wardrobe lobby",
    hasDropdown: false,
  },
  {
    name: "Wardrobe",
    href: "/wardrobe",
    icon: Shirt,
    description: "Digital closet manager",
    hasDropdown: true,
    dropdown: [
      {
        label: "My Closet",
        desc: "Browse & organise garments",
        href: "/wardrobe",
        icon: Shirt,
      },
      {
        label: "Outfit Builder",
        desc: "Drag-and-drop mix & match",
        href: "/wardrobe/builder",
        icon: Layers,
      },
      {
        label: "Saved Looks",
        desc: "Your curated outfit boards",
        href: "/wardrobe/saved",
        icon: Star,
      },
    ],
  },
  {
    name: "Shop",
    href: "/shop",
    icon: ShoppingBag,
    description: "AI-curated shopping",
    hasDropdown: false,
  },
];

/* ─────────────────────────────────────────
   LOGO
───────────────────────────────────────── */
function Logo({ size = "default" }) {
  const isSmall = size === "small";
  return (
    <Link href="/" className="flex items-center gap-2.5 group shrink-0">
      <motion.div
        whileHover={{ scale: 1.08, rotate: 5 }}
        whileTap={{ scale: 0.95 }}
        className="relative flex items-center justify-center rounded-xl"
        style={{
          width: isSmall ? 28 : 34,
          height: isSmall ? 28 : 34,
          background: "linear-gradient(135deg, #9b59ff 0%, #06b6d4 100%)",
          boxShadow: "0 0 18px rgba(155,89,255,0.45)",
        }}
      >
        {/* inner shimmer */}
        <div
          className="absolute inset-0 rounded-xl opacity-40"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 60%)",
          }}
        />
        <Wand2 size={isSmall ? 13 : 16} color="#fff" strokeWidth={2} />
      </motion.div>

      <span
        className="font-serif leading-none tracking-tight"
        style={{
          fontSize: isSmall ? 18 : 22,
          color: "#ffffff",
          fontWeight: 700,
        }}
      >
        Style
        <span
          style={{
            background: "linear-gradient(135deg, #a855f7, #06b6d4)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            fontStyle: "italic",
            fontWeight: 300,
          }}
        >
          Savvy
        </span>
      </span>
    </Link>
  );
}

/* ─────────────────────────────────────────
   DESKTOP DROPDOWN
───────────────────────────────────────── */
function DropdownMenu({ items, isVisible }) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.97 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-72 z-[99]"
          style={{
            background: "rgba(8,8,12,0.95)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: "1px solid rgba(255,255,255,0.09)",
            borderRadius: 16,
            boxShadow:
              "0 24px 60px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.06)",
          }}
        >
          {/* top accent line */}
          <div
            className="absolute top-0 inset-x-8 h-px rounded-full"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(155,89,255,0.6), rgba(6,182,212,0.5), transparent)",
            }}
          />

          <div className="p-2">
            {items.map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04, duration: 0.2 }}
              >
                <Link
                  href={item.href}
                  className="flex items-start gap-3 px-3 py-3 rounded-xl group/item transition-all duration-150"
                  style={{ color: "inherit" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background =
                      "rgba(155,89,255,0.08)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  <div
                    className="mt-0.5 p-1.5 rounded-lg shrink-0"
                    style={{ background: "rgba(255,255,255,0.05)" }}
                  >
                    <item.icon
                      size={13}
                      style={{ color: "#9b59ff" }}
                    />
                  </div>
                  <div>
                    <p
                      className="text-sm leading-none mb-1"
                      style={{
                        color: "#e0e0e0",
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: 500,
                      }}
                    >
                      {item.label}
                    </p>
                    <p
                      className="text-xs leading-snug"
                      style={{
                        color: "#555",
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: 400,
                      }}
                    >
                      {item.desc}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─────────────────────────────────────────
   MAIN NAVBAR
───────────────────────────────────────── */
export default function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [mobileExpanded, setMobileExpanded] = useState(null);
  const { scrollY } = useScroll();
  const closeTimer = useRef(null);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 40);
  });

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
    setActiveDropdown(null);
  }, [pathname]);

  // Lock body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const handleMouseEnter = (name) => {
    clearTimeout(closeTimer.current);
    setActiveDropdown(name);
  };

  const handleMouseLeave = () => {
    closeTimer.current = setTimeout(() => setActiveDropdown(null), 120);
  };

  return (
    <>
      {/* ══════════════════════════════
          DESKTOP / TABLET NAVBAR
      ══════════════════════════════ */}
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 inset-x-0 z-50 flex justify-center"
        style={{
          paddingTop: 16,
          paddingLeft: 16,
          paddingRight: 16,
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <motion.div
          animate={{
            maxWidth: isScrolled ? 780 : 1280,
            paddingTop: isScrolled ? 10 : 14,
            paddingBottom: isScrolled ? 10 : 14,
            paddingLeft: isScrolled ? 20 : 0,
            paddingRight: isScrolled ? 20 : 0,
            backgroundColor: isScrolled
              ? "rgba(8,8,12,0.85)"
              : "transparent",
            backdropFilter: isScrolled ? "blur(24px)" : "blur(0px)",
            WebkitBackdropFilter: isScrolled
              ? "blur(24px)"
              : "blur(0px)",
            borderColor: isScrolled
              ? "rgba(255,255,255,0.08)"
              : "transparent",
            borderRadius: isScrolled ? 9999 : 0,
            y: isScrolled ? 4 : 0,
          }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center justify-between w-full border"
          style={{
            boxShadow: isScrolled
              ? "0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)"
              : "none",
          }}
        >
          {/* Logo */}
          <Logo size={isScrolled ? "small" : "default"} />

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive =
                pathname === link.href ||
                pathname.startsWith(link.href + "/");
              return (
                <div
                  key={link.name}
                  className="relative"
                  onMouseEnter={() =>
                    link.hasDropdown && handleMouseEnter(link.name)
                  }
                  onMouseLeave={handleMouseLeave}
                >
                  <Link
                    href={link.href}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm transition-all duration-200"
                    style={{
                      color: isActive ? "#ffffff" : "#666666",
                      fontWeight: 400,
                      background: isActive
                        ? "rgba(255,255,255,0.06)"
                        : "transparent",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive)
                        e.currentTarget.style.color = "#d0d0d0";
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive)
                        e.currentTarget.style.color = "#666666";
                    }}
                  >
                    {link.name}
                    {link.hasDropdown && (
                      <motion.div
                        animate={{
                          rotate:
                            activeDropdown === link.name ? 180 : 0,
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown
                          size={12}
                          style={{ color: "#555" }}
                        />
                      </motion.div>
                    )}
                    {/* active dot */}
                    {isActive && (
                      <motion.span
                        layoutId="navDot"
                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                        style={{ background: "#06b6d4" }}
                      />
                    )}
                  </Link>

                  {link.hasDropdown && (
                    <DropdownMenu
                      items={link.dropdown}
                      isVisible={activeDropdown === link.name}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Auth + CTA buttons */}
          <div className="hidden md:flex items-center gap-2">
            <Link
              href="/login"
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm transition-all duration-200"
              style={{
                color: "#666",
                fontWeight: 400,
                background: "transparent",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#e0e0e0";
                e.currentTarget.style.background =
                  "rgba(255,255,255,0.05)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "#666";
                e.currentTarget.style.background = "transparent";
              }}
            >
              <LogIn size={13} />
              Sign In
            </Link>

            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link
                href="/signup"
                className="flex items-center gap-2 px-5 py-2 rounded-full text-sm"
                style={{
                  background: "#ffffff",
                  color: "#000000",
                  fontWeight: 500,
                  boxShadow: "0 2px 12px rgba(255,255,255,0.1)",
                }}
              >
                <UserPlus size={13} />
                Get Started
              </Link>
            </motion.div>
          </div>

          {/* Mobile hamburger */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="md:hidden relative w-10 h-10 flex items-center justify-center rounded-full"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#e0e0e0",
            }}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <AnimatePresence mode="wait">
              {mobileOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.18 }}
                >
                  <X size={18} />
                </motion.div>
              ) : (
                <motion.div
                  key="open"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.18 }}
                >
                  <Menu size={18} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </motion.div>
      </motion.nav>

      {/* ══════════════════════════════
          MOBILE FULL-SCREEN MENU
      ══════════════════════════════ */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-40 flex flex-col"
            style={{
              background: "rgba(5,5,7,0.97)",
              backdropFilter: "blur(32px)",
              WebkitBackdropFilter: "blur(32px)",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {/* Ambient glows */}
            <div
              className="absolute top-0 left-0 w-[70vw] h-[70vw] max-w-[400px] max-h-[400px] pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle, rgba(155,89,255,0.1) 0%, transparent 70%)",
                filter: "blur(60px)",
              }}
            />
            <div
              className="absolute bottom-0 right-0 w-[60vw] h-[60vw] max-w-[350px] max-h-[350px] pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle, rgba(6,182,212,0.07) 0%, transparent 70%)",
                filter: "blur(60px)",
              }}
            />

            {/* Mobile header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-white/[0.06]">
              <Logo size="small" />
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setMobileOpen(false)}
                className="w-9 h-9 flex items-center justify-center rounded-full"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#888",
                }}
              >
                <X size={16} />
              </motion.button>
            </div>

            {/* Nav links */}
            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
              {navLinks.map((link, i) => {
                const isActive = pathname === link.href;
                const isExpanded = mobileExpanded === link.name;

                return (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: 0.05 + i * 0.07,
                      duration: 0.4,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  >
                    {/* Main row */}
                    <div
                      className="flex items-center justify-between px-4 py-4 rounded-2xl cursor-pointer transition-all duration-200"
                      style={{
                        background: isActive
                          ? "rgba(155,89,255,0.1)"
                          : "transparent",
                        border: isActive
                          ? "1px solid rgba(155,89,255,0.2)"
                          : "1px solid transparent",
                      }}
                      onClick={() => {
                        if (link.hasDropdown) {
                          setMobileExpanded(isExpanded ? null : link.name);
                        } else {
                          setMobileOpen(false);
                        }
                      }}
                    >
                      <Link
                        href={link.href}
                        className="flex items-center gap-3 flex-1"
                        onClick={(e) => {
                          if (link.hasDropdown) e.preventDefault();
                          else setMobileOpen(false);
                        }}
                      >
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center"
                          style={{
                            background: isActive
                              ? "rgba(155,89,255,0.2)"
                              : "rgba(255,255,255,0.05)",
                          }}
                        >
                          <link.icon
                            size={16}
                            style={{
                              color: isActive ? "#a855f7" : "#666",
                            }}
                          />
                        </div>
                        <div>
                          <p
                            className="text-base leading-none mb-0.5"
                            style={{
                              color: isActive ? "#e0e0e0" : "#aaaaaa",
                              fontWeight: isActive ? 500 : 400,
                            }}
                          >
                            {link.name}
                          </p>
                          <p
                            className="text-xs"
                            style={{ color: "#444" }}
                          >
                            {link.description}
                          </p>
                        </div>
                      </Link>

                      {link.hasDropdown && (
                        <motion.div
                          animate={{ rotate: isExpanded ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown size={14} style={{ color: "#555" }} />
                        </motion.div>
                      )}
                    </div>

                    {/* Dropdown sub-items */}
                    <AnimatePresence>
                      {link.hasDropdown && isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                          style={{ overflow: "hidden" }}
                        >
                          <div className="mt-1 ml-4 pl-4 space-y-1 border-l border-white/[0.06]">
                            {link.dropdown.map((sub, si) => (
                              <motion.div
                                key={sub.label}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: si * 0.04 }}
                              >
                                <Link
                                  href={sub.href}
                                  onClick={() => setMobileOpen(false)}
                                  className="flex items-center gap-3 px-3 py-3 rounded-xl transition-colors"
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.background =
                                      "rgba(255,255,255,0.04)";
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.background =
                                      "transparent";
                                  }}
                                >
                                  <sub.icon
                                    size={13}
                                    style={{ color: "#555" }}
                                  />
                                  <div>
                                    <p
                                      className="text-sm"
                                      style={{
                                        color: "#aaa",
                                        fontWeight: 400,
                                      }}
                                    >
                                      {sub.label}
                                    </p>
                                    <p
                                      className="text-xs"
                                      style={{ color: "#444" }}
                                    >
                                      {sub.desc}
                                    </p>
                                  </div>
                                </Link>
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>

            {/* Mobile auth buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="px-4 pb-8 pt-4 space-y-3 border-t border-white/[0.06]"
            >
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl text-sm transition-all"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#aaa",
                  fontWeight: 400,
                }}
              >
                <LogIn size={15} />
                Sign In
              </Link>

              <Link
                href="/signup"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl text-sm"
                style={{
                  background: "#ffffff",
                  color: "#000000",
                  fontWeight: 500,
                }}
              >
                <UserPlus size={15} />
                Create Account
                <ArrowRight size={14} />
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}