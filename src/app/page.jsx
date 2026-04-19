"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  motion, useScroll, useTransform, useSpring,
  useInView, AnimatePresence,
} from "framer-motion";
import Link from "next/link";
import {
  ArrowRight, Sparkles, Box, Shirt, Layers, Cpu,
  Activity, Star, Check, Play,
  Globe, MessageCircle, Share2, Mail, Quote,
  Zap, TrendingUp, Shield, Users, Award,
  Wand2, Camera, BarChart2,
  Palette, Heart, Clock, ChevronRight,
} from "lucide-react";

/* ═══════════════════════════════════════════
   DESIGN TOKENS
═══════════════════════════════════════════ */
const C = {
  bg:      "#030307",
  surface: "#07070e",
  border:  "rgba(255,255,255,0.06)",
  purple:  "#9b6dff",
  cyan:    "#00d4c8",
  pink:    "#ff6bde",
  amber:   "#f0a030",
  text:    "#eceaf4",
  muted:   "#7a7a94",
  low:     "#363650",
  display: "'Playfair Display', Georgia, serif",
  sans:    "'DM Sans', system-ui, sans-serif",
};

const ease = [0.16, 1, 0.3, 1];

/* ═══════════════════════════════════════════
   DATA
═══════════════════════════════════════════ */
const BRANDS = [
  "ZARA","H&M","MYNTRA","SSENSE","FARFETCH","ASOS","UNIQLO",
  "PRADA","GUCCI","BALENCIAGA","LOEWE","BOTTEGA","COS","ARKET",
  "MANGO","MASSIMO DUTTI","NET-A-PORTER","SSENSE",
];

const BENTO = [
  {
    id:"neural", title:"Neural Engine", tag:"Core AI", icon:Cpu,
    col:"lg:col-span-7", color:C.purple, glow:`rgba(155,109,255,0.09)`,
    desc:"Deep-learning decodes body geometry and skin undertone to engineer hyper-personalised outfits. Learns your style DNA and evolves with every session.",
    stats:[{label:"Accuracy",val:"99.2%"},{label:"Combinations",val:"2M+"}],
  },
  {
    id:"roomspace", title:"3D Roomspace", tag:"WebGL", icon:Box,
    col:"lg:col-span-5", color:C.cyan, glow:`rgba(0,212,200,0.07)`,
    desc:"A real-time WebGL canvas renders a 3D mannequin. Dress it, spin it 360°, visualise every look before you wear it.",
    stats:[{label:"Frame Rate",val:"60fps"},{label:"Bodies",val:"2"}],
  },
  {
    id:"wardrobe", title:"Digital Wardrobe", tag:"Drag & Drop", icon:Shirt,
    col:"lg:col-span-5", color:"#e0e0e0", glow:`rgba(224,224,224,0.05)`,
    desc:"Upload your closet. Remix outfits and discover combinations perfectly mapped to your geometry and colour palette.",
    stats:[{label:"Items",val:"Unlimited"},{label:"Outfits",val:"∞"}],
  },
  {
    id:"radar", title:"Trend Radar", tag:"Market Sync", icon:Activity,
    col:"lg:col-span-7", color:C.pink, glow:`rgba(255,107,222,0.07)`,
    desc:"Real-time price comparisons across 50+ premium retailers. Instant alerts when a piece perfectly matching your profile drops globally.",
    stats:[{label:"Retailers",val:"50+"},{label:"Avg savings",val:"₹4.2K"}],
  },
];

const WORKFLOW = [
  {
    step:"01", icon:Camera, title:"Calibrate Matrix",
    short:"Upload a photo or enter measurements",
    desc:"Precision body geometry, skin undertone, and fit preference captured in seconds via GPT-4o Vision or manual entry.",
    color:C.purple,
  },
  {
    step:"02", icon:Shirt, title:"Digitize Assets",
    short:"Photograph your physical wardrobe",
    desc:"Computer vision catalogues every garment — colour, fabric, silhouette — building your modular 2D inventory.",
    color:C.cyan,
  },
  {
    step:"03", icon:Wand2, title:"Synthesize Fits",
    short:"AI renders perfect outfit permutations",
    desc:"The engine tests millions of combinations, surfaces only mathematically optimal outfits for your exact geometry and the occasion.",
    color:C.pink,
  },
  {
    step:"04", icon:BarChart2, title:"Shop Intelligently",
    short:"Price alerts across 50+ global retailers",
    desc:"Get notified the moment a wish-list piece drops in price. Affiliate links route through our price comparison engine.",
    color:C.amber,
  },
];

const STATS = [
  {val:"2M+",  label:"Outfits Generated",    icon:Layers,    color:C.purple},
  {val:"50K+", label:"Active Wardrobes",      icon:Users,     color:C.cyan},
  {val:"98%",  label:"Style Score Accuracy",  icon:Award,     color:C.pink},
  {val:"4.2K", label:"₹ Avg Annual Savings",  icon:TrendingUp,color:C.amber},
];

