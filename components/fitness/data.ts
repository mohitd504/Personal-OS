"use client";
// Storage/date helpers, exercise setup data and Strava/Google Health helpers for the Exercise tab.

/* ---------- storage ---------- */
export const LS = (k: string, d: any) => { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } };
export const SS = (k: string, v: any) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
export const uid = () => Math.random().toString(36).slice(2, 9);
export const dstr = (d: Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
export const today = () => dstr(new Date());
export const DOW = ["Su","Mo","Tu","We","Th","Fr","Sa"];
export const SPLIT_VISUAL:Record<string,string>={Push:"/workout/push-machine.webp",Pull:"/workout/pull-machine.webp",Legs:"/workout/legs-machine.webp"};
export const EXERCISE_SETUP:Record<string,{machine:string;pattern:string;target:string;cue:string}>={
  "Bench Press":{machine:"Flat bench + barbell",pattern:"Horizontal push",target:"Chest · triceps · front delts",cue:"Eyes below bar · feet planted"},
  "Incline Dumbbell Press":{machine:"30–45° incline bench",pattern:"Incline push",target:"Upper chest · triceps",cue:"Wrists stacked · shoulders down"},
  "Machine Chest Press":{machine:"Seated chest press",pattern:"Horizontal push",target:"Chest · triceps",cue:"Handles at mid-chest height"},
  "Cable Fly":{machine:"Dual cable station",pattern:"Chest adduction",target:"Chest",cue:"Soft elbows · controlled stretch"},
  "Shoulder Press":{machine:"Bench + dumbbells / press machine",pattern:"Vertical push",target:"Shoulders · triceps",cue:"Back supported · ribs down"},
  "Lateral Raise":{machine:"Dumbbells / cable",pattern:"Shoulder abduction",target:"Side delts",cue:"Lead with elbows · no swing"},
  "Rear Delt Fly":{machine:"Reverse pec deck / dumbbells",pattern:"Horizontal pull",target:"Rear delts · upper back",cue:"Chest supported when possible"},
  "Tricep Pushdown":{machine:"Cable + rope / bar",pattern:"Elbow extension",target:"Triceps",cue:"Pin elbows beside ribs"},
  "Overhead Tricep Extension":{machine:"Cable / dumbbell",pattern:"Elbow extension",target:"Long-head triceps",cue:"Keep elbows narrow"},
  "Dips":{machine:"Parallel bars / assisted dip",pattern:"Vertical push",target:"Chest · triceps",cue:"Shoulders down · controlled depth"},
  "Push-ups":{machine:"Floor / handles",pattern:"Horizontal push",target:"Chest · triceps · core",cue:"Head-to-heel straight line"},
  "Deadlift":{machine:"Barbell + platform",pattern:"Hip hinge",target:"Glutes · hamstrings · back",cue:"Bar over mid-foot · brace first"},
  "Lat Pulldown":{machine:"Lat pulldown + wide bar",pattern:"Vertical pull",target:"Lats · biceps",cue:"Thigh pad snug · chest tall"},
  "Pull-ups":{machine:"Pull-up bar / assisted machine",pattern:"Vertical pull",target:"Lats · biceps",cue:"Start from active shoulders"},
  "Barbell Row":{machine:"Barbell",pattern:"Horizontal pull",target:"Mid-back · lats",cue:"Hinge and hold a neutral spine"},
  "Seated Cable Row":{machine:"Low cable row",pattern:"Horizontal pull",target:"Mid-back · lats",cue:"Cable level with lower ribs"},
  "Single Arm Row":{machine:"Bench + dumbbell",pattern:"Horizontal pull",target:"Lats · mid-back",cue:"Square hips · pull toward pocket"},
  "Face Pull":{machine:"Cable + rope",pattern:"Horizontal pull + rotation",target:"Rear delts · rotator cuff",cue:"Rope at eye level"},
  "Barbell Curl":{machine:"Barbell / EZ bar",pattern:"Elbow flexion",target:"Biceps",cue:"Elbows still · wrists neutral"},
  "Hammer Curl":{machine:"Dumbbells",pattern:"Elbow flexion",target:"Biceps · brachialis",cue:"Palms face inward"},
  "Preacher Curl":{machine:"Preacher bench / curl machine",pattern:"Elbow flexion",target:"Biceps",cue:"Armpits against pad"},
  "Shrugs":{machine:"Dumbbells / barbell",pattern:"Scapular elevation",target:"Upper traps",cue:"Lift straight up · do not roll"},
  "Squat":{machine:"Rack + barbell",pattern:"Squat",target:"Quads · glutes · core",cue:"Safety pins set · brace first"},
  "Romanian Deadlift":{machine:"Barbell / dumbbells",pattern:"Hip hinge",target:"Hamstrings · glutes",cue:"Push hips back · bar stays close"},
  "Leg Press":{machine:"45° leg press",pattern:"Squat / knee extension",target:"Quads · glutes",cue:"Lower back stays on pad"},
  "Walking Lunges":{machine:"Open floor + dumbbells",pattern:"Lunge",target:"Quads · glutes",cue:"Front knee tracks over toes"},
  "Leg Extension":{machine:"Leg extension",pattern:"Knee extension",target:"Quads",cue:"Machine pivot aligned with knee"},
  "Hamstring Curl":{machine:"Seated / lying leg curl",pattern:"Knee flexion",target:"Hamstrings",cue:"Machine pivot aligned with knee"},
  "Bulgarian Split Squat":{machine:"Bench + dumbbells",pattern:"Single-leg squat",target:"Quads · glutes",cue:"Stable front foot · controlled depth"},
  "Standing Calf Raise":{machine:"Standing calf machine",pattern:"Ankle extension",target:"Calves",cue:"Full stretch · pause at top"},
  "Seated Calf Raise":{machine:"Seated calf machine",pattern:"Ankle extension",target:"Soleus · calves",cue:"Pad secure above knees"},
  "Hip Thrust":{machine:"Hip-thrust bench / machine",pattern:"Hip extension",target:"Glutes",cue:"Chin tucked · ribs down"},
  "Glute Bridge":{machine:"Floor mat",pattern:"Hip extension",target:"Glutes",cue:"Finish with hips, not lower back"},
};
export function exerciseSetup(name:string){
  if(EXERCISE_SETUP[name]) return EXERCISE_SETUP[name];
  const n=name.toLowerCase();
  if(/press|push/.test(n)) return {machine:"Bench / press machine",pattern:"Push",target:"Chest · shoulders · triceps",cue:"Use a stable setup and controlled range"};
  if(/row|pull|pulldown/.test(n)) return {machine:"Cable / free weights",pattern:"Pull",target:"Back · biceps",cue:"Keep the spine neutral and control the return"};
  if(/squat|lunge|leg/.test(n)) return {machine:"Rack / leg machine",pattern:"Lower body",target:"Quads · glutes · hamstrings",cue:"Align knees with toes and use controlled depth"};
  return {machine:"Free weights / bodyweight",pattern:"Accessory",target:"See today’s training focus",cue:"Use controlled form and a pain-free range"};
}
export function curWeight(){ const wl=LS("pos_weightlog",[]); if(wl.length&&+wl[0].weight) return +wl[0].weight; const w2=LS("pos_weight",[]); if(w2.length&&w2[w2.length-1].kg) return +w2[w2.length-1].kg; return 97; }

/* ---------- CSV export ---------- */
export function exportCSV(name: string, rows: any[]) {
  if (!rows.length) { alert("Nothing to export yet."); return; }
  const cols = Object.keys(rows[0]);
  const csv = [cols.join(",")].concat(rows.map(r => cols.map(c => `"${String(r[c]??"").replace(/"/g,'""')}"`).join(","))).join("\n");
  const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv],{type:"text/csv"})); a.download = name+".csv"; a.click();
}

/* ---------- Strava sync (kept SEPARATE from manual/watch data) ---------- */
export const STRENGTH_RE = /(weight|workout|crossfit|strength)/i;
export function importStrava(acts: any[]) {
  const store = LS("pos_strava", []); const seen = new Set(store.map((x: any) => x.id)); let added = 0;
  const woIds = LS("pos_strava_wo", []); const wo = LS("pos_workouts", []);
  acts.forEach((a: any) => {
    if (!seen.has(a.id)) { store.push(a); seen.add(a.id); added++; }
    // Count Strava strength sessions toward the workout streak / calendar (no set detail available from Strava)
    if (STRENGTH_RE.test(a.type || "") && !woIds.includes(a.id)) {
      woIds.push(a.id);
      const type = /pull/i.test(a.name) ? "Pull" : /leg/i.test(a.name) ? "Legs" : /push/i.test(a.name) ? "Push" : "Strength";
      wo.unshift({ id: uid(), date: a.date, type, duration: a.duration || 0, notes: "From Strava: " + (a.name || a.type), exercises: [], volume: 0, calories: a.cal || 0, completion: 100, source: "strava" });
    }
  });
  store.sort((x: any, y: any) => (x.date < y.date ? 1 : -1));
  SS("pos_strava", store); SS("pos_strava_wo", woIds); SS("pos_workouts", wo);
  return added;
}

/* ================= EXECUTIVE HEALTH DASHBOARD ================= */
export const clamp = (v:number,a=0,b=100)=>Math.max(a,Math.min(b,isFinite(v)?v:0));
export const r0 = (v:number)=>Math.round(v||0);
export const r1 = (v:number)=>Math.round((v||0)*10)/10;
export const pctOf = (a:number,b:number)=> b>0 ? clamp(Math.round(a/b*100)) : 0;
/* watch (Google Health) daily history helpers */
export function ghByDay(field:string,n:number){ const rows=LS("pos_ghealth",[]); const out=[]; for(let i=n-1;i>=0;i--){ const d=new Date(); d.setDate(d.getDate()-i); const ds=dstr(d); const g=rows.find((x:any)=>x.date===ds); out.push({name:n<=7?DOW[d.getDay()]:String(d.getDate()),value:g?Math.round((+g[field]||0)*10)/10:0}); } return out; }
export function ghToday(field:string){ const g=LS("pos_ghealth",[]).find((x:any)=>x.date===today()); return g?+g[field]||0:0; }

/* ================= PLAN-DRIVEN WORKOUT (integrated with Goals) ================= */
export const pKey=(d:string)=>"pos_plan_"+d;
export const addDays=(ds:string,n:number)=>{ const d=new Date(ds); d.setDate(d.getDate()+n); return dstr(d); };
