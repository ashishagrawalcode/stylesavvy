"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Camera, Sliders, ArrowRight, UploadCloud, Loader2, CheckCircle2,
  Sparkles, Save, RefreshCw, Palette, Shirt, Zap, Info, TrendingUp,
  Star, ImageIcon, Wand2, Download, AlertCircle, RotateCcw,
  Crown, Award, Layers, Clock, Check,
} from "lucide-react";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

/* ── Design Tokens ── */
const C={bg:"#06060f",surface:"rgba(12,12,22,0.9)",border:"rgba(255,255,255,0.07)",borderHov:"rgba(255,255,255,0.14)",purple:"#9b6dff",purpleDim:"rgba(155,109,255,0.14)",cyan:"#00d4c8",cyanDim:"rgba(0,212,200,0.1)",amber:"#f0a030",amberDim:"rgba(240,160,48,0.1)",green:"#22d474",greenDim:"rgba(34,212,116,0.1)",rose:"#ff5577",roseDim:"rgba(255,85,119,0.1)",text:"#ececf4",textMid:"#8888a0",textLow:"#3a3a52",serif:"'DM Serif Display', Georgia, serif",sans:"'Instrument Sans', system-ui, sans-serif"};
const ease=[0.16,1,0.3,1];

function Label({c}){return <p style={{fontFamily:C.sans,fontSize:9,letterSpacing:"0.22em",textTransform:"uppercase",color:C.textLow,marginBottom:8,fontWeight:600}}>{c}</p>;}
function Tag({label,active,color=C.purple,onClick}){return <button onClick={onClick} style={{padding:"6px 13px",borderRadius:99,fontFamily:C.sans,fontSize:11,fontWeight:500,background:active?color+"20":"rgba(255,255,255,0.03)",border:`1px solid ${active?color+"50":C.border}`,color:active?color:C.textMid,cursor:"pointer",transition:"all 0.2s",flexShrink:0}}>{label}</button>;}

function Sel({value,onChange,options,ph}){return <select value={value} onChange={e=>onChange(e.target.value)} style={{width:"100%",padding:"12px 16px",borderRadius:12,background:"rgba(8,8,18,0.8)",border:`1px solid ${C.border}`,color:value?C.text:C.textLow,fontFamily:C.sans,fontSize:13,outline:"none",appearance:"none",cursor:"pointer"}}>{ph&&<option value="" disabled>{ph}</option>}{options.map(o=><option key={o} value={o} style={{background:"#0c0c18",color:C.text}}>{o}</option>)}</select>;}

function Inp({value,onChange,ph,type="text"}){return <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={ph} onFocus={e=>{e.target.style.borderColor=C.purple+"60";}} onBlur={e=>{e.target.style.borderColor=C.border;}} style={{width:"100%",padding:"12px 16px",borderRadius:12,background:"rgba(8,8,18,0.8)",border:`1px solid ${C.border}`,color:C.text,fontFamily:C.sans,fontSize:13,outline:"none",transition:"border-color 0.2s"}}/>;}

function FB({label,children}){return <div style={{display:"flex",flexDirection:"column",gap:6}}><Label c={label}/>{children}</div>;}

