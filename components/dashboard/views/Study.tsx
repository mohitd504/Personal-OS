"use client";
import { useEffect, useState } from "react";
import { LS, courseStart, seedAllCourses, SS, seedCurr } from "@/components/dashboard/data";
import { StudyDashboard } from "@/components/dashboard/lazy";
import { GoalPlanner, CoursePlanner } from "@/components/dashboard/views/Goals";

export function Study({ sett, refresh, tick }: any) {
  useEffect(()=>{ if(LS("pos_seed_all","")==="v1") return; courseStart(); seedAllCourses(undefined,false); SS("pos_seed_all","v1"); refresh(); },[refresh]);
  return <StudyDashboard settings={sett} tick={tick} onRefresh={refresh} planner={<GoalPlanner sett={sett} mode="study"/>} coursePlanner={<CoursePlanner/>} curriculum={<Curriculum/>}/>;
}
export function Curriculum(){
  const [subj,setSubj]=useState("ai"); const [,force]=useState(0);
  const cur=LS("pos_curriculum",seedCurr());
  const upd=(i:number,f:string,v:string)=>{cur[subj][i][f]=v;SS("pos_curriculum",cur);force(x=>x+1);};
  return <div className="card" style={{marginTop:16}}><div className="between"><strong>Structured Curriculum</strong>
    <select className="in" value={subj} onChange={e=>setSubj(e.target.value)}><option value="ai">AI</option><option value="devops">DevOps</option><option value="system">System Design</option></select></div>
    <table style={{width:"100%",borderCollapse:"collapse",marginTop:12}}><tbody>
      {cur[subj].map((it:any,i:number)=><tr key={i} style={{borderTop:"1px solid rgba(255,255,255,.06)"}}>
        <td style={{padding:"8px 6px"}}>{it.topic}</td>
        <td style={{padding:"8px 6px",width:150}}><input className="in" type="date" defaultValue={it.date} onBlur={e=>upd(i,"date",e.target.value)} style={{width:"100%"}}/></td>
        <td style={{padding:"8px 6px",width:130}}><select className="in" defaultValue={it.status} onChange={e=>upd(i,"status",e.target.value)} style={{width:"100%"}}><option value="todo">To do</option><option value="doing">In progress</option><option value="done">Done</option></select></td>
      </tr>)}
    </tbody></table></div>;
}
