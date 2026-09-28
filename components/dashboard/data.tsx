"use client";
// Storage helpers, settings defaults, seed data (courses, workout plans) and pure helpers shared by the dashboard views.
import type { AppSettings } from "@/lib/domain";

/* ---------- storage helpers ---------- */
export const LS = (k: string, d: any) => { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } };
export const SS = (k: string, v: any) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
export const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; };
export const PPL: Record<number,string> = {0:"Recovery",1:"Push",2:"Pull",3:"Legs",4:"Push",5:"Pull",6:"Legs"};

export type Sett = AppSettings;
export const DEF_SETT: Sett = { name:"Mohit", age:34, heightFt:6, heightIn:1, planStart:today(), planDays:180, weightGoal:86, calorieGoal:2300, proteinGoal:170, carbGoal:230, fatGoal:60, fiberGoal:35, waterGoal:3.5, stepGoal:13000 };

/* ---------- charts ---------- */
export function last7(){ const out:{name:string;ds:string}[]=[]; for(let i=6;i>=0;i--){ const x=new Date(); x.setDate(x.getDate()-i); const ds=`${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,"0")}-${String(x.getDate()).padStart(2,"0")}`; out.push({name:["Su","Mo","Tu","We","Th","Fr","Sa"][x.getDay()],ds}); } return out; }

/* ---------- NUTRITION ---------- */
export function nutKey(d:string){return "pos_nutri_"+d;}
export function loadNut(d:string){return LS(nutKey(d),{meals:[],water:0});}
export function nutTotals(d:string){const n=loadNut(d);const t={cal:0,protein:0,carbs:0,fat:0,fiber:0};n.meals.forEach((m:any)=>{t.cal+=m.cal||0;t.protein+=m.protein||0;t.carbs+=m.carbs||0;t.fat+=m.fat||0;t.fiber+=m.fiber||0;});return t;}

/* ---------- STUDY ---------- */
export function studyKey(d:string){return "pos_study_"+d;}
export function loadStudy(d:string){return LS(studyKey(d),{});}
export function studyTotal(d:string){const s=loadStudy(d);return Object.keys(s).reduce((a,k)=>a+(s[k]||0),0);}
export function fmt(m:number){m=Math.round(m||0);return Math.floor(m/60)+"h "+(m%60)+"m";}
export function studyProgress(){
  const courses:any={agentic:{label:"🤖 Agentic AI",done:0,total:0},sysdesign:{label:"🗄️ System Design",done:0,total:0},dsa:{label:"🧩 DSA (Srivastava)",done:0,total:0},other:{label:"📚 Other subjects",done:0,total:0}};
  let tasksDone=0, tasksTotal=0; const recent:any[]=[]; const base=new Date();
  for(let i=-200;i<=260;i++){ const d=new Date(base); d.setDate(d.getDate()+i); const ds=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
    const pl:any=LS("pos_plan_"+ds,null); if(!pl||!Array.isArray(pl.studyList)) continue;
    pl.studyList.forEach((s:any)=>{ const cid=courses[s.courseId]?s.courseId:"other"; courses[cid].total++; const tasks=s.plan||[]; tasksTotal+=tasks.length; const dn=tasks.filter((t:any)=>t.done).length; tasksDone+=dn; const complete=tasks.length>0 && dn===tasks.length; if(complete){ courses[cid].done++; recent.push({date:ds,label:s.label}); } });
  }
  recent.sort((a,b)=> a.date<b.date?1:-1);
  return { courses, tasksDone, tasksTotal, recent:recent.slice(0,12) };
}
export function seedCurr(){const mk=(a:string[])=>a.map((topic,i)=>({topic,date:"",status:"todo"}));return{
  ai:mk(["Python & math foundations","ML fundamentals","Deep Learning (NN/CNN/RNN)","NLP & Transformers","LLMs & fine-tuning","RAG","Agents & tool use","MLOps & deployment","Capstone"]),
  devops:mk(["Linux & shell","Git & CI/CD","Docker","Kubernetes","Terraform/IaC","Observability","Cloud (AWS/GCP)","Security","Capstone"]),
  system:mk(["Scalability & latency","Databases & sharding","Caching & CDN","Load balancing & queues","Microservices & APIs","CAP & consistency","URL shortener / rate limiter","Feed & chat design","Mock interviews"]),
};}
/* ---------- 120-day daily goal planner ---------- */
export function planKey(d:string){ return "pos_plan_"+d; }
export const dstrD=(d:Date)=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
export function purgeCourse(cid:string){ const base=new Date(); for(let i=-90;i<=200;i++){ const d=new Date(base); d.setDate(d.getDate()+i); const ds=dstrD(d); const c:any=LS(planKey(ds),null); if(c&&Array.isArray(c.studyList)&&c.studyList.some((x:any)=>x.courseId===cid)) SS(planKey(ds),{...c,studyList:c.studyList.filter((x:any)=>x.courseId!==cid)}); } }
export const PLAN_DEF:any={exSessions:[],meals:{breakfast:[],lunch:[],dinner:[]},studyList:[],journal:""};
export function loadPlan(d:string){ const raw:any=LS(planKey(d),{}); const mealArr=(g:string)=>Array.isArray(raw.meals?.[g])?raw.meals[g]:[];
  return {...PLAN_DEF, ...raw, exSessions:Array.isArray(raw.exSessions)?raw.exSessions:[], studyList:Array.isArray(raw.studyList)?raw.studyList:[], meals:{breakfast:mealArr("breakfast"),lunch:mealArr("lunch"),dinner:mealArr("dinner")}, journal:raw.journal||""}; }
export const EX_TYPES=["Rest","Push","Pull","Legs","Arms","Cardio","Walk","HIIT","Yoga"];
export const SESS_EMOJI:Record<string,string>={Walk:"🚶",Push:"🤚",Pull:"🏋️",Legs:"🦵",Arms:"💪",Rest:"😴",Cardio:"🏃",HIIT:"⚡",Yoga:"🧘"};
export const SESS_GRAD:Record<string,string>={Walk:"linear-gradient(120deg,rgba(34,197,94,.22),rgba(16,185,129,.14))",Push:"linear-gradient(120deg,rgba(239,68,68,.20),rgba(249,115,22,.14))",Pull:"linear-gradient(120deg,rgba(59,130,246,.22),rgba(139,92,246,.16))",Legs:"linear-gradient(120deg,rgba(168,85,247,.20),rgba(59,130,246,.14))",Arms:"linear-gradient(120deg,rgba(236,72,153,.20),rgba(139,92,246,.14))",Rest:"linear-gradient(120deg,rgba(148,163,184,.18),rgba(100,116,139,.12))",Cardio:"linear-gradient(120deg,rgba(249,115,22,.20),rgba(234,179,8,.14))"};
export const P_PUSH=["Bench Press","Incline Bench Press","Decline Bench Press","Flat Dumbbell Press","Incline Dumbbell Press","Machine Chest Press","Cable Fly","Incline Cable Fly","Pec Deck Fly","Push-ups","Dips","Overhead Shoulder Press","Seated Dumbbell Shoulder Press","Arnold Press","Military Press","Lateral Raise","Cable Lateral Raise","Front Raise","Rear Delt Fly","Upright Row","Tricep Pushdown","Rope Pushdown","Overhead Tricep Extension","Skull Crushers","Close-Grip Bench Press"];
export const P_PULL=["Deadlift","Barbell Row","Pendlay Row","T-Bar Row","Seated Cable Row","Single Arm Dumbbell Row","Lat Pulldown","Wide-Grip Lat Pulldown","Close-Grip Pulldown","Pull-ups","Chin-ups","Face Pull","Straight-Arm Pulldown","Shrugs","Barbell Curl","Dumbbell Curl","Hammer Curl","Preacher Curl","Incline Dumbbell Curl","Concentration Curl","Cable Curl","Reverse Curl","Spider Curl","Farmer Walk"];
export const P_LEGS=["Squat","Front Squat","Hack Squat","Leg Press","Bulgarian Split Squat","Walking Lunges","Reverse Lunges","Goblet Squat","Leg Extension","Romanian Deadlift","Stiff-Leg Deadlift","Lying Hamstring Curl","Seated Leg Curl","Hip Thrust","Glute Bridge","Cable Glute Kickback","Sumo Deadlift","Standing Calf Raise","Seated Calf Raise","Step-ups","Adductor Machine","Abductor Machine","Box Jumps"];
export const P_ARMS=["EZ-Bar Curl","Barbell Curl","Incline Dumbbell Curl","Hammer Curl","Preacher Curl","Cable Curl","Concentration Curl","Spider Curl","Close-Grip Bench Press","Tricep Pushdown","Rope Pushdown","Overhead Tricep Extension","Skull Crushers","Dips","Overhead Cable Tricep Extension","Reverse Curl","Zottman Curl","Kickbacks"];
export const EX_LIB:Record<string,string[]>={Push:P_PUSH,Pull:P_PULL,Legs:P_LEGS,Arms:P_ARMS};
export const WORKOUT_CYCLE=["Push","Pull","Legs","Rest","Push","Pull","Legs","Arms"];
export const GYM_TYPES=["Push","Pull","Legs","Arms"];
export function workoutStart(){ let s=LS("pos_workout_start",""); if(!s){ s=dstrD(new Date()); SS("pos_workout_start",s); } const [y,m,d]=String(s).split("-").map(Number); const dt=new Date(y,m-1,d); dt.setHours(0,0,0,0); return dt; }
export function seedWorkoutPlan(start?:Date, days:number=125, overwrite:boolean=true){
  const s0=start||workoutStart();
  for(let i=0;i<days;i++){
    const d=new Date(s0); d.setDate(d.getDate()+i); const ds=dstrD(d); const key=planKey(ds);
    const cur:any=LS(key,{}); let list=Array.isArray(cur.exSessions)?cur.exSessions:[];
    const has=list.some((s:any)=>s.seeded);
    if(!overwrite && has) continue;
    if(overwrite) list=list.filter((s:any)=>!s.seeded);
    const type=WORKOUT_CYCLE[i%WORKOUT_CYCLE.length];
    const sessions:any[]=[{id:uid(),seeded:true,time:"06:30",type:"Walk",done:false,steps:"11000",distance:"",duration:"",detail:"11,000-step walk",selected:[]}];
    if(type!=="Rest"){ const lib=EX_LIB[type]||[]; sessions.push({id:uid(),seeded:true,time:"18:00",type,done:false,steps:"",distance:"",duration:"",detail:type+" day",selected:lib.slice(0,7).map((n:string)=>({name:n,sets:"3",reps:"10",weight:"",note:""}))}); }
    SS(key,{...cur,exSessions:[...sessions,...list]});
  }
}
export const ENGLISH_TOPICS=["Advanced present tenses (simple vs continuous nuance)","Past tenses mastery (past simple vs present perfect)","Perfect tenses (present/past perfect & continuous)","Future forms (will vs going to vs present continuous)","Articles a/an/the — advanced usage","Prepositions of time & place — tricky cases","Prepositions with verbs & adjectives (depend on, good at)","Phrasal verbs — everyday (get, take, put)","Phrasal verbs — work & business","Idioms & how to use them naturally","Conditionals (0,1,2,3)","Mixed & inverted conditionals","Reported speech","Passive voice — when & how","Modal verbs — ability, permission, obligation","Modals of deduction & probability (must, might, can't)","Collocations — natural word pairs","Connectors & linking words (however, therefore)","Relative clauses (defining & non-defining)","Gerunds vs infinitives","Formal vs informal English","Polite English & softening language","Small talk & everyday conversation","Describing people & personality","Describing places & travel","Narrating a story (sequencing & tenses)","Giving opinions, agreeing & disagreeing","Argument & persuasion language","Comparisons & degrees (as…as, the more…)","Expressing feelings & reactions","Business email English","Meetings & discussions English","Job interview English — common questions","Presentations & public speaking phrases","Telephoning & video calls","Negotiation & making requests","Vocabulary: technology & work","Vocabulary: money & shopping","Vocabulary: health & lifestyle","Pronunciation & word stress","Fix your top common mistakes","Paraphrasing & summarizing","Advanced vocabulary & synonym upgrades","Fluency drills — thinking in English","Review + mock interview + final essay"];
export const SCENARIOS=["Free conversation","Job interview","Small talk / networking","At a restaurant","Business meeting","Travel & airport","Doctor's appointment","Debate a topic","Phone / customer service","Making friends","Negotiation","Presentation Q&A"];
export const OPT = { background:"#0f172a", color:"#E7ECF3" } as any;
export const uid=()=>Math.random().toString(36).slice(2,9);
export const firstUrl=(s:string)=>{ const m=String(s||"").match(/https?:\/\/\S+/); return m?m[0]:""; };
export function mdToHtml(md:string){ const escc=(s:string)=>s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
  const inline=(t:string)=> escc(t).replace(/\*\*(.+?)\*\*/g,"<b>$1</b>").replace(/`(.+?)`/g,'<code>$1</code>');
  const lines=String(md||"").split(/\r?\n/); let html=""; let ul=false;
  for(const raw of lines){ const l=raw.trim();
    if(/^#{1,6}\s/.test(l)){ if(ul){html+="</ul>";ul=false;} const lvl=(l.match(/^#+/)||["#"])[0].length; const txt=l.replace(/^#+\s/,""); html+=`<h${lvl<=2?4:5} style="font-size:${lvl<=2?17:15}px;margin:16px 0 6px;color:#c4b5fd">${inline(txt)}</h${lvl<=2?4:5}>`; continue; }
    if(/^([-*]|\d+\.)\s/.test(l)){ if(!ul){html+="<ul style='margin:6px 0 6px 18px'>";ul=true;} html+=`<li style="margin:3px 0">${inline(l.replace(/^([-*]|\d+\.)\s/,""))}</li>`; continue; }
    if(ul){html+="</ul>";ul=false;}
    if(l==="") continue;
    html+=`<p style="margin:6px 0;line-height:1.7">${inline(l)}</p>`;
  }
  if(ul) html+="</ul>"; return html;
}
export function printNotes(title:string, html:string){ const w=window.open("","_blank"); if(!w) return;
  w.document.write(`<html><head><title>${title}</title><style>body{font-family:Georgia,serif;max-width:760px;margin:32px auto;padding:0 24px;color:#111;line-height:1.7}h1{font-size:22px}h4{color:#4338ca;margin:16px 0 6px}h5{color:#4338ca}code{background:#f2f2f2;padding:1px 4px;border-radius:4px}ul{margin:6px 0 6px 18px}</style></head><body><h1>${title}</h1>${html}<script>window.onload=function(){window.print()}<\/script></body></html>`); w.document.close();
}
export const COURSE_RES=[
  "Course video: https://www.youtube.com/watch?v=rV3HJ4LEZ7k",
  "LangChain: https://github.com/krishnaik06/Langchain-V1-Crash-Course",
  "LangGraph: https://github.com/krishnaik06/Agentic-LanggraphCrash-course",
  "RAG / Vectorless RAG: https://github.com/krishnaik06/RAG-Tutorials",
  "Guardrails: https://github.com/krishnaik06/Langchain-V1-Crash-Course/blob/main/updatedlangchain/langchain_guardrails_crash_course.ipynb",
  "LLM Evals: https://github.com/krishnaik06/RAG-Tutorials/blob/main/1-rag_evaluation.ipynb",
  "Agentic AI Roadmap: https://github.com/krishnaik06/Roadmap-To-Learn-Agentic-AI",
].join("\n");
export const YT="https://www.youtube.com/watch?v=rV3HJ4LEZ7k";
export const GH_LC="https://github.com/krishnaik06/Langchain-V1-Crash-Course";
export const GH_LG="https://github.com/krishnaik06/Agentic-LanggraphCrash-course";
export const GH_RAG="https://github.com/krishnaik06/RAG-Tutorials";
export const GH_GUARD="https://github.com/krishnaik06/Langchain-V1-Crash-Course/blob/main/updatedlangchain/langchain_guardrails_crash_course.ipynb";
export const GH_EVAL="https://github.com/krishnaik06/RAG-Tutorials/blob/main/1-rag_evaluation.ipynb";
export const GH_ROAD="https://github.com/krishnaik06/Roadmap-To-Learn-Agentic-AI";
/* 15-day Agentic AI course plan (Krish Naik, 10h video) — 1.5h/day, ~40min video + practice */
export const AGENTIC_COURSE=[
  {title:"LangChain setup & intro",brief:"Install LangChain v1, understand chat models, messages, and your first chain.",link:GH_LC,timing:"0:00–0:40"},
  {title:"Prompts, LCEL & output parsers",brief:"Prompt templates, the LangChain Expression Language (|) and structured output parsers.",link:GH_LC,timing:"0:40–1:20"},
  {title:"Memory, tools & tool-calling",brief:"Add conversation memory and let the model call tools/functions.",link:GH_LC,timing:"1:20–2:00"},
  {title:"LangGraph basics — state, nodes, edges",brief:"Model an app as a graph: state, nodes and edges; run your first graph.",link:GH_LG,timing:"2:00–2:40"},
  {title:"LangGraph — conditional edges, cycles, checkpoints",brief:"Branching, loops and persistence so agents can reason over multiple steps.",link:GH_LG,timing:"2:40–3:20"},
  {title:"Building agents with LangGraph (ReAct)",brief:"Assemble a tool-using ReAct agent with LangGraph.",link:GH_LG,timing:"3:20–4:00"},
  {title:"RAG fundamentals — loaders & chunking",brief:"Document loaders and text splitting/chunking for retrieval.",link:GH_RAG,timing:"4:00–4:40"},
  {title:"Embeddings & vector stores",brief:"Turn chunks into embeddings and store/query them in a vector DB.",link:GH_RAG,timing:"4:40–5:20"},
  {title:"Retrievers & full RAG pipeline",brief:"Wire retriever + LLM into an end-to-end RAG question-answering chain.",link:GH_RAG,timing:"5:20–6:00"},
  {title:"Vectorless RAG",brief:"Retrieval without a vector database — when and how to use it.",link:GH_RAG,timing:"6:00–6:40"},
  {title:"Deep Agents (planning / multi-step)",brief:"Deep/multi-agent patterns for complex planning tasks.",link:GH_LG,timing:"6:40–7:20"},
  {title:"Guardrails",brief:"Add input/output guardrails for safe, reliable LLM apps.",link:GH_GUARD,timing:"7:20–8:00"},
  {title:"LLM Evaluation",brief:"Evaluate RAG/agent quality — metrics and running evals.",link:GH_EVAL,timing:"8:00–8:40"},
  {title:"LLM Gateways & putting it together",brief:"Gateways/routing and integrating everything into one app.",link:GH_ROAD,timing:"8:40–9:20"},
  {title:"Capstone project & review",brief:"Build a small end-to-end agentic RAG app and review the whole course.",link:GH_ROAD,timing:"9:20–10:00"},
];
export const SD_VIDEO="https://www.youtube.com/watch?v=Vnm-ycSfJx4";
export const SD_DOCS="https://docs.telusko.com/docs/system-design/getting-started";
export const SYSDESIGN_COURSE=[
  {title:"What is System Design",brief:"What system design is, why it matters, and functional vs non-functional requirements."},
  {title:"Scalability - Vertical vs Horizontal",brief:"Scaling up one machine vs scaling out to many; why stateless services scale."},
  {title:"Load Balancing",brief:"Spreading traffic across servers; algorithms, health checks, L4 vs L7."},
  {title:"Caching",brief:"Cache layers, hit/miss, eviction (LRU/LFU/TTL), and write strategies."},
  {title:"CDN & Content Delivery",brief:"Edge servers that serve static content near users; invalidation & TTLs."},
  {title:"SQL vs NoSQL Databases",brief:"Relational vs document/key-value/wide-column/graph; choosing by access pattern."},
  {title:"Database Replication",brief:"Leader-follower, async vs sync, failover, and read replicas."},
  {title:"Sharding / Partitioning",brief:"Splitting data by a shard key; strategies and hotspots."},
  {title:"Indexing",brief:"B-tree indexes to speed reads; the write/storage trade-off."},
  {title:"CAP Theorem & Consistency",brief:"Consistency vs availability under partitions; strong vs eventual."},
  {title:"Message Queues & Async",brief:"Decoupling with Kafka/RabbitMQ/SQS; pub/sub and idempotency."},
  {title:"Rate Limiting",brief:"Token/leaky bucket, sliding window, 429s, Redis counters."},
  {title:"Consistent Hashing",brief:"Hash ring + virtual nodes so scaling moves little data."},
  {title:"Monolith vs Microservices",brief:"Architecture trade-offs; data ownership and when to split."},
  {title:"API Design & Gateway",brief:"REST design, versioning, pagination, and the API gateway's role."},
  {title:"Proxies - Forward & Reverse",brief:"Forward vs reverse proxies; TLS, caching, load balancing."},
  {title:"Blob / Object Storage",brief:"Storing large files (S3/GCS); metadata in DB, presigned URLs, CDN."},
  {title:"Search - Elasticsearch",brief:"Inverted index, full-text search, keeping the index in sync."},
  {title:"Reliability & Observability",brief:"Monitoring/logging/tracing; retries, timeouts, circuit breakers, SLOs."},
  {title:"Case Study & Review",brief:"End-to-end design (e.g. URL shortener); bottlenecks and full review."},
];
export const DSA_BOOK="📘 Data Structures Through C in Depth — S. K. Srivastava & Deepali Srivastava (BPB). Find the book: https://www.google.com/search?q=Data+Structures+Through+C+in+Depth+Srivastava";
// 45-day plan mapped to the book "Data Structures Through C in Depth" (S.K. & Deepali Srivastava).
// Each day: read = book section + page range; steps = elaborate read → trace → code(C) → test → complexity.
export const dstep=(read:string,concepts:string,code:string,test:string,extra:string)=>[
  {time:"20 min",task:`Read ${read} — focus on: ${concepts}. Underline definitions and every diagram (the book is in C — read for the concept, you'll code it in Python).`},
  {time:"10 min",task:`Dry-run on paper: ${test}. Trace the references/indexes step by step before coding.`},
  {time:"40 min",task:`Code in Python from scratch: ${code}. Use classes & lists (no pointers needed); run it and fix errors.`},
  {time:"15 min",task:`Test with your own input, then note the time & space complexity. ${extra}`},
  {time:"5 min",task:"Write 3-line notes in your own words and commit the .py file with the day number."},
];
export const DSA_COURSE=[
  {title:"Ch1 · Introduction to Data Structures",read:"Ch1 §1.1–1.6 · pp 1–9",brief:"Data types, abstract data types (ADT), data structures, algorithms and how we measure efficiency (time/space).",plan:dstep("Ch1 §1.1–1.6 · pp 1–9","ADT vs data structure, primitive vs non-primitive, algorithm characteristics, Big-O intuition","a program that computes and prints the growth of n, n log n, n², 2ⁿ for n=1..20 in a table","compare which term dominates as n grows","Practice: classify 5 everyday operations by their Big-O.")},
  {title:"Ch2 · Arrays (1-D & 2-D)",read:"Ch2 §2.1 · pp 10–17",brief:"1-D and 2-D arrays: declaration, accessing, processing, initialization and passing arrays to functions.",plan:dstep("Ch2 §2.1 · pp 10–17","row-major storage, address calculation, passing whole array vs element","functions to (a) find max/min, (b) reverse an array in place, (c) transpose a 2-D matrix","reverse {5,2,9,1,7} and transpose a 3×3 matrix","Practice: address of a[i][j] given base address & size.")},
  {title:"Ch2 · Pointers (→ Python references)",read:"Ch2 §2.2 · pp 18–27",brief:"C pointers, dereferencing, pointer & array duality — mapped to how Python names/references and mutability work.",plan:dstep("Ch2 §2.2 · pp 18–27","in C: *, &, pointer arithmetic; in Python: names bind to objects, mutable vs immutable, id()","a function that mutates a list in place (Python's 'reference' behaviour) and one that index-walks a list to sum it","mutate a list inside a function; sum a list with a manual index loop","Practice: why does reassigning inside a function NOT change the caller's int, but list.append() does?")},
  {title:"Ch2 · Dynamic arrays (C malloc → Python lists)",read:"Ch2 §2.3 · pp 27–34",brief:"C dynamic allocation (malloc/realloc/free) and how Python's list handles the same growth automatically.",plan:dstep("Ch2 §2.3 · pp 27–34","in C: heap, sizeof, free; in Python: list over-allocation & amortized append","a DynamicArray class (fixed-capacity list that doubles capacity on overflow, like the book's realloc)","append 10 items and print each capacity doubling","Practice: why is append amortized O(1) even though resizing is O(n)?")},
  {title:"Ch2 · Structures (C struct → Python class)",read:"Ch2 §2.4 · pp 34–47",brief:"C structures and arrays of structures, expressed as Python classes / dataclasses and lists of objects.",plan:dstep("Ch2 §2.4 · pp 34–47","struct fields → class attributes, array of struct → list of objects, self-referential preview (Node)","a Student class (name, roll, marks) and a list of 5 with add & print functions","find the topper among 5 students","Practice: why do linked-list nodes need a reference to another node of the same type?")},
  {title:"Ch3 · Single Linked List — build & traverse",read:"Ch3 §3.1.1–3.1.4 · pp 48–58",brief:"Node design, creating a list, traversing and searching a single linked list.",plan:dstep("Ch3 §3.1.1–3.1.4 · pp 48–58","Node(data, next), head reference, None termination","a Node class + create(), traverse()/print(), search(key)","build 1→2→3→4 and print it; search for 3","Practice: why is traversal O(n) and access not O(1)?")},
  {title:"Ch3 · Single Linked List — insert/delete/reverse",read:"Ch3 §3.1.3–3.1.6 · pp 53–62",brief:"Insertion at beginning/end/position, deletion by value/position, and reversing the list.",plan:dstep("Ch3 §3.1.3–3.1.6 · pp 53–62","re-linking order, handling head, freeing deleted nodes","insertBegin/insertEnd/insertAt, deleteNode, reverse()","insert at pos 3, delete value 2, reverse the whole list","Practice: draw the pointer moves for reversing 1→2→3.")},
  {title:"Ch3 · Doubly Linked List",read:"Ch3 §3.2 · pp 63–72",brief:"Doubly linked list: prev/next design, creation, traversal, insertion, deletion, reversal.",plan:dstep("Ch3 §3.2 · pp 63–72","two links per node, forward & backward traversal","dll with insertFront/insertEnd/delete and both-direction print","insert 3 nodes, delete the middle, print forward & backward","Practice: how many pointers change on a middle deletion?")},
  {title:"Ch3 · Circular Linked List",read:"Ch3 §3.3–3.4 · pp 72–83",brief:"Circular linked list traversal, insertion, creation, deletion; list with a header node.",plan:dstep("Ch3 §3.3–3.4 · pp 72–83","last→first link, stopping condition, header/sentinel node","circular list with insert/delete and a safe traversal that stops at head","build a 4-node circle, delete one node, traverse once","Practice: why is a circular list handy for round-robin?")},
  {title:"Ch3 · Sorted & Sorting a Linked List",read:"Ch3 §3.5–3.6 · pp 83–98",brief:"Maintaining a sorted linked list; selection & bubble sort on a list by exchanging data and by rearranging links.",plan:dstep("Ch3 §3.5–3.6 · pp 83–98","sorted insert, sort by data vs by relinking","sortedInsert() and bubbleSort-by-links on a linked list","insert into a sorted list; sort 4→1→3→2 by relinking","Practice: which is cheaper — swapping data or relinking? Why?")},
  {title:"Ch3 · Polynomials with Linked Lists",read:"Ch3 §3.9–3.10 · pp 98–107",brief:"Represent and add polynomials using linked lists; array-list vs linked-list trade-offs.",plan:dstep("Ch3 §3.9–3.10 · pp 98–107","term{coeff,exp,next}, merging by exponent","create two polynomials and add them into a third list","add 3x²+2x+5 and 4x²+x","Practice: list 2 advantages and 2 disadvantages of linked lists.")},
  {title:"Ch4 · Stack (array & linked)",read:"Ch4 §4.1 · pp 108–113",brief:"Stack ADT (LIFO): array implementation and linked-list implementation with push/pop/peek.",plan:dstep("Ch4 §4.1 · pp 108–113","top pointer, overflow/underflow, LIFO","stack both ways: array-based and linked-list-based with push/pop/peek/isEmpty","push 1,2,3 then pop all; test overflow on a size-3 array stack","Practice: give 3 real uses of a stack.")},
  {title:"Ch4 · Queue & Circular Queue",read:"Ch4 §4.2–4.3 · pp 114–123",brief:"Queue ADT (FIFO): array & linked implementations; the circular queue to reuse space.",plan:dstep("Ch4 §4.2–4.3 · pp 114–123","front/rear, wrap-around with modulo, full vs empty","a linear queue and a circular queue with enqueue/dequeue","fill & wrap a size-5 circular queue; show it detects full","Practice: why does a plain array queue waste space?")},
  {title:"Ch4 · Deque & Priority Queue",read:"Ch4 §4.4–4.5 · pp 123–139",brief:"Double-ended queue (deque) operations and a simple priority queue.",plan:dstep("Ch4 §4.4–4.5 · pp 123–139","insert/delete at both ends, priority ordering","a deque (both-end insert/delete) and a priority queue by insertion order","run a sequence of both-end operations; dequeue by priority","Practice: how is a priority queue different from a normal queue?")},
  {title:"Ch4 · Expression Conversion (infix→postfix)",read:"Ch4 §4.6 · pp 139–146",brief:"Convert infix to postfix/prefix using a stack; evaluate a postfix expression.",plan:dstep("Ch4 §4.6 · pp 139–146","operator precedence, associativity, stack of operators","infixToPostfix() and evalPostfix() using your stack","convert a*b+c and (a+b)*c; evaluate 2 3 + 4 *","Practice: convert (a+b)*(c-d) by hand, then check with code.")},
  {title:"Ch5 · Recursion — fundamentals",read:"Ch5 §5.1–5.4 · pp 147–162",brief:"How recursion works, the call stack, and classic examples: factorial, GCD, Fibonacci, Towers of Hanoi.",plan:dstep("Ch5 §5.1–5.4 · pp 147–162","base case, recursive case, stack frames","recursive factorial, gcd, fibonacci and Towers of Hanoi","trace Hanoi for 3 disks; print each move","Practice: draw the call tree for fib(5).")},
  {title:"Ch5 · Recursion on strings & lists",read:"Ch5 §5.5 · pp 163–166",brief:"Recursion over strings and linked lists; how recursion is implemented with a stack.",plan:dstep("Ch5 §5.5 · pp 163–166","recursion unwinding, implicit stack","recursively reverse a string and print a linked list in reverse","reverse \"hello\"; print 1→2→3 backwards","Practice: rewrite one of these iteratively with an explicit stack.")},
  {title:"Ch5 · Recursion vs Iteration & tail recursion",read:"Ch5 §5.6–5.9 · pp 166–175",brief:"Recursion vs iteration trade-offs, tail recursion, and direct vs indirect recursion.",plan:dstep("Ch5 §5.6–5.9 · pp 166–175","tail call, converting recursion↔iteration, overhead","a tail-recursive factorial and its iterative twin; an indirect-recursion example","compare both factorials; verify same result","Practice: when is iteration better than recursion?")},
  {title:"Ch6 · Trees — terminology & representation",read:"Ch6 §6.1–6.8 · pp 176–185",brief:"Tree terms, binary/strict/complete/full trees, and array vs linked memory representation.",plan:dstep("Ch6 §6.1–6.8 · pp 176–185","root/leaf/height/level, complete vs full, 2i/2i+1 array mapping","a binary tree node struct and build a small tree by hand in code","build a 7-node tree; store it in an array too","Practice: for a complete tree in an array, find children of index i.")},
  {title:"Ch6 · Binary Tree Traversals (recursive)",read:"Ch6 §6.9 · pp 186–188",brief:"Recursive inorder, preorder and postorder traversals of a binary tree.",plan:dstep("Ch6 §6.9 · pp 186–188","visit order for in/pre/post, left-root-right","recursive inorder/preorder/postorder printers","traverse your 7-node tree all three ways","Practice: from a drawing, write all three traversals by hand.")},
  {title:"Ch6 · Non-recursive traversal & tree building",read:"Ch6 §6.9.1–6.11 · pp 188–201",brief:"Iterative traversals using a stack; build a tree from inorder+preorder; height; expression trees.",plan:dstep("Ch6 §6.9.1–6.11 · pp 188–201","explicit stack traversal, unique reconstruction, height","iterative inorder with a stack and a height() function","reconstruct a tree from given inorder+preorder; compute its height","Practice: why do you need TWO traversals to rebuild a tree?")},
  {title:"Ch6 · Binary Search Tree — search & insert",read:"Ch6 §6.12.1–6.12.4 · pp 202–207",brief:"BST property, traversal gives sorted order, searching and insertion.",plan:dstep("Ch6 §6.12.1–6.12.4 · pp 202–207","left<root<right, O(h) search, insert as a leaf","BST insert() and search(); inorder to prove it's sorted","insert 50,30,70,20,40; search 40; print inorder","Practice: what makes a BST degrade to O(n)?")},
  {title:"Ch6 · BST — deletion (all cases)",read:"Ch6 §6.12.5 · pp 208–214",brief:"Deleting a BST node: leaf, one child, and two children (inorder successor).",plan:dstep("Ch6 §6.12.5 · pp 208–214","three deletion cases, inorder successor/predecessor","BST delete() handling all three cases","delete a leaf, a one-child node, and the root (two children)","Practice: why replace with the inorder successor, not any node?")},
  {title:"Ch6 · Threaded Binary Trees",read:"Ch6 §6.13 · pp 214–224",brief:"Threaded trees for stackless traversal: inorder successor/predecessor, insertion & deletion.",plan:dstep("Ch6 §6.13 · pp 214–224","threads replace NULL links, in-threaded tree","an in-threaded BST with a stackless inorder traversal","traverse an in-threaded tree without recursion/stack","Practice: what problem do threads solve vs plain BST?")},
  {title:"Ch6 · AVL Trees — rotations & insertion",read:"Ch6 §6.14.1–6.14.3 · pp 225–247",brief:"Self-balancing AVL trees: balance factor and LL, RR, LR, RL rotations on insertion.",plan:dstep("Ch6 §6.14.1–6.14.3 · pp 225–247","balance factor, 4 rotation cases","AVL insert() with rotations and a height/balance helper","insert 10,20,30 (RR), then 30,20,10 (LL), then a LR case","Practice: identify the rotation for each imbalance by hand.")},
  {title:"Ch6 · AVL deletion & Red-Black intro",read:"Ch6 §6.14.4–6.15.1 · pp 248–260",brief:"AVL deletion with rebalancing; introduction to red-black trees and their properties.",plan:dstep("Ch6 §6.14.4–6.15.1 · pp 248–260","rebalance on delete, RB color rules","AVL delete() with rebalancing; note the 5 red-black properties","delete from your AVL and re-verify balance factors","Practice: list the red-black properties from memory.")},
  {title:"Ch6 · Red-Black Trees",read:"Ch6 §6.15 · pp 258–277",brief:"Red-black tree search, insertion and deletion fix-ups (recoloring + rotations).",plan:dstep("Ch6 §6.15 · pp 258–277","recolor vs rotate, uncle cases","an RB insert with fix-up (recolor/rotate)","insert a few keys and verify no red-red violation","Practice: compare AVL vs Red-Black on insert cost.")},
  {title:"Ch6 · Heaps, Heap Sort & Priority Queue",read:"Ch6 §6.16 · pp 277–286",brief:"Max/min heap, insert (sift-up), delete (sift-down), build-heap, heap sort and priority queue.",plan:dstep("Ch6 §6.16 · pp 277–286","heap property, sift-up/down, array heap","a max-heap with insert, deleteMax, buildHeap and heapSort","build a heap from {4,10,3,5,1}; heap-sort it","Practice: implement a priority queue on top of the heap.")},
  {title:"Ch6 · Huffman & B-Trees",read:"Ch6 §6.18–6.21 · pp 287–318",brief:"Huffman coding tree; B-tree order, search, insertion and deletion for disk-friendly indexing.",plan:dstep("Ch6 §6.18–6.21 · pp 287–318","greedy Huffman merge, B-tree splits/merges","a Huffman tree from character frequencies; hand-trace a B-tree insert","build Huffman codes for a small text; split a full B-tree node","Practice: why do databases use B-trees not BSTs?")},
  {title:"Ch6 · B+ Trees & Digital Search Trees",read:"Ch6 §6.22–6.23 · pp 318–325",brief:"B+ tree (data in leaves, linked leaves) and digital/trie-style search trees.",plan:dstep("Ch6 §6.22–6.23 · pp 318–325","B+ leaf chaining vs B-tree, trie idea","a small B+ tree search by hand and a simple trie insert/search in C","search a range in a B+ tree; insert words into a trie","Practice: why are B+ leaves linked?")},
  {title:"Ch7 · Graphs — terminology & spanning trees",read:"Ch7 §7.1–7.8 · pp 326–334",brief:"Directed/undirected graphs, connectivity, biconnected/strongly-connected, trees and spanning trees.",plan:dstep("Ch7 §7.1–7.8 · pp 326–334","degree, path, cycle, connected components","code the graph vocabulary as comments and draw 3 sample graphs","classify 3 graphs (connected? directed? cyclic?)","Practice: define spanning tree vs minimum spanning tree.")},
  {title:"Ch7 · Graph Representations",read:"Ch7 §7.10–7.11 · pp 335–352",brief:"Adjacency matrix and adjacency list representations; transitive closure & path matrix (Warshall).",plan:dstep("Ch7 §7.10–7.11 · pp 335–352","matrix vs list trade-offs, Warshall's closure","a graph as both adjacency matrix and list; Warshall transitive closure","store a 5-node graph both ways; compute its path matrix","Practice: when is a list better than a matrix?")},
  {title:"Ch7 · Breadth First Search (BFS)",read:"Ch7 §7.12.1 · pp 353–363",brief:"BFS traversal implemented with a queue; level-order exploration and shortest hops.",plan:dstep("Ch7 §7.12.1 · pp 353–363","visited[] array, queue frontier, level order","BFS() using your queue on an adjacency list","BFS from node 0 on a 6-node graph; print visit order","Practice: how does BFS give shortest path in an unweighted graph?")},
  {title:"Ch7 · Depth First Search & Components",read:"Ch7 §7.12.2 · pp 364–397",brief:"DFS (recursive and stack-based); connected components and strongly-connected components.",plan:dstep("Ch7 §7.12.2 · pp 364–397","recursion/stack, back edges, SCC idea","recursive DFS and stack-based DFS; count connected components","DFS from node 0; count components in a disconnected graph","Practice: contrast BFS vs DFS use-cases.")},
  {title:"Ch7 · Minimum Spanning Tree",read:"Ch7 §7.14 · pp 398–409",brief:"Minimum spanning tree via Prim's and Kruskal's algorithms.",plan:dstep("Ch7 §7.14 · pp 398–409","cut property, union-find for Kruskal","Prim's (from a start node) and Kruskal's (with union-find)","find the MST of a small weighted graph both ways","Practice: which is better for dense vs sparse graphs?")},
  {title:"Ch7 · Topological Sorting",read:"Ch7 §7.15 · pp 410–416",brief:"Topological ordering of a DAG using in-degrees (Kahn) or DFS finish times.",plan:dstep("Ch7 §7.15 · pp 410–416","DAG, in-degree, ordering constraints","topological sort via in-degree + queue","order a 6-task dependency DAG","Practice: what breaks topological sort? (a cycle)")},
  {title:"Ch8 · Selection & Bubble Sort",read:"Ch8 §8.1–8.9 · pp 417–427",brief:"Sorting basics (stability, in-place), selection sort and bubble sort with full analysis.",plan:dstep("Ch8 §8.1–8.9 · pp 417–427","stability, in-place, best/worst/avg case","selection sort and bubble sort with a swap counter","sort {5,2,9,1,7}; count comparisons & swaps","Practice: which is stable? Which stops early on sorted input?")},
  {title:"Ch8 · Insertion & Shell Sort",read:"Ch8 §8.10–8.11 · pp 427–434",brief:"Insertion sort and Shell sort (diminishing increment) with analysis.",plan:dstep("Ch8 §8.10–8.11 · pp 427–434","shifting, gap sequence in Shell","insertion sort and Shell sort","sort the same array; try gaps 4,2,1 in Shell","Practice: why is insertion sort great for nearly-sorted data?")},
  {title:"Ch8 · Merge Sort",read:"Ch8 §8.12 · pp 434–444",brief:"Merge sort: top-down recursive, bottom-up iterative, and merge sort for linked lists.",plan:dstep("Ch8 §8.12 · pp 434–444","divide-merge, stable O(n log n), extra space","recursive merge sort and the merge() routine","sort {8,3,5,1,9,2}; watch the recursion split/merge","Practice: why is merge sort preferred for linked lists?")},
  {title:"Ch8 · Quick Sort & Binary Tree Sort",read:"Ch8 §8.13–8.14 · pp 444–454",brief:"Quick sort (partition, pivot choice, analysis) and binary-tree sort.",plan:dstep("Ch8 §8.13–8.14 · pp 444–454","partition, pivot, worst case O(n²)","quick sort with Lomuto/Hoare partition; a BST-based sort","sort a random array; force the worst case (sorted input)","Practice: how does a good pivot avoid O(n²)?")},
  {title:"Ch8 · Heap Sort & Radix Sort",read:"Ch8 §8.15–8.17 · pp 454–471",brief:"Heap sort revisited and non-comparison sorts: radix / address-calculation sort.",plan:dstep("Ch8 §8.15–8.17 · pp 454–471","in-place heap sort, digit buckets in radix","heap sort in place and a radix sort for integers","heap-sort {4,10,3,5,1}; radix-sort {329,457,657,839}","Practice: when can radix sort beat O(n log n)?")},
  {title:"Ch9 · Searching & Hash Functions",read:"Ch9 §9.1–9.3.1 · pp 472–479",brief:"Linear and binary search; hashing idea and hash functions (truncation, mid-square, folding).",plan:dstep("Ch9 §9.1–9.3.1 · pp 472–479","O(log n) binary search, hash function goals","linear & binary search and a small hash table with a mid-square hash","binary-search a sorted array; hash 10 keys and show collisions","Practice: what makes a good hash function?")},
  {title:"Ch9 · Collision Resolution & Hashing",read:"Ch9 §9.3.2–9.3.3 · pp 480–491",brief:"Open addressing (linear/quadratic/double), separate chaining and bucket hashing.",plan:dstep("Ch9 §9.3.2–9.3.3 · pp 480–491","probing sequences, load factor, chaining","a hash table with linear probing AND one with separate chaining","insert keys that collide; compare probing vs chaining","Practice: how does load factor affect performance?")},
  {title:"Ch10 · Storage Management + Review",read:"Ch10 §10.1–10.7 · pp 492–508",brief:"Memory allocation (first/best/worst fit), fragmentation, boundary tag, buddy systems, compaction & garbage collection — then review the whole book.",plan:dstep("Ch10 §10.1–10.7 · pp 492–508","fit strategies, fragmentation, buddy system, mark-and-sweep GC","a simple first-fit allocator over a fixed memory block","allocate & free a few blocks; observe fragmentation","Review: skim every chapter's summary and re-code your weakest data structure.")},
];
export function courseStart(){ let s=LS("pos_course_start",""); if(!s){ s=dstrD(new Date()); SS("pos_course_start",s); } const [y,m,d]=String(s).split("-").map(Number); const dt=new Date(y,m-1,d); dt.setHours(0,0,0,0); return dt; }
export function seedAllCourses(start?:Date, overwrite:boolean=true){
  const s0=start||courseStart(); const fmt=(m:number)=>`${Math.floor(m/60)}:${String(m%60).padStart(2,"0")}`;
  const setDay=(cid:string,i:number,rec:any)=>{ const d=new Date(s0); d.setDate(d.getDate()+i); const ds=dstrD(d); const key=planKey(ds); const cur:any=LS(key,{}); const base=Array.isArray(cur.studyList)?cur.studyList:[]; if(!overwrite && base.some((x:any)=>x.courseId===cid)) return; const list=base.filter((x:any)=>x.courseId!==cid); list.push(rec); SS(key,{...cur,studyList:list}); };
  if(overwrite){ purgeCourse("agentic"); purgeCourse("sysdesign"); purgeCourse("dsa"); }
  AGENTIC_COURSE.forEach((day:any,i:number)=>{ const [mm,ss]=day.timing.replace("–","-").split("-")[0].split(":"); const sec=(+mm)*60+(+ss||0);
    setDay("agentic",i,{ id:uid(), courseId:"agentic", label:`Day ${i+1}: ${day.title}`, hours:"1.5", brief:day.brief, resource:day.link, pdf:`/course/day-${String(i+1).padStart(2,"0")}.pdf`, video:`▶ ${day.timing} of the 10h video`, courseVideo:`${YT}&t=${sec}s`, plan:[{time:"40 min",task:`Watch the course video ${day.timing} — ${day.title}`},{time:"40 min",task:"Code along in the GitHub notebook / build the example"},{time:"10 min",task:"Write notes & commit your code"}], next:[] }); });
  SYSDESIGN_COURSE.forEach((day:any,i:number)=>{ const startMin=i*15; const timing=`${fmt(startMin)}-${fmt(startMin+15)}`; const sec=startMin*60;
    setDay("sysdesign",i,{ id:uid(), courseId:"sysdesign", label:`SD Day ${i+1}: ${day.title}`, hours:"1.5", brief:day.brief, resource:SD_DOCS, pdf:`/course/sd-day-${String(i+1).padStart(2,"0")}.pdf`, video:`▶ ${timing} of the 5h video`, courseVideo:`${SD_VIDEO}&t=${sec}s`, plan:[{time:"25 min",task:`Watch the course video ${timing} — ${day.title}`},{time:"45 min",task:"Read the PDF notes + Telusko docs; draw the architecture diagram"},{time:"20 min",task:"Write your own notes"}], next:[] }); });
  DSA_COURSE.forEach((day:any,i:number)=>{
    setDay("dsa",i,{ id:uid(), courseId:"dsa", label:`DSA Day ${i+1}: ${day.title}`, hours:"1.5", brief:`${day.brief}  📖 Book: ${day.read}`, resource:`${DSA_BOOK}  ·  Today: ${day.read}`, pdf:`/course/dsa-day-${String(i+1).padStart(2,"0")}.pdf`, video:`📖 Read from "Data Structures Through C in Depth" (Srivastava) — ${day.read}`, courseVideo:"https://www.google.com/search?q=Data+Structures+Through+C+in+Depth+Srivastava", plan:day.plan||[], next:[] }); });
}