function ScoreRing({score,size=72,color=C.purple}){const r=(size-6)/2,circ=2*Math.PI*r,dash=((score||0)/100)*circ;return <div style={{position:"relative",width:size,height:size,flexShrink:0}}><svg width={size} height={size} style={{transform:"rotate(-90deg)",display:"block"}}><circle cx={size/2} cy={size/2} r={r} fill="none" stroke={C.border} strokeWidth={3}/><motion.circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" initial={{strokeDasharray:`0 ${circ}`}} animate={{strokeDasharray:`${dash} ${circ}`}} transition={{duration:1.4,ease}}/></svg><div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}><span style={{fontFamily:C.sans,fontSize:size*0.24,fontWeight:700,color:C.text,lineHeight:1}}>{score}</span><span style={{fontFamily:C.sans,fontSize:8,color:C.textLow,marginTop:2}}>/100</span></div></div>;}

/* ── Outfit Image Card with DALL-E generation ── */
function OutfitImageCard({formula,styleArchetype,colorPalette,occasion,label}){
  const[url,setUrl]=useState(null);
  const[loading,setLoading]=useState(false);
  const[error,setError]=useState(null);

  const generate=async()=>{
    setLoading(true);setError(null);
    try{
      const res=await fetch("/api/generate-outfit-image",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({outfitFormula:formula,styleArchetype,colorPalette,occasion})});
      const data=await res.json();
      if(data.success)setUrl(data.imageUrl);
      else setError(data.error||"Generation failed");
    }catch{setError("Connection error");}
    finally{setLoading(false);}
  };

  return <div style={{borderRadius:16,overflow:"hidden",background:C.surface,border:`1px solid ${C.border}`}}>
    <div style={{position:"relative",aspectRatio:"3/4",background:"rgba(6,6,14,0.8)",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden"}}>
      <AnimatePresence mode="wait">
        {loading?<motion.div key="l" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:12}}>
          <motion.div animate={{rotate:360}} transition={{duration:2,repeat:Infinity,ease:"linear"}} style={{width:34,height:34,borderRadius:"50%",border:`2px solid ${C.border}`,borderTop:`2px solid ${C.purple}`}}/>
          <p style={{fontFamily:C.sans,fontSize:10,color:C.textLow,letterSpacing:"0.12em"}}>Generating look...</p>
        </motion.div>
        :url?<motion.div key="img" initial={{opacity:0,scale:1.04}} animate={{opacity:1,scale:1}} transition={{duration:0.6}} style={{position:"absolute",inset:0}}>
          <img src={url} alt={label} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
          <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(6,6,14,0.75) 0%,transparent 55%)",display:"flex",flexDirection:"column",justifyContent:"flex-end",padding:12,gap:7}}>
            <div style={{display:"flex",gap:6}}>
              <a href={url} download={`${label}.jpg`} target="_blank" rel="noopener noreferrer" style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:5,padding:"6px 0",borderRadius:8,background:"rgba(255,255,255,0.1)",border:`1px solid ${C.border}`,color:C.text,fontFamily:C.sans,fontSize:10,textDecoration:"none"}}><Download size={11}/> Save</a>
              <button onClick={generate} style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:5,padding:"6px 0",borderRadius:8,background:"rgba(155,109,255,0.15)",border:`1px solid ${C.purple}40`,color:C.purple,fontFamily:C.sans,fontSize:10,cursor:"pointer"}}><RefreshCw size={10}/> Redo</button>
            </div>
          </div>
        </motion.div>
        :error?<motion.div key="err" initial={{opacity:0}} animate={{opacity:1}} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:10,padding:20,textAlign:"center"}}>
          <AlertCircle size={22} style={{color:C.rose+"80"}}/>
          <p style={{fontFamily:C.sans,fontSize:10,color:C.textMid}}>{error}</p>
          <button onClick={generate} style={{padding:"5px 12px",borderRadius:8,background:C.purpleDim,border:`1px solid ${C.purple}40`,color:C.purple,fontFamily:C.sans,fontSize:10,cursor:"pointer"}}>Retry</button>
        </motion.div>
        :<motion.div key="ph" initial={{opacity:0}} animate={{opacity:1}} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:12,padding:20,textAlign:"center"}}>
          <div style={{width:44,height:44,borderRadius:12,background:C.purpleDim,border:`1px solid ${C.purple}30`,display:"flex",alignItems:"center",justifyContent:"center"}}><ImageIcon size={20} style={{color:C.purple}}/></div>
          <p style={{fontFamily:C.sans,fontSize:10,color:C.textLow,lineHeight:1.6}}>AI outfit visualization<br/>ready to generate</p>
          <button onClick={generate} style={{padding:"7px 16px",borderRadius:99,background:`linear-gradient(135deg,${C.purple},${C.cyan})`,border:"none",color:"#fff",fontFamily:C.sans,fontSize:10,fontWeight:600,cursor:"pointer"}}>Generate Look</button>
        </motion.div>}
      </AnimatePresence>
    </div>
    <div style={{padding:"12px 14px"}}>
      <p style={{fontFamily:C.sans,fontSize:9,letterSpacing:"0.16em",color:C.purple,textTransform:"uppercase",marginBottom:4}}>{label}</p>
      <p style={{fontFamily:C.sans,fontSize:11,color:C.textMid,lineHeight:1.65}}>{formula}</p>
    </div>
  </div>;
}

