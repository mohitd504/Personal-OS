"use client";
import { useState } from "react";
import { GoogleHealthBoard } from "@/components/fitness/GoogleHealth";
import { PlanWorkout } from "@/components/fitness/PlanWorkout";
import { StravaView } from "@/components/fitness/StravaView";
import { SleepBoard } from "@/components/fitness/SleepBoard";

/* ---------- root ---------- */
export default function Fitness() {
  const [tab, setTab] = useState("ghealth");
  const [, setT] = useState(0); const refresh = () => setT(x=>x+1);
  const TABS: [string,string,string][] = [
    ["ghealth","Google Health","⌚"],["workout","Workout","🏋️"],["strava","Strava","🔗"],["sleep","Sleep","😴"],
  ];
  return <>
    <div className="row" style={{flexWrap:"wrap",gap:8,marginBottom:18}}>
      {TABS.map(t=><button key={t[0]} onClick={()=>setTab(t[0])} className={"btn "+(tab===t[0]?"":"ghost")+" sm"} style={{fontWeight:600}}>{t[2]} {t[1]}</button>)}
    </div>
    {tab==="ghealth" && <GoogleHealthBoard refresh={refresh}/>}
    {tab==="workout" && <PlanWorkout refresh={refresh}/>}
    {tab==="strava" && <StravaView refresh={refresh} appOnly/>}
    {tab==="sleep" && <SleepBoard refresh={refresh}/>}
  </>;
}
