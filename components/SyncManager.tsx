"use client";
import { useEffect, useState } from "react";
import { collectPersonalOsData, migratePersonalOsData } from "@/lib/client-storage";
import { APP_DATA_VERSION } from "@/lib/domain";

type SyncState = "idle" | "syncing" | "synced" | "offline" | "error";

export default function SyncManager({ onSync }: { onSync: () => void }) {
  const [state,setState]=useState<SyncState>("idle");
  const [lastSynced,setLastSynced]=useState("");
  useEffect(() => {
    let disposed=false, interval:ReturnType<typeof setInterval>|null=null, pushTimer:ReturnType<typeof setTimeout>|null=null;
    let lastLocalWrite=0, lastApplied="", retries=0;
    const original=localStorage.setItem.bind(localStorage);
    const mark=(next:SyncState)=>{if(!disposed)setState(next);};
    const snapshot=()=>migratePersonalOsData(collectPersonalOsData(),Number(JSON.parse(localStorage.getItem("pos_data_version")||"1")));
    const push=async()=>{
      if(!navigator.onLine){mark("offline");return;} mark("syncing");
      try{const r=await fetch("/api/sync",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({version:APP_DATA_VERSION,data:snapshot()})});if(!r.ok)throw new Error("sync failed");retries=0;const at=new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});setLastSynced(at);mark("synced");}
      catch{mark("error");if(retries<4){retries+=1;pushTimer=setTimeout(push,Math.min(30_000,1000*2**retries));}}
    };
    const schedule=()=>{if(pushTimer)clearTimeout(pushTimer);pushTimer=setTimeout(push,1500);};
    localStorage.setItem=(key,value)=>{original(key,value);if(key.startsWith("pos_")){lastLocalWrite=Date.now();schedule();}};
    const pull=async(force=false)=>{if(!navigator.onLine){mark("offline");return;}try{mark("syncing");const r=await fetch("/api/sync");if(!r.ok)throw new Error("sync failed");const body=await r.json();if(!body?.data||typeof body.data!=="object"){mark("idle");return;}const data=migratePersonalOsData(body.data,Number(body.version||1));const serialized=JSON.stringify(data);if(serialized===lastApplied){mark("synced");return;}if(!force&&Date.now()-lastLocalWrite<4000)return;Object.entries(data).forEach(([key,value])=>{if(key.startsWith("pos_")&&typeof value==="string")original(key,value);});lastApplied=serialized;setLastSynced(new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}));mark("synced");onSync();}catch{mark("error");}};
    pull(true);interval=setInterval(()=>pull(),30_000);
    const visible=()=>{if(document.visibilityState==="visible")pull();};const online=()=>{mark("idle");push();};const offline=()=>mark("offline");
    document.addEventListener("visibilitychange",visible);window.addEventListener("focus",visible);window.addEventListener("online",online);window.addEventListener("offline",offline);
    return()=>{disposed=true;localStorage.setItem=original;if(interval)clearInterval(interval);if(pushTimer)clearTimeout(pushTimer);document.removeEventListener("visibilitychange",visible);window.removeEventListener("focus",visible);window.removeEventListener("online",online);window.removeEventListener("offline",offline);};
  },[onSync]);
  const label=state==="syncing"?"Syncing…":state==="synced"?`Synced${lastSynced?` ${lastSynced}`:""}`:state==="offline"?"Offline":state==="error"?"Sync retrying":"Sync ready";
  return <div title="Cross-device data synchronization" style={{position:"fixed",right:16,bottom:16,zIndex:80,padding:"7px 10px",borderRadius:999,background:"#0f172a",border:"1px solid rgba(255,255,255,.14)",fontSize:11,color:state==="error"?"#fca5a5":state==="offline"?"#fcd34d":"#94a3b8"}}>● {label}</div>;
}
