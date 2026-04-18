"use client";

import {
  Suspense,
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { Canvas, useFrame } from "@react-three/fiber";
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
import { motion, AnimatePresence, Reorder } from "framer-motion";
import * as THREE from "three";
import Link from "next/link";
import {
  ArrowLeft,
  Shirt,
  Layers,
  Star,
  Zap,
  ChevronRight,
  ChevronDown,
  X,
  Check,
  Palette,
  Sun,
  Moon,
  Camera,
  Wand2,
  Plus,
  Trash2,
  Heart,
  RotateCcw,
  Maximize2,
  Minimize2,
  User,
  Users,
  Scissors,
  Sparkles,
  Save,
  Upload,
  Grid,
  List,
  Search,
  Filter,
  GripVertical,
  Eye,
  EyeOff,
  BookOpen,
  TrendingUp,
  Sliders,
} from "lucide-react";

/* ══════════════════════════════════════════════════════════════
   ░░  DATA — WARDROBE ITEMS
══════════════════════════════════════════════════════════════ */

const SKIN_TONES = [
  { id: "light",      label: "Fair",       hex: "#f5d5b8" },
  { id: "medium",     label: "Medium",     hex: "#c8956c" },
  { id: "tan",        label: "Tan",        hex: "#a0714f" },
  { id: "deep",       label: "Deep",       hex: "#6b3a2a" },
  { id: "dark",       label: "Dark",       hex: "#3d1f12" },
];

const HAIR_STYLES = [
  { id: "short",       label: "Short Crop",    maleOnly: false },
  { id: "medium",      label: "Medium Waves",  maleOnly: false },
  { id: "long",        label: "Long Straight", maleOnly: false },
  { id: "bun",         label: "Top Bun",       maleOnly: false },
  { id: "buzz",        label: "Buzz Cut",      maleOnly: true  },
  { id: "curly",       label: "Curly Natural", maleOnly: false },
  { id: "bald",        label: "Bald",          maleOnly: true  },
];

const HAIR_COLORS = [
  { id: "black",      hex: "#1a0f0a", label: "Black"   },
  { id: "dark-brown", hex: "#2c1a0e", label: "Dark Brown" },
  { id: "brown",      hex: "#5c3317", label: "Brown"   },
  { id: "blonde",     hex: "#c8a040", label: "Blonde"  },
  { id: "red",        hex: "#8b3015", label: "Red"     },
  { id: "silver",     hex: "#b0b0b0", label: "Silver"  },
  { id: "platinum",   hex: "#e8e0d0", label: "Platinum"},
  { id: "pink",       hex: "#c04070", label: "Pink"    },
  { id: "blue",       hex: "#203870", label: "Blue"    },
];

const WARDROBE_ITEMS = [
  // TOPS
  { id: 1,  name: "Oversized Graphic Tee",   category: "Tops",        hexColor: "#1c1c2e", accentColor: "#9b59ff", tag: "Casual",   gender: "unisex" },
  { id: 2,  name: "Ribbed Knit Sweater",     category: "Tops",        hexColor: "#d4c5b0", accentColor: "#c4a882", tag: "Smart",    gender: "unisex" },
  { id: 3,  name: "Vintage Denim Jacket",    category: "Tops",        hexColor: "#1e3a5f", accentColor: "#4a90d9", tag: "Layering", gender: "unisex" },
  { id: 4,  name: "Slim Fitted Turtleneck",  category: "Tops",        hexColor: "#0f0f0f", accentColor: "#555555", tag: "Sharp",    gender: "male"   },
  { id: 5,  name: "Flowy Wrap Blouse",       category: "Tops",        hexColor: "#f0e6d3", accentColor: "#d4a870", tag: "Elegant",  gender: "female" },
  { id: 6,  name: "Cropped Leather Jacket",  category: "Tops",        hexColor: "#1a0d05", accentColor: "#8b4a20", tag: "Edge",     gender: "female" },
  { id: 7,  name: "Linen Overshirt",         category: "Tops",        hexColor: "#c8b89a", accentColor: "#a09070", tag: "Relaxed",  gender: "male"   },
  // BOTTOMS
  { id: 8,  name: "Wide Leg Cargos",         category: "Bottoms",     hexColor: "#2d3b2d", accentColor: "#4a7c4a", tag: "Casual",   gender: "unisex" },
  { id: 9,  name: "Tailored Trousers",       category: "Bottoms",     hexColor: "#1a1a1a", accentColor: "#888888", tag: "Sharp",    gender: "unisex" },
  { id: 10, name: "Pleated Midi Skirt",      category: "Bottoms",     hexColor: "#8b6aa0", accentColor: "#c090d0", tag: "Feminine", gender: "female" },
  { id: 11, name: "Slim Raw Denim",          category: "Bottoms",     hexColor: "#2a3f60", accentColor: "#5070a0", tag: "Classic",  gender: "male"   },
  { id: 12, name: "Mini Pleated Skirt",      category: "Bottoms",     hexColor: "#c0c0c0", accentColor: "#e0e0e0", tag: "Street",   gender: "female" },
  { id: 13, name: "Jogger Sweatpants",       category: "Bottoms",     hexColor: "#3a3a4a", accentColor: "#6060a0", tag: "Comfort",  gender: "unisex" },
  // SHOES
  { id: 14, name: "Chunky Sneakers",         category: "Shoes",       hexColor: "#f5f5f5", accentColor: "#cccccc", tag: "Street",   gender: "unisex" },
  { id: 15, name: "Chelsea Boots",           category: "Shoes",       hexColor: "#1a0d05", accentColor: "#6b3a10", tag: "Classic",  gender: "unisex" },
  { id: 16, name: "Strappy Heeled Sandals",  category: "Shoes",       hexColor: "#c8a050", accentColor: "#e8c070", tag: "Elevated", gender: "female" },
  { id: 17, name: "White Low Trainers",      category: "Shoes",       hexColor: "#f8f8f8", accentColor: "#d0d0d0", tag: "Minimal",  gender: "unisex" },
  { id: 18, name: "Oxford Derby",            category: "Shoes",       hexColor: "#2a1808", accentColor: "#7a4820", tag: "Formal",   gender: "male"   },
  // ACCESSORIES
  { id: 19, name: "Silk Scarf",              category: "Accessories", hexColor: "#8b1a4a", accentColor: "#e04080", tag: "Elevated", gender: "unisex" },
  { id: 20, name: "Minimal Watch",           category: "Accessories", hexColor: "#c8a96e", accentColor: "#f0d090", tag: "Classic",  gender: "unisex" },
  { id: 21, name: "Chunky Gold Chain",       category: "Accessories", hexColor: "#c8a820", accentColor: "#f0d060", tag: "Bold",     gender: "unisex" },
  { id: 22, name: "Mini Crossbody Bag",      category: "Accessories", hexColor: "#1c1c1c", accentColor: "#707070", tag: "Practical",gender: "female" },
  { id: 23, name: "Bucket Hat",              category: "Accessories", hexColor: "#4a5040", accentColor: "#8a9080", tag: "Casual",   gender: "unisex" },
  { id: 24, name: "Tortoise Sunglasses",     category: "Accessories", hexColor: "#6b3a15", accentColor: "#b06030", tag: "Cool",     gender: "unisex" },
  // OUTERWEAR
  { id: 25, name: "Oversized Wool Coat",     category: "Outerwear",   hexColor: "#3a3028", accentColor: "#6a5848", tag: "Luxury",   gender: "unisex" },
  { id: 26, name: "Puffer Jacket",           category: "Outerwear",   hexColor: "#0a1a2a", accentColor: "#204060", tag: "Winter",   gender: "unisex" },
  { id: 27, name: "Trench Coat",             category: "Outerwear",   hexColor: "#b09060", accentColor: "#d0b080", tag: "Timeless", gender: "unisex" },
];

const OUTFIT_PRESETS = [
  { id: "p1", name: "Urban Minimal",    items: [1, 9, 14, 20],    vibe: "Clean lines, cool palette",      gender: "unisex" },
  { id: "p2", name: "Smart Casual",     items: [2, 8, 15, 19],    vibe: "Relaxed but intentional",        gender: "unisex" },
  { id: "p3", name: "Street Edge",      items: [3, 8, 14, 21, 23],vibe: "Bold layering approach",         gender: "unisex" },
  { id: "p4", name: "Feminine Grace",   items: [5, 10, 16, 22],   vibe: "Flowing silhouettes, warm tones",gender: "female" },
  { id: "p5", name: "Sharp Executive",  items: [4, 9, 18, 20],    vibe: "Polished, authority-forward",    gender: "male"   },
  { id: "p6", name: "Winter Layer",     items: [2, 13, 15, 25],   vibe: "Cozy warmth, textured depth",    gender: "unisex" },
];

const LIGHTING_MODES = [
  { label: "Studio",  preset: "studio",  icon: Sun   },
  { label: "City",    preset: "city",    icon: Zap   },
  { label: "Night",   preset: "night",   icon: Moon  },
  { label: "Soft",    preset: "sunset",  icon: Star  },
];

const CATEGORIES = ["All", "Tops", "Bottoms", "Shoes", "Accessories", "Outerwear"];

/* ══════════════════════════════════════════════════════════════
   ░░  THREE.JS — SCENE UTILITIES
══════════════════════════════════════════════════════════════ */

function SceneParticles({ count = 55, color = "#a855f7" }) {
  const ref = useRef();
  const positions = useRef(
    new Float32Array(Array.from({ length: count * 3 }, () => (Math.random() - 0.5) * 14))
  );
  useFrame((s) => {
    if (!ref.current) return;
    ref.current.rotation.y = s.clock.elapsedTime * 0.035;
    ref.current.rotation.x = Math.sin(s.clock.elapsedTime * 0.018) * 0.04;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions.current} count={count} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.028} color={color} transparent opacity={0.45} sizeAttenuation />
    </points>
  );
}

function GroundPlane({ y = -2.4 }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, y, 0]}>
      <planeGeometry args={[22, 22]} />
      <MeshReflectorMaterial
        blur={[220, 110]} resolution={512} mixBlur={0.85} mixStrength={28}
        roughness={1} depthScale={1.1} minDepthThreshold={0.4} maxDepthThreshold={1.4}
        color="#040404" metalness={0.45}
      />
    </mesh>
  );
}

function OrbitalRing({ radius, speed, color, opacity = 0.2, tilt = 0, tiltY = 0 }) {
  const ref = useRef();
  useFrame((s) => {
    if (!ref.current) return;
    ref.current.rotation.z = s.clock.elapsedTime * speed;
  });
  return (
    <group ref={ref} rotation={[tilt, tiltY, 0]}>
      <Torus args={[radius, 0.007, 16, 120]}>
        <meshBasicMaterial color={color} transparent opacity={opacity} />
      </Torus>
    </group>
  );
}

function DataDot({ angle, radius, color, yBase = 0 }) {
  const ref = useRef();
  useFrame((s) => {
    if (!ref.current) return;
    ref.current.position.y = yBase + Math.sin(s.clock.elapsedTime * 1.4 + angle) * 0.07;
    ref.current.material.emissiveIntensity = 0.7 + Math.sin(s.clock.elapsedTime * 2.2 + angle) * 0.5;
  });
  return (
    <mesh ref={ref} position={[Math.cos(angle) * radius, yBase, Math.sin(angle) * radius]}>
      <sphereGeometry args={[0.022, 8, 8]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1} roughness={0} />
    </mesh>
  );
}

/* ══════════════════════════════════════════════════════════════
   ░░  THREE.JS — HAIR MESHES
══════════════════════════════════════════════════════════════ */

function HairMesh({ style, color, isFemale }) {
  const mat = useMemo(
    () => new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0 }),
    [color]
  );

  if (style === "bald") return null;

  if (style === "short") {
    return (
      <group>
        <mesh position={[0, 2.26, 0]} material={mat}>
          <sphereGeometry args={[0.215, 20, 20, 0, Math.PI * 2, 0, Math.PI * 0.52]} />
        </mesh>
        <mesh position={[0, 2.09, -0.13]} material={mat}>
          <boxGeometry args={[0.42, 0.12, 0.12]} />
        </mesh>
      </group>
    );
  }

  if (style === "buzz") {
    return (
      <mesh position={[0, 2.25, 0]} material={mat}>
        <sphereGeometry args={[0.222, 20, 20, 0, Math.PI * 2, 0, Math.PI * 0.48]} />
      </mesh>
    );
  }

  if (style === "medium") {
    return (
      <group>
        <mesh position={[0, 2.26, 0]} material={mat}>
          <sphereGeometry args={[0.215, 20, 20, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
        </mesh>
        {/* Side flows */}
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * 0.2, 1.85, -0.02]} rotation={[0.1, s * 0.15, s * 0.1]} material={mat}>
            <cylinderGeometry args={[0.07, 0.04, 0.42, 12]} />
          </mesh>
        ))}
        <mesh position={[0, 1.75, -0.16]} material={mat}>
          <cylinderGeometry args={[0.08, 0.05, 0.38, 12]} />
        </mesh>
      </group>
    );
  }

  if (style === "long") {
    return (
      <group>
        <mesh position={[0, 2.26, 0]} material={mat}>
          <sphereGeometry args={[0.218, 20, 20, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
        </mesh>
        {/* Long strands */}
        {[-0.14, 0, 0.14].map((xOff, i) => (
          <mesh key={i} position={[xOff, 1.42, -0.14]} rotation={[0.08, 0, 0]} material={mat}>
            <cylinderGeometry args={[0.055, 0.03, 0.9, 10]} />
          </mesh>
        ))}
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * 0.18, 1.45, -0.08]} rotation={[0.05, s * 0.2, s * 0.08]} material={mat}>
            <cylinderGeometry args={[0.05, 0.025, 0.88, 10]} />
          </mesh>
        ))}
      </group>
    );
  }

  if (style === "bun") {
    return (
      <group>
        <mesh position={[0, 2.26, 0]} material={mat}>
          <sphereGeometry args={[0.215, 20, 20, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
        </mesh>
        {/* Bun on top */}
        <mesh position={[0, 2.42, 0]} material={mat}>
          <sphereGeometry args={[0.12, 14, 14]} />
        </mesh>
        {/* Wrap strands */}
        <mesh position={[0, 2.35, 0]} rotation={[0, 0, Math.PI / 2]} material={mat}>
          <torusGeometry args={[0.09, 0.018, 8, 24]} />
        </mesh>
      </group>
    );
  }

  if (style === "curly") {
    const curls = [];
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2;
      const r = 0.17 + (i % 2) * 0.04;
      const yPos = 2.18 - (i % 3) * 0.06;
      curls.push(
        <mesh key={i} position={[Math.cos(a) * r, yPos, Math.sin(a) * r]} material={mat}>
          <sphereGeometry args={[0.04 + (i % 2) * 0.01, 8, 8]} />
        </mesh>
      );
    }
    return (
      <group>
        <mesh position={[0, 2.26, 0]} material={mat}>
          <sphereGeometry args={[0.2, 18, 18, 0, Math.PI * 2, 0, Math.PI * 0.52]} />
        </mesh>
        {curls}
      </group>
    );
  }

  // fallback — short
  return (
    <mesh position={[0, 2.26, 0]} material={mat}>
      <sphereGeometry args={[0.215, 20, 20, 0, Math.PI * 2, 0, Math.PI * 0.52]} />
    </mesh>
  );
}

/* ══════════════════════════════════════════════════════════════
   ░░  THREE.JS — MALE MANNEQUIN
══════════════════════════════════════════════════════════════ */

function MaleMannequin({ topColor, bottomColor, shoeColor, skinTone, hairStyle, hairColor, hasScarf, hasWatch, hasChain, hasHat }) {
  const groupRef = useRef();

  const topMat    = useRef(new THREE.MeshStandardMaterial({ color: topColor,    roughness: 0.3,  metalness: 0.1  }));
  const bottomMat = useRef(new THREE.MeshStandardMaterial({ color: bottomColor, roughness: 0.4,  metalness: 0.05 }));
  const shoeMat   = useRef(new THREE.MeshStandardMaterial({ color: shoeColor,   roughness: 0.5,  metalness: 0.2  }));
  const skinMat   = useRef(new THREE.MeshStandardMaterial({ color: skinTone,    roughness: 0.75, metalness: 0    }));
  const waistMat  = useRef(new THREE.MeshStandardMaterial({ color: "#111111",   roughness: 0.6,  metalness: 0.3  }));
  const eyeMat    = useRef(new THREE.MeshStandardMaterial({ color: "#111111",   roughness: 0.1,  metalness: 0    }));
  const goldMat   = useRef(new THREE.MeshStandardMaterial({ color: "#c8a820",   roughness: 0.2,  metalness: 0.9, emissive: "#c8a820", emissiveIntensity: 0.1 }));
  const watchMat  = useRef(new THREE.MeshStandardMaterial({ color: "#888888",   roughness: 0.3,  metalness: 0.8  }));
  const scarfMat  = useRef(new THREE.MeshStandardMaterial({ color: "#8b1a4a",   roughness: 0.7,  metalness: 0    }));
  const hatMat    = useRef(new THREE.MeshStandardMaterial({ color: "#4a5040",   roughness: 0.8,  metalness: 0    }));

  useEffect(() => { topMat.current.color.set(topColor); },    [topColor]);
  useEffect(() => { bottomMat.current.color.set(bottomColor); }, [bottomColor]);
  useEffect(() => { shoeMat.current.color.set(shoeColor); },  [shoeColor]);
  useEffect(() => { skinMat.current.color.set(skinTone); },   [skinTone]);

  useFrame((s) => {
    if (!groupRef.current) return;
    groupRef.current.position.y = Math.sin(s.clock.elapsedTime * 0.75) * 0.035;
    groupRef.current.rotation.y = Math.sin(s.clock.elapsedTime * 0.28) * 0.055;
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* HEAD */}
      <mesh castShadow position={[0, 2.06, 0]}>
        <sphereGeometry args={[0.23, 28, 28]} />
        <primitive object={skinMat.current} attach="material" />
      </mesh>
      {/* Jaw (slightly flatter) */}
      <mesh castShadow position={[0, 1.92, 0]}>
        <sphereGeometry args={[0.19, 20, 20, 0, Math.PI * 2, Math.PI * 0.5, Math.PI * 0.25]} />
        <primitive object={skinMat.current} attach="material" />
      </mesh>
      {/* Eyes */}
      {[-0.085, 0.085].map((x, i) => (
        <mesh key={i} position={[x, 2.1, 0.21]}>
          <sphereGeometry args={[0.028, 10, 10]} />
          <primitive object={eyeMat.current} attach="material" />
        </mesh>
      ))}
      {/* Nose */}
      <mesh position={[0, 2.01, 0.226]}>
        <sphereGeometry args={[0.022, 8, 8]} />
        <primitive object={skinMat.current} attach="material" />
      </mesh>
      {/* Ears */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.224, 2.06, 0]}>
          <sphereGeometry args={[0.055, 10, 10]} />
          <primitive object={skinMat.current} attach="material" />
        </mesh>
      ))}

      {/* NECK */}
      <mesh castShadow position={[0, 1.76, 0]}>
        <cylinderGeometry args={[0.095, 0.11, 0.28, 18]} />
        <primitive object={skinMat.current} attach="material" />
      </mesh>

      {/* TORSO — broader male shoulders */}
      <mesh castShadow position={[0, 1.1, 0]}>
        <cylinderGeometry args={[0.42, 0.35, 0.95, 26]} />
        <primitive object={topMat.current} attach="material" />
      </mesh>
      {/* Chest detail */}
      <mesh castShadow position={[0, 1.38, 0.3]}>
        <boxGeometry args={[0.6, 0.35, 0.08]} />
        <primitive object={topMat.current} attach="material" />
      </mesh>

      {/* SHOULDERS + ARMS */}
      {[-1, 1].map((s) => (
        <group key={s}>
          {/* Shoulder cap */}
          <mesh castShadow position={[s * 0.5, 1.46, 0]}>
            <sphereGeometry args={[0.135, 14, 14]} />
            <primitive object={topMat.current} attach="material" />
          </mesh>
          {/* Upper arm */}
          <mesh castShadow position={[s * 0.56, 1.18, 0.02]} rotation={[0.12, 0, s * 0.18]}>
            <cylinderGeometry args={[0.105, 0.095, 0.52, 16]} />
            <primitive object={topMat.current} attach="material" />
          </mesh>
          {/* Elbow */}
          <mesh castShadow position={[s * 0.63, 0.88, 0.05]}>
            <sphereGeometry args={[0.085, 12, 12]} />
            <primitive object={skinMat.current} attach="material" />
          </mesh>
          {/* Forearm */}
          <mesh castShadow position={[s * 0.67, 0.64, 0.08]} rotation={[0.18, 0, s * 0.06]}>
            <cylinderGeometry args={[0.078, 0.065, 0.46, 14]} />
            <primitive object={skinMat.current} attach="material" />
          </mesh>
          {/* Hand */}
          <mesh castShadow position={[s * 0.7, 0.43, 0.1]}>
            <sphereGeometry args={[0.068, 12, 12]} />
            <primitive object={skinMat.current} attach="material" />
          </mesh>
          {/* Watch on left wrist */}
          {hasWatch && s === -1 && (
            <mesh position={[-0.68, 0.56, 0.08]}>
              <torusGeometry args={[0.052, 0.018, 8, 24]} />
              <primitive object={watchMat.current} attach="material" />
            </mesh>
          )}
        </group>
      ))}

      {/* Scarf */}
      {hasScarf && (
        <group>
          <mesh position={[0, 1.68, 0]}>
            <torusGeometry args={[0.15, 0.055, 12, 36]} />
            <primitive object={scarfMat.current} attach="material" />
          </mesh>
          <mesh position={[0.04, 1.52, 0.14]} rotation={[0.3, 0.2, 0.1]}>
            <cylinderGeometry args={[0.04, 0.025, 0.28, 10]} />
            <primitive object={scarfMat.current} attach="material" />
          </mesh>
        </group>
      )}

      {/* Chain necklace */}
      {hasChain && (
        <mesh position={[0, 1.6, 0.12]}>
          <torusGeometry args={[0.18, 0.012, 8, 48]} />
          <primitive object={goldMat.current} attach="material" />
        </mesh>
      )}

      {/* WAISTBAND */}
      <mesh castShadow position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.365, 0.36, 0.1, 24]} />
        <primitive object={waistMat.current} attach="material" />
      </mesh>

      {/* HIPS + TROUSERS */}
      <mesh castShadow position={[0, 0.24, 0]}>
        <cylinderGeometry args={[0.38, 0.32, 0.65, 24]} />
        <primitive object={bottomMat.current} attach="material" />
      </mesh>

      {/* LEGS */}
      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh castShadow position={[s * 0.19, -0.5, 0]}>
            <cylinderGeometry args={[0.145, 0.125, 0.9, 16]} />
            <primitive object={bottomMat.current} attach="material" />
          </mesh>
          {/* Knee */}
          <mesh castShadow position={[s * 0.19, -0.95, 0.01]}>
            <sphereGeometry args={[0.1, 12, 12]} />
            <primitive object={bottomMat.current} attach="material" />
          </mesh>
          {/* Lower leg */}
          <mesh castShadow position={[s * 0.19, -1.26, 0.02]} rotation={[0.04, 0, 0]}>
            <cylinderGeometry args={[0.112, 0.095, 0.75, 16]} />
            <primitive object={bottomMat.current} attach="material" />
          </mesh>
          {/* Ankle */}
          <mesh castShadow position={[s * 0.19, -1.62, 0.02]}>
            <sphereGeometry args={[0.082, 12, 12]} />
            <primitive object={skinMat.current} attach="material" />
          </mesh>
          {/* Shoe */}
          <mesh castShadow position={[s * 0.19, -1.78, 0.07]}>
            <RoundedBox args={[0.2, 0.11, 0.4]} radius={0.042} smoothness={3}>
              <primitive object={shoeMat.current} attach="material" />
            </RoundedBox>
          </mesh>
        </group>
      ))}

      {/* HAIR */}
      <HairMesh style={hairStyle} color={hairColor} isFemale={false} />

      {/* Hat */}
      {hasHat && (
        <group>
          <mesh position={[0, 2.32, 0]}>
            <cylinderGeometry args={[0.24, 0.24, 0.05, 20]} />
            <primitive object={hatMat.current} attach="material" />
          </mesh>
          <mesh position={[0, 2.28, 0]}>
            <cylinderGeometry args={[0.19, 0.2, 0.18, 20]} />
            <primitive object={hatMat.current} attach="material" />
          </mesh>
        </group>
      )}
    </group>
  );
}

/* ══════════════════════════════════════════════════════════════
   ░░  THREE.JS — FEMALE MANNEQUIN
══════════════════════════════════════════════════════════════ */

function FemaleMannequin({ topColor, bottomColor, shoeColor, skinTone, hairStyle, hairColor, hasScarf, hasWatch, hasChain, hasBag }) {
  const groupRef = useRef();

  const topMat    = useRef(new THREE.MeshStandardMaterial({ color: topColor,    roughness: 0.35, metalness: 0.05 }));
  const bottomMat = useRef(new THREE.MeshStandardMaterial({ color: bottomColor, roughness: 0.45, metalness: 0.02 }));
  const shoeMat   = useRef(new THREE.MeshStandardMaterial({ color: shoeColor,   roughness: 0.55, metalness: 0.15 }));
  const skinMat   = useRef(new THREE.MeshStandardMaterial({ color: skinTone,    roughness: 0.72, metalness: 0    }));
  const eyeMat    = useRef(new THREE.MeshStandardMaterial({ color: "#111111",   roughness: 0.1,  metalness: 0    }));
  const goldMat   = useRef(new THREE.MeshStandardMaterial({ color: "#c8a820",   roughness: 0.2,  metalness: 0.9, emissive: "#c8a820", emissiveIntensity: 0.1 }));
  const watchMat  = useRef(new THREE.MeshStandardMaterial({ color: "#d4af37",   roughness: 0.3,  metalness: 0.85 }));
  const scarfMat  = useRef(new THREE.MeshStandardMaterial({ color: "#8b1a4a",   roughness: 0.7,  metalness: 0    }));
  const bagMat    = useRef(new THREE.MeshStandardMaterial({ color: "#1c1c1c",   roughness: 0.5,  metalness: 0.2  }));
  const lipMat    = useRef(new THREE.MeshStandardMaterial({ color: "#c04060",   roughness: 0.4,  metalness: 0    }));

  useEffect(() => { topMat.current.color.set(topColor); },    [topColor]);
  useEffect(() => { bottomMat.current.color.set(bottomColor); }, [bottomColor]);
  useEffect(() => { shoeMat.current.color.set(shoeColor); },  [shoeColor]);
  useEffect(() => { skinMat.current.color.set(skinTone); },   [skinTone]);

  useFrame((s) => {
    if (!groupRef.current) return;
    groupRef.current.position.y = Math.sin(s.clock.elapsedTime * 0.72) * 0.038;
    groupRef.current.rotation.y = Math.sin(s.clock.elapsedTime * 0.26) * 0.05;
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* HEAD — slightly smaller/more oval */}
      <mesh castShadow position={[0, 2.08, 0]}>
        <sphereGeometry args={[0.205, 28, 28]} />
        <primitive object={skinMat.current} attach="material" />
      </mesh>
      {/* Chin */}
      <mesh castShadow position={[0, 1.94, 0.02]} scale={[1, 0.7, 0.9]}>
        <sphereGeometry args={[0.155, 18, 18, 0, Math.PI * 2, Math.PI * 0.5, Math.PI * 0.22]} />
        <primitive object={skinMat.current} attach="material" />
      </mesh>
      {/* Eyes */}
      {[-0.075, 0.075].map((x, i) => (
        <mesh key={i} position={[x, 2.12, 0.195]}>
          <sphereGeometry args={[0.025, 10, 10]} />
          <primitive object={eyeMat.current} attach="material" />
        </mesh>
      ))}
      {/* Lips */}
      <mesh position={[0, 1.99, 0.198]}>
        <boxGeometry args={[0.08, 0.022, 0.02]} />
        <primitive object={lipMat.current} attach="material" />
      </mesh>
      {/* Ears */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.2, 2.08, 0]}>
          <sphereGeometry args={[0.045, 10, 10]} />
          <primitive object={skinMat.current} attach="material" />
        </mesh>
      ))}

      {/* NECK — slender */}
      <mesh castShadow position={[0, 1.78, 0]}>
        <cylinderGeometry args={[0.075, 0.088, 0.28, 18]} />
        <primitive object={skinMat.current} attach="material" />
      </mesh>

      {/* TORSO — hourglass */}
      {/* Chest */}
      <mesh castShadow position={[0, 1.38, 0]}>
        <cylinderGeometry args={[0.36, 0.3, 0.5, 24]} />
        <primitive object={topMat.current} attach="material" />
      </mesh>
      {/* Bust detail */}
      {[-1, 1].map((s) => (
        <mesh key={s} castShadow position={[s * 0.11, 1.44, 0.26]}>
          <sphereGeometry args={[0.1, 14, 14, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
          <primitive object={topMat.current} attach="material" />
        </mesh>
      ))}
      {/* Waist */}
      <mesh castShadow position={[0, 1.0, 0]}>
        <cylinderGeometry args={[0.27, 0.3, 0.38, 22]} />
        <primitive object={topMat.current} attach="material" />
      </mesh>

      {/* SHOULDERS + ARMS — slimmer */}
      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh castShadow position={[s * 0.42, 1.5, 0]}>
            <sphereGeometry args={[0.1, 12, 12]} />
            <primitive object={topMat.current} attach="material" />
          </mesh>
          {/* Upper arm */}
          <mesh castShadow position={[s * 0.48, 1.24, 0.02]} rotation={[0.1, 0, s * 0.14]}>
            <cylinderGeometry args={[0.082, 0.073, 0.5, 14]} />
            <primitive object={topMat.current} attach="material" />
          </mesh>
          {/* Elbow */}
          <mesh castShadow position={[s * 0.53, 0.95, 0.04]}>
            <sphereGeometry args={[0.065, 10, 10]} />
            <primitive object={skinMat.current} attach="material" />
          </mesh>
          {/* Forearm */}
          <mesh castShadow position={[s * 0.57, 0.72, 0.07]} rotation={[0.15, 0, s * 0.05]}>
            <cylinderGeometry args={[0.06, 0.05, 0.44, 12]} />
            <primitive object={skinMat.current} attach="material" />
          </mesh>
          {/* Hand */}
          <mesh castShadow position={[s * 0.59, 0.52, 0.09]}>
            <sphereGeometry args={[0.055, 12, 12]} />
            <primitive object={skinMat.current} attach="material" />
          </mesh>
          {/* Watch */}
          {hasWatch && s === 1 && (
            <mesh position={[0.56, 0.64, 0.07]}>
              <torusGeometry args={[0.044, 0.015, 8, 24]} />
              <primitive object={watchMat.current} attach="material" />
            </mesh>
          )}
        </group>
      ))}

      {/* Scarf */}
      {hasScarf && (
        <mesh position={[0, 1.66, 0]}>
          <torusGeometry args={[0.12, 0.048, 12, 36]} />
          <primitive object={scarfMat.current} attach="material" />
        </mesh>
      )}

      {/* Chain necklace — thinner, sits closer */}
      {hasChain && (
        <mesh position={[0, 1.62, 0.1]}>
          <torusGeometry args={[0.14, 0.009, 8, 48]} />
          <primitive object={goldMat.current} attach="material" />
        </mesh>
      )}

      {/* HIPS — wider */}
      <mesh castShadow position={[0, 0.62, 0]}>
        <cylinderGeometry args={[0.36, 0.35, 0.12, 24]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.7} metalness={0.2} />
      </mesh>
      <mesh castShadow position={[0, 0.22, 0]}>
        <cylinderGeometry args={[0.42, 0.35, 0.68, 24]} />
        <primitive object={bottomMat.current} attach="material" />
      </mesh>

      {/* LEGS — longer proportioned */}
      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh castShadow position={[s * 0.17, -0.52, 0]}>
            <cylinderGeometry args={[0.13, 0.11, 0.9, 14]} />
            <primitive object={bottomMat.current} attach="material" />
          </mesh>
          <mesh castShadow position={[s * 0.17, -1.0, 0.01]}>
            <sphereGeometry args={[0.085, 12, 12]} />
            <primitive object={bottomMat.current} attach="material" />
          </mesh>
          <mesh castShadow position={[s * 0.17, -1.32, 0.02]} rotation={[0.04, 0, 0]}>
            <cylinderGeometry args={[0.09, 0.074, 0.78, 14]} />
            <primitive object={bottomMat.current} attach="material" />
          </mesh>
          <mesh castShadow position={[s * 0.17, -1.7, 0.02]}>
            <sphereGeometry args={[0.066, 10, 10]} />
            <primitive object={skinMat.current} attach="material" />
          </mesh>
          {/* Heeled shoe */}
          <mesh castShadow position={[s * 0.17, -1.83, 0.06]}>
            <RoundedBox args={[0.15, 0.09, 0.34]} radius={0.035} smoothness={3}>
              <primitive object={shoeMat.current} attach="material" />
            </RoundedBox>
          </mesh>
          {/* Heel */}
          <mesh castShadow position={[s * 0.17, -1.88, -0.1]}>
            <cylinderGeometry args={[0.02, 0.015, 0.1, 8]} />
            <primitive object={shoeMat.current} attach="material" />
          </mesh>
        </group>
      ))}

      {/* HAIR */}
      <HairMesh style={hairStyle} color={hairColor} isFemale={true} />

      {/* Crossbody bag */}
      {hasBag && (
        <group>
          <mesh position={[-0.55, 0.7, 0.2]} rotation={[0, 0.2, 0]}>
            <RoundedBox args={[0.22, 0.18, 0.06]} radius={0.03} smoothness={3}>
              <primitive object={bagMat.current} attach="material" />
            </RoundedBox>
          </mesh>
          {/* Strap */}
          <mesh position={[-0.18, 1.0, 0.14]} rotation={[0.4, 0.1, 0.7]}>
            <cylinderGeometry args={[0.008, 0.008, 0.72, 6]} />
            <primitive object={bagMat.current} attach="material" />
          </mesh>
        </group>
      )}
    </group>
  );
}

/* ══════════════════════════════════════════════════════════════
   ░░  THREE.JS — FULL SCENE
══════════════════════════════════════════════════════════════ */

function WardrobeScene({ activeItems, lightingMode, gender, skinTone, hairStyle, hairColor }) {
  const topItem    = activeItems.find((i) => i.category === "Tops")        || { hexColor: "#111111" };
  const bottomItem = activeItems.find((i) => i.category === "Bottoms")     || { hexColor: "#1a1a1a" };
  const shoeItem   = activeItems.find((i) => i.category === "Shoes")       || { hexColor: "#f0f0f0" };
  const hasScarf   = activeItems.some((i) => i.name.includes("Scarf"));
  const hasWatch   = activeItems.some((i) => i.name.includes("Watch"));
  const hasChain   = activeItems.some((i) => i.name.includes("Chain"));
  const hasBag     = activeItems.some((i) => i.name.includes("Bag"));
  const hasHat     = activeItems.some((i) => i.name.includes("Hat"));

  return (
    <>
      {/* Lights */}
      <ambientLight intensity={0.28} />
      <spotLight position={[5, 9, 5]}  angle={0.28} penumbra={0.85} intensity={3.2} castShadow shadow-mapSize={[1024, 1024]} shadow-bias={-0.001} color="#ffffff" />
      <spotLight position={[-5, 4, -4]} intensity={1.4} color="#a855f7" />
      <pointLight position={[0, 3, 3.5]} intensity={0.9} color="#06b6d4" />
      <pointLight position={[0, -0.5, 0]} intensity={0.25} color="#ffffff" />

      <Environment preset={lightingMode} />

      {/* Orbital rings */}
      <OrbitalRing radius={1.7}  speed={0.11}  color="#a855f7" opacity={0.15} tilt={0.28}  />
      <OrbitalRing radius={2.25} speed={-0.07} color="#06b6d4" opacity={0.1}  tilt={-0.18} tiltY={0.12} />
      <OrbitalRing radius={2.85} speed={0.045} color="#ffffff" opacity={0.05} />

      {/* Data dots */}
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <DataDot key={i} angle={(i / 8) * Math.PI * 2} radius={1.7} color={i % 2 === 0 ? "#a855f7" : "#06b6d4"} />
      ))}

      {/* Particles */}
      <ThreeSparkles count={28} scale={6} size={0.7} speed={0.28} color="#a855f7" opacity={0.35} />
      <SceneParticles count={45} color="#a855f7" />

      {/* Ground */}
      <GroundPlane y={-2.35} />
      <ContactShadows position={[0, -2.3, 0]} opacity={0.45} scale={6} blur={2.2} far={3} color="#000000" />

      {/* Mannequin */}
      <Suspense fallback={null}>
        <Float speed={1.1} rotationIntensity={0.07} floatIntensity={0.28}>
          {gender === "male" ? (
            <MaleMannequin
              topColor={topItem.hexColor}
              bottomColor={bottomItem.hexColor}
              shoeColor={shoeItem.hexColor}
              skinTone={skinTone}
              hairStyle={hairStyle}
              hairColor={hairColor}
              hasScarf={hasScarf}
              hasWatch={hasWatch}
              hasChain={hasChain}
              hasHat={hasHat}
            />
          ) : (
            <FemaleMannequin
              topColor={topItem.hexColor}
              bottomColor={bottomItem.hexColor}
              shoeColor={shoeItem.hexColor}
              skinTone={skinTone}
              hairStyle={hairStyle}
              hairColor={hairColor}
              hasScarf={hasScarf}
              hasWatch={hasWatch}
              hasChain={hasChain}
              hasBag={hasBag}
            />
          )}
        </Float>
      </Suspense>

      <OrbitControls enablePan={false} enableZoom={true} minDistance={3} maxDistance={8} minPolarAngle={Math.PI / 6} maxPolarAngle={Math.PI / 1.75} makeDefault />
    </>
  );
}

/* ══════════════════════════════════════════════════════════════
   ░░  UI — GLASS PANEL WRAPPER
══════════════════════════════════════════════════════════════ */
function GlassPanel({ children, className = "", style = {}, accentSide = "top" }) {
  const accentStyles = {
    top:    { top: 0,    insetX: "2rem", height: 1, width: "auto" },
    bottom: { bottom: 0, insetX: "2rem", height: 1, width: "auto" },
  };
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{
        background: "rgba(5,5,9,0.92)",
        backdropFilter: "blur(30px)",
        WebkitBackdropFilter: "blur(30px)",
        border: "1px solid rgba(255,255,255,0.075)",
        boxShadow: "0 24px 64px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.06)",
        fontFamily: "'Inter', sans-serif",
        ...style,
      }}
    >
      {/* Gradient accent line */}
      <div
        className="absolute inset-x-8 h-px"
        style={{
          top: 0,
          background: "linear-gradient(90deg, transparent, rgba(155,89,255,0.55), rgba(6,182,212,0.45), transparent)",
        }}
      />
      {children}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   ░░  UI — SECTION HEADER
══════════════════════════════════════════════════════════════ */
function SectionLabel({ children }) {
  return (
    <p
      className="text-[10px] uppercase tracking-[0.18em] mb-3"
      style={{ color: "#3a3a3a", fontWeight: 500 }}
    >
      {children}
    </p>
  );
}

/* ══════════════════════════════════════════════════════════════
   ░░  UI — TOAST
══════════════════════════════════════════════════════════════ */
function Toast({ message, visible, type = "success" }) {
  const colors = {
    success: { bg: "rgba(16,185,129,0.14)", border: "rgba(16,185,129,0.28)", text: "#10b981" },
    info:    { bg: "rgba(6,182,212,0.12)",  border: "rgba(6,182,212,0.25)",  text: "#06b6d4" },
    warn:    { bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.25)", text: "#f59e0b" },
  };
  const c = colors[type];
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.97 }}
          transition={{ duration: 0.28 }}
          className="absolute bottom-24 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 px-4 py-2.5 rounded-full"
          style={{ background: c.bg, border: `1px solid ${c.border}`, backdropFilter: "blur(16px)" }}
        >
          <Check size={12} style={{ color: c.text }} />
          <span className="text-xs whitespace-nowrap" style={{ color: c.text }}>{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ══════════════════════════════════════════════════════════════
   ░░  UI — FLASH EFFECT
══════════════════════════════════════════════════════════════ */
function FlashEffect({ trigger }) {
  return (
    <AnimatePresence>
      {trigger && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.75, 0] }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.38 }}
          className="absolute inset-0 z-50 pointer-events-none"
          style={{ background: "#ffffff" }}
        />
      )}
    </AnimatePresence>
  );
}

/* ══════════════════════════════════════════════════════════════
   ░░  UI — LEFT PANEL: WARDROBE INVENTORY
══════════════════════════════════════════════════════════════ */
function InventoryPanel({ activeItems, onToggle, onClose, activeCategory, setActiveCategory, searchQuery, setSearchQuery, viewMode, setViewMode }) {
  const filtered = useMemo(() => {
    let items = activeCategory === "All" ? WARDROBE_ITEMS : WARDROBE_ITEMS.filter((i) => i.category === activeCategory);
    if (searchQuery) items = items.filter((i) => i.name.toLowerCase().includes(searchQuery.toLowerCase()) || i.tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return items;
  }, [activeCategory, searchQuery]);

  return (
    <motion.div
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -300, opacity: 0 }}
      transition={{ duration: 0.48, ease: [0.16, 1, 0.3, 1] }}
      className="absolute left-4 z-20 flex flex-col"
      style={{
        top: "50%",
        transform: "translateY(-50%)",
        width: 284,
        maxHeight: "80vh",
        background: "rgba(5,5,9,0.92)",
        backdropFilter: "blur(30px)",
        WebkitBackdropFilter: "blur(30px)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 22,
        boxShadow: "0 24px 64px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.06)",
      }}
    >
      <div className="absolute inset-x-8 top-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(155,89,255,0.6), rgba(6,182,212,0.5), transparent)" }} />

      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="flex items-center gap-2">
          <Shirt size={14} style={{ color: "#9b59ff" }} />
          <span className="text-sm font-semibold" style={{ color: "#e0e0e0" }}>Wardrobe</span>
          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(155,89,255,0.12)", color: "#a78bfa" }}>{WARDROBE_ITEMS.length}</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setViewMode("grid")} className="w-6 h-6 flex items-center justify-center rounded-md transition-all" style={{ background: viewMode === "grid" ? "rgba(255,255,255,0.1)" : "transparent", color: viewMode === "grid" ? "#e0e0e0" : "#444" }}>
            <Grid size={12} />
          </button>
          <button onClick={() => setViewMode("list")} className="w-6 h-6 flex items-center justify-center rounded-md transition-all" style={{ background: viewMode === "list" ? "rgba(255,255,255,0.1)" : "transparent", color: viewMode === "list" ? "#e0e0e0" : "#444" }}>
            <List size={12} />
          </button>
          <button onClick={onClose} className="w-6 h-6 flex items-center justify-center rounded-md transition-all ml-1" style={{ color: "#444" }} onMouseEnter={(e) => e.currentTarget.style.color = "#e0e0e0"} onMouseLeave={(e) => e.currentTarget.style.color = "#444"}>
            <X size={13} />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="px-3 py-2">
        <div className="relative">
          <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#444" }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search items..."
            className="w-full pl-8 pr-3 py-2.5 text-xs rounded-xl outline-none"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", color: "#e0e0e0", fontFamily: "'Inter', sans-serif" }}
            onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(155,89,255,0.35)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(155,89,255,0.08)"; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.boxShadow = "none"; }}
          />
        </div>
      </div>

      {/* Category pills */}
      <div className="flex gap-1.5 px-3 pb-2 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className="shrink-0 px-3 py-1 rounded-full text-[11px] transition-all duration-200"
            style={{
              background: activeCategory === cat ? "#ffffff" : "rgba(255,255,255,0.05)",
              color: activeCategory === cat ? "#000" : "#555",
              fontWeight: activeCategory === cat ? 500 : 400,
              border: "none",
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto px-3 pb-3" style={{ scrollbarWidth: "none" }}>
        <AnimatePresence>
          {viewMode === "grid" ? (
            <div className="grid grid-cols-2 gap-2">
              {filtered.map((item, i) => {
                const isActive = activeItems.some((a) => a.id === item.id);
                return (
                  <motion.button
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.94 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.92 }}
                    transition={{ delay: i * 0.025, duration: 0.25 }}
                    onClick={() => onToggle(item)}
                    className="relative p-3 rounded-xl text-left transition-all duration-200 aspect-square flex flex-col justify-between"
                    style={{
                      background: isActive ? "rgba(155,89,255,0.14)" : "rgba(255,255,255,0.03)",
                      border: isActive ? "1px solid rgba(155,89,255,0.3)" : "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <div className="w-full aspect-square rounded-lg mb-2" style={{ background: item.hexColor, border: `1px solid ${item.accentColor}30`, boxShadow: isActive ? `0 0 12px ${item.accentColor}40` : "none" }} />
                    <p className="text-[10px] font-medium leading-tight" style={{ color: isActive ? "#e0e0e0" : "#888" }}>{item.name}</p>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full mt-1 inline-block" style={{ background: `${item.accentColor}18`, color: item.accentColor }}>
                      {item.tag}
                    </span>
                    {isActive && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-2 right-2 w-4 h-4 rounded-full flex items-center justify-center" style={{ background: "#10b981" }}>
                        <Check size={8} color="#fff" strokeWidth={3} />
                      </motion.div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          ) : (
            <div className="space-y-1.5">
              {filtered.map((item, i) => {
                const isActive = activeItems.some((a) => a.id === item.id);
                return (
                  <motion.button
                    key={item.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ delay: i * 0.03, duration: 0.25 }}
                    onClick={() => onToggle(item)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200"
                    style={{
                      background: isActive ? "rgba(155,89,255,0.1)" : "rgba(255,255,255,0.03)",
                      border: isActive ? "1px solid rgba(155,89,255,0.22)" : "1px solid rgba(255,255,255,0.05)",
                    }}
                  >
                    <div className="relative shrink-0">
                      <div className="w-8 h-8 rounded-lg" style={{ background: item.hexColor, border: `1.5px solid ${item.accentColor}40`, boxShadow: isActive ? `0 0 10px ${item.accentColor}45` : "none" }} />
                      {isActive && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full flex items-center justify-center" style={{ background: "#10b981" }}>
                          <Check size={7} color="#fff" strokeWidth={3} />
                        </motion.div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-medium truncate" style={{ color: isActive ? "#e0e0e0" : "#999" }}>{item.name}</p>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px]" style={{ color: "#3a3a3a" }}>{item.category}</span>
                        <span style={{ color: "#2a2a2a", fontSize: 7 }}>•</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: `${item.accentColor}14`, color: item.accentColor }}>{item.tag}</span>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          )}
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="py-8 text-center">
            <p className="text-xs" style={{ color: "#333" }}>No items found</p>
          </div>
        )}
      </div>

      {/* Add item CTA */}
      <div className="px-3 pb-3 pt-1" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs transition-all duration-200"
          style={{ background: "rgba(155,89,255,0.08)", border: "1px solid rgba(155,89,255,0.18)", color: "#a78bfa" }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(155,89,255,0.14)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(155,89,255,0.08)"; }}>
          <Upload size={12} />
          Upload New Item
        </button>
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════
   ░░  UI — RIGHT PANEL: CUSTOMISE MODEL
══════════════════════════════════════════════════════════════ */
function CustomisePanel({ gender, setGender, skinTone, setSkinTone, hairStyle, setHairStyle, hairColor, setHairColor, onClose }) {
  const [expandedSection, setExpandedSection] = useState("model");
  const availableHairStyles = HAIR_STYLES.filter((h) => !h.maleOnly || gender === "male");

  const Section = ({ id, title, icon: Icon, children }) => {
    const open = expandedSection === id;
    return (
      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
        <button
          onClick={() => setExpandedSection(open ? null : id)}
          className="w-full flex items-center justify-between px-4 py-3 transition-colors"
          style={{ color: open ? "#e0e0e0" : "#666" }}
        >
          <div className="flex items-center gap-2">
            <Icon size={13} style={{ color: open ? "#9b59ff" : "#444" }} />
            <span className="text-xs font-medium">{title}</span>
          </div>
          <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown size={12} style={{ color: "#444" }} />
          </motion.div>
        </button>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              style={{ overflow: "hidden" }}
            >
              <div className="px-4 pb-4">{children}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 300, opacity: 0 }}
      transition={{ duration: 0.48, ease: [0.16, 1, 0.3, 1] }}
      className="absolute right-4 z-20 overflow-hidden"
      style={{
        top: "50%",
        transform: "translateY(-50%)",
        width: 268,
        maxHeight: "80vh",
        background: "rgba(5,5,9,0.92)",
        backdropFilter: "blur(30px)",
        WebkitBackdropFilter: "blur(30px)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 22,
        boxShadow: "0 24px 64px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.06)",
        overflowY: "auto",
        scrollbarWidth: "none",
      }}
    >
      <div className="absolute inset-x-8 top-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(6,182,212,0.6), rgba(155,89,255,0.5), transparent)" }} />

      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3 sticky top-0" style={{ background: "rgba(5,5,9,0.95)", borderBottom: "1px solid rgba(255,255,255,0.05)", zIndex: 5 }}>
        <div className="flex items-center gap-2">
          <Sliders size={13} style={{ color: "#06b6d4" }} />
          <span className="text-sm font-semibold" style={{ color: "#e0e0e0" }}>Customise</span>
        </div>
        <button onClick={onClose} style={{ color: "#444" }} onMouseEnter={(e) => e.currentTarget.style.color = "#e0e0e0"} onMouseLeave={(e) => e.currentTarget.style.color = "#444"}>
          <X size={13} />
        </button>
      </div>

      {/* Model gender */}
      <Section id="model" title="Model" icon={Users}>
        <SectionLabel>Gender</SectionLabel>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {["male", "female"].map((g) => (
            <button
              key={g}
              onClick={() => setGender(g)}
              className="py-2.5 rounded-xl text-xs capitalize transition-all duration-200"
              style={{
                background: gender === g ? "rgba(155,89,255,0.18)" : "rgba(255,255,255,0.04)",
                border: gender === g ? "1px solid rgba(155,89,255,0.35)" : "1px solid rgba(255,255,255,0.08)",
                color: gender === g ? "#c084fc" : "#555",
                fontWeight: gender === g ? 500 : 400,
              }}
            >
              {g === "male" ? "👨 Male" : "👩 Female"}
            </button>
          ))}
        </div>

        <SectionLabel>Skin Tone</SectionLabel>
        <div className="flex gap-2 flex-wrap mb-1">
          {SKIN_TONES.map((st) => (
            <button
              key={st.id}
              onClick={() => setSkinTone(st.hex)}
              title={st.label}
              className="relative w-8 h-8 rounded-full transition-all duration-200"
              style={{
                background: st.hex,
                border: skinTone === st.hex ? "2px solid #a855f7" : "2px solid rgba(255,255,255,0.12)",
                boxShadow: skinTone === st.hex ? "0 0 10px rgba(168,85,247,0.5)" : "none",
              }}
            >
              {skinTone === st.hex && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Check size={9} color="#fff" strokeWidth={3} />
                </div>
              )}
            </button>
          ))}
        </div>
      </Section>

      {/* Hairstyle */}
      <Section id="hair" title="Hairstyle" icon={Scissors}>
        <div className="space-y-1.5 mb-4">
          {availableHairStyles.map((h) => (
            <button
              key={h.id}
              onClick={() => setHairStyle(h.id)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all duration-200"
              style={{
                background: hairStyle === h.id ? "rgba(6,182,212,0.12)" : "rgba(255,255,255,0.03)",
                border: hairStyle === h.id ? "1px solid rgba(6,182,212,0.28)" : "1px solid rgba(255,255,255,0.05)",
                color: hairStyle === h.id ? "#06b6d4" : "#666",
              }}
            >
              {h.label}
              {hairStyle === h.id && <Check size={10} style={{ color: "#06b6d4" }} />}
            </button>
          ))}
        </div>

        <SectionLabel>Hair Color</SectionLabel>
        <div className="flex gap-2 flex-wrap">
          {HAIR_COLORS.map((hc) => (
            <button
              key={hc.id}
              onClick={() => setHairColor(hc.hex)}
              title={hc.label}
              className="w-7 h-7 rounded-full transition-all duration-200"
              style={{
                background: hc.hex,
                border: hairColor === hc.hex ? "2px solid #a855f7" : "2px solid rgba(255,255,255,0.12)",
                boxShadow: hairColor === hc.hex ? "0 0 8px rgba(168,85,247,0.6)" : "none",
              }}
            />
          ))}
        </div>
      </Section>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════
   ░░  UI — PRESETS PANEL
══════════════════════════════════════════════════════════════ */
function PresetsPanel({ onApply, onClose, gender }) {
  const relevant = OUTFIT_PRESETS.filter((p) => p.gender === "unisex" || p.gender === gender);

  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 80, opacity: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20"
      style={{
        width: "min(560px, calc(100vw - 32px))",
        background: "rgba(5,5,9,0.95)",
        backdropFilter: "blur(30px)",
        WebkitBackdropFilter: "blur(30px)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 20,
        boxShadow: "0 -12px 48px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)",
        fontFamily: "'Inter', sans-serif",
        maxHeight: "60vh",
        overflowY: "auto",
        scrollbarWidth: "none",
      }}
    >
      <div className="absolute inset-x-8 top-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(155,89,255,0.55), rgba(6,182,212,0.45), transparent)" }} />

      <div className="flex items-center justify-between px-5 pt-4 pb-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="flex items-center gap-2">
          <BookOpen size={13} style={{ color: "#9b59ff" }} />
          <span className="text-sm font-semibold" style={{ color: "#e0e0e0" }}>Outfit Presets</span>
        </div>
        <button onClick={onClose} style={{ color: "#444" }} onMouseEnter={(e) => e.currentTarget.style.color = "#e0e0e0"} onMouseLeave={(e) => e.currentTarget.style.color = "#444"}>
          <X size={13} />
        </button>
      </div>

      <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
        {relevant.map((preset, i) => (
          <motion.button
            key={preset.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => onApply(preset)}
            className="p-4 rounded-xl text-left transition-all duration-200"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(155,89,255,0.08)"; e.currentTarget.style.borderColor = "rgba(155,89,255,0.2)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; }}
          >
            <div className="flex items-start justify-between mb-2">
              <p className="text-sm font-medium" style={{ color: "#e0e0e0" }}>{preset.name}</p>
              <span className="text-[9px] px-2 py-0.5 rounded-full" style={{ background: "rgba(155,89,255,0.12)", color: "#a78bfa" }}>{preset.items.length} pcs</span>
            </div>
            <p className="text-xs mb-3" style={{ color: "#444" }}>{preset.vibe}</p>
            <div className="flex gap-1.5">
              {preset.items.map((id) => {
                const item = WARDROBE_ITEMS.find((w) => w.id === id);
                return item ? (
                  <div key={id} className="w-5 h-5 rounded-full border" style={{ background: item.hexColor, borderColor: `${item.accentColor}50` }} title={item.name} />
                ) : null;
              })}
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════
   ░░  UI — OUTFIT HUD (top right corner)
══════════════════════════════════════════════════════════════ */
function OutfitHUD({ activeItems, onSave, onClear }) {
  const [showSaveInput, setShowSaveInput] = useState(false);
  const [saveName, setSaveName] = useState("");

  if (activeItems.length === 0) return null;

  const score = Math.min(40 + activeItems.length * 12, 98);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="absolute z-20"
      style={{
        top: 80,
        right: 16,
        width: 196,
        background: "rgba(5,5,9,0.88)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 18,
        padding: "14px",
        fontFamily: "'Inter', sans-serif",
        boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
      }}
    >
      <SectionLabel>Current Look</SectionLabel>

      <div className="space-y-1.5 mb-3">
        <AnimatePresence>
          {activeItems.map((item) => (
            <motion.div key={item.id} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full shrink-0" style={{ background: item.hexColor, border: `1px solid ${item.accentColor}55` }} />
              <span className="text-[11px] truncate" style={{ color: "#777" }}>{item.name}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Score */}
      <div className="mb-3 pt-2.5" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px]" style={{ color: "#3a3a3a" }}>Style Score</span>
          <span className="text-[10px] font-semibold" style={{ color: "#10b981" }}>{score}%</span>
        </div>
        <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
          <motion.div animate={{ width: `${score}%` }} transition={{ duration: 0.7, ease: "easeOut" }} className="h-full rounded-full" style={{ background: "linear-gradient(90deg, #9b59ff, #10b981)", boxShadow: "0 0 8px rgba(16,185,129,0.35)" }} />
        </div>
      </div>

      {/* Actions */}
      <AnimatePresence>
        {showSaveInput ? (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <input
              autoFocus
              type="text"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && saveName) { onSave(saveName); setSaveName(""); setShowSaveInput(false); } if (e.key === "Escape") setShowSaveInput(false); }}
              placeholder="Outfit name..."
              className="w-full px-3 py-2 text-xs rounded-xl outline-none mb-2"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(155,89,255,0.3)", color: "#e0e0e0", fontFamily: "'Inter', sans-serif" }}
            />
          </motion.div>
        ) : (
          <div className="flex gap-1.5">
            <button
              onClick={() => setShowSaveInput(true)}
              className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-[11px] transition-all"
              style={{ background: "rgba(155,89,255,0.12)", border: "1px solid rgba(155,89,255,0.2)", color: "#a78bfa" }}
            >
              <Save size={11} /> Save
            </button>
            <button
              onClick={onClear}
              className="w-8 h-8 flex items-center justify-center rounded-xl transition-all"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", color: "#444" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.1)"; e.currentTarget.style.color = "#ef4444"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "#444"; }}
            >
              <Trash2 size={11} />
            </button>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════
   ░░  UI — SAVED OUTFITS DRAWER
══════════════════════════════════════════════════════════════ */
function SavedOutfitsDrawer({ savedOutfits, onLoad, onDelete, onClose }) {
  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="absolute bottom-0 inset-x-0 z-30"
      style={{
        background: "rgba(5,5,9,0.97)",
        backdropFilter: "blur(32px)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "20px 20px 0 0",
        maxHeight: "55vh",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div className="absolute inset-x-8 top-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(155,89,255,0.5), rgba(6,182,212,0.4), transparent)" }} />

      <div className="flex items-center justify-between px-6 pt-5 pb-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="flex items-center gap-2">
          <Star size={14} style={{ color: "#f59e0b" }} />
          <span className="text-sm font-semibold" style={{ color: "#e0e0e0" }}>Saved Looks</span>
          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(245,158,11,0.1)", color: "#f59e0b" }}>{savedOutfits.length}</span>
        </div>
        <button onClick={onClose} style={{ color: "#444" }} onMouseEnter={(e) => e.currentTarget.style.color = "#e0e0e0"} onMouseLeave={(e) => e.currentTarget.style.color = "#444"}>
          <X size={15} />
        </button>
      </div>

      <div className="overflow-y-auto px-4 py-4" style={{ maxHeight: "calc(55vh - 70px)", scrollbarWidth: "none" }}>
        {savedOutfits.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm" style={{ color: "#2a2a2a" }}>No saved looks yet.</p>
            <p className="text-xs mt-1" style={{ color: "#222" }}>Build an outfit and tap Save.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {savedOutfits.map((outfit) => (
              <motion.div
                key={outfit.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 rounded-2xl relative group"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                <p className="text-xs font-medium mb-1 truncate" style={{ color: "#e0e0e0" }}>{outfit.name}</p>
                <p className="text-[10px] mb-3" style={{ color: "#333" }}>{outfit.items.length} items</p>
                <div className="flex gap-1.5 mb-3">
                  {outfit.items.slice(0, 5).map((item) => (
                    <div key={item.id} className="w-4 h-4 rounded-full border" style={{ background: item.hexColor, borderColor: `${item.accentColor}50` }} />
                  ))}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => onLoad(outfit)} className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px]" style={{ background: "rgba(155,89,255,0.12)", color: "#a78bfa" }}>
                    <Eye size={9} /> Load
                  </button>
                  <button onClick={() => onDelete(outfit.id)} className="w-7 flex items-center justify-center rounded-lg" style={{ background: "rgba(255,255,255,0.04)", color: "#444" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.1)"; e.currentTarget.style.color = "#ef4444"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "#444"; }}>
                    <Trash2 size={9} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════
   ░░  UI — BOTTOM TOOLBAR
══════════════════════════════════════════════════════════════ */
function BottomToolbar({ lightingMode, setLightingMode, onReset, onScreenshot, onFullscreen, isFullscreen }) {
  return (
    <motion.div
      initial={{ y: 60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.65, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5"
      style={{
        background: "rgba(5,5,9,0.92)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 9999,
        padding: "7px 14px",
        boxShadow: "0 12px 40px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.05)",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {LIGHTING_MODES.map(({ label, preset, icon: Icon }) => (
        <button
          key={preset}
          onClick={() => setLightingMode(preset)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-full text-[11px] transition-all duration-200"
          style={{
            background: lightingMode === preset ? "rgba(155,89,255,0.2)" : "transparent",
            color: lightingMode === preset ? "#c084fc" : "#555",
            border: lightingMode === preset ? "1px solid rgba(155,89,255,0.28)" : "1px solid transparent",
            fontWeight: lightingMode === preset ? 500 : 400,
          }}
        >
          <Icon size={11} />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}

      <div className="w-px h-5 mx-1" style={{ background: "rgba(255,255,255,0.07)" }} />

      {[
        { icon: RotateCcw, label: "Reset",    action: onReset      },
        { icon: Camera,    label: "Capture",  action: onScreenshot },
        { icon: isFullscreen ? Minimize2 : Maximize2, label: isFullscreen ? "Exit" : "Focus", action: onFullscreen },
      ].map(({ icon: Icon, label, action }) => (
        <button
          key={label}
          onClick={action}
          className="flex items-center gap-1.5 px-3 py-2 rounded-full text-[11px] transition-all duration-200"
          style={{ color: "#555" }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "#e0e0e0"; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "#555"; e.currentTarget.style.background = "transparent"; }}
        >
          <Icon size={12} />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════
   ░░  MAIN PAGE — WARDROBE
══════════════════════════════════════════════════════════════ */
export default function Wardrobe() {
  /* ── Model state ── */
  const [gender,    setGender]    = useState("female");
  const [skinTone,  setSkinTone]  = useState("#c8956c");
  const [hairStyle, setHairStyle] = useState("long");
  const [hairColor, setHairColor] = useState("#2c1a0e");

  /* ── Wardrobe state ── */
  const [activeItems,   setActiveItems]   = useState([]);
  const [savedOutfits,  setSavedOutfits]  = useState([]);
  const [lightingMode,  setLightingMode]  = useState("city");
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery,   setSearchQuery]   = useState("");
  const [viewMode,      setViewMode]      = useState("list");

  /* ── Panel visibility ── */
  const [showInventory,  setShowInventory]  = useState(true);
  const [showCustomise,  setShowCustomise]  = useState(false);
  const [showPresets,    setShowPresets]    = useState(false);
  const [showSaved,      setShowSaved]      = useState(false);
  const [isFullscreen,   setIsFullscreen]   = useState(false);

  /* ── Misc UI ── */
  const [flashActive, setFlashActive] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: "", type: "success" });

  const showToast = useCallback((msg, type = "success") => {
    setToast({ visible: true, message: msg, type });
    setTimeout(() => setToast({ visible: false, message: "", type: "success" }), 2400);
  }, []);

  const toggleItem = useCallback((item) => {
    setActiveItems((prev) => {
      const exists = prev.find((i) => i.id === item.id);
      if (exists) return prev.filter((i) => i.id !== item.id);
      const filtered = prev.filter((i) => i.category !== item.category);
      return [...filtered, item];
    });
  }, []);

  const applyPreset = useCallback((preset) => {
    const items = preset.items.map((id) => WARDROBE_ITEMS.find((w) => w.id === id)).filter(Boolean);
    setActiveItems(items);
    setShowPresets(false);
    showToast(`Applied "${preset.name}"`);
  }, [showToast]);

  const saveOutfit = useCallback((name) => {
    if (activeItems.length === 0) return;
    setSavedOutfits((prev) => [...prev, { id: Date.now(), name, items: activeItems, createdAt: new Date().toISOString() }]);
    showToast(`"${name}" saved!`);
  }, [activeItems, showToast]);

  const loadOutfit = useCallback((outfit) => {
    setActiveItems(outfit.items);
    setShowSaved(false);
    showToast(`Loaded "${outfit.name}"`, "info");
  }, [showToast]);

  const deleteOutfit = useCallback((id) => {
    setSavedOutfits((prev) => prev.filter((o) => o.id !== id));
    showToast("Outfit deleted", "warn");
  }, [showToast]);

  const handleReset = useCallback(() => {
    setActiveItems([]);
    setLightingMode("city");
    showToast("Canvas reset");
  }, [showToast]);

  const handleScreenshot = useCallback(() => {
    setFlashActive(true);
    setTimeout(() => setFlashActive(false), 500);
    showToast("Look captured! 📸");
  }, [showToast]);

  const handleFullscreen = useCallback(() => {
    setIsFullscreen((v) => {
      if (!v) { setShowInventory(false); setShowCustomise(false); setShowPresets(false); }
      else    { setShowInventory(true); }
      return !v;
    });
  }, []);

  /* Update hair style selection based on gender */
  useEffect(() => {
    if (gender === "female" && (hairStyle === "buzz" || hairStyle === "bald")) {
      setHairStyle("long");
    }
  }, [gender, hairStyle]);

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ height: "100vh", background: "#030303", fontFamily: "'Inter', sans-serif" }}
    >
      {/* ── WebGL Canvas ── */}
      <div className="absolute inset-0 z-0">
        <Canvas
          camera={{ position: [0, 0.5, 5.6], fov: 42 }}
          shadows
          dpr={[1, 1.5]}
          performance={{ min: 0.5 }}
          gl={{ antialias: true, alpha: false }}
          style={{ background: "#030303" }}
        >
          <WardrobeScene
            activeItems={activeItems}
            lightingMode={lightingMode}
            gender={gender}
            skinTone={skinTone}
            hairStyle={hairStyle}
            hairColor={hairColor}
          />
        </Canvas>
      </div>

      {/* Flash */}
      <FlashEffect trigger={flashActive} />

      {/* ── TOP BAR ── */}
      <motion.div
        initial={{ y: -56, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        className="absolute top-0 inset-x-0 z-20 flex items-center justify-between px-4 pt-4 pointer-events-none"
      >
        {/* Back */}
        <div className="pointer-events-auto">
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm transition-all duration-200"
            style={{ background: "rgba(5,5,9,0.88)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.08)", color: "#777" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#e0e0e0"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.14)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "#777"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
          >
            <ArrowLeft size={13} />
            <span>Back</span>
          </Link>
        </div>

        {/* Centre badge */}
        <div
          className="flex items-center gap-2.5 px-5 py-2.5 rounded-full"
          style={{ background: "rgba(5,5,9,0.88)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <motion.span
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ repeat: Infinity, duration: 2.2 }}
            className="block w-1.5 h-1.5 rounded-full"
            style={{ background: "#06b6d4", boxShadow: "0 0 6px rgba(6,182,212,0.85)" }}
          />
          <span className="text-[10px] uppercase tracking-[0.22em]" style={{ color: "#777" }}>
            Wardrobe Studio
          </span>
        </div>

        {/* Right buttons */}
        <div className="pointer-events-auto flex items-center gap-2">
          {[
            { icon: Shirt,   label: "Closet",    active: showInventory,  action: () => { setShowInventory((v) => !v); setShowCustomise(false); setShowPresets(false); } },
            { icon: Sliders, label: "Customise", active: showCustomise,  action: () => { setShowCustomise((v) => !v); setShowInventory(false); setShowPresets(false); } },
            { icon: Layers,  label: "Presets",   active: showPresets,    action: () => { setShowPresets((v) => !v); setShowInventory(false); setShowCustomise(false); } },
            { icon: Star,    label: "Saved",     active: showSaved,      action: () => { setShowSaved((v) => !v); } },
          ].map(({ icon: Icon, label, active, action }) => (
            <motion.button
              key={label}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              onClick={action}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full text-xs transition-all duration-200"
              style={{
                background: active ? "rgba(155,89,255,0.16)" : "rgba(5,5,9,0.88)",
                backdropFilter: "blur(20px)",
                border: active ? "1px solid rgba(155,89,255,0.32)" : "1px solid rgba(255,255,255,0.08)",
                color: active ? "#c084fc" : "#666",
                fontWeight: active ? 500 : 400,
              }}
            >
              <Icon size={12} />
              <span className="hidden sm:inline">{label}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* ── PANELS ── */}
      <AnimatePresence>
        {showInventory && !isFullscreen && (
          <InventoryPanel
            activeItems={activeItems}
            onToggle={toggleItem}
            onClose={() => setShowInventory(false)}
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            viewMode={viewMode}
            setViewMode={setViewMode}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCustomise && !isFullscreen && (
          <CustomisePanel
            gender={gender}      setGender={setGender}
            skinTone={skinTone}  setSkinTone={setSkinTone}
            hairStyle={hairStyle} setHairStyle={setHairStyle}
            hairColor={hairColor} setHairColor={setHairColor}
            onClose={() => setShowCustomise(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPresets && !isFullscreen && (
          <PresetsPanel onApply={applyPreset} onClose={() => setShowPresets(false)} gender={gender} />
        )}
      </AnimatePresence>

      {/* ── OUTFIT HUD ── */}
      <AnimatePresence>
        {activeItems.length > 0 && !isFullscreen && !showCustomise && (
          <OutfitHUD activeItems={activeItems} onSave={saveOutfit} onClear={handleReset} />
        )}
      </AnimatePresence>

      {/* ── SAVED OUTFITS DRAWER ── */}
      <AnimatePresence>
        {showSaved && (
          <SavedOutfitsDrawer
            savedOutfits={savedOutfits}
            onLoad={loadOutfit}
            onDelete={deleteOutfit}
            onClose={() => setShowSaved(false)}
          />
        )}
      </AnimatePresence>

      {/* ── BOTTOM TOOLBAR ── */}
      <BottomToolbar
        lightingMode={lightingMode}
        setLightingMode={(m) => { setLightingMode(m); showToast(`${LIGHTING_MODES.find((l) => l.preset === m)?.label} lighting`, "info"); }}
        onReset={handleReset}
        onScreenshot={handleScreenshot}
        onFullscreen={handleFullscreen}
        isFullscreen={isFullscreen}
      />

      {/* ── TOAST ── */}
      <Toast message={toast.message} visible={toast.visible} type={toast.type} />

      {/* ── EMPTY STATE HINT ── */}
      <AnimatePresence>
        {activeItems.length === 0 && !isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.8 }}
            className="absolute bottom-20 left-1/2 -translate-x-1/2 z-10 pointer-events-none text-center"
          >
            <p className="text-[11px] uppercase tracking-[0.22em]" style={{ color: "#2a2a2a" }}>
              Select items from the closet to dress the model
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── DRAG HINT ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-20 right-4 z-10 pointer-events-none"
      >
        <motion.p
          animate={{ opacity: [0.25, 0.5, 0.25] }}
          transition={{ repeat: Infinity, duration: 3.5 }}
          className="text-[10px] uppercase tracking-[0.16em]"
          style={{ color: "#2a2a2a" }}
        >
          Drag to rotate
        </motion.p>
      </motion.div>
    </div>
  );
}