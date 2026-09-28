"use client";
import { useState, useEffect } from "react";
import { exEmoji, demoLink, HOWTO } from "@/lib/exercise-guide";
import { today, addDays, SS, LS, pKey, uid, SPLIT_VISUAL } from "@/components/fitness/data";
import { ExerciseGuide } from "@/components/fitness/ui";

export function PlanWorkout({ refresh }: { refresh:()=>void }) {
  const t=today();
  const [split,setSplit]=useState("");
  const [act,setAct]=useState<any>({});
  const [tick,setTick]=useState(0);
  const [busy,setBusy]=useState(false);
  const [proposal,setProposal]=useState<any>(null);
  const [nextDate,setNextDate]=useState(addDays(t,4));
  const [pPrompt,setPPrompt]=useState(""); const [pBusy,setPBusy]=useState(false); const [edited,setEdited]=useState(false); const [pInfo,setPInfo]=useState<string|null>(null);
  const [histOpen,setHistOpen]=useState<string|null>(null);
  const delHistory=(id:string)=>{ if(!confirm("Delete this saved workout?")) return; SS("pos_workouts", LS("pos_workouts",[]).filter((w:any)=>w.id!==id)); refresh(); setTick(x=>x+1); };
  const daySessions=(LS(pKey(t),{}).exSessions||[]) as any[];
  const session=split? daySessions.find((s:any)=>s.type===split): null;
  const hasSplit=(sp:string)=> daySessions.some((s:any)=>s.type===sp);

  useEffect(()=>{ setProposal(null); setEdited(false); setNextDate(addDays(t,4));
    if(!session){ setAct({}); return; }
    const saved=LS("pos_wact_"+t+"_"+split,null);
    if(saved){ setAct(saved); return; }
    const seed:any={}; (session.selected||[]).forEach((e:any)=>{ const n=Math.max(1,+e.sets||3); seed[e.name]={sets:Array.from({length:n},()=>({w:e.weight||"",r:e.reps||""})),done:false}; });
    setAct(seed); /* eslint-disable-next-line */ },[split]);
  const saveAct=(n:any)=>{ setAct(n); SS("pos_wact_"+t+"_"+split,n); setTick(x=>x+1); };
  const setCell=(ex:string,i:number,f:string,v:string)=>{ const e=act[ex]||{sets:[]}; const sets=e.sets.slice(); sets[i]={...sets[i],[f]:v}; saveAct({...act,[ex]:{...e,sets}}); };
  const addRow=(ex:string)=>{ const e=act[ex]||{sets:[]}; saveAct({...act,[ex]:{...e,sets:[...(e.sets||[]),{w:"",r:""}]}}); };
  const delRow=(ex:string,i:number)=>{ const e=act[ex]||{sets:[]}; const sets=(e.sets||[]).filter((_:any,x:number)=>x!==i); saveAct({...act,[ex]:{...e,sets:sets.length?sets:[{w:"",r:""}]}}); };
  const toggleDone=(ex:string)=>{ const e=act[ex]||{sets:[]}; saveAct({...act,[ex]:{...e,done:!e.done}}); };
  const saveExercise=(ex:string)=>{ const e=act[ex]||{sets:[]}; const filled=(e.sets||[]).filter((s:any)=>s.w||s.r); if(!filled.length){ alert("Enter at least one set for "+ex+"."); return; } saveAct({...act,[ex]:{...e,saved:true,done:true}}); };
  const editExercise=(ex:string)=>{ const e=act[ex]||{}; saveAct({...act,[ex]:{...e,saved:false}}); };
  const deleteExercise=(ex:string)=>{ if(!confirm("Clear the logged sets for "+ex+"?")) return; saveAct({...act,[ex]:{sets:[{w:"",r:""}],done:false,saved:false}}); };

  const shiftFrom=(n:number)=>{ const dates:string[]=[]; for(let i=0;i<200;i++){ const d=addDays(t,i); const c=LS(pKey(d),null); if(c&&Array.isArray(c.exSessions)&&c.exSessions.length) dates.push(d); }
    dates.sort().reverse().forEach(d=>{ const c=LS(pKey(d),{}); const tgt=addDays(d,n); const tc=LS(pKey(tgt),{}); const ts=Array.isArray(tc.exSessions)?tc.exSessions:[]; SS(pKey(tgt),{...tc,exSessions:[...ts,...c.exSessions]}); SS(pKey(d),{...c,exSessions:[]}); }); };
  const skipToday=()=>{ if(!confirm("Make today ("+t+") a REST day and push today's workout + everything after it forward by 1 day?")) return; shiftFrom(1); refresh(); setSplit(""); alert("✓ Today is now a rest day. Your workout and the rest of the schedule shifted forward 1 day."); };
  const moveForward=()=>{ const raw=prompt("Can't train today? Move today's workout AND everything after it forward by how many days?","1"); const n=parseInt(raw||"0"); if(!n||n<1) return;
    shiftFrom(n); refresh(); setSplit(""); alert("✓ Moved everything from "+t+" forward by "+n+" day(s). The rest of the schedule shifted too.");
  };

  const submit=async()=>{
    if(!session) return;
    const planned=(session.selected||[]).map((e:any)=>({name:e.name,sets:+e.sets||0,reps:+e.reps||0,weight:+e.weight||0}));
    const actualEx=(session.selected||[]).map((e:any)=>{ const a=act[e.name]||{sets:[]}; const sets=(a.sets||[]).filter((s:any)=>s.w||s.r).map((s:any)=>({w:+s.w||0,r:+s.r||0}));
      return { name:e.name, planned:{sets:+e.sets||0,reps:+e.reps||0,weight:+e.weight||0}, sets, done:!!a.done, missedSets:Math.max(0,(+e.sets||0)-sets.length) }; });
    if(!actualEx.some((e:any)=>e.sets.length)){ alert("Log at least one set first."); return; }
    const volume=actualEx.reduce((v:number,e:any)=>v+e.sets.reduce((a:number,s:any)=>a+s.w*s.r,0),0);
    const completion=Math.round(actualEx.filter((e:any)=>e.done).length/Math.max(1,actualEx.length)*100);
    const rec={ id:uid(), date:t, type:split, exercises:actualEx.map((e:any)=>({name:e.name,sets:e.sets.map((s:any)=>({w:s.w,r:s.r})),topWeight:e.sets.length?Math.max(0,...e.sets.map((s:any)=>s.w)):0,reps:e.sets.reduce((a:number,s:any)=>a+s.r,0),done:e.done,missedSets:e.missedSets,volume:e.sets.reduce((a:number,s:any)=>a+s.w*s.r,0)})), planned:session.selected, volume, completion, source:"plan" };
    const all=LS("pos_workouts",[]); const idx=all.findIndex((w:any)=>w.date===t&&w.type===split); if(idx>=0) all[idx]=rec; else all.unshift(rec); SS("pos_workouts",all);
    const cur:any=LS(pKey(t),{}); const sess=(cur.exSessions||[]).map((s:any)=> s.id===session.id? {...s,done:true,selected:(s.selected||[]).map((x:any)=>({...x,done:true}))}:s); SS(pKey(t),{...cur,exSessions:sess});
    refresh();
    setBusy(true);
    const history=LS("pos_workouts",[]).filter((w:any)=>w.type===split&&w.date!==t).slice(0,3).map((w:any)=>({date:w.date,volume:w.volume,exercises:(w.exercises||[]).map((e:any)=>({name:e.name,topWeight:e.topWeight,reps:e.reps}))}));
    try{ const r=await fetch("/api/next-workout",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({type:split,planned,actual:actualEx,history})}); const d=await r.json();
      if(d.next) setProposal(d); else alert(d.error||"AI analysis failed."); }catch(e){ alert("AI failed — check your key."); }
    setBusy(false);
  };

  const setNextField=(i:number,f:string,v:string)=>{ setProposal((p:any)=>({...p,next:p.next.map((x:any,idx:number)=>idx===i?{...x,[f]:v}:x)})); setEdited(true); };
  const delNextRow=(i:number)=>{ setProposal((p:any)=>({...p,next:p.next.filter((_:any,idx:number)=>idx!==i)})); setEdited(true); };
  const chatEdit=async()=>{ if(!proposal||!pPrompt.trim())return; setPBusy(true);
    try{ const r=await fetch("/api/edit-workout",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({type:split,exercises:proposal.next,prompt:pPrompt})}); const d=await r.json();
      if(Array.isArray(d.exercises)){ setProposal((p:any)=>({...p,next:d.exercises})); setEdited(true);} setPPrompt(""); }catch(e){} setPBusy(false); };
  const approve=()=>{
    const pk=pKey(nextDate); const cur:any=LS(pk,{}); const ex=Array.isArray(cur.exSessions)?cur.exSessions:[];
    const filtered=ex.filter((s:any)=> !(s.type===split && s.source==="ai")); // replace any prior AI-proposed same split on that date
    filtered.push({ id:uid(), time:"", type:split, done:false, source: edited?"manual":"ai", selected:(proposal.next||[]).map((x:any)=>({name:x.name,sets:String(x.sets||3),reps:String(x.reps||10),weight:String(x.weight||""),note:""})), steps:"", distance:"", duration:"", detail: proposal.note?("AI: "+proposal.note):"" });
    SS(pk,{...cur,exSessions:filtered});
    SS("pos_wact_"+t+"_"+split,null);
    setProposal(null); setSplit(""); refresh();
    alert(`✓ Next ${split} saved to Goals on ${nextDate}${edited?" (your manually-edited version)":""}.`);
  };

  /* ---- render ---- */
  if(!split){
    const todays=daySessions.filter((s:any)=>["Push","Pull","Legs"].includes(s.type));
    return <>
      <div className="head"><h1>🏋️ Workout</h1><p>Pick today&apos;s split — it loads the plan you set in Goals, you log the actual sets, and AI plans your next one.</p></div>
      <div className="grid g3">
        {["Push","Pull","Legs"].map(sp=>{ const has=hasSplit(sp); const done=daySessions.find((s:any)=>s.type===sp)?.done; const col=sp==="Push"?"🟦":sp==="Pull"?"🟪":"🟩";
          return <div key={sp} className={`card workout-split workout-split--${sp.toLowerCase()}`} style={{cursor:"pointer",borderColor:has?"rgba(59,130,246,.45)":undefined,opacity:has?1:.68}} onClick={()=>setSplit(sp)}>
            <img className="workout-split__image" src={SPLIT_VISUAL[sp]} alt={`${sp} workout machine`} />
            <div className="workout-split__body"><div className="between"><strong style={{fontSize:19}}>{sp}</strong><span className="workout-split__mark">{col}</span></div>
            <div className="muted" style={{fontSize:12,marginTop:4}}>{done?"✅ Completed today":has?"Planned for today — tap to log":"Not scheduled today"}</div></div>
          </div>; })}
      </div>
      {!todays.length && <div className="card" style={{marginTop:16}}><strong>😌 Rest day</strong><div className="muted" style={{fontSize:13,marginTop:6}}>No Push/Pull/Legs is planned in Goals for today ({t}). Add today&apos;s session in <b>Goals → Exercise</b>, or move a workout here.</div></div>}
      <div className="card" style={{marginTop:16}}><div className="between" style={{flexWrap:"wrap",gap:8}}>
        <div><strong>Can&apos;t train today?</strong><div className="muted" style={{fontSize:12,marginTop:2}}>Skip today (it becomes a rest day) or move forward by several days. Either way the whole schedule shifts to keep your Push→Pull→Legs→gap rhythm.</div></div>
        <div className="row" style={{gap:8,flexWrap:"wrap"}}>
          <button className="btn ghost sm" onClick={skipToday}>😴 Skip today — make it rest</button>
          <button className="btn ghost sm" onClick={moveForward}>➡ Move forward…</button>
        </div>
      </div></div>
      {(()=>{ const hist=LS("pos_workouts",[]).slice(0,60); return <div className="card" style={{marginTop:16}}>
        <strong>📚 Workout history</strong>
        <div className="muted" style={{fontSize:12,marginTop:2,marginBottom:8}}>Your past sessions — tap one to see every exercise, set &amp; weight.</div>
        {hist.length? <ul className="list">{hist.map((w:any)=>{ const open=histOpen===w.id; const plannedMap:any={}; (w.planned||[]).forEach((pl:any)=>plannedMap[pl.name]=pl);
          return <li key={w.id} style={{padding:"8px 0",borderTop:"1px solid rgba(255,255,255,.06)"}}>
            <div className="between" style={{cursor:"pointer",gap:8}} onClick={()=>setHistOpen(open?null:w.id)}>
              <span style={{fontSize:13}}><b>{open?"▾":"▸"} {w.date}</b> · {w.type}</span>
              <span className="muted" style={{fontSize:12}}>{w.volume||0}kg{w.completion!=null?` · ${w.completion}%`:""}{w.calories?` · ${w.calories}kcal`:""}</span>
            </div>
            {open && <div style={{marginTop:8,paddingLeft:6}}>
              {(w.exercises||[]).length? (w.exercises||[]).map((e:any,i:number)=>{ const sets=(e.sets||[]).map((s:any)=>`${s.w||0}×${s.r||0}`).join(", ")||"—"; const pl=plannedMap[e.name]; return (
                <div key={i} style={{padding:"5px 0",fontSize:13}}>
                  <b>{exEmoji(e.name)} {e.name}</b> <a href={demoLink(e.name)} target="_blank" rel="noopener" style={{fontSize:11,color:"#7dd3fc",textDecoration:"none"}}>📺</a>
                  <div className="muted" style={{fontSize:12}}>Did: {sets}{e.topWeight?` · best ${e.topWeight}kg`:""}{pl?` · plan ${pl.sets}×${pl.reps}@${pl.weight||"—"}kg`:""}{e.missedSets?` · ⚠ ${e.missedSets} set(s) missed`:""}</div>
                </div>
              ); }) : <div className="muted" style={{fontSize:12}}>{w.notes||"No per-exercise detail saved."}</div>}
              <button className="btn ghost sm" style={{marginTop:6}} onClick={()=>delHistory(w.id)}>🗑 Delete</button>
            </div>}
          </li>; })}</ul> : <div className="muted" style={{fontSize:13}}>No workouts logged yet. Complete one from the split buttons above and it&apos;ll appear here.</div>}
      </div>; })()}
    </>;
  }
  if(!session){
    return <>
      <div className="head"><h1>🏋️ {split}</h1><p>No {split} planned for today.</p></div>
      <div className="card"><div className="muted" style={{fontSize:13}}>There&apos;s no <b>{split}</b> session in Goals for today ({t}). Add it in <b>Goals → Exercise</b> (pick {split} and your exercises), then come back — it&apos;ll load here automatically.</div>
        <div style={{marginTop:12}}><button className="btn ghost sm" onClick={()=>setSplit("")}>‹ Back</button></div></div>
    </>;
  }
  const planned=session.selected||[];
  return <>
    <div className="head"><h1>🏋️ {split} — {t}</h1><p>Log the actual sets you did against your plan, then submit for AI analysis &amp; your next workout.</p></div>
    <div className="row" style={{gap:8,marginBottom:12,flexWrap:"wrap"}}><button className="btn ghost sm" onClick={()=>setSplit("")}>‹ Back</button>{session.done && <span className="in" style={{padding:"4px 10px",color:"#6ee7b7"}}>✅ Completed</span>}</div>
    {planned.map((e:any,ei:number)=>{ const a=act[e.name]||{sets:[{w:"",r:""}]}; const sets=a.sets||[{w:"",r:""}];
      const doneSets=(a.sets||[]).filter((s:any)=>s.w||s.r); const top=doneSets.length?Math.max(0,...doneSets.map((s:any)=>+s.w||0)):0;
      if(a.saved){ return (
        <div className="card" key={ei} style={{marginBottom:10,borderColor:"rgba(16,185,129,.45)"}}>
          <div className="between" style={{flexWrap:"wrap",gap:8}}>
            <div><span style={{fontSize:14,fontWeight:650}}>✅ {exEmoji(e.name)} {e.name}</span>
              <div className="muted" style={{fontSize:12,marginTop:2}}>{doneSets.length} set{doneSets.length===1?"":"s"} · {doneSets.map((s:any)=>`${s.w||0}×${s.r||0}`).join(", ")} · best {top}kg</div></div>
            <div className="row" style={{gap:8}}>
              <button className="btn ghost sm" onClick={()=>editExercise(e.name)}>✎ Edit</button>
              <button className="btn ghost sm" onClick={()=>deleteExercise(e.name)}>🗑</button>
            </div>
          </div>
        </div>
      ); }
      return (
      <div className="card" key={ei} style={{marginBottom:12}}>
        <div className="between" style={{flexWrap:"wrap",gap:8}}>
          <div><div style={{fontSize:15,fontWeight:650}}>{exEmoji(e.name)} {e.name} <a href={demoLink(e.name)} target="_blank" rel="noopener" style={{fontSize:11,color:"#7dd3fc",textDecoration:"none"}}>📺 Demo</a> <span onClick={()=>setPInfo(pInfo===e.name?null:e.name)} style={{fontSize:11,color:"#a5b4fc",cursor:"pointer"}}>ⓘ How to</span></div>
            <div className="muted" style={{fontSize:12,marginTop:2}}>Plan: {e.sets}×{e.reps} @ {e.weight||"—"}kg</div></div>
        </div>
        <ExerciseGuide name={e.name}/>
        {pInfo===e.name && <div className="exercise-howto"><b>How to perform</b><div>{HOWTO[e.name]||"Use controlled form and a pain-free range of motion — tap Demo to watch it."}</div><small>Stop if you feel sharp pain. Ask a trainer to check unfamiliar equipment.</small></div>}
        <table style={{width:"100%",borderCollapse:"collapse",marginTop:10}}>
          <thead><tr>{["Set","Weight (kg)","Reps",""].map(h=><th key={h} style={{textAlign:"left",fontSize:10,textTransform:"uppercase",color:"#5b6577",padding:"5px"}}>{h}</th>)}</tr></thead>
          <tbody>{sets.map((s:any,i:number)=><tr key={i}>
            <td style={{padding:"5px",color:"#8A94A6",fontWeight:700,width:36}}>{i+1}</td>
            <td style={{padding:"5px"}}><input className="in" type="number" value={s.w??""} onChange={ev=>setCell(e.name,i,"w",ev.target.value)} placeholder={String(e.weight||"")} style={{width:100}}/></td>
            <td style={{padding:"5px"}}><input className="in" type="number" value={s.r??""} onChange={ev=>setCell(e.name,i,"r",ev.target.value)} placeholder={String(e.reps||"")} style={{width:100}}/></td>
            <td style={{padding:"5px"}}>{sets.length>1 && <span className="btn ghost sm" style={{cursor:"pointer"}} onClick={()=>delRow(e.name,i)}>✕</span>}</td>
          </tr>)}</tbody>
        </table>
        <div className="row" style={{gap:8,marginTop:8,flexWrap:"wrap"}}>
          <button className="btn ghost sm" onClick={()=>addRow(e.name)}>+ Add set</button>
          <button className="btn sm" onClick={()=>saveExercise(e.name)} style={{background:"linear-gradient(100deg,var(--emerald),var(--blue))"}}>✅ Save exercise</button>
        </div>
      </div>
    ); })}
    <div className="card"><button className="btn" onClick={submit} disabled={busy} style={{background:"linear-gradient(100deg,var(--emerald),var(--blue))"}}>{busy?"🤖 Analysing…":"✅ Submit workout & get AI analysis + next plan"}</button>
      <div className="muted" style={{fontSize:11,marginTop:8}}>AI compares plan vs actual, your history &amp; progression, records any missed sets, then proposes your next {split}.</div>
    </div>

    {proposal && <div className="card" style={{marginTop:16,borderColor:"rgba(16,185,129,.4)"}}>
      {proposal.analysis && <><div className="row" style={{gap:8,marginBottom:6}}><span>📊</span><strong style={{fontSize:15}}>AI Analysis</strong></div>
      <div style={{whiteSpace:"pre-wrap",fontSize:13,lineHeight:1.7,color:"#c9d3e0",background:"rgba(255,255,255,.03)",border:"1px solid var(--stroke)",borderRadius:12,padding:14}}>{proposal.analysis}</div></>}
      <div className="row" style={{gap:8,margin:"16px 0 8px"}}><span>🎯</span><strong style={{fontSize:15}}>Proposed next {split}</strong></div>
      {proposal.note && <div className="muted" style={{fontSize:12,marginBottom:8}}>{proposal.note}</div>}
      <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",minWidth:460}}>
        <thead><tr>{["Exercise","Sets","Reps","Weight (kg)",""].map(h=><th key={h} style={{textAlign:"left",fontSize:10,textTransform:"uppercase",color:"#5b6577",padding:"6px",borderBottom:"1px solid rgba(255,255,255,.09)"}}>{h}</th>)}</tr></thead>
        <tbody>{(proposal.next||[]).map((x:any,i:number)=><tr key={i} style={{borderBottom:"1px solid rgba(255,255,255,.05)"}}>
          <td style={{padding:"6px"}}><input className="in" value={x.name||""} onChange={e=>setNextField(i,"name",e.target.value)} style={{minWidth:150,width:"100%"}}/></td>
          <td style={{padding:"6px"}}><input className="in" value={x.sets??""} onChange={e=>setNextField(i,"sets",e.target.value)} style={{width:52}}/></td>
          <td style={{padding:"6px"}}><input className="in" value={x.reps??""} onChange={e=>setNextField(i,"reps",e.target.value)} style={{width:52}}/></td>
          <td style={{padding:"6px"}}><input className="in" value={x.weight??""} onChange={e=>setNextField(i,"weight",e.target.value)} style={{width:70}}/></td>
          <td style={{padding:"6px",whiteSpace:"nowrap"}}><a href={demoLink(x.name)} target="_blank" rel="noopener" style={{marginRight:6,textDecoration:"none"}}>📺</a><span className="btn ghost sm" style={{cursor:"pointer"}} onClick={()=>delNextRow(i)}>✕</span></td>
        </tr>)}</tbody>
      </table></div>
      <div style={{marginTop:12,padding:12,borderRadius:12,background:"rgba(139,92,246,.08)",border:"1px solid rgba(139,92,246,.25)"}}>
        <div className="row" style={{gap:8}}><span>✨</span><strong style={{fontSize:13}}>Ask AI to change it</strong></div>
        <div className="row" style={{gap:8,marginTop:8,flexWrap:"wrap"}}>
          <input className="in" value={pPrompt} onChange={e=>setPPrompt(e.target.value)} placeholder="e.g. replace bench with dumbbell press, add rear delts, lighter legs" style={{flex:1,minWidth:220}} onKeyDown={e=>{ if(e.key==="Enter") chatEdit(); }}/>
          <button className="btn sm" onClick={chatEdit} disabled={pBusy}>{pBusy?"🤖…":"Apply"}</button>
        </div>
      </div>
      <div className="row" style={{gap:8,marginTop:12,flexWrap:"wrap",alignItems:"center"}}>
        <span className="muted" style={{fontSize:13}}>Schedule on:</span>
        <input className="in" type="date" value={nextDate} min={t} onChange={e=>setNextDate(e.target.value)} style={{width:160}}/>
        <span className="muted" style={{fontSize:11}}>(default +4 days — next {split} in your cycle)</span>
        <button className="btn" onClick={approve} style={{background:"linear-gradient(100deg,var(--emerald),var(--blue))"}}>✅ Accept &amp; save to Goals</button>
      </div>
      {edited && <div className="muted" style={{fontSize:11,marginTop:6,color:"#fcd34d"}}>You edited this — it&apos;ll be saved as your manual final plan.</div>}
    </div>}
  </>;
}
