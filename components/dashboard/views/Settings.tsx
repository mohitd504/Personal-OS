"use client";
import { Head } from "@/components/dashboard/ui";
import { ReminderCenter, DataControls } from "@/components/dashboard/lazy";

/* ---------- SETTINGS ---------- */
export function Settings({ sett, save }: any) {
  const F=(lbl:string,k:string,type="number")=><div style={{marginTop:12}}><div className="lbl muted" style={{marginBottom:6}}>{lbl}</div><input className="in" type={type} defaultValue={(sett as any)[k]} onBlur={e=>save({...sett,[k]:type==="number"?(+e.target.value||0):e.target.value})} style={{width:"100%"}}/></div>;
  return <>
    <Head t="Settings" p="Personalise your OS" />
    <div className="grid g2">
      <div className="card"><strong>Profile & Plan</strong>{F("Name","name","text")}{F("Age","age")}{F("Height (ft)","heightFt")}{F("Height (in)","heightIn")}{F("Plan start","planStart","date")}{F("Plan length (days)","planDays")}{F("Weight goal (kg)","weightGoal")}</div>
      <div className="card"><strong>Daily Targets</strong>{F("Calorie goal","calorieGoal")}{F("Protein goal (g)","proteinGoal")}{F("Carb goal (g)","carbGoal")}{F("Fat goal (g)","fatGoal")}{F("Fiber goal (g)","fiberGoal")}{F("Water goal (L)","waterGoal")}{F("Step goal","stepGoal")}
        <div style={{marginTop:16}} className="muted"><div className="li"><span className="dot" style={{background:"var(--emerald)"}}/><div>Gmail & Calendar — live via your Google sign-in</div></div></div>
      </div>
    </div>
    <ReminderCenter />
    <DataControls />
  </>;
}
