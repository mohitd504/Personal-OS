"use client";
import { today, LS, nutTotals, studyTotal, GYM_TYPES, PPL, fmt, studyProgress, last7 } from "@/components/dashboard/data";
import { Head, Bar } from "@/components/dashboard/ui";
import { LineCard, BarCard } from "@/components/dashboard/lazy";

/* ---------- HOME ---------- */
export function Home({ sett, tick, date }: any) {
  const D = date || today(); const viewing = D !== today();
  const w = LS("pos_weight", [{date:today(),kg:97}]); const cur = w[w.length-1].kg;
  const nt = nutTotals(D); const st = studyTotal(D);
  const H = LS("pos_health", {});
  const plan = LS("pos_plan_"+D, {});
  const steps = +(H.steps||0); const recovery = +(H.recovery||0);
  const stepPct = Math.min(100,Math.round(steps/Math.max(1,sett.stepGoal)*100));
  const proteinPct = Math.min(100,Math.round(nt.protein/Math.max(1,sett.proteinGoal)*100));
  const caloriePct = Math.min(100,Math.round(nt.cal/Math.max(1,sett.calorieGoal)*100));
  const studyPct = Math.min(100,Math.round(st/120*100));
  const score = Math.round((stepPct+proteinPct+studyPct+(recovery||50))/4);
  const start = new Date(sett.planStart); const dayNo = Math.max(1, Math.floor((new Date(D).getTime()-start.getTime())/86400000)+1);
  const h = new Date().getHours(); const greet = h<12?"Good morning":h<18?"Good afternoon":"Good evening";
  const pretty = new Date(D).toLocaleDateString(undefined,{weekday:"long",month:"long",day:"numeric"});
  const exAll = (plan.exSessions||[]); const gymEx = exAll.find((s:any)=>GYM_TYPES.includes(s.type)); const walkEx = exAll.find((s:any)=>s.type==="Walk"); const ex = gymEx || exAll[0];
  const woLabel = gymEx ? `${gymEx.type} + Walk` : (walkEx ? "Rest day · Walk only" : `${PPL[new Date().getDay()]} workout`);
  const woDetail = gymEx ? `11,000-step walk · ${(gymEx.selected||[]).length} ${gymEx.type} exercises` : (walkEx ? "11,000-step walk" : "Open Goals to plan");
  const woDone = gymEx ? (!!gymEx.done && (walkEx ? !!walkEx.done : true)) : (walkEx ? !!walkEx.done : false);
  const studies=(plan.studyList||[]).slice(0,2); const meals=plan.meals||{};
  const stTasks=(plan.studyList||[]).flatMap((s:any)=>Array.isArray(s.plan)?s.plan:[]); const stDone=stTasks.filter((t:any)=>t.done).length; const stTaskPct=stTasks.length?Math.round(stDone/stTasks.length*100):studyPct;
  const stLabel=(plan.studyList||[])[0]?.label||(plan.studyList||[])[0]?.title||(plan.studyList||[])[0]?.name||"Study session";
  const stDetail=stTasks.length?`${stDone}/${stTasks.length} tasks done${st?` · ${fmt(st)}`:""}`:(st?`${fmt(st)} completed`:"120 min target");
  const cprog=studyProgress(); const cList=[["Agentic AI",cprog.courses.agentic],["System Design",cprog.courses.sysdesign],["DSA",cprog.courses.dsa]].filter((c:any)=>c[1]&&c[1].total>0) as any[];
  const todayTasks=[
    {ic:"🚶",label:"Daily steps",detail:`${steps.toLocaleString()} / ${sett.stepGoal.toLocaleString()}`,pct:stepPct,color:"#10B981"},
    {ic:"🏋️",label:woLabel,detail:woDetail,pct:woDone?100:0,color:"#8B5CF6"},
    {ic:"🍗",label:"Protein target",detail:`${nt.protein} / ${sett.proteinGoal} g`,pct:proteinPct,color:"#F59E0B"},
    {ic:"📚",label:stLabel,detail:stDetail,pct:stTaskPct,color:"#3B82F6"},
    {ic:"🗣️",label:"English practice",detail:"Speaking · pronunciation · fluency",pct:0,color:"#A855F7"},
  ];
  return <>
    <Head t={viewing? `Dashboard — ${pretty}` : `${greet}, ${sett.name}`} p={viewing? `Viewing a past day · Day ${dayNo} of your ${sett.planDays}-day plan` : `${pretty} · Your health, training, nutrition and learning command center`} />
    <div className="dashboard-kpis">
      <div className="card score-card"><div><div className="dash-label">TODAY SCORE</div><div className="dash-number blue">{score}</div><div className="muted">{score>=80?"Great progress":score>=60?"Building momentum":"Start with one task"}</div></div><div className="score-ring" style={{"--score":`${score*3.6}deg`} as any}><span>{score}</span></div></div>
      <div className="card metric-card"><div className="dash-label">WEIGHT</div><div className="dash-number">{cur}<small> kg</small></div><div className="metric-good">Target {sett.weightGoal} kg</div><div className="mini-line">{w.slice(-12).map((x:any,i:number)=><i key={i} style={{height:Math.max(8,34-(x.kg-cur)*6)}}/> )}</div></div>
      <div className="card metric-card"><div className="dash-label">STEPS</div><div className="dash-number green">{steps.toLocaleString()}</div><div className="muted">of {sett.stepGoal.toLocaleString()} steps</div><Bar v={steps} goal={sett.stepGoal} color="#22c55e"/></div>
      <div className="card metric-card"><div className="dash-label">RECOVERY</div><div className="dash-number violet">{recovery||"—"}{recovery?"%":""}</div><div className="muted">Sleep {H.sleepH||0}h {H.sleepM||0}m · RHR {H.restingHR||"—"}</div><Bar v={recovery} goal={100} color="#8b5cf6"/></div>
    </div>
    <div className="dashboard-main-grid">
      <div className="card today-plan"><div className="section-title"><div><strong>Today&apos;s Plan</strong><span>Day {dayNo} of {sett.planDays}</span></div><span className="status-pill">{PPL[new Date().getDay()]} day</span></div>
        <div className="task-stack">{todayTasks.map((x,i)=><div className="plan-task" key={i}><span className="task-icon" style={{background:x.color+"1f",color:x.color}}>{x.ic}</span><div className="task-copy"><b>{x.label}</b><small>{x.detail}</small></div><div className="task-progress"><span style={{width:x.pct+"%",background:x.color}}/></div><span className={x.pct>=100?"task-state done":"task-state"}>{x.pct>=100?"✓":"○"}</span></div>)}</div>
      </div>
      <div className="dashboard-side-stack">
        <div className="card compact-card"><div className="section-title"><strong>Calories &amp; Macros</strong><span>{sett.calorieGoal} kcal goal</span></div><div className="macro-overview"><div className="macro-ring" style={{"--macro":`${caloriePct*3.6}deg`} as any}><b>{nt.cal}</b><small>kcal</small></div><div className="macro-bars"><div><span>Protein</span><b>{nt.protein}/{sett.proteinGoal}g</b></div><Bar v={nt.protein} goal={sett.proteinGoal} color="#22c55e"/><div><span>Carbs</span><b>{nt.carbs}/{sett.carbGoal}g</b></div><Bar v={nt.carbs} goal={sett.carbGoal} color="#3b82f6"/><div><span>Fat</span><b>{nt.fat}/{sett.fatGoal}g</b></div><Bar v={nt.fat} goal={sett.fatGoal} color="#f59e0b"/></div></div></div>
        <div className="card compact-card"><div className="section-title"><strong>Today&apos;s Workout</strong><span>{ex?.type||PPL[new Date().getDay()]}</span></div><div className="workout-preview"><span className="workout-orb">🏋️</span><div><b>{ex?.type||PPL[new Date().getDay()]} Day</b><small>{(ex?.selected||[]).length||6} exercises · ~55 min</small></div></div><div className="workout-list">{((ex?.selected||[]).slice(0,3)).map((x:any,i:number)=><span key={i}>{i+1}. {x.name} <b>{x.sets}×{x.reps}</b></span>)}{!ex&&<><span>1. Main compound lift <b>4×8</b></span><span>2. Secondary movement <b>3×10</b></span><span>3. Accessory work <b>3×12</b></span></>}</div></div>
        <div className="card compact-card"><div className="section-title"><strong>Course Progress</strong><span>{cprog.tasksDone}/{cprog.tasksTotal} tasks</span></div>
          {cList.length? <div style={{display:"flex",flexDirection:"column",gap:10,marginTop:4}}>{cList.map(([nm,c]:any,i:number)=>{ const pct=c.total?Math.round(c.done/c.total*100):0; return <div key={i}><div className="between" style={{fontSize:12,marginBottom:4}}><b style={{color:"#E7ECF3"}}>{nm}</b><span className="muted">{c.done}/{c.total} days{pct>=100?" ✓":""}</span></div><Bar v={c.done} goal={c.total} color={pct>=100?"#22c55e":"#8B5CF6"}/></div>; })}</div> : <div className="muted" style={{fontSize:12,marginTop:8}}>Tick your study tasks in Goals — course completion shows here.</div>}
        </div>
      </div>
    </div>
    <div className="grid g3 dashboard-charts" style={{marginTop:14}}>
      <LineCard title="7-Day Weight Trend" color="#3B82F6" data={w.slice(-12).map((x:any)=>({name:x.date.slice(5),value:x.kg}))}/>
      <BarCard title="Study — last 7 days" color="#8B5CF6" data={last7().map(x=>({name:x.name,value:Math.round(studyTotal(x.ds)/60*10)/10}))}/>
      <BarCard title="Calories — last 7 days" color="#F59E0B" data={last7().map(x=>({name:x.name,value:nutTotals(x.ds).cal}))}/>
    </div>
  </>;
}
