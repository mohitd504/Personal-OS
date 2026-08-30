"use client";
import { useEffect, useState } from "react";
import { readJson } from "@/lib/client-storage";

type Reminder = { id:string; label:string; time:string; enabled:boolean };
const defaults:Reminder[]=[{id:"workout",label:"Workout",time:"18:00",enabled:false},{id:"study",label:"Study session",time:"20:00",enabled:false},{id:"review",label:"End-of-day review",time:"22:00",enabled:false}];

export default function ReminderCenter(){
  const [items,setItems]=useState<Reminder[]>(()=>readJson("pos_reminders",defaults));
  const [permission,setPermission]=useState<string>(()=>typeof Notification==="undefined"?"unsupported":Notification.permission);
  const save=(next:Reminder[])=>{setItems(next);localStorage.setItem("pos_reminders",JSON.stringify(next));};
  useEffect(()=>{const timer=setInterval(()=>{if(typeof Notification==="undefined"||Notification.permission!=="granted")return;const now=new Date();const hm=`${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}`;const sent=readJson<Record<string,boolean>>("pos_reminders_sent",{});items.filter(x=>x.enabled&&x.time===hm).forEach(x=>{const key=`${now.toDateString()}_${x.id}_${hm}`;if(!sent[key]){new Notification(`Personal OS · ${x.label}`,{body:"Your planned time has arrived."});sent[key]=true;}});localStorage.setItem("pos_reminders_sent",JSON.stringify(sent));},30_000);return()=>clearInterval(timer);},[items]);
  const enable=async()=>{if(typeof Notification==="undefined")return;setPermission(await Notification.requestPermission());};
  return <div className="card" style={{marginTop:16}}><div className="between"><div><strong>Reminders</strong><div className="muted" style={{fontSize:12}}>Browser notifications work while Personal OS is open.</div></div>{permission!=="granted"&&<button className="btn sm" onClick={enable}>Enable notifications</button>}</div>{items.map((item,index)=><div className="row" key={item.id} style={{marginTop:12}}><input type="checkbox" checked={item.enabled} onChange={e=>save(items.map((x,i)=>i===index?{...x,enabled:e.target.checked}:x))}/><input className="in" value={item.label} onChange={e=>save(items.map((x,i)=>i===index?{...x,label:e.target.value}:x))} style={{flex:1}}/><input className="in" type="time" value={item.time} onChange={e=>save(items.map((x,i)=>i===index?{...x,time:e.target.value}:x))}/></div>)}</div>;
}
