"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  ContactShadows,
  Float,
  Sparkles as ThreeSparkles,
  MeshReflectorMaterial,
  RoundedBox,
  Torus,
} from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";

/* ═══════════════════════════════════════════════════════════════
   DESIGN TOKENS
═══════════════════════════════════════════════════════════════ */
const TOKEN = {
  bg: "#09090f",
  bgPanel: "rgba(10,10,18,0.92)",
  bgCard: "rgba(15,15,25,0.88)",
  border: "rgba(255,255,255,0.07)",
  borderStrong: "rgba(255,255,255,0.12)",
  text: "#e8e8f0",
  textMuted: "#6b6b80",
  textDim: "#3a3a4a",
  gold: "#c9a84c",
  goldGlow: "rgba(201,168,76,0.25)",
  violet: "#7c3aed",
  violetLight: "#a78bfa",
  cyan: "#0ea5e9",
  emerald: "#10b981",
  rose: "#f43f5e",
  amber: "#f59e0b",
  fontDisplay: "'Cormorant Garamond', 'Georgia', serif",
  fontBody: "'DM Sans', 'system-ui', sans-serif",
  fontMono: "'JetBrains Mono', monospace",
  radius: "12px",
  radiusLg: "20px",
  radiusXl: "28px",
};

/* ═══════════════════════════════════════════════════════════════
   WARDROBE DATA — 24 items across 6 categories
═══════════════════════════════════════════════════════════════ */
const WARDROBE = [
  // Tops
  { id: "t1", name: "Oversized Silk Shirt", cat: "Tops", hex: "#f0ece4", accent: "#d4c9b8", tag: "Refined", style: ["Classic","Minimal"] },
  { id: "t2", name: "Ribbed Turtleneck", cat: "Tops", hex: "#1a1a2e", accent: "#4a4a7a", tag: "Sleek", style: ["Minimal","Dark"] },
  { id: "t3", name: "Structured Blazer", cat: "Tops", hex: "#2c2c3e", accent: "#5a5a7a", tag: "Sharp", style: ["Classic","Power"] },
  { id: "t4", name: "Raw Linen Shirt", cat: "Tops", hex: "#c8b89a", accent: "#a89878", tag: "Organic", style: ["Casual","Minimal"] },
  { id: "t5", name: "Boucle Jacket", cat: "Tops", hex: "#d4b896", accent: "#b89870", tag: "Textured", style: ["Luxury","Refined"] },
  { id: "t6", name: "Mesh Long-Sleeve", cat: "Tops", hex: "#0f0f1e", accent: "#3a3a6a", tag: "Edge", style: ["Dark","Street"] },
  // Bottoms
  { id: "b1", name: "Wide-Leg Trousers", cat: "Bottoms", hex: "#3a3a4e", accent: "#6a6a8e", tag: "Editorial", style: ["Minimal","Classic"] },
  { id: "b2", name: "Tailored Straight Cut", cat: "Bottoms", hex: "#1c1c1c", accent: "#555555", tag: "Sharp", style: ["Classic","Power"] },
  { id: "b3", name: "Cargo Silhouette", cat: "Bottoms", hex: "#2d3b2d", accent: "#4a6a4a", tag: "Utility", style: ["Street","Casual"] },
  { id: "b4", name: "Pleated Shorts", cat: "Bottoms", hex: "#e8e0d0", accent: "#c8c0b0", tag: "Summer", style: ["Casual","Minimal"] },
  { id: "b5", name: "Midi Bias Skirt", cat: "Bottoms", hex: "#8b6a5a", accent: "#b08a78", tag: "Fluid", style: ["Refined","Classic"] },
  { id: "b6", name: "Distressed Denim", cat: "Bottoms", hex: "#2a3a5a", accent: "#4a6a9a", tag: "Raw", style: ["Street","Casual"] },
  // Shoes
  { id: "s1", name: "Minimal Loafers", cat: "Shoes", hex: "#1a1a1a", accent: "#555", tag: "Classic", style: ["Classic","Minimal"] },
  { id: "s2", name: "Platform Mules", cat: "Shoes", hex: "#c8a96e", accent: "#f0d090", tag: "Statement", style: ["Luxury","Refined"] },
  { id: "s3", name: "Chunky Derbies", cat: "Shoes", hex: "#2a2a2a", accent: "#666", tag: "Substantial", style: ["Dark","Edge"] },
  { id: "s4", name: "White Leather Sneakers", cat: "Shoes", hex: "#f8f8f8", accent: "#ddd", tag: "Clean", style: ["Casual","Minimal"] },
  { id: "s5", name: "Pointed Kitten Heels", cat: "Shoes", hex: "#8b6a5a", accent: "#b08a78", tag: "Refined", style: ["Classic","Luxury"] },
  // Outerwear
  { id: "o1", name: "Oversize Wool Coat", cat: "Outerwear", hex: "#c8c0b0", accent: "#a8a098", tag: "Signature", style: ["Luxury","Classic"] },
  { id: "o2", name: "Technical Bomber", cat: "Outerwear", hex: "#1e2a1e", accent: "#3a5a3a", tag: "Function", style: ["Street","Utility"] },
  { id: "o3", name: "Leather Trench", cat: "Outerwear", hex: "#2a1a0a", accent: "#5a3a1a", tag: "Edge", style: ["Dark","Power"] },
  // Accessories
  { id: "a1", name: "Structured Tote", cat: "Accessories", hex: "#1a1a1a", accent: "#555", tag: "Refined", style: ["Classic","Minimal"] },
  { id: "a2", name: "Silk Bandana", cat: "Accessories", hex: "#8b1a4a", accent: "#e04080", tag: "Colour", style: ["Classic","Refined"] },
  { id: "a3", name: "Chain Necklace", cat: "Accessories", hex: "#c8a96e", accent: "#f0d090", tag: "Gold", style: ["Luxury","Refined"] },
  { id: "a4", name: "Geometric Earrings", cat: "Accessories", hex: "#c0c0c0", accent: "#e8e8e8", tag: "Modern", style: ["Minimal","Edge"] },
];

const CATS = ["All", "Tops", "Bottoms", "Shoes", "Outerwear", "Accessories"];

/* ═══════════════════════════════════════════════════════════════
   SIMULATED ROOM USERS (real-time presence)
═══════════════════════════════════════════════════════════════ */
const INITIAL_USERS = [
  { id: "u1", name: "Aryan M.", avatar: "AM", color: "#7c3aed", joined: true, items: ["t3","b2","s1"], votes: { u2: 1, u3: 1 }, aiScore: null, aiAnalysis: null, isTyping: false },
  { id: "u2", name: "Zara K.", avatar: "ZK", color: "#0ea5e9", joined: true, items: ["t1","b5","s5","a2"], votes: {}, aiScore: null, aiAnalysis: null, isTyping: false },
  { id: "u3", name: "Theo V.", avatar: "TV", color: "#10b981", joined: true, items: ["t6","b6","s3"], votes: { u1: 1 }, aiScore: null, aiAnalysis: null, isTyping: true },
  { id: "me", name: "You", avatar: "YO", color: "#c9a84c", joined: true, items: [], votes: {}, aiScore: null, aiAnalysis: null, isTyping: false },
];

const CHAT_SEED = [
  { uid: "u1", text: "Just styled for the minimal editorial brief — what do you think?", ts: "2m ago" },
  { uid: "u3", text: "Going dark and deconstructed for mine, very different vibe", ts: "1m ago" },
  { uid: "u2", text: "Mine's all about fluid lines this round", ts: "45s ago" },
];

/* ═══════════════════════════════════════════════════════════════
   OPENAI ANALYSIS (real API call)
═══════════════════════════════════════════════════════════════ */
async function analyseOutfit(items) {
  if (!items.length) return { score: 0, analysis: "No items selected.", tags: [] };

  const itemList = items.map(i => `${i.name} (${i.cat}, ${i.tag} tag, styles: ${i.style.join(",")})`).join("; ");

  const prompt = `You are a high-fashion editorial stylist with expertise in contemporary fashion. Analyse this outfit combination and provide a concise but incisive critique.

Outfit items: ${itemList}

Respond ONLY with valid JSON in this exact format (no markdown, no preamble):
{
  "score": <integer 60-98>,
  "headline": "<8-12 word editorial headline>",
  "analysis": "<2-3 sentences: colour harmony, silhouette, styling coherence, any tension or strength>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "tension": "<one honest critique or styling tension>",
  "aesthetic": "<2-3 word aesthetic label e.g. 'Quiet Luxury' or 'Dark Minimal'>",
  "tags": ["<tag1>", "<tag2>", "<tag3>"]
}`;

  try {
    const res = await fetch("/api/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ items }),
    });

    if (!res.ok) throw new Error(`API error ${res.status}`);
    const data = await res.json();
    const raw = data.result || "{}";
    const clean = raw.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
  } catch (err) {
    console.error("AI analysis error:", err);
    // Fallback scoring based on item count and variety
    const cats = [...new Set(items.map(i => i.cat))];
    const score = Math.min(98, 50 + items.length * 6 + cats.length * 4);
    return {
      score,
      headline: "A considered edit with room to explore",
      analysis: "The outfit shows intentionality in its selection. The pieces have compatible tonal ranges and the silhouette reads as cohesive. Some styling tension remains in the category balance.",
      strengths: ["Tonal coherence", "Proportional balance"],
      tension: "Could push further in a singular direction",
      aesthetic: "Considered Minimal",
      tags: items.slice(0,3).map(i => i.tag),
    };
  }
}

