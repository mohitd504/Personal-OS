"use client";
import { useRef, useState } from "react";
import { createExport, restoreExport, type PersonalOsSnapshot } from "@/lib/client-storage";

export default function DataControls(){
  const input=useRef<HTMLInputElement>(null); const [message,setMessage]=useState("");
  const download=()=>{const snapshot=createExport();const blob=new Blob([JSON.stringify(snapshot,null,2)],{type:"application/json"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=`personal-os-backup-${snapshot.exportedAt.slice(0,10)}.json`;a.click();URL.revokeObjectURL(url);setMessage("Backup downloaded.");};
  const restore=async(file?:File)=>{if(!file)return;try{const snapshot=JSON.parse(await file.text()) as PersonalOsSnapshot;restoreExport(snapshot);setMessage("Backup restored. Reloading…");setTimeout(()=>location.reload(),700);}catch(e){setMessage(e instanceof Error?e.message:"Could not restore backup.");}};
  return <div className="card" style={{marginTop:16}}><strong>Data backup</strong><div className="muted" style={{fontSize:12,marginTop:4}}>Export all Personal OS data before major changes, or restore a previous JSON backup.</div><div className="row" style={{marginTop:12}}><button className="btn ghost sm" onClick={download}>Export data</button><button className="btn ghost sm" onClick={()=>input.current?.click()}>Restore backup</button><input ref={input} hidden type="file" accept="application/json" onChange={e=>restore(e.target.files?.[0])}/>{message&&<span className="muted" style={{fontSize:12}}>{message}</span>}</div></div>;
}
