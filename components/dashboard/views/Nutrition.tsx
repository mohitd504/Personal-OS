"use client";
import { useState } from "react";
import { today, loadNut, nutTotals, SS, nutKey, last7 } from "@/components/dashboard/data";
import { Bar, Head, Chip } from "@/components/dashboard/ui";
import { PieCard, BarCard } from "@/components/dashboard/lazy";

export function Nutrition({ sett, refresh, tick, date }: any) {
  const D=date||today(); const n=loadNut(D); const t=nutTotals(D);
  const [busy,setBusy]=useState(false);
  const [estimateNote,setEstimateNote]=useState("");
  const [paste,setPaste]=useState("");
  const [photoBusy,setPhotoBusy]=useState(false); const [photoMsg,setPhotoMsg]=useState("");
  // shrink the image in the browser so the upload stays well under the request size limit
  const compress=(file:File):Promise<string>=>new Promise((resolve,reject)=>{
    const rd=new FileReader();
    rd.onerror=()=>reject(new Error("read"));
    rd.onload=()=>{ const img=new Image(); img.onerror=()=>reject(new Error("img"));
      img.onload=()=>{ const max=1024; let{width:w,height:h}=img; if(w>h&&w>max){h=Math.round(h*max/w);w=max;} else if(h>max){w=Math.round(w*max/h);h=max;}
        const c=document.createElement("canvas"); c.width=w; c.height=h; const ctx=c.getContext("2d"); if(!ctx){reject(new Error("ctx"));return;} ctx.drawImage(img,0,0,w,h);
        resolve(c.toDataURL("image/jpeg",0.7)); };
      img.src=rd.result as string; };
    rd.readAsDataURL(file);
  });
  const onPhoto=async(file:File|undefined)=>{ if(!file) return; setPhotoBusy(true); setPhotoMsg("Analysing photo…");
    try{
      const image=await compress(file);
      const r=await fetch("/api/food-photo",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({image})});
      if(!r.ok){ setPhotoMsg(`Upload failed (${r.status}). Try a smaller/clearer photo.`); setPhotoBusy(false); return; }
      const d=await r.json();
      if(d && !d.error && (d.cal||d.protein||d.carbs)){ const g=Math.round(d.grams||0); const nm=(d.name||"Photo meal")+(g?` (~${g}g)`:""); const m=loadNut(D); m.meals.push({name:nm,grams:g,cal:Math.round(d.cal||0),protein:Math.round(d.protein||0),carbs:Math.round(d.carbs||0),fat:Math.round(d.fat||0),fiber:Math.round(d.fiber||0)}); SS(nutKey(D),m); refresh(); setPhotoMsg(`Added ✓ ${d.name||"meal"}${g?` · ~${g}g`:""} · ${Math.round(d.cal||0)} kcal`); }
      else setPhotoMsg(d.error||"Couldn't read that photo — try a clearer shot.");
    }catch(e:any){ setPhotoMsg("Photo read failed ("+(e?.message||"error")+")."); }
    setPhotoBusy(false);
  };
  const importPaste=()=>{ const text=paste; if(!text.trim())return;
    const num=(re:RegExp)=>{const m=text.match(re);return m?parseFloat(m[1]):0;};
    const macro={ cal:Math.round(num(/calor\w*[^0-9-]*([\d.]+)/i)), protein:Math.round(num(/protein[^0-9-]*([\d.]+)/i)), carbs:Math.round(num(/carb\w*[^0-9-]*([\d.]+)/i)), fat:Math.round(num(/\bfat[^0-9-]*([\d.]+)/i)), fiber:Math.round(num(/fib\w*[^0-9-]*([\d.]+)/i)) };
    if(!(macro.cal||macro.protein||macro.carbs||macro.fat||macro.fiber)){ alert("Couldn't find nutrition numbers in the pasted text."); return; }
    const m=loadNut(D); m.meals.push({name:"Pasted total", ...macro}); SS(nutKey(D),m); setPaste(""); refresh(); };
  const add=async()=>{ const el=(id:string)=>(document.getElementById(id) as HTMLInputElement); const name=el("nName").value.trim(); if(!name)return;
    let cal=+el("nCal").value||0; let p=+el("nP").value||0,c=+el("nC").value||0,f=+el("nF").value||0,fb=+el("nFb").value||0;
    if(!(cal||p||c||f||fb)){
      setBusy(true);
      try{ const r=await fetch("/api/nutrition",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({food:name})}); const d=await r.json(); if(!r.ok)throw new Error(d.error||"Estimate failed"); cal=d.cal||0;p=d.protein||0;c=d.carbs||0;f=d.fat||0;fb=d.fiber||0;setEstimateNote(`${d.source==="ai"?"AI estimate":"Reference estimate"}: ${d.assumption||"Review the values before relying on them."}`); }catch(e){setEstimateNote(e instanceof Error?e.message:"Estimate failed");}
      setBusy(false);
    } else if(!cal){ cal=Math.round(p*4+c*4+f*9); }
    const m=loadNut(D); m.meals.push({name,cal,protein:p,carbs:c,fat:f,fiber:fb}); SS(nutKey(D),m);
    ["nName","nCal","nP","nC","nF","nFb"].forEach(i=>el(i).value=""); refresh(); };
  const del=(i:number)=>{ const m=loadNut(D); m.meals.splice(i,1); SS(nutKey(D),m); refresh(); };
  const water=(d:number)=>{ const m=loadNut(D); m.water=Math.max(0,Math.round((m.water+d)*100)/100); SS(nutKey(D),m); refresh(); };
  const R=(lbl:string,v:number,g:number,color:string,u:string)=><div className="card"><div className="between"><div className="lbl muted">{lbl}</div></div><div className="val" style={{fontSize:24,fontWeight:760,marginTop:6}}>{v}<small className="muted"> /{g}{u}</small></div><Bar v={v} goal={g} color={color}/></div>;
  return <>
    <Head t="Nutrition" p="Track calories, macros, water & meals" />
    <div className="grid g3" style={{marginBottom:16}}>
      <div className="panel">
        <div className="panel-h"><div className="t">🎯 Calorie Goal</div></div>
        <div className="row" style={{gap:18,alignItems:"center"}}>
          <div className="ring lg" style={{["--p" as any]:Math.min(100,Math.round(t.cal/Math.max(1,sett.calorieGoal)*100)),["--c" as any]:"#f59e0b"}}><div className="rc"><b>{t.cal}</b><small>of {sett.calorieGoal}</small></div></div>
          <div style={{flex:1,minWidth:0}}>
            {[["Protein",t.protein,sett.proteinGoal,"grad-green"],["Carbs",t.carbs,sett.carbGoal,"grad-blue"],["Fat",t.fat,sett.fatGoal,"grad-orange"]].map((x:any)=>(
              <div className="stat" key={x[0]}><span className="sl">{x[0]}</span><span className="track"><i className={x[3]} style={{width:Math.min(100,Math.round(x[1]/Math.max(1,x[2])*100))+"%"}}/></span><span className="sv">{x[1]} / {x[2]} g</span></div>
            ))}
          </div>
        </div>
      </div>
      <div className="panel">
        <div className="panel-h"><div className="t">💧 Water Tracker</div></div>
        <div style={{fontSize:22,fontWeight:800}}>{n.water}<small className="muted" style={{fontSize:13,fontWeight:600}}> / {sett.waterGoal} L</small></div>
        <div className="glasses">{Array.from({length:Math.max(8,Math.round(sett.waterGoal/0.25))}).map((_,i)=><span key={i} className={"glass"+(i<Math.round(n.water/0.25)?" on":"")}/>)}</div>
        <div className="row" style={{marginTop:14,gap:8}}><button className="btn ghost sm" onClick={()=>water(-0.25)}>−250ml</button><button className="btn sm" onClick={()=>water(0.25)}>+ Add Water</button></div>
      </div>
      <div className="panel">
        <div className="panel-h"><div className="t">🍽️ Meal Timeline</div></div>
        {n.meals.length? <div className="mealline">{n.meals.slice(0,4).map((m:any,i:number)=><div className="meal" key={i}><div className="mimg">{["🍳","🥗","🍎","🍲"][i]||"🍽️"}</div><span className="mt">{String(m.name).slice(0,12)}</span><span className="mk">{m.cal} kcal</span></div>)}</div> : <div className="muted" style={{fontSize:12,marginTop:20}}>No meals logged yet — add one below and it appears here.</div>}
      </div>
    </div>
    <div className="grid g2" style={{marginTop:16}}>
      <div className="card"><strong>Log a meal</strong>
        <div className="row" style={{marginTop:12}}><input className="in" id="nName" placeholder="Food name" style={{flex:1}}/></div>
        <div className="row" style={{marginTop:8,flexWrap:"wrap",gap:8}}><input className="in" id="nCal" type="number" placeholder="Calories" style={{width:100}}/><input className="in" id="nP" type="number" placeholder="Protein g" style={{width:100}}/><input className="in" id="nC" type="number" placeholder="Carbs g" style={{width:95}}/><input className="in" id="nF" type="number" placeholder="Fat g" style={{width:85}}/><input className="in" id="nFb" type="number" placeholder="Fiber g" style={{width:90}}/><button className="btn" onClick={add} disabled={busy}>{busy?"🤖 Fetching…":"Add meal"}</button></div>
        <div className="muted" style={{fontSize:11,margin:"6px 0"}}>Type just the food name and hit Add — AI estimates the macros. All estimates are editable and may vary by portion or preparation.</div>
        {estimateNote&&<div style={{fontSize:11,margin:"8px 0",padding:8,borderRadius:8,background:"rgba(59,130,246,.08)",border:"1px solid rgba(59,130,246,.2)"}}>ℹ️ {estimateNote}</div>}
        <div style={{marginTop:6,padding:10,borderRadius:12,background:"rgba(245,158,11,.08)",border:"1px solid rgba(245,158,11,.25)"}}>
          <div className="row" style={{gap:8,flexWrap:"wrap"}}><span>📷</span><strong style={{fontSize:13}}>Snap a food photo</strong>
            <label className="btn ghost sm" style={{cursor:"pointer",marginLeft:"auto"}}>{photoBusy?"🤖 Analysing…":"Upload / take photo"}<input type="file" accept="image/*" capture="environment" style={{display:"none"}} disabled={photoBusy} onChange={e=>onPhoto(e.target.files?.[0])}/></label>
          </div>
          <div className="muted" style={{fontSize:11,marginTop:6}}>{photoMsg||"Take or upload a picture of your plate — Claude estimates the calories & macros and adds it."}</div>
        </div>
        <ul className="list">{n.meals.length? n.meals.map((m:any,i:number)=><li className="li" key={i}><span className="dot" style={{background:"var(--orange)"}}/><div style={{flex:1}}><div className="between"><strong>{m.name}</strong><span>{m.cal} kcal</span></div><div className="muted" style={{fontSize:12}}>P {m.protein}g · C {m.carbs}g · F {m.fat}g · Fiber {m.fiber}g</div></div><span className="btn ghost sm" onClick={()=>del(i)} style={{cursor:"pointer"}}>✕</span></li>):<li className="muted" style={{padding:"8px 0"}}>No meals logged today.</li>}</ul>
      </div>
      <div className="card"><div className="between"><strong>Hydration</strong><Chip tint="cyan">💧</Chip></div>
        <div className="val" style={{fontSize:26,fontWeight:770,marginTop:12}}>{n.water}<small className="muted"> /{sett.waterGoal}L</small></div>
        <Bar v={n.water} goal={sett.waterGoal} color="var(--cyan)"/>
        <div className="row" style={{marginTop:12}}><button className="btn ghost sm" onClick={()=>water(-0.25)}>−250ml</button><button className="btn sm" onClick={()=>water(0.25)}>+250ml</button></div>
        <div style={{marginTop:14}} className="muted">Fiber {t.fiber}g / {sett.fiberGoal}g</div><Bar v={t.fiber} goal={sett.fiberGoal} color="var(--emerald)"/>
      </div>
    </div>
    <div className="card" style={{marginTop:16}}><div className="between"><strong>📋 Paste &amp; Import</strong><span className="muted" style={{fontSize:12}}>paste a totals table or log</span></div>
      <textarea className="in" value={paste} onChange={e=>setPaste(e.target.value)} placeholder={"Paste like:\nCalories ~837 kcal\nProtein ~55.6 g\nCarbohydrates ~134.3 g\nFat ~10.4 g\nFiber ~21.5 g"} style={{width:"100%",minHeight:120,marginTop:8}}/>
      <div style={{marginTop:8}}><button className="btn" onClick={importPaste}>Read &amp; add to today</button></div>
    </div>
    <div className="grid g2" style={{marginTop:16}}>
      <PieCard title="Macro split (today)" data={[{name:"Protein",value:t.protein},{name:"Carbs",value:t.carbs},{name:"Fat",value:t.fat}]}/>
      <BarCard title="Calories — last 7 days" color="#F59E0B" data={last7().map(x=>({name:x.name,value:nutTotals(x.ds).cal}))}/>
    </div>
  </>;
}