const FEATURES = [
  {icon:Zap,       title:"Instant AI Analysis",  desc:"Full style profile in under 30 seconds via GPT-4o Vision.", color:C.purple},
  {icon:Shield,    title:"Private by Design",    desc:"All biometric data encrypted. Never sold, never shared.",    color:C.cyan},
  {icon:Palette,   title:"Seasonal Updates",     desc:"Engine refreshes weekly against global runway trend data.",   color:C.pink},
  {icon:Heart,     title:"Personal Evolution",   desc:"Style DNA evolves as you save outfits and rate suggestions.", color:C.amber},
  {icon:Clock,     title:"Speed to Dress",       desc:"Decision fatigue eliminated. Perfect outfit in 3 taps.",      color:"#10b981"},
  {icon:Globe,     title:"Global Retail Access", desc:"50+ retailers across India, UK, US, and EU in one feed.",     color:"#60a5fa"},
];

const REVIEWS = [
  {text:"StyleSavvy redefined how I perceive my geometry. I'm dressing with absolute mathematical confidence now.",author:"Elena R.",role:"Creative Director",rating:5,avatar:"ER",color:C.purple},
  {text:"The price-drop radar paid for the Pro subscription in three days. The 3D Roomspace is the future of retail.",author:"Marcus T.",role:"Software Engineer",rating:5,avatar:"MT",color:C.cyan},
  {text:"Finally an AI that understands colour theory. It maps my Deep Winter undertone to current runway trends with frightening accuracy.",author:"Sarah K.",role:"Fashion Editor",rating:5,avatar:"SK",color:C.pink},
  {text:"I used to spend 45 minutes choosing outfits. Now it's under 2 minutes and I look considerably better.",author:"Arjun M.",role:"Product Designer",rating:5,avatar:"AM",color:C.amber},
];

const PRICING = [
  {
    name:"Standard", price:"Free", sub:"Forever free", color:C.muted,
    features:["AI style profile (manual)","Wardrobe up to 30 items","3 outfit formulas / month","Basic trend alerts"],
    cta:"Start Free", href:"/signup",
  },
  {
    name:"Pro", price:"₹499", sub:"per month", color:C.purple, featured:true,
    features:["GPT-4o photo scan","Unlimited wardrobe items","Unlimited outfit formulas","DALL-E 3 visualisations","Price-drop radar","3D Roomspace"],
    cta:"Start Pro", href:"/signup?plan=pro",
  },
  {
    name:"Elite", price:"₹1,299", sub:"per month", color:C.amber,
    features:["Everything in Pro","Personal style consultancy","Priority AI queue","Affiliate cashback","Early feature access"],
    cta:"Go Elite", href:"/signup?plan=elite",
  },
];

/* ═══════════════════════════════════════════
   UTILITIES
═══════════════════════════════════════════ */

/* Custom cursor – client-only */
function CustomCursor() {
  const [pos, setPos] = useState({x:-200,y:-200});
  const [big, setBig] = useState(false);
  useEffect(() => {
    const move = (e) => setPos({x:e.clientX,y:e.clientY});
    const over  = (e) => setBig(!!e.target.closest("a,button,[data-hover]"));
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseover", over);
    return () => { window.removeEventListener("mousemove", move); window.removeEventListener("mouseover", over); };
  }, []);
  return (
    <motion.div
      className="fixed top-0 left-0 pointer-events-none z-[200] hidden md:block rounded-full"
      animate={{ x: pos.x - (big ? 22 : 8), y: pos.y - (big ? 22 : 8), width: big ? 44 : 16, height: big ? 44 : 16 }}
      transition={{ type:"spring", stiffness:500, damping:28, mass:0.3 }}
      style={{
        border: `1.5px solid ${big ? C.cyan : "rgba(155,109,255,0.55)"}`,
        background: big ? "rgba(0,212,200,0.07)" : "transparent",
        mixBlendMode: "screen",
      }}
    />
  );
}

/* Scroll progress bar – FIX: use style prop, not css prop */
function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness:100, damping:30 });
  return (
    <motion.div
      style={{ scaleX, transformOrigin:"left", background:`linear-gradient(90deg,${C.purple},${C.cyan},${C.pink})` }}
      className="fixed top-0 left-0 right-0 h-[2px] z-[150]"
    />
  );
}

/* Glow card with mouse-tracking radial */
function GlowCard({ children, color=C.purple, className="", style={} }) {
  const [gp, setGp] = useState({x:50,y:50});
  const [on, setOn] = useState(false);
  const ref = useRef(null);
  const track = useCallback((e) => {
    const r = ref.current.getBoundingClientRect();
    setGp({ x:((e.clientX-r.left)/r.width)*100, y:((e.clientY-r.top)/r.height)*100 });
  }, []);
  return (
    <div ref={ref} onMouseMove={track} onMouseEnter={()=>setOn(true)} onMouseLeave={()=>setOn(false)}
      className={`relative overflow-hidden transition-all duration-300 ${className}`}
      style={{
        border: `1px solid ${on ? color+"30" : C.border}`,
        boxShadow: on ? `0 0 40px ${color}12` : "none",
        transition: "border-color 0.3s, box-shadow 0.3s",
        ...style,
      }}
    >
      {on && (
        <div className="absolute inset-0 pointer-events-none" style={{
          background:`radial-gradient(200px circle at ${gp.x}% ${gp.y}%, ${color}16, transparent 70%)`,
        }}/>
      )}
      {children}
    </div>
  );
}

