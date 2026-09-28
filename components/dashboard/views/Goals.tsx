"use client";
import { useEffect, useState } from "react";
import { demoLink, exEmoji, HOWTO } from "@/lib/exercise-guide";
import { LS, dstrD, SS, seedAllCourses, seedWorkoutPlan, today, COURSE_RES, planKey, uid, firstUrl, loadPlan, courseStart, loadStudy, studyKey, PLAN_DEF, GYM_TYPES, EX_LIB, loadNut, nutKey, SESS_EMOJI, SESS_GRAD, EX_TYPES, OPT, printNotes, mdToHtml } from "@/components/dashboard/data";
import { Head, Bar, Chip, PRow } from "@/components/dashboard/ui";
import { PlanCalendar } from "@/components/dashboard/views/Calendar";

/* ---------- GOALS ---------- */
export function Goals({ sett, tick }: any) {
  const start=new Date(sett.planStart); const dayNo=Math.max(0,Math.floor((Date.now()-start.getTime())/86400000)); const pct=Math.min(100,Math.round(dayNo/sett.planDays*100));
  useEffect(()=>{ if(LS("pos_seed_all","")==="v2dsa") return; const t=dstrD(new Date()); SS("pos_course_start",t); const [y,m,d]=t.split("-").map(Number); seedAllCourses(new Date(y,m-1,d),true); SS("pos_seed_all","v2dsa"); },[]);
  useEffect(()=>{ const v=LS("pos_seed_workout",""); if(v==="v3") return; SS("pos_workout_start","2026-09-01"); seedWorkoutPlan(new Date(2026,8,1),125,true); SS("pos_seed_workout","v3"); },[]);
  return <>
    <Head t="Goals" p={`${sett.planDays}-day transformation`} />
    <div className="card" style={{background:"linear-gradient(120deg,rgba(236,72,153,.15),rgba(99,102,241,.12))"}}>
      <div className="between"><strong>{sett.planDays}-Day Transformation</strong><span className="in" style={{padding:"4px 10px"}}>{sett.planDays-dayNo} days left</span></div>
      <div className="val" style={{fontSize:30,fontWeight:770,marginTop:10}}>{pct}%</div><Bar v={pct} goal={100} color="linear-gradient(90deg,var(--pink),var(--indigo))"/>
      <div className="muted" style={{marginTop:6}}>Day {dayNo} of {sett.planDays} · started {sett.planStart}</div>
    </div>
    <GoalPlanner sett={sett} mode="goals"/>
    <PlanCalendar sett={sett}/>
  </>;
}
export function CoursePlanner(){
  const [course,setCourse]=useState("Complete Agentic AI Course In 10 Hours — LangChain, LangGraph, RAG, Vectorless RAG, Guardrails, Evals (Krish Naik)");
  const [startD,setStartD]=useState(today());
  const [days,setDays]=useState("15"); const [hrs,setHrs]=useState("1.5");
  const [video,setVideo]=useState("https://www.youtube.com/watch?v=rV3HJ4LEZ7k");
  const [res,setRes]=useState(COURSE_RES);
  const [busy,setBusy]=useState(false); const [preview,setPreview]=useState<any[]|null>(null); const [msg,setMsg]=useState("");
  const gen=async()=>{ setBusy(true); setMsg(""); setPreview(null);
    try{ const r=await fetch("/api/course-plan",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({course,days:+days||15,hoursPerDay:+hrs||1.5,videoUrl:video,resources:res})}); const d=await r.json();
      if(Array.isArray(d.days)&&d.days.length) setPreview(d.days); else setMsg(d.error||"No plan returned."); }catch(e){ setMsg("Failed — check your AI key."); } setBusy(false); };
  const addToGoals=()=>{ if(!preview) return; const st=new Date(startD);
    preview.forEach((day:any,i:number)=>{ const d=new Date(st); d.setDate(d.getDate()+i); const ds=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
      const key=planKey(ds); const cur:any=LS(key,{}); const list=Array.isArray(cur.studyList)?cur.studyList:[];
      list.push({id:uid(),label:`Day ${i+1}: ${day.title}`,hours:hrs,plan:(day.tasks||[]).map((t:any)=>({time:t.time,task:t.task})),next:[],video:day.video||"",resource:day.resource||"",courseVideo:video});
      SS(key,{...cur,studyList:list}); });
    const end=new Date(st); end.setDate(end.getDate()+preview.length-1); const es=`${end.getFullYear()}-${String(end.getMonth()+1).padStart(2,"0")}-${String(end.getDate()).padStart(2,"0")}`;
    setMsg(`✓ Added ${preview.length}-day plan to Goals: ${startD} → ${es}. Open each day's Study section to see topics, links & video timing.`);
  };
  return <div className="card" style={{marginBottom:16,background:"linear-gradient(120deg,rgba(168,85,247,.12),rgba(59,130,246,.08))"}}>
    <div className="row" style={{gap:8}}><Chip tint="purple">🎓</Chip><strong>Course Planner — spread a course across days</strong></div>
    <div className="muted" style={{fontSize:12,marginTop:4}}>Give a course + video + resource links. AI builds a day-by-day study plan and drops it into your Goals.</div>
    <input className="in" value={course} onChange={e=>setCourse(e.target.value)} placeholder="Course name" style={{width:"100%",marginTop:10}}/>
    <div className="row" style={{gap:8,marginTop:8,flexWrap:"wrap"}}>
      <input className="in" type="date" value={startD} onChange={e=>setStartD(e.target.value)} style={{width:150}} title="Start date"/>
      <input className="in" type="number" value={days} onChange={e=>setDays(e.target.value)} placeholder="Days" style={{width:80}} title="Days"/>
      <input className="in" type="number" step="0.5" value={hrs} onChange={e=>setHrs(e.target.value)} placeholder="Hrs/day" style={{width:90}} title="Hours per day"/>
      <input className="in" value={video} onChange={e=>setVideo(e.target.value)} placeholder="Course video URL" style={{flex:1,minWidth:180}}/>
    </div>
    <textarea className="in" value={res} onChange={e=>setRes(e.target.value)} placeholder="Resource links (one per line)" style={{width:"100%",minHeight:90,marginTop:8,fontSize:12}}/>
    <div className="row" style={{gap:8,marginTop:10,flexWrap:"wrap"}}>
      <button className="btn" onClick={gen} disabled={busy}>{busy?"🤖 Building plan…":"✨ Generate day-by-day plan"}</button>
      {preview && <button className="btn" onClick={addToGoals} style={{background:"linear-gradient(100deg,var(--emerald),var(--blue))"}}>➕ Add all {preview.length} days to Goals</button>}
    </div>
    {msg && <div style={{fontSize:12,marginTop:8,color:msg[0]==="✓"?"#6ee7b7":"#f9a8d4"}}>{msg}</div>}
    {preview && <div style={{marginTop:12,maxHeight:340,overflowY:"auto"}}>
      {preview.map((day:any,i:number)=>{ const st=new Date(startD); st.setDate(st.getDate()+i); const ds=st.toLocaleDateString(undefined,{month:"short",day:"numeric"});
        return <div key={i} style={{padding:"10px 0",borderTop:i?"1px solid rgba(255,255,255,.07)":"none"}}>
          <div className="between"><strong style={{fontSize:13}}>Day {i+1} · {ds} — {day.title}</strong></div>
          {day.video && <div className="muted" style={{fontSize:12,marginTop:3}}>📺 {day.video}</div>}
          {day.resource && <div style={{fontSize:12,marginTop:2}}>🔗 <a href={firstUrl(day.resource)||day.resource} target="_blank" rel="noopener" style={{color:"#7dd3fc"}}>{day.resource}</a></div>}
          <ul className="list" style={{marginTop:4}}>{(day.tasks||[]).map((t:any,ti:number)=><li key={ti} style={{fontSize:12,padding:"3px 0"}}><b style={{color:"#c4b5fd"}}>{t.time}</b> — {t.task}</li>)}</ul>
        </div>; })}
    </div>}
  </div>;
}
export function GoalPlanner({ sett, mode="all" }: any) {
  const days=sett.planDays||120;
  const [sel,setSel]=useState(today());
  const [p,setP]=useState<any>(loadPlan(today()));
  const [,setT]=useState(0);
  const [fixBusy,setFixBusy]=useState(false); const [fixMsg,setFixMsg]=useState("");
  const [mealBusy,setMealBusy]=useState(""); const [studyBusy,setStudyBusy]=useState(false); const [saved,setSaved]=useState(""); const [undoSnap,setUndoSnap]=useState<any>(null);
  const refresh=()=>setT((x:number)=>x+1);
  const snap=(label:string)=>{ setUndoSnap({date:sel,label,data:JSON.parse(JSON.stringify(LS(planKey(sel),{})))}); };
  const doUndo=()=>{ if(!undoSnap) return; SS(planKey(undoSnap.date),undoSnap.data); if(undoSnap.date===sel) setP(loadPlan(sel)); const lbl=undoSnap.label; setUndoSnap(null); setT((x:number)=>x+1); refresh(); setSaved("↩ Restored: "+lbl); };
  const restoreCourses=()=>{ if(confirm("Restore all 3 study courses from your start date ("+dstrD(courseStart())+")? This re-adds any deleted course days on their correct dates. Your own subjects, workouts, meals & journals stay; course progress ticks reset.")){ seedAllCourses(courseStart(),true); setP(loadPlan(sel)); setT((x:number)=>x+1); refresh(); setSaved("✓ Course study plans restored."); } };
  const [courseStartInput,setCourseStartInput]=useState(LS("pos_course_start","")||today());
  const applyCourseStart=()=>{ if(!courseStartInput) return; if(!confirm("Re-anchor all 3 courses to START on "+courseStartInput+"? Day 1 moves to that date and the rest follow. Course progress ticks reset.")) return; SS("pos_course_start",courseStartInput); const [y,m,d]=courseStartInput.split("-").map(Number); seedAllCourses(new Date(y,m-1,d),true); setP(loadPlan(sel)); setT((x:number)=>x+1); refresh(); setSaved("✓ Courses re-anchored to start "+courseStartInput); };
  const [exTab,setExTab]=useState(""); const [studyTab,setStudyTab]=useState("");
  const [mealDraft,setMealDraft]=useState<any>({breakfast:{time:"",food:""},lunch:{time:"",food:""},dinner:{time:"",food:""}});
  const [mealPrev,setMealPrev]=useState<any>({}); const [mealMod,setMealMod]=useState<any>({});
  const [studyDraft,setStudyDraft]=useState<any>({label:"",hours:""});
  const [exPrompt,setExPrompt]=useState(""); const [exEditBusy,setExEditBusy]=useState(false); const [planInfo,setPlanInfo]=useState<string|null>(null); const [notesBusy,setNotesBusy]=useState(""); const [askText,setAskText]=useState(""); const [codeBusy,setCodeBusy]=useState("");
  const genCode=async(subj:any)=>{ setCodeBusy(subj.id);
    try{ const topic=(subj.label||"").replace(/^.*?:\s*/,""); const r=await fetch("/api/code",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({course:subj.label,topic,brief:subj.brief,videos:subj.video})}); const d=await r.json();
      if(d.code){ save({studyList:(p.studyList||[]).map((s:any)=>s.id===subj.id?{...s,codeFile:{filename:d.filename||"code.txt",lang:d.lang||"",code:d.code}}:s)}); } else alert(d.error||"Failed to generate code."); }
    catch(e){ alert("Failed — check your AI key."); } setCodeBusy(""); };
  const copyCode=(code:string)=>{ try{ (navigator as any).clipboard.writeText(code); alert("Code copied ✓"); }catch(e){ alert("Copy failed — select & copy manually."); } };
  const downloadCode=(cf:any)=>{ try{ const a=document.createElement("a"); a.href=URL.createObjectURL(new Blob([cf.code],{type:"text/plain"})); a.download=cf.filename||"code.txt"; a.click(); }catch(e){} };
  const vscodeRepo=(url:string)=>{ const m=String(url||"").match(/github\.com\/([^\/]+)\/([^\/#?]+)/); return m?`https://vscode.dev/github/${m[1]}/${m[2]}`:""; };
  const [timer,setTimer]=useState<any>(null); const [nowTs,setNowTs]=useState(0);
  useEffect(()=>{ if(!timer || !timer.startedAt) return; const id=setInterval(()=>setNowTs(Date.now()),1000); return ()=>clearInterval(id); },[timer]);
  const fmtEl=(secs:number)=>`${String(Math.floor(secs/60)).padStart(2,"0")}:${String(secs%60).padStart(2,"0")}`;
  const elapsedSec=(tm:any)=> tm? Math.max(0,Math.floor((tm.accum||0) + (tm.startedAt? (nowTs-tm.startedAt)/1000 : 0))) : 0;
  const startTask=(subj:any,idx:number,timeStr:string)=>{ const key=subj.id+"#"+idx; if(timer && timer.key!==key){ alert("Log or finish the running timer first."); return; } const tgt=parseInt(String(timeStr))||0; setTimer({key,id:subj.id,idx,target:tgt,accum:0,startedAt:Date.now(),onBreak:false}); setNowTs(Date.now()); };
  const pauseTimer=(brk:boolean)=>{ setTimer((t:any)=> !t?t: (t.startedAt? {...t,accum:(t.accum||0)+(Date.now()-t.startedAt)/1000,startedAt:null,onBreak:!!brk} : {...t,onBreak:!!brk}) ); };
  const resumeTimer=()=>{ setTimer((t:any)=> t&&!t.startedAt? {...t,startedAt:Date.now(),onBreak:false}:t); setNowTs(Date.now()); };
  const logTask=(subj:any)=>{ if(!timer) return; const secs=(timer.accum||0)+(timer.startedAt?(Date.now()-timer.startedAt)/1000:0); const mins=Math.max(0,Math.round(secs/60)); const idx=timer.idx;
    save({studyList:(p.studyList||[]).map((s:any)=>{ if(s.id!==subj.id) return s; const plan=(s.plan||[]).map((t:any,i:number)=>i===idx?{...t,done:true}:t); return {...s,plan,studied:(+s.studied||0)+mins}; })});
    try{ const sd:any=loadStudy(sel); const k=subj.courseId||"study"; sd[k]=(sd[k]||0)+mins; SS(studyKey(sel),sd); }catch(e){}
    setTimer(null); setSaved("⏱ Logged "+mins+" min · task done"); };
  const [exChat,setExChat]=useState(""); const [stChat,setStChat]=useState(""); const [chatBusy,setChatBusy]=useState("");
  const [opMode,setOpMode]=useState("swap"); const [dayA,setDayA]=useState(today()); const [dayB,setDayB]=useState(""); const [opPrompt,setOpPrompt]=useState("");
  const buildExDay=(ds:string)=>{ const c:any=LS(planKey(ds),{}); return {date:ds,sessions:(c.exSessions||[]).map((s:any)=>({type:s.type,time:s.time||"",exercises:(s.selected||[]).map((x:any)=>({name:x.name,sets:+x.sets||0,reps:+x.reps||0,weight:+x.weight||0}))}))}; };
  const applyExDays=(resDays:any[],okMsg:string)=>{ resDays.forEach((dd:any)=>{ if(!dd.date)return; const c:any=LS(planKey(dd.date),{}); const exSessions=(dd.sessions||[]).map((s:any)=>({id:uid(),time:s.time||"",type:s.type||"Workout",done:false,steps:"",distance:"",duration:"",detail:"",selected:(s.exercises||[]).map((x:any)=>({name:x.name,sets:String(x.sets||3),reps:String(x.reps||10),weight:String(x.weight||""),note:""}))})); SS(planKey(dd.date),{...c,exSessions}); }); setP(loadPlan(sel)); setT((x:number)=>x+1); refresh(); setSaved(okMsg); };
  const runExEdit=async(daysList:any[],prompt:string,okMsg:string)=>{ setChatBusy("ex"); snap("Exercise edit");
    try{ const r=await fetch("/api/plan-edit",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({kind:"exercise",days:daysList,prompt})}); if(!r.ok){ alert(r.status===404?"Deploy the latest build first (needs /api/plan-edit).":`Server error ${r.status} — try a shorter prompt.`); setChatBusy(""); return; } const d=await r.json(); if(Array.isArray(d.days)) applyExDays(d.days,okMsg); else alert(d.error||"Couldn't apply that change."); }
    catch(e:any){ alert("Network error: "+(e?.message||"request failed")); } setChatBusy(""); };
  const swapDays=()=>{ if(!dayB||dayA===dayB){ alert("Pick two different days to swap."); return; } snap("Swapped days"); const ca:any=LS(planKey(dayA),{}); const cb:any=LS(planKey(dayB),{}); const ea=Array.isArray(ca.exSessions)?ca.exSessions:[]; const eb=Array.isArray(cb.exSessions)?cb.exSessions:[]; SS(planKey(dayA),{...ca,exSessions:eb}); SS(planKey(dayB),{...cb,exSessions:ea}); setP(loadPlan(sel)); setT((x:number)=>x+1); refresh(); setSaved("✓ Swapped "+dayA+" ↔ "+dayB); };
  const modifyDayEx=()=>{ if(!opPrompt.trim()){ alert("Type what to change."); return; } runExEdit([buildExDay(dayA)],opPrompt,"✓ "+dayA+" workout modified."); setOpPrompt(""); };
  const addDayEx=()=>{ if(!opPrompt.trim()){ alert("Describe the workout to add."); return; } runExEdit([buildExDay(dayA)],"Add a NEW workout session to this day, keeping any existing sessions: "+opPrompt,"✓ Session added to "+dayA); setOpPrompt(""); };
  const applyExerciseChat=async()=>{ if(!exChat.trim())return; setChatBusy("ex"); snap("Exercise 10-day edit");
    const days:any[]=[]; for(let i=0;i<10;i++){ const ds=addDaysD(today(),i); const c:any=LS(planKey(ds),{}); days.push({date:ds,sessions:(c.exSessions||[]).map((s:any)=>({type:s.type,time:s.time||"",exercises:(s.selected||[]).map((x:any)=>({name:x.name,sets:+x.sets||0,reps:+x.reps||0,weight:+x.weight||0}))}))}); }
    try{ const r=await fetch("/api/plan-edit",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({kind:"exercise",days,prompt:exChat})});
      if(!r.ok){ alert(r.status===404?"Update not live yet — deploy the latest build (this feature needs the new /api/plan-edit route).":`Server error ${r.status} — the AI edit may have timed out. Try a shorter prompt.`); setChatBusy(""); return; }
      const d=await r.json();
      if(Array.isArray(d.days)){ d.days.forEach((dd:any)=>{ if(!dd.date)return; const c:any=LS(planKey(dd.date),{}); const exSessions=(dd.sessions||[]).map((s:any)=>({id:uid(),time:s.time||"",type:s.type||"Workout",done:false,steps:"",distance:"",duration:"",detail:"",selected:(s.exercises||[]).map((x:any)=>({name:x.name,sets:String(x.sets||3),reps:String(x.reps||10),weight:String(x.weight||""),note:""}))})); SS(planKey(dd.date),{...c,exSessions}); }); setExChat(""); setP(loadPlan(sel)); setT((x:number)=>x+1); refresh(); setSaved("✓ Exercise 10-day plan updated."); } else alert(d.error||"Couldn't apply that change."); }
    catch(e:any){ alert("Network error: "+(e?.message||"request failed")+". Check you're online and on the latest build."); } setChatBusy(""); };
  const applyStudyChat=async()=>{ if(!stChat.trim())return; setChatBusy("st"); snap("Study 10-day edit");
    const pool:any={}; const days:any[]=[]; for(let i=0;i<10;i++){ const ds=addDaysD(today(),i); const c:any=LS(planKey(ds),{}); (c.studyList||[]).forEach((s:any)=>{ if(!pool[s.label]) pool[s.label]=s; }); days.push({date:ds,subjects:(c.studyList||[]).map((s:any)=>({label:s.label,brief:s.brief||""}))}); }
    try{ const r=await fetch("/api/plan-edit",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({kind:"study",days,prompt:stChat})});
      if(!r.ok){ alert(r.status===404?"Update not live yet — deploy the latest build (this feature needs the new /api/plan-edit route).":`Server error ${r.status} — the AI edit may have timed out. Try a shorter prompt.`); setChatBusy(""); return; }
      const d=await r.json();
      if(Array.isArray(d.days)){ d.days.forEach((dd:any)=>{ if(!dd.date)return; const c:any=LS(planKey(dd.date),{}); const studyList=(dd.subjects||[]).map((it:any)=>{ const ex=pool[it.label]; return ex? {...ex, brief: it.brief||ex.brief} : {id:uid(),label:it.label,brief:it.brief||"",plan:[],next:[]}; }); SS(planKey(dd.date),{...c,studyList}); }); setStChat(""); setP(loadPlan(sel)); setT((x:number)=>x+1); refresh(); setSaved("✓ Study 10-day plan updated."); } else alert(d.error||"Couldn't apply that change."); }
    catch(e:any){ alert("Network error: "+(e?.message||"request failed")+". Check you're online and on the latest build."); } setChatBusy(""); };
  const askClaude=(subj:any)=>{ const topic=(subj.label||"").replace(/^.*?:\s*/,""); const q=`I'm studying "${topic}"${subj.video?` (lectures: ${String(subj.video).replace(/^▶\s*/,"")})`:""}. ${askText.trim()||"Explain this topic in detail with theory, examples and common interview questions."}`; window.open("https://claude.ai/new?q="+encodeURIComponent(q),"_blank"); };
  const genNotes=async(subj:any)=>{ setNotesBusy(subj.id);
    try{ const topic=(subj.label||"").replace(/^.*?:\s*/,""); const r=await fetch("/api/notes",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({course:subj.label,topic,brief:subj.brief,videos:subj.video})}); const d=await r.json();
      if(d.notes){ save({studyList:(p.studyList||[]).map((s:any)=>s.id===subj.id?{...s,notes:d.notes}:s)}); } else alert(d.error||"Failed to generate notes."); }
    catch(e){ alert("Failed — check your AI key."); } setNotesBusy(""); };
  useEffect(()=>{ const pl=loadPlan(sel); setP(pl); setFixMsg(""); setSaved("");
    setExTab((pl.exSessions[0]||{}).id||""); setStudyTab((pl.studyList[0]||{}).id||"");
    setMealDraft({breakfast:{time:"",food:""},lunch:{time:"",food:""},dinner:{time:"",food:""}}); setStudyDraft({label:"",hours:""}); },[sel]);
  const save=(patch:any)=>{ const n={...p,...patch}; setP(n); SS(planKey(sel),n); setT(x=>x+1); setSaved(""); };
  const doSave=()=>{ SS(planKey(sel),p); setSaved("✓ Saved "+new Date().toLocaleTimeString(undefined,{hour:"numeric",minute:"2-digit"})+" — synced for the future"); };
  const clearEx=()=>{ if(confirm("Clear all exercise sessions for this day?")){ snap("Exercise cleared"); save({exSessions:[]}); } };
  const clearMeals=()=>{ if(confirm("Clear all meals for this day?")){ snap("Meals cleared"); save({meals:{breakfast:[],lunch:[],dinner:[]}}); } };
  const clearStudy=()=>{ if(confirm("Clear all study subjects for this day?")){ snap("Study cleared"); save({studyList:[]}); } };
  const clearJournal=()=>{ if(confirm("Clear the journal for this day?")){ snap("Journal cleared"); save({journal:""}); } };
  const clearDay=()=>{ if(confirm("Clear the WHOLE plan for "+sel+"?")){ snap("Whole day cleared"); const blank=JSON.parse(JSON.stringify(PLAN_DEF)); setP(blank); SS(planKey(sel),blank); setT(x=>x+1); setSaved(""); setExTab(""); setStudyTab(""); } };
  const clearBtn=(fn:()=>void)=><button className="btn ghost sm" onClick={fn}>🗑 Clear</button>;
  const actBtns=(skipFn:()=>void,clearFn:()=>void)=><div className="row" style={{gap:8}}><button className="btn ghost sm" onClick={skipFn}>😴 Skip/Rest</button><button className="btn ghost sm" onClick={clearFn}>🗑 Clear</button></div>;
  const shift=(n:number)=>{ const d=new Date(sel); d.setDate(d.getDate()+n); setSel(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`); };
  const addDaysD=(ds:string,n:number)=>{ const [y,m,dd]=ds.split("-").map(Number); return dstrD(new Date(y,m-1,dd+n)); };
  const emptyMeals=()=>({breakfast:[],lunch:[],dinner:[]});
  const hasCat=(c:any,cat:string)=> cat==="meals" ? !!(c&&c.meals&&((c.meals.breakfast||[]).length||(c.meals.lunch||[]).length||(c.meals.dinner||[]).length)) : !!(c&&Array.isArray(c[cat])&&c[cat].length);
  const shiftCategory=(fromDs:string,cat:string,n:number)=>{ const dates:string[]=[]; for(let i=0;i<250;i++){ const ds=addDaysD(fromDs,i); const c:any=LS(planKey(ds),null); if(hasCat(c,cat)) dates.push(ds); }
    dates.sort().reverse().forEach(ds=>{ const c:any=LS(planKey(ds),{}); const tgt=addDaysD(ds,n); const tc:any=LS(planKey(tgt),{});
      if(cat==="meals"){ const cm=c.meals||emptyMeals(); const tm=tc.meals||emptyMeals(); SS(planKey(tgt),{...tc,meals:{breakfast:[...(tm.breakfast||[]),...(cm.breakfast||[])],lunch:[...(tm.lunch||[]),...(cm.lunch||[])],dinner:[...(tm.dinner||[]),...(cm.dinner||[])]}}); SS(planKey(ds),{...c,meals:emptyMeals()}); }
      else { SS(planKey(tgt),{...tc,[cat]:[...(Array.isArray(tc[cat])?tc[cat]:[]),...(Array.isArray(c[cat])?c[cat]:[])]}); SS(planKey(ds),{...c,[cat]:[]}); }
    });
  };
  const afterShift=(msg:string)=>{ setT(x=>x+1); refresh(); setP(loadPlan(sel)); alert(msg); };
  const skipExercise=()=>{ if(!confirm("Rest from EXERCISE on "+sel+"? Your exercise plan from here shifts forward 1 day (nothing lost).")) return; shiftCategory(sel,"exSessions",1); afterShift("✓ Exercise rested on "+sel+" — exercise plan shifted forward 1 day."); };
  const skipMeals=()=>{ if(!confirm("Skip MEALS plan on "+sel+"? Your meal plan from here shifts forward 1 day.")) return; shiftCategory(sel,"meals",1); afterShift("✓ Meals shifted forward 1 day from "+sel+"."); };
  const skipStudy=()=>{ if(!confirm("Rest from STUDY on "+sel+"? Your study plan from here shifts forward 1 day (no day is lost).")) return; shiftCategory(sel,"studyList",1); afterShift("✓ Study rested on "+sel+" — study plan shifted forward 1 day."); };
  const skipRestDay=()=>{ if(!confirm("Full REST day on "+sel+"? Exercise, meals AND study all shift forward 1 day.")) return; shiftCategory(sel,"exSessions",1); shiftCategory(sel,"meals",1); shiftCategory(sel,"studyList",1); afterShift("✓ "+sel+" is a full rest day — everything shifted forward 1 day."); };
  const isGymSess=(s:any)=>GYM_TYPES.includes(s.type);
  const awayDay=()=>{ if(!confirm("Mark "+sel+" as AWAY?\nYou still walk your 11,000 steps, but every GYM session from here shifts forward 1 day — nothing is skipped.")) return; snap("Away day");
    const dates:string[]=[]; for(let i=0;i<220;i++){ const ds=addDaysD(sel,i); const c:any=LS(planKey(ds),null); if(c&&Array.isArray(c.exSessions)&&c.exSessions.some(isGymSess)) dates.push(ds); }
    dates.sort().reverse().forEach(ds=>{ const nd=addDaysD(ds,1); const c:any=LS(planKey(ds),{}); const gym=(c.exSessions||[]).filter(isGymSess).map((g:any)=>({...g,done:false,selected:(g.selected||[]).map((x:any)=>({...x,done:false}))})); const keep=(c.exSessions||[]).filter((s:any)=>!isGymSess(s)); SS(planKey(ds),{...c,exSessions:keep}); const cn:any=LS(planKey(nd),{}); const others=(cn.exSessions||[]); SS(planKey(nd),{...cn,exSessions:[...others,...gym]}); });
    afterShift("✓ "+sel+" set as Away — gym shifted forward 1 day. Keep your 11,000-step walk today."); };
  const [woStartInput,setWoStartInput]=useState(LS("pos_workout_start","")||today());
  const applyWorkoutSeed=()=>{ if(!woStartInput) return; if(!confirm("Load the 125-day workout cycle starting "+woStartInput+"?\nPush → Pull → Legs → Rest → Push → Pull → Legs → Biceps&Triceps (repeats), plus an 11,000-step walk every day. Your own added sessions stay; only auto-loaded ones refresh.")) return; SS("pos_workout_start",woStartInput); const [y,m,d]=woStartInput.split("-").map(Number); seedWorkoutPlan(new Date(y,m-1,d),125,true); SS("pos_seed_workout","v1"); setP(loadPlan(sel)); setT((x:number)=>x+1); refresh(); setSaved("✓ 125-day workout plan loaded from "+woStartInput); };
  const courseName=(cid:string)=> cid==="agentic"?"Agentic AI": cid==="sysdesign"?"System Design": cid==="dsa"?"DSA": "this subject";
  const shiftCourse=(cid:string,fromDs:string,n:number)=>{ const dates:string[]=[]; for(let i=0;i<320;i++){ const ds=addDaysD(fromDs,i); const c:any=LS(planKey(ds),null); if(c&&Array.isArray(c.studyList)&&c.studyList.some((s:any)=>s.courseId===cid)) dates.push(ds); }
    dates.sort().reverse().forEach(ds=>{ const c:any=LS(planKey(ds),{}); const tgt=addDaysD(ds,n); const tc:any=LS(planKey(tgt),{}); const moving=(c.studyList||[]).filter((s:any)=>s.courseId===cid); const staying=(c.studyList||[]).filter((s:any)=>s.courseId!==cid);
      SS(planKey(tgt),{...tc,studyList:[...(Array.isArray(tc.studyList)?tc.studyList:[]),...moving]}); SS(planKey(ds),{...c,studyList:staying}); }); };
  const skipSubject=(subj:any)=>{ const cid=subj.courseId;
    if(cid){ if(!confirm("Rest/skip "+courseName(cid)+" on "+sel+"? Only this course shifts forward 1 day (nothing lost).")) return; snap("Skipped "+courseName(cid)); shiftCourse(cid,sel,1); afterShift("✓ "+courseName(cid)+" shifted forward 1 day from "+sel+"."); }
    else { if(!confirm("Skip this subject on "+sel+"? It moves to tomorrow.")) return; snap("Subject skipped"); const cur:any=LS(planKey(sel),{}); const stay=(cur.studyList||[]).filter((s:any)=>s.id!==subj.id); SS(planKey(sel),{...cur,studyList:stay}); const tgt=addDaysD(sel,1); const tc:any=LS(planKey(tgt),{}); SS(planKey(tgt),{...tc,studyList:[...(Array.isArray(tc.studyList)?tc.studyList:[]),subj]}); afterShift("✓ Subject moved to "+tgt+"."); } };
  const filled=(d:string)=>{ const x=loadPlan(d); const meals=(x.meals?.breakfast||[]).length+(x.meals?.lunch||[]).length+(x.meals?.dinner||[]).length; return !!((x.exSessions||[]).length||meals||(x.studyList||[]).length||x.journal); };
  const start=new Date(sett.planStart);
  const cells=[]; for(let i=0;i<days;i++){ const d=new Date(start); d.setDate(d.getDate()+i); const ds=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; const f=filled(ds);
    cells.push(<div key={i} onClick={()=>setSel(ds)} title={`Day ${i+1} · ${ds}${f?" · planned":""}`} className={"cal-cell"+(ds===sel?" today":"")} style={{cursor:"pointer",background:f?"rgba(16,185,129,.35)":undefined}}><div className="cd">{i+1}</div><div className="cs">{f?"✓":""}</div></div>); }
  const plannedCount=(()=>{ let n=0; for(let i=0;i<days;i++){ const d=new Date(start); d.setDate(d.getDate()+i); const ds=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; if(filled(ds))n++; } return n; })();
  /* exercise sessions */
  const addSession=()=>{ const id=uid(); save({exSessions:[...(p.exSessions||[]),{id,time:"",type:"Walk",selected:[],detail:"",steps:"",distance:"",duration:""}]}); setExTab(id); };
  const updSession=(id:string,patch:any)=> save({exSessions:(p.exSessions||[]).map((s:any)=>s.id===id?{...s,...patch}:s)});
  const delSession=(id:string)=>{ const list=(p.exSessions||[]).filter((s:any)=>s.id!==id); save({exSessions:list}); if(exTab===id) setExTab((list[0]||{}).id||""); };
  const curS=(p.exSessions||[]).find((s:any)=>s.id===exTab)||(p.exSessions||[])[0];
  const toggleSessDone=(id:string)=> save({exSessions:(p.exSessions||[]).map((s:any)=>s.id===id?{...s,done:!s.done,selected:(s.selected||[]).map((x:any)=>({...x,done:!s.done}))}:s)});
  const submitSession=(id:string)=>{ const s=(p.exSessions||[]).find((x:any)=>x.id===id); if(!s) return; const nd=!s.done; save({exSessions:(p.exSessions||[]).map((x:any)=>x.id===id?{...x,done:nd,selected:(x.selected||[]).map((e:any)=>({...e,done:nd}))}:x)}); setSaved(nd?("✅ "+(s.type||"Session")+" submitted as done — reflected on your dashboard"):("↩ "+(s.type||"Session")+" reopened")); };
  /* auto-tick planned sessions when the watch / workout logs show they were done */
  const autoCheckExercise=(silent?:boolean)=>{ const sessions=p.exSessions||[]; if(!sessions.length){ if(!silent) alert("No sessions to check."); return; }
    const acts=LS("pos_gh_acts",[]).filter((a:any)=>a.date===sel);
    const gh=LS("pos_ghealth",[]).find((x:any)=>x.date===sel)||{};
    const health=LS("pos_health",{}); const isToday=sel===today();
    const wo=LS("pos_workouts",[]).filter((w:any)=>w.date===sel);
    const daySteps=Math.max(+gh.steps||0, acts.reduce((a:number,x:any)=>a+(+x.steps||0),0), isToday?(+health.steps||0):0);
    const dayDist=Math.max(+gh.distance||0, acts.reduce((a:number,x:any)=>a+(+x.distance||0),0), isToday?(+health.distance||0):0);
    let changed=false;
    const next=sessions.map((s:any)=>{ if(s.done) return s; let done=false;
      if(EX_LIB[s.type]) done=wo.some((w:any)=>(w.type||"").toLowerCase()===s.type.toLowerCase());
      else if(s.type==="Walk"||s.type==="Cardio"||s.type==="HIIT"){ const planSteps=+s.steps||0; const hasAct=acts.some((a:any)=>/walk|run|cardio|hike|cycle|bike|hiit/i.test(a.type||"")); done = hasAct || (planSteps? daySteps>=planSteps*0.85 : daySteps>=500) || dayDist>=0.3; }
      else if(s.type==="Yoga") done=acts.some((a:any)=>/yoga/i.test(a.type||""));
      if(done){ changed=true; return {...s,done:true,selected:(s.selected||[]).map((x:any)=>({...x,done:true}))}; } return s; });
    if(changed) save({exSessions:next}); else if(!silent) alert(`No auto-match for ${sel}.\nWatch shows: ${daySteps.toLocaleString()} steps · ${Math.round(dayDist*10)/10} km · ${acts.length} recorded activit${acts.length===1?"y":"ies"} · ${wo.length} gym log(s).\nTip: tap ‘Sync from watch’ on the Google Health tab first, or tick the session manually.`);
  };
  useEffect(()=>{ const t=setTimeout(()=>autoCheckExercise(true),400); return ()=>clearTimeout(t); /* eslint-disable-next-line */ },[sel,p.exSessions.length]);
  const toggleSessEx=(id:string,name:string)=>{ const s=(p.exSessions||[]).find((x:any)=>x.id===id); if(!s)return; const cur=s.selected||[]; const nx=cur.some((x:any)=>x.name===name)?cur.filter((x:any)=>x.name!==name):[...cur,{name,sets:"3",reps:"10",weight:"",note:""}]; updSession(id,{selected:nx}); };
  const setSessExField=(id:string,name:string,field:string,val:any)=>{ const s=(p.exSessions||[]).find((x:any)=>x.id===id); if(!s)return; updSession(id,{selected:(s.selected||[]).map((x:any)=>x.name===name?{...x,[field]:val}:x)}); };
  const editSessionAI=async(id:string)=>{ const s=(p.exSessions||[]).find((x:any)=>x.id===id); if(!s||!exPrompt.trim())return; setExEditBusy(true);
    try{ const r=await fetch("/api/edit-workout",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({type:s.type,exercises:(s.selected||[]).map((x:any)=>({name:x.name,sets:x.sets,reps:x.reps,weight:x.weight})),prompt:exPrompt})}); const d=await r.json();
      if(Array.isArray(d.exercises)) updSession(id,{selected:d.exercises.map((x:any)=>({name:x.name,sets:String(x.sets||3),reps:String(x.reps||10),weight:String(x.weight||""),note:""}))}); setExPrompt(""); }catch(e){} setExEditBusy(false); };
  /* meals */
  const addMealItem=async(group:string)=>{ const g=mealDraft[group]||{}; if(!(g.food||"").trim())return; setMealBusy(group);
    try{ const r=await fetch("/api/plan-nutrition",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({menu:g.food})}); const d=await r.json(); const tt=d.total||{};
      const entry={id:uid(),time:g.time||"",name:g.food,cal:Math.round(tt.cal||0),protein:Math.round(tt.protein||0),carbs:Math.round(tt.carbs||0),fat:Math.round(tt.fat||0),fiber:Math.round(tt.fiber||0)};
      save({meals:{...p.meals,[group]:[...(p.meals[group]||[]),entry]}}); setMealDraft((s:any)=>({...s,[group]:{time:"",food:""}})); }catch(e){} setMealBusy(""); };
  const syncMealToNutrition=(it:any,add:boolean)=>{ const planId="plan_"+(it.id||it.name); const m=loadNut(sel); m.meals=m.meals||[];
    if(add){ if(!m.meals.some((x:any)=>x.planId===planId)) m.meals.push({name:it.name,cal:+it.cal||0,protein:+it.protein||0,carbs:+it.carbs||0,fat:+it.fat||0,fiber:+it.fiber||0,planId}); }
    else { m.meals=m.meals.filter((x:any)=>x.planId!==planId); }
    SS(nutKey(sel),m); };
  const delMealItem=(group:string,idx:number)=>{ const it=(p.meals[group]||[])[idx]; if(it&&it.done) syncMealToNutrition(it,false); save({meals:{...p.meals,[group]:(p.meals[group]||[]).filter((_:any,i:number)=>i!==idx)}}); };
  const analyzeMeal=async(group:string)=>{ const g=mealDraft[group]||{}; if(!(g.food||"").trim())return; setMealBusy(group);
    try{ const r=await fetch("/api/plan-nutrition",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({menu:g.food})}); const d=await r.json(); setMealPrev((s:any)=>({...s,[group]:{text:g.food,time:g.time||"",total:d.total||{},items:d.items||[]}})); }catch(e){} setMealBusy(""); };
  const modifyMeal=async(group:string)=>{ const prev=mealPrev[group]; const chg=(mealMod[group]||"").trim(); if(!prev||!chg)return; setMealBusy(group);
    try{ const r=await fetch("/api/plan-nutrition",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({menu:`${prev.text}. Adjustment: ${chg}`})}); const d=await r.json(); setMealPrev((s:any)=>({...s,[group]:{...prev,text:`${prev.text} (${chg})`,total:d.total||{},items:d.items||[]}})); setMealMod((s:any)=>({...s,[group]:""})); }catch(e){} setMealBusy(""); };
  const confirmMeal=(group:string)=>{ const prev=mealPrev[group]; if(!prev)return; const tt=prev.total||{}; const entry={id:uid(),time:prev.time||"",name:prev.text,cal:Math.round(tt.cal||0),protein:Math.round(tt.protein||0),carbs:Math.round(tt.carbs||0),fat:Math.round(tt.fat||0),fiber:Math.round(tt.fiber||0)}; save({meals:{...p.meals,[group]:[...(p.meals[group]||[]),entry]}}); setMealPrev((s:any)=>({...s,[group]:null})); setMealDraft((s:any)=>({...s,[group]:{time:"",food:""}})); };
  const toggleMealDone=(group:string,idx:number)=>{ const it=(p.meals[group]||[])[idx]; const nowDone=!it.done; syncMealToNutrition(it,nowDone); save({meals:{...p.meals,[group]:(p.meals[group]||[]).map((x:any,i:number)=>i===idx?{...x,done:nowDone}:x)}}); };
  const toggleStudyTask=(id:string,idx:number)=> save({studyList:(p.studyList||[]).map((s:any)=>s.id===id?{...s,plan:(s.plan||[]).map((r:any,i:number)=>i===idx?{...r,done:!r.done}:r)}:s)});
  const groupTot=(group:string)=>{ const t={cal:0,protein:0,carbs:0,fat:0,fiber:0}; (p.meals[group]||[]).forEach((it:any)=>{t.cal+=+it.cal||0;t.protein+=+it.protein||0;t.carbs+=+it.carbs||0;t.fat+=+it.fat||0;t.fiber+=+it.fiber||0;}); return t; };
  const dayTotal=(()=>{ const t={cal:0,protein:0,carbs:0,fat:0,fiber:0}; ["breakfast","lunch","dinner"].forEach(k=>{ const g=groupTot(k); t.cal+=g.cal;t.protein+=g.protein;t.carbs+=g.carbs;t.fat+=g.fat;t.fiber+=g.fiber; }); return t; })();
  /* study subjects */
  const addSubject=async()=>{ const label=(studyDraft.label||"").trim(); if(!label)return; const id=uid(); const subj={id,label,hours:studyDraft.hours||"",plan:[],next:[]};
    save({studyList:[...(p.studyList||[]),subj]}); setStudyTab(id); setStudyDraft({label:"",hours:""}); setStudyBusy(true);
    try{ const r=await fetch("/api/study-path",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({text:label,hours:subj.hours})}); const d=await r.json();
      setP((prev:any)=>{ const n={...prev,studyList:(prev.studyList||[]).map((s:any)=>s.id===id?{...s,plan:d.plan||[],next:d.next||[]}:s)}; SS(planKey(sel),n); return n; }); }catch(e){} setStudyBusy(false); };
  const delSubject=(id:string)=>{ snap("Study subject removed"); const list=(p.studyList||[]).filter((s:any)=>s.id!==id); save({studyList:list}); if(studyTab===id) setStudyTab((list[0]||{}).id||""); };
  const curSubj=(p.studyList||[]).find((s:any)=>s.id===studyTab)||(p.studyList||[])[0];
  const fixGrammar=async()=>{ if(!(p.journal||"").trim()){ setFixMsg("Write something in the journal first."); return; } setFixBusy(true); setFixMsg("");
    try{ const r=await fetch("/api/proofread",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({text:p.journal})}); const d=await r.json();
      if(d.text && d.text!==p.journal){ save({journal:d.text}); setFixMsg("✓ Grammar & spelling corrected."); } else setFixMsg("Looks good — no changes needed."); }
    catch(e){ setFixMsg("Couldn't proofread right now."); } setFixBusy(false); };
  return <div style={{marginTop:16}}>
    <div className="card" style={{marginBottom:16}}>
      <div className="between" style={{flexWrap:"wrap",gap:10}}>
        <div><strong>📋 {days}-Day Daily Planner</strong><div className="muted" style={{fontSize:12,marginTop:2}}>Add as many sessions, meals &amp; subjects as you like. {plannedCount} of {days} days planned.</div></div>
        <div className="row" style={{gap:6}}>
          <button className="btn ghost sm" onClick={()=>shift(-1)}>‹ Prev</button>
          <input className="in" type="date" value={sel} onChange={e=>setSel(e.target.value)} style={{width:150}}/>
          <button className="btn ghost sm" onClick={()=>shift(1)}>Next ›</button>
          <button className="btn ghost sm" onClick={()=>setSel(today())}>Today</button>
          <button className="btn sm" onClick={doSave}>💾 Save day</button>
          <button className="btn ghost sm" onClick={skipRestDay}>😴 Skip / Rest day</button>
          <button className="btn ghost sm" onClick={clearDay}>🗑 Clear day</button>
          {undoSnap && <button className="btn sm" onClick={doUndo} style={{background:"linear-gradient(100deg,var(--orange),var(--pink))"}}>↩ Undo ({undoSnap.label})</button>}
        </div>
      </div>
      <div className="between" style={{flexWrap:"wrap",gap:8,marginTop:10}}>
        <div className="muted" style={{fontSize:12}}>Planning for <b style={{color:"#E7ECF3"}}>{new Date(sel).toLocaleDateString(undefined,{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</b></div>
        {saved && <span style={{fontSize:12,color:"#6ee7b7"}}>{saved}</span>}
      </div>
    </div>

    {mode!=="study" && <>
    <PRow icon="🏋️" tint="blue" title="Exercise — add each session (e.g. 6 AM walk, 1 PM gym)" action={<div className="row" style={{gap:8}}><button className="btn ghost sm" onClick={awayDay} title="Walk only today — push your gym sessions forward 1 day">🧳 Away</button><button className="btn ghost sm" onClick={skipExercise}>😴 Rest</button><button className="btn ghost sm" onClick={clearEx}>🗑 Clear</button></div>}>
      <div className="card" style={{marginBottom:12,background:"rgba(59,130,246,.07)",padding:"10px 12px"}}>
        <div className="between" style={{flexWrap:"wrap",gap:8}}>
          <div style={{fontSize:12}}><b>125-day workout cycle</b> — Push · Pull · Legs · Rest · Push · Pull · Legs · Biceps&Triceps, repeating, with an 11,000-step walk every day.</div>
          <div className="row" style={{gap:6}}><input className="in" type="date" value={woStartInput} onChange={e=>setWoStartInput(e.target.value)} style={{width:150}} title="Start date"/><button className="btn sm" onClick={applyWorkoutSeed}>⚡ Load 125-day plan</button></div>
        </div>
        <div className="muted" style={{fontSize:11,marginTop:6}}>Tip: on any day you can’t train, hit 🧳 Away — you keep your walk and the whole gym cycle slides forward a day (nothing lost).</div>
      </div>
      <div className="row" style={{flexWrap:"wrap",gap:10,alignItems:"stretch"}}>
        {(p.exSessions||[]).map((s:any)=>{ const active=curS&&curS.id===s.id; const em=SESS_EMOJI[s.type]||"🏋️"; const cnt=(s.selected||[]).length; const grad=SESS_GRAD[s.type]||"rgba(255,255,255,.04)"; return (
          <button key={s.id} onClick={()=>setExTab(s.id)} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 14px",borderRadius:14,cursor:"pointer",border:active?"1px solid rgba(96,165,250,.7)":"1px solid var(--stroke)",background:active?grad:"rgba(255,255,255,.03)",boxShadow:active?"0 6px 20px rgba(59,130,246,.22)":"none",transition:"all .15s"}}>
            <span style={{fontSize:22,lineHeight:1}}>{em}</span>
            <span style={{textAlign:"left"}}><b style={{fontSize:13,color:"#E7ECF3",display:"block"}}>{s.type}</b><span style={{fontSize:11,color:"#8b93a5"}}>{s.time||"—"}{cnt?` · ${cnt} ex`:s.steps?` · ${(+s.steps).toLocaleString()} steps`:""}</span></span>
            <span style={{marginLeft:4,fontSize:16}}>{s.done?"✅":"⭕"}</span>
          </button> ); })}
        <button className="btn ghost sm" onClick={addSession} style={{alignSelf:"center"}}>+ Add session</button>
        {(p.exSessions||[]).length>0 && <button className="btn ghost sm" onClick={()=>autoCheckExercise(false)} title="Check your watch & workout logs and tick anything that's done" style={{alignSelf:"center"}}>🔄 Auto-check from watch</button>}
      </div>
      {curS? <div style={{marginTop:12,paddingTop:12,borderTop:"1px solid rgba(255,255,255,.07)"}}>
        <div className="row" style={{flexWrap:"wrap",gap:8,alignItems:"center"}}>
          <button className={"btn "+(curS.done?"":"ghost")+" sm"} onClick={()=>toggleSessDone(curS.id)}>{curS.done?"✅ Done":"⬜ Mark done"}</button>
          <input className="in" type="time" value={curS.time||""} onChange={e=>updSession(curS.id,{time:e.target.value})} style={{width:120}}/>
          {EX_TYPES.map(t=><button key={t} className={"btn "+(curS.type===t?"":"ghost")+" sm"} onClick={()=>updSession(curS.id,{type:t,selected:[]})}>{t}</button>)}
          <button className="btn ghost sm" style={{marginLeft:"auto"}} onClick={()=>delSession(curS.id)}>🗑 Remove</button>
        </div>
        {EX_LIB[curS.type]? <div style={{marginTop:12}}>
          <div className="muted" style={{fontSize:11,marginBottom:8}}>Tick {curS.type} exercises ({(curS.selected||[]).length}):</div>
          <div className="row" style={{flexWrap:"wrap",gap:8}}>{EX_LIB[curS.type].map(ex=>{ const on=(curS.selected||[]).some((x:any)=>x.name===ex); return <button key={ex} className={"btn "+(on?"":"ghost")+" sm"} onClick={()=>toggleSessEx(curS.id,ex)} style={{fontWeight:500}}>{on?"✓ ":""}{ex}</button>; })}</div>
          {(curS.selected||[]).length>0 && <div style={{overflowX:"auto",marginTop:12}}><table style={{width:"100%",borderCollapse:"collapse",minWidth:520}}>
            <thead><tr>{["Exercise","Sets","Reps","Weight (kg)","Note",""].map(h=><th key={h} style={{textAlign:"left",fontSize:10,textTransform:"uppercase",color:"#5b6577",padding:"6px",borderBottom:"1px solid rgba(255,255,255,.09)"}}>{h}</th>)}</tr></thead>
            <tbody>{(curS.selected||[]).map((o:any,i:number)=><tr key={i} style={{borderBottom:"1px solid rgba(255,255,255,.05)"}}>
              <td style={{padding:"6px",fontSize:13,fontWeight:600}}><span onClick={()=>setSessExField(curS.id,o.name,"done",!o.done)} style={{cursor:"pointer",textDecoration:o.done?"line-through":"none",color:o.done?"#6ee7b7":undefined}}>{o.done?"✅ ":"⬜ "}{o.name}</span> <a href={demoLink(o.name)} target="_blank" rel="noopener" title="Watch demo" style={{marginLeft:6,fontSize:11,color:"#7dd3fc",textDecoration:"none"}}>📺</a></td>
              <td style={{padding:"6px"}}><input className="in" value={o.sets||""} onChange={e=>setSessExField(curS.id,o.name,"sets",e.target.value)} style={{width:56}}/></td>
              <td style={{padding:"6px"}}><input className="in" value={o.reps||""} onChange={e=>setSessExField(curS.id,o.name,"reps",e.target.value)} style={{width:56}}/></td>
              <td style={{padding:"6px"}}><input className="in" value={o.weight||""} onChange={e=>setSessExField(curS.id,o.name,"weight",e.target.value)} placeholder="opt" style={{width:70}}/></td>
              <td style={{padding:"6px"}}><input className="in" value={o.note||""} onChange={e=>setSessExField(curS.id,o.name,"note",e.target.value)} placeholder="note" style={{minWidth:100}}/></td>
              <td style={{padding:"6px",whiteSpace:"nowrap"}}><span className="btn ghost sm" style={{cursor:"pointer",marginRight:4}} title="How to do this" onClick={()=>setPlanInfo(planInfo===o.name?null:o.name)}>ⓘ</span><span className="btn ghost sm" style={{cursor:"pointer"}} onClick={()=>toggleSessEx(curS.id,o.name)}>✕</span></td>
            </tr>)}</tbody>
          </table></div>}
          {planInfo && (curS.selected||[]).some((o:any)=>o.name===planInfo) && <div className="muted" style={{fontSize:13,lineHeight:1.6,marginTop:10,padding:12,borderRadius:12,background:"rgba(255,255,255,.03)",border:"1px solid var(--stroke)"}}>
            <div className="between"><b style={{color:"#E7ECF3"}}>{exEmoji(planInfo)} {planInfo}</b><a href={demoLink(planInfo)} target="_blank" rel="noopener" style={{fontSize:12,color:"#7dd3fc",textDecoration:"none"}}>📺 Demo</a></div>
            <div style={{marginTop:6}}>{HOWTO[planInfo]||"Perform with controlled form and a full range of motion — tap Demo to watch it."}</div>
          </div>}
        </div> : <div className="row" style={{flexWrap:"wrap",gap:8,marginTop:12}}>
          <input className="in" value={curS.steps||""} onChange={e=>updSession(curS.id,{steps:e.target.value})} placeholder="Steps (e.g. 10000)" style={{width:150}}/>
          <input className="in" value={curS.distance||""} onChange={e=>updSession(curS.id,{distance:e.target.value})} placeholder="Distance km" style={{width:120}}/>
          <input className="in" value={curS.duration||""} onChange={e=>updSession(curS.id,{duration:e.target.value})} placeholder="Duration min" style={{width:120}}/>
          <input className="in" value={curS.detail||""} onChange={e=>updSession(curS.id,{detail:e.target.value})} placeholder="Notes — e.g. easy pace, park loop" style={{flex:1,minWidth:160}}/>
        </div>}
        <div className="between" style={{marginTop:16,paddingTop:14,borderTop:"1px solid rgba(255,255,255,.08)",flexWrap:"wrap",gap:10}}>
          <div className="muted" style={{fontSize:12}}>{(curS.selected||[]).length? `${(curS.selected||[]).filter((x:any)=>x.done).length}/${(curS.selected||[]).length} exercises ticked` : (curS.type==="Walk"?"11,000-step walk":"Log your session, then submit")}</div>
          <button onClick={()=>submitSession(curS.id)} style={{padding:"11px 22px",borderRadius:14,border:"none",cursor:"pointer",fontWeight:700,fontSize:14,color:"#fff",background:curS.done?"linear-gradient(100deg,#22c55e,#10b981)":"linear-gradient(100deg,var(--blue),#8B5CF6)",boxShadow:curS.done?"0 6px 18px rgba(16,185,129,.35)":"0 6px 18px rgba(59,130,246,.35)"}}>{curS.done?`✅ ${curS.type} done — tap to undo`:`🎯 Submit ${curS.type} as done`}</button>
        </div>
      </div> : <div className="muted" style={{fontSize:12,marginTop:10}}>No sessions yet — tap “+ Add session”. Add one for your morning walk and another for the gym.</div>}
    </PRow>

    <div className="card" style={{marginBottom:14}}>
      <div className="row" style={{gap:10,marginBottom:8}}><Chip tint="blue">📅</Chip><strong style={{fontSize:15}}>Next 10 days — exercise outlook</strong></div>
      <div className="grid g2">
        {Array.from({length:10}).map((_,i)=>{ const ds=addDaysD(today(),i); const c:any=LS(planKey(ds),{}); const ses=(Array.isArray(c.exSessions)?c.exSessions:[]); const [yy,mm,dd2]=ds.split("-").map(Number); const dObj=new Date(yy,mm-1,dd2); const isToday=ds===today();
          return <div key={ds} onClick={()=>setSel(ds)} style={{cursor:"pointer",padding:"10px 12px",borderRadius:12,border:"1px solid "+(ds===sel?"var(--stroke2)":"var(--stroke)"),background:ds===sel?"rgba(59,130,246,.12)":ses.length?"rgba(255,255,255,.03)":"transparent"}}>
            <div className="between"><b style={{fontSize:13}}>{dObj.toLocaleDateString(undefined,{weekday:"short",day:"numeric",month:"short"})}{isToday?" · Today":""}</b><span className="muted" style={{fontSize:11}}>{ses.length?`${ses.length} session${ses.length>1?"s":""}`:"Rest / none"}</span></div>
            {ses.length? ses.map((s:any,si:number)=><div key={si} className="muted" style={{fontSize:12,marginTop:3}}>{s.done?"✅ ":"• "}{s.time?s.time+" · ":""}<b style={{color:"#E7ECF3"}}>{s.type}</b>{Array.isArray(s.selected)&&s.selected.length?` — ${s.selected.length} exercise${s.selected.length>1?"s":""}`:s.steps?` — ${s.steps} steps`:s.distance?` — ${s.distance}km`:""}</div>) : <div className="muted" style={{fontSize:12,marginTop:3}}>No workout planned</div>}
          </div>; })}
      </div>
      <div className="muted" style={{fontSize:11,marginTop:8}}>Tap a day to open and edit it. Empty days are rest / unplanned.</div>
      {(()=>{ const opts=Array.from({length:10}).map((_,i)=>{ const ds=addDaysD(today(),i); const [yy,mm,dd2]=ds.split("-").map(Number); const dObj=new Date(yy,mm-1,dd2); return {ds,label:dObj.toLocaleDateString(undefined,{weekday:"short",day:"numeric",month:"short"})+(ds===today()?" · Today":"")}; });
        return <div style={{marginTop:10,padding:12,borderRadius:12,background:"rgba(59,130,246,.08)",border:"1px solid rgba(59,130,246,.25)"}}>
          <div className="row" style={{gap:8,flexWrap:"wrap"}}>
            {[["swap","🔀 Swap"],["modify","✎ Modify"],["add","➕ Add"]].map(([m,lbl])=><button key={m} className={"btn "+(opMode===m?"":"ghost")+" sm"} onClick={()=>setOpMode(m)}>{lbl}</button>)}
          </div>
          {opMode==="swap"? <div className="row" style={{gap:8,marginTop:10,flexWrap:"wrap",alignItems:"center"}}>
            <select className="in" value={dayA} onChange={e=>setDayA(e.target.value)}>{opts.map(o=><option key={o.ds} value={o.ds} style={OPT}>{o.label}</option>)}</select>
            <span style={{fontSize:18}}>↔</span>
            <select className="in" value={dayB} onChange={e=>setDayB(e.target.value)}><option value="" style={OPT}>Pick day B…</option>{opts.map(o=><option key={o.ds} value={o.ds} style={OPT}>{o.label}</option>)}</select>
            <button className="btn sm" onClick={swapDays}>🔀 Swap days</button>
          </div> : <div style={{marginTop:10}}>
            <div className="row" style={{gap:8,flexWrap:"wrap",alignItems:"center"}}><span className="muted" style={{fontSize:12}}>Day:</span>
              <select className="in" value={dayA} onChange={e=>setDayA(e.target.value)}>{opts.map(o=><option key={o.ds} value={o.ds} style={OPT}>{o.label}</option>)}</select></div>
            <div className="row" style={{gap:8,marginTop:8,flexWrap:"wrap"}}>
              <input className="in" value={opPrompt} onChange={e=>setOpPrompt(e.target.value)} placeholder={opMode==="modify"?"Change… e.g. +5% weight, swap bench for dumbbell press":"Add… e.g. 30-min evening cardio, or a Push session"} style={{flex:1,minWidth:200}} onKeyDown={e=>{ if(e.key==="Enter"){ opMode==="modify"?modifyDayEx():addDayEx(); } }}/>
              <button className="btn sm" onClick={opMode==="modify"?modifyDayEx:addDayEx} disabled={chatBusy==="ex"}>{chatBusy==="ex"?"🤖…":(opMode==="modify"?"✎ Modify":"➕ Add")}</button>
            </div>
          </div>}
          <div style={{marginTop:10,paddingTop:8,borderTop:"1px solid rgba(255,255,255,.07)"}} className="row"><input className="in" value={exChat} onChange={e=>setExChat(e.target.value)} placeholder="…or describe any change across all 10 days" style={{flex:1,minWidth:180}} onKeyDown={e=>{ if(e.key==="Enter") applyExerciseChat(); }}/><button className="btn ghost sm" onClick={applyExerciseChat} disabled={chatBusy==="ex"}>{chatBusy==="ex"?"🤖…":"✨ Apply"}</button></div>
        </div>; })()}
    </div>

    <PRow icon="🍎" tint="emerald" title="Meals — add items with times, AI counts each" action={actBtns(skipMeals,clearMeals)}>
      {["breakfast","lunch","dinner"].map((key)=>{ const items=p.meals[key]||[]; const gt=groupTot(key); const lbl=key.charAt(0).toUpperCase()+key.slice(1); const dr=mealDraft[key]||{time:"",food:""};
        return <div key={key} style={{marginBottom:14,paddingBottom:14,borderBottom:key!=="dinner"?"1px solid rgba(255,255,255,.06)":"none"}}>
          <strong style={{fontSize:13}}>{key==="breakfast"?"🌅":key==="lunch"?"🥗":"🌙"} {lbl}{gt.cal?` — ${Math.round(gt.cal)} kcal · P ${Math.round(gt.protein)}g`:""}</strong>
          {items.map((it:any,i:number)=><div key={i} className="row" style={{gap:8,marginTop:8,padding:"7px 10px",borderRadius:10,background:"rgba(255,255,255,.04)"}}>
            <span style={{cursor:"pointer",fontSize:16}} onClick={()=>toggleMealDone(key,i)}>{it.done?"✅":"⬜"}</span>
            <div style={{flex:1,textDecoration:it.done?"line-through":"none",opacity:it.done?.6:1}}><span style={{fontSize:13}}>{it.time?<b style={{color:"#6ee7b7"}}>{it.time} </b>:null}{it.name}</span><div className="muted" style={{fontSize:11}}>{it.cal} kcal · P {it.protein}g · C {it.carbs}g · F {it.fat}g · Fiber {it.fiber}g</div></div>
            <span className="btn ghost sm" style={{cursor:"pointer"}} onClick={()=>delMealItem(key,i)}>✕</span>
          </div>)}
          <div className="row" style={{gap:8,marginTop:8,flexWrap:"wrap"}}>
            <input className="in" type="time" value={dr.time} onChange={e=>setMealDraft((s:any)=>({...s,[key]:{...dr,time:e.target.value}}))} style={{width:120}}/>
            <input className="in" value={dr.food} onChange={e=>setMealDraft((s:any)=>({...s,[key]:{...dr,food:e.target.value}}))} placeholder={`Add a ${key} item — e.g. 3 eggs, 2 roti`} style={{flex:1,minWidth:160}} onKeyDown={e=>{ if(e.key==="Enter") analyzeMeal(key); }}/>
            <button className="btn sm" onClick={()=>analyzeMeal(key)} disabled={mealBusy===key}>{mealBusy===key?"🤖…":"✨ Analyze"}</button>
          </div>
          {mealPrev[key] && (()=>{ const pv=mealPrev[key]; const tt=pv.total||{}; return <div style={{marginTop:10,padding:12,borderRadius:12,background:"rgba(16,185,129,.08)",border:"1px solid rgba(16,185,129,.28)"}}>
            <div className="between" style={{flexWrap:"wrap",gap:8}}><strong style={{fontSize:13}}>Nutrition of “{pv.text}”</strong><span className="muted" style={{fontSize:11}}>Correct? Modify below or add it.</span></div>
            <div className="row" style={{flexWrap:"wrap",gap:6,marginTop:8}}>
              <span className="in" style={{padding:"4px 9px",fontSize:12}}>🔥 {Math.round(tt.cal||0)} kcal</span>
              <span className="in" style={{padding:"4px 9px",fontSize:12}}>Protein {Math.round(tt.protein||0)}g</span>
              <span className="in" style={{padding:"4px 9px",fontSize:12}}>Carbs {Math.round(tt.carbs||0)}g</span>
              <span className="in" style={{padding:"4px 9px",fontSize:12}}>Fat {Math.round(tt.fat||0)}g</span>
              <span className="in" style={{padding:"4px 9px",fontSize:12}}>Fiber {Math.round(tt.fiber||0)}g</span>
            </div>
            {(pv.items||[]).length>1 && <div className="muted" style={{fontSize:11,marginTop:6}}>{pv.items.map((it:any)=>`${it.name}${it.qty?` (${it.qty})`:""} ${Math.round(it.cal||0)}kcal`).join(" · ")}</div>}
            <div className="row" style={{gap:8,marginTop:10,flexWrap:"wrap"}}>
              <input className="in" value={mealMod[key]||""} onChange={e=>setMealMod((s:any)=>({...s,[key]:e.target.value}))} placeholder="Modify — e.g. make it 2 eggs, add 1 tsp butter" style={{flex:1,minWidth:180}} onKeyDown={e=>{ if(e.key==="Enter") modifyMeal(key); }}/>
              <button className="btn ghost sm" onClick={()=>modifyMeal(key)} disabled={mealBusy===key}>{mealBusy===key?"🤖…":"✨ Modify"}</button>
            </div>
            <div className="row" style={{gap:8,marginTop:10}}>
              <button className="btn sm" onClick={()=>confirmMeal(key)}>✅ Add to {key}</button>
              <button className="btn ghost sm" onClick={()=>setMealPrev((s:any)=>({...s,[key]:null}))}>Cancel</button>
            </div>
          </div>; })()}
        </div>; })}
      {dayTotal.cal? <div style={{marginTop:4,padding:"10px 12px",borderRadius:12,background:"rgba(16,185,129,.10)",border:"1px solid rgba(16,185,129,.25)"}}>
        <div className="row" style={{flexWrap:"wrap",gap:10}}><strong style={{fontSize:13}}>Day total</strong>
          <span className="muted" style={{fontSize:13}}>🔥 <b style={{color:"#E7ECF3"}}>{Math.round(dayTotal.cal)}</b> kcal · P {Math.round(dayTotal.protein)}g · C {Math.round(dayTotal.carbs)}g · F {Math.round(dayTotal.fat)}g · Fiber {Math.round(dayTotal.fiber)}g</span></div>
      </div>:null}
    </PRow>
    </>}

    {mode!=="goals" && <>
    <PRow icon="📚" tint="purple" title="Study — add subjects, AI builds a timed plan for each" action={<div className="row" style={{gap:8,flexWrap:"wrap"}}><button className="btn ghost sm" onClick={restoreCourses}>↻ Restore courses</button><button className="btn ghost sm" onClick={skipStudy}>😴 Skip/Rest</button><button className="btn ghost sm" onClick={clearStudy}>🗑 Clear</button></div>}>
      <div className="row" style={{flexWrap:"wrap",gap:8}}>
        <input className="in" value={studyDraft.label} onChange={e=>setStudyDraft((s:any)=>({...s,label:e.target.value}))} placeholder="e.g. 2 hour data structures" style={{flex:1,minWidth:200}} onKeyDown={e=>{ if(e.key==="Enter") addSubject(); }}/>
        <input className="in" type="number" value={studyDraft.hours} onChange={e=>setStudyDraft((s:any)=>({...s,hours:e.target.value}))} placeholder="Hours" style={{width:90}}/>
        <button className="btn sm" onClick={addSubject} disabled={studyBusy||!studyDraft.label.trim()}>{studyBusy?"🤖 Planning…":"✨ Add & plan"}</button>
      </div>
      {(p.studyList||[]).length>0 && <div className="row" style={{flexWrap:"wrap",gap:8,marginTop:12}}>
        {(p.studyList||[]).map((s:any)=><button key={s.id} className={"btn "+(curSubj&&curSubj.id===s.id?"":"ghost")+" sm"} onClick={()=>setStudyTab(s.id)}>{s.label}</button>)}
      </div>}
      {curSubj? <div style={{marginTop:12,paddingTop:12,borderTop:"1px solid rgba(255,255,255,.07)"}}>
        <div className="between" style={{flexWrap:"wrap",gap:8}}><strong style={{fontSize:14}}>{curSubj.label}{curSubj.hours?` · ${curSubj.hours}h`:""}</strong>
          <div className="row" style={{gap:8}}><button className="btn ghost sm" onClick={()=>skipSubject(curSubj)}>😴 Skip {curSubj.courseId?courseName(curSubj.courseId):"subject"}</button><button className="btn ghost sm" onClick={()=>delSubject(curSubj.id)}>🗑 Remove</button></div></div>
        {curSubj.brief && <div style={{fontSize:13,lineHeight:1.6,marginTop:8}}>{curSubj.brief}</div>}
        {(+curSubj.studied||0)>0 && <div className="muted" style={{fontSize:12,marginTop:8}}>⏱ Studied today: <b style={{color:"#E7ECF3"}}>{curSubj.studied} min</b></div>}
        {(curSubj.video||curSubj.resource||curSubj.courseVideo) && <div style={{marginTop:8,padding:"10px 12px",borderRadius:10,background:"rgba(255,255,255,.04)",fontSize:12,lineHeight:1.8}}>
          {curSubj.video && <div className="muted">📺 {curSubj.video}{curSubj.courseVideo && <> · <a href={curSubj.courseVideo} target="_blank" rel="noopener" style={{color:"#7dd3fc",fontWeight:600}}>▶ open at this time</a></>}</div>}
          {curSubj.resource && <div>🔗 Study material: <a href={firstUrl(curSubj.resource)||curSubj.resource} target="_blank" rel="noopener" style={{color:"#7dd3fc",wordBreak:"break-all"}}>{firstUrl(curSubj.resource)||curSubj.resource}</a></div>}
          {curSubj.pdf && <div>📄 Syllabus PDF: <a href={curSubj.pdf} target="_blank" rel="noopener" style={{color:"#fcd34d",fontWeight:600}}>Open day PDF</a></div>}
        </div>}
        <div style={{marginTop:12}}>
          {!curSubj.notes && <button className="btn sm" onClick={()=>genNotes(curSubj)} disabled={notesBusy===curSubj.id}>{notesBusy===curSubj.id?"🤖 Writing detailed notes…":"📖 Generate detailed notes (theory · scenarios · Q&A)"}</button>}
          {curSubj.notes && <div className="card" style={{background:"rgba(255,255,255,.03)"}}>
            <div className="between" style={{flexWrap:"wrap",gap:8}}><strong style={{fontSize:14}}>📖 Detailed notes</strong>
              <div className="row" style={{gap:8}}>
                <button className="btn ghost sm" onClick={()=>printNotes(curSubj.label, mdToHtml(curSubj.notes))}>🖨 Save as PDF</button>
                <button className="btn ghost sm" onClick={()=>genNotes(curSubj)} disabled={notesBusy===curSubj.id}>{notesBusy===curSubj.id?"🤖…":"↻ Regenerate"}</button>
              </div>
            </div>
            <div style={{marginTop:8,fontSize:13,color:"#d5dbe6"}} dangerouslySetInnerHTML={{__html:mdToHtml(curSubj.notes)}}/>
          </div>}
        </div>
        <div style={{marginTop:10}}>
          {!curSubj.codeFile && <button className="btn sm" onClick={()=>genCode(curSubj)} disabled={codeBusy===curSubj.id}>{codeBusy===curSubj.id?"🤖 Writing code…":"💻 Get today's code"}</button>}
          {curSubj.codeFile && <div className="card" style={{background:"rgba(255,255,255,.03)"}}>
            <div className="between" style={{flexWrap:"wrap",gap:8}}><strong style={{fontSize:14}}>💻 {curSubj.codeFile.filename}{curSubj.codeFile.lang?` · ${curSubj.codeFile.lang}`:""}</strong>
              <div className="row" style={{gap:8,flexWrap:"wrap"}}>
                <button className="btn ghost sm" onClick={()=>copyCode(curSubj.codeFile.code)}>📋 Copy</button>
                <button className="btn ghost sm" onClick={()=>downloadCode(curSubj.codeFile)}>⬇ Download</button>
                {vscodeRepo(curSubj.resource) && <a className="btn ghost sm" href={vscodeRepo(curSubj.resource)} target="_blank" rel="noopener">↗ Repo in VS Code</a>}
                <button className="btn ghost sm" onClick={()=>genCode(curSubj)} disabled={codeBusy===curSubj.id}>{codeBusy===curSubj.id?"🤖…":"↻"}</button>
              </div>
            </div>
            <pre style={{marginTop:8,padding:12,borderRadius:10,background:"#0b1020",border:"1px solid var(--stroke)",overflowX:"auto",fontSize:12,lineHeight:1.55,color:"#d5dbe6",whiteSpace:"pre",maxHeight:360}}>{curSubj.codeFile.code}</pre>
            <div className="muted" style={{fontSize:11,marginTop:6}}>Copy or ⬇ Download the file and open it in VS Code, or open the course repo in VS Code (web).</div>
          </div>}
        </div>
        <div style={{marginTop:12,padding:12,borderRadius:12,background:"rgba(59,130,246,.08)",border:"1px solid rgba(59,130,246,.25)"}}>
          <div className="row" style={{gap:8}}><span>💬</span><strong style={{fontSize:13}}>Ask Claude about this topic</strong></div>
          <div className="row" style={{gap:8,marginTop:8,flexWrap:"wrap"}}>
            <input className="in" value={askText} onChange={e=>setAskText(e.target.value)} placeholder="Type a question… (leave blank for a full explanation)" style={{flex:1,minWidth:220}} onKeyDown={e=>{ if(e.key==="Enter") askClaude(curSubj); }}/>
            <button className="btn sm" onClick={()=>askClaude(curSubj)}>💬 Ask Claude ↗</button>
          </div>
          <div className="muted" style={{fontSize:11,marginTop:6}}>Opens claude.ai in a new tab with your question and this topic as context.</div>
        </div>
        {(curSubj.plan||[]).length>0? <div style={{overflowX:"auto",marginTop:10}}><table style={{width:"100%",borderCollapse:"collapse",minWidth:360}}>
          <thead><tr>{["","Time","Focus","Timer"].map((h,hi)=><th key={hi} style={{textAlign:"left",fontSize:10,textTransform:"uppercase",color:"#5b6577",padding:"6px",borderBottom:"1px solid rgba(255,255,255,.09)"}}>{h}</th>)}</tr></thead>
          <tbody>{curSubj.plan.map((x:any,i:number)=>{ const running=timer&&timer.key===curSubj.id+"#"+i; const el=running?elapsedSec(timer):0; const over=running&&timer.target&&el>=timer.target*60; const isRun=running&&!!timer.startedAt;
            return <tr key={i} style={{borderBottom:"1px solid rgba(255,255,255,.05)"}}>
              <td onClick={()=>toggleStudyTask(curSubj.id,i)} style={{padding:"7px 6px",cursor:"pointer",fontSize:15}}>{x.done?"✅":"⬜"}</td>
              <td style={{padding:"7px 6px",fontSize:12,whiteSpace:"nowrap",color:"#c4b5fd",fontWeight:600,textDecoration:x.done?"line-through":"none"}}>{x.time}</td>
              <td style={{padding:"7px 6px",fontSize:13,textDecoration:x.done?"line-through":"none",opacity:x.done?.6:1}}>{x.task}</td>
              <td style={{padding:"7px 6px",whiteSpace:"nowrap"}}>{running? <span className="row" style={{gap:5,flexWrap:"wrap"}}>
                  <span style={{fontSize:14,fontWeight:700,color:over?"#f9a8d4":isRun?"#6ee7b7":"#8A94A6",fontVariantNumeric:"tabular-nums"}}>{fmtEl(el)}{timer.onBreak?" ☕":""}</span>
                  {isRun? <button className="btn ghost sm" title="Pause" onClick={()=>pauseTimer(false)}>⏸</button> : <button className="btn ghost sm" title="Resume" onClick={resumeTimer}>▶</button>}
                  {isRun && <button className="btn ghost sm" title="Take a break" onClick={()=>pauseTimer(true)}>☕ Break</button>}
                  <button className="btn sm" onClick={()=>logTask(curSubj)}>💾 Log</button>
                </span> : <button className="btn ghost sm" onClick={()=>startTask(curSubj,i,x.time)} disabled={x.done}>▶ Start</button>}</td>
            </tr>; })}</tbody>
        </table></div> : <div className="muted" style={{fontSize:12,marginTop:8}}>Building plan…</div>}
        {(curSubj.next||[]).length>0 && <div style={{marginTop:10}}><div className="muted" style={{fontSize:11,textTransform:"uppercase",letterSpacing:.5,marginBottom:6}}>Up next</div><ul className="list">{curSubj.next.map((x:string,i:number)=><li className="li" key={i}><span className="dot" style={{background:"var(--mut2)"}}/><span style={{fontSize:13}} className="muted">{x}</span></li>)}</ul></div>}
      </div> : <div className="muted" style={{fontSize:12,marginTop:10}}>Add subjects like “2 hour data structures” and “DevOps” — each gets its own tab with a timed plan.</div>}
    </PRow>

    <div className="card" style={{marginBottom:14}}>
      <div className="between" style={{flexWrap:"wrap",gap:8,marginBottom:8}}><div className="row" style={{gap:10}}><Chip tint="purple">📅</Chip><strong style={{fontSize:15}}>Next 10 days — study outlook</strong></div>
        <div className="row" style={{gap:6,flexWrap:"wrap",alignItems:"center"}}><span className="muted" style={{fontSize:11}}>Course start:</span><input className="in" type="date" value={courseStartInput} onChange={e=>setCourseStartInput(e.target.value)} style={{width:140}}/><button className="btn ghost sm" onClick={applyCourseStart}>Set start</button></div></div>
      <div className="grid g2">
        {Array.from({length:10}).map((_,i)=>{ const ds=addDaysD(today(),i); const c:any=LS(planKey(ds),{}); const subs=(Array.isArray(c.studyList)?c.studyList:[]); const [yy,mm,dd2]=ds.split("-").map(Number); const dObj=new Date(yy,mm-1,dd2); const isToday=ds===today();
          const doneCount=subs.filter((s:any)=>(s.plan||[]).length && (s.plan||[]).every((t:any)=>t.done)).length;
          return <div key={ds} onClick={()=>setSel(ds)} style={{cursor:"pointer",padding:"10px 12px",borderRadius:12,border:"1px solid "+(ds===sel?"var(--stroke2)":"var(--stroke)"),background:ds===sel?"rgba(168,85,247,.12)":subs.length?"rgba(255,255,255,.03)":"transparent"}}>
            <div className="between"><b style={{fontSize:13}}>{dObj.toLocaleDateString(undefined,{weekday:"short",day:"numeric",month:"short"})}{isToday?" · Today":""}</b><span className="muted" style={{fontSize:11}}>{subs.length?`${doneCount}/${subs.length} done`:"None"}</span></div>
            {subs.length? subs.map((s:any,si:number)=>{ const complete=(s.plan||[]).length && (s.plan||[]).every((t:any)=>t.done); return <div key={si} className="muted" style={{fontSize:12,marginTop:3,textDecoration:complete?"line-through":"none"}}>{complete?"✅ ":"• "}{s.label}</div>; }) : <div className="muted" style={{fontSize:12,marginTop:3}}>No study planned</div>}
          </div>; })}
      </div>
      <div className="muted" style={{fontSize:11,marginTop:8}}>Tap a day to open it. ✅ = all that day&apos;s tasks ticked.</div>
      <div style={{marginTop:10,padding:12,borderRadius:12,background:"rgba(168,85,247,.08)",border:"1px solid rgba(168,85,247,.25)"}}>
        <div className="row" style={{gap:8}}><span>💬</span><strong style={{fontSize:13}}>Change the 10-day study plan with AI</strong></div>
        <div className="row" style={{gap:8,marginTop:8,flexWrap:"wrap"}}>
          <input className="in" value={stChat} onChange={e=>setStChat(e.target.value)} placeholder="e.g. move DSA to mornings, swap day 2 and 4, add a revision day after day 5" style={{flex:1,minWidth:220}} onKeyDown={e=>{ if(e.key==="Enter") applyStudyChat(); }}/>
          <button className="btn sm" onClick={applyStudyChat} disabled={chatBusy==="st"}>{chatBusy==="st"?"🤖…":"✨ Apply"}</button>
        </div>
        <div className="muted" style={{fontSize:11,marginTop:6}}>Course links, PDFs &amp; notes are kept when a subject isn&apos;t renamed.</div>
      </div>
    </div>
    </>}

    {mode!=="study" && <>
    <PRow icon="📓" tint="orange" title="Daily Journal" action={clearBtn(clearJournal)}>
      <div className="between" style={{flexWrap:"wrap",gap:8,marginBottom:10,paddingBottom:10,borderBottom:"1px solid rgba(255,255,255,.08)"}}>
        <div><div style={{fontSize:16,fontWeight:700}}>{new Date(sel).toLocaleDateString(undefined,{weekday:"long"})}</div><div className="muted" style={{fontSize:12}}>{new Date(sel).toLocaleDateString(undefined,{day:"numeric",month:"long",year:"numeric"})}</div></div>
        <button className="btn ghost sm" onClick={fixGrammar} disabled={fixBusy}>{fixBusy?"✨ Fixing…":"✨ Fix grammar & spelling"}</button>
      </div>
      <textarea className="in" value={p.journal||""} onChange={e=>save({journal:e.target.value})} placeholder={"Dear diary…\n\n• Highlights of the day —\n• Challenges —\n• Grateful for —\n• Tomorrow —\n\nWrite freely, then tap ‘Fix grammar & spelling’."} style={{width:"100%",minHeight:220,lineHeight:1.8,fontSize:15}}/>
      {fixMsg && <div className="muted" style={{fontSize:12,marginTop:6}}>{fixMsg}</div>}
    </PRow>

    <div className="card" style={{marginTop:2}}><strong>{days}-Day Plan Overview</strong><div className="muted" style={{fontSize:12,marginTop:2,marginBottom:6}}>Green = planned. Tap any day to edit it.</div><div className="cal-grid">{cells}</div></div>
    </>}
  </div>;
}
