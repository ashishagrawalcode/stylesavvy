"use client";

import React, { useRef, useState, useEffect } from "react";
import { 
  motion, 
  useScroll, 
  useTransform, 
  useSpring, 
  useInView, 
  AnimatePresence 
} from "framer-motion";
import Link from "next/link";
import { 
  ArrowRight, Sparkles, Box, Shirt, ScanFace, Layers, Cpu, 
  Fingerprint, Activity, ChevronRight, Star, Plus, Minus, 
  Check, Play, Globe, MessageCircle, Share2, Mail 
} from "lucide-react";

// ============================================================================
// DATA & CONFIGURATION (Massive data arrays for rich content)
// ============================================================================

const MARQUEE_BRANDS = ['ZARA', 'H&M', 'MYNTRA', 'SSENSE', 'FARFETCH', 'ASOS', 'UNIQLO', 'PRADA', 'GUCCI', 'BALENCIAGA'];

const FEATURES_DATA = [
  {
    title: "Neural Fashion Engine",
    icon: Cpu,
    colSpan: "md:col-span-8",
    color: "purple",
    desc: "Deep-learning decodes your body geometry, skin undertone, and aesthetic preferences to engineer hyper-personalised looks. It learns your style DNA and evolves with every interaction.",
    action: "Initialize Profile",
    link: "/stylist"
  },
  {
    title: "3D Roomspace",
    icon: Box,
    colSpan: "md:col-span-4",
    color: "cyan",
    desc: "A WebGL canvas renders a real-time 3D mannequin. Dress it, spin it 360°, and visualize every look before you wear it in the real world.",
    action: "Enter Lobby",
    link: "/roomspace"
  },
  {
    title: "Digital Wardrobe",
    icon: Shirt,
    colSpan: "md:col-span-5",
    color: "white",
    desc: "Upload your closet. Drag pieces onto a live canvas, remix outfits, and discover combinations you never considered mathematically possible.",
    action: "Scan Closet",
    link: "/wardrobe"
  },
  {
    title: "Live Trend Radar",
    icon: Activity,
    colSpan: "md:col-span-7",
    color: "pink",
    desc: "Real-time price comparisons across premium retailers. Get instant alerts when a piece that perfectly matches your profile drops in price globally.",
    action: "View Market",
    link: "/shop"
  }
];

const WORKFLOW_STEPS = [
  { icon: ScanFace, step: "01", title: "Calibrate Matrix", desc: "Input your precise measurements, body geometry, and skin undertone into the engine via our secure biometric interface." },
  { icon: Layers, step: "02", title: "Digitize Assets", desc: "Photograph and upload your physical garments to construct your 2D modular inventory, powered by computer vision." },
  { icon: Sparkles, step: "03", title: "Synthesize Fits", desc: "The AI renders millions of permutations, presenting only the mathematically perfect outfits for your specific geometry." }
];

const PRICING_TIERS = [
  {
    name: "Basic",
    price: "Free",
    desc: "Essential tools to digitize your aesthetic.",
    features: ["Up to 50 wardrobe items", "Basic AI outfit generation", "Standard 2D Canvas", "Community trends"],
    cta: "Start Free",
    popular: false
  },
  {
    name: "Pro",
    price: "$12",
    period: "/month",
    desc: "Advanced neural curation for the modern aesthetician.",
    features: ["Unlimited wardrobe items", "Neural body-geometry mapping", "Full 3D Roomspace access", "Live affiliate price drop alerts", "Export fits to calendar"],
    cta: "Upgrade to Pro",
    popular: true
  },
  {
    name: "Couture",
    price: "$49",
    period: "/month",
    desc: "The ultimate white-glove digital styling experience.",
    features: ["Everything in Pro", "1-on-1 human stylist review", "Early access to beta features", "Priority rendering pipeline", "Physical garment sourcing"],
    cta: "Request Access",
    popular: false
  }
];

const FAQS = [
  { question: "How does the AI determine my body geometry?", answer: "Our proprietary engine uses a combination of self-reported measurements and optional computer vision analysis from a single photograph to map your exact proportions, categorizing you into one of 24 distinct geometric profiles." },
  { question: "Are my uploaded photos secure?", answer: "Absolutely. We employ end-to-end encryption. Your images are processed solely for background removal and feature extraction, and are never shared with third-party advertisers." },
  { question: "Can I buy clothes directly through StyleSavvy?", answer: "StyleSavvy is an aggregation and curation platform. We connect you directly to retailers like Zara, SSENSE, and Myntra via secure affiliate links, ensuring you get the best live market price." },
  { question: "What if I don't know my skin undertone?", answer: "Our onboarding process includes a quick, interactive color-theory test that determines your seasonal palette (e.g., Deep Winter, Soft Autumn) with 98% accuracy." }
];