/* Section badge */
function SectionBadge({children}) {
  return (
    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] uppercase tracking-[0.22em] mb-6"
      style={{ background:`${C.purple}14`, border:`1px solid ${C.purple}30`, color:C.purple, fontFamily:C.sans, fontWeight:600 }}>
      <Sparkles size={9}/>{children}
    </span>
  );
}

/* Fade-up reveal */
function FadeUp({children,delay=0,y=28,className=""}) {
  const ref = useRef(null);
  const inView = useInView(ref, {once:true, margin:"-60px"});
  return (
    <motion.div ref={ref}
      initial={{opacity:0,y}} animate={inView?{opacity:1,y:0}:{}}
      transition={{duration:0.85, delay, ease}}
      className={className}>
      {children}
    </motion.div>
  );
}

/* Animated counter */
function Counter({to}) {
  const ref = useRef(null);
  const inView = useInView(ref, {once:true});
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const raw = to.replace(/[^0-9.]/g,"");
    const num = parseFloat(raw);
    if (isNaN(num)) { setVal(to); return; }
    let i = 0;
    const steps = 60;
    const iv = setInterval(() => {
      i++;
      setVal(Math.min(num * i/steps, num));
      if (i >= steps) clearInterval(iv);
    }, 18);
    return () => clearInterval(iv);
  }, [inView, to]);
  const prefix = to.replace(/[0-9.,+%K₹M∞]+.*/, "");
  const suffix = to.replace(/^[^0-9]*[0-9.,]+/, "");
  const display = typeof val === "string" ? val : (suffix.includes(".") ? val.toFixed(1) : Math.round(val).toLocaleString());
  return <span ref={ref}>{prefix}{display}{suffix}</span>;
}

/* Magnetic wrapper */
function Magnetic({children}) {
  const ref = useRef(null);
  const [p, setP] = useState({x:0,y:0});
  return (
    <motion.div ref={ref}
      onMouseMove={e => {
        const r = ref.current.getBoundingClientRect();
        setP({ x:(e.clientX-(r.left+r.width/2))*0.22, y:(e.clientY-(r.top+r.height/2))*0.22 });
      }}
      onMouseLeave={() => setP({x:0,y:0})}
      animate={p} transition={{type:"spring",stiffness:140,damping:14,mass:0.08}}
    >
      {children}
    </motion.div>
  );
}

