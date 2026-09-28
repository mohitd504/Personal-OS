"use client";
// Chart and layout pieces shared by the Exercise tab screens.
import { ResponsiveContainer, LineChart, XAxis, YAxis, Tooltip, Line, BarChart, Bar } from "recharts";
import { exerciseSetup } from "@/components/fitness/data";

export function ExerciseGuide({name}: {name:string}){ const m=exerciseSetup(name); return <div className="exercise-guide">
  <div className="exercise-guide__item"><span>Machine / setup</span><b>{m.machine}</b></div>
  <div className="exercise-guide__item"><span>Movement pattern</span><b>{m.pattern}</b></div>
  <div className="exercise-guide__item"><span>Main muscles</span><b>{m.target}</b></div>
  <div className="exercise-guide__cue"><span>FORM CUE</span>{m.cue}</div>
</div>; }
export const TT = { background:"#0f172a", border:"1px solid rgba(255,255,255,.12)", borderRadius:8, color:"#E7ECF3" } as any;
export function LineC({ title, data, color }: any) {
  return <div className="card"><strong>{title}</strong><div style={{height:210,marginTop:6}}>
    <ResponsiveContainer width="100%" height="100%"><LineChart data={data}>
      <XAxis dataKey="name" tick={{fill:"#8A94A6",fontSize:10}} axisLine={false} tickLine={false}/>
      <YAxis domain={["auto","auto"]} tick={{fill:"#8A94A6",fontSize:10}} axisLine={false} tickLine={false} width={34}/>
      <Tooltip contentStyle={TT}/><Line type="monotone" dataKey="value" stroke={color} strokeWidth={2.5} dot={{r:3,fill:color}}/>
    </LineChart></ResponsiveContainer></div></div>;
}
export function BarC({ title, data, color }: any) {
  return <div className="card"><strong>{title}</strong><div style={{height:210,marginTop:6}}>
    <ResponsiveContainer width="100%" height="100%"><BarChart data={data}>
      <XAxis dataKey="name" tick={{fill:"#8A94A6",fontSize:10}} axisLine={false} tickLine={false}/>
      <YAxis tick={{fill:"#8A94A6",fontSize:10}} axisLine={false} tickLine={false} width={30}/>
      <Tooltip cursor={{fill:"rgba(255,255,255,.05)"}} contentStyle={TT}/><Bar dataKey="value" fill={color} radius={[6,6,0,0]}/>
    </BarChart></ResponsiveContainer></div></div>;
}
export function Stat({ label, value, unit, sub, tint="blue" }: any){
  return <div className="card kpi"><div className="between"><div className="lbl">{label}</div>{tint&&<div className={"ic-chip tint-"+tint} style={{width:26,height:26,fontSize:11}} />}</div>
    <div className="val" style={{fontSize:23}}>{value}{unit&&<small> {unit}</small>}</div>{sub&&<div className="muted" style={{fontSize:11,marginTop:4}}>{sub}</div>}</div>;
}
export function Sec({ t, s }: any){ return <div style={{margin:"26px 0 12px"}}><h2 style={{fontSize:17,fontWeight:720,margin:0}}>{t}</h2>{s&&<div className="muted" style={{fontSize:12,marginTop:3}}>{s}</div>}</div>; }