// ============================================================================
// MICRO-COMPONENTS (Built within the monolithic file)
// ============================================================================

const CustomCursor = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const updateMousePosition = (e) => setMousePosition({ x: e.clientX, y: e.clientY });
    const handleMouseOver = (e) => {
      if (e.target.tagName.toLowerCase() === 'a' || e.target.tagName.toLowerCase() === 'button') {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener("mousemove", updateMousePosition);
    window.addEventListener("mouseover", handleMouseOver);
    return () => {
      window.removeEventListener("mousemove", updateMousePosition);
      window.removeEventListener("mouseover", handleMouseOver);
    };
  }, []);

  return (
    <motion.div
      className="fixed top-0 left-0 w-8 h-8 rounded-full border border-cyan-400/50 pointer-events-none z-[100] mix-blend-screen hidden md:flex items-center justify-center"
      animate={{ 
        x: mousePosition.x - 16, 
        y: mousePosition.y - 16,
        scale: isHovering ? 1.5 : 1,
        backgroundColor: isHovering ? "rgba(34, 211, 238, 0.1)" : "transparent"
      }}
      transition={{ type: "spring", stiffness: 500, damping: 28, mass: 0.5 }}
    >
      <motion.div 
        className="w-1.5 h-1.5 bg-purple-400 rounded-full"
        animate={{ scale: isHovering ? 0 : 1 }}
      />
    </motion.div>
  );
};

const ScrollProgressBar = ({ scrollYProgress }) => {
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-cyan-500 to-fuchsia-500 origin-left z-[100]"
      style={{ scaleX }}
    />
  );
};

