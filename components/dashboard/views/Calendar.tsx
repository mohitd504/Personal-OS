"use client";
import { useState, useEffect } from "react";
import { Head } from "@/components/dashboard/ui";
import { today, LS, PPL, studyTotal } from "@/components/dashboard/data";

/* ---------- CALENDAR (live) ---------- */
export function Calendar({ sett, tick }: any) {
  const [today_,setToday]=useState<any[]|null>(null); const [week,setWeek]=useState<any[]|null>(null); const [err,setErr]=useState("");
  useEffect(()=>{ fetch("/api/calendar?days=1").then(r=>r.json()).then(d=>{if(d.error)setErr(d.error);setToday(d.events||[]);}).catch(e=>setErr(String(e)));
    fetch("/api/calendar?days=7").then(r=>r.json()).then(d=>setWeek(d.events||[])).catch(()=>{}); },[]);
  const t=(e:any)=> e.allDay? "All day" : new Date(e.start).toLocaleTimeString(undefined,{hour:"numeric",minute:"2-digit"});
  return <>
    <Head t="Calendar" p="Live from Google Calendar" />
    {err && <div className="card" style={{color:"var(--pink)",marginBottom:16}}>{err}</div>}
    <div className="grid g2">
      <div className="card"><strong>Today</strong><ul className="list">{today_===null?<li className="muted" style={{padding:"8px 0"}}>Loading…</li>:today_.length?today_.map((e,i)=><li className="li" key={i}><span className="dot" style={{background:"var(--violet)"}}/><div style={{flex:1}} className="between"><strong style={{fontSize:13}}>{e.summary}</strong><span className="muted" style={{fontSize:11}}>{t(e)}</span></div></li>):<li className="muted" style={{padding:"8px 0"}}>Clear day 🎯</li>}</ul></div>
      <div className="card"><strong>Next 7 days</strong><ul className="list">{week===null?<li className="muted" style={{padding:"8px 0"}}>Loading…</li>:week.length?week.map((e,i)=><li className="li" key={i}><span className="dot" style={{background:"var(--blue)"}}/><div style={{flex:1}} className="between"><strong style={{fontSize:13}}>{e.summary}</strong><span className="muted" style={{fontSize:11}}>{e.allDay?"":new Date(e.start).toLocaleDateString(undefined,{weekday:"short",hour:"numeric",minute:"2-digit"})}</span></div></li>):<li className="muted" style={{padding:"8px 0"}}>Nothing scheduled.</li>}</ul></div>
    </div>
    <Cal120 />
    <PlanCalendar sett={sett}/>
  </>;
}
/* ---------- 120-day calendar outlook ---------- */
export function Cal120(){
  const [events,setEvents]=useState<any[]|null>(null); const [err,setErr]=useState("");
  const [sel,setSel]=useState<string>("");
  useEffect(()=>{ fetch("/api/calendar?days=120").then(r=>r.json()).then(d=>{ if(d.error)setErr(d.error); setEvents(d.events||[]); }).catch(e=>setErr(String(e))); },[]);
  const byDay:Record<string,any[]>={}; (events||[]).forEach(e=>{ const ds=(e.start||"").slice(0,10); if(!ds)return; (byDay[ds]=byDay[ds]||[]).push(e); });
  const cells=[]; for(let i=0;i<120;i++){ const d=new Date(); d.setHours(0,0,0,0); d.setDate(d.getDate()+i); const ds=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; const n=(byDay[ds]||[]).length;
    const bg=n===0?"rgba(255,255,255,.05)":n<=1?"rgba(59,130,246,.4)":n<=3?"rgba(59,130,246,.7)":"rgba(59,130,246,1)";
    cells.push(<div key={i} onClick={()=>setSel(ds)} title={`${ds} · ${n} event${n===1?"":"s"}`} style={{aspectRatio:"1",borderRadius:5,background:bg,cursor:"pointer",outline:ds===sel?"2px solid #fff":ds===today()?"1px solid rgba(255,255,255,.4)":"none"}}/>); }
  const scheduled=Object.keys(byDay).length; const free=120-scheduled;
  const selList=sel?(byDay[sel]||[]):[];
  return <div className="card" style={{marginTop:16}}>
    <div className="between" style={{flexWrap:"wrap",gap:8}}><strong>Next 120 days — schedule outlook</strong>
      <div className="row" style={{gap:14}}><span className="muted" style={{fontSize:12}}>Scheduled <b style={{color:"#E7ECF3"}}>{scheduled}</b> days</span><span className="muted" style={{fontSize:12}}>Free <b style={{color:"#E7ECF3"}}>{free}</b> days</span></div>
    </div>
    {err && <div className="muted" style={{color:"var(--pink)",fontSize:12,marginTop:8}}>{err}</div>}
    {events===null? <div className="muted" style={{padding:"10px 0"}}>Loading 120-day outlook…</div> :
      <><div className="cal-grid" style={{gridTemplateColumns:"repeat(20,1fr)"}}>{cells}</div>
      <div className="muted" style={{fontSize:11,marginTop:8}}>Bluer = more events. Tap a day to see what's on it.</div>
      {sel && <div style={{marginTop:12,paddingTop:12,borderTop:"1px solid rgba(255,255,255,.07)"}}>
        <strong style={{fontSize:13}}>{sel}</strong>
        <ul className="list">{selList.length? selList.map((e,i)=><li className="li" key={i}><span className="dot" style={{background:"var(--violet)"}}/><div style={{flex:1}} className="between"><span style={{fontSize:13}}>{e.summary}</span><span className="muted" style={{fontSize:11}}>{e.allDay?"All day":new Date(e.start).toLocaleTimeString(undefined,{hour:"numeric",minute:"2-digit"})}</span></div></li>):<li className="muted" style={{padding:"8px 0"}}>Free day — nothing scheduled 🎯</li>}</ul>
      </div>}</>}
  </div>;
}
export function PlanCalendar({ sett }: any) {
  const start=new Date(sett.planStart); const done:Record<string,boolean>={}; LS("pos_workouts",[]).forEach((w:any)=>done[w.date]=true);
  const col:Record<string,string>={Push:"var(--blue)",Pull:"var(--purple)",Legs:"var(--emerald)",Recovery:"var(--mut2)"};
  const cells=[]; for(let i=0;i<sett.planDays;i++){const d=new Date(start);d.setDate(d.getDate()+i);const ds=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;const sp=PPL[d.getDay()];const act=done[ds]||studyTotal(ds)>0;
    cells.push(<div key={i} className={"cal-cell"+(sp==="Recovery"?" rest":"")+(ds===today()?" today":"")} title={`Day ${i+1} · ${ds} · ${sp}`}><div className="cd">{i+1}</div><div className="cs" style={{color:col[sp]}}>{sp[0]}</div>{act && <div style={{position:"absolute",top:2,right:3,color:"var(--emerald)",fontSize:9}}>✓</div>}</div>);}
  return <div className="card" style={{marginTop:16}}><strong>{sett.planDays}-Day Plan Calendar</strong><div className="cal-grid">{cells}</div></div>;
}
