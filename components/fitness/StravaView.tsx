"use client";
import { useState, useEffect } from "react";
import { importStrava, LS, dstr, SS } from "@/components/fitness/data";
import { BarC, LineC } from "@/components/fitness/ui";

/* ---------- Strava tab (Watch vs App sub-tabs + charts) ---------- */
export function StravaView({ refresh, appOnly }: { refresh: () => void; appOnly?: boolean }) {
  const [src, setSrc] = useState<"watch"|"app">(appOnly ? "app" : "watch");
  const [msg, setMsg] = useState(""); const [busy, setBusy] = useState(false);
  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get("strava");
    if (p === "connected") setMsg("✓ Connected — click Sync now.");
    else if (p === "noconfig") setMsg("Strava keys not set in Vercel (STRAVA_CLIENT_ID / STRAVA_CLIENT_SECRET).");
    else if (p === "error") setMsg("Authorization failed — check the callback domain in your Strava app.");
    else if (p === "signin") setMsg("Please sign in first.");
  }, []);
  const sync = async () => { setBusy(true); setMsg("");
    try { const r = await fetch("/api/strava/sync"); const d = await r.json();
      if (!d.connected) setMsg("Not connected — click Connect.");
      else { const n = importStrava(d.activities || []); refresh(); setMsg(n ? `Imported ${n} new ✓` : "Up to date."); }
    } catch (e) { setMsg("Sync failed."); } setBusy(false); };
  const all = LS("pos_strava", []);
  const acts = all.filter((a: any) => src === "watch" ? a.source === "watch" : a.source !== "watch");
  const totKm = Math.round(acts.reduce((s: number, a: any) => s + (+a.distance||0), 0) * 10) / 10;
  const totMin = acts.reduce((s: number, a: any) => s + (+a.duration||0), 0);
  const hrList = acts.filter((a: any) => a.avgHR);
  const avgHR = hrList.length ? Math.round(hrList.reduce((s: number, a: any) => s + (+a.avgHR||0), 0) / hrList.length) : 0;
  const daily = (() => { const o: any[] = []; for (let i=13;i>=0;i--){ const d=new Date(); d.setDate(d.getDate()-i); const ds=dstr(d); const v=acts.filter((a: any)=>a.date===ds).reduce((s: number,a: any)=>s+(+a.distance||0),0); o.push({name:String(d.getDate()),value:Math.round(v*10)/10}); } return o; })();
  const weekly = (() => { const o: any[] = []; for (let w=7;w>=0;w--){ let s=0; for(let dd=0;dd<7;dd++){ const dt=new Date(); dt.setDate(dt.getDate()-(w*7+dd)); const ds=dstr(dt); s+=acts.filter((a: any)=>a.date===ds).reduce((x: number,a: any)=>x+(+a.distance||0),0);} o.push({name:w===0?"This":w+"w",value:Math.round(s*10)/10}); } return o; })();
  const hrTrend = acts.filter((a: any)=>a.avgHR).slice(0,12).reverse().map((a: any)=>({name:(a.date||"").slice(5),value:+a.avgHR}));
  const speed = acts.filter((a: any)=>a.distance&&a.duration).slice(0,12).reverse().map((a: any)=>({name:(a.date||"").slice(5),value:Math.round((a.distance/(a.duration/60))*10)/10}));
  const del = (id: any) => { SS("pos_strava", LS("pos_strava", []).filter((x: any)=>x.id!==id)); refresh(); };
  return <>
    <div className="head"><h1>🔗 Strava</h1><p>{appOnly?"Strava-app recordings only — your Fitbit watch data lives in the Google Health tab.":"Synced activities."}</p></div>
    <div className="card" style={{ marginBottom: 16 }}>
      <div className="between" style={{ flexWrap: "wrap", gap: 10 }}>
        <div className="row" style={{ gap: 8 }}>
          {!appOnly && <button className={"btn " + (src==="watch"?"":"ghost") + " sm"} onClick={()=>setSrc("watch")}>⌚ Fitbit / Watch</button>}
          {!appOnly && <button className={"btn " + (src==="app"?"":"ghost") + " sm"} onClick={()=>setSrc("app")}>📱 Strava App</button>}
          {appOnly && <span className="row" style={{gap:8}}><span>📱</span><strong>Strava App</strong></span>}
        </div>
        <div className="row" style={{ gap: 8 }}>
          <a className="btn ghost sm" href="/api/strava/connect">Connect</a>
          <button className="btn ghost sm" onClick={()=>{ SS("pos_strava", []); refresh(); setMsg("Cleared. Click Sync now."); }}>Clear</button>
          <button className="btn sm" onClick={sync} disabled={busy}>{busy?"Syncing…":"Sync now"}</button>
        </div>
      </div>
      {msg && <div className="muted" style={{ fontSize: 12, marginTop: 8 }}>{msg}</div>}
    </div>
    <div className="grid g4">
      <div className="card kpi"><div className="lbl">Distance</div><div className="val">{totKm}<small> km</small></div></div>
      <div className="card kpi"><div className="lbl">Time</div><div className="val">{Math.floor(totMin/60)}<small>h </small>{totMin%60}<small>m</small></div></div>
      <div className="card kpi"><div className="lbl">Avg Heart Rate</div><div className="val">{avgHR||"—"}<small> bpm</small></div></div>
      <div className="card kpi"><div className="lbl">Activities</div><div className="val">{acts.length}</div></div>
    </div>
    <div className="grid g2" style={{ marginTop: 16 }}>
      <BarC title="Daily distance (km, 14d)" color="#F59E0B" data={daily}/>
      <BarC title="Weekly distance (km, 8w)" color="#10B981" data={weekly}/>
      <LineC title="Avg heart rate (recent)" color="#EC4899" data={hrTrend}/>
      <BarC title="Avg speed (km/h, recent)" color="#3B82F6" data={speed}/>
    </div>
    <div className="card" style={{ marginTop: 16 }}><strong>{src==="watch"?"⌚ Watch":"📱 App"} activities</strong>
      <div style={{ overflowX:"auto", marginTop:8 }}><table style={{ width:"100%", borderCollapse:"collapse", minWidth:700 }}>
        <thead><tr>{["Date","Activity","Distance","Duration","Pace","Speed","Avg HR","Device",""].map(h=><th key={h} style={{ textAlign:"left", fontSize:10, textTransform:"uppercase", color:"#5b6577", padding:"6px", borderBottom:"1px solid rgba(255,255,255,.09)" }}>{h}</th>)}</tr></thead>
        <tbody>{acts.length ? acts.slice(0,40).map((a: any)=>{ const pace=(a.distance&&a.duration)?(a.duration/a.distance).toFixed(1)+" min/km":"—"; const spd=(a.distance&&a.duration)?Math.round((a.distance/(a.duration/60))*10)/10+" km/h":"—"; return <tr key={a.id} style={{ borderBottom:"1px solid rgba(255,255,255,.05)" }}>
          <td style={{padding:"6px",fontSize:12}}>{a.date}</td><td style={{padding:"6px",fontSize:12}}>{a.type}{a.name?" · "+a.name:""}</td><td style={{padding:"6px",fontSize:12}}>{a.distance||0} km</td><td style={{padding:"6px",fontSize:12}}>{a.duration||0} min</td><td style={{padding:"6px",fontSize:12}}>{pace}</td><td style={{padding:"6px",fontSize:12}}>{spd}</td><td style={{padding:"6px",fontSize:12}}>{a.avgHR||"—"}</td><td style={{padding:"6px",fontSize:11,color:"#8A94A6"}}>{a.device||"—"}</td><td style={{padding:"6px"}}><span className="btn ghost sm" style={{cursor:"pointer"}} onClick={()=>del(a.id)}>✕</span></td>
        </tr>; }) : <tr><td colSpan={9} className="muted" style={{padding:"10px 6px"}}>No {src==="watch"?"watch":"app"} activities yet — click Sync now.</td></tr>}</tbody>
      </table></div>
    </div>
  </>;
}