async function generateRoomInsight(users) {
  const outfits = users.filter(u => u.items.length > 0).map(u => {
    const items = u.items.map(id => WARDROBE.find(w => w.id === id)).filter(Boolean);
    return `${u.name}: ${items.map(i => i.name).join(", ")}`;
  }).join("\n");

  const prompt = `You are a fashion editor hosting a styling competition. Four participants have built their looks. Provide a brief room-level editorial observation.

Participants and their looks:
${outfits}

Respond ONLY with valid JSON (no markdown):
{
  "roomTheme": "<3-4 word theme that describes the room's collective energy>",
  "observation": "<2 sentences about the collective styling energy of the room>",
  "standout": "<name of the most editorially coherent look and brief why>"
}`;

  try {
    const res = await fetch("/api/insight", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ outfits }),
    });
    if (!res.ok) throw new Error(`API error ${res.status}`);
    const data = await res.json();
    const raw = data.result || "{}";
    return JSON.parse(raw.replace(/```json|```/g, "").trim());
  } catch {
    return {
      roomTheme: "Contrasting Editorial Visions",
      observation: "The room carries an interesting tension between structured formality and deconstructed ease. Each participant has committed to a distinct aesthetic direction.",
      standout: "Results pending full analysis",
    };
  }
}

/* ═══════════════════════════════════════════════════════════════
   THREE.JS — MANNEQUIN BODY
═══════════════════════════════════════════════════════════════ */
function MannequinFigure({ topHex, bottomHex, shoeHex, scale = 1 }) {
  const groupRef = useRef();
  const topMat = useRef(new THREE.MeshStandardMaterial({ color: topHex, roughness: 0.35, metalness: 0.08 }));
  const bottomMat = useRef(new THREE.MeshStandardMaterial({ color: bottomHex, roughness: 0.4, metalness: 0.05 }));
  const shoeMat = useRef(new THREE.MeshStandardMaterial({ color: shoeHex, roughness: 0.5, metalness: 0.2 }));
  const skinMat = useRef(new THREE.MeshStandardMaterial({ color: "#c8956c", roughness: 0.8, metalness: 0 }));
  const hairMat = useRef(new THREE.MeshStandardMaterial({ color: "#1e1008", roughness: 0.9, metalness: 0 }));

  useEffect(() => { topMat.current.color.set(topHex); topMat.current.needsUpdate = true; }, [topHex]);
  useEffect(() => { bottomMat.current.color.set(bottomHex); bottomMat.current.needsUpdate = true; }, [bottomHex]);
  useEffect(() => { shoeMat.current.color.set(shoeHex); shoeMat.current.needsUpdate = true; }, [shoeHex]);

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.7) * 0.035 * scale;
    groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.25) * 0.05;
  });

  const s = scale;

  return (
    <group ref={groupRef} scale={[s, s, s]}>
      {/* Head */}
      <mesh position={[0, 2.05, 0]} castShadow>
        <sphereGeometry args={[0.22, 32, 32]} />
        <primitive object={skinMat.current} attach="material" />
      </mesh>
      {/* Hair */}
      <mesh position={[0, 2.23, 0]} castShadow>
        <sphereGeometry args={[0.215, 24, 24, 0, Math.PI * 2, 0, Math.PI * 0.52]} />
        <primitive object={hairMat.current} attach="material" />
      </mesh>
      {/* Neck */}
      <mesh position={[0, 1.76, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.1, 0.26, 16]} />
        <primitive object={skinMat.current} attach="material" />
      </mesh>
      {/* Torso */}
      <mesh position={[0, 1.1, 0]} castShadow>
        <cylinderGeometry args={[0.38, 0.33, 0.88, 24]} />
        <primitive object={topMat.current} attach="material" />
      </mesh>
      {/* Arms */}
      {[-1, 1].map(side => (
        <group key={side}>
          <mesh position={[side * 0.53, 1.28, 0]} rotation={[0, 0, side * 0.12]} castShadow>
            <cylinderGeometry args={[0.1, 0.09, 0.52, 16]} />
            <primitive object={topMat.current} attach="material" />
          </mesh>
          <mesh position={[side * 0.6, 0.83, 0.04]} rotation={[0.1, 0, side * 0.04]} castShadow>
            <cylinderGeometry args={[0.075, 0.065, 0.46, 16]} />
            <primitive object={skinMat.current} attach="material" />
          </mesh>
          <mesh position={[side * 0.64, 0.62, 0.07]} castShadow>
            <sphereGeometry args={[0.065, 12, 12]} />
            <primitive object={skinMat.current} attach="material" />
          </mesh>
        </group>
      ))}
      {/* Waist band */}
      <mesh position={[0, 0.6, 0]} castShadow>
        <cylinderGeometry args={[0.34, 0.34, 0.1, 24]} />
        <meshStandardMaterial color="#111111" roughness={0.6} metalness={0.4} />
      </mesh>
      {/* Hips */}
      <mesh position={[0, 0.25, 0]} castShadow>
        <cylinderGeometry args={[0.37, 0.31, 0.58, 24]} />
        <primitive object={bottomMat.current} attach="material" />
      </mesh>
      {/* Legs */}
      {[-1, 1].map(side => (
        <group key={side}>
          <mesh position={[side * 0.18, -0.48, 0]} castShadow>
            <cylinderGeometry args={[0.14, 0.12, 0.86, 16]} />
            <primitive object={bottomMat.current} attach="material" />
          </mesh>
          <mesh position={[side * 0.18, -1.16, 0.02]} rotation={[0.04, 0, 0]} castShadow>
            <cylinderGeometry args={[0.11, 0.095, 0.76, 16]} />
            <primitive object={bottomMat.current} attach="material" />
          </mesh>
          <mesh position={[side * 0.18, -1.54, 0.02]} castShadow>
            <sphereGeometry args={[0.078, 12, 12]} />
            <primitive object={skinMat.current} attach="material" />
          </mesh>
          <mesh position={[side * 0.18, -1.7, 0.06]} castShadow>
            <RoundedBox args={[0.18, 0.1, 0.34]} radius={0.04} smoothness={4}>
              <primitive object={shoeMat.current} attach="material" />
            </RoundedBox>
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* Orbital ring accent */
function Ring({ r, speed, col, op = 0.2, tilt = 0 }) {
  const ref = useRef();
  useFrame(s => { if (ref.current) ref.current.rotation.z = s.clock.elapsedTime * speed; });
  return (
    <group ref={ref} rotation={[tilt, 0, 0]}>
      <Torus args={[r, 0.007, 16, 120]}>
        <meshBasicMaterial color={col} transparent opacity={op} />
      </Torus>
    </group>
  );
}

/* Ambient particles */
function Dust({ count = 40 }) {
  const ref = useRef();
  const pos = useRef(new Float32Array(Array.from({ length: count * 3 }, () => (Math.random() - 0.5) * 10)));
  useFrame(s => { if (ref.current) ref.current.rotation.y = s.clock.elapsedTime * 0.03; });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={pos.current} count={count} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.025} color="#c9a84c" transparent opacity={0.35} sizeAttenuation />
    </points>
  );
}

/* Ground */
function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.2, 0]}>
      <planeGeometry args={[20, 20]} />
      <MeshReflectorMaterial
        blur={[300, 100]} resolution={512} mixBlur={0.9}
        mixStrength={25} roughness={1} depthScale={1.2}
        minDepthThreshold={0.4} maxDepthThreshold={1.4}
        color="#050508" metalness={0.6}
      />
    </mesh>
  );
}

