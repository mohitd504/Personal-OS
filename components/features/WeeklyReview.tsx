"use client";
import type { AppSettings } from "@/lib/domain";
import { readJson } from "@/lib/client-storage";

const ds = (d:Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;

export default function WeeklyReview({ settings, tick }: { settings: AppSettings; tick:number }) {
  void tick;
  const days = Array.from({length:7},(_,i)=>{ const d=new Date(); d.setDate(d.getDate()-(6-i)); return ds(d); });
  const rows = days.map(date=>{
    const n=readJson<any>(`pos_nutri_${date}`,{meals:[]}); const meals=Array.isArray(n.meals)?n.meals:[];
    const plan=readJson<any>(`pos_plan_${date}`,{}); const sessions=Array.isArray(plan.exSessions)?plan.exSessions:[]; const subjects=Array.isArray(plan.studyList)?plan.studyList:[];
    const tasks=subjects.flatMap((s:any)=>Array.isArray(s.plan)?s.plan:[]);
    return { date, calories:meals.reduce((a:number,m:any)=>a+(+m.cal||0),0), protein:meals.reduce((a:number,m:any)=>a+(+m.protein||0),0), workouts:sessions.filter((x:any)=>x.done).length, studyDone:tasks.filter((x:any)=>x.done).length, studyTotal:tasks.length };
  });
  const workoutDays=rows.filter(x=>x.workouts>0).length; const nutritionDays=rows.filter(x=>x.calories>0).length; const proteinDays=rows.filter(x=>x.protein>=settings.proteinGoal*.85).length;
  const studyDone=rows.reduce((a,x)=>a+x.studyDone,0), studyTotal=rows.reduce((a,x)=>a+x.studyTotal,0);
  const score=Math.round((workoutDays/5*30)+(nutritionDays/7*20)+(proteinDays/7*25)+(studyTotal?studyDone/studyTotal*25:0));
  const recommendations=[workoutDays<3?"Schedule three short workouts before adding more volume.":"Keep your training rhythm and progress one exercise next week.",proteinDays<5?"Pre-plan one protein source for each main meal.":"Protein consistency is strong—focus on food quality and recovery.",studyTotal&&studyDone/studyTotal<.7?"Reduce daily study scope and finish the highest-value blocks first.":"Keep study sessions focused and review difficult topics weekly."];
  return <><div className="head"><h1>Weekly Review</h1><p>Seven-day consistency, trends, and your next best actions.</p></div>
    <div className="grid g4"><div className="card"><div className="lbl">WEEK SCORE</div><div className="val">{Math.min(100,score)}<small>/100</small></div></div><div className="card"><div className="lbl">WORKOUT DAYS</div><div className="val">{workoutDays}<small>/7</small></div></div><div className="card"><div className="lbl">PROTEIN DAYS</div><div className="val">{proteinDays}<small>/7</small></div></div><div className="card"><div className="lbl">STUDY TASKS</div><div className="val">{studyDone}<small>/{studyTotal}</small></div></div></div>
    <div className="grid g2" style={{marginTop:16}}><div className="card"><strong>Daily consistency</strong>{rows.map(row=><div key={row.date} className="between" style={{marginTop:12,fontSize:13}}><span>{new Date(`${row.date}T12:00:00`).toLocaleDateString(undefined,{weekday:"short",day:"numeric"})}</span><span className="muted">{row.workouts?"🏋️":"·"} {row.protein>=settings.proteinGoal*.85?"🥩":"·"} {row.studyDone?"📚":"·"} · {row.calories||0} kcal</span></div>)}</div><div className="card"><strong>Focus for next week</strong><ol style={{paddingLeft:20,lineHeight:1.7}}>{recommendations.map(x=><li key={x}>{x}</li>)}</ol><div className="muted" style={{fontSize:12}}>These suggestions are generated from your logged data and are guidance, not medical advice.</div></div></div>
  </>;
}
