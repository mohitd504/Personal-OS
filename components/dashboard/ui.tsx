"use client";
// Small presentational pieces shared by the dashboard views.
import { useState, useEffect } from "react";

/* ---------- shared ---------- */
export const Chip = ({ tint, children }: any) => <div className={"ic-chip tint-"+tint}>{children}</div>;
export function Kpi({ lbl, val, unit, ic, tint, sub }: any) {
  return <div className="card kpi"><div className="between"><div className="lbl">{lbl}</div><Chip tint={tint}>{ic}</Chip></div>
    <div className="val">{val}{unit && <small> {unit}</small>}</div>{sub && <div className="muted" style={{fontSize:11,marginTop:8}}>{sub}</div>}</div>;
}
export function Head({ t, p }: any) { return <div className="head"><h1>{t}</h1><p>{p}</p></div>; }
export function Bar({ v, goal, color }: any) { const p = goal? Math.min(v/goal*100,100):0; return <div className="bar"><span style={{width:p+"%",background:color}} /></div>; }
export function MiniTimer({ minutes }:{ minutes:number }){ const [sec,setSec]=useState(0); const [run,setRun]=useState(false);
  useEffect(()=>{ if(!run) return; const id=setInterval(()=>setSec((s:number)=>s+1),1000); return ()=>clearInterval(id); },[run]);
  const f=(s:number)=>`${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`; const over=sec>=minutes*60;
  return <span className="row" style={{gap:6}}><span style={{fontSize:13,fontWeight:700,color:over?"#f9a8d4":run?"#6ee7b7":"#8A94A6",fontVariantNumeric:"tabular-nums"}}>⏱ {f(sec)} / {minutes}:00</span><button className="btn ghost sm" onClick={()=>setRun(r=>!r)}>{run?"⏸":"▶"}</button><button className="btn ghost sm" onClick={()=>{setSec(0);setRun(false);}}>↺</button></span>; }
export function PRow({ icon, tint, title, action, children }: any){ return <div className="card" style={{marginBottom:14}}>
  <div className="between" style={{gap:10,marginBottom:10,flexWrap:"wrap"}}><div className="row" style={{gap:10}}><Chip tint={tint}>{icon}</Chip><strong style={{fontSize:15}}>{title}</strong></div>{action}</div>{children}</div>; }