/* ── SCAN TAB ── */
function ScanTab({onComplete}){
  const[preview,setPreview]=useState(null);
  const[phase,setPhase]=useState("idle");
  const[result,setResult]=useState(null);
  const[error,setError]=useState(null);
  const[phaseText,setPhaseText]=useState("Detecting body geometry...");
  const fileRef=useRef(null);
  const phases=["Detecting body geometry...","Reading skin undertone...","Classifying fit preference...","Extracting style signals...","Compiling style DNA..."];

  const handleFile=async(file)=>{
    if(!file||!file.type.startsWith("image/")){setError("Please upload a valid image file.");return;}
    if(file.size>10*1024*1024){setError("Image must be under 10MB.");return;}
    setError(null);setPreview(URL.createObjectURL(file));setPhase("analyzing");
    let i=0;
    const iv=setInterval(()=>{i++;if(i<phases.length)setPhaseText(phases[i]);else clearInterval(iv);},900);
    try{
      const reader=new FileReader();
      reader.readAsDataURL(file);
      reader.onload=async()=>{
        const b64=reader.result.split(",")[1];
        const res=await fetch("/api/scan-profile",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({imageBase64:b64,mimeType:file.type})});
        const data=await res.json();
        clearInterval(iv);
        if(data.success){setResult(data.result);setPhase("done");}
        else{setError(data.error||"Analysis failed.");setPhase("idle");setPreview(null);}
      };
    }catch{clearInterval(iv);setError("Connection error.");setPhase("idle");}
  };

  const reset=()=>{setPreview(null);setResult(null);setError(null);setPhase("idle");setPhaseText(phases[0]);};

  return <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:0.3}}>
    {phase==="idle"&&<div
      onDrop={e=>{e.preventDefault();const f=e.dataTransfer.files?.[0];if(f)handleFile(f);}}
      onDragOver={e=>e.preventDefault()}
      onClick={()=>fileRef.current?.click()}
      onMouseEnter={e=>{e.currentTarget.style.borderColor=C.purple+"50";e.currentTarget.style.background="linear-gradient(180deg,rgba(155,109,255,0.08) 0%,rgba(0,212,200,0.04) 100%)";}}
      onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.background="linear-gradient(180deg,rgba(155,109,255,0.04) 0%,rgba(0,212,200,0.03) 100%)";}}
      style={{borderRadius:20,padding:"56px 32px",background:"linear-gradient(180deg,rgba(155,109,255,0.04) 0%,rgba(0,212,200,0.03) 100%)",border:`2px dashed ${C.border}`,display:"flex",flexDirection:"column",alignItems:"center",textAlign:"center",cursor:"pointer",transition:"all 0.2s",position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",top:"30%",left:"50%",transform:"translateX(-50%)",width:300,height:300,borderRadius:"50%",background:`radial-gradient(circle,${C.purple}0a 0%,transparent 70%)`,filter:"blur(40px)",pointerEvents:"none"}}/>
      <div style={{width:68,height:68,borderRadius:18,background:`linear-gradient(135deg,${C.purple}22,${C.cyan}18)`,border:`1px solid ${C.purple}30`,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:18}}><Camera size={30} style={{color:C.cyan}}/></div>
      <h3 style={{fontFamily:C.serif,fontSize:26,color:C.text,marginBottom:10,fontWeight:400}}>Upload a Full-Body Photo</h3>
      <p style={{fontFamily:C.sans,fontSize:13,color:C.textMid,lineHeight:1.7,maxWidth:380,marginBottom:22}}>GPT-4o Vision will scan your photo to extract body geometry, skin undertone, and current style signals — instantly populating your Style DNA.</p>
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:7,marginBottom:26}}>
        {["Full body visible, standing naturally","Clear lighting, sharp image","JPG, PNG or WEBP up to 10MB"].map((tip,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:7}}><Check size={10} style={{color:C.cyan}}/><span style={{fontFamily:C.sans,fontSize:11,color:C.textLow}}>{tip}</span></div>)}
      </div>
      <div style={{padding:"11px 28px",borderRadius:99,background:`linear-gradient(135deg,${C.purple},${C.cyan})`,color:"#fff",fontFamily:C.sans,fontSize:12,fontWeight:600,pointerEvents:"none"}}>Select Image or Drop Here</div>
      <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>{const f=e.target.files?.[0];if(f)handleFile(f);}}/>
    </div>}

    {phase==="analyzing"&&preview&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:24,alignItems:"center"}}>
      <div style={{borderRadius:20,overflow:"hidden",position:"relative",aspectRatio:"3/4"}}>
        <img src={preview} alt="scan" style={{width:"100%",height:"100%",objectFit:"cover",opacity:0.45}}/>
        <motion.div animate={{y:["-100%","200%"]}} transition={{duration:2,repeat:Infinity,ease:"linear"}} style={{position:"absolute",left:0,right:0,height:3,background:`linear-gradient(90deg,transparent,${C.cyan},transparent)`,boxShadow:`0 0 12px ${C.cyan}`}}/>
        {["tl","tr","bl","br"].map(p=><div key={p} style={{position:"absolute",top:p.startsWith("t")?12:"auto",bottom:p.startsWith("b")?12:"auto",left:p.endsWith("l")?12:"auto",right:p.endsWith("r")?12:"auto",width:18,height:18,borderTop:p.startsWith("t")?`2px solid ${C.cyan}`:"none",borderBottom:p.startsWith("b")?`2px solid ${C.cyan}`:"none",borderLeft:p.endsWith("l")?`2px solid ${C.cyan}`:"none",borderRight:p.endsWith("r")?`2px solid ${C.cyan}`:"none"}}/>)}
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:18}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <motion.div animate={{rotate:360}} transition={{duration:1.6,repeat:Infinity,ease:"linear"}} style={{width:22,height:22,borderRadius:"50%",border:`2px solid ${C.border}`,borderTop:`2px solid ${C.cyan}`}}/>
          <span style={{fontFamily:C.sans,fontSize:11,color:C.cyan,letterSpacing:"0.12em"}}>VISION ANALYSIS</span>
        </div>
        <motion.p key={phaseText} initial={{opacity:0,y:5}} animate={{opacity:1,y:0}} style={{fontFamily:C.sans,fontSize:13,color:C.textMid,lineHeight:1.6}}>{phaseText}</motion.p>
        <div style={{display:"flex",gap:6}}>{phases.map((p,i)=><motion.div key={i} animate={{opacity:phaseText===p?1:0.25,scale:phaseText===p?1.2:1}} style={{width:6,height:6,borderRadius:"50%",background:C.cyan}}/>)}</div>
        <div style={{padding:"12px 14px",borderRadius:12,background:C.cyanDim,border:`1px solid ${C.cyan}28`}}><p style={{fontFamily:C.sans,fontSize:11,color:C.textLow,lineHeight:1.65}}>GPT-4o Vision is analysing body proportions, current outfit signals, and skin undertone from your photo.</p></div>
      </div>
    </div>}

    {phase==="done"&&result&&<motion.div initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{duration:0.5}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1.6fr",gap:24,alignItems:"start"}}>
        <div>
          <div style={{borderRadius:20,overflow:"hidden",position:"relative",aspectRatio:"3/4",marginBottom:12}}>
            <img src={preview} alt="scanned" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
            <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(6,6,14,0.7) 0%,transparent 50%)"}}/>
            <div style={{position:"absolute",bottom:12,left:12}}>
              <div style={{display:"flex",alignItems:"center",gap:6,padding:"5px 10px",borderRadius:99,background:"rgba(34,212,116,0.15)",border:`1px solid ${C.green}40`}}><CheckCircle2 size={10} style={{color:C.green}}/><span style={{fontFamily:C.sans,fontSize:9,color:C.green,letterSpacing:"0.12em"}}>SCAN COMPLETE</span></div>
            </div>
          </div>
          <div style={{padding:"10px 14px",borderRadius:12,background:C.surface,border:`1px solid ${C.border}`}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><span style={{fontFamily:C.sans,fontSize:9,color:C.textLow,letterSpacing:"0.14em"}}>CONFIDENCE</span><span style={{fontFamily:C.sans,fontSize:11,fontWeight:700,color:C.text}}>{Math.round((result.confidence||0.85)*100)}%</span></div>
            <div style={{height:2,background:C.border,borderRadius:99,overflow:"hidden"}}><motion.div initial={{width:0}} animate={{width:`${Math.round((result.confidence||0.85)*100)}%`}} transition={{duration:1,ease}} style={{height:"100%",background:`linear-gradient(90deg,${C.purple},${C.cyan})`,borderRadius:99}}/></div>
          </div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}><Zap size={13} style={{color:C.purple}}/><h3 style={{fontFamily:C.sans,fontSize:13,fontWeight:700,color:C.text}}>Style DNA Extracted</h3></div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            {[["Body Build",result.bodyType],["Skin Undertone",result.skinTone],["Fit Preference",result.fitPreference],["Gender",result.gender]].map(([l,v])=><div key={l} style={{padding:"10px 12px",borderRadius:10,background:C.surface,border:`1px solid ${C.border}`}}><p style={{fontFamily:C.sans,fontSize:8,color:C.textLow,letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:3}}>{l}</p><p style={{fontFamily:C.sans,fontSize:11,fontWeight:600,color:C.text}}>{v||"—"}</p></div>)}
          </div>
          {result.vibes?.length>0&&<div><Label c="Detected Vibes"/><div style={{display:"flex",flexWrap:"wrap",gap:5}}>{result.vibes.map(v=><span key={v} style={{padding:"4px 10px",borderRadius:99,background:C.purpleDim,border:`1px solid ${C.purple}40`,fontFamily:C.sans,fontSize:10,color:C.purple}}>{v}</span>)}</div></div>}
          {result.detectedColors?.length>0&&<div><Label c="Colours from Your Outfit"/><div style={{display:"flex",gap:6}}>{result.detectedColors.map((col,i)=><div key={i} title={col} style={{width:28,height:28,borderRadius:8,background:col,border:"1px solid rgba(255,255,255,0.12)"}}/>)}</div></div>}
          {result.notes&&<div style={{padding:"12px 14px",borderRadius:12,background:C.purpleDim,border:`1px solid ${C.purple}30`,borderLeft:`2px solid ${C.purple}`}}><p style={{fontFamily:C.sans,fontSize:11,color:C.textMid,lineHeight:1.7,fontStyle:"italic"}}>"{result.notes}"</p></div>}
          {result.currentOutfitDescription&&<div style={{padding:"10px 14px",borderRadius:12,background:C.cyanDim,border:`1px solid ${C.cyan}28`}}><Label c="Detected Current Outfit"/><p style={{fontFamily:C.sans,fontSize:11,color:C.textMid,lineHeight:1.65}}>{result.currentOutfitDescription}</p></div>}
          <div style={{display:"flex",gap:10}}>
            <button onClick={()=>onComplete(result)} style={{flex:1,padding:"11px 0",borderRadius:99,background:`linear-gradient(135deg,${C.purple},${C.cyan})`,border:"none",color:"#fff",fontFamily:C.sans,fontSize:12,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}><ArrowRight size={13}/> Apply to Profile</button>
            <button onClick={reset} style={{padding:"11px 16px",borderRadius:99,background:"transparent",border:`1px solid ${C.border}`,color:C.textMid,fontFamily:C.sans,fontSize:12,cursor:"pointer"}}><RotateCcw size={12}/></button>
          </div>
        </div>
      </div>
    </motion.div>}

    {error&&<motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} style={{marginTop:16,padding:"12px 16px",borderRadius:12,background:C.roseDim,border:`1px solid ${C.rose}40`,display:"flex",gap:10,alignItems:"flex-start"}}><AlertCircle size={13} style={{color:C.rose,flexShrink:0,marginTop:1}}/><p style={{fontFamily:C.sans,fontSize:12,color:C.textMid,lineHeight:1.6}}>{error}</p></motion.div>}
  </motion.div>;
}

