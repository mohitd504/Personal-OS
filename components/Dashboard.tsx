"use client";
import { Component, useState, useEffect, useCallback } from "react";
import SyncManager from "@/components/SyncManager";
import Assistant from "@/components/Assistant";
import TodayView from "@/components/features/TodayView";
import { DEF_SETT, today, LS, SS, type Sett } from "@/components/dashboard/data";
import { Home } from "@/components/dashboard/views/Home";
import { WeeklyReview, ExerciseWorkspace, Fitness, NutritionWorkspace, EnglishWorkspace, GmailWorkspace } from "@/components/dashboard/lazy";
import { Health } from "@/components/dashboard/views/Health";
import { Nutrition } from "@/components/dashboard/views/Nutrition";
import { Study } from "@/components/dashboard/views/Study";
import { Calendar } from "@/components/dashboard/views/Calendar";
import { Goals } from "@/components/dashboard/views/Goals";
import { Settings } from "@/components/dashboard/views/Settings";

class Boundary extends Component<{ children: any }, { err: any }> {
  constructor(p: any) { super(p); this.state = { err: null }; }
  static getDerivedStateFromError(err: any) { return { err }; }
  render() {
    if (this.state.err) return (
      <div className="card" style={{ margin: 4 }}>
        <strong>⚠️ This screen hit an error</strong>
        <pre style={{ whiteSpace: "pre-wrap", fontSize: 12, color: "#f9a8d4", marginTop: 8 }}>{String(this.state.err?.message || this.state.err)}</pre>
        <button className="btn ghost sm" onClick={() => this.setState({ err: null })}>Dismiss</button>
      </div>
    );
    return this.props.children;
  }
}

const NAV = [
  { k:"today", ic:"☀️", t:"Today" }, { k:"home", ic:"🏠", t:"Dashboard" }, { k:"weekly", ic:"📈", t:"Weekly Review" }, { k:"health", ic:"❤️", t:"Health" }, { k:"exercise", ic:"🏋️", t:"Exercise" },
  { k:"nutrition", ic:"🍎", t:"Nutrition" }, { k:"study", ic:"📚", t:"Study" }, { k:"english", ic:"🗣️", t:"English" }, { k:"gmail", ic:"📧", t:"Gmail" },
  { k:"calendar", ic:"📅", t:"Calendar" }, { k:"goals", ic:"🎯", t:"Goals" }, { k:"settings", ic:"⚙️", t:"Settings" },
];

// Own component so the per-second tick re-renders only this span, not the whole Dashboard tree.
function Clock() {
  const [clock, setClock] = useState("");
  useEffect(() => {
    const f = () => { const d = new Date(); let h = d.getHours(); const ap = h>=12?"PM":"AM"; h = h%12||12;
      setClock(`${h}:${String(d.getMinutes()).padStart(2,"0")}:${String(d.getSeconds()).padStart(2,"0")} ${ap}`); };
    f(); const i = setInterval(f, 1000); return () => clearInterval(i);
  }, []);
  return <span className="in" style={{ padding:"6px 12px" }}>{clock}</span>;
}

export default function Dashboard({ onSignOut, name }: { onSignOut: ()=>void; name: string }) {
  const [view, setView] = useState<string>("today");
  const [sett, setSett] = useState<Sett>(DEF_SETT);
  const [tick, setTick] = useState(0);
  const [selDate, setSelDate] = useState(today());
  const refresh = useCallback(() => setTick(t => t + 1), []);
  const shiftDate = (n:number) => { const d=new Date(selDate); d.setDate(d.getDate()+n); const nd=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; if(nd<=today()) setSelDate(nd); };

  useEffect(() => { setSett({ ...DEF_SETT, ...LS("pos_settings", {}), name }); }, [name]);
  const saveSett = (s: Sett) => { setSett(s); SS("pos_settings", s); };

  return (
    <div className="app">
      <SyncManager onSync={refresh} />
      <Assistant onApplied={refresh} />
      <nav className="sidebar">
        <div className="brand"><span className="mark" /><span className="bt">Personal OS<small>Command Center</small></span></div>
        {NAV.map(n => (
          <div key={n.k} className={"nav" + (view===n.k?" active":"")} onClick={()=>setView(n.k)}>
            <span className="ic">{n.ic}</span><span className="tx">{n.t}</span>
          </div>
        ))}
        <div style={{ marginTop:"auto" }}>
          <div className="nav" onClick={onSignOut}><span className="ic">↩</span><span className="tx">Sign out</span></div>
        </div>
      </nav>
      <div className={`main view-${view}`}>
        <div className="topbar">
          <div className="topbar-title"><span>PERSONAL OS</span><strong>{view === "home" ? "Dashboard" : NAV.find(n=>n.k===view)?.t || view}</strong></div>
          <div className="row" style={{gap:6,flexWrap:"wrap"}}>
            {["home","nutrition"].includes(view) && <>
              <button className="btn ghost sm" onClick={()=>shiftDate(-1)}>‹</button>
              <input className="in" type="date" value={selDate} max={today()} onChange={e=>setSelDate(e.target.value)} style={{width:150}}/>
              <button className="btn ghost sm" onClick={()=>shiftDate(1)} disabled={selDate>=today()}>›</button>
              <button className="btn ghost sm" onClick={()=>setSelDate(today())}>Today</button>
            </>}
            <Clock />
            <span className="build-mark" title="build marker — bump this to verify a deploy went live">build&nbsp;113</span>
          </div>
        </div>
        <div className="content"><Boundary key={view}><div className={`dashboard-screen screen-${view}`}>
          {view==="today" && <TodayView settings={sett} tick={tick} onNavigate={setView} />}
          {view==="home" && <Home sett={sett} tick={tick} date={selDate} />}
          {view==="weekly" && <WeeklyReview settings={sett} tick={tick} />}
          {view==="health" && <Health sett={sett} refresh={refresh} tick={tick} />}
          {view==="exercise" && <ExerciseWorkspace tracker={<Fitness />} />}
          {view==="nutrition" && <NutritionWorkspace settings={sett} tracker={<Nutrition sett={sett} refresh={refresh} tick={tick} date={selDate} />} />}
          {view==="study" && <Study sett={sett} refresh={refresh} tick={tick} date={selDate} />}
          {view==="english" && <EnglishWorkspace />}
          {view==="gmail" && <GmailWorkspace />}
          {view==="calendar" && <Calendar sett={sett} tick={tick} />}
          {view==="goals" && <Goals sett={sett} tick={tick} />}
          {view==="settings" && <Settings sett={sett} save={saveSett} />}
        </div></Boundary></div>
      </div>
    </div>
  );
}