const AccordionItem = ({ faq, isOpen, onClick }) => {
  return (
    <div className="border-b border-white/10 last:border-0 overflow-hidden">
      <button 
        onClick={onClick}
        className="w-full py-6 flex items-center justify-between text-left group"
      >
        <span className="font-serif text-xl md:text-2xl text-white group-hover:text-cyan-400 transition-colors">{faq.question}</span>
        <motion.div animate={{ rotate: isOpen ? 45 : 0 }} transition={{ duration: 0.3 }}>
          <Plus size={24} className="text-[#888888] group-hover:text-cyan-400" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="font-sans text-[#888888] pb-6 leading-relaxed max-w-3xl">
              {faq.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function Home() {
  const containerRef = useRef(null);
  const [activeFaq, setActiveFaq] = useState(0);
  
  // Parallax calculations
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  // Framer Motion Variants
  const fadeUp = { hidden: { opacity: 0, y: 50 }, show: { opacity: 1, y: 0, transition: { duration: 1, ease: [0.16, 1, 0.3, 1] } } };
  const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };

  return (
    <main ref={containerRef} className="relative w-full bg-[#030303] selection:bg-cyan-500/30 selection:text-white overflow-hidden cursor-none">
      
      <CustomCursor />
      <ScrollProgressBar scrollYProgress={scrollYProgress} />

      {/* --- AMBIENT BACKGROUNDS --- */}
      <motion.div style={{ y: bgY }} className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-1/4 w-[50vw] h-[50vh] bg-purple-900/15 blur-[150px] rounded-full mix-blend-screen" />
        <div className="absolute top-[20%] right-1/4 w-[40vw] h-[40vh] bg-cyan-900/10 blur-[150px] rounded-full mix-blend-screen" />
      </motion.div>
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none z-0" />

      {/* =======================================================================
          ZONE 1: HERO SECTION
          ======================================================================= */}
      <motion.section 
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative w-full min-h-screen flex flex-col items-center justify-center pt-32 pb-24 px-6 z-10 origin-top"
      >
        <motion.div variants={stagger} initial="hidden" animate="show" className="max-w-6xl mx-auto flex flex-col items-center text-center w-full">
          
          <motion.div variants={fadeUp} className="mb-8">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 rounded-full blur-md" />
              <span className="relative font-sans text-[10px] sm:text-xs tracking-[0.3em] text-[#e2e2e2] uppercase border border-white/10 px-8 py-3 rounded-full bg-black/50 backdrop-blur-xl inline-flex items-center gap-3">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                </span>
                Style Architecture Engine v2.0
              </span>
            </div>
          </motion.div>
          
          <motion.h1 variants={fadeUp} className="font-serif text-6xl sm:text-8xl lg:text-[130px] font-normal tracking-tighter leading-[0.85] mb-8 text-white">
            Intelligence in <br />
            <span className="italic relative inline-block">
              <span className="relative bg-gradient-to-b from-white via-[#e2e2e2] to-[#555555] bg-clip-text text-transparent">
                Every Thread.
              </span>
            </span>
          </motion.h1>
          
          <motion.p variants={fadeUp} className="font-sans text-lg sm:text-xl text-[#888888] mb-12 max-w-2xl font-light leading-relaxed">
            The era of static fashion is over. Digitize your physical wardrobe, enter the immersive 3D Roomspace, and let our neural engine curate fits mathematically scaled to your exact geometry.
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center gap-6 w-full sm:w-auto">
            <Link href="/stylist" className="w-full sm:w-auto group relative inline-flex items-center justify-center gap-3 px-10 py-5 bg-white text-black rounded-full font-sans text-sm font-semibold tracking-widest uppercase overflow-hidden hover:scale-105 transition-all duration-500 shadow-[0_0_40px_rgba(255,255,255,0.1)]">
              <span className="relative z-10 flex items-center gap-2">Initialize Profile <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" /></span>
            </Link>
            <button className="w-full sm:w-auto group flex items-center justify-center gap-3 px-10 py-5 bg-transparent text-white border border-white/20 rounded-full font-sans text-sm font-semibold tracking-widest uppercase hover:bg-white/5 transition-all duration-300">
              <Play size={14} className="text-cyan-400" /> Watch Demo
            </button>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* =======================================================================
          ZONE 2: MARQUEE & STATS
          ======================================================================= */}
      <section className="w-full border-y border-white/5 bg-white/[0.01] py-8 z-10 relative overflow-hidden backdrop-blur-md">
        <div className="flex w-[200vw] animate-[ticker_30s_linear_infinite] opacity-40 hover:opacity-100 transition-opacity duration-700">
          {[...Array(2)].map((_, idx) => (
            <div key={idx} className="flex items-center justify-around w-1/2 min-w-max px-8 gap-20">
              {MARQUEE_BRANDS.map((brand, i) => (
                <span key={i} className="font-serif text-3xl tracking-widest text-[#666666] uppercase">{brand}</span>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* =======================================================================
          ZONE 3: PHILOSOPHY & METRICS
          ======================================================================= */}
      <section className="w-full max-w-7xl mx-auto px-6 py-40 z-10 relative">
        <div className="flex flex-col lg:flex-row gap-20 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 1 }}
            className="w-full lg:w-1/2"
          >
            <Fingerprint size={48} className="text-[#333333] mb-8" />
            <h2 className="font-serif text-5xl lg:text-6xl text-white leading-[1.1] mb-8">
              Fashion is no longer <br /><span className="italic text-[#888888]">one-size-fits-all.</span>
            </h2>
            <p className="font-sans text-lg text-[#888888] font-light leading-relaxed mb-10">
              Traditional retail forces you into standardized boxes. StyleSavvy dismantles this by mapping the micro-measurements of your body and cross-referencing them against global inventory data in milliseconds.
            </p>
            <div className="grid grid-cols-2 gap-8">
              {[ { v: "50K+", l: "Users" }, { v: "2M+", l: "Fits Generated" }, { v: "98%", l: "Accuracy" }, { v: "0.2s", l: "Render Time" } ].map((s, i) => (
                <div key={i} className="border-l border-cyan-500/30 pl-4">
                  <div className="font-serif text-3xl text-white mb-1">{s.v}</div>
                  <div className="font-sans text-[10px] tracking-widest text-[#666666] uppercase">{s.l}</div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 1.5 }}
            className="w-full lg:w-1/2 aspect-square relative glass-pill rounded-[3rem] overflow-hidden flex items-center justify-center border border-white/10"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-purple-500/10" />
            <div className="relative w-72 h-72 border border-white/10 rounded-full flex items-center justify-center animate-[spin_40s_linear_infinite]">
              <div className="w-56 h-56 border border-white/10 rounded-full flex items-center justify-center animate-[spin_20s_linear_infinite_reverse]">
                <div className="w-32 h-32 bg-white/5 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(255,255,255,0.05)]">
                  <Sparkles className="text-white" size={32} />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* =======================================================================
          ZONE 4: BENTO GRID ECOSYSTEM
          ======================================================================= */}
      <section className="w-full max-w-7xl mx-auto px-6 py-24 z-10 relative">
        <div className="mb-20 flex flex-col md:flex-row justify-between items-end gap-8">
          <div>
            <h2 className="font-serif text-5xl md:text-7xl font-normal text-white leading-tight">
              A Unified <span className="italic bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">Ecosystem.</span>
            </h2>
          </div>
        </div>

        <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} className="grid grid-cols-1 md:grid-cols-12 auto-rows-[450px] gap-6">
          {FEATURES_DATA.map((feature, i) => (
            <motion.div 
              key={i} variants={{ hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } } }}
              className={`${feature.colSpan} bg-[#0a0a0a] border border-white/5 hover:border-white/20 rounded-[2rem] p-10 relative overflow-hidden group transition-colors duration-500 flex flex-col justify-between`}
            >
              <div className={`absolute -top-32 -right-32 w-96 h-96 bg-${feature.color}-500/10 blur-[100px] rounded-full group-hover:bg-${feature.color}-500/20 transition-all duration-700`} />
              <div className="relative z-10">
                <feature.icon size={36} className={`text-${feature.color}-400 mb-8`} />
                <h3 className="font-serif text-4xl text-white mb-4">{feature.title}</h3>
                <p className="font-sans text-[#888888] text-base leading-relaxed max-w-md">{feature.desc}</p>
              </div>
              <Link href={feature.link} className="relative z-10 inline-flex items-center gap-2 font-sans text-xs tracking-widest text-white uppercase group-hover:text-cyan-400 transition-colors">
                {feature.action} <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* =======================================================================
          ZONE 5: ALGORITHMIC WORKFLOW
          ======================================================================= */}
      <section className="w-full max-w-7xl mx-auto px-6 py-32 z-10 relative">
        <div className="bg-white/[0.02] backdrop-blur-2xl rounded-[3rem] p-10 md:p-24 border border-white/5 relative overflow-hidden">
          <div className="text-center mb-24 relative z-10">
            <h2 className="font-serif text-4xl md:text-6xl text-white mb-4">The Architecture.</h2>
            <p className="font-sans text-[#888888] text-lg max-w-xl mx-auto">Three phases to completely overhaul your personal aesthetic.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 relative z-10">
            {WORKFLOW_STEPS.map((item, i) => (
              <motion.div 
                key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.2, duration: 0.8 }}
                className="flex flex-col relative group"
              >
                {i !== 2 && <div className="hidden md:block absolute top-12 left-[60%] w-[120%] h-[1px] bg-gradient-to-r from-white/20 to-transparent z-0" />}
                <div className="w-24 h-24 rounded-[2rem] bg-black border border-white/10 flex items-center justify-center mb-8 relative z-10 group-hover:border-cyan-500/50 transition-colors duration-500 shadow-2xl">
                  <span className="absolute -top-4 -left-4 font-serif text-sm italic text-cyan-400 bg-[#030303] px-3 py-1 rounded-lg border border-white/10">{item.step}</span>
                  <item.icon size={36} className="text-[#e2e2e2]" />
                </div>
                <h4 className="font-serif text-3xl text-white mb-4">{item.title}</h4>
                <p className="font-sans text-[#888888] text-base leading-relaxed pr-8">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* =======================================================================
          ZONE 6: PRICING (Monetization Hub)
          ======================================================================= */}
      <section className="w-full max-w-7xl mx-auto px-6 py-32 z-10 relative">
        <div className="text-center mb-20">
          <h2 className="font-serif text-5xl md:text-6xl text-white mb-6">Invest in your Identity.</h2>
          <p className="font-sans text-[#888888] text-lg max-w-2xl mx-auto">Transparent pricing for access to the world's most advanced styling engine.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PRICING_TIERS.map((tier, i) => (
            <motion.div 
              key={i} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15, duration: 0.8 }}
              className={`glass-pill rounded-[2rem] p-10 flex flex-col justify-between relative overflow-hidden ${tier.popular ? 'border-cyan-500/30 scale-105 shadow-[0_0_50px_rgba(34,211,238,0.1)]' : 'border-white/5'}`}
            >
              {tier.popular && <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-purple-500 to-cyan-500" />}
              <div>
                <h3 className="font-sans text-xs tracking-widest text-[#888888] uppercase mb-4">{tier.name}</h3>
                <div className="mb-6 flex items-baseline gap-2">
                  <span className="font-serif text-6xl text-white">{tier.price}</span>
                  {tier.period && <span className="font-sans text-[#666666]">{tier.period}</span>}
                </div>
                <p className="font-sans text-[#888888] text-sm leading-relaxed mb-8 h-10">{tier.desc}</p>
                <ul className="space-y-4 mb-12">
                  {tier.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-3 font-sans text-sm text-[#e2e2e2]">
                      <Check size={16} className="text-cyan-400 shrink-0 mt-0.5" />
                      {feat}
                    </li>
                  ))}
                </ul>
              </div>
              <button className={`w-full py-4 rounded-full font-sans text-sm font-semibold tracking-widest uppercase transition-all duration-300 ${tier.popular ? 'bg-white text-black hover:bg-gray-200' : 'bg-transparent text-white border border-white/20 hover:bg-white/10'}`}>
                {tier.cta}
              </button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* =======================================================================
          ZONE 7: INTERACTIVE FAQ
          ======================================================================= */}
      <section className="w-full max-w-4xl mx-auto px-6 py-32 z-10 relative border-t border-white/5">
        <div className="text-center mb-16">
          <h2 className="font-serif text-5xl text-white">System Queries.</h2>
        </div>
        <div className="border-t border-white/10">
          {FAQS.map((faq, i) => (
            <AccordionItem 
              key={i} faq={faq} 
              isOpen={activeFaq === i} onClick={() => setActiveFaq(activeFaq === i ? null : i)} 
            />
          ))}
        </div>
      </section>

      {/* =======================================================================
          ZONE 8: MASSIVE FOOTER
          ======================================================================= */}
      <footer className="w-full border-t border-white/5 bg-[#030303] pt-32 pb-12 px-6 relative z-10 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-cyan-900/10 blur-[150px] rounded-full pointer-events-none" />
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-24 relative z-10">
            <div className="col-span-1 md:col-span-2">
              <h2 className="font-serif text-4xl text-white mb-6 flex items-center gap-2">
                Style<span className="italic text-gradient-neon">Savvy</span>
              </h2>
              <p className="font-sans text-[#888888] text-sm leading-relaxed max-w-sm mb-8">
                The leading neural architecture for personal aesthetics. Digitize your physical wardrobe and visualize the future of fashion.
              </p>
              <div className="flex gap-4">
                {[Globe, MessageCircle, Share2, Mail].map((Icon, i) => (
                  <Link key={i} href="#" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-[#888888] hover:text-white hover:border-white/30 transition-all">
                    <Icon size={16} />
                  </Link>
                ))}
              </div>
            </div>
            
            <div className="col-span-1">
              <h4 className="font-sans text-xs tracking-widest text-white uppercase mb-6">Ecosystem</h4>
              <ul className="space-y-4 font-sans text-sm text-[#888888]">
                {["Neural Engine", "3D Roomspace", "Smart Wardrobe", "Trend Radar", "Pricing"].map((link, i) => (
                  <li key={i}><Link href="#" className="hover:text-cyan-400 transition-colors">{link}</Link></li>
                ))}
              </ul>
            </div>

            <div className="col-span-1">
              <h4 className="font-sans text-xs tracking-widest text-white uppercase mb-6">Company</h4>
              <ul className="space-y-4 font-sans text-sm text-[#888888]">
                {["About the Team", "Careers", "Privacy Policy", "Terms of Service", "Contact"].map((link, i) => (
                  <li key={i}><Link href="#" className="hover:text-cyan-400 transition-colors">{link}</Link></li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 relative z-10">
            <p className="font-sans text-xs text-[#555555]">© 2026 StyleSavvy Engine. All rights reserved.</p>
            <p className="font-sans text-xs text-[#555555] flex items-center gap-1">
              Operated from <span className="text-white">Kapriwas, Haryana</span> <Sparkles size={10} className="text-cyan-400"/>
            </p>
          </div>
        </div>
      </footer>

    </main>
  );
}