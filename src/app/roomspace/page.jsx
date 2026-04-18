"use client";

import { Suspense, useState, useRef, useEffect, useCallback } from "react";
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
  Sphere,
  Cylinder,
} from "@react-three/drei";
import { motion, AnimatePresence, useSpring, useMotionValue } from "framer-motion";
import * as THREE from "three";
import Link from "next/link";
import {
  ArrowLeft,
  SlidersHorizontal,
  RotateCcw,
  Maximize2,
  Minimize2,
  Shirt,
  Layers,
  Star,
  Zap,
  ChevronRight,
  ChevronLeft,
  Eye,
  X,
  Check,
  Palette,
  Sun,
  Moon,
  Camera,
  Wand2,
} from "lucide-react";

/* ══════════════════════════════════════════════════════
   MOCK WARDROBE DATA
══════════════════════════════════════════════════════ */
const WARDROBE_ITEMS = [
  {
    id: 1,
    name: "Oversized Graphic Tee",
    category: "Tops",
    hexColor: "#1c1c2e",
    accentColor: "#9b59ff",
    tag: "Casual",
  },
  {
    id: 2,
    name: "Ribbed Knit Sweater",
    category: "Tops",
    hexColor: "#d4c5b0",
    accentColor: "#c4a882",
    tag: "Smart",
  },
  {
    id: 3,
    name: "Vintage Denim Jacket",
    category: "Tops",
    hexColor: "#1e3a5f",
    accentColor: "#4a90d9",
    tag: "Layering",
  },
  {
    id: 4,
    name: "Wide Leg Cargos",
    category: "Bottoms",
    hexColor: "#2d3b2d",
    accentColor: "#4a7c4a",
    tag: "Casual",
  },
  {
    id: 5,
    name: "Tailored Trousers",
    category: "Bottoms",
    hexColor: "#1a1a1a",
    accentColor: "#888888",
    tag: "Sharp",
  },
  {
    id: 6,
    name: "Chunky Sneakers",
    category: "Shoes",
    hexColor: "#f5f5f5",
    accentColor: "#cccccc",
    tag: "Street",
  },
  {
    id: 7,
    name: "Silk Scarf",
    category: "Accessories",
    hexColor: "#8b1a4a",
    accentColor: "#e04080",
    tag: "Elevated",
  },
  {
    id: 8,
    name: "Minimal Watch",
    category: "Accessories",
    hexColor: "#c8a96e",
    accentColor: "#f0d090",
    tag: "Classic",
  },
];

const OUTFIT_PRESETS = [
  { name: "Urban Minimal", items: [1, 5, 6], vibe: "Clean lines, cool palette" },
  { name: "Smart Casual", items: [2, 4, 8], vibe: "Relaxed but intentional" },
  { name: "Street Edge", items: [3, 4, 6, 7], vibe: "Bold layering approach" },
];

const LIGHTING_MODES = [
  { label: "Studio", preset: "studio", icon: Sun },
  { label: "City", preset: "city", icon: Zap },
  { label: "Night", preset: "night", icon: Moon },
  { label: "Forest", preset: "forest", icon: Star },
];

/* ══════════════════════════════════════════════════════
   THREE.JS SCENE COMPONENTS
══════════════════════════════════════════════════════ */

/* Animated ambient particles */
function SceneParticles({ count = 60 }) {
  const meshRef = useRef();
  const positions = useRef(
    new Float32Array(
      Array.from({ length: count * 3 }, () => (Math.random() - 0.5) * 12)
    )
  );

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.04;
    meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.02) * 0.05;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={positions.current}
          count={count}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color="#a855f7"
        transparent
        opacity={0.5}
        sizeAttenuation
      />
    </points>
  );
}

/* Reflective ground plane */
function GroundPlane() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.2, 0]}>
      <planeGeometry args={[20, 20]} />
      <MeshReflectorMaterial
        blur={[200, 100]}
        resolution={512}
        mixBlur={0.8}
        mixStrength={30}
        roughness={1}
        depthScale={1.2}
        minDepthThreshold={0.4}
        maxDepthThreshold={1.4}
        color="#050505"
        metalness={0.5}
      />
    </mesh>
  );
}

/* Orbital ring decoration */
function OrbitalRing({ radius, speed, color, opacity = 0.25, tilt = 0 }) {
  const ref = useRef();
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.z = state.clock.elapsedTime * speed;
  });
  return (
    <group ref={ref} rotation={[tilt, 0, 0]}>
      <Torus args={[radius, 0.008, 16, 120]}>
        <meshBasicMaterial color={color} transparent opacity={opacity} />
      </Torus>
    </group>
  );
}

/* Glowing data dots on the ring */
function DataDot({ angle, radius, color }) {
  const ref = useRef();
  const baseY = Math.sin(angle) * 0.3;
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.position.y =
      baseY + Math.sin(state.clock.elapsedTime * 1.5 + angle) * 0.08;
    ref.current.material.emissiveIntensity =
      0.8 + Math.sin(state.clock.elapsedTime * 2 + angle) * 0.4;
  });
  return (
    <mesh
      ref={ref}
      position={[Math.cos(angle) * radius, baseY, Math.sin(angle) * radius]}
    >
      <sphereGeometry args={[0.025, 8, 8]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={1}
        roughness={0}
      />
    </mesh>
  );
}

/* The mannequin itself — built from primitives */
function MannequinBody({ topColor, bottomColor, shoeColor, isTransitioning }) {
  const groupRef = useRef();
  const topRef = useRef();
  const bottomRef = useRef();
  const shoeRef1 = useRef();
  const shoeRef2 = useRef();

  /* Smooth color lerp on item change */
  const topMat = useRef(new THREE.MeshStandardMaterial({ color: topColor, roughness: 0.3, metalness: 0.1 }));
  const bottomMat = useRef(new THREE.MeshStandardMaterial({ color: bottomColor, roughness: 0.4, metalness: 0.05 }));
  const shoeMat = useRef(new THREE.MeshStandardMaterial({ color: shoeColor, roughness: 0.5, metalness: 0.2 }));
  const skinMat = useRef(new THREE.MeshStandardMaterial({ color: "#c8956c", roughness: 0.8, metalness: 0 }));
  const headMat = useRef(
    new THREE.MeshStandardMaterial({
      color: "#c8956c",
      roughness: 0.5,
      metalness: 0.0,
    })
  );

  useEffect(() => {
    topMat.current.color.set(topColor);
  }, [topColor]);
  useEffect(() => {
    bottomMat.current.color.set(bottomColor);
  }, [bottomColor]);
  useEffect(() => {
    shoeMat.current.color.set(shoeColor);
  }, [shoeColor]);

  useFrame((state) => {
    if (!groupRef.current) return;
    /* gentle idle float */
    groupRef.current.position.y =
      Math.sin(state.clock.elapsedTime * 0.8) * 0.04;
    /* subtle rotation sway */
    groupRef.current.rotation.y =
      Math.sin(state.clock.elapsedTime * 0.3) * 0.06;
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* HEAD */}
      <mesh position={[0, 2.05, 0]} castShadow>
        <sphereGeometry args={[0.22, 32, 32]} />
        <primitive object={headMat.current} attach="material" />
      </mesh>

      {/* NECK */}
      <mesh position={[0, 1.75, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.1, 0.28, 16]} />
        <primitive object={skinMat.current} attach="material" />
      </mesh>

      {/* TORSO (shirt/top) */}
      <mesh ref={topRef} position={[0, 1.1, 0]} castShadow>
        <cylinderGeometry args={[0.38, 0.32, 0.9, 24]} />
        <primitive object={topMat.current} attach="material" />
      </mesh>

      {/* SHOULDERS */}
      {[-1, 1].map((side) => (
        <group key={side}>
          {/* Upper arm */}
          <mesh position={[side * 0.54, 1.28, 0]} rotation={[0, 0, side * 0.15]} castShadow>
            <cylinderGeometry args={[0.1, 0.09, 0.52, 16]} />
            <primitive object={topMat.current} attach="material" />
          </mesh>
          {/* Forearm */}
          <mesh position={[side * 0.62, 0.82, 0.04]} rotation={[0.15, 0, side * 0.05]} castShadow>
            <cylinderGeometry args={[0.075, 0.065, 0.48, 16]} />
            <primitive object={skinMat.current} attach="material" />
          </mesh>
          {/* Hand */}
          <mesh position={[side * 0.66, 0.6, 0.08]} castShadow>
            <sphereGeometry args={[0.07, 12, 12]} />
            <primitive object={skinMat.current} attach="material" />
          </mesh>
        </group>
      ))}

      {/* WAISTBAND */}
      <mesh position={[0, 0.6, 0]} castShadow>
        <cylinderGeometry args={[0.34, 0.34, 0.1, 24]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.6} metalness={0.3} />
      </mesh>

      {/* HIPS (pants top) */}
      <mesh ref={bottomRef} position={[0, 0.25, 0]} castShadow>
        <cylinderGeometry args={[0.37, 0.3, 0.6, 24]} />
        <primitive object={bottomMat.current} attach="material" />
      </mesh>

      {/* LEGS */}
      {[-1, 1].map((side) => (
        <group key={side}>
          {/* Upper leg */}
          <mesh position={[side * 0.18, -0.48, 0]} castShadow>
            <cylinderGeometry args={[0.14, 0.12, 0.88, 16]} />
            <primitive object={bottomMat.current} attach="material" />
          </mesh>
          {/* Lower leg */}
          <mesh position={[side * 0.18, -1.18, 0.02]} rotation={[0.05, 0, 0]} castShadow>
            <cylinderGeometry args={[0.11, 0.095, 0.78, 16]} />
            <primitive object={bottomMat.current} attach="material" />
          </mesh>
          {/* Ankle */}
          <mesh position={[side * 0.18, -1.56, 0.02]} castShadow>
            <sphereGeometry args={[0.08, 12, 12]} />
            <primitive object={skinMat.current} attach="material" />
          </mesh>
          {/* Shoe */}
          <mesh
            ref={side === -1 ? shoeRef1 : shoeRef2}
            position={[side * 0.18, -1.72, 0.06]}
            castShadow
          >
            <RoundedBox args={[0.18, 0.1, 0.36]} radius={0.04} smoothness={4}>
              <primitive object={shoeMat.current} attach="material" />
            </RoundedBox>
          </mesh>
        </group>
      ))}

      {/* HAIR */}
      <mesh position={[0, 2.24, 0]} castShadow>
        <sphereGeometry args={[0.215, 24, 24, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
        <meshStandardMaterial color="#2a1a0a" roughness={0.9} metalness={0} />
      </mesh>
    </group>
  );
}

/* Full 3D scene */
function Scene({ activeItems, lightingMode, isFullscreen }) {
  const topItem = activeItems.find((i) => i.category === "Tops") || { hexColor: "#111111" };
  const bottomItem = activeItems.find((i) => i.category === "Bottoms") || { hexColor: "#1a1a1a" };
  const shoeItem = activeItems.find((i) => i.category === "Shoes") || { hexColor: "#f0f0f0" };

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <spotLight
        position={[4, 8, 4]}
        angle={0.3}
        penumbra={0.8}
        intensity={3}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.001}
        color="#ffffff"
      />
      <spotLight position={[-4, 4, -4]} intensity={1.5} color="#a855f7" />
      <pointLight position={[0, 3, 3]} intensity={0.8} color="#06b6d4" />
      <pointLight position={[0, -1, 0]} intensity={0.3} color="#ffffff" />

      {/* Environment */}
      <Environment preset={lightingMode} />

      {/* Orbital decorations */}
      <OrbitalRing radius={1.6} speed={0.12} color="#a855f7" opacity={0.18} tilt={0.3} />
      <OrbitalRing radius={2.1} speed={-0.08} color="#06b6d4" opacity={0.12} tilt={-0.2} />
      <OrbitalRing radius={2.7} speed={0.05} color="#ffffff" opacity={0.06} />

      {/* Floating data dots */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <DataDot
          key={i}
          angle={(i / 6) * Math.PI * 2}
          radius={1.6}
          color={i % 2 === 0 ? "#a855f7" : "#06b6d4"}
        />
      ))}

      {/* Ambient sparkles */}
      <ThreeSparkles
        count={30}
        scale={6}
        size={0.8}
        speed={0.3}
        color="#a855f7"
        opacity={0.4}
      />

      {/* Scene particles */}
      <SceneParticles count={50} />

      {/* Mannequin */}
      <Suspense fallback={null}>
        <Float speed={1.2} rotationIntensity={0.08} floatIntensity={0.3}>
          <MannequinBody
            topColor={topItem.hexColor}
            bottomColor={bottomItem.hexColor}
            shoeColor={shoeItem.hexColor}
          />
        </Float>
      </Suspense>

      {/* Ground reflection */}
      <GroundPlane />

      {/* Contact shadow under feet */}
      <ContactShadows
        position={[0, -2.18, 0]}
        opacity={0.5}
        scale={6}
        blur={2}
        far={3}
        color="#000000"
      />

      {/* Camera controls */}
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minDistance={3}
        maxDistance={8}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 1.8}
        autoRotate={false}
        autoRotateSpeed={0.4}
        makeDefault
      />
    </>
  );
}

/* ══════════════════════════════════════════════════════
   LOADING OVERLAY
══════════════════════════════════════════════════════ */
function LoadingScreen() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="absolute inset-0 z-50 flex flex-col items-center justify-center"
      style={{ background: "#030303" }}
    >
      {/* Logo */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="flex items-center gap-2.5 mb-10"
      >
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, #9b59ff, #06b6d4)",
            boxShadow: "0 0 24px rgba(155,89,255,0.5)",
          }}
        >
          <Wand2 size={18} color="#fff" />
        </div>
        <span className="font-serif text-2xl text-white font-bold">
          Style
          <span
            style={{
              background: "linear-gradient(135deg, #a855f7, #06b6d4)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontStyle: "italic",
              fontWeight: 300,
            }}
          >
            Savvy
          </span>
        </span>
      </motion.div>

      {/* Progress bar */}
      <div
        className="w-48 h-px rounded-full overflow-hidden mb-6"
        style={{ background: "rgba(255,255,255,0.08)" }}
      >
        <motion.div
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 1.8, ease: "easeInOut" }}
          className="h-full"
          style={{
            background: "linear-gradient(90deg, #9b59ff, #06b6d4)",
            boxShadow: "0 0 10px rgba(155,89,255,0.6)",
          }}
        />
      </div>

      <p
        className="text-xs uppercase tracking-[0.25em]"
        style={{
          color: "#444",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        Initialising WebGL Engine
      </p>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════
   WARDROBE PANEL
══════════════════════════════════════════════════════ */
function WardrobePanel({ activeItems, onToggleItem, onClose, activeCategory, setActiveCategory }) {
  const categories = ["All", "Tops", "Bottoms", "Shoes", "Accessories"];
  const filtered =
    activeCategory === "All"
      ? WARDROBE_ITEMS
      : WARDROBE_ITEMS.filter((i) => i.category === activeCategory);

  return (
    <motion.div
      initial={{ x: -320, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -320, opacity: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="absolute left-4 top-1/2 -translate-y-1/2 z-20 flex flex-col"
      style={{
        width: 288,
        maxHeight: "78vh",
        background: "rgba(6,6,10,0.9)",
        backdropFilter: "blur(32px)",
        WebkitBackdropFilter: "blur(32px)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 24,
        boxShadow: "0 24px 64px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.06)",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Top accent */}
      <div
        className="absolute top-0 inset-x-8 h-px rounded-full"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(155,89,255,0.6), rgba(6,182,212,0.5), transparent)",
        }}
      />

      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="flex items-center gap-2">
          <Shirt size={15} style={{ color: "#9b59ff" }} />
          <span className="text-sm font-semibold" style={{ color: "#e0e0e0" }}>My Wardrobe</span>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 flex items-center justify-center rounded-lg transition-all"
          style={{ background: "rgba(255,255,255,0.05)", color: "#666" }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "#e0e0e0"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "#666"; }}
        >
          <X size={13} />
        </button>
      </div>

      {/* Category pills */}
      <div className="flex gap-1.5 px-4 py-3 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className="shrink-0 px-3 py-1.5 rounded-full text-[11px] transition-all duration-200"
            style={{
              background: activeCategory === cat ? "#ffffff" : "rgba(255,255,255,0.05)",
              color: activeCategory === cat ? "#000000" : "#666",
              fontWeight: activeCategory === cat ? 500 : 400,
              border: "none",
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-2" style={{ scrollbarWidth: "none" }}>
        <AnimatePresence>
          {filtered.map((item, i) => {
            const isActive = activeItems.some((a) => a.id === item.id);
            return (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ delay: i * 0.04, duration: 0.3 }}
                onClick={() => onToggleItem(item)}
                className="w-full text-left flex items-center gap-3 px-3.5 py-3 rounded-2xl transition-all duration-200"
                style={{
                  background: isActive ? "rgba(155,89,255,0.12)" : "rgba(255,255,255,0.03)",
                  border: isActive ? "1px solid rgba(155,89,255,0.25)" : "1px solid rgba(255,255,255,0.05)",
                }}
              >
                {/* Color swatch */}
                <div className="relative shrink-0">
                  <div
                    className="w-8 h-8 rounded-xl"
                    style={{
                      background: item.hexColor,
                      border: `2px solid ${item.accentColor}40`,
                      boxShadow: isActive ? `0 0 10px ${item.accentColor}50` : "none",
                    }}
                  />
                  {isActive && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
                      style={{ background: "#10b981" }}
                    >
                      <Check size={8} color="#fff" strokeWidth={3} />
                    </motion.div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate" style={{ color: isActive ? "#e0e0e0" : "#aaa" }}>
                    {item.name}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[10px]" style={{ color: "#444" }}>{item.category}</span>
                    <span style={{ color: "#333", fontSize: 8 }}>•</span>
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded-full"
                      style={{
                        background: `${item.accentColor}15`,
                        color: item.accentColor,
                      }}
                    >
                      {item.tag}
                    </span>
                  </div>
                </div>

                <ChevronRight size={12} style={{ color: isActive ? "#9b59ff" : "#333", flexShrink: 0 }} />
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════
   OUTFIT PRESETS PANEL
══════════════════════════════════════════════════════ */
function PresetsPanel({ onApply, onClose }) {
  return (
    <motion.div
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 300, opacity: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="absolute right-4 top-1/2 -translate-y-1/2 z-20"
      style={{
        width: 260,
        background: "rgba(6,6,10,0.9)",
        backdropFilter: "blur(32px)",
        WebkitBackdropFilter: "blur(32px)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 24,
        boxShadow: "0 24px 64px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.06)",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div
        className="absolute top-0 inset-x-8 h-px"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(6,182,212,0.6), rgba(155,89,255,0.5), transparent)",
        }}
      />

      <div className="px-5 pt-5 pb-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers size={14} style={{ color: "#06b6d4" }} />
            <span className="text-sm font-semibold" style={{ color: "#e0e0e0" }}>Outfit Presets</span>
          </div>
          <button onClick={onClose} className="text-xs" style={{ color: "#444" }}>
            <X size={13} />
          </button>
        </div>
      </div>

      <div className="p-3 space-y-2">
        {OUTFIT_PRESETS.map((preset, i) => (
          <motion.div
            key={preset.name}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="p-4 rounded-2xl cursor-pointer transition-all duration-200"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
            onClick={() => onApply(preset)}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(6,182,212,0.08)";
              e.currentTarget.style.borderColor = "rgba(6,182,212,0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.03)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
            }}
          >
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-sm font-medium" style={{ color: "#e0e0e0" }}>{preset.name}</p>
              <span
                className="text-[10px] px-2 py-0.5 rounded-full"
                style={{ background: "rgba(6,182,212,0.12)", color: "#06b6d4" }}
              >
                {preset.items.length} items
              </span>
            </div>
            <p className="text-xs" style={{ color: "#555" }}>{preset.vibe}</p>

            {/* Color dots */}
            <div className="flex gap-1.5 mt-3">
              {preset.items.map((id) => {
                const item = WARDROBE_ITEMS.find((w) => w.id === id);
                return item ? (
                  <div
                    key={id}
                    className="w-4 h-4 rounded-full border"
                    style={{
                      background: item.hexColor,
                      borderColor: `${item.accentColor}50`,
                    }}
                  />
                ) : null;
              })}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════
   BOTTOM TOOLBAR
══════════════════════════════════════════════════════ */
function BottomToolbar({ lightingMode, setLightingMode, onReset, onScreenshot, onToggleFullscreen, isFullscreen }) {
  return (
    <motion.div
      initial={{ y: 60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2"
      style={{
        background: "rgba(6,6,10,0.9)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 9999,
        padding: "8px 16px",
        boxShadow: "0 12px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Lighting modes */}
      <div className="flex items-center gap-1">
        {LIGHTING_MODES.map(({ label, preset, icon: Icon }) => (
          <button
            key={preset}
            onClick={() => setLightingMode(preset)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs transition-all duration-200"
            style={{
              background: lightingMode === preset ? "rgba(155,89,255,0.2)" : "transparent",
              color: lightingMode === preset ? "#c084fc" : "#555",
              border: lightingMode === preset ? "1px solid rgba(155,89,255,0.3)" : "1px solid transparent",
              fontWeight: lightingMode === preset ? 500 : 400,
            }}
          >
            <Icon size={12} />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      <div className="w-px h-5" style={{ background: "rgba(255,255,255,0.08)" }} />

      {/* Action buttons */}
      {[
        { icon: RotateCcw, label: "Reset", action: onReset },
        { icon: Camera, label: "Capture", action: onScreenshot },
        {
          icon: isFullscreen ? Minimize2 : Maximize2,
          label: isFullscreen ? "Exit" : "Focus",
          action: onToggleFullscreen,
        },
      ].map(({ icon: Icon, label, action }) => (
        <button
          key={label}
          onClick={action}
          className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs transition-all duration-200"
          style={{ color: "#666", background: "transparent" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.07)";
            e.currentTarget.style.color = "#e0e0e0";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "#666";
          }}
        >
          <Icon size={13} />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════
   ACTIVE OUTFIT HUD (top right)
══════════════════════════════════════════════════════ */
function OutfitHUD({ activeItems }) {
  if (activeItems.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute top-20 right-4 z-20 max-w-[180px]"
      style={{
        background: "rgba(6,6,10,0.85)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 16,
        padding: "12px 14px",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <p className="text-[10px] uppercase tracking-[0.1em] mb-2" style={{ color: "#444" }}>
        Current Look
      </p>
      <div className="space-y-1.5">
        <AnimatePresence>
          {activeItems.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              className="flex items-center gap-2"
            >
              <div
                className="w-3 h-3 rounded-full shrink-0"
                style={{ background: item.hexColor, border: `1px solid ${item.accentColor}60` }}
              />
              <span className="text-xs truncate" style={{ color: "#888" }}>{item.name}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Score indicator */}
      <div className="mt-3 pt-2.5" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px]" style={{ color: "#444" }}>Style Score</span>
          <span
            className="text-[10px] font-semibold"
            style={{ color: "#10b981" }}
          >
            {Math.min(40 + activeItems.length * 14, 98)}%
          </span>
        </div>
        <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
          <motion.div
            animate={{ width: `${Math.min(40 + activeItems.length * 14, 98)}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="h-full rounded-full"
            style={{
              background: "linear-gradient(90deg, #9b59ff, #10b981)",
              boxShadow: "0 0 8px rgba(16,185,129,0.4)",
            }}
          />
        </div>
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════
   SCREENSHOT FLASH EFFECT
══════════════════════════════════════════════════════ */
function FlashEffect({ trigger }) {
  return (
    <AnimatePresence>
      {trigger && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.7, 0] }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="absolute inset-0 z-50 pointer-events-none"
          style={{ background: "#ffffff" }}
        />
      )}
    </AnimatePresence>
  );
}

/* ══════════════════════════════════════════════════════
   TOAST NOTIFICATION
══════════════════════════════════════════════════════ */
function Toast({ message, visible }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.97 }}
          transition={{ duration: 0.3 }}
          className="absolute bottom-24 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 px-4 py-2.5 rounded-full"
          style={{
            background: "rgba(16,185,129,0.15)",
            border: "1px solid rgba(16,185,129,0.3)",
            backdropFilter: "blur(16px)",
            fontFamily: "'Inter', sans-serif",
          }}
        >
          <Check size={13} style={{ color: "#10b981" }} />
          <span className="text-xs" style={{ color: "#10b981" }}>{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ══════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════ */
export default function Roomspace() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeItems, setActiveItems] = useState([]);
  const [lightingMode, setLightingMode] = useState("city");
  const [showWardrobe, setShowWardrobe] = useState(true);
  const [showPresets, setShowPresets] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const [flashActive, setFlashActive] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: "" });
  const canvasRef = useRef(null);

  /* Simulate WebGL load */
  useEffect(() => {
    const t = setTimeout(() => setIsLoaded(true), 2000);
    return () => clearTimeout(t);
  }, []);

  const showToast = useCallback((msg) => {
    setToast({ visible: true, message: msg });
    setTimeout(() => setToast({ visible: false, message: "" }), 2500);
  }, []);

  const toggleItem = useCallback((item) => {
    setActiveItems((prev) => {
      const exists = prev.find((i) => i.id === item.id);
      if (exists) return prev.filter((i) => i.id !== item.id);
      /* Replace same-category item */
      const filtered = prev.filter((i) => i.category !== item.category);
      return [...filtered, item];
    });
  }, []);

  const applyPreset = useCallback(
    (preset) => {
      const items = preset.items
        .map((id) => WARDROBE_ITEMS.find((w) => w.id === id))
        .filter(Boolean);
      setActiveItems(items);
      setShowPresets(false);
      showToast(`Applied "${preset.name}" preset`);
    },
    [showToast]
  );

  const handleReset = useCallback(() => {
    setActiveItems([]);
    setLightingMode("city");
    showToast("View reset");
  }, [showToast]);

  const handleScreenshot = useCallback(() => {
    setFlashActive(true);
    setTimeout(() => setFlashActive(false), 500);
    showToast("Look captured!");
  }, [showToast]);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((v) => !v);
    if (!isFullscreen) {
      setShowWardrobe(false);
      setShowPresets(false);
    } else {
      setShowWardrobe(true);
    }
  }, [isFullscreen]);

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{
        height: "100vh",
        background: "#030303",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Loading screen */}
      <AnimatePresence>{!isLoaded && <LoadingScreen />}</AnimatePresence>

      {/* WebGL Canvas */}
      <div className="absolute inset-0 z-0" ref={canvasRef}>
        <Canvas
          camera={{ position: [0, 0.5, 5.5], fov: 42 }}
          shadows
          dpr={[1, 1.5]}
          performance={{ min: 0.5 }}
          gl={{ antialias: true, alpha: false }}
          style={{ background: "#030303" }}
        >
          <Scene
            activeItems={activeItems}
            lightingMode={lightingMode}
            isFullscreen={isFullscreen}
          />
        </Canvas>
      </div>

      {/* Flash effect */}
      <FlashEffect trigger={flashActive} />

      {/* ── TOP BAR ── */}
      <motion.div
        initial={{ y: -60, opacity: 0 }}
        animate={isLoaded ? { y: 0, opacity: 1 } : {}}
        transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="absolute top-0 inset-x-0 z-20 flex items-center justify-between px-4 pt-4 pb-2 pointer-events-none"
      >
        {/* Left: back button */}
        <div className="pointer-events-auto">
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm transition-all duration-200"
            style={{
              background: "rgba(6,6,10,0.85)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#888",
              boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#e0e0e0"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.14)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "#888"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
          >
            <ArrowLeft size={14} />
            <span>Exit Lobby</span>
          </Link>
        </div>

        {/* Centre: engine status */}
        <div
          className="flex items-center gap-2.5 px-5 py-2.5 rounded-full"
          style={{
            background: "rgba(6,6,10,0.85)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <motion.span
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="block w-1.5 h-1.5 rounded-full"
            style={{ background: "#06b6d4", boxShadow: "0 0 6px rgba(6,182,212,0.8)" }}
          />
          <span
            className="text-[10px] uppercase tracking-[0.2em]"
            style={{ color: "#888" }}
          >
            WebGL Active
          </span>
        </div>

        {/* Right: panel toggles */}
        <div className="pointer-events-auto flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => { setShowWardrobe((v) => !v); setShowPresets(false); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm transition-all duration-200"
            style={{
              background: showWardrobe ? "rgba(155,89,255,0.15)" : "rgba(6,6,10,0.85)",
              backdropFilter: "blur(20px)",
              border: showWardrobe ? "1px solid rgba(155,89,255,0.3)" : "1px solid rgba(255,255,255,0.08)",
              color: showWardrobe ? "#c084fc" : "#888",
            }}
          >
            <Shirt size={13} />
            <span>Wardrobe</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => { setShowPresets((v) => !v); setShowWardrobe(false); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm transition-all duration-200"
            style={{
              background: showPresets ? "rgba(6,182,212,0.12)" : "rgba(6,6,10,0.85)",
              backdropFilter: "blur(20px)",
              border: showPresets ? "1px solid rgba(6,182,212,0.3)" : "1px solid rgba(255,255,255,0.08)",
              color: showPresets ? "#06b6d4" : "#888",
            }}
          >
            <Layers size={13} />
            <span>Presets</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => {}}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm"
            style={{
              background: "rgba(6,6,10,0.85)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#888",
            }}
          >
            <Palette size={13} />
            <span className="hidden sm:inline">Palette</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Panels */}
      <AnimatePresence>
        {showWardrobe && !isFullscreen && (
          <WardrobePanel
            activeItems={activeItems}
            onToggleItem={toggleItem}
            onClose={() => setShowWardrobe(false)}
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPresets && !isFullscreen && (
          <PresetsPanel onApply={applyPreset} onClose={() => setShowPresets(false)} />
        )}
      </AnimatePresence>

      {/* Outfit HUD */}
      {!isFullscreen && (
        <OutfitHUD activeItems={activeItems} />
      )}

      {/* Bottom toolbar */}
      <BottomToolbar
        lightingMode={lightingMode}
        setLightingMode={(mode) => {
          setLightingMode(mode);
          showToast(`${LIGHTING_MODES.find((l) => l.preset === mode)?.label} lighting`);
        }}
        onReset={handleReset}
        onScreenshot={handleScreenshot}
        onToggleFullscreen={toggleFullscreen}
        isFullscreen={isFullscreen}
      />

      {/* Toast */}
      <Toast message={toast.message} visible={toast.visible} />

      {/* Fullscreen hint */}
      <AnimatePresence>
        {activeItems.length === 0 && isLoaded && !isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 1 }}
            className="absolute bottom-24 left-1/2 -translate-x-1/2 z-10 text-center pointer-events-none"
          >
            <p
              className="text-[11px] uppercase tracking-[0.2em]"
              style={{ color: "#333" }}
            >
              Select items from the wardrobe to dress the mannequin
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Drag-to-rotate hint */}
      <AnimatePresence>
        {isLoaded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 2, duration: 1 }}
            className="absolute bottom-24 right-4 z-10 pointer-events-none"
          >
            <motion.div
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ repeat: Infinity, duration: 3 }}
            >
              <p className="text-[10px] uppercase tracking-[0.15em]" style={{ color: "#333" }}>
                Drag to rotate
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}