/* Infinite marquee – pure CSS animation, no useAnimationFrame */
function Marquee({items, reverse=false}) {
  return (
    <div className="flex overflow-hidden select-none">
      <div className={`flex shrink-0 gap-16 pr-16 ${reverse?"animate-marquee-rev":"animate-marquee"}`}>
        {[...items,...items].map((b,i) => (
          <span key={i} className="text-xl font-bold tracking-[0.18em] uppercase whitespace-nowrap shrink-0 transition-colors duration-300"
            style={{color:C.low, fontFamily:C.sans}}
            onMouseEnter={e=>e.currentTarget.style.color=C.muted}
            onMouseLeave={e=>e.currentTarget.style.color=C.low}>
            {b}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   HERO
═══════════════════════════════════════════ */
function HeroSection() {
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0,500], [1,0]);
  const y       = useTransform(scrollY, [0,500], [0,70]);

  return (
    <motion.section style={{opacity,y}}
      className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-28 pb-16 z-10">
      {/* ambient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div animate={{scale:[1,1.12,1],rotate:[0,120,0]}} transition={{duration:28,repeat:Infinity,ease:"linear"}}
          className="absolute top-[-15%] left-1/2 -translate-x-1/2 w-[80vw] h-[80vw] max-w-[900px] max-h-[900px] rounded-full"
          style={{background:`radial-gradient(circle,${C.purple}10 0%,${C.cyan}06 40%,transparent 70%)`,filter:"blur(80px)"}}/>
        <motion.div animate={{scale:[1,1.08,1],x:[0,40,0]}} transition={{duration:18,repeat:Infinity,ease:"easeInOut",delay:4}}
          className="absolute bottom-0 right-[-10%] w-[60vw] h-[60vw] max-w-[700px] max-h-[700px] rounded-full"
          style={{background:`radial-gradient(circle,${C.cyan}08 0%,transparent 65%)`,filter:"blur(100px)"}}/>
        <motion.div animate={{scale:[1,1.1,1],x:[0,-30,0]}} transition={{duration:22,repeat:Infinity,ease:"easeInOut",delay:8}}
          className="absolute top-[30%] left-[-5%] w-[50vw] h-[50vw] max-w-[600px] rounded-full"
          style={{background:`radial-gradient(circle,${C.pink}07 0%,transparent 65%)`,filter:"blur(90px)"}}/>
      </div>

      {/* grid */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.018]"
        style={{backgroundImage:`linear-gradient(rgba(255,255,255,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.5) 1px,transparent 1px)`,backgroundSize:"80px 80px"}}/>

      <div className="relative max-w-5xl mx-auto flex flex-col items-center">
        {/* badge */}
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.9}} className="mb-8">
          <span className="relative inline-flex items-center gap-3 px-6 py-2.5 rounded-full text-[10px] uppercase tracking-[0.26em]"
            style={{background:"rgba(0,0,0,0.55)",border:"1px solid rgba(255,255,255,0.1)",color:"#c8c8dc",backdropFilter:"blur(12px)",fontFamily:C.sans}}>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute h-full w-full rounded-full opacity-75" style={{background:C.cyan}}/>
              <span className="relative h-2 w-2 rounded-full" style={{background:C.cyan}}/>
            </span>
            Style Architecture Engine v2.0
          </span>
        </motion.div>

        {/* H1 */}
        <motion.h1 initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} transition={{duration:1,delay:0.15,ease}}
          className="leading-[1.04] mb-6 tracking-tight"
          style={{fontFamily:C.display, fontSize:"clamp(48px,7vw,96px)", fontWeight:600, color:C.text}}>
          Intelligence in{" "}
          <br className="hidden sm:block"/>
          <span style={{background:`linear-gradient(135deg,#ffffff 0%,#c0c0d0 50%,#888 100%)`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",fontStyle:"italic"}}>
            Every Thread.
          </span>
        </motion.h1>

        {/* sub */}
        <motion.p initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.9,delay:0.3,ease}}
          className="text-base sm:text-lg leading-relaxed mb-10 max-w-xl"
          style={{color:C.muted, fontFamily:C.sans}}>
          Digitize your physical wardrobe, enter the immersive 3D Roomspace, and let our neural engine curate fits mathematically scaled to your exact geometry.
        </motion.p>

        {/* CTAs */}
        <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{duration:0.9,delay:0.45,ease}}
          className="flex flex-col sm:flex-row items-center gap-4 mb-14">
          <Magnetic>
            <Link href="/stylist" data-hover
              className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-full text-sm font-semibold tracking-widest uppercase overflow-hidden"
              style={{background:"#ffffff",color:"#000",fontFamily:C.sans,boxShadow:"0 0 30px rgba(255,255,255,0.1)"}}>
              <span className="absolute inset-0 translate-x-[-110%] group-hover:translate-x-[110%] transition-transform duration-700"
                style={{background:"linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent)"}}/>
              Initialize Profile
              <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform"/>
            </Link>
          </Magnetic>
          <Link href="/roomspace" data-hover
            className="group inline-flex items-center gap-3 px-8 py-4 rounded-full text-sm font-semibold tracking-widest uppercase transition-all duration-300"
            style={{border:"1px solid rgba(255,255,255,0.14)",color:C.text,fontFamily:C.sans,background:"transparent"}}
            onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,0.05)";e.currentTarget.style.borderColor="rgba(255,255,255,0.26)";}}
            onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.borderColor="rgba(255,255,255,0.14)";}}>
            <Play size={13} style={{color:C.cyan}} className="group-hover:scale-110 transition-transform"/>
            Watch Demo
          </Link>
        </motion.div>

        {/* social proof */}
        <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.9,duration:0.8}}
          className="flex flex-col sm:flex-row items-center gap-6">
          <div className="flex -space-x-2.5">
            {["ER","MT","SK","AM","JP"].map((ini,i) => (
              <div key={i} className="w-8 h-8 rounded-full flex items-center justify-center text-[9px] font-bold border-2"
                style={{background:[C.purple,C.cyan,C.pink,C.amber,"#10b981"][i]+"25",borderColor:C.bg,color:[C.purple,C.cyan,C.pink,C.amber,"#10b981"][i],fontFamily:C.sans,zIndex:5-i}}>
                {ini}
              </div>
            ))}
          </div>
          <div>
            <div className="flex gap-0.5 mb-1">{[1,2,3,4,5].map(s=><Star key={s} size={11} fill={C.amber} style={{color:C.amber}}/>)}</div>
            <p className="text-xs" style={{color:C.low,fontFamily:C.sans}}>Trusted by <span style={{color:C.muted}}>50,000+</span> style architects</p>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}