/* ── MANUAL TAB ── */
function ManualTab({formData,setField,toggleArr}){
  const VIBES=["Old Money","Streetwear","Minimalist","Dark Academic","Y2K","Techwear","Preppy","Boho","Cottagecore","Avant-garde","Classic","Contemporary"];
  const OCC=["Office","Casual","Evening Out","Date Night","Gym","Travel","Formal","Festival","Weekend","Business"];
  return <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:0.3}}>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:16,marginBottom:28}}>
      <FB label="Gender"><Sel value={formData.gender} onChange={v=>setField("gender",v)} ph="Select gender..." options={["Male / Masculine","Female / Feminine","Androgynous / Unisex"]}/></FB>
      <FB label="Height (cm)"><Inp value={formData.height} onChange={v=>setField("height",v)} ph="e.g. 175" type="number"/></FB>
      <FB label="Body Build"><Sel value={formData.bodyType} onChange={v=>setField("bodyType",v)} ph="Select build..." options={["Slim / Lean","Athletic","Average","Broad / Muscular","Plus Size","Petite"]}/></FB>
      <FB label="Skin Undertone"><Sel value={formData.skinTone} onChange={v=>setField("skinTone",v)} ph="Select undertone..." options={["Cool (Pink / Blue hues)","Warm (Yellow / Golden hues)","Neutral (Mix)"]}/></FB>
      <FB label="Fit Preference"><Sel value={formData.fitPreference} onChange={v=>setField("fitPreference",v)} ph="Select fit..." options={["Tailored / Form-fitting","Oversized / Relaxed","Draped / Flowing","Boxy / Structured"]}/></FB>
      <FB label="Target Aesthetic"><Inp value={formData.styleVibe} onChange={v=>setField("styleVibe",v)} ph="e.g. Old Money, Dark Minimal..."/></FB>
    </div>
    <div style={{marginBottom:24}}>
      <Label c="Style Vibes — pick what resonates"/>
      <div style={{display:"flex",flexWrap:"wrap",gap:6}}>{VIBES.map(v=><Tag key={v} label={v} active={formData.vibes.includes(v)} color={C.purple} onClick={()=>toggleArr("vibes",v)}/>)}</div>
    </div>
    <div>
      <Label c="Occasions you regularly dress for"/>
      <div style={{display:"flex",flexWrap:"wrap",gap:6}}>{OCC.map(o=><Tag key={o} label={o} active={formData.occasions.includes(o)} color={C.cyan} onClick={()=>toggleArr("occasions",o)}/>)}</div>
    </div>
  </motion.div>;
}

