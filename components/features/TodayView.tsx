"use client";
import type { AppSettings } from "@/lib/domain";
import { readJson } from "@/lib/client-storage";

const dateKey = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; };
const pct = (value:number, goal:number) => Math.min(100, Math.round(value / Math.max(1, goal) * 100));

export default function TodayView({ settings, onNavigate, tick }: { settings: AppSettings; onNavigate: (view:string)=>void; tick:number }) {
  void tick;
  const date = dateKey();
  const plan = readJson<any>(`pos_plan_${date}`, {});
  const nutrition = readJson<any>(`pos_nutri_${date}`, { meals: [], water: 0 });
  const health = readJson<any>("pos_health", {});
  const meals = Array.isArray(nutrition.meals) ? nutrition.meals : [];
  const totals = meals.reduce((sum:any, meal:any) => ({ cal:sum.cal+(+meal.cal||0), protein:sum.protein+(+meal.protein||0) }), { cal:0, protein:0 });
  const sessions = Array.isArray(plan.exSessions) ? plan.exSessions : [];
  const study = Array.isArray(plan.studyList) ? plan.studyList : [];
  const studyTasks = study.flatMap((subject:any) => Array.isArray(subject.plan) ? subject.plan : []);
  const priorities = readJson<any[]>(`pos_priorities_${date}`, []);
  const cards = [
    { icon:"🏃", title:"Movement", value:`${(+health.steps||0).toLocaleString()} steps`, progress:pct(+health.steps||0,settings.stepGoal), view:"health" },
    { icon:"🍽️", title:"Nutrition", value:`${totals.cal} / ${settings.calorieGoal} kcal`, progress:pct(totals.cal,settings.calorieGoal), view:"nutrition" },
    { icon:"💪", title:"Protein", value:`${totals.protein} / ${settings.proteinGoal} g`, progress:pct(totals.protein,settings.proteinGoal), view:"nutrition" },
    { icon:"📚", title:"Study", value:`${studyTasks.filter((x:any)=>x.done).length} / ${studyTasks.length} tasks`, progress:studyTasks.length?pct(studyTasks.filter((x:any)=>x.done).length,studyTasks.length):0, view:"study" },
  ];
  const updatePriority = (index:number, value:string) => {
    const next = [...priorities]; next[index] = { text:value, done:next[index]?.done||false };
    localStorage.setItem(`pos_priorities_${date}`, JSON.stringify(next));
  };
  const togglePriority = (index:number) => {
    const next = [...priorities]; next[index] = { text:next[index]?.text||"", done:!next[index]?.done };
    localStorage.setItem(`pos_priorities_${date}`, JSON.stringify(next));
  };
  return <>
    <div className="head"><h1>Today</h1><p>One place for the actions that matter now.</p></div>
    <div className="grid g4">{cards.map(card=><button key={card.title} className="card" onClick={()=>onNavigate(card.view)} style={{textAlign:"left",color:"inherit",cursor:"pointer"}}>
      <div className="between"><strong>{card.icon} {card.title}</strong><span className="muted">{card.progress}%</span></div><div style={{fontSize:22,fontWeight:750,margin:"14px 0 10px"}}>{card.value}</div><div className="bar"><span style={{width:`${card.progress}%`,background:"#3b82f6"}}/></div>
    </button>)}</div>
    <div className="grid g2" style={{marginTop:16}}>
      <div className="card"><div className="between"><strong>Top three priorities</strong><span className="muted">Saved automatically</span></div>{[0,1,2].map(index=><div className="row" key={index} style={{marginTop:12}}><input type="checkbox" checked={!!priorities[index]?.done} onChange={()=>togglePriority(index)} aria-label={`Complete priority ${index+1}`}/><input className="in" defaultValue={priorities[index]?.text||""} onBlur={e=>updatePriority(index,e.target.value)} placeholder={`${index+1}. Most important task`} style={{flex:1,textDecoration:priorities[index]?.done?"line-through":"none"}}/></div>)}</div>
      <div className="card"><div className="between"><strong>Schedule</strong><button className="btn ghost sm" onClick={()=>onNavigate("goals")}>Edit plan</button></div>
        <div style={{marginTop:12}}>{sessions.length?sessions.map((item:any)=><div className="li" key={item.id||item.type}><span>{item.done?"✅":"○"}</span><div><b>{item.time||"Any time"} · {item.type}</b><div className="muted" style={{fontSize:12}}>{(item.selected||[]).length} exercises</div></div></div>):<div className="muted">No workout planned.</div>}</div>
        <div style={{marginTop:10}}>{study.length?study.map((item:any)=><div className="li" key={item.id||item.label}><span>📘</span><div><b>{item.label||"Study"}</b><div className="muted" style={{fontSize:12}}>{(item.plan||[]).length} planned tasks</div></div></div>):<div className="muted">No study session planned.</div>}</div>
      </div>
    </div>
  </>;
}