/* ═══════════════════════════════════════════
   MARQUEE
═══════════════════════════════════════════ */
function MarqueeSection() {
  return (
    <div className="relative border-y py-5 overflow-hidden z-10"
      style={{borderColor:C.border, background:"rgba(7,7,14,0.7)", backdropFilter:"blur(12px)"}}>
      <p className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-[9px] uppercase tracking-[0.2em]"
        style={{color:C.low, fontFamily:C.sans}}>Sourcing</p>
      <div className="opacity-50 hover:opacity-100 transition-opacity duration-500">
        <Marquee items={BRANDS}/>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   STATS
═══════════════════════════════════════════ */
function StatsSection() {
  return (
    <section className="relative z-10 border-b py-20 px-6" style={{borderColor:C.border}}>
      <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-5">
        {STATS.map((s,i) => (
          <FadeUp key={i} delay={i*0.08}>
            <GlowCard color={s.color} className="rounded-2xl p-6" style={{background:"rgba(8,8,15,0.85)"}}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                style={{background:s.color+"18",border:`1px solid ${s.color}28`}}>
                <s.icon size={18} style={{color:s.color}}/>
              </div>
              <div className="text-3xl font-bold mb-1 tabular-nums" style={{fontFamily:C.sans,color:C.text}}>
                <Counter to={s.val}/>
              </div>
              <p className="text-xs uppercase tracking-[0.14em]" style={{color:C.low,fontFamily:C.sans}}>{s.label}</p>
            </GlowCard>
          </FadeUp>
        ))}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   BENTO GRID
═══════════════════════════════════════════ */
function BentoSection() {
  return (
    <section className="relative z-10 py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <FadeUp className="mb-16">
          <SectionBadge>System Architecture</SectionBadge>
          <h2 className="text-5xl md:text-6xl font-semibold tracking-tight leading-tight" style={{fontFamily:C.display,color:C.text}}>
            A Unified{" "}
            <span style={{background:`linear-gradient(135deg,${C.purple},${C.cyan})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>
              Ecosystem.
            </span>
          </h2>
        </FadeUp>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {BENTO.map((feat,i) => (
            <motion.div key={feat.id}
              initial={{opacity:0,y:40,scale:0.97}} whileInView={{opacity:1,y:0,scale:1}}
              viewport={{once:true,margin:"-60px"}} transition={{delay:i*0.1,duration:0.8,ease}}
              className={feat.col}>
              <GlowCard color={feat.color} className="h-full rounded-[2rem] p-8 flex flex-col justify-between overflow-hidden group min-h-[320px]"
                style={{background:"rgba(8,8,15,0.92)"}}>
                {/* background glow */}
                <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                  style={{background:`radial-gradient(60% 60% at 80% 20%,${feat.glow},transparent)`}}/>

                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                      style={{background:feat.color+"18",border:`1px solid ${feat.color}28`}}>
                      <feat.icon size={22} style={{color:feat.color}}/>
                    </div>
                    <span className="text-[9px] uppercase tracking-widest px-3 py-1 rounded-full"
                      style={{background:feat.color+"12",border:`1px solid ${feat.color}28`,color:feat.color,fontFamily:C.sans,fontWeight:600}}>
                      {feat.tag}
                    </span>
                  </div>
                  <h3 className="text-2xl font-semibold tracking-tight mb-3" style={{fontFamily:C.display,color:C.text}}>{feat.title}</h3>
                  <p className="text-sm leading-relaxed" style={{color:C.muted,fontFamily:C.sans}}>{feat.desc}</p>
                </div>

                <div className="relative z-10 mt-8">
                  <div className="flex gap-6 mb-5">
                    {feat.stats.map((st,si) => (
                      <div key={si}>
                        <p className="text-lg font-bold" style={{fontFamily:C.sans,color:feat.color}}>{st.val}</p>
                        <p className="text-[10px] uppercase tracking-wider" style={{color:C.low,fontFamily:C.sans}}>{st.label}</p>
                      </div>
                    ))}
                  </div>
                  <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest cursor-pointer transition-opacity hover:opacity-70"
                    style={{color:feat.color,fontFamily:C.sans}}>
                    Explore <ArrowRight size={12}/>
                  </div>
                </div>
              </GlowCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   WORKFLOW — FIX: no sticky/scroll-pin, just
   plain vertically stacked steps with a
   connector line and scroll-reveal per card.
═══════════════════════════════════════════ */
function WorkflowSection() {
  return (
    <section className="relative z-10 py-32 px-6 border-t" style={{borderColor:C.border}}>
      <div className="max-w-7xl mx-auto">
        <FadeUp className="text-center mb-20">
          <SectionBadge>The Process</SectionBadge>
          <h2 className="text-5xl md:text-6xl font-semibold tracking-tight" style={{fontFamily:C.display,color:C.text}}>
            The Logic.
          </h2>
          <p className="text-base mt-4 max-w-lg mx-auto" style={{color:C.muted,fontFamily:C.sans}}>
            Four operational phases to completely overhaul your personal aesthetic.
          </p>
        </FadeUp>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {WORKFLOW.map((step,i) => (
            <FadeUp key={step.step} delay={i*0.1}>
              <GlowCard color={step.color} className="rounded-[1.75rem] p-8 h-full" style={{background:"rgba(8,8,15,0.92)"}}>
                {/* step header */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                    style={{background:step.color+"18",border:`1px solid ${step.color}28`}}>
                    <step.icon size={22} style={{color:step.color}}/>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-full"
                    style={{background:step.color+"14",color:step.color,fontFamily:C.sans}}>
                    Step {step.step}
                  </span>
                </div>

                <h3 className="text-2xl font-semibold tracking-tight mb-2" style={{fontFamily:C.display,color:C.text}}>
                  {step.title}
                </h3>
                <p className="text-sm font-medium mb-3" style={{color:step.color,fontFamily:C.sans}}>
                  {step.short}
                </p>
                <p className="text-sm leading-relaxed" style={{color:C.muted,fontFamily:C.sans}}>
                  {step.desc}
                </p>

                {/* progress bar */}
                <div className="mt-6">
                  <div className="flex justify-between mb-1.5">
                    <span className="text-[10px] uppercase tracking-widest" style={{color:C.low,fontFamily:C.sans}}>Phase progress</span>
                    <span className="text-[10px]" style={{color:step.color,fontFamily:C.sans}}>{((i+1)/WORKFLOW.length*100).toFixed(0)}%</span>
                  </div>
                  <div className="h-1 rounded-full overflow-hidden" style={{background:"rgba(255,255,255,0.06)"}}>
                    <motion.div
                      initial={{width:0}} whileInView={{width:`${(i+1)/WORKFLOW.length*100}%`}}
                      viewport={{once:true}} transition={{duration:1,delay:0.2,ease}}
                      className="h-full rounded-full" style={{background:step.color}}/>
                  </div>
                </div>
              </GlowCard>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   FEATURES GRID
═══════════════════════════════════════════ */
function FeaturesSection() {
  return (
    <section className="relative z-10 py-32 px-6" style={{background:"rgba(5,5,11,0.6)"}}>
      <div className="max-w-7xl mx-auto">
        <FadeUp className="text-center mb-16">
          <SectionBadge>Why StyleSavvy</SectionBadge>
          <h2 className="text-5xl md:text-6xl font-semibold tracking-tight" style={{fontFamily:C.display,color:C.text}}>
            Built Different.
          </h2>
        </FadeUp>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((feat,i) => (
            <FadeUp key={i} delay={i*0.07}>
              <GlowCard color={feat.color} className="rounded-2xl p-6 h-full" style={{background:"rgba(8,8,15,0.9)"}}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{background:feat.color+"18",border:`1px solid ${feat.color}25`}}>
                  <feat.icon size={18} style={{color:feat.color}}/>
                </div>
                <h4 className="text-base font-semibold mb-2" style={{fontFamily:C.sans,color:C.text}}>{feat.title}</h4>
                <p className="text-sm leading-relaxed" style={{color:C.muted,fontFamily:C.sans}}>{feat.desc}</p>
              </GlowCard>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   TESTIMONIALS
═══════════════════════════════════════════ */
function TestimonialsSection() {
  return (
    <section className="relative z-10 py-32 px-6 border-t" style={{borderColor:C.border}}>
      <div className="max-w-7xl mx-auto">
        <FadeUp className="mb-16 flex items-end justify-between flex-wrap gap-6">
          <div>
            <SectionBadge>Social Proof</SectionBadge>
            <h2 className="text-5xl font-semibold tracking-tight" style={{fontFamily:C.display,color:C.text}}>The Consensus.</h2>
          </div>
          <div className="flex items-center gap-2">
            {[1,2,3,4,5].map(s=><Star key={s} size={16} fill={C.amber} style={{color:C.amber}}/>)}
            <span className="text-sm ml-2" style={{color:C.muted,fontFamily:C.sans}}>4.9 / 5.0</span>
          </div>
        </FadeUp>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {REVIEWS.map((r,i) => (
            <FadeUp key={i} delay={i*0.09}>
              <GlowCard color={r.color} className="rounded-[1.5rem] p-7 h-full flex flex-col justify-between" style={{background:"rgba(8,8,15,0.9)"}}>
                <div>
                  <Quote size={28} style={{color:r.color+"30"}} className="mb-4"/>
                  <div className="flex gap-0.5 mb-4">{[1,2,3,4,5].map(s=><Star key={s} size={11} fill={C.amber} style={{color:C.amber}}/>)}</div>
                  <p className="text-sm leading-relaxed mb-6" style={{color:"#d0d0e0",fontFamily:C.sans}}>"{r.text}"</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-[10px] font-bold"
                    style={{background:r.color+"20",border:`1px solid ${r.color}30`,color:r.color,fontFamily:C.sans}}>
                    {r.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{color:C.text,fontFamily:C.sans}}>{r.author}</p>
                    <p className="text-[10px] uppercase tracking-widest" style={{color:C.low,fontFamily:C.sans}}>{r.role}</p>
                  </div>
                </div>
              </GlowCard>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   PRICING
═══════════════════════════════════════════ */
function PricingSection() {
  return (
    <section className="relative z-10 py-32 px-6" style={{background:"rgba(5,5,11,0.65)"}}>
      <div className="max-w-5xl mx-auto">
        <FadeUp className="text-center mb-16">
          <SectionBadge>Pricing</SectionBadge>
          <h2 className="text-5xl font-semibold tracking-tight mb-4" style={{fontFamily:C.display,color:C.text}}>Simple Tiers.</h2>
          <p className="text-base" style={{color:C.muted,fontFamily:C.sans}}>Start free. Upgrade when you're ready.</p>
        </FadeUp>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PRICING.map((plan,i) => (
            <FadeUp key={plan.name} delay={i*0.1}>
              <div className="relative rounded-[1.5rem] p-7 h-full flex flex-col"
                style={{
                  background: plan.featured ? `linear-gradient(145deg,${C.purple}16,rgba(8,8,15,0.98))` : "rgba(8,8,15,0.9)",
                  border: `1px solid ${plan.featured ? C.purple+"38" : C.border}`,
                  boxShadow: plan.featured ? `0 0 60px ${C.purple}14` : "none",
                }}>
                {plan.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[9px] font-bold uppercase tracking-[0.2em]"
                    style={{background:C.purple,color:"#fff",fontFamily:C.sans}}>
                    Most Popular
                  </div>
                )}

                <div className="mb-6">
                  <p className="text-[10px] uppercase tracking-[0.2em] mb-2" style={{color:plan.color,fontFamily:C.sans,fontWeight:600}}>{plan.name}</p>
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-bold" style={{fontFamily:C.sans,color:C.text}}>{plan.price}</span>
                    {plan.price!=="Free" && <span className="text-xs pb-1.5" style={{color:C.low,fontFamily:C.sans}}>/ mo</span>}
                  </div>
                  <p className="text-xs mt-1" style={{color:C.low,fontFamily:C.sans}}>{plan.sub}</p>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f,fi) => (
                    <li key={fi} className="flex items-start gap-2.5">
                      <Check size={13} style={{color:plan.featured?C.purple:C.muted,marginTop:1,flexShrink:0}}/>
                      <span className="text-xs" style={{color:C.muted,fontFamily:C.sans,lineHeight:1.6}}>{f}</span>
                    </li>
                  ))}
                </ul>

                <Link href={plan.href} data-hover
                  className="block text-center py-3 rounded-xl text-sm font-semibold tracking-wider uppercase transition-all duration-200"
                  style={{
                    background: plan.featured ? C.purple : "rgba(255,255,255,0.05)",
                    color: plan.featured ? "#fff" : C.muted,
                    border: plan.featured ? "none" : `1px solid ${C.border}`,
                    fontFamily: C.sans,
                  }}
                  onMouseEnter={e => { if(!plan.featured){e.currentTarget.style.background="rgba(255,255,255,0.09)";e.currentTarget.style.color=C.text;} else e.currentTarget.style.opacity="0.85"; }}
                  onMouseLeave={e => { if(!plan.featured){e.currentTarget.style.background="rgba(255,255,255,0.05)";e.currentTarget.style.color=C.muted;} else e.currentTarget.style.opacity="1"; }}>
                  {plan.cta}
                </Link>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   CTA
═══════════════════════════════════════════ */
function CTASection() {
  return (
    <section className="relative z-10 py-40 text-center px-6 border-t overflow-hidden"
      style={{borderColor:C.border, background:`linear-gradient(180deg,${C.bg} 0%,rgba(10,10,18,1) 100%)`}}>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full pointer-events-none"
        style={{background:`radial-gradient(circle,${C.cyan}07 0%,transparent 65%)`,filter:"blur(80px)"}}/>

      <motion.div initial={{opacity:0,scale:0.96}} whileInView={{opacity:1,scale:1}} viewport={{once:true}}
        transition={{duration:1.1,ease}} className="relative max-w-4xl mx-auto">
        <SectionBadge>Get Started</SectionBadge>
        <h2 className="text-5xl md:text-7xl font-semibold tracking-tight leading-[1.04] mb-6"
          style={{fontFamily:C.display,color:C.text}}>
          Upgrade your{" "}
          <span style={{background:`linear-gradient(135deg,${C.purple},${C.cyan})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>
            visual identity.
          </span>
        </h2>
        <p className="text-lg mb-12 max-w-lg mx-auto" style={{color:C.muted,fontFamily:C.sans}}>
          Join 50,000 users who have digitized their aesthetic. The Style Architecture Engine awaits.
        </p>

        <div className="flex flex-col items-center gap-4">
          <Magnetic>
            <Link href="/signup" data-hover
              className="group relative inline-flex items-center gap-3 px-12 py-5 rounded-full text-sm font-bold tracking-widest uppercase overflow-hidden"
              style={{background:"#ffffff",color:"#000",fontFamily:C.sans,boxShadow:"0 0 50px rgba(255,255,255,0.12)"}}>
              <span className="absolute inset-0 translate-x-[-110%] group-hover:translate-x-[110%] transition-transform duration-700"
                style={{background:"linear-gradient(90deg,transparent,rgba(255,255,255,0.25),transparent)"}}/>
              Create Free Account <ArrowRight size={17}/>
            </Link>
          </Magnetic>
          <span className="text-[10px] uppercase tracking-widest flex items-center gap-2" style={{color:C.low,fontFamily:C.sans}}>
            <Shield size={10}/> No credit card required
          </span>
        </div>
      </motion.div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   FOOTER — FIX: removed duplicate style prop
═══════════════════════════════════════════ */
function Footer() {
  return (
    <footer className="relative z-10 border-t pt-20 pb-10 px-6"
      style={{borderColor:C.border, background:C.surface}}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-14 mb-16">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{background:`linear-gradient(135deg,${C.purple},${C.cyan})`,boxShadow:`0 0 16px ${C.purple}40`}}>
                <Wand2 size={15} color="#fff"/>
              </div>
              <span style={{fontFamily:C.display, fontSize:22, color:C.text, fontWeight:700}}>
                Style<span style={{background:`linear-gradient(135deg,${C.purple},${C.cyan})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",fontStyle:"italic",fontWeight:300}}>Savvy</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed max-w-xs mb-7" style={{color:C.muted,fontFamily:C.sans}}>
              The leading neural architecture for personal aesthetics. Digitize your wardrobe. Visualize the future.
            </p>
            <div className="flex gap-3">
              {[Globe, MessageCircle, Share2, Mail].map((Icon,i) => (
                <Link key={i} href="#" data-hover
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200"
                  style={{border:`1px solid ${C.border}`,color:C.muted}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,0.18)";e.currentTarget.style.color=C.text;e.currentTarget.style.background="rgba(255,255,255,0.05)";}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.color=C.muted;e.currentTarget.style.background="transparent";}}>
                  <Icon size={16}/>
                </Link>
              ))}
            </div>
          </div>

          {[
            {heading:"Product", links:["Neural Engine","3D Roomspace","Smart Wardrobe","Trend Radar","AI Stylist"]},
            {heading:"Company", links:["About","Blog","Careers","Press","Contact"]},
          ].map(col => (
            <div key={col.heading}>
              <p className="text-[9px] uppercase tracking-[0.2em] mb-5" style={{color:C.low,fontFamily:C.sans,fontWeight:600}}>{col.heading}</p>
              <ul className="space-y-3">
                {col.links.map(l => (
                  <li key={l}>
                    <Link href="#" data-hover className="text-sm transition-colors duration-200"
                      style={{color:C.muted,fontFamily:C.sans}}
                      onMouseEnter={e=>e.currentTarget.style.color=C.text}
                      onMouseLeave={e=>e.currentTarget.style.color=C.muted}>
                      {l}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8" style={{borderTop:`1px solid ${C.border}`}}>
          <p className="text-xs" style={{color:C.low,fontFamily:C.sans}}>© 2026 StyleSavvy, Inc. All rights reserved.</p>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
            style={{background:"rgba(16,185,129,0.07)",border:"1px solid rgba(16,185,129,0.15)"}}>
            <motion.span animate={{scale:[1,1.4,1]}} transition={{repeat:Infinity,duration:2}}
              className="block w-1.5 h-1.5 rounded-full" style={{background:"#10b981",boxShadow:"0 0 6px rgba(16,185,129,0.9)"}}/>
            <span className="text-xs" style={{color:"#10b981",fontFamily:C.sans}}>All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ═══════════════════════════════════════════
   ROOT
═══════════════════════════════════════════ */
export default function Home() {
  return (
    <main className="relative w-full overflow-x-hidden" style={{background:C.bg, cursor:"none"}}>
      {/* Grain overlay */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.022]"
        style={{
          backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.15'/%3E%3C/svg%3E")`,
          backgroundRepeat:"repeat", backgroundSize:"180px 180px",
        }}/>

      <CustomCursor/>
      <ScrollProgress/>

      <HeroSection/>
      <MarqueeSection/>
      <StatsSection/>
      <BentoSection/>
      <WorkflowSection/>
      <FeaturesSection/>
      <TestimonialsSection/>
      <PricingSection/>
      <CTASection/>
      <Footer/>

      {/* Global CSS – includes marquee keyframes, font imports, scrollbar */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,300;1,600&family=DM+Sans:wght@300;400;500;600&display=swap');

        html { scroll-behavior: smooth; }
        *, *::before, *::after { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(155,109,255,0.3); border-radius: 2px; }
        ::selection { background: rgba(155,109,255,0.25); color: #fff; }

        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes marquee-rev {
          from { transform: translateX(-50%); }
          to   { transform: translateX(0); }
        }
        .animate-marquee     { animation: marquee     35s linear infinite; }
        .animate-marquee-rev { animation: marquee-rev 35s linear infinite; }

        @keyframes ping {
          75%, 100% { transform: scale(1.8); opacity: 0; }
        }
        .animate-ping { animation: ping 1.4s cubic-bezier(0,0,0.2,1) infinite; }
      `}</style>
    </main>
  );
}