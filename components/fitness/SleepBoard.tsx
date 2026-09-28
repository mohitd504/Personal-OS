"use client";
import { useState } from "react";
import { today, LS, SS, r1, pctOf, clamp, r0 } from "@/components/fitness/data";
import { Stat, LineC } from "@/components/fitness/ui";

export function SleepQuickAdd({ refresh }: { refresh:()=>void }){
  const [f,setF]=useState<any>({date:today()});
  const save=()=>{ if(!(+f.total)){ alert("Enter total sleep hours"); return; } const all=LS("pos_sleep",[]); const i=all.findIndex((x:any)=>x.date===f.date);
    const rec={date:f.date,total:+f.total||0,deep:+f.deep||0,rem:+f.rem||0,light:+f.light||0,awake:+f.awake||0,efficiency:+f.efficiency||0,bedtime:f.bedtime||"",wake:f.wake||""};
    if(i>=0) all[i]=rec; else all.push(rec); all.sort((a:any,b:any)=>a.date<b.date?1:-1); SS("pos_sleep",all); setF({date:today()}); refresh(); };
  return <div className="card" style={{marginTop:12}}><div className="row" style={{gap:8,flexWrap:"wrap"}}>
    <input className="in" type="date" value={f.date} onChange={e=>setF((s:any)=>({...s,date:e.target.value}))} style={{width:150}}/>
    <input className="in" type="number" placeholder="Total h" value={f.total??""} onChange={e=>setF((s:any)=>({...s,total:e.target.value}))} style={{width:90}}/>
    <input className="in" type="number" placeholder="Deep h" value={f.deep??""} onChange={e=>setF((s:any)=>({...s,deep:e.target.value}))} style={{width:90}}/>
    <input className="in" type="number" placeholder="REM h" value={f.rem??""} onChange={e=>setF((s:any)=>({...s,rem:e.target.value}))} style={{width:90}}/>
    <input className="in" type="number" placeholder="Light h" value={f.light??""} onChange={e=>setF((s:any)=>({...s,light:e.target.value}))} style={{width:90}}/>
    <input className="in" type="number" placeholder="Efficiency %" value={f.efficiency??""} onChange={e=>setF((s:any)=>({...s,efficiency:e.target.value}))} style={{width:120}}/>
    <button className="btn sm" onClick={save}>Log sleep</button>
  </div></div>;
}

/* ================= SLEEP BOARD ================= */
export function SleepBoard({ refresh }: { refresh: () => void }){
  const sleep=LS("pos_sleep",[]).slice().sort((a:any,b:any)=>a.date<b.date?-1:1);
  const last=sleep[sleep.length-1]||{};
  const avg=sleep.length? r1(sleep.slice(-7).reduce((a:number,x:any)=>a+(+x.total||0),0)/Math.min(7,sleep.length)):0;
  const chart=sleep.slice(-14).map((x:any)=>({name:(x.date||"").slice(5),value:+x.total||0}));
  const eff=+last.efficiency||0; const goalPct=pctOf(+last.total||avg,8);
  const del=(d:string)=>{ SS("pos_sleep",LS("pos_sleep",[]).filter((x:any)=>x.date!==d)); refresh(); };
  return <>
    <div className="head"><h1>😴 Sleep Tracker</h1><p>Filled automatically from your watch (Google Health) — or log manually anytime.</p></div>
    <div className="grid g4">
      <Stat label="Last Night" value={+last.total||"—"} unit="h" tint="indigo"/>
      <Stat label="7-day Avg" value={avg||"—"} unit="h" tint="indigo"/>
      <Stat label="Deep" value={+last.deep||"—"} unit="h" tint="violet"/>
      <Stat label="REM" value={+last.rem||"—"} unit="h" tint="violet"/>
      <Stat label="Light" value={+last.light||"—"} unit="h" tint="blue"/>
      <Stat label="Efficiency" value={eff||"—"} unit="%" tint="emerald"/>
      <Stat label="Quality" value={eff? clamp(r0(eff*0.6+goalPct*0.4)) : (goalPct||"—")} unit="/100" tint="emerald"/>
      <Stat label="Sleep Goal" value={goalPct} unit="%" sub="target 8h" tint="cyan"/>
    </div>
    <div className="grid g2" style={{marginTop:16}}>
      <LineC title="Sleep Duration (14d)" color="#8B5CF6" data={chart.length?chart:[{name:"—",value:0}]}/>
      <div className="card"><strong>Log sleep</strong><div className="muted" style={{fontSize:12,marginTop:6}}>Watch sync fills this automatically; add or correct entries here.</div><SleepQuickAdd refresh={refresh}/>
        <div style={{overflowX:"auto",marginTop:12}}><table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr>{["Date","Total","Deep","REM","Eff","Src",""].map(h=><th key={h} style={{textAlign:"left",fontSize:10,textTransform:"uppercase",color:"#5b6577",padding:"6px"}}>{h}</th>)}</tr></thead>
          <tbody>{sleep.slice().reverse().slice(0,12).map((x:any,i:number)=><tr key={i} style={{borderBottom:"1px solid rgba(255,255,255,.05)"}}>
            <td style={{padding:"6px",fontSize:12}}>{x.date}</td><td style={{padding:"6px",fontSize:12}}>{x.total||"—"}h</td><td style={{padding:"6px",fontSize:12}}>{x.deep||"—"}</td><td style={{padding:"6px",fontSize:12}}>{x.rem||"—"}</td><td style={{padding:"6px",fontSize:12}}>{x.efficiency||"—"}</td><td style={{padding:"6px",fontSize:11,color:"#8A94A6"}}>{x.source==="watch"?"⌚":"✎"}</td>
            <td style={{padding:"6px"}}><span className="btn ghost sm" style={{cursor:"pointer"}} onClick={()=>del(x.date)}>✕</span></td></tr>)}
          {!sleep.length&&<tr><td colSpan={7} className="muted" style={{padding:"10px 6px"}}>No sleep logged yet.</td></tr>}</tbody>
        </table></div>
      </div>
    </div>
  </>;
}