/* ── ANALYSIS DISPLAY ── */
function AnalysisDisplay({analysis,onRefresh,isRefreshing}){
  if(!analysis)return null;
  const{styleArchetype,summary,colorPalette,keyPieces,fitGuidance,seasonalAdvice,avoidList,fabricRecommendations,inspirationKeywords,brandAlignment,outfitFormulas,styleEvolutionPath,confidenceScore,editorialVerdict}=analysis;
  const sc=confidenceScore>=90?C.green:confidenceScore>=75?C.cyan:C.amber;

  return <motion.div initial={{opacity:0,y:32}} animate={{opacity:1,y:0}} transition={{duration:0.7,ease}}>
    {/* Divider */}
    <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:32}}>
      <div style={{flex:1,height:1,background:`linear-gradient(to right,transparent,${C.border})`}}/>
      <div style={{display:"flex",alignItems:"center",gap:8,padding:"6px 16px",borderRadius:99,background:C.purpleDim,border:`1px solid ${C.purple}30`}}><Sparkles size={10} style={{color:C.purple}}/><span style={{fontFamily:C.sans,fontSize:9,letterSpacing:"0.22em",textTransform:"uppercase",color:C.purple}}>Deep Style Analysis</span></div>
      <div style={{flex:1,height:1,background:`linear-gradient(to left,transparent,${C.border})`}}/>
    </div>

    {/* Hero */}
    <div style={{borderRadius:24,padding:"36px 36px",marginBottom:20,background:"linear-gradient(135deg,rgba(155,109,255,0.08) 0%,rgba(0,212,200,0.06) 50%,rgba(155,109,255,0.04) 100%)",border:`1px solid ${C.border}`,position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",top:-80,right:-80,width:300,height:300,borderRadius:"50%",background:`radial-gradient(circle,${C.purple}12 0%,transparent 65%)`,filter:"blur(40px)",pointerEvents:"none"}}/>
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",flexWrap:"wrap",gap:20,position:"relative"}}>
        <div style={{flex:1,minWidth:260}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}><Crown size={12} style={{color:C.amber}}/><span style={{fontFamily:C.sans,fontSize:9,letterSpacing:"0.22em",textTransform:"uppercase",color:C.amber}}>Your Style Archetype</span></div>
          <h2 style={{fontFamily:C.serif,fontSize:34,color:C.text,lineHeight:1.1,marginBottom:14,fontWeight:400}}>{styleArchetype}</h2>
          <p style={{fontFamily:C.sans,fontSize:14,color:C.textMid,lineHeight:1.75,maxWidth:520,fontStyle:"italic"}}>"{summary}"</p>
        </div>
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6}}><ScoreRing score={confidenceScore} size={80} color={sc}/><span style={{fontFamily:C.sans,fontSize:9,color:C.textLow,letterSpacing:"0.14em"}}>ANALYSIS SCORE</span></div>
      </div>
      <div style={{marginTop:20,padding:"12px 16px",borderRadius:12,background:"rgba(0,0,0,0.2)",border:`1px solid ${C.border}`,display:"inline-flex",alignItems:"center",gap:10}}><Star size={11} style={{color:C.amber}}/><p style={{fontFamily:C.sans,fontSize:12,color:C.text,fontWeight:500}}>{editorialVerdict}</p></div>
    </div>

    {/* Grid: palette + pieces + avoid */}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:16,marginBottom:16}}>
      {/* Palette */}
      <div style={{borderRadius:20,padding:"22px",background:C.surface,border:`1px solid ${C.border}`}}>
        <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:16}}><Palette size={12} style={{color:"#ff6bde"}}/><span style={{fontFamily:C.sans,fontSize:9,letterSpacing:"0.18em",textTransform:"uppercase",color:"#ff6bde"}}>Colour Palette</span></div>
        <div style={{marginBottom:14}}><Label c="Hero Tones"/><div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{colorPalette?.hero?.map((col,i)=><div key={i} title={col} onClick={()=>navigator.clipboard?.writeText(col)} style={{width:36,height:36,borderRadius:10,background:col,border:"1px solid rgba(255,255,255,0.1)",cursor:"pointer"}}/>)}</div></div>
        <div style={{marginBottom:14}}><Label c="Accents"/><div style={{display:"flex",gap:5}}>{colorPalette?.accent?.map((col,i)=><div key={i} title={col} style={{width:26,height:26,borderRadius:7,background:col,border:"1px solid rgba(255,255,255,0.1)"}}/>)}</div></div>
        <div style={{marginBottom:14}}><Label c="Neutral Base"/><div style={{display:"flex",gap:5}}>{colorPalette?.neutralBase?.map((col,i)=><div key={i} title={col} style={{width:26,height:26,borderRadius:7,background:col,border:"1px solid rgba(255,255,255,0.1)"}}/>)}</div></div>
        <div style={{display:"flex",flexWrap:"wrap",gap:4}}>{colorPalette?.labels?.map(l=><span key={l} style={{padding:"2px 7px",borderRadius:6,background:"rgba(255,255,255,0.04)",fontFamily:C.sans,fontSize:9,color:C.textLow}}>{l}</span>)}</div>
      </div>

      {/* Key Pieces */}
      <div style={{borderRadius:20,padding:"22px",background:C.surface,border:`1px solid ${C.border}`}}>
        <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:16}}><Shirt size={12} style={{color:C.cyan}}/><span style={{fontFamily:C.sans,fontSize:9,letterSpacing:"0.18em",textTransform:"uppercase",color:C.cyan}}>Signature Pieces</span></div>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>{keyPieces?.map((p,i)=><div key={i}><p style={{fontFamily:C.sans,fontSize:12,fontWeight:600,color:C.text,marginBottom:3}}>{p.item}</p><p style={{fontFamily:C.sans,fontSize:10,color:C.textLow,lineHeight:1.6}}>{p.why}</p></div>)}</div>
      </div>

      {/* Avoid + Fabrics */}
      <div style={{borderRadius:20,padding:"22px",background:C.surface,border:`1px solid ${C.border}`,display:"flex",flexDirection:"column",gap:18}}>
        <div><div style={{display:"flex",alignItems:"center",gap:7,marginBottom:12}}><AlertCircle size={12} style={{color:C.rose}}/><span style={{fontFamily:C.sans,fontSize:9,letterSpacing:"0.18em",textTransform:"uppercase",color:C.rose}}>Avoid</span></div><div style={{display:"flex",flexDirection:"column",gap:6}}>{avoidList?.map((a,i)=><div key={i} style={{display:"flex",alignItems:"flex-start",gap:7}}><div style={{width:4,height:4,borderRadius:"50%",background:C.rose+"60",flexShrink:0,marginTop:5}}/><p style={{fontFamily:C.sans,fontSize:10,color:C.textLow,lineHeight:1.6}}>{a}</p></div>)}</div></div>
        <div><Label c="Recommended Fabrics"/><div style={{display:"flex",flexWrap:"wrap",gap:5}}>{fabricRecommendations?.map(f=><span key={f} style={{padding:"3px 8px",borderRadius:7,background:C.cyanDim,border:`1px solid ${C.cyan}28`,fontFamily:C.sans,fontSize:9,color:C.cyan}}>{f}</span>)}</div></div>
        <div><Label c="Keywords"/><div style={{display:"flex",flexWrap:"wrap",gap:5}}>{inspirationKeywords?.map(k=><span key={k} style={{fontFamily:C.sans,fontSize:10,color:C.textLow,fontStyle:"italic"}}>#{k}</span>)}</div></div>
      </div>
    </div>

    {/* Fit guidance + Brands */}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
      <div style={{borderRadius:20,padding:"22px",background:C.surface,border:`1px solid ${C.border}`}}>
        <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:12}}><TrendingUp size={12} style={{color:C.green}}/><span style={{fontFamily:C.sans,fontSize:9,letterSpacing:"0.18em",textTransform:"uppercase",color:C.green}}>Proportional Guidance</span></div>
        <p style={{fontFamily:C.sans,fontSize:12,color:C.textMid,lineHeight:1.75,marginBottom:14}}>{fitGuidance}</p>
        <div style={{paddingTop:14,borderTop:`1px solid ${C.border}`}}><Label c="Seasonal Strategy"/><p style={{fontFamily:C.sans,fontSize:11,color:C.textLow,lineHeight:1.75}}>{seasonalAdvice}</p></div>
        {styleEvolutionPath&&<div style={{marginTop:14,paddingTop:14,borderTop:`1px solid ${C.border}`}}><Label c="Style Evolution"/><p style={{fontFamily:C.sans,fontSize:10,color:C.textLow,lineHeight:1.65}}>{styleEvolutionPath}</p></div>}
      </div>
      <div style={{borderRadius:20,padding:"22px",background:C.surface,border:`1px solid ${C.border}`}}>
        <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:14}}><Award size={12} style={{color:C.amber}}/><span style={{fontFamily:C.sans,fontSize:9,letterSpacing:"0.18em",textTransform:"uppercase",color:C.amber}}>Brand Alignment</span></div>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          {Object.entries(brandAlignment||{}).map(([tier,brands])=><div key={tier}><Label c={tier}/><div style={{display:"flex",flexWrap:"wrap",gap:5}}>{brands?.map(b=><span key={b} style={{padding:"3px 8px",borderRadius:7,background:C.amberDim,border:`1px solid ${C.amber}28`,fontFamily:C.sans,fontSize:10,color:C.amber}}>{b}</span>)}</div></div>)}
        </div>
      </div>
    </div>

    {/* Outfit Formulas + AI Image Generation */}
    {outfitFormulas?.length>0&&<div style={{marginBottom:16}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}><Layers size={12} style={{color:C.purple}}/><span style={{fontFamily:C.sans,fontSize:9,letterSpacing:"0.22em",textTransform:"uppercase",color:C.purple}}>Outfit Formulas + AI Visual Generation</span></div>
        <span style={{fontFamily:C.sans,fontSize:10,color:C.textLow}}>Powered by DALL-E 3 HD</span>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:16}}>
        {outfitFormulas.map((f,i)=><OutfitImageCard key={i} label={f.name} formula={f.formula} styleArchetype={styleArchetype} colorPalette={colorPalette} occasion={f.occasion}/>)}
      </div>
    </div>}

    <button onClick={onRefresh} disabled={isRefreshing} style={{display:"flex",alignItems:"center",gap:8,padding:"10px 20px",borderRadius:99,background:"transparent",border:`1px solid ${C.border}`,color:C.textMid,fontFamily:C.sans,fontSize:11,cursor:"pointer",transition:"all 0.2s"}}
      onMouseEnter={e=>{e.currentTarget.style.borderColor=C.purple+"50";e.currentTarget.style.color=C.text;}}
      onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.color=C.textMid;}}>
      {isRefreshing?<Loader2 size={12} style={{animation:"spin 1s linear infinite"}}/>:<RefreshCw size={12}/>} Regenerate Analysis
    </button>
  </motion.div>;
}

/* ══════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════ */
export default function StylistPage(){
  const router=useRouter();
  let user=null,updateProfile=()=>{},db=null;
  try{const{useStyleStore}=require("../../lib/store");const s=useStyleStore();user=s.user;updateProfile=s.updateProfile;}catch{}
  try{const fb=require("../../lib/firebase");db=fb.db;}catch{}

  const[activeTab,setActiveTab]=useState("scan");
  const[saving,setSaving]=useState(false);
  const[saved,setSaved]=useState(false);
  const[loading,setLoading]=useState(true);
  const[lastUpdated,setLastUpdated]=useState(null);
  const[analysis,setAnalysis]=useState(null);
  const[isAnalysing,setIsAnalysing]=useState(false);

  const[formData,setFormData]=useState({gender:"",height:"",bodyType:"",skinTone:"",fitPreference:"Tailored / Form-fitting",styleVibe:"",occasions:[],vibes:[]});
  const setField=useCallback((k,v)=>setFormData(p=>({...p,[k]:v})),[]);
  const toggleArr=useCallback((key,val)=>setFormData(p=>({...p,[key]:p[key].includes(val)?p[key].filter(v=>v!==val):[...p[key],val]})),[]);

  useEffect(()=>{
    if(!user?.uid||!db){setLoading(false);return;}
    getDoc(doc(db,"users",user.uid)).then(snap=>{
      if(snap.exists()){
        const data=snap.data(),dna=data.styleDNA||{};
        setFormData(p=>({...p,gender:dna.gender||"",height:dna.height||"",bodyType:dna.bodyType||"",skinTone:dna.skinTone||"",fitPreference:dna.fitPreference||"Tailored / Form-fitting",styleVibe:dna.styleVibe||"",occasions:dna.occasions||[],vibes:dna.vibes||[]}));
        if(data.styleAnalysis)setAnalysis(data.styleAnalysis);
        if(data.styleDNAUpdatedAt?.toDate)setLastUpdated(data.styleDNAUpdatedAt.toDate().toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"}));
      }
      setLoading(false);
    }).catch(()=>setLoading(false));
  },[user?.uid]);

  const handleScanComplete=useCallback((result)=>{
    setFormData(p=>({...p,gender:result.gender||p.gender,bodyType:result.bodyType||p.bodyType,skinTone:result.skinTone||p.skinTone,fitPreference:result.fitPreference||p.fitPreference,styleVibe:result.vibes?.[0]||p.styleVibe,vibes:Array.from(new Set([...p.vibes,...(result.vibes||[])]))}));
    setActiveTab("manual");
  },[]);

  const generateAnalysis=useCallback(async()=>{
    if(!formData.bodyType&&!formData.gender)return;
    setIsAnalysing(true);
    try{
      const res=await fetch("/api/style-analysis",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({styleDNA:formData})});
      const data=await res.json();
      if(data.success){
        setAnalysis(data.result);
        if(user?.uid&&db)await setDoc(doc(db,"users",user.uid),{styleAnalysis:data.result},{merge:true});
      }
    }catch(e){console.error("Analysis error:",e);}
    finally{setIsAnalysing(false);}
  },[formData,user?.uid]);

  const handleSave=useCallback(async()=>{
    setSaving(true);
    try{updateProfile(formData);}catch{}
    try{
      if(user?.uid&&db){
        await setDoc(doc(db,"users",user.uid),{styleDNA:formData,displayName:user.displayName||"",email:user.email||"",styleDNAUpdatedAt:serverTimestamp()},{merge:true});
        setLastUpdated(new Date().toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"}));
      }
      setSaved(true);if(!analysis)generateAnalysis();
      setTimeout(()=>setSaved(false),3000);
    }catch(e){console.warn("Save:",e.message);setSaved(true);setTimeout(()=>setSaved(false),2500);}
    finally{setSaving(false);}
  },[formData,user,analysis,generateAnalysis]);

  const profileComplete=!!(formData.gender&&formData.bodyType&&formData.skinTone);

  if(loading)return <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",gap:12,background:C.bg}}><Loader2 size={22} style={{color:C.purple,animation:"spin 1s linear infinite"}}/><span style={{fontFamily:C.sans,fontSize:11,letterSpacing:"0.2em",color:C.textLow}}>LOADING PROFILE</span><style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style></div>;

  return <div style={{minHeight:"100vh",background:C.bg,fontFamily:C.sans,paddingBottom:80}}>
    <div style={{position:"fixed",top:0,left:"50%",transform:"translateX(-50%)",width:"80vw",height:"50vh",background:`radial-gradient(ellipse at 50% 0%,${C.purple}0e 0%,transparent 70%)`,filter:"blur(60px)",pointerEvents:"none",zIndex:0}}/>
    <div style={{maxWidth:1080,margin:"0 auto",padding:"0 20px",position:"relative",zIndex:1}}>

      {/* Header */}
      <motion.div initial={{opacity:0,y:24}} animate={{opacity:1,y:0}} transition={{duration:0.7}} style={{textAlign:"center",paddingTop:64,paddingBottom:52}}>
        <div style={{display:"inline-flex",alignItems:"center",gap:7,padding:"5px 14px",borderRadius:99,background:C.purpleDim,border:`1px solid ${C.purple}35`,marginBottom:18}}>
          <Sparkles size={10} style={{color:C.purple}}/><span style={{fontFamily:C.sans,fontSize:9,letterSpacing:"0.22em",textTransform:"uppercase",color:C.purple}}>Style Profile</span>
        </div>
        <h1 style={{fontFamily:C.serif,fontSize:"clamp(36px,5vw,58px)",color:C.text,fontWeight:400,lineHeight:1.05,marginBottom:12}}>
          Calibrate Your{" "}<span style={{background:`linear-gradient(135deg,${C.purple},${C.cyan})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Style DNA</span>
        </h1>
        <p style={{fontFamily:C.sans,fontSize:14,color:C.textMid,lineHeight:1.7,maxWidth:480,margin:"0 auto",marginBottom:lastUpdated?8:0}}>Your profile powers AI curation across RoomSpace, Wardrobe, and the stylist chatbot.</p>
        {lastUpdated&&<p style={{fontFamily:C.sans,fontSize:10,color:C.textLow,display:"flex",alignItems:"center",justifyContent:"center",gap:5}}><Clock size={9}/>Last updated {lastUpdated}</p>}
      </motion.div>

      {/* Tabs */}
      <motion.div initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{delay:0.15,duration:0.6}} style={{display:"flex",justifyContent:"center",marginBottom:32}}>
        <div style={{display:"flex",padding:4,borderRadius:99,background:"rgba(12,12,22,0.8)",border:`1px solid ${C.border}`,gap:2}}>
          {[{id:"scan",icon:Camera,label:"AI Photo Scan"},{id:"manual",icon:Sliders,label:"Manual Entry"}].map(tab=>(
            <button key={tab.id} onClick={()=>setActiveTab(tab.id)} style={{display:"flex",alignItems:"center",gap:8,padding:"10px 24px",borderRadius:99,background:activeTab===tab.id?"#ffffff":"transparent",color:activeTab===tab.id?"#000000":C.textMid,fontFamily:C.sans,fontSize:12,fontWeight:600,cursor:"pointer",border:"none",transition:"all 0.25s"}}>
              <tab.icon size={14}/><span>{tab.label}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Content card */}
      <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.2,duration:0.5}} style={{borderRadius:24,padding:"32px 32px",marginBottom:24,background:C.surface,border:`1px solid ${C.border}`,backdropFilter:"blur(20px)"}}>
        <AnimatePresence mode="wait">
          {activeTab==="scan"
            ?<motion.div key="scan" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:0.25}}><ScanTab onComplete={handleScanComplete}/></motion.div>
            :<motion.div key="manual" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:0.25}}><ManualTab formData={formData} setField={setField} toggleArr={toggleArr}/></motion.div>
          }
        </AnimatePresence>
      </motion.div>

      {/* Action bar */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12,marginBottom:48}}>
        <button onClick={()=>router.push("/dashboard")} style={{fontFamily:C.sans,fontSize:11,color:C.textLow,background:"none",border:"none",cursor:"pointer"}} onMouseEnter={e=>e.currentTarget.style.color=C.textMid} onMouseLeave={e=>e.currentTarget.style.color=C.textLow}>← Back to Dashboard</button>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <button onClick={generateAnalysis} disabled={isAnalysing||!profileComplete} style={{display:"flex",alignItems:"center",gap:6,padding:"10px 20px",borderRadius:99,background:"transparent",border:`1px solid ${profileComplete?C.purple+"50":C.border}`,color:profileComplete?C.purple:C.textLow,fontFamily:C.sans,fontSize:12,fontWeight:600,cursor:profileComplete?"pointer":"not-allowed",transition:"all 0.2s"}}>
            {isAnalysing?<Loader2 size={13} style={{animation:"spin 1s linear infinite"}}/>:<Wand2 size={13}/>}{analysis?"Refresh Analysis":"Generate Analysis"}
          </button>
          <button onClick={handleSave} disabled={saving} style={{display:"flex",alignItems:"center",gap:7,padding:"10px 28px",borderRadius:99,background:saved?`linear-gradient(135deg,${C.green},#10c066)`:`linear-gradient(135deg,${C.purple},${C.cyan})`,border:"none",color:"#fff",fontFamily:C.sans,fontSize:12,fontWeight:700,cursor:"pointer",transition:"all 0.3s",boxShadow:saved?`0 0 24px ${C.green}40`:`0 4px 20px ${C.purple}35`}}>
            {saving?<Loader2 size={13} style={{animation:"spin 1s linear infinite"}}/>:saved?<CheckCircle2 size={13} style={{color:"#d1fae5"}}/>:<Save size={13}/>}{saving?"Saving...":saved?"Saved!":"Save Profile"}
          </button>
        </div>
      </div>

      {/* Analysis */}
      <AnimatePresence>
        {(isAnalysing||analysis)&&(isAnalysing
          ?<motion.div key="loading" initial={{opacity:0,y:32}} animate={{opacity:1,y:0}} exit={{opacity:0}} style={{borderRadius:24,padding:"72px 32px",background:C.surface,border:`1px solid ${C.border}`,display:"flex",flexDirection:"column",alignItems:"center",gap:16,textAlign:"center",marginBottom:40}}>
            <div style={{position:"relative"}}><motion.div animate={{rotate:360}} transition={{duration:2.5,repeat:Infinity,ease:"linear"}} style={{width:56,height:56,borderRadius:"50%",border:`2px solid ${C.border}`,borderTop:`2px solid ${C.purple}`}}/><Sparkles size={22} style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",color:C.purple}}/></div>
            <h3 style={{fontFamily:C.serif,fontSize:24,color:C.text,fontWeight:400}}>Synthesizing Style DNA...</h3>
            <p style={{fontFamily:C.sans,fontSize:12,color:C.textLow,maxWidth:360,lineHeight:1.7}}>GPT-4o is curating your personalized editorial identity, colour palette, outfit formulas, and brand alignment.</p>
          </motion.div>
          :<motion.div key="analysis" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}><AnalysisDisplay analysis={analysis} onRefresh={generateAnalysis} isRefreshing={isAnalysing}/></motion.div>
        )}
      </AnimatePresence>
    </div>

    <style>{`@keyframes spin{to{transform:rotate(360deg);}}*{box-sizing:border-box;}input[type=number]::-webkit-inner-spin-button,input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none;margin:0;}select option{background:#0c0c18;color:#ececf4;}::-webkit-scrollbar{width:4px;}::-webkit-scrollbar-track{background:transparent;}::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.08);border-radius:2px;}`}</style>
  </div>;
}