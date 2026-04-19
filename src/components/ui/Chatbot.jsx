"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import {
  Sparkles, X, Send, ChevronDown, Shirt, Wand2,
  TrendingUp, Star, Zap, RefreshCw, Copy, Check,
  ShoppingBag, Clock
} from "lucide-react";
import { useStyleStore } from "../../lib/store";

/* ─────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────── */
const SUGGESTIONS = [
  { label: "Winter wedding outfit?", icon: Star },
  { label: "Job interview look?", icon: Wand2 },
  { label: "Casual weekend fits?", icon: Shirt },
  { label: "What's trending now?", icon: TrendingUp },
  { label: "Smart casual for dinner?", icon: ShoppingBag },
];

const INITIAL_MESSAGE = {
  role: "assistant",
  content:
    "Hey! I'm your AI Stylist, powered by advanced neural fashion intelligence. 👋\n\nTell me your occasion, your vibe, or what's in your wardrobe — and I'll curate the perfect fit for you.",
  id: "init",
  timestamp: new Date(),
};

const SYSTEM_PROMPT = `You are an expert AI Fashion Stylist for StyleSavvy — a premium, AI-driven fashion platform. 
You have deep expertise in:
- Outfit curation for any occasion (work, events, casual, formal, travel, etc.)
- Body type and proportion advice (athletic, petite, curvy, tall, etc.)
- Color theory and seasonal palettes (deep winter, warm spring, cool summer, etc.)
- Fashion trends and editorial style
- Wardrobe capsule building and cost-per-wear optimization
- Brand recommendations across all price points

Your personality is: warm, confident, editorial, knowledgeable — like a personal stylist at a luxury boutique who also understands high street and streetwear.

Respond conversationally but with genuine expertise. Use bullet points sparingly — prefer flowing, insightful prose. Keep responses to 3-5 sentences unless the user asks for detailed breakdowns. Use occasional emojis (1-2 max) to feel warm but not juvenile. Never be generic. Always give specific, actionable advice.

When recommending outfits, be specific: name garment types, colors, silhouettes, and how to style them. Reference the user's wardrobe context if they share it.`;

/* ─────────────────────────────────────────
   API CALL — Secure server route
───────────────────────────────────────── */
async function callStylistAI(messages, userContext) {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, userContext }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.details || `API error: ${response.status}`);
  }

  const data = await response.json();
  return data.text || "I couldn't generate a response. Try again!";
}

/* ─────────────────────────────────────────
   TYPING ANIMATION
───────────────────────────────────────── */
function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-3">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="block rounded-full"
          style={{ width: 5, height: 5, background: "#444" }}
          animate={{ scale: [0.7, 1.2, 0.7], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.0, delay: i * 0.18, repeat: Infinity }}
        />
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────
   STREAMING TEXT
───────────────────────────────────────── */
function StreamingText({ text, isComplete }) {
  const [displayed, setDisplayed] = useState("");
  const indexRef = useRef(0);

  useEffect(() => {
    if (!text) return;
    indexRef.current = 0;
    setDisplayed("");

    const interval = setInterval(() => {
      if (indexRef.current < text.length) {
        setDisplayed(text.slice(0, indexRef.current + 1));
        indexRef.current++;
      } else {
        clearInterval(interval);
      }
    }, 8);

    return () => clearInterval(interval);
  }, [text]);

  return (
    <span className="whitespace-pre-wrap">
      {displayed}
      {!isComplete && displayed.length < (text?.length || 0) && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className="inline-block w-0.5 h-3.5 bg-purple-400 ml-0.5 align-middle"
        />
      )}
    </span>
  );
}

