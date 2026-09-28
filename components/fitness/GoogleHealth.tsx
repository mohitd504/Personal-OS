"use client";
import { useState, useEffect } from "react";
import { today, LS, SS, dstr, addDays, curWeight, uid, DOW, r0, r1, ghToday, ghByDay, exportCSV } from "@/components/fitness/data";
import { Stat, Sec, BarC, LineC } from "@/components/fitness/ui";

/* ---------- Fitbit via Google Health API (steps) ---------- */
export function GoogleHealthCard({ refresh }: { refresh: () => void }) {
  const [msg, setMsg] = useState(""); const [busy, setBusy] = useState(false); const [syncDate, setSyncDate] = useState(today());
  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get("ghealth");
    if (p === "connected") setMsg("✓ Google Health connected — click 'Sync steps'.");
    else if (p === "noconfig") setMsg("Google Health keys not set in Vercel (GHEALTH_CLIENT_ID / GHEALTH_CLIENT_SECRET).");
    else if (p === "error") setMsg("Google Health authorization failed — check the callback URL in that project's OAuth client.");
    else if (p === "signin") setMsg("Please sign in first.");
  }, []);
  const doSync = async (debug:boolean, date?:string) => { setBusy(true); setMsg(""); const day = date || today();
    try {
      const r = await fetch("/api/ghealth/steps?date=" + day + (debug?"&debug=1":"")); const d = await r.json();
      if (d.ok) {
        if (day === today()) { const h = LS("pos_health", {});
          h.steps = d.steps; h.distance = d.distance; h.caloriesBurned = d.calories; h.azm = d.activeMin; h.floors = d.floors;
          if (d.restingHR) h.restingHR = d.restingHR; if (d.avgHR) h.hrAvg = d.avgHR; if (d.maxHR) h.hrMax = d.maxHR; if (d.minHR) h.hrMin = d.minHR; if (d.sleepH) h.sleepH = d.sleepH;
          SS("pos_health", h); }
        const hist = LS("pos_ghealth", []); const i = hist.findIndex((x:any)=>x.date===d.date);
        const rec = { date: d.date, steps:d.steps, distance:d.distance, cal:d.calories, activeMin:d.activeMin, floors:d.floors, restingHR:d.restingHR, avgHR:d.avgHR, maxHR:d.maxHR, minHR:d.minHR, sleepH:d.sleepH };
        if (i>=0) hist[i]=rec; else hist.push(rec); hist.sort((a:any,b:any)=>a.date<b.date?1:-1); SS("pos_ghealth", hist);
        if (d.sleepH) { const sl=LS("pos_sleep",[]); const si=sl.findIndex((x:any)=>x.date===d.date); const sr={date:d.date,total:d.sleepH,source:"watch"}; if(si>=0) sl[si]={...sl[si],...sr}; else sl.push(sr); sl.sort((a:any,b:any)=>a.date<b.date?1:-1); SS("pos_sleep",sl); }
        // pull recorded activities (walks/runs/workouts) and merge, keeping AI/manual entries
        let actMsg = ""; let actDbg: any = null;
        try {
          const ar = await fetch("/api/ghealth/activities?days=180" + (debug?"&debug=1":"")); const ad = await ar.json();
          if (ad.ok && Array.isArray(ad.activities)) {
            const existing = LS("pos_gh_acts", []);
            const byId: any = {}; existing.forEach((x:any)=>byId[x.id]=x);
            ad.activities.forEach((a:any)=>{ byId[a.id] = { ...byId[a.id], ...a }; });
            let merged: any[] = Object.values(byId);
            // purge stale rows from older buggy syncs (type stored as a resource path)
            merged = merged.filter((x:any)=> !(typeof x.type==="string" && x.type.includes("/")));
            // dedupe watch activities that describe the same session
            const fp: any = {}; merged = merged.filter((x:any)=>{ if(x.source!=="watch") return true; const k=`${x.date}_${x.distance}_${x.duration}`; if(fp[k]) return false; fp[k]=1; return true; });
            merged.sort((a:any,b:any)=>a.date<b.date?1:-1);
            SS("pos_gh_acts", merged);
            actMsg = ` · ${ad.activities.length} watch activit${ad.activities.length===1?"y":"ies"}`;
            actDbg = ad.debug;
          } else if (ad.error) actMsg = ` · activities: ${ad.error}`;
        } catch (e) {}
        // pull last-15-days steps history into the daily store
        let rangeDbg: any = null;
        try {
          const rr = await fetch("/api/ghealth/range?days=90" + (debug?"&debug=1":"")); const rd = await rr.json();
          if (rd.ok && Array.isArray(rd.rows)) {
            const hist = LS("pos_ghealth", []); const idx: any = {}; hist.forEach((x:any,i:number)=>idx[x.date]=i);
            rd.rows.forEach((row:any)=>{ if(idx[row.date]!=null) hist[idx[row.date]] = { ...hist[idx[row.date]], ...row }; else hist.push(row); });
            hist.sort((a:any,b:any)=>a.date<b.date?1:-1); SS("pos_ghealth", hist);
            rangeDbg = rd.debug || { rows: rd.rows.length };
          } else if (rd.error) rangeDbg = { error: rd.error };
        } catch (e) {}
        // retention: keep a rolling 180-day health database
        try {
          const cut = new Date(); cut.setDate(cut.getDate()-180); const cutoff = dstr(cut);
          ["pos_ghealth","pos_gh_acts","pos_sleep"].forEach((k)=>{ const arr=LS(k,[]); if(Array.isArray(arr)) SS(k, arr.filter((x:any)=>(x.date||"")>=cutoff)); });
        } catch (e) {}
        refresh();
        if (debug) setMsg((m)=>m+"\n\nRANGE(15d): "+JSON.stringify(rangeDbg));
        setMsg(`Synced ✓ ${d.steps} steps · ${d.distance||0}km · ${d.calories||0}kcal · ${d.activeMin||0} AZ min${d.avgHR?` · HR ${d.minHR}/${d.avgHR}/${d.maxHR}`:""}${d.restingHR?` · RHR ${d.restingHR}`:""}${d.sleepH?` · ${d.sleepH}h sleep`:""}${actMsg}` + (debug?"\n\nDAILY: "+JSON.stringify(d.debug)+"\n\nACTIVITIES: "+JSON.stringify(actDbg):""));
      }
      else if (d.connected === false) setMsg("Not connected — click 'Connect Google Health' first.");
      else setMsg("Google Health error" + (d.code ? ` [${d.code}]` : "") + ": " + (d.error || JSON.stringify(d)));
    } catch (e) { setMsg("Sync failed."); } setBusy(false); };
  const sync = () => doSync(false);
  return <div className="card" style={{ marginBottom: 16 }}>
    <div className="between" style={{ flexWrap: "wrap", gap: 10 }}>
      <div className="row" style={{ gap: 8 }}><span>⌚</span><strong>Fitbit · Google Health</strong><span className="muted" style={{ fontSize: 11 }}>steps · distance · calories · active min · heart rate · sleep — from your watch</span></div>
      <div className="row" style={{ gap: 8 }}>
        <a className="btn ghost sm" href="/api/ghealth/connect">Connect Google Health</a>
        <button className="btn sm" onClick={sync} disabled={busy}>{busy ? "Syncing…" : "Sync from watch"}</button>
      </div>
    </div>
    <div className="row" style={{ gap: 8, marginTop: 10, flexWrap: "wrap", alignItems: "center" }}>
      <span className="muted" style={{ fontSize: 12 }}>Sync a past day:</span>
      <input className="in" type="date" value={syncDate} max={today()} min={addDays(today(),-15)} onChange={e=>setSyncDate(e.target.value)} style={{ width: 150 }}/>
      <button className="btn ghost sm" onClick={()=>doSync(false,syncDate)} disabled={busy}>⤓ Sync {syncDate===today()?"today":syncDate}</button>
      <button className="btn ghost sm" onClick={()=>doSync(false,addDays(today(),-1))} disabled={busy}>Sync yesterday</button>
    </div>
    <div className="muted" style={{ fontSize: 12, marginTop: 8, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{msg || "Connect once, then Sync. Use 'Sync from watch' for today, or pick a past day (up to 15 days back) to backfill. Fitbit must be linked to that Google account."}</div>
    <div style={{ marginTop: 6 }}><span className="muted" style={{ fontSize: 10, cursor: "pointer", textDecoration: "underline" }} onClick={()=>doSync(true)}>Debug (show raw watch data)</span></div>
  </div>;
}

/* ================= GOOGLE HEALTH BOARD (watch) ================= */
export function GoogleHealthBoard({ refresh }: { refresh: () => void }){
  const H=LS("pos_health",{});
  const acts=LS("pos_gh_acts",[]);
  const [text,setText]=useState(""); const [busy,setBusy]=useState(false);
  const [form,setForm]=useState<any>({date:today()});
  const [fDate,setFDate]=useState("");
  const calc=async()=>{ if(!text.trim())return; setBusy(true);
    try{ const r=await fetch("/api/gh-activity",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({text,weightKg:curWeight()})}); const d=await r.json(); setForm((s:any)=>({date:today(),notes:text,...s,...d})); }catch(e){} setBusy(false); };
  const save=()=>{ const all=LS("pos_gh_acts",[]); all.unshift({id:uid(),date:form.date||today(),type:form.type||"Activity",distance:+form.distance||0,duration:+form.duration||0,avgSpeed:+form.avgSpeed||0,activeZone:+form.activeZone||0,cal:+form.cal||0,avgHR:+form.avgHR||0,maxHR:+form.maxHR||0,minHR:+form.minHR||0,laps:+form.laps||0,notes:form.notes||""}); SS("pos_gh_acts",all); setForm({date:today()}); setText(""); refresh(); };
  const del=(id:string)=>{ SS("pos_gh_acts",LS("pos_gh_acts",[]).filter((x:any)=>x.id!==id)); refresh(); };
  const set=(k:string,v:any)=>setForm((s:any)=>({...s,[k]:v}));

  // build per-day totals from watch sessions, overlaid with the daily rollup (more complete on recent days)
  const fixKm=(v:any)=>{ let k=+v||0; while(k>100) k/=1000; return Math.round(k*100)/100; };
  const dailyAgg:Record<string,any>={};
  acts.forEach((a:any)=>{ const d=a.date; if(!d) return; dailyAgg[d]=dailyAgg[d]||{steps:0,distance:0,cal:0,activeMin:0}; dailyAgg[d].steps+=+a.steps||0; dailyAgg[d].distance+=fixKm(a.distance); dailyAgg[d].cal+=+a.cal||0; dailyAgg[d].activeMin+=+a.activeZone||0; });
  LS("pos_ghealth",[]).forEach((g:any)=>{ const d=g.date; if(!d) return; dailyAgg[d]=dailyAgg[d]||{steps:0,distance:0,cal:0,activeMin:0}; dailyAgg[d].steps=Math.max(dailyAgg[d].steps,+g.steps||0); dailyAgg[d].distance=Math.max(dailyAgg[d].distance,fixKm(g.distance)); dailyAgg[d].cal=Math.max(dailyAgg[d].cal,+g.cal||0); dailyAgg[d].activeMin=Math.max(dailyAgg[d].activeMin,+g.activeMin||0); });
  const dayVal=(field:string,n:number)=>{ const out=[]; for(let i=n-1;i>=0;i--){ const d=new Date(); d.setDate(d.getDate()-i); const ds=dstr(d); const g=dailyAgg[ds]; out.push({name:n<=7?DOW[d.getDay()]:String(d.getDate()),value:g?Math.round((+g[field]||0)*10)/10:0}); } return out; };
  const tA=dailyAgg[today()]||{};
  const steps=r0(tA.steps);
  const cal=r0(tA.cal);
  const activeMin=r0(tA.activeMin);
  const dist=r1(tA.distance);
  const floors=r0(ghToday("floors")|| +H.floors||0);
  const sleepH=(()=>{ const sl=LS("pos_sleep",[]).find((x:any)=>x.date===today()); return sl?r1(+sl.total||0):0; })();
  const rhr=+H.restingHR||0;
  const hrAvgVals=acts.filter((a:any)=>+a.avgHR).map((a:any)=>+a.avgHR);
  const avgHR=(+H.hrAvg||0)|| (hrAvgVals.length?r0(hrAvgVals.reduce((a:number,b:number)=>a+b,0)/hrAvgVals.length):0);
  const maxHR=(+H.hrMax||0)|| Math.max(0,...acts.map((a:any)=>+a.maxHR||0));
  const minHRs=acts.map((a:any)=>+a.minHR||0).filter(Boolean);
  const minHR=(+H.hrMin||0)|| (minHRs.length?Math.min(...minHRs):rhr);
  const F=(k:string,ph:string,w=110)=><input className="in" placeholder={ph} value={form[k]??""} onChange={e=>set(k,e.target.value)} style={{width:w}}/>;
  const dailyDist=dayVal("distance",15);
  const actHR=acts.filter((a:any)=>+a.avgHR).slice(0,12).reverse().map((a:any)=>({name:(a.date||"").slice(5),value:+a.avgHR}));
  return <>
    <div className="head"><h1>⌚ Google Health</h1><p>Steps, heart rate &amp; activities from your Fitbit watch. Sync live data, or use AI to estimate an activity when the watch hasn&apos;t synced yet.</p></div>
    <GoogleHealthCard refresh={refresh}/>
    {(()=>{ const daysWithData=Object.keys(dailyAgg).filter((d)=>dailyAgg[d]&&(dailyAgg[d].steps||dailyAgg[d].distance||dailyAgg[d].cal)).length; const allDates=[...acts.map((a:any)=>a.date),...Object.keys(dailyAgg)].filter(Boolean).sort(); const oldest=allDates[0]||"—";
      return <div className="card" style={{marginBottom:16,background:"linear-gradient(100deg,rgba(16,185,129,.10),rgba(59,130,246,.06))"}}>
        <div className="between" style={{flexWrap:"wrap",gap:10}}>
          <div className="row" style={{gap:8}}><span>🗄️</span><strong>Health Database</strong><span className="muted" style={{fontSize:11}}>rolling 180-day history · synced across your devices</span></div>
          <div className="row" style={{gap:18,flexWrap:"wrap"}}>
            <span className="muted" style={{fontSize:12}}>Days stored <b style={{color:"#E7ECF3"}}>{daysWithData}</b>/180</span>
            <span className="muted" style={{fontSize:12}}>Activities <b style={{color:"#E7ECF3"}}>{acts.length}</b></span>
            <span className="muted" style={{fontSize:12}}>Since <b style={{color:"#E7ECF3"}}>{oldest}</b></span>
          </div>
        </div>
      </div>; })()}
    <div className="grid g4">
      <Stat label="Steps Today" value={steps.toLocaleString()} tint="emerald"/>
      <Stat label="Calories Burned" value={cal.toLocaleString()} unit="kcal" tint="orange"/>
      <Stat label="Active Zone Min" value={activeMin} unit="min" tint="blue"/>
      <Stat label="Distance" value={dist} unit="km" tint="cyan"/>
      <Stat label="Floors" value={floors||"—"} tint="orange"/>
      <Stat label="Resting HR" value={rhr||"—"} unit="bpm" tint="pink"/>
      <Stat label="Sleep" value={sleepH||"—"} unit="h" tint="indigo"/>
      <Stat label="Activities Logged" value={acts.length} tint="violet"/>
    </div>
    <Sec t="❤️ Heart Rate" s="Across your recorded activities"/>
    <div className="grid g4">
      <Stat label="Max HR" value={maxHR||"—"} unit="bpm" tint="pink"/>
      <Stat label="Average HR" value={avgHR||"—"} unit="bpm" tint="pink"/>
      <Stat label="Min HR" value={minHR||"—"} unit="bpm" tint="blue"/>
      <Stat label="Resting HR" value={rhr||"—"} unit="bpm" tint="emerald"/>
    </div>

    <Sec t="🏃 Log / estimate an activity" s="Walk, run, ride or workout — describe it and AI fills distance, speed, active zone, calories & heart rate"/>
    <div className="card">
      <div style={{padding:12,borderRadius:12,background:"rgba(139,92,246,.08)",border:"1px solid rgba(139,92,246,.25)"}}>
        <div className="row" style={{gap:8}}><span>✨</span><strong style={{fontSize:13}}>Describe it — Claude estimates the metrics</strong></div>
        <textarea className="in" value={text} onChange={e=>setText(e.target.value)} placeholder="e.g. ran 5 km in 28 min, felt hard, hilly" style={{width:"100%",minHeight:52,marginTop:8}}/>
        <div style={{marginTop:6}}><button className="btn ghost sm" onClick={calc} disabled={busy}>{busy?"🤖 Estimating…":"✨ Calculate with AI"}</button> <span className="muted" style={{fontSize:11}}>review &amp; edit below, then Save</span></div>
      </div>
      <div className="row" style={{marginTop:12,flexWrap:"wrap",gap:8}}>
        <input className="in" type="date" value={form.date||today()} onChange={e=>set("date",e.target.value)} style={{width:150}}/>
        {F("type","Type",110)}{F("distance","Distance km",110)}{F("duration","Duration min",110)}{F("avgSpeed","Avg speed km/h",120)}
        {F("activeZone","Active zone min",120)}{F("cal","Calories",100)}{F("avgHR","Avg HR",90)}{F("maxHR","Max HR",90)}{F("minHR","Min HR",90)}{F("laps","Laps",80)}
        <button className="btn" onClick={save}>Save activity</button>
      </div>
    </div>

    <div className="grid g3" style={{marginTop:16}}>
      <BarC title="Steps (15d, watch)" color="#10B981" data={dayVal("steps",15)}/>
      <BarC title="Calories Burned (7d)" color="#F59E0B" data={dayVal("cal",7)}/>
      <BarC title="Active Zone Min (7d)" color="#3B82F6" data={dayVal("activeMin",7)}/>
      <LineC title="Resting HR (14d)" color="#EC4899" data={ghByDay("restingHR",14).filter((x:any)=>x.value>0)}/>
      <LineC title="Daily Distance (15d, km)" color="#06B6D4" data={dailyDist}/>
      <LineC title="Activity Avg HR" color="#A855F7" data={actHR.length?actHR:[{name:"—",value:0}]}/>
    </div>

    <Sec t="👟 Steps — last 15 days" s="Daily totals from your watch (auto-filled on each sync)"/>
    {(()=>{ const rows:any[]=[]; for(let i=0;i<15;i++){ const d=new Date(); d.setDate(d.getDate()-i); const ds=dstr(d); const g=dailyAgg[ds]||{}; rows.push({date:ds,steps:+g.steps||0,distance:Math.round((+g.distance||0)*100)/100,cal:+g.cal||0,activeMin:+g.activeMin||0}); }
      const tot=rows.reduce((a,x)=>a+x.steps,0); const avg=r0(tot/15);
      return <div className="card">
        <div className="row" style={{gap:18,flexWrap:"wrap",marginBottom:10}}><span className="muted" style={{fontSize:12}}>15-day total <b style={{color:"#E7ECF3"}}>{tot.toLocaleString()}</b> steps</span><span className="muted" style={{fontSize:12}}>daily average <b style={{color:"#E7ECF3"}}>{avg.toLocaleString()}</b></span></div>
        <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",minWidth:460}}>
          <thead><tr>{["Date","Steps","Distance","Calories","Active min"].map(h=><th key={h} style={{textAlign:"left",fontSize:10,textTransform:"uppercase",color:"#5b6577",padding:"6px",borderBottom:"1px solid rgba(255,255,255,.09)"}}>{h}</th>)}</tr></thead>
          <tbody>{rows.map((r:any)=><tr key={r.date} style={{borderBottom:"1px solid rgba(255,255,255,.05)"}}>
            <td style={{padding:"6px",fontSize:12}}>{r.date}{r.date===today()?" (today)":""}</td><td style={{padding:"6px",fontSize:12}}>{r.steps?r.steps.toLocaleString():"—"}</td><td style={{padding:"6px",fontSize:12}}>{r.distance||"—"} km</td><td style={{padding:"6px",fontSize:12}}>{r.cal||"—"}</td><td style={{padding:"6px",fontSize:12}}>{r.activeMin||"—"}</td>
          </tr>)}</tbody>
        </table></div>
        <div className="muted" style={{fontSize:11,marginTop:8}}>&quot;—&quot; means no watch data synced for that day yet. Sync daily to build the full history.</div>
      </div>; })()}

    <div className="card" style={{marginTop:16}}><div className="between" style={{flexWrap:"wrap",gap:8}}><strong>Activity history</strong><div className="row" style={{gap:8,flexWrap:"wrap"}}>
      <input className="in" type="date" value={fDate} onChange={e=>setFDate(e.target.value)} max={today()} title="Filter by date" style={{width:150}}/>
      {fDate && <button className="btn ghost sm" onClick={()=>setFDate("")}>All dates</button>}
      <button className="btn ghost sm" onClick={()=>{ if(confirm("Remove watch-imported activities? Your AI/manual ones stay.")){ SS("pos_gh_acts", LS("pos_gh_acts",[]).filter((x:any)=>x.source!=="watch")); refresh(); } }}>Clear watch imports</button>
      <button className="btn ghost sm" onClick={()=>exportCSV("pos_gh_acts",acts)}>⬇ CSV</button></div></div>
      {(()=>{ const shown=fDate?acts.filter((a:any)=>a.date===fDate):acts; return <>
      {fDate && <div className="muted" style={{fontSize:12,marginTop:8}}>{shown.length} activit{shown.length===1?"y":"ies"} on {fDate}{shown.length?` · ${r1(shown.reduce((s:number,a:any)=>s+(+a.distance||0),0))} km · ${r0(shown.reduce((s:number,a:any)=>s+(+a.cal||0),0))} kcal`:""}</div>}
      <div style={{overflowX:"auto",marginTop:10}}><table style={{width:"100%",borderCollapse:"collapse",minWidth:760}}>
        <thead><tr>{["Date","Type","Dist","Dur","Speed","AZ min","Cal","Avg HR","Max HR","Laps",""].map(h=><th key={h} style={{textAlign:"left",fontSize:10,textTransform:"uppercase",color:"#5b6577",padding:"6px",borderBottom:"1px solid rgba(255,255,255,.09)"}}>{h}</th>)}</tr></thead>
        <tbody>{shown.length? shown.map((a:any)=><tr key={a.id} style={{borderBottom:"1px solid rgba(255,255,255,.05)"}}>
          <td style={{padding:"6px",fontSize:12}}>{a.date}</td><td style={{padding:"6px",fontSize:12}}>{a.type}</td><td style={{padding:"6px",fontSize:12}}>{a.distance||"—"}km</td><td style={{padding:"6px",fontSize:12}}>{a.duration||"—"}m</td><td style={{padding:"6px",fontSize:12}}>{a.avgSpeed||"—"}</td><td style={{padding:"6px",fontSize:12}}>{a.activeZone||"—"}</td><td style={{padding:"6px",fontSize:12}}>{a.cal||"—"}</td><td style={{padding:"6px",fontSize:12}}>{a.avgHR||"—"}</td><td style={{padding:"6px",fontSize:12}}>{a.maxHR||"—"}</td><td style={{padding:"6px",fontSize:12}}>{a.laps||"—"}</td>
          <td style={{padding:"6px"}}><span className="btn ghost sm" style={{cursor:"pointer"}} onClick={()=>del(a.id)}>✕</span></td>
        </tr>): <tr><td colSpan={11} className="muted" style={{padding:"10px 6px"}}>{fDate?`No activities on ${fDate}.`:"No activities yet — describe one above and Calculate with AI, or Sync from your watch."}</td></tr>}</tbody>
      </table></div></>; })()}
    </div>
  </>;
}
