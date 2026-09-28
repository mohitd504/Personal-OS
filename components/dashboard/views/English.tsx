"use client";
import { useState, useEffect, useRef } from "react";
import { LS, today, SS, ENGLISH_TOPICS, mdToHtml, SCENARIOS, OPT } from "@/components/dashboard/data";
import { Head, Chip, MiniTimer } from "@/components/dashboard/ui";

/* ---------- ENGLISH (45-day fluency) ---------- */
export function English(){
  let st=LS("pos_eng_start",""); if(!st){ st=today(); SS("pos_eng_start",st); }
  const [sel,setSel]=useState(today());
  const dayIdx=(()=>{ const [y,m,d]=String(st).split("-").map(Number); const s0=new Date(y,m-1,d); const [y2,m2,d2]=sel.split("-").map(Number); const cur=new Date(y2,m2-1,d2); const diff=Math.round((cur.getTime()-s0.getTime())/86400000); return Math.max(0,Math.min(44,diff)); })();
  const topic=ENGLISH_TOPICS[dayIdx];
  const [data,setData]=useState<any>(LS("pos_eng_"+today(),{chat:[],essay:"",lesson:"",essayResult:""}));
  useEffect(()=>{ setData(LS("pos_eng_"+sel,{chat:[],essay:"",lesson:"",essayResult:""})); },[sel]);
  const save=(patch:any)=>{ setData((d:any)=>{ const n={...d,...patch}; SS("pos_eng_"+sel,n); return n; }); };
  const [busy,setBusy]=useState(""); const [chatIn,setChatIn]=useState(""); const [scenario,setScenario]=useState("Free conversation");
  const getFeedback=async()=>{ if(!(data.chat||[]).length){ alert("Have a short conversation first."); return; } setBusy("fb"); try{ const r=await fetch("/api/english-feedback",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages:data.chat})}); const d=await r.json(); if(d.report) save({report:d.report}); else alert(d.error||"Failed"); }catch(e){ alert("Failed — check your AI key."); } setBusy(""); };
  const [listening,setListening]=useState(false); const [speakOn,setSpeakOn]=useState(true); const recRef=useRef<any>(null); const finalRef=useRef(""); const stoppingRef=useRef(false); const onStopRef=useRef<any>(null); const [micCtx,setMicCtx]=useState("");
  const speak=(t:string)=>{ try{ if(!speakOn||typeof window==="undefined"||!(window as any).speechSynthesis) return; const synth=(window as any).speechSynthesis; const clean=String(t).replace(/^Fix:[^\n]*\n?/im,""); const u=new (window as any).SpeechSynthesisUtterance(clean); u.lang="en-IN"; u.rate=0.95;
    const vs=synth.getVoices()||[]; const v=vs.find((x:any)=>x.lang==="en-IN")||vs.find((x:any)=>/en[-_]IN|India|Hindi|Ravi|Heera|Aditi|Rishi/i.test((x.lang||"")+(x.name||""))); if(v) u.voice=v;
    synth.cancel(); synth.speak(u); }catch(e){} };
  const startListening=(cb?:any,ctx?:string)=>{ const SR=(window as any).SpeechRecognition||(window as any).webkitSpeechRecognition; if(!SR){ alert("Voice input needs Chrome/Edge (Web Speech API). You can still type."); return; }
    try{ if((window as any).speechSynthesis) (window as any).speechSynthesis.cancel(); }catch(e){}
    try{ const rec=new SR(); rec.lang="en-IN"; rec.continuous=true; rec.interimResults=true; rec.maxAlternatives=1; recRef.current=rec; finalRef.current=""; stoppingRef.current=false; onStopRef.current=cb||((t:string)=>sendChat(false,t)); setMicCtx(ctx||"chat"); setListening(true); setChatIn("");
      rec.onresult=(e:any)=>{ let interim=""; for(let i=e.resultIndex;i<e.results.length;i++){ const tr=e.results[i][0].transcript; if(e.results[i].isFinal) finalRef.current+=tr+" "; else interim+=tr; } setChatIn((finalRef.current+interim).trim()); };
      rec.onerror=()=>{};
      rec.onend=()=>{ if(!stoppingRef.current){ try{ rec.start(); return; }catch(e){} } setListening(false); };
      rec.start(); }catch(e){ setListening(false); alert("Couldn't start the microphone."); } };
  const stopListening=()=>{ stoppingRef.current=true; try{ recRef.current&&recRef.current.stop(); }catch(e){} setListening(false); const t=(finalRef.current||chatIn).trim(); finalRef.current=""; const cb=onStopRef.current; onStopRef.current=null; setMicCtx(""); if(t && cb) cb(t); };
  const shift=(n:number)=>{ const [y,m,d]=sel.split("-").map(Number); const dt=new Date(y,m-1,d+n); setSel(`${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,"0")}-${String(dt.getDate()).padStart(2,"0")}`); };
  const getLesson=async()=>{ setBusy("lesson"); try{ const r=await fetch("/api/english-lesson",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({day:dayIdx+1,topic})}); const d=await r.json(); if(d.lesson) save({lesson:d.lesson}); else alert(d.error||"Failed"); }catch(e){ alert("Failed — check your AI key."); } setBusy(""); };
  const sendChat=async(first:boolean,textArg?:string)=>{ const txt=textArg!=null?textArg:chatIn; if(!first && !String(txt).trim()) return; setBusy("chat"); const base=Array.isArray(data.chat)?data.chat:[]; const msgs=first?[]:[...base,{role:"user",content:txt}]; if(!first){ save({chat:msgs}); setChatIn(""); }
    const convTopic = scenario && scenario!=="Free conversation" ? `Role-play scenario: ${scenario}. Stay in character as the other person in this scenario.` : topic;
    try{ const r=await fetch("/api/english-chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages:msgs,topic:convTopic})}); const d=await r.json(); if(d.reply){ const n=[...msgs,{role:"bot",content:d.reply,corrected:d.corrected||"",issues:Array.isArray(d.issues)?d.issues:[]}]; save({chat:n}); speak((d.corrected?"Say: "+d.corrected+". ":"")+d.reply); } else if(d.error) alert(d.error); }catch(e){ alert("Chat failed — check your AI key."); } setBusy(""); };
  const checkEssay=async()=>{ if(!(data.essay||"").trim()){ alert("Write your essay first."); return; } setBusy("essay"); try{ const r=await fetch("/api/essay-check",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({text:data.essay})}); const d=await r.json(); if(d.result) save({essayResult:d.result}); else alert(d.error||"Failed"); }catch(e){ alert("Failed — check your AI key."); } setBusy(""); };
  const [drill,setDrill]=useState<any>(LS("pos_engdrill_"+today(),{sentences:[],idx:0,attempts:[],review:""}));
  useEffect(()=>{ setDrill(LS("pos_engdrill_"+sel,{sentences:[],idx:0,attempts:[],review:""})); },[sel]);
  const saveDrill=(patch:any)=>{ setDrill((d:any)=>{ const n={...d,...patch}; SS("pos_engdrill_"+sel,n); return n; }); };
  const startDrill=async()=>{ setBusy("drill"); try{ const r=await fetch("/api/english-drill",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({topic,count:25})}); const d=await r.json(); if(Array.isArray(d.sentences)&&d.sentences.length){ const paras:string[]=[]; for(let i=0;i<d.sentences.length;i+=5) paras.push(d.sentences.slice(i,i+5).join(" ")); const n={sentences:paras,idx:0,attempts:[],review:""}; setDrill(n); SS("pos_engdrill_"+sel,n); speak(paras[0]); } else alert(d.error||"Failed"); }catch(e){ alert("Failed — check your AI key."); } setBusy(""); };
  const recordAttempt=(said:string)=>{ setDrill((d:any)=>{ const tgt=d.sentences[d.idx]||""; const attempts=[...(d.attempts||[]),{target:tgt,said}]; const idx=d.idx+1; const n={...d,attempts,idx}; SS("pos_engdrill_"+sel,n); if(idx<d.sentences.length) setTimeout(()=>speak(d.sentences[idx]),500); return n; }); };
  const reviewDrill=async()=>{ if(!(drill.attempts||[]).length){ alert("Repeat a few sentences first."); return; } setBusy("dreview"); try{ const r=await fetch("/api/drill-review",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({attempts:drill.attempts})}); const d=await r.json(); if(d.review) saveDrill({review:d.review}); else alert(d.error||"Failed"); }catch(e){ alert("Failed."); } setBusy(""); };
  const restartDrill=()=>{ const n={sentences:[],idx:0,attempts:[],review:""}; setDrill(n); SS("pos_engdrill_"+sel,n); };
  const norm=(s:string)=>String(s||"").toLowerCase().replace(/[^a-z0-9 ]/g,"").replace(/\s+/g," ").trim();
  // Pronunciation practice
  const [pron,setPron]=useState<any>(LS("pos_engpron_"+today(),{items:[],idx:0,last:null,right:0}));
  useEffect(()=>{ setPron(LS("pos_engpron_"+sel,{items:[],idx:0,last:null,right:0})); },[sel]);
  const savePron=(patch:any)=>{ setPron((d:any)=>{ const n={...d,...patch}; SS("pos_engpron_"+sel,n); return n; }); };
  const startPron=async()=>{ setBusy("pron"); try{ const r=await fetch("/api/word-set",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({kind:"pronunciation",topic,count:12})}); const d=await r.json(); if(Array.isArray(d.items)){ const n={items:d.items,idx:0,last:null,right:0}; setPron(n); SS("pos_engpron_"+sel,n); setTimeout(()=>speak(d.items[0].word),300); } else alert(d.error||"Failed"); }catch(e){ alert("Failed — check your AI key."); } setBusy(""); };
  const checkPron=(said:string)=>{ setPron((d:any)=>{ const it=d.items[d.idx]||{}; const ok=norm(said).includes(norm(it.word))||norm(it.word).includes(norm(said)); const n={...d,last:{word:it.word,said,ok,tip:it.tip},right:d.right+(ok?1:0)}; SS("pos_engpron_"+sel,n); return n; }); };
  const nextPron=()=>{ setPron((d:any)=>{ const idx=Math.min(d.idx+1,d.items.length); const n={...d,idx,last:null}; SS("pos_engpron_"+sel,n); if(idx<d.items.length) setTimeout(()=>speak(d.items[idx].word),300); return n; }); };
  // Spelling practice (dictation)
  const [spell,setSpell]=useState<any>(LS("pos_engspell_"+today(),{items:[],idx:0,input:"",last:null,right:0}));
  useEffect(()=>{ setSpell(LS("pos_engspell_"+sel,{items:[],idx:0,input:"",last:null,right:0})); },[sel]);
  const saveSpell=(patch:any)=>{ setSpell((d:any)=>{ const n={...d,...patch}; SS("pos_engspell_"+sel,n); return n; }); };
  const startSpell=async()=>{ setBusy("spell"); try{ const r=await fetch("/api/word-set",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({kind:"spelling",topic,count:12})}); const d=await r.json(); if(Array.isArray(d.items)){ const n={items:d.items,idx:0,input:"",last:null,right:0}; setSpell(n); SS("pos_engspell_"+sel,n); setTimeout(()=>speak(d.items[0].word),300); } else alert(d.error||"Failed"); }catch(e){ alert("Failed — check your AI key."); } setBusy(""); };
  const checkSpell=()=>{ setSpell((d:any)=>{ const it=d.items[d.idx]||{}; const ok=norm(d.input)===norm(it.word); const n={...d,last:{word:it.word,typed:d.input,ok},right:d.right+(ok?1:0)}; SS("pos_engspell_"+sel,n); return n; }); };
  const nextSpell=()=>{ setSpell((d:any)=>{ const idx=Math.min(d.idx+1,d.items.length); const n={...d,idx,input:"",last:null}; SS("pos_engspell_"+sel,n); if(idx<d.items.length) setTimeout(()=>speak(d.items[idx].word),300); return n; }); };
  return <>
    <Head t="English — 45-Day Fluency" p={`Day ${dayIdx+1} of 45 · ${topic}`} />
    {(()=>{ const ps=(re:RegExp)=>{ const m=String(data.report||"").match(re); return m?+m[1]:null; };
      const flu=ps(/fluency[^0-9]*(\d{1,3})/i), gra=ps(/grammar[^0-9]*(\d{1,3})/i), voc=ps(/vocab\w*[^0-9]*(\d{1,3})/i);
      const cefr=(String(data.report||"").match(/\b(A2|B1|B2|C1|C2)\b/)||[])[1]||"—";
      const vals=[flu,gra,voc].filter((x:any)=>x!=null) as number[];
      const overall=vals.length?Math.round(vals.reduce((a,b)=>a+b,0)/vals.length):null;
      const sub:any[]=[["Pronunciation",null,"#22c55e"],["Vocabulary",voc,"#3b82f6"],["Grammar",gra,"#a855f7"],["Fluency",flu,"#f59e0b"]];
      return <div className="panel" style={{marginBottom:16}}>
        <div className="panel-h"><div className="t">🗣️ Fluency Score</div><span className="lk">{overall!=null?"From your latest speaking session":"Do a speaking session to score"}</span></div>
        <div className="fluency">
          <div className="fl-main"><div className="ring" style={{["--p" as any]:overall||0,["--c" as any]:"#3b82f6"}}><div className="rc"><b>{overall??"—"}</b><small>/100</small></div></div><div style={{fontSize:12,fontWeight:700,color:"#60a5fa"}}>{cefr!=="—"?cefr+" · ":""}{overall!=null?(overall>=80?"Advanced":overall>=60?"Upper-Int":"Intermediate"):"Start a session"}</div></div>
          {sub.map((x:any,i:number)=><div className="fl-sub" key={i}><div className="fn">{x[0]}</div><div className="fv" style={{color:x[2]}}>{x[1]??"—"}</div><div className="fg" style={{color:x[2]}}>{x[1]!=null?(x[1]>=80?"Excellent":x[1]>=70?"Good":"Fair"):"—"}</div></div>)}
        </div>
      </div>; })()}
    <div className="card" style={{marginBottom:16}}>
      <div className="between" style={{flexWrap:"wrap",gap:10}}>
        <div><strong>Day {dayIdx+1} / 45</strong><div className="muted" style={{fontSize:12,marginTop:2}}>{topic}</div></div>
        <div className="row" style={{gap:6}}>
          <button className="btn ghost sm" onClick={()=>shift(-1)}>‹ Prev</button>
          <input className="in" type="date" value={sel} onChange={e=>setSel(e.target.value)} style={{width:150}}/>
          <button className="btn ghost sm" onClick={()=>shift(1)}>Next ›</button>
          <button className="btn ghost sm" onClick={()=>setSel(today())}>Today</button>
        </div>
      </div>
      <div className="muted" style={{fontSize:11,marginTop:8}}>Intermediate → fluent. ~45 min/day: 15 min lesson · 15 min interview bot · 15 min essay correction. Started {String(st)}.</div>
    </div>

    <div className="card" style={{marginBottom:16}}>
      <div className="between" style={{flexWrap:"wrap",gap:8}}><div className="row" style={{gap:8}}><Chip tint="blue">📘</Chip><strong>1 · Today&apos;s Lesson (15 min)</strong></div><div className="row" style={{gap:8}}><MiniTimer minutes={15}/><button className="btn sm" onClick={getLesson} disabled={busy==="lesson"}>{busy==="lesson"?"🤖…":data.lesson?"↻ New lesson":"✨ Get lesson"}</button></div></div>
      {data.lesson? <div style={{marginTop:10,fontSize:13,color:"#d5dbe6"}} dangerouslySetInnerHTML={{__html:mdToHtml(data.lesson)}}/> : <div className="muted" style={{fontSize:12,marginTop:8}}>Tap “Get lesson” for today&apos;s {topic} lesson.</div>}
    </div>

    <div className="card" style={{marginBottom:16}}>
      <div className="between" style={{flexWrap:"wrap",gap:8}}><div className="row" style={{gap:8}}><Chip tint="emerald">🎤</Chip><strong>2 · Speaking Coach (15 min)</strong></div><div className="row" style={{gap:8}}><button className="btn ghost sm" onClick={()=>{ setSpeakOn(v=>!v); if(speakOn && (window as any).speechSynthesis) (window as any).speechSynthesis.cancel(); }}>{speakOn?"🔊 Voice on":"🔇 Voice off"}</button><MiniTimer minutes={15}/></div></div>
      <div className="row" style={{gap:8,marginTop:8,flexWrap:"wrap",alignItems:"center"}}>
        <span className="muted" style={{fontSize:12}}>Scenario:</span>
        <select className="in" value={scenario} onChange={e=>{ setScenario(e.target.value); if((data.chat||[]).length && confirm("Start this new scenario fresh? (clears the current chat)")) save({chat:[],report:""}); }} style={{minWidth:180}}>{SCENARIOS.map(sn=><option key={sn} value={sn} style={OPT}>{sn}</option>)}</select>
        {(data.chat||[]).length>0 && <button className="btn ghost sm" onClick={getFeedback} disabled={busy==="fb"}>{busy==="fb"?"🤖 Scoring…":"🏁 End & get feedback"}</button>}
      </div>
      <div style={{marginTop:10,maxHeight:320,overflowY:"auto",display:"flex",flexDirection:"column",gap:8}}>
        {(data.chat||[]).map((m:any,i:number)=><div key={i} style={{alignSelf:m.role==="user"?"flex-end":"flex-start",maxWidth:"88%"}}>
          {m.role==="bot" && (m.corrected||m.fix||(m.issues&&m.issues.length)) && <div style={{fontSize:12,color:"#fcd34d",background:"rgba(245,158,11,.10)",border:"1px solid rgba(245,158,11,.28)",borderRadius:10,padding:"6px 10px",marginBottom:4}}>
            {(m.corrected||m.fix) && <div>✏️ Say: {m.corrected||String(m.fix).replace(/^Say:\s*/i,"")}</div>}
            {(m.issues||[]).map((it:string,ii:number)=><div key={ii} style={{marginTop:2,opacity:.95}}>{/pronounce/i.test(it)?"🗣️ ":"• "}{it}</div>)}
          </div>}
          <div style={{padding:"8px 12px",borderRadius:12,fontSize:13,lineHeight:1.5,background:m.role==="user"?"rgba(59,130,246,.18)":"rgba(16,185,129,.10)",border:"1px solid var(--stroke)"}}>{m.role==="user"?"🧑 ":"🎤 "}{m.content}{m.role==="bot"&&<button className="btn ghost sm" style={{marginLeft:8,padding:"1px 7px"}} title="Hear again" onClick={()=>speak(m.content)}>🔊</button>}</div>
        </div>)}
        {!(data.chat||[]).length && <div className="muted" style={{fontSize:12}}>Start the interview and answer out loud (type your answers). The bot asks questions and corrects you.</div>}
      </div>
      <div className="row" style={{gap:8,marginTop:10,flexWrap:"wrap"}}>
        {!(data.chat||[]).length && <button className="btn sm" onClick={()=>sendChat(true)} disabled={busy==="chat"}>{busy==="chat"?"🤖…":"▶ Start interview"}</button>}
        <button className={"btn "+(listening&&micCtx==="chat"?"":"ghost")+" sm"} onClick={listening?stopListening:()=>startListening(undefined,"chat")} disabled={busy==="chat"||(listening&&micCtx!=="chat")} style={listening&&micCtx==="chat"?{background:"linear-gradient(100deg,var(--pink),var(--orange))"}:{}}>{listening&&micCtx==="chat"?"⏹ Stop & send":"🎙️ Speak"}</button>
        <input className="in" value={chatIn} onChange={e=>setChatIn(e.target.value)} placeholder={listening?"Listening… speak, then tap Stop & send":"…or type your answer"} style={{flex:1,minWidth:160}} onKeyDown={e=>{ if(e.key==="Enter") sendChat(false); }}/>
        <button className="btn sm" onClick={()=>sendChat(false)} disabled={busy==="chat"}>{busy==="chat"?"🤖…":"Send"}</button>
        {(data.chat||[]).length>0 && <button className="btn ghost sm" onClick={()=>save({chat:[],report:""})}>Clear</button>}
      </div>
      {data.report && <div style={{marginTop:12,padding:12,borderRadius:12,background:"rgba(16,185,129,.08)",border:"1px solid rgba(16,185,129,.28)",fontSize:13,color:"#d5dbe6"}}><div className="between" style={{marginBottom:4}}><strong>📊 Session report</strong><button className="btn ghost sm" onClick={()=>save({report:""})}>✕</button></div><div dangerouslySetInnerHTML={{__html:mdToHtml(data.report)}}/></div>}
    </div>

    <div className="card">
      <div className="between" style={{flexWrap:"wrap",gap:8}}><div className="row" style={{gap:8}}><Chip tint="purple">✍️</Chip><strong>3 · Essay — get corrected (15 min)</strong></div><div className="row" style={{gap:8}}><MiniTimer minutes={15}/><button className="btn sm" onClick={checkEssay} disabled={busy==="essay"}>{busy==="essay"?"🤖…":"✨ Check my essay"}</button></div></div>
      <textarea className="in" value={data.essay||""} onChange={e=>save({essay:e.target.value})} placeholder={`Write a short essay on: ${topic}. AI will fix tenses, grammar and suggest better words.`} style={{width:"100%",minHeight:140,marginTop:10,lineHeight:1.6}}/>
      {data.essayResult && <div style={{marginTop:12,padding:12,borderRadius:12,background:"rgba(255,255,255,.03)",border:"1px solid var(--stroke)",fontSize:13,color:"#d5dbe6"}} dangerouslySetInnerHTML={{__html:mdToHtml(data.essayResult)}}/>}
    </div>

    <div className="card" style={{marginTop:16}}>
      <div className="between" style={{flexWrap:"wrap",gap:8}}><div className="row" style={{gap:8}}><Chip tint="cyan">🔁</Chip><strong>4 · Repeat-after-me drill — paragraphs (15 min)</strong></div><div className="row" style={{gap:8}}>{drill.sentences.length>0 && <span className="muted" style={{fontSize:12}}>Para {Math.min(drill.idx+1,drill.sentences.length)}/{drill.sentences.length}</span>}<MiniTimer minutes={15}/></div></div>
      {!drill.sentences.length ? <div style={{marginTop:10}}>
        <div className="muted" style={{fontSize:12}}>The bot reads a short paragraph (4–5 sentences); you repeat the whole thing aloud. It records every attempt and reviews your mistakes at the end.</div>
        <button className="btn sm" style={{marginTop:8}} onClick={startDrill} disabled={busy==="drill"}>{busy==="drill"?"🤖 Preparing…":"▶ Start drill"}</button>
      </div> : drill.idx<drill.sentences.length ? <div style={{marginTop:10}}>
        <div style={{padding:14,borderRadius:12,background:"rgba(6,182,212,.10)",border:"1px solid rgba(6,182,212,.28)",fontSize:16,lineHeight:1.6}}>{drill.sentences[drill.idx]} <button className="btn ghost sm" style={{marginLeft:6}} onClick={()=>speak(drill.sentences[drill.idx])}>🔊 Hear</button></div>
        <div className="row" style={{gap:8,marginTop:10,flexWrap:"wrap"}}>
          <button className={"btn "+(listening&&micCtx==="drill"?"":"ghost")+" sm"} onClick={listening?stopListening:()=>startListening((t:string)=>recordAttempt(t),"drill")} disabled={busy!==""||(listening&&micCtx!=="drill")} style={listening&&micCtx==="drill"?{background:"linear-gradient(100deg,var(--pink),var(--orange))"}:{}}>{listening&&micCtx==="drill"?"⏹ Done — next paragraph":"🎙️ Repeat the paragraph"}</button>
          <button className="btn ghost sm" onClick={()=>recordAttempt("(skipped)")}>Skip</button>
          <button className="btn ghost sm" onClick={reviewDrill} disabled={busy==="dreview"}>{busy==="dreview"?"🤖…":"Finish & review"}</button>
        </div>
        {listening&&micCtx==="drill" && (chatIn||"").trim() && <div className="muted" style={{fontSize:12,marginTop:8}}>Heard: {chatIn}</div>}
        <div className="muted" style={{fontSize:11,marginTop:6}}>Recorded {drill.attempts.length} paragraph(s). Read the whole paragraph, then tap “Done — next paragraph”.</div>
      </div> : <div style={{marginTop:10}}>
        <div className="muted" style={{fontSize:13}}>All {drill.sentences.length} sentences done — recorded {drill.attempts.length}.</div>
        <button className="btn sm" style={{marginTop:8}} onClick={reviewDrill} disabled={busy==="dreview"}>{busy==="dreview"?"🤖 Reviewing…":"📋 Review my mistakes"}</button>
      </div>}
      {drill.review && <div style={{marginTop:12,padding:12,borderRadius:12,background:"rgba(255,255,255,.03)",border:"1px solid var(--stroke)",fontSize:13,color:"#d5dbe6"}} dangerouslySetInnerHTML={{__html:mdToHtml(drill.review)}}/>}
      {drill.sentences.length>0 && <div style={{marginTop:8}}><button className="btn ghost sm" onClick={restartDrill}>↺ New drill</button></div>}
    </div>

    <div className="card" style={{marginTop:16}}>
      <div className="between" style={{flexWrap:"wrap",gap:8}}><div className="row" style={{gap:8}}><Chip tint="pink">🗣️</Chip><strong>5 · Pronunciation practice</strong></div>{pron.items.length>0 && <span className="muted" style={{fontSize:12}}>{Math.min(pron.idx,pron.items.length)}/{pron.items.length} · ✅ {pron.right}</span>}</div>
      {!pron.items.length ? <div style={{marginTop:10}}><div className="muted" style={{fontSize:12}}>Hear a word, say it back — it checks your pronunciation and gives a tip.</div><button className="btn sm" style={{marginTop:8}} onClick={startPron} disabled={busy==="pron"}>{busy==="pron"?"🤖…":"▶ Start"}</button></div>
      : pron.idx<pron.items.length ? <div style={{marginTop:10}}>
        <div style={{padding:14,borderRadius:12,background:"rgba(236,72,153,.10)",border:"1px solid rgba(236,72,153,.28)"}}>
          <div style={{fontSize:20,fontWeight:700}}>{pron.items[pron.idx].word} <button className="btn ghost sm" style={{marginLeft:6}} onClick={()=>speak(pron.items[pron.idx].word)}>🔊 Hear</button></div>
          {pron.items[pron.idx].tip && <div className="muted" style={{fontSize:12,marginTop:4}}>💡 {pron.items[pron.idx].tip}</div>}
        </div>
        {!pron.last ? <div className="row" style={{gap:8,marginTop:10,flexWrap:"wrap"}}>
          <button className={"btn "+(listening&&micCtx==="pron"?"":"ghost")+" sm"} onClick={listening?stopListening:()=>startListening((t:string)=>checkPron(t),"pron")} disabled={busy!==""||(listening&&micCtx!=="pron")} style={listening&&micCtx==="pron"?{background:"linear-gradient(100deg,var(--pink),var(--orange))"}:{}}>{listening&&micCtx==="pron"?"⏹ Done":"🎙️ Say it"}</button>
          <button className="btn ghost sm" onClick={nextPron}>Skip</button>
        </div> : <div style={{marginTop:10}}>
          <div style={{fontSize:14,fontWeight:700,color:pron.last.ok?"#6ee7b7":"#f9a8d4"}}>{pron.last.ok?"✅ Great pronunciation!":"❌ Not quite"}</div>
          <div className="muted" style={{fontSize:12,marginTop:3}}>Heard: “{pron.last.said||"—"}” · Target: “{pron.last.word}”{pron.last.tip?` · 💡 ${pron.last.tip}`:""}</div>
          <div className="row" style={{gap:8,marginTop:8}}><button className="btn ghost sm" onClick={()=>{ savePron({last:null}); }}>🎙️ Try again</button><button className="btn sm" onClick={nextPron}>Next →</button></div>
        </div>}
      </div> : <div style={{marginTop:10}}><div className="muted" style={{fontSize:13}}>Done! ✅ {pron.right}/{pron.items.length} good.</div><button className="btn sm" style={{marginTop:8}} onClick={startPron} disabled={busy==="pron"}>↺ New set</button></div>}
    </div>

    <div className="card" style={{marginTop:16}}>
      <div className="between" style={{flexWrap:"wrap",gap:8}}><div className="row" style={{gap:8}}><Chip tint="orange">🔤</Chip><strong>6 · Spelling practice (dictation)</strong></div>{spell.items.length>0 && <span className="muted" style={{fontSize:12}}>{Math.min(spell.idx,spell.items.length)}/{spell.items.length} · ✅ {spell.right}</span>}</div>
      {!spell.items.length ? <div style={{marginTop:10}}><div className="muted" style={{fontSize:12}}>The bot says a word (hidden) — you type the spelling. It checks and shows the correct spelling.</div><button className="btn sm" style={{marginTop:8}} onClick={startSpell} disabled={busy==="spell"}>{busy==="spell"?"🤖…":"▶ Start"}</button></div>
      : spell.idx<spell.items.length ? <div style={{marginTop:10}}>
        <div className="row" style={{gap:8,flexWrap:"wrap",alignItems:"center"}}>
          <button className="btn sm" onClick={()=>speak(spell.items[spell.idx].word)}>🔊 Hear the word</button>
          {spell.items[spell.idx].hint && <span className="muted" style={{fontSize:12}}>💡 {spell.items[spell.idx].hint}</span>}
        </div>
        {!spell.last ? <div className="row" style={{gap:8,marginTop:10,flexWrap:"wrap"}}>
          <input className="in" value={spell.input} onChange={e=>saveSpell({input:e.target.value})} placeholder="Type the spelling…" style={{flex:1,minWidth:160}} onKeyDown={e=>{ if(e.key==="Enter") checkSpell(); }}/>
          <button className="btn sm" onClick={checkSpell} disabled={!(spell.input||"").trim()}>Check</button>
          <button className="btn ghost sm" onClick={nextSpell}>Skip</button>
        </div> : <div style={{marginTop:10}}>
          <div style={{fontSize:14,fontWeight:700,color:spell.last.ok?"#6ee7b7":"#f9a8d4"}}>{spell.last.ok?"✅ Correct!":"❌ Not quite"}</div>
          <div className="muted" style={{fontSize:12,marginTop:3}}>You typed: “{spell.last.typed||"—"}” · Correct: <b style={{color:"#E7ECF3"}}>{spell.last.word}</b></div>
          <button className="btn sm" style={{marginTop:8}} onClick={nextSpell}>Next →</button>
        </div>}
      </div> : <div style={{marginTop:10}}><div className="muted" style={{fontSize:13}}>Done! ✅ {spell.right}/{spell.items.length} correct.</div><button className="btn sm" style={{marginTop:8}} onClick={startSpell} disabled={busy==="spell"}>↺ New set</button></div>}
    </div>
  </>;
}