/* ─────────────────────────────────────────
   MESSAGE BUBBLE
───────────────────────────────────────── */
function MessageBubble({ msg, isLatestBot }) {
  const [copied, setCopied] = useState(false);
  const isBot = msg.role === "assistant";

  const handleCopy = () => {
    navigator.clipboard.writeText(msg.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedTime = msg.timestamp
    ? new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className={`flex items-end gap-2 group ${isBot ? "justify-start" : "justify-end"}`}
    >
      {/* Bot avatar */}
      {isBot && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 260 }}
          className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mb-0.5"
          style={{ background: "linear-gradient(135deg, #9b59ff, #06b6d4)", boxShadow: "0 0 14px rgba(155,89,255,0.4)" }}
        >
          <Sparkles size={10} style={{ color: "#fff" }} />
        </motion.div>
      )}

      <div className={`flex flex-col gap-1 max-w-[82%] ${isBot ? "items-start" : "items-end"}`}>
        <div
          className="rounded-2xl px-4 py-3 text-sm leading-relaxed relative"
          style={
            isBot
              ? {
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  color: "#c8c8c8",
                  borderBottomLeftRadius: 6,
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 300,
                }
              : {
                  background: "linear-gradient(135deg, rgba(155,89,255,0.22), rgba(6,182,212,0.14))",
                  border: "1px solid rgba(155,89,255,0.22)",
                  color: "#e0e0e0",
                  borderBottomRightRadius: 6,
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 400,
                }
          }
        >
          {isBot && isLatestBot ? (
            <StreamingText text={msg.content} isComplete={msg.complete} />
          ) : (
            <span className="whitespace-pre-wrap">{msg.content}</span>
          )}

          {/* Copy button (bot only) */}
          {isBot && msg.complete && (
            <button
              onClick={handleCopy}
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              {copied ? (
                <Check size={9} style={{ color: "#10b981" }} />
              ) : (
                <Copy size={9} style={{ color: "#555" }} />
              )}
            </button>
          )}
        </div>

        {/* Timestamp */}
        <span
          className="text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ color: "#333", fontFamily: "'Inter', sans-serif" }}
        >
          <Clock size={8} className="inline mr-1" />
          {formattedTime}
        </span>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────
   MOOD SELECTOR
───────────────────────────────────────── */
const moods = [
  { label: "Minimal", color: "#ffffff" },
  { label: "Luxe", color: "#f59e0b" },
  { label: "Street", color: "#06b6d4" },
  { label: "Classic", color: "#a855f7" },
];

function MoodSelector({ activeMood, onChange }) {
  return (
    <div className="flex items-center gap-1.5 px-5 py-2.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
      <span className="text-[10px] tracking-widest text-[#333] uppercase mr-1" style={{ fontFamily: "'Inter', sans-serif" }}>
        Style
      </span>
      {moods.map((m) => (
        <button
          key={m.label}
          onClick={() => onChange(m.label)}
          className="px-2.5 py-1 rounded-full text-[10px] transition-all"
          style={{
            background: activeMood === m.label ? `${m.color}15` : "transparent",
            border: `1px solid ${activeMood === m.label ? `${m.color}40` : "rgba(255,255,255,0.06)"}`,
            color: activeMood === m.label ? m.color : "#333",
            fontFamily: "'Inter', sans-serif",
          }}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────
   CHAT WINDOW
───────────────────────────────────────── */
function ChatWindow({ onClose }) {
  const [messages, setMessages] = useState([{ ...INITIAL_MESSAGE, complete: true }]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeMood, setActiveMood] = useState("Minimal");
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const latestBotIdRef = useRef("init");

  // Read real user context from store
  const { user, inventory } = useStyleStore();
  const userContext = {
    displayName: user?.displayName,
    styleDNA: user?.styleDNA,
    wardrobeCount: inventory?.length,
    wardrobeItems: inventory,
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 400);
  }, []);

  const handleSend = useCallback(
    async (text = input) => {
      const trimmed = text.trim();
      if (!trimmed || isLoading) return;

      const userMsg = {
        role: "user",
        content: trimmed,
        id: `user-${Date.now()}`,
        timestamp: new Date(),
        complete: true,
      };

      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setIsLoading(true);
      setError(null);

      try {
        // Build conversation for API (exclude initial system msg, only send user/assistant pairs)
        const apiMessages = [...messages, userMsg]
          .filter((m) => m.id !== "init")
          .concat(
            messages[0].id === "init"
              ? [{ role: "assistant", content: messages[0].content, id: "init-api" }]
              : []
          )
          .filter((m) => m.role === "user" || m.role === "assistant")
          .map((m) => ({ role: m.role, content: m.content }));

        // Actually build proper API message list
        const properMessages = [
          ...messages.filter((m) => m.id !== "init" && (m.role === "user" || m.role === "assistant")),
          userMsg,
        ].map((m) => ({ role: m.role, content: m.content }));

        setIsLoading(false);
        const botId = `bot-${Date.now()}`;
        latestBotIdRef.current = botId;

        const botMsg = {
          role: "assistant",
          content: "",
          id: botId,
          timestamp: new Date(),
          complete: false,
        };
        setMessages((prev) => [...prev, botMsg]);

        // Call AI with user context
        const replyText = await callStylistAI(properMessages, userContext);

        setMessages((prev) =>
          prev.map((m) =>
            m.id === botId ? { ...m, content: replyText, complete: true } : m
          )
        );
      } catch (err) {
        setIsLoading(false);
        setError("Hmm, the neural net hiccuped. Try again?");
        console.error("AI error:", err);
      }
    },
    [input, isLoading, messages]
  );

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClear = () => {
    setMessages([{ ...INITIAL_MESSAGE, complete: true }]);
    setError(null);
  };

  const showSuggestions = messages.length <= 1;
  const latestBotMsg = [...messages].reverse().find((m) => m.role === "assistant");

  return (
    <motion.div
      key="chat"
      initial={{ opacity: 0, y: 28, scale: 0.9, transformOrigin: "bottom right" }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.93 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="absolute bottom-20 right-0 flex flex-col overflow-hidden"
      style={{
        width: 380,
        height: 560,
        background: "rgba(7,7,11,0.95)",
        backdropFilter: "blur(40px) saturate(200%)",
        WebkitBackdropFilter: "blur(40px) saturate(200%)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 24,
        boxShadow: "0 40px 100px rgba(0,0,0,0.8), 0 0 0 1px rgba(155,89,255,0.06), inset 0 1px 0 rgba(255,255,255,0.05)",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Shimmer top border */}
      <div
        className="absolute top-0 inset-x-0 h-px z-10"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(155,89,255,0.7) 30%, rgba(0,212,255,0.6) 70%, transparent 100%)",
        }}
      />

      {/* Ambient inner glow */}
      <div
        className="absolute top-0 left-0 right-0 h-32 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 50% 0%, rgba(155,89,255,0.07) 0%, transparent 70%)",
        }}
      />

      {/* ── HEADER ── */}
      <div
        className="relative flex items-center justify-between px-5 py-4 z-10 shrink-0"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
      >
        <div className="flex items-center gap-3">
          {/* Avatar with pulse ring */}
          <div className="relative">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #9b59ff, #06b6d4)",
                boxShadow: "0 0 20px rgba(155,89,255,0.5)",
              }}
            >
              <Sparkles size={14} style={{ color: "#fff" }} />
            </div>
            {/* Online pulse */}
            <div
              className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full"
              style={{ background: "#10b981", border: "1.5px solid rgba(7,7,11,1)", boxShadow: "0 0 6px rgba(16,185,129,0.8)" }}
            />
          </div>

          <div>
            <p className="text-sm font-medium text-white" style={{ letterSpacing: "-0.01em" }}>
              AI Stylist
            </p>
            <div className="flex items-center gap-1.5">
              <motion.div
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-1 h-1 rounded-full"
                style={{ background: "#10b981" }}
              />
              <span className="text-[10px] text-[#444]">Neural engine active</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleClear}
            title="Clear chat"
            className="w-7 h-7 flex items-center justify-center rounded-lg transition-all"
            style={{ color: "#333", background: "transparent" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.06)";
              e.currentTarget.style.color = "#888";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "#333";
            }}
          >
            <RefreshCw size={12} />
          </button>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg transition-all"
            style={{ color: "#333", background: "transparent" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.06)";
              e.currentTarget.style.color = "#888";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "#333";
            }}
          >
            <ChevronDown size={15} />
          </button>
        </div>
      </div>

      {/* ── MOOD SELECTOR ── */}
      <MoodSelector activeMood={activeMood} onChange={setActiveMood} />

      {/* ── MESSAGES ── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scrollbar-hide">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              msg={msg}
              isLatestBot={msg.id === latestBotMsg?.id && msg.role === "assistant"}
            />
          ))}
        </AnimatePresence>

        {/* Loading dots */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-end gap-2"
            >
              <div
                className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: "linear-gradient(135deg, #9b59ff, #06b6d4)" }}
              >
                <Sparkles size={10} style={{ color: "#fff" }} />
              </div>
              <div
                className="rounded-2xl"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderBottomLeftRadius: 6,
                }}
              >
                <TypingDots />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center py-2"
            >
              <span
                className="text-xs px-3 py-1.5 rounded-full"
                style={{
                  background: "rgba(239,68,68,0.08)",
                  border: "1px solid rgba(239,68,68,0.15)",
                  color: "#ef4444",
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                {error}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* ── SUGGESTION CHIPS ── */}
      <AnimatePresence>
        {showSuggestions && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 pb-3 flex gap-2 overflow-x-auto scrollbar-hide shrink-0"
          >
            {SUGGESTIONS.map((s, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                onClick={() => handleSend(s.label)}
                disabled={isLoading}
                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] transition-all duration-200"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  color: "#555",
                  whiteSpace: "nowrap",
                  fontFamily: "'Inter', sans-serif",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(155,89,255,0.1)";
                  e.currentTarget.style.borderColor = "rgba(155,89,255,0.25)";
                  e.currentTarget.style.color = "#c084fc";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
                  e.currentTarget.style.color = "#555";
                }}
              >
                <s.icon size={10} />
                {s.label}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── INPUT ── */}
      <div
        className="px-4 py-3 shrink-0"
        style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
      >
        <div
          className="flex items-end gap-2 rounded-xl px-4 py-2.5 transition-all duration-200"
          style={{
            background: "rgba(0,0,0,0.5)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
          onFocusCapture={(e) => {
            e.currentTarget.style.borderColor = "rgba(155,89,255,0.35)";
            e.currentTarget.style.boxShadow = "0 0 0 3px rgba(155,89,255,0.06)";
          }}
          onBlurCapture={(e) => {
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = Math.min(e.target.scrollHeight, 100) + "px";
            }}
            onKeyDown={handleKeyDown}
            placeholder="Ask about outfits, trends, occasions..."
            rows={1}
            className="flex-1 bg-transparent text-sm outline-none border-none resize-none scrollbar-hide"
            style={{
              color: "#e0e0e0",
              fontFamily: "'Inter', sans-serif",
              fontWeight: 300,
              lineHeight: 1.5,
              maxHeight: 100,
            }}
          />
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className="w-8 h-8 flex items-center justify-center rounded-xl flex-shrink-0 transition-all duration-200 mb-0.5"
            style={{
              background:
                input.trim() && !isLoading
                  ? "linear-gradient(135deg, #9b59ff, #06b6d4)"
                  : "rgba(255,255,255,0.05)",
              color: input.trim() && !isLoading ? "#fff" : "#333",
              border: "none",
              cursor: input.trim() && !isLoading ? "pointer" : "default",
              boxShadow: input.trim() && !isLoading ? "0 0 16px rgba(155,89,255,0.45)" : "none",
            }}
          >
            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <RefreshCw size={12} />
              </motion.div>
            ) : (
              <Send size={12} />
            )}
          </motion.button>
        </div>
        <p className="text-center mt-2 text-[9px] text-[#222]" style={{ fontFamily: "'Inter', sans-serif" }}>
          Powered by StyleSavvy Neural Engine
        </p>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────
   PULSE RINGS
───────────────────────────────────────── */
function PulseRings({ active }) {
  return (
    <>
      {[1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute inset-0 rounded-full"
          style={{ border: "1px solid rgba(155,89,255,0.3)" }}
          animate={
            active
              ? {}
              : {
                  scale: [1, 1.7, 1.7],
                  opacity: [0.5, 0, 0],
                }
          }
          transition={{
            duration: 2.5,
            delay: i * 0.8,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />
      ))}
    </>
  );
}

/* ─────────────────────────────────────────
   MAIN CHATBOT EXPORT
───────────────────────────────────────── */
export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [unread, setUnread] = useState(1);

  useEffect(() => {
    if (isOpen) setUnread(0);
  }, [isOpen]);

  return (
    <>
      {/* Global styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>

      <div className="fixed bottom-6 right-6 z-[9999]">
        {/* Chat window */}
        <AnimatePresence>
          {isOpen && <ChatWindow onClose={() => setIsOpen(false)} />}
        </AnimatePresence>

        {/* FAB toggle button */}
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.2, type: "spring", stiffness: 260, damping: 20 }}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.93 }}
          onClick={() => setIsOpen((o) => !o)}
          className="relative w-14 h-14 rounded-full flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, #9b59ff 0%, #06b6d4 100%)",
            boxShadow: isOpen
              ? "0 0 0 rgba(0,0,0,0)"
              : "0 0 32px rgba(155,89,255,0.55), 0 8px 28px rgba(0,0,0,0.5)",
            border: "none",
            cursor: "pointer",
          }}
        >
          {/* Pulse rings (only when closed) */}
          {!isOpen && <PulseRings active={isOpen} />}

          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.22 }}
              >
                <X size={22} style={{ color: "#fff" }} />
              </motion.div>
            ) : (
              <motion.div
                key="open"
                initial={{ rotate: 90, opacity: 0, scale: 0.5 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: -90, opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.22 }}
              >
                <Sparkles size={22} style={{ color: "#fff" }} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Unread badge */}
          <AnimatePresence>
            {unread > 0 && !isOpen && (
              <motion.div
                initial={{ scale: 0, y: 4 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className="absolute -top-1 -right-1 min-w-5 h-5 rounded-full flex items-center justify-center px-1"
                style={{
                  background: "linear-gradient(135deg, #ef4444, #dc2626)",
                  boxShadow: "0 2px 8px rgba(239,68,68,0.5)",
                }}
              >
                <span className="text-white font-semibold" style={{ fontSize: 9 }}>{unread}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </>
  );
}