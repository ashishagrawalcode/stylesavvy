"use client";

import React, { useRef, useState, useEffect } from "react";
import { 
  motion, useScroll, useTransform, useSpring, useInView, AnimatePresence 
} from "framer-motion";
import Link from "next/link";
import { 
  ArrowRight, Sparkles, Box, Shirt, ScanFace, Layers, Cpu, 
  Fingerprint, Activity, ChevronRight, Star, Plus, Check, Play, 
  Globe, MessageCircle, Share2, Mail, Quote 
} from "lucide-react";
import StyleSavvyLogo from "../components/ui/StyleSavvyLogo";

// ============================================================================
// DATA STRUCTURES
// ============================================================================

const BRANDS = ['ZARA', 'H&M', 'MYNTRA', 'SSENSE', 'FARFETCH', 'ASOS', 'UNIQLO', 'PRADA', 'GUCCI', 'BALENCIAGA'];

const BENTO_FEATURES = [
  {
    title: "Neural Engine",
    icon: Cpu,
    colSpan: "md:col-span-8",
    color: "purple",
    tag: "Core Intelligence",
    desc: "Deep-learning decodes your body geometry and skin undertone to engineer hyper-personalised looks. It learns your style DNA and evolves."
  },
  {
    title: "3D Roomspace",
    icon: Box,
    colSpan: "md:col-span-4",
    color: "cyan",
    tag: "WebGL Render",
    desc: "A WebGL canvas renders a real-time 3D mannequin. Dress it, spin it 360°, and visualize every look before you wear it."
  },
  {
    title: "Digital Wardrobe",
    icon: Shirt,
    colSpan: "md:col-span-4",
    color: "white",
    tag: "Drag & Drop",
    desc: "Upload your closet. Remix outfits and discover combinations mathematically mapped to your geometry."
  },
  {
    title: "Live Trend Radar",
    icon: Activity,
    colSpan: "md:col-span-8",
    color: "pink",
    tag: "Market Sync",
    desc: "Real-time price comparisons across premium retailers. Get instant alerts when a piece that perfectly matches your profile drops in price globally."
  }
];

const WORKFLOW = [
  { step: "01", title: "Calibrate Matrix", desc: "Input your precise measurements, body geometry, and skin undertone into the engine via our secure biometric interface." },
  { step: "02", title: "Digitize Assets", desc: "Photograph and upload your physical garments to construct your 2D modular inventory, powered by computer vision." },
  { step: "03", title: "Synthesize Fits", desc: "The AI renders millions of permutations, presenting only the mathematically perfect outfits for your specific geometry." }
];

const REVIEWS = [
  { text: "StyleSavvy didn't just organize my closet; it completely redefined how I perceive my own geometry. I'm dressing with absolute mathematical confidence.", author: "Elena R.", role: "Creative Director" },
  { text: "The affiliate price-drop radar paid for the Pro subscription in three days. The 3D Roomspace feels like stepping into the future of retail.", author: "Marcus T.", role: "Software Engineer" },
  { text: "Finally, an AI that understands color theory. The way it maps my 'Deep Winter' undertone to current runway trends is legitimately terrifyingly accurate.", author: "Sarah K.", role: "Fashion Editor" }
];

// ============================================================================
// ADVANCED MICRO-COMPONENTS
// ============================================================================

const CustomCursor = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const updateMouse = (e) => setMousePosition({ x: e.clientX, y: e.clientY });
    const handleMouseOver = (e) => setIsHovering(e.target.closest('a, button, .interactive'));
    
    window.addEventListener("mousemove", updateMouse);
    window.addEventListener("mouseover", handleMouseOver);
    return () => {
      window.removeEventListener("mousemove", updateMouse);
      window.removeEventListener("mouseover", handleMouseOver);
    };
  }, []);

  return (
    <motion.div
      className="fixed top-0 left-0 w-8 h-8 rounded-full border border-cyan-400/50 pointer-events-none z-[100] mix-blend-screen hidden md:flex items-center justify-center"
      animate={{ 
        x: mousePosition.x - 16, y: mousePosition.y - 16,
        scale: isHovering ? 1.8 : 1,
        backgroundColor: isHovering ? "rgba(34, 211, 238, 0.1)" : "transparent"
      }}
      transition={{ type: "spring", stiffness: 500, damping: 28, mass: 0.5 }}
    >
      <motion.div className="w-1.5 h-1.5 bg-purple-400 rounded-full" animate={{ scale: isHovering ? 0 : 1 }} />
    </motion.div>
  );
};

const MagneticButton = ({ children, className, onClick }) => {
  const ref = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e) => {
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    setPosition({ x: middleX * 0.2, y: middleY * 0.2 });
  };

  const reset = () => setPosition({ x: 0, y: 0 });

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      className={className}
      onClick={onClick}
    >
      {children}
    </motion.button>
  );
};

const TextScramble = ({ text }) => {
  const [displayText, setDisplayText] = useState(text);
  const chars = "!<>-_\\/[]{}—=+*^?#_";
  
  useEffect(() => {
    let iteration = 0;
    const interval = setInterval(() => {
      setDisplayText(text.split("").map((char, index) => {
        if (index < iteration) return text[index];
        return chars[Math.floor(Math.random() * chars.length)];
      }).join(""));
      
      if (iteration >= text.length) clearInterval(interval);
      iteration += 1 / 3;
    }, 30);
    return () => clearInterval(interval);
  }, [text]);

  return <span>{displayText}</span>;
};

// ============================================================================
// MAIN ARCHITECTURE
// ============================================================================

export default function Home() {
  const containerRef = useRef(null);
  const workflowRef = useRef(null);
  
  // Advanced Scroll Parallax
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  return (
    <main ref={containerRef} className="relative w-full bg-[#030303] selection:bg-cyan-500/30 selection:text-white overflow-hidden cursor-none font-sans">
      
      <CustomCursor />
      
      {/* Scroll Progress */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-cyan-500 to-fuchsia-500 origin-left z-[100]"
        style={{ scaleX: useSpring(scrollYProgress, { stiffness: 100, damping: 30 }) }}
      />

      {/* Deep Ambient Backgrounds */}
      <motion.div style={{ y: bgY }} className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-1/4 w-[50vw] h-[50vh] bg-purple-900/5 blur-[150px] rounded-full mix-blend-screen" />
        <div className="absolute top-[30%] right-1/4 w-[40vw] h-[40vh] bg-cyan-900/5 blur-[150px] rounded-full mix-blend-screen" />
      </motion.div>
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none z-0" />

      {/* =======================================================================
          ZONE 1: THE EDITORIAL HERO
          ======================================================================= */}
      <motion.section 
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative w-full min-h-[90vh] flex flex-col items-center justify-center px-6 pt-16 pb-10 z-10"
      >
        <div className="max-w-6xl mx-auto flex flex-col items-center text-center w-full">
          
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} className="mb-6">
            <div className="relative group cursor-pointer interactive">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 rounded-full blur-md group-hover:blur-xl transition-all duration-700" />
              <span className="relative text-[10px] sm:text-xs tracking-[0.3em] text-[#e2e2e2] uppercase border border-white/10 px-6 py-2.5 rounded-full bg-black/50 backdrop-blur-xl inline-flex items-center gap-3">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                </span>
                <TextScramble text="STYLE ARCHITECTURE ENGINE v2.0" />
              </span>
            </div>
          </motion.div>
          
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.0, delay: 0.1, ease: [0.16, 1, 0.3, 1] }} className="font-sans text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] mb-5 text-white max-w-4xl mx-auto">
            Intelligence in <br className="hidden sm:block" />
            <span className="relative inline-block">
              <span className="relative bg-gradient-to-r from-white via-[#e2e2e2] to-[#888888] bg-clip-text text-transparent drop-shadow-md">
                Every Thread.
              </span>
            </span>
          </motion.h1>
          
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.0, delay: 0.3, ease: [0.16, 1, 0.3, 1] }} className="text-base sm:text-lg text-[#888888] mb-8 max-w-xl font-light leading-relaxed">
            The era of static fashion is over. Digitize your physical wardrobe, enter the immersive 3D Roomspace, and let our neural engine curate fits mathematically scaled to your exact geometry.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.8 }} className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <MagneticButton className="w-full sm:w-auto interactive group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-black rounded-full text-sm font-semibold tracking-widest uppercase overflow-hidden shadow-[0_0_30px_rgba(255,255,255,0.1)]">
              <div className="absolute inset-0 bg-gradient-to-r from-white via-gray-300 to-white translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
              <Link href="/stylist" className="relative z-10 flex items-center gap-2">Initialize Profile <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" /></Link>
            </MagneticButton>
            
            <Link href="/roomspace" className="w-full interactive sm:w-auto group flex items-center justify-center gap-3 px-8 py-4 bg-transparent text-white border border-white/20 rounded-full text-sm font-semibold tracking-widest uppercase hover:bg-white/5 transition-all duration-300 backdrop-blur-sm">
              <Play size={14} className="text-cyan-400 group-hover:scale-110 transition-transform" /> 
              Watch Demo
            </Link>
          </motion.div>

        </div>
      </motion.section>

      {/* =======================================================================
          ZONE 2: SEAMLESS MARQUEE
          ======================================================================= */}
      <section className="w-full border-y border-white/5 bg-[#0a0a0a]/50 py-8 z-10 relative overflow-hidden backdrop-blur-2xl">
        <div className="flex w-[200vw] animate-[ticker_40s_linear_infinite] opacity-30 hover:opacity-100 transition-opacity duration-700">
          {[...Array(2)].map((_, idx) => (
            <div key={idx} className="flex items-center justify-around w-1/2 min-w-max px-8 gap-20">
              {BRANDS.map((brand, i) => (
                <span key={i} className="font-sans font-bold text-3xl tracking-[0.2em] text-[#555555] uppercase">{brand}</span>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* =======================================================================
          ZONE 3: THE BENTO GRID ECOSYSTEM
          ======================================================================= */}
      <section className="w-full max-w-7xl mx-auto px-6 py-40 z-10 relative">
        <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 1 }} className="mb-20">
          <span className="text-[10px] tracking-[0.2em] text-[#888888] border border-white/10 px-4 py-2 rounded-full uppercase mb-6 inline-block">System Architecture</span>
          <h2 className="font-sans text-5xl md:text-6xl font-bold tracking-tight text-white leading-tight">
            A Unified <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">Ecosystem.</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-12 auto-rows-[400px] gap-6">
          {BENTO_FEATURES.map((feat, i) => (
            <motion.div 
              key={i} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, margin: "-50px" }} transition={{ delay: i * 0.1, duration: 0.8 }}
              className={`${feat.colSpan} bg-gradient-to-br from-[#0a0a0a] to-[#050505] border border-white/5 hover:border-white/20 rounded-[2.5rem] p-10 relative overflow-hidden group transition-all duration-500 interactive flex flex-col justify-between`}
            >
              {/* Dynamic Hover Glow */}
              <div className={`absolute -top-32 -right-32 w-96 h-96 bg-${feat.color}-500/5 blur-[100px] rounded-full group-hover:bg-${feat.color}-500/10 transition-all duration-700 pointer-events-none`} />
              
              <div className="relative z-10 flex justify-between items-start">
                <feat.icon size={36} className={`text-${feat.color}-400`} />
                <span className={`text-[10px] tracking-widest uppercase text-${feat.color}-400/80 bg-${feat.color}-500/10 px-3 py-1 rounded-full border border-${feat.color}-500/20`}>{feat.tag}</span>
              </div>

              <div className="relative z-10 mt-auto">
                <h3 className="font-sans text-3xl font-semibold tracking-tight text-white mb-4">{feat.title}</h3>
                <p className="text-[#888888] text-base leading-relaxed max-w-sm mb-6">{feat.desc}</p>
                <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-colors duration-300">
                   <ArrowRight size={16} className="-rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* =======================================================================
          ZONE 4: STICKY-SCROLL WORKFLOW
          ======================================================================= */}
      <section className="w-full relative z-10 border-y border-white/5 bg-[#050505]">
        <div className="max-w-7xl mx-auto px-6 py-32 flex flex-col lg:flex-row gap-20">
          
          {/* Sticky Left Content */}
          <div className="w-full lg:w-1/3 lg:sticky lg:top-40 h-fit">
             <Fingerprint size={48} className="text-[#333333] mb-8" />
             <h2 className="font-sans text-5xl md:text-6xl font-bold tracking-tight text-white mb-6">The Logic.</h2>
             <p className="text-[#888888] text-lg leading-relaxed mb-8">Three operational phases to completely overhaul and digitize your personal aesthetic.</p>
             <Link href="/about" className="inline-flex items-center gap-2 text-sm tracking-widest uppercase text-white hover:text-cyan-400 transition-colors border-b border-white/20 pb-1">Read the Whitepaper <ArrowRight size={14} /></Link>
          </div>

          {/* Scrolling Right Content */}
          <div className="w-full lg:w-2/3 flex flex-col gap-32">
             {WORKFLOW.map((item, i) => (
                <motion.div 
                  key={i} initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.8 }}
                  className="flex gap-8 group"
                >
                  <div className="w-24 h-24 shrink-0 rounded-full border border-white/10 flex items-center justify-center bg-black relative shadow-[0_0_30px_rgba(255,255,255,0.02)] group-hover:border-cyan-500/50 transition-colors duration-500">
                    <span className="absolute -top-2 -left-2 text-[10px] font-bold text-cyan-400 bg-black px-2 py-1 rounded border border-white/10">{item.step}</span>
                    <span className="font-sans font-bold text-3xl text-white">{i + 1}</span>
                  </div>
                  <div className="pt-2">
                    <h3 className="font-sans text-3xl font-semibold tracking-tight text-white mb-4">{item.title}</h3>
                    <p className="text-[#888888] text-lg leading-relaxed max-w-lg">{item.desc}</p>
                  </div>
                </motion.div>
             ))}
          </div>
        </div>
      </section>

      {/* =======================================================================
          ZONE 5: TESTIMONIALS (Social Proof)
          ======================================================================= */}
      <section className="w-full max-w-7xl mx-auto px-6 py-40 z-10 relative">
        <div className="text-center mb-20">
          <h2 className="font-sans text-5xl font-bold tracking-tight text-white mb-6">The Consensus.</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {REVIEWS.map((review, i) => (
            <motion.div 
              key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15, duration: 0.8 }}
              className="glass-pill rounded-[2rem] p-10 border border-white/5 relative"
            >
              <Quote size={40} className="text-white/5 absolute top-6 right-6" />
              <div className="flex gap-1 mb-6">
                {[1,2,3,4,5].map(s => <Star key={s} size={14} className="text-cyan-400" fill="currentColor" />)}
              </div>
              <p className="text-[#e2e2e2] text-lg leading-relaxed mb-8">"{review.text}"</p>
              <div>
                <p className="text-white font-bold tracking-wide">{review.author}</p>
                <p className="text-[10px] tracking-widest text-[#888888] uppercase">{review.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* =======================================================================
          ZONE 6: FINAL IMMERSIVE CTA
          ======================================================================= */}
      <section className="w-full py-40 text-center z-10 relative overflow-hidden border-t border-white/5 bg-gradient-to-b from-[#030303] to-[#0a0a0a]">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 1.2 }} className="relative max-w-4xl mx-auto px-6">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/5 blur-[150px] rounded-full pointer-events-none" />
          
          <h2 className="font-sans text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-8 relative z-10 leading-[1.1]">
            Upgrade your <br/><span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">visual identity.</span>
          </h2>
          <p className="text-lg text-[#888888] mb-12 max-w-xl mx-auto relative z-10">
            Join thousands of users who have already digitized their aesthetic. The Style Architecture Engine awaits.
          </p>
          
          <div className="relative z-10 flex flex-col items-center gap-6">
            <MagneticButton className="interactive group relative inline-flex items-center justify-center px-12 py-6 bg-white text-black rounded-full text-sm font-bold tracking-widest uppercase overflow-hidden shadow-[0_0_50px_rgba(255,255,255,0.15)]">
               <div className="absolute inset-0 bg-gradient-to-r from-white via-gray-300 to-white translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
               <Link href="/login" className="relative z-10 flex items-center gap-3">Create Free Account <ArrowRight size={18} /></Link>
            </MagneticButton>
            <span className="text-[10px] text-[#666666] tracking-widest uppercase flex items-center gap-2">
               No credit card required for standard initialization
            </span>
          </div>
        </motion.div>
      </section>

      {/* =======================================================================
          ZONE 7: EDITORIAL FOOTER
          ======================================================================= */}
      <footer className="w-full border-t border-white/5 bg-[#030303] pt-32 pb-12 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-24">
            <div className="col-span-1 md:col-span-2">
              <div className="mb-6"><StyleSavvyLogo scale={0.7} /></div>
              <p className="text-[#888888] text-sm leading-relaxed max-w-sm mb-8">The leading neural architecture for personal aesthetics. Digitize your physical wardrobe and visualize the future of fashion.</p>
              <div className="flex gap-4">
                {[Globe, MessageCircle, Share2, Mail].map((Icon, i) => (
                  <Link key={i} href="#" className="interactive w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-[#888888] hover:text-white hover:border-white/30 transition-all hover:bg-white/5">
                    <Icon size={18} />
                  </Link>
                ))}
              </div>
            </div>
            <div className="col-span-1">
              <h4 className="text-[10px] tracking-widest text-white uppercase mb-6 border-b border-white/10 pb-2 inline-block">Ecosystem</h4>
              <ul className="space-y-4 text-sm text-[#888888]">
                {["Neural Engine", "3D Roomspace", "Smart Wardrobe", "Trend Radar"].map((link, i) => (
                  <li key={i}><Link href="#" className="hover:text-cyan-400 transition-colors interactive">{link}</Link></li>
                ))}
              </ul>
            </div>
            <div className="col-span-1">
              <h4 className="text-[10px] tracking-widest text-white uppercase mb-6 border-b border-white/10 pb-2 inline-block">Legal</h4>
              <ul className="space-y-4 text-sm text-[#888888]">
                {["Privacy Policy", "Terms of Service", "Data Ethics", "Contact"].map((link, i) => (
                  <li key={i}><Link href="#" className="hover:text-cyan-400 transition-colors interactive">{link}</Link></li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-[#555555]">© 2026 Style Architecture Engine. All rights reserved.</p>
            <p className="text-xs text-[#555555] flex items-center gap-2">
              System State: <span className="text-cyan-400 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" /> Optimal</span>
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}