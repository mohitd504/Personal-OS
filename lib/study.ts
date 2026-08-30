export type StudyTask = { time?:string; task:string; done?:boolean; completedAt?:string };
export type StudySubject = { id:string; label:string; courseId?:string; brief?:string; notes?:string; pdf?:string; resource?:string; courseVideo?:string; codeFile?:{filename:string;code:string;lang?:string}; plan?:StudyTask[]; studied?:number };
export type StudySession = { id:string; date:string; subject:string; minutes:number; note?:string; completedAt:string };
export type ReviewItem = { id:string; subject:string; topic:string; due:string; interval:number; done?:boolean };

export const localDate=(date=new Date())=>`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
export const addDays=(value:string,days:number)=>{const [y,m,d]=value.split("-").map(Number);const date=new Date(y,m-1,d);date.setDate(date.getDate()+days);return localDate(date);};
export const readStore=<T,>(key:string,fallback:T):T=>{try{const value=localStorage.getItem(key);return value==null?fallback:JSON.parse(value);}catch{return fallback;}};
export const writeStore=(key:string,value:unknown)=>localStorage.setItem(key,JSON.stringify(value));
export const subjectsFor=(date:string):StudySubject[]=>{const plan=readStore<any>(`pos_plan_${date}`,{});return Array.isArray(plan.studyList)?plan.studyList:[];};
export const studySessions=():StudySession[]=>readStore("pos_study_sessions",[]);
export function collectSubjects(daysBack=180,daysForward=260){const map=new Map<string,StudySubject>();const start=new Date();start.setDate(start.getDate()-daysBack);for(let i=0;i<=daysBack+daysForward;i++){const date=localDate(start);subjectsFor(date).forEach(subject=>map.set(`${date}:${subject.id||subject.label}`,{...subject,id:subject.id||`${date}-${subject.label}`}));start.setDate(start.getDate()+1);}return [...map.entries()].map(([key,subject])=>({date:key.split(":")[0],subject}));}
export function buildReviews(){const existing=readStore<ReviewItem[]>("pos_study_reviews",[]);const ids=new Set(existing.map(x=>x.id));const created:ReviewItem[]=[];collectSubjects(90,0).forEach(({date,subject})=>(subject.plan||[]).forEach((task,index)=>{if(!task.done)return;[1,3,7,21].forEach(interval=>{const id=`${date}:${subject.id}:${index}:${interval}`;if(!ids.has(id)){created.push({id,subject:subject.label,topic:task.task,due:addDays(date,interval),interval});ids.add(id);}});}));const result=[...existing,...created];writeStore("pos_study_reviews",result);return result;}