/* Main 3D scene */
function Stage({ topHex, bottomHex, shoeHex, lighting }) {
  return (
    <>
      <ambientLight intensity={0.25} />
      <spotLight position={[5, 8, 5]} angle={0.28} penumbra={0.85} intensity={3.5} castShadow color="#fff8f0" shadow-mapSize={[1024, 1024]} />
      <spotLight position={[-4, 5, -4]} intensity={1.8} color="#7c3aed" />
      <pointLight position={[0, 3, 3]} intensity={0.9} color="#0ea5e9" />
      <pointLight position={[0, -0.5, 0]} intensity={0.25} color="#c9a84c" />
      <Environment preset={lighting} />

      <Ring r={1.7} speed={0.1} col="#c9a84c" op={0.15} tilt={0.3} />
      <Ring r={2.2} speed={-0.07} col="#7c3aed" op={0.1} tilt={-0.2} />
      <Ring r={2.9} speed={0.04} col="#fff" op={0.05} />

      <ThreeSparkles count={25} scale={5} size={0.9} speed={0.25} color="#c9a84c" opacity={0.35} />
      <Dust count={40} />

      <Float speed={1.1} rotationIntensity={0.06} floatIntensity={0.28}>
        <MannequinFigure topHex={topHex} bottomHex={bottomHex} shoeHex={shoeHex} />
      </Float>

      <Ground />
      <ContactShadows position={[0, -2.18, 0]} opacity={0.55} scale={6} blur={2.5} far={3.2} />
      <OrbitControls enablePan={false} enableZoom minDistance={3} maxDistance={9} minPolarAngle={Math.PI / 6} maxPolarAngle={Math.PI / 1.8} />
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MINI MANNEQUIN for user cards (CSS-only silhouette)
═══════════════════════════════════════════════════════════════ */
function MiniMannequin({ topHex, bottomHex, shoeHex }) {
  const top = topHex || "#333";
  const btm = bottomHex || "#1a1a1a";
  const sho = shoeHex || "#555";
  return (
    <div style={{ position: "relative", width: 40, height: 80, flexShrink: 0 }}>
      {/* Head */}
      <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 12, height: 12, borderRadius: "50%", background: "#c8956c" }} />
      {/* Neck */}
      <div style={{ position: "absolute", top: 11, left: "50%", transform: "translateX(-50%)", width: 4, height: 5, background: "#c8956c" }} />
      {/* Torso */}
      <div style={{ position: "absolute", top: 15, left: "50%", transform: "translateX(-50%)", width: 18, height: 20, borderRadius: "3px 3px 0 0", background: top }} />
      {/* Hips */}
      <div style={{ position: "absolute", top: 34, left: "50%", transform: "translateX(-50%)", width: 20, height: 13, background: btm }} />
      {/* Left Leg */}
      <div style={{ position: "absolute", top: 46, left: "50%", transform: "translateX(-13px)", width: 8, height: 22, background: btm, borderRadius: "0 0 2px 2px" }} />
      {/* Right Leg */}
      <div style={{ position: "absolute", top: 46, left: "50%", transform: "translateX(5px)", width: 8, height: 22, background: btm, borderRadius: "0 0 2px 2px" }} />
      {/* Shoes */}
      <div style={{ position: "absolute", top: 67, left: "50%", transform: "translateX(-15px)", width: 10, height: 5, background: sho, borderRadius: "1px 3px 2px 1px" }} />
      <div style={{ position: "absolute", top: 67, left: "50%", transform: "translateX(4px)", width: 10, height: 5, background: sho, borderRadius: "1px 3px 2px 1px" }} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   UI COMPONENTS
═══════════════════════════════════════════════════════════════ */

/* Scrollbar-hidden container */
const scrollStyle = { overflowY: "auto", scrollbarWidth: "none" };

/* Panel glass container */
function GlassPanel({ children, style = {}, className = "" }) {
  return (
    <div
      className={className}
      style={{
        background: TOKEN.bgPanel,
        backdropFilter: "blur(32px)",
        WebkitBackdropFilter: "blur(32px)",
        border: `1px solid ${TOKEN.border}`,
        borderRadius: TOKEN.radiusXl,
        boxShadow: "0 24px 80px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.05)",
        fontFamily: TOKEN.fontBody,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* Score ring */
function ScoreRing({ score, size = 64, color = TOKEN.gold }) {
  const r = size / 2 - 5;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={4} />
      <motion.circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={4} strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: circ - dash }}
        transition={{ duration: 1.4, ease: "easeOut" }}
      />
      <text
        x="50%" y="50%" textAnchor="middle" dominantBaseline="central"
        style={{ transform: "rotate(90deg)", transformOrigin: "center", fill: color, fontSize: size * 0.22, fontFamily: TOKEN.fontMono, fontWeight: 600 }}
      >
        {score}
      </text>
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════
   WARDROBE PANEL
═══════════════════════════════════════════════════════════════ */
function WardrobePanel({ myItems, onToggle, onClose }) {
  const [cat, setCat] = useState("All");
  const visible = cat === "All" ? WARDROBE : WARDROBE.filter(i => i.cat === cat);

  return (
    <motion.div
      initial={{ x: -360, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -360, opacity: 0 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)",
        zIndex: 30, width: 300, maxHeight: "80vh",
        display: "flex", flexDirection: "column",
        background: TOKEN.bgPanel,
        backdropFilter: "blur(32px)", WebkitBackdropFilter: "blur(32px)",
        border: `1px solid ${TOKEN.border}`,
        borderRadius: TOKEN.radiusXl,
        boxShadow: "0 24px 80px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.05)",
        fontFamily: TOKEN.fontBody,
      }}
    >
      {/* Gold top accent */}
      <div style={{ position: "absolute", top: 0, left: 40, right: 40, height: 1, background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.6), transparent)", borderRadius: "0 0 2px 2px" }} />

      {/* Header */}
      <div style={{ padding: "18px 18px 14px", borderBottom: `1px solid ${TOKEN.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: "0.16em", color: TOKEN.textDim, textTransform: "uppercase", marginBottom: 2 }}>Wardrobe</div>
          <div style={{ fontSize: 16, fontFamily: TOKEN.fontDisplay, color: TOKEN.text, fontWeight: 600 }}>Your Collection</div>
        </div>
        <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(255,255,255,0.05)", border: `1px solid ${TOKEN.border}`, color: TOKEN.textMuted, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>×</button>
      </div>

      {/* Category filter */}
      <div style={{ padding: "10px 14px", display: "flex", gap: 6, overflowX: "auto", scrollbarWidth: "none", flexShrink: 0 }}>
        {CATS.map(c => (
          <button key={c} onClick={() => setCat(c)} style={{
            flexShrink: 0, padding: "5px 12px", borderRadius: 999, fontSize: 11,
            fontFamily: TOKEN.fontBody, cursor: "pointer", transition: "all 0.2s",
            background: cat === c ? TOKEN.gold : "rgba(255,255,255,0.04)",
            color: cat === c ? "#09090f" : TOKEN.textMuted,
            border: cat === c ? "none" : `1px solid ${TOKEN.border}`,
            fontWeight: cat === c ? 600 : 400,
          }}>{c}</button>
        ))}
      </div>

      {/* Items list */}
      <div style={{ ...scrollStyle, flex: 1, padding: "6px 12px 16px" }}>
        <AnimatePresence>
          {visible.map((item, i) => {
            const active = myItems.includes(item.id);
            return (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                transition={{ delay: i * 0.025 }}
                onClick={() => onToggle(item)}
                style={{
                  width: "100%", display: "flex", alignItems: "center", gap: 12,
                  padding: "10px 12px", borderRadius: 14, marginBottom: 4,
                  background: active ? "rgba(201,168,76,0.1)" : "rgba(255,255,255,0.02)",
                  border: active ? `1px solid rgba(201,168,76,0.3)` : `1px solid ${TOKEN.border}`,
                  cursor: "pointer", textAlign: "left", transition: "all 0.2s",
                  fontFamily: TOKEN.fontBody,
                }}
              >
                {/* Swatch */}
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 10,
                    background: item.hex,
                    border: `2px solid ${item.accent}50`,
                    boxShadow: active ? `0 0 12px ${item.accent}40` : "none",
                  }} />
                  {active && (
                    <motion.div
                      initial={{ scale: 0 }} animate={{ scale: 1 }}
                      style={{ position: "absolute", top: -4, right: -4, width: 14, height: 14, borderRadius: "50%", background: TOKEN.emerald, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, color: "#fff" }}
                    >✓</motion.div>
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: active ? TOKEN.text : "#aaa", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.name}</div>
                  <div style={{ display: "flex", gap: 6, marginTop: 3, alignItems: "center" }}>
                    <span style={{ fontSize: 10, color: TOKEN.textDim }}>{item.cat}</span>
                    <span style={{ width: 2, height: 2, borderRadius: "50%", background: TOKEN.textDim, flexShrink: 0 }} />
                    <span style={{ fontSize: 10, padding: "1px 7px", borderRadius: 999, background: `${item.accent}18`, color: item.accent }}>{item.tag}</span>
                  </div>
                </div>
                <span style={{ fontSize: 10, color: active ? TOKEN.gold : TOKEN.textDim, flexShrink: 0 }}>›</span>
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   USER ROSTER PANEL (right side)
═══════════════════════════════════════════════════════════════ */
function RosterPanel({ users, myId, onVote, onViewUser, viewingUser }) {
  const others = users.filter(u => u.id !== myId);
  const me = users.find(u => u.id === myId);

  return (
    <motion.div
      initial={{ x: 340, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: "absolute", right: 16, top: 80, bottom: 80,
        zIndex: 20, width: 270, display: "flex", flexDirection: "column", gap: 10,
        fontFamily: TOKEN.fontBody,
      }}
    >
      {/* Room header */}
      <GlassPanel style={{ padding: "14px 16px", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 2 }}
            style={{ width: 7, height: 7, borderRadius: "50%", background: TOKEN.emerald, boxShadow: `0 0 8px ${TOKEN.emerald}` }} />
          <span style={{ fontSize: 10, letterSpacing: "0.18em", color: TOKEN.textMuted, textTransform: "uppercase" }}>Live Room</span>
          <span style={{ marginLeft: "auto", fontSize: 10, color: TOKEN.textDim, fontFamily: TOKEN.fontMono }}>#{Math.floor(Math.random() * 9000 + 1000)}</span>
        </div>
        <div style={{ display: "flex", gap: -6 }}>
          {users.map((u, i) => (
            <div key={u.id} style={{ width: 28, height: 28, borderRadius: "50%", background: u.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#fff", fontWeight: 600, border: "2px solid #09090f", marginLeft: i > 0 ? -8 : 0, zIndex: users.length - i }}>
              {u.avatar.slice(0, 1)}
            </div>
          ))}
          <div style={{ marginLeft: 12, display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div style={{ fontSize: 13, color: TOKEN.text, fontWeight: 500 }}>{users.length} Stylists</div>
            <div style={{ fontSize: 10, color: TOKEN.textDim }}>Active session</div>
          </div>
        </div>
      </GlassPanel>

      {/* Other users */}
      <div style={{ ...scrollStyle, flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
        {others.map(user => {
          const items = user.items.map(id => WARDROBE.find(w => w.id === id)).filter(Boolean);
          const topItem = items.find(i => i.cat === "Tops");
          const botItem = items.find(i => i.cat === "Bottoms");
          const shoItem = items.find(i => i.cat === "Shoes");
          const myVote = me?.votes?.[user.id];
          const totalVotes = Object.values(user.votes || {}).length;
          const isViewing = viewingUser === user.id;

          return (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: isViewing ? "rgba(201,168,76,0.08)" : TOKEN.bgCard,
                backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
                border: isViewing ? `1px solid rgba(201,168,76,0.25)` : `1px solid ${TOKEN.border}`,
                borderRadius: TOKEN.radiusLg,
                padding: "12px 14px",
                cursor: "pointer",
                transition: "all 0.25s",
              }}
              onClick={() => onViewUser(user.id)}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: items.length ? 10 : 0 }}>
                <div style={{ width: 34, height: 34, borderRadius: "50%", background: user.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#fff", fontWeight: 700, flexShrink: 0 }}>
                  {user.avatar}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: TOKEN.text, display: "flex", alignItems: "center", gap: 6 }}>
                    {user.name}
                    {user.isTyping && (
                      <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.2 }} style={{ fontSize: 9, color: TOKEN.textDim }}>typing...</motion.span>
                    )}
                  </div>
                  <div style={{ fontSize: 10, color: TOKEN.textDim }}>{items.length} items selected</div>
                </div>
                {user.aiScore && (
                  <div style={{ flexShrink: 0 }}>
                    <ScoreRing score={user.aiScore} size={38} color={user.color} />
                  </div>
                )}
              </div>

              {items.length > 0 && (
                <>
                  <MiniMannequin topHex={topItem?.hex} bottomHex={botItem?.hex} shoeHex={shoItem?.hex} />
                  <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {items.slice(0, 3).map(it => (
                      <span key={it.id} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 999, background: `${it.accent}14`, color: it.accent, border: `1px solid ${it.accent}25` }}>{it.name}</span>
                    ))}
                    {items.length > 3 && <span style={{ fontSize: 10, color: TOKEN.textDim }}>+{items.length - 3}</span>}
                  </div>

                  <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 8 }}>
                    <button
                      onClick={e => { e.stopPropagation(); onVote(user.id, 1); }}
                      style={{
                        flex: 1, padding: "6px 0", borderRadius: 8, fontSize: 12,
                        background: myVote === 1 ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.04)",
                        border: myVote === 1 ? `1px solid rgba(16,185,129,0.35)` : `1px solid ${TOKEN.border}`,
                        color: myVote === 1 ? TOKEN.emerald : TOKEN.textMuted,
                        cursor: "pointer", fontFamily: TOKEN.fontBody, transition: "all 0.2s",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                      }}
                    >
                      <span style={{ fontSize: 13 }}>↑</span> {totalVotes}
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); onVote(user.id, -1); }}
                      style={{
                        flex: 1, padding: "6px 0", borderRadius: 8, fontSize: 12,
                        background: myVote === -1 ? "rgba(244,63,94,0.12)" : "rgba(255,255,255,0.04)",
                        border: myVote === -1 ? `1px solid rgba(244,63,94,0.3)` : `1px solid ${TOKEN.border}`,
                        color: myVote === -1 ? TOKEN.rose : TOKEN.textMuted,
                        cursor: "pointer", fontFamily: TOKEN.fontBody, transition: "all 0.2s",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                      }}
                    >
                      <span style={{ fontSize: 13 }}>↓</span>
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   AI ANALYSIS PANEL
═══════════════════════════════════════════════════════════════ */
function AIPanel({ analysis, onClose, isLoading, userName }) {
  return (
    <motion.div
      initial={{ y: 60, opacity: 0, scale: 0.96 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: 40, opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: "absolute", bottom: 90, left: "50%", transform: "translateX(-50%)",
        zIndex: 40, width: 480, maxWidth: "calc(100vw - 32px)",
        background: TOKEN.bgPanel, backdropFilter: "blur(40px)", WebkitBackdropFilter: "blur(40px)",
        border: `1px solid rgba(201,168,76,0.2)`,
        borderRadius: TOKEN.radiusXl,
        boxShadow: "0 32px 100px rgba(0,0,0,0.9), 0 0 0 1px rgba(201,168,76,0.08)",
        fontFamily: TOKEN.fontBody,
        overflow: "hidden",
      }}
    >
      {/* Top gradient accent */}
      <div style={{ height: 2, background: "linear-gradient(90deg, transparent, #c9a84c, #7c3aed, transparent)" }} />

      {isLoading ? (
        <div style={{ padding: "36px 24px", textAlign: "center" }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            style={{ width: 40, height: 40, borderRadius: "50%", border: "2px solid rgba(201,168,76,0.2)", borderTopColor: TOKEN.gold, margin: "0 auto 16px" }}
          />
          <div style={{ fontSize: 14, color: TOKEN.textMuted }}>AI Stylist analysing your look…</div>
          <div style={{ fontSize: 11, color: TOKEN.textDim, marginTop: 6 }}>Reading silhouette, tonal palette, and styling coherence</div>
        </div>
      ) : analysis ? (
        <div style={{ padding: "22px 24px 24px" }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 10, letterSpacing: "0.2em", color: TOKEN.textDim, textTransform: "uppercase", marginBottom: 4 }}>AI Stylist — {userName}</div>
              <div style={{ fontSize: 19, fontFamily: TOKEN.fontDisplay, color: TOKEN.text, fontWeight: 600, lineHeight: 1.2 }}>{analysis.headline}</div>
            </div>
            <ScoreRing score={analysis.score} size={58} color={TOKEN.gold} />
          </div>

          {/* Aesthetic badge */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 999, background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.2)", marginBottom: 14 }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: TOKEN.gold }} />
            <span style={{ fontSize: 11, color: TOKEN.gold, letterSpacing: "0.1em" }}>{analysis.aesthetic}</span>
          </div>

          {/* Analysis text */}
          <p style={{ fontSize: 13, color: "#999", lineHeight: 1.65, marginBottom: 16 }}>{analysis.analysis}</p>

          {/* Strengths + Tension */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
            <div style={{ padding: "10px 12px", borderRadius: 12, background: "rgba(16,185,129,0.07)", border: "1px solid rgba(16,185,129,0.15)" }}>
              <div style={{ fontSize: 10, color: TOKEN.emerald, letterSpacing: "0.12em", marginBottom: 6 }}>STRENGTHS</div>
              {(analysis.strengths || []).map((s, i) => (
                <div key={i} style={{ display: "flex", gap: 6, alignItems: "flex-start", marginBottom: 4 }}>
                  <span style={{ color: TOKEN.emerald, fontSize: 11, marginTop: 1 }}>✓</span>
                  <span style={{ fontSize: 11, color: "#aaa" }}>{s}</span>
                </div>
              ))}
            </div>
            <div style={{ padding: "10px 12px", borderRadius: 12, background: "rgba(244,63,94,0.06)", border: "1px solid rgba(244,63,94,0.12)" }}>
              <div style={{ fontSize: 10, color: TOKEN.rose, letterSpacing: "0.12em", marginBottom: 6 }}>TENSION</div>
              <span style={{ fontSize: 11, color: "#aaa", lineHeight: 1.5 }}>{analysis.tension}</span>
            </div>
          </div>

          {/* Tags */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {(analysis.tags || []).map(t => (
              <span key={t} style={{ fontSize: 10, padding: "3px 10px", borderRadius: 999, background: "rgba(124,58,237,0.12)", color: TOKEN.violetLight, border: "1px solid rgba(124,58,237,0.2)" }}>{t}</span>
            ))}
          </div>
        </div>
      ) : null}

      <button onClick={onClose} style={{
        position: "absolute", top: 14, right: 14, width: 26, height: 26, borderRadius: 7,
        background: "rgba(255,255,255,0.06)", border: `1px solid ${TOKEN.border}`, color: TOKEN.textMuted,
        cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center",
      }}>×</button>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ROOM INSIGHT PANEL
═══════════════════════════════════════════════════════════════ */
function InsightPanel({ insight, onClose }) {
  if (!insight) return null;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      style={{
        position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
        zIndex: 50, width: 440, maxWidth: "calc(100vw - 32px)",
        background: "rgba(9,9,15,0.97)", backdropFilter: "blur(40px)", WebkitBackdropFilter: "blur(40px)",
        border: `1px solid rgba(201,168,76,0.2)`, borderRadius: TOKEN.radiusXl,
        boxShadow: "0 32px 100px rgba(0,0,0,0.95), 0 0 60px rgba(201,168,76,0.06)",
        fontFamily: TOKEN.fontBody, overflow: "hidden",
      }}
    >
      <div style={{ height: 2, background: "linear-gradient(90deg, transparent, #c9a84c, #0ea5e9, transparent)" }} />
      <div style={{ padding: "28px 28px 32px" }}>
        <div style={{ fontSize: 10, letterSpacing: "0.22em", color: TOKEN.textDim, textTransform: "uppercase", marginBottom: 10 }}>Room Editorial</div>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 14px", borderRadius: 999, background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.2)", marginBottom: 18 }}>
          <span style={{ fontSize: 12, color: TOKEN.gold, fontWeight: 600 }}>{insight.roomTheme}</span>
        </div>
        <p style={{ fontSize: 14, color: "#9090a8", lineHeight: 1.7, marginBottom: 22 }}>{insight.observation}</p>
        <div style={{ padding: "14px 16px", borderRadius: 14, background: "rgba(201,168,76,0.07)", border: "1px solid rgba(201,168,76,0.12)" }}>
          <div style={{ fontSize: 10, color: TOKEN.gold, letterSpacing: "0.14em", marginBottom: 6 }}>EDITORIAL STANDOUT</div>
          <div style={{ fontSize: 13, color: TOKEN.text }}>{insight.standout}</div>
        </div>
      </div>
      <button onClick={onClose} style={{ position: "absolute", top: 14, right: 14, width: 28, height: 28, borderRadius: 8, background: "rgba(255,255,255,0.05)", border: `1px solid ${TOKEN.border}`, color: TOKEN.textMuted, cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   LIVE CHAT
═══════════════════════════════════════════════════════════════ */
function ChatPanel({ messages, users, onSend, onClose }) {
  const [input, setInput] = useState("");
  const bottomRef = useRef();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    onSend(input.trim());
    setInput("");
  };

  return (
    <motion.div
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 30, opacity: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: "absolute", bottom: 80, left: 16, zIndex: 30,
        width: 300, height: 360, display: "flex", flexDirection: "column",
        background: TOKEN.bgPanel, backdropFilter: "blur(32px)", WebkitBackdropFilter: "blur(32px)",
        border: `1px solid ${TOKEN.border}`, borderRadius: TOKEN.radiusXl,
        boxShadow: "0 20px 70px rgba(0,0,0,0.8)",
        fontFamily: TOKEN.fontBody, overflow: "hidden",
      }}
    >
      <div style={{ padding: "14px 16px", borderBottom: `1px solid ${TOKEN.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ fontSize: 12, color: TOKEN.text, fontWeight: 500 }}>Room Chat</div>
        <button onClick={onClose} style={{ background: "none", border: "none", color: TOKEN.textMuted, cursor: "pointer", fontSize: 14 }}>×</button>
      </div>

      <div style={{ ...scrollStyle, flex: 1, padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
        {messages.map((m, i) => {
          const user = users.find(u => u.id === m.uid);
          const isMe = m.uid === "me";
          return (
            <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} style={{ display: "flex", gap: 8, flexDirection: isMe ? "row-reverse" : "row", alignItems: "flex-end" }}>
              <div style={{ width: 24, height: 24, borderRadius: "50%", background: user?.color || "#555", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "#fff", fontWeight: 700, flexShrink: 0 }}>
                {user?.avatar?.slice(0, 1)}
              </div>
              <div style={{ maxWidth: "75%" }}>
                {!isMe && <div style={{ fontSize: 9, color: TOKEN.textDim, marginBottom: 3, letterSpacing: "0.05em" }}>{user?.name}</div>}
                <div style={{
                  padding: "8px 12px", borderRadius: isMe ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                  background: isMe ? `rgba(201,168,76,0.15)` : "rgba(255,255,255,0.05)",
                  border: isMe ? `1px solid rgba(201,168,76,0.2)` : `1px solid ${TOKEN.border}`,
                  fontSize: 12, color: TOKEN.text, lineHeight: 1.5,
                }}>
                  {m.text}
                </div>
                <div style={{ fontSize: 9, color: TOKEN.textDim, marginTop: 3, textAlign: isMe ? "right" : "left" }}>{m.ts}</div>
              </div>
            </motion.div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div style={{ padding: "10px 12px", borderTop: `1px solid ${TOKEN.border}`, display: "flex", gap: 8, flexShrink: 0 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSend()}
          placeholder="Message the room…"
          style={{
            flex: 1, background: "rgba(255,255,255,0.04)", border: `1px solid ${TOKEN.border}`,
            borderRadius: 10, padding: "8px 12px", fontSize: 12, color: TOKEN.text,
            fontFamily: TOKEN.fontBody, outline: "none",
          }}
        />
        <button
          onClick={handleSend}
          style={{
            width: 34, height: 34, borderRadius: 10, background: TOKEN.gold, border: "none",
            color: "#09090f", cursor: "pointer", fontSize: 14, fontWeight: 700,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >→</button>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   VIEWER OVERLAY — see another user's mannequin in full
═══════════════════════════════════════════════════════════════ */
function UserViewer({ user, onClose, onAnalyse, isLoading }) {
  const items = user.items.map(id => WARDROBE.find(w => w.id === id)).filter(Boolean);
  const topItem = items.find(i => i.cat === "Tops");
  const botItem = items.find(i => i.cat === "Bottoms");
  const shoItem = items.find(i => i.cat === "Shoes");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: "absolute", inset: 0, zIndex: 45,
        background: "rgba(9,9,15,0.75)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: TOKEN.fontBody,
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.94, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 10 }}
        style={{
          width: 560, maxWidth: "90vw", background: "rgba(9,9,15,0.98)",
          border: `1px solid rgba(201,168,76,0.18)`, borderRadius: TOKEN.radiusXl,
          boxShadow: "0 40px 120px rgba(0,0,0,0.95)",
          overflow: "hidden",
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ height: 2, background: `linear-gradient(90deg, transparent, ${user.color}, transparent)` }} />
        <div style={{ padding: "24px 24px 0", display: "flex", gap: 16, alignItems: "flex-start" }}>
          <div style={{ width: 44, height: 44, borderRadius: "50%", background: user.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "#fff", fontWeight: 700, flexShrink: 0 }}>
            {user.avatar}
          </div>
          <div>
            <div style={{ fontSize: 18, fontFamily: TOKEN.fontDisplay, color: TOKEN.text, fontWeight: 600 }}>{user.name}'s Look</div>
            <div style={{ fontSize: 11, color: TOKEN.textDim, marginTop: 2 }}>{items.length} pieces selected</div>
          </div>
          {user.aiScore && <ScoreRing score={user.aiScore} size={52} color={user.color} />}
        </div>

        {/* Mini 3D preview */}
        <div style={{ height: 280, margin: "20px 24px 0", borderRadius: 16, overflow: "hidden", background: "#050508" }}>
          {items.length > 0 ? (
            <Canvas camera={{ position: [0, 0.5, 5], fov: 40 }} dpr={[1, 1.5]} gl={{ antialias: true }}>
              <ambientLight intensity={0.3} />
              <spotLight position={[4, 6, 4]} angle={0.3} penumbra={0.8} intensity={3} color="#fff" />
              <spotLight position={[-3, 4, -3]} intensity={1.5} color={user.color} />
              <Environment preset="city" />
              <Float speed={1.2} rotationIntensity={0.07} floatIntensity={0.25}>
                <MannequinFigure
                  topHex={topItem?.hex || "#111"}
                  bottomHex={botItem?.hex || "#1a1a1a"}
                  shoeHex={shoItem?.hex || "#333"}
                />
              </Float>
              <ContactShadows position={[0, -2.18, 0]} opacity={0.5} scale={5} blur={2} />
              <OrbitControls enablePan={false} enableZoom minDistance={3} maxDistance={7} minPolarAngle={Math.PI / 5} maxPolarAngle={Math.PI / 1.9} autoRotate autoRotateSpeed={0.6} />
            </Canvas>
          ) : (
            <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: TOKEN.textDim, fontSize: 13 }}>No items selected yet</div>
          )}
        </div>

        {/* Item list */}
        <div style={{ padding: "16px 24px" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {items.map(it => (
              <div key={it.id} style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 10px", borderRadius: 10, background: "rgba(255,255,255,0.04)", border: `1px solid ${TOKEN.border}` }}>
                <div style={{ width: 10, height: 10, borderRadius: 3, background: it.hex, flexShrink: 0 }} />
                <span style={{ fontSize: 11, color: "#aaa" }}>{it.name}</span>
              </div>
            ))}
          </div>
        </div>

        {user.aiAnalysis && (
          <div style={{ margin: "0 24px 16px", padding: "12px 14px", borderRadius: 14, background: "rgba(201,168,76,0.07)", border: "1px solid rgba(201,168,76,0.12)" }}>
            <div style={{ fontSize: 10, color: TOKEN.gold, letterSpacing: "0.12em", marginBottom: 6 }}>AI ANALYSIS — {user.aiAnalysis.aesthetic}</div>
            <p style={{ fontSize: 12, color: "#999", lineHeight: 1.6, margin: 0 }}>{user.aiAnalysis.analysis}</p>
          </div>
        )}

        {/* Actions */}
        <div style={{ padding: "0 24px 24px", display: "flex", gap: 10 }}>
          {items.length > 0 && !user.aiAnalysis && (
            <button
              onClick={onAnalyse}
              disabled={isLoading}
              style={{
                flex: 1, padding: "11px 0", borderRadius: 12, fontSize: 13, fontWeight: 500,
                background: "rgba(201,168,76,0.12)", border: "1px solid rgba(201,168,76,0.25)",
                color: TOKEN.gold, cursor: isLoading ? "not-allowed" : "pointer",
                fontFamily: TOKEN.fontBody, transition: "all 0.2s",
                opacity: isLoading ? 0.6 : 1,
              }}
            >
              {isLoading ? "Analysing…" : "✦ Run AI Analysis"}
            </button>
          )}
          <button onClick={onClose} style={{ flex: 1, padding: "11px 0", borderRadius: 12, fontSize: 13, background: "rgba(255,255,255,0.04)", border: `1px solid ${TOKEN.border}`, color: TOKEN.textMuted, cursor: "pointer", fontFamily: TOKEN.fontBody }}>Close</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   LOADING SCREEN
═══════════════════════════════════════════════════════════════ */
function LoadingScreen({ onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2800);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <motion.div
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
      style={{
        position: "absolute", inset: 0, zIndex: 100,
        background: TOKEN.bg, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        fontFamily: TOKEN.fontBody,
      }}
    >
      {/* Decorative rings */}
      <div style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", border: "1px solid rgba(201,168,76,0.06)", animation: "spin 20s linear infinite" }} />
      <div style={{ position: "absolute", width: 280, height: 280, borderRadius: "50%", border: "1px solid rgba(124,58,237,0.07)", animation: "spinR 15s linear infinite" }} />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} style={{ textAlign: "center" }}>
        <div style={{ fontSize: 11, letterSpacing: "0.35em", color: TOKEN.textDim, textTransform: "uppercase", marginBottom: 18 }}>Styling Platform</div>
        <div style={{ fontSize: 48, fontFamily: TOKEN.fontDisplay, color: TOKEN.text, fontWeight: 400, letterSpacing: "-0.01em", lineHeight: 1, marginBottom: 6 }}>
          Style<span style={{ color: TOKEN.gold, fontStyle: "italic", fontWeight: 300 }}>Space</span>
        </div>
        <div style={{ fontSize: 12, color: TOKEN.textDim, letterSpacing: "0.15em", marginBottom: 48 }}>LIVE COLLABORATION ROOM</div>

        <div style={{ width: 160, height: 1, background: "rgba(255,255,255,0.06)", borderRadius: 999, margin: "0 auto 6px", overflow: "hidden" }}>
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 2.2, ease: "easeInOut" }}
            style={{ height: "100%", background: "linear-gradient(90deg, #c9a84c, #7c3aed)", boxShadow: "0 0 12px rgba(201,168,76,0.5)" }}
          />
        </div>
        <div style={{ fontSize: 10, color: TOKEN.textDim, letterSpacing: "0.2em" }}>Connecting to session</div>
      </motion.div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes spinR { to { transform: rotate(-360deg); } }`}</style>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TOP NAV BAR
═══════════════════════════════════════════════════════════════ */
function TopBar({ users, onShowChat, chatOpen, onShowInsight, showingInsight, onAnalyseRoom, roomInsight, analysing }) {
  const activeCount = users.filter(u => u.items.length > 0).length;
  return (
    <motion.div
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: "absolute", top: 0, left: 0, right: 0, zIndex: 30,
        padding: "12px 16px",
        display: "flex", alignItems: "center", gap: 12,
        fontFamily: TOKEN.fontBody,
      }}
    >
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 16px", borderRadius: 999, background: "rgba(9,9,15,0.9)", border: `1px solid ${TOKEN.border}`, backdropFilter: "blur(20px)" }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: TOKEN.gold, boxShadow: `0 0 8px ${TOKEN.gold}` }} />
        <span style={{ fontSize: 15, fontFamily: TOKEN.fontDisplay, color: TOKEN.text, fontWeight: 600 }}>
          Style<span style={{ color: TOKEN.gold, fontStyle: "italic", fontWeight: 300 }}>Space</span>
        </span>
      </div>

      {/* Session info */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", borderRadius: 999, background: "rgba(9,9,15,0.85)", border: `1px solid ${TOKEN.border}`, backdropFilter: "blur(20px)" }}>
        <motion.div animate={{ opacity: [1, 0.4, 1] }} transition={{ repeat: Infinity, duration: 2.5 }}
          style={{ width: 6, height: 6, borderRadius: "50%", background: TOKEN.emerald }} />
        <span style={{ fontSize: 11, color: TOKEN.textMuted, letterSpacing: "0.1em" }}>{users.length} LIVE · {activeCount} styled</span>
      </div>

      <div style={{ flex: 1 }} />

      {/* AI Room Insight */}
      <button
        onClick={onAnalyseRoom}
        disabled={analysing}
        style={{
          padding: "8px 16px", borderRadius: 999, fontSize: 12, fontWeight: 500,
          background: showingInsight ? "rgba(201,168,76,0.15)" : "rgba(9,9,15,0.85)",
          border: showingInsight ? "1px solid rgba(201,168,76,0.3)" : `1px solid ${TOKEN.border}`,
          color: showingInsight ? TOKEN.gold : TOKEN.textMuted,
          backdropFilter: "blur(20px)", cursor: analysing ? "not-allowed" : "pointer",
          fontFamily: TOKEN.fontBody, transition: "all 0.2s",
          display: "flex", alignItems: "center", gap: 7,
          opacity: analysing ? 0.6 : 1,
        }}
      >
        <span style={{ fontSize: 13 }}>✦</span>
        {analysing ? "Reading room…" : "Room Insight"}
      </button>

      {/* Chat */}
      <button
        onClick={onShowChat}
        style={{
          padding: "8px 16px", borderRadius: 999, fontSize: 12,
          background: chatOpen ? "rgba(14,165,233,0.12)" : "rgba(9,9,15,0.85)",
          border: chatOpen ? "1px solid rgba(14,165,233,0.25)" : `1px solid ${TOKEN.border}`,
          color: chatOpen ? TOKEN.cyan : TOKEN.textMuted,
          backdropFilter: "blur(20px)", cursor: "pointer",
          fontFamily: TOKEN.fontBody, transition: "all 0.2s",
          display: "flex", alignItems: "center", gap: 7,
        }}
      >
        <span>💬</span>
        <span>Chat</span>
      </button>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   BOTTOM TOOLBAR
═══════════════════════════════════════════════════════════════ */
const LIGHTINGS = [
  { label: "Studio", val: "studio" },
  { label: "City", val: "city" },
  { label: "Dawn", val: "dawn" },
  { label: "Night", val: "night" },
  { label: "Lobby", val: "lobby" },
];

function BottomBar({ lighting, setLighting, onWardrobe, wardrobeOpen, onAnalyse, analysing, myItems, onReset, showToast }) {
  return (
    <motion.div
      initial={{ y: 60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)",
        zIndex: 30, display: "flex", alignItems: "center", gap: 8,
        padding: "8px 16px",
        background: "rgba(9,9,15,0.93)", backdropFilter: "blur(28px)", WebkitBackdropFilter: "blur(28px)",
        border: `1px solid ${TOKEN.border}`, borderRadius: 999,
        boxShadow: "0 10px 50px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.04)",
        fontFamily: TOKEN.fontBody,
      }}
    >
      {/* Wardrobe toggle */}
      <button
        onClick={onWardrobe}
        style={{
          padding: "7px 14px", borderRadius: 999, fontSize: 12, fontWeight: 500,
          background: wardrobeOpen ? "rgba(201,168,76,0.15)" : "transparent",
          border: wardrobeOpen ? "1px solid rgba(201,168,76,0.3)" : "1px solid transparent",
          color: wardrobeOpen ? TOKEN.gold : TOKEN.textMuted,
          cursor: "pointer", fontFamily: TOKEN.fontBody, transition: "all 0.2s",
          display: "flex", alignItems: "center", gap: 6,
        }}
      >
        <span style={{ fontSize: 14 }}>👗</span> Wardrobe
        {myItems.length > 0 && <span style={{ width: 16, height: 16, borderRadius: "50%", background: TOKEN.gold, color: "#09090f", fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{myItems.length}</span>}
      </button>

      <div style={{ width: 1, height: 20, background: TOKEN.border }} />

      {/* Lighting */}
      <div style={{ display: "flex", gap: 2 }}>
        {LIGHTINGS.map(l => (
          <button key={l.val} onClick={() => { setLighting(l.val); showToast(`${l.label} lighting`); }}
            style={{
              padding: "6px 11px", borderRadius: 999, fontSize: 11,
              background: lighting === l.val ? "rgba(124,58,237,0.15)" : "transparent",
              border: lighting === l.val ? "1px solid rgba(124,58,237,0.3)" : "1px solid transparent",
              color: lighting === l.val ? TOKEN.violetLight : TOKEN.textMuted,
              cursor: "pointer", fontFamily: TOKEN.fontBody, transition: "all 0.2s",
            }}
          >{l.label}</button>
        ))}
      </div>

      <div style={{ width: 1, height: 20, background: TOKEN.border }} />

      {/* AI Analyse */}
      <button
        onClick={onAnalyse}
        disabled={analysing || myItems.length === 0}
        style={{
          padding: "7px 16px", borderRadius: 999, fontSize: 12, fontWeight: 600,
          background: myItems.length > 0 ? "rgba(201,168,76,0.15)" : "rgba(255,255,255,0.03)",
          border: myItems.length > 0 ? "1px solid rgba(201,168,76,0.35)" : `1px solid ${TOKEN.border}`,
          color: myItems.length > 0 ? TOKEN.gold : TOKEN.textDim,
          cursor: myItems.length > 0 && !analysing ? "pointer" : "not-allowed",
          fontFamily: TOKEN.fontBody, transition: "all 0.25s",
          display: "flex", alignItems: "center", gap: 6,
          opacity: analysing ? 0.7 : 1,
        }}
      >
        <span style={{ fontSize: 13 }}>✦</span>
        {analysing ? "Analysing…" : "AI Critique"}
      </button>

      {/* Reset */}
      <button
        onClick={onReset}
        style={{
          width: 32, height: 32, borderRadius: "50%",
          background: "rgba(255,255,255,0.04)", border: `1px solid ${TOKEN.border}`,
          color: TOKEN.textMuted, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13,
        }}
        title="Reset look"
      >↺</button>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TOAST
═══════════════════════════════════════════════════════════════ */
function Toast({ msg, visible }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10 }}
          style={{
            position: "absolute", bottom: 80, left: "50%", transform: "translateX(-50%)",
            zIndex: 60, padding: "9px 18px", borderRadius: 999,
            background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)",
            backdropFilter: "blur(20px)", color: TOKEN.emerald, fontSize: 12,
            fontFamily: TOKEN.fontBody, display: "flex", alignItems: "center", gap: 7,
            boxShadow: "0 8px 30px rgba(0,0,0,0.6)",
          }}
        >
          <span>✓</span> {msg}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MY LOOK HUD (top-left info bubble)
═══════════════════════════════════════════════════════════════ */
function MyLookHUD({ items, analysis }) {
  if (!items.length) return null;
  const topItem = items.find(i => i.cat === "Tops");
  const botItem = items.find(i => i.cat === "Bottoms");
  const shoItem = items.find(i => i.cat === "Shoes");

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      style={{
        position: "absolute", top: 80, left: 16, zIndex: 20,
        background: TOKEN.bgCard, backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
        border: `1px solid ${TOKEN.border}`, borderRadius: TOKEN.radiusLg,
        padding: "12px 14px", fontFamily: TOKEN.fontBody,
        display: "flex", alignItems: "center", gap: 12,
      }}
    >
      <MiniMannequin topHex={topItem?.hex} bottomHex={botItem?.hex} shoeHex={shoItem?.hex} />
      <div>
        <div style={{ fontSize: 10, color: TOKEN.textDim, letterSpacing: "0.12em", marginBottom: 4 }}>YOUR LOOK</div>
        {analysis ? (
          <>
            <div style={{ fontSize: 12, color: TOKEN.gold, fontWeight: 500 }}>{analysis.aesthetic}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
              <div style={{ flex: 1, height: 3, borderRadius: 999, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                <motion.div
                  animate={{ width: `${analysis.score}%` }}
                  transition={{ duration: 1 }}
                  style={{ height: "100%", background: "linear-gradient(90deg, #7c3aed, #c9a84c)" }}
                />
              </div>
              <span style={{ fontSize: 10, color: TOKEN.gold, fontFamily: TOKEN.fontMono }}>{analysis.score}</span>
            </div>
          </>
        ) : (
          <div style={{ fontSize: 11, color: TOKEN.textMuted }}>{items.length} items · Unstyled</div>
        )}
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN APP
═══════════════════════════════════════════════════════════════ */
export default function StyleSpace() {
  const [loaded, setLoaded] = useState(false);
  const [users, setUsers] = useState(INITIAL_USERS);
  const [lighting, setLighting] = useState("city");
  const [showWardrobe, setShowWardrobe] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [viewingUser, setViewingUser] = useState(null);
  const [aiPanel, setAiPanel] = useState(null); // { analysis, loading }
  const [aiAnalysing, setAiAnalysing] = useState(false);
  const [roomInsight, setRoomInsight] = useState(null);
  const [insightLoading, setInsightLoading] = useState(false);
  const [showInsight, setShowInsight] = useState(false);
  const [toast, setToast] = useState({ msg: "", visible: false });
  const [chatMessages, setChatMessages] = useState(CHAT_SEED);
  const toastTimer = useRef();

  const showToast = useCallback((msg) => {
    setToast({ msg, visible: true });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(t => ({ ...t, visible: false })), 2600);
  }, []);

  const me = useMemo(() => users.find(u => u.id === "me"), [users]);
  const myItemIds = me?.items || [];
  const myItems = myItemIds.map(id => WARDROBE.find(w => w.id === id)).filter(Boolean);

  // Resolve active 3D colors for MY mannequin
  const topItem = myItems.find(i => i.cat === "Tops");
  const botItem = myItems.find(i => i.cat === "Bottoms");
  const shoItem = myItems.find(i => i.cat === "Shoes");

  const toggleItem = useCallback((item) => {
    setUsers(prev => prev.map(u => {
      if (u.id !== "me") return u;
      const exists = u.items.includes(item.id);
      if (exists) return { ...u, items: u.items.filter(id => id !== item.id) };
      const filtered = u.items.filter(id => {
        const w = WARDROBE.find(w => w.id === id);
        return w?.cat !== item.cat;
      });
      return { ...u, items: [...filtered, item.id] };
    }));
  }, []);

  const handleVote = useCallback((targetId, val) => {
    setUsers(prev => prev.map(u => {
      if (u.id !== "me") return u;
      const currentVote = u.votes[targetId];
      const newVotes = { ...u.votes };
      if (currentVote === val) delete newVotes[targetId];
      else newVotes[targetId] = val;
      return { ...u, votes: newVotes };
    }));
    showToast(val === 1 ? "Upvoted this look" : "Downvoted this look");
  }, [showToast]);

  const handleAnalyseMe = useCallback(async () => {
    if (!myItems.length) { showToast("Select some items first"); return; }
    setAiAnalysing(true);
    setAiPanel({ analysis: null, loading: true });
    const result = await analyseOutfit(myItems);
    setUsers(prev => prev.map(u => u.id === "me" ? { ...u, aiScore: result.score, aiAnalysis: result } : u));
    setAiPanel({ analysis: result, loading: false });
    setAiAnalysing(false);
    showToast("AI analysis complete");
  }, [myItems, showToast]);

  const handleAnalyseUser = useCallback(async (uid) => {
  const user = users.find(u => u.id === uid);
  if (!user) return;

  const items = user.items.map(id => WARDROBE.find(w => w.id === id)).filter(Boolean);
  if (!items.length) return;

  // 1. Set the user to "Analyzing" state
  setUsers(prev => prev.map(u => u.id === uid ? { ...u, isAnalysing: true } : u));

  try {
    // 2. Call your new backend route and pass the items as the payload
    const res = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: items }) // Actually sending the items to OpenAI
    });

    let result;
    if (!res.ok) {
      console.warn("API error, using fallback.");
      throw new Error("API failed");
    } else {
      const data = await res.json();
      const raw = data.result || "{}";
      const clean = raw.replace(/```json|```/g, "").trim();
      result = JSON.parse(clean);
    }

    // 4. Update the user state with the real AI results and turn off the loading state
    setUsers(prev => prev.map(u => u.id === uid ? { 
      ...u, 
      aiScore: result.score,
      aiAnalysis: result, 
      isAnalysing: false 
    } : u));

    showToast(`Analysis complete for ${user.name}`);

  } catch (error) {
    console.error("Analysis failed:", error);
    showToast(`Fallback analysis used for ${user.name}`);
    
    // Fallback logic
    const cats = [...new Set(items.map(i => i.cat))];
    const score = Math.min(98, 50 + items.length * 6 + cats.length * 4);
    const fallbackResult = {
      score,
      headline: "A considered edit with room to explore",
      analysis: "The outfit shows intentionality in its selection. The pieces have compatible tonal ranges and the silhouette reads as cohesive. Some styling tension remains in the category balance.",
      strengths: ["Tonal coherence", "Proportional balance"],
      tension: "Could push further in a singular direction",
      aesthetic: "Considered Minimal",
      tags: items.slice(0,3).map(i => i.tag),
    };

    setUsers(prev => prev.map(u => u.id === uid ? { 
      ...u, 
      aiScore: fallbackResult.score,
      aiAnalysis: fallbackResult, 
      isAnalysing: false 
    } : u));
  }
}, [users, showToast]);
  const handleRoomInsight = useCallback(async () => {
    setInsightLoading(true);
    const result = await generateRoomInsight(users);
    setRoomInsight(result);
    setShowInsight(true);
    setInsightLoading(false);
    showToast("Room insight ready");
  }, [users, showToast]);

  const sendChat = useCallback((text) => {
    setChatMessages(prev => [...prev, { uid: "me", text, ts: "just now" }]);
    // Simulate response after 3-6s
    const responders = users.filter(u => u.id !== "me");
    if (responders.length && Math.random() > 0.4) {
      const responder = responders[Math.floor(Math.random() * responders.length)];
      const responses = [
        "Love the direction you're taking!",
        "That combination is really strong.",
        "Interesting mix — very editorial.",
        "I'm going a completely different route haha",
        "Those pieces work really well together",
        "Can't wait to see the AI score on that",
      ];
      setTimeout(() => {
        setChatMessages(prev => [...prev, {
          uid: responder.id,
          text: responses[Math.floor(Math.random() * responses.length)],
          ts: "just now",
        }]);
      }, 2000 + Math.random() * 3000);
    }
  }, [users]);

  const handleReset = useCallback(() => {
    setUsers(prev => prev.map(u => u.id === "me" ? { ...u, items: [], aiScore: null, aiAnalysis: null } : u));
    setAiPanel(null);
    setLighting("city");
    showToast("Look reset");
  }, [showToast]);

  // Simulate other users occasionally updating typing status
  useEffect(() => {
    const interval = setInterval(() => {
      const otherIds = ["u1", "u2", "u3"];
      const uid = otherIds[Math.floor(Math.random() * otherIds.length)];
      setUsers(prev => prev.map(u => u.id === uid ? { ...u, isTyping: true } : u));
      setTimeout(() => setUsers(prev => prev.map(u => u.id === uid ? { ...u, isTyping: false } : u)), 2500);
    }, 8000);
    return () => clearInterval(interval);
  }, []);


  const viewedUser = viewingUser ? users.find(u => u.id === viewingUser) : null;

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh", background: TOKEN.bg, overflow: "hidden", fontFamily: TOKEN.fontBody }}>
      {/* Loading */}
      <AnimatePresence>{!loaded && <LoadingScreen onDone={() => setLoaded(true)} />}</AnimatePresence>

      {/* THREE.JS Canvas */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
        <Canvas camera={{ position: [0, 0.5, 5.5], fov: 42 }} shadows dpr={[1, 1.5]} gl={{ antialias: true, alpha: false }} style={{ background: "#09090f" }}>
          <Stage
            topHex={topItem?.hex || "#1c1c2e"}
            bottomHex={botItem?.hex || "#1a1a2e"}
            shoeHex={shoItem?.hex || "#2a2a2a"}
            lighting={lighting}
          />
        </Canvas>
      </div>

      {/* Vignette overlay */}
      <div style={{ position: "absolute", inset: 0, zIndex: 1, background: "radial-gradient(ellipse at center, transparent 40%, rgba(9,9,15,0.65) 100%)", pointerEvents: "none" }} />

      {/* Top bar */}
      {loaded && (
        <TopBar
          users={users}
          onShowChat={() => setShowChat(v => !v)}
          chatOpen={showChat}
          onAnalyseRoom={handleRoomInsight}
          showingInsight={showInsight}
          roomInsight={roomInsight}
          analysing={insightLoading}
        />
      )}

      {/* Wardrobe panel */}
      {loaded && (
        <AnimatePresence>
          {showWardrobe && (
            <WardrobePanel myItems={myItemIds} onToggle={toggleItem} onClose={() => setShowWardrobe(false)} />
          )}
        </AnimatePresence>
      )}

      {/* My look HUD — only when wardrobe closed */}
      {loaded && !showWardrobe && myItems.length > 0 && (
        <MyLookHUD items={myItems} analysis={me?.aiAnalysis} />
      )}

      {/* Roster panel */}
      {loaded && (
        <RosterPanel
          users={users}
          myId="me"
          onVote={handleVote}
          onViewUser={id => setViewingUser(id === viewingUser ? null : id)}
          viewingUser={viewingUser}
        />
      )}

      {/* Chat */}
      {loaded && (
        <AnimatePresence>
          {showChat && (
            <ChatPanel messages={chatMessages} users={users} onSend={sendChat} onClose={() => setShowChat(false)} />
          )}
        </AnimatePresence>
      )}

      {/* AI panel for MY look */}
      {loaded && (
        <AnimatePresence>
          {aiPanel && (
            <AIPanel
              analysis={aiPanel.analysis}
              isLoading={aiPanel.loading}
              onClose={() => setAiPanel(null)}
              userName="Your Look"
            />
          )}
        </AnimatePresence>
      )}

      {/* User viewer */}
      {loaded && (
        <AnimatePresence>
          {viewedUser && (
            <UserViewer
              user={viewedUser}
              onClose={() => setViewingUser(null)}
              onAnalyse={() => handleAnalyseUser(viewedUser.id)}
              isLoading={viewedUser.isAnalysing}
            />
          )}
        </AnimatePresence>
      )}

      {/* Room insight modal */}
      {loaded && (
        <AnimatePresence>
          {showInsight && roomInsight && (
            <InsightPanel insight={roomInsight} onClose={() => setShowInsight(false)} />
          )}
        </AnimatePresence>
      )}

      {/* Bottom bar */}
      {loaded && (
        <BottomBar
          lighting={lighting}
          setLighting={setLighting}
          onWardrobe={() => setShowWardrobe(v => !v)}
          wardrobeOpen={showWardrobe}
          onAnalyse={handleAnalyseMe}
          analysing={aiAnalysing}
          myItems={myItems}
          onReset={handleReset}
          showToast={showToast}
        />
      )}

      {/* Toast */}
      <Toast msg={toast.msg} visible={toast.visible} />

      {/* Empty state hint */}
      {loaded && myItems.length === 0 && !showWardrobe && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}
          style={{
            position: "absolute", bottom: 80, left: "50%", transform: "translateX(-50%)",
            fontSize: 11, letterSpacing: "0.2em", color: TOKEN.textDim, textTransform: "uppercase",
            pointerEvents: "none", textAlign: "center", zIndex: 5,
          }}
        >
          Open wardrobe to dress your mannequin
        </motion.div>
      )}

      {/* Drag hint */}
      {loaded && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: [0, 0.5, 0] }} transition={{ delay: 3, duration: 3, repeat: 3 }}
          style={{
            position: "absolute", bottom: 80, right: 20, fontSize: 10, color: TOKEN.textDim,
            letterSpacing: "0.15em", textTransform: "uppercase", pointerEvents: "none", zIndex: 5,
          }}
        >
          Drag to rotate
        </motion.div>
      )}
    </div>
  );
}