"use client";
import { useEffect, useRef, useState } from "react";
import { collectPersonalOsData, migratePersonalOsData } from "@/lib/client-storage";
import { SYNC_META_KEY, ackPush, advanceCursor, applyRemote, buildPush, markLocalOnly, parseMeta, recordLocalWrite, type Store, type SyncChanges } from "@/lib/sync-core";

type SyncState = "idle" | "syncing" | "synced" | "offline" | "error";

// Per-key sync: pushes only keys edited since the last push and pulls only keys the server
// received since the last pull. Newest edit wins per key (see lib/sync-core.ts).
export default function SyncManager({ onSync }: { onSync: () => void }) {
  const [state,setState]=useState<SyncState>("idle");
  const [lastSynced,setLastSynced]=useState("");
  const manualSync=useRef<()=>void>(()=>{});
  useEffect(() => {
    let disposed=false, interval:ReturnType<typeof setInterval>|null=null, pushTimer:ReturnType<typeof setTimeout>|null=null, retries=0;
    // Patch the prototype: assigning localStorage.setItem directly would just store an item named "setItem".
    const originalSetItem=Storage.prototype.setItem;
    const rawSet=(key:string,value:string)=>originalSetItem.call(localStorage,key,value);
    const store:Store={get:(key)=>localStorage.getItem(key),set:rawSet};
    const meta=parseMeta(localStorage.getItem(SYNC_META_KEY));
    const saveMeta=()=>{try{rawSet(SYNC_META_KEY,JSON.stringify(meta));}catch{}};
    const mark=(next:SyncState)=>{if(!disposed)setState(next);};
    const stamp=()=>{if(!disposed)setLastSynced(new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}));};
    const pending=()=>Object.keys(meta.dirty).length>0;

    // Run push/pull one at a time so they never interleave.
    let queue:Promise<unknown>=Promise.resolve();
    const serial=(fn:()=>Promise<unknown>)=>{queue=queue.then(fn,fn);return queue;};
    const schedulePush=(ms=1500)=>{if(pushTimer)clearTimeout(pushTimer);pushTimer=setTimeout(()=>{void serial(push);},ms);};

    const push=async()=>{
      const changes=buildPush(meta,store);
      if(!Object.keys(changes).length){saveMeta();return;}
      if(!navigator.onLine){mark("offline");return;}
      mark("syncing");
      try{
        const r=await fetch("/api/sync",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({changes})});
        const body=await r.json().catch(()=>null);
        if(body?.note){mark("idle");return;} // sync not configured on the server
        if(!r.ok||!body?.ok)throw new Error("sync failed");
        const applied=ackPush(meta,changes,(body.rejected||{}) as SyncChanges,store);
        saveMeta();retries=0;stamp();mark("synced");
        if(applied)onSync();
        if(pending())schedulePush();
      }catch{
        mark("error");
        if(retries<4){retries+=1;schedulePush(Math.min(30_000,1000*2**retries));}
      }
    };

    // Bring older data shapes up to date (e.g. add pos_reminders). Writes go through the
    // patched setItem, so they are recorded and pushed like any other edit.
    const migrate=()=>{
      try{
        const current=collectPersonalOsData();
        const migrated=migratePersonalOsData(current,Number(JSON.parse(current.pos_data_version||"1")));
        Object.entries(migrated).forEach(([key,value])=>{if(current[key]!==value)localStorage.setItem(key,value);});
      }catch{}
    };

    const pull=async()=>{
      if(!navigator.onLine){mark("offline");return;}
      const full=meta.cursor<0;
      try{
        mark("syncing");
        const r=await fetch(`/api/sync?since=${meta.cursor}`);
        if(!r.ok)throw new Error("sync failed");
        const body=await r.json();
        if(body?.note){mark("idle");return;}
        const changes:SyncChanges=body?.changes&&typeof body.changes==="object"?body.changes:{};
        const applied=applyRemote(meta,changes,store);
        if(full){markLocalOnly(meta,Object.keys(collectPersonalOsData()),changes);migrate();}
        advanceCursor(meta,Number(body.now));
        saveMeta();stamp();mark("synced");
        if(applied)onSync();
        if(pending())schedulePush(0);
      }catch{mark("error");}
    };

    Storage.prototype.setItem=function(this:Storage,key:string,value:string){
      originalSetItem.call(this,key,value);
      if(this===localStorage&&key.startsWith("pos_")){recordLocalWrite(meta,key,Date.now());saveMeta();schedulePush();}
    };

    manualSync.current=()=>{retries=0;void serial(push);void serial(pull);};
    void serial(pull);
    interval=setInterval(()=>{void serial(pull);},30_000);
    const visible=()=>{if(document.visibilityState==="visible")void serial(pull);};
    const online=()=>{mark("idle");retries=0;void serial(push);void serial(pull);};
    const offline=()=>mark("offline");
    // Best-effort flush when the tab is closed or backgrounded. Keys stay dirty until a
    // normal push is acknowledged, so anything this misses goes up on the next load.
    const flush=()=>{
      if(!pending())return;
      const payload=JSON.stringify({changes:buildPush(meta,store)});
      if(payload.length<60_000)navigator.sendBeacon?.("/api/sync",new Blob([payload],{type:"application/json"}));
    };
    document.addEventListener("visibilitychange",visible);window.addEventListener("focus",visible);window.addEventListener("online",online);window.addEventListener("offline",offline);window.addEventListener("pagehide",flush);
    return()=>{disposed=true;Storage.prototype.setItem=originalSetItem;if(interval)clearInterval(interval);if(pushTimer)clearTimeout(pushTimer);document.removeEventListener("visibilitychange",visible);window.removeEventListener("focus",visible);window.removeEventListener("online",online);window.removeEventListener("offline",offline);window.removeEventListener("pagehide",flush);};
  },[onSync]);
  const label=state==="syncing"?"Syncing…":state==="synced"?`Synced${lastSynced?` ${lastSynced}`:""}`:state==="offline"?"Offline":state==="error"?"Sync retrying":"Sync ready";
  return <button onClick={()=>manualSync.current()} disabled={state==="syncing"} title="Push and pull all Personal OS data now" style={{position:"fixed",right:16,bottom:16,zIndex:80,padding:"8px 12px",borderRadius:999,background:"#0f172a",border:"1px solid rgba(255,255,255,.18)",fontSize:11,cursor:"pointer",color:state==="error"?"#fca5a5":state==="offline"?"#fcd34d":"#cbd5e1"}}>↻ {state==="idle"?"Sync now":label}</button>;
}
