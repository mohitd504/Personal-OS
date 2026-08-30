"use client";

import { useMemo, useState } from "react";

type Lesson = {
  id: string; eyebrow: string; title: string; summary: string; time: string;
  sections: { title: string; body: string; points?: string[]; example?: string; pitfall?: string; note?: string }[];
};

const lessons: Lesson[] = [
  { id:"scaling", eyebrow:"Class 01 · Foundations", title:"Scale the Alien Bank", time:"12 min", summary:"Turn one overloaded cash counter into a scalable system—and learn what every change is called in software.", sections:[
    {title:"Start with the bottleneck",body:"One cashier needs 10 minutes per customer. In software, the cashier is a server, the customer is a request, and the waiting time is latency.",points:["Train the cashier → optimize the code","Use a cash-counting machine → upgrade hardware","Prepare a withdrawal slip early → pre-process or cache work"]},
    {title:"Vertical scaling",body:"Make one server stronger: add CPU or memory, improve the algorithm, or use better tools. It is simple because the architecture barely changes, and it works well when one machine is still affordable. However, hardware upgrades become increasingly expensive and every machine eventually reaches a physical ceiling.",example:"A database query takes 800 ms. Adding an index reduces it to 40 ms without adding another server. That is optimization; moving the database to a larger machine is vertical scaling.",pitfall:"A larger server can still fail. Capacity improves, but redundancy does not.",note:"Think: scale UP."},
    {title:"Horizontal scaling",body:"Add more counters—or servers—and serve requests in parallel. A load balancer checks availability and chooses a healthy server using a routing strategy such as round-robin or least connections. Stateless servers are easiest to scale because any instance can handle any request.",points:["Higher throughput as servers are added","Failure isolation when one instance crashes","Rolling deployments without stopping the whole service","Requires coordination for sessions and shared state"],example:"At 100 requests per second, one server is overloaded. Four identical servers behind a load balancer can share the traffic at roughly 25 requests per second each.",pitfall:"Four servers do not automatically provide four times the capacity; the database or network may become the next bottleneck.",note:"Think: scale OUT."},
    {title:"The shared truth problem",body:"Multiple counters can disagree about a balance if each keeps private records. A shared database creates one authoritative source of truth. Transactions help related updates succeed or fail together, while constraints prevent invalid data. The shared database then needs backups, replicas, careful connection limits, and possibly sharding as traffic grows.",example:"Two withdrawals read the same ₹1,000 balance at once. Without transaction control, both may approve ₹800. Correct concurrency handling prevents the account from becoming invalid.",pitfall:"Centralized truth simplifies consistency but may introduce a single point of failure if it has no redundancy."}
  ]},
  { id:"building-blocks", eyebrow:"Class 01 · Architecture", title:"Core Building Blocks", time:"14 min", summary:"Follow a request through clients, servers, caches, queues, databases, monitoring, and logs.", sections:[
    {title:"The basic request path",body:"A user acts in a client. The client sends an HTTP request to application code. The server applies business rules and reads or writes the database.",points:["Client → experience and input","Server → logic and security","Database → durable state"]},
    {title:"Cache before database",body:"A cache keeps frequently requested results in fast memory. On a cache hit, the server answers without querying the database. On a miss, it reads the database and stores the result with an expiry time. This common cache-aside pattern makes repeated reads fast while keeping the database as the durable source of truth.",example:"A product page is read 50,000 times but updated twice a day. Caching its description and price for a short period removes thousands of repeated database reads.",pitfall:"Never assume cached data is current. Decide how entries expire or are invalidated when the underlying record changes.",note:"Caching improves latency and reduces database load, but stale data and invalidation need deliberate handling."},
    {title:"Queues remove waiting",body:"A message queue lets a server record work and respond before slow background tasks finish. For an order, inventory may update now while email and delivery workflows run asynchronously.",points:["Producer adds a message","Broker stores and routes it","Workers process it safely, often with retries"]},
    {title:"Monitoring vs logs",body:"Monitoring aggregates metrics such as latency, request rate, errors, CPU, and queue depth, then alerts when thresholds or trends are unhealthy. Logs preserve timestamped events and context for investigation. Distributed traces connect every service call made by one request so engineers can locate the slow or failing step.",example:"An alert says checkout errors rose to 8%. A trace shows the payment call is slow, and its logs reveal a provider timeout. Metrics detect, traces locate, and logs explain.",pitfall:"Collecting data without useful dashboards, retention rules, or actionable alerts creates noise rather than observability."}
  ]},
  { id:"workloads", eyebrow:"Class 01 · Trade-offs", title:"Data vs Compute Intensive", time:"11 min", summary:"Find the real bottleneck, then choose the scaling strategy that matches it.", sections:[
    {title:"Data-intensive systems",body:"The hard part is storing, moving, and reading large or fast-changing data. Instagram, WhatsApp, banking, and analytics fit this model.",points:["Cache hot feeds","Replicate data for read scale and resilience","Shard by a stable key to spread volume","Use a CDN to serve media near users"]},
    {title:"Instagram read path",body:"Static media comes from a nearby CDN. Dynamic requests reach a load balancer, then an app server. The server checks cache, reads from a replica on a miss, and sends writes to the primary shard."},
    {title:"Compute-intensive systems",body:"The hard part is CPU or GPU processing: video encoding, ML training, simulations, cryptography, and rendering.",points:["Queue heavy jobs","Split work into parallel units","Add worker machines","Store results and notify the user"],note:"Adding workers increases throughput without blocking the interactive request."}
  ]},
  { id:"requirements", eyebrow:"Class 02 · Discovery", title:"Requirements Before Architecture", time:"13 min", summary:"Define what the system must do and how well it must do it before choosing technology.", sections:[
    {title:"Functional requirements",body:"These are user-visible capabilities: register, search products, apply a coupon, pay, and track an order. They define behavior and scope."},
    {title:"Non-functional requirements",body:"These are measurable quality targets and constraints.",points:["Scalability: handle growth and 10× spikes","Performance: p95 under 200 ms at 10,000 requests/second","Availability: 99.9% in a defined window","Security: encryption, authentication, authorization","Reliability, durability, maintainability, observability"]},
    {title:"Terms that sound similar",body:"Availability asks whether the service can be reached. Reliability asks whether it continues producing correct results. Fault tolerance asks whether it operates when a component fails. Durability asks whether accepted data survives failures."},
    {title:"Identity and permission",body:"Authentication answers “Who are you?” Authorization answers “What may you do?” Signing in proves identity; a policy deciding whether you can refund another user controls permission.",note:"Interview habit: clarify scope, scale, workload, and priorities before drawing boxes."}
  ]},
  { id:"dns", eyebrow:"Class 02 · Internet", title:"DNS: Name to Address", time:"10 min", summary:"Trace a domain from the browser cache through the global DNS hierarchy to an IP address.", sections:[
    {title:"The lookup chain",body:"The browser and operating system check local caches first. If no usable answer exists, a recursive resolver performs the work for the client. It asks a root server where to find the relevant top-level domain, asks the TLD server where the domain is hosted, then asks the authoritative server for the record. The resolver returns the IP and caches it for the record's TTL.",example:"For shop.example.com, the resolver may receive an A record such as 203.0.113.10, after which the browser can establish a network connection to that address.",pitfall:"DNS locates a service; it does not fetch the web page. HTTP or another application protocol begins after name resolution."},
    {title:"Why it is distributed",body:"One global list would be too large, slow, and fragile. DNS divides authority across zones and caches answers at several layers."},
    {title:"Root servers and anycast",body:"There are 13 named logical root identities, A through M—not only 13 physical computers. Anycast routes each identity across many instances worldwide."},
    {title:"Records to know",body:"A maps to IPv4, AAAA to IPv6, CNAME creates an alias, MX routes mail, TXT stores verification text, and NS identifies authoritative name servers.",note:"Subdomains such as api.example.com can live in the same zone or be delegated to another one."}
  ]},
  { id:"api", eyebrow:"Class 02 · Interfaces", title:"APIs, Endpoints & Gateways", time:"14 min", summary:"Understand the contract between frontend and backend, then route and protect incoming requests.", sections:[
    {title:"API and endpoint",body:"An API is a contract between software components. An endpoint is one exposed operation—usually an HTTP method plus a path.",points:["GET /products/42 → retrieve product 42","POST /orders → create an order","PATCH /orders/123 → update part of an order","DELETE /cart/items/7 → remove an item"]},
    {title:"Why relationships belong in URLs",body:"GET /blogs/42/comments expresses that comments are a collection belonging to blog 42. URLs identify resources; request bodies carry representations or changes. GET bodies are poorly supported by caches and intermediaries, so identity and filtering normally live in the path or query string."},
    {title:"Gateway roles",body:"A load balancer distributes traffic. An API gateway adds API policies such as authentication, rate limits, and request transformation. An application gateway routes layer-7 traffic and may terminate TLS or apply firewall rules.",note:"Real products often combine these roles, so describe responsibilities rather than trusting the label alone."}
  ]},
  { id:"styles", eyebrow:"Class 02 · Communication", title:"Choose an API Style", time:"16 min", summary:"Compare REST, SOAP, GraphQL, gRPC, and WebSockets by contract, latency, flexibility, and connection model.", sections:[
    {title:"REST",body:"Models resources over HTTP, uses standard methods, and usually keeps requests self-contained. JSON is common because it maps naturally to objects, arrays, strings, numbers, booleans, and null—but REST does not require JSON."},
    {title:"SOAP and XML",body:"SOAP uses structured XML envelopes and formal contracts. It is verbose, but established WS-* standards can matter in legacy enterprise integrations. XML also supports namespaces and document-oriented markup."},
    {title:"GraphQL and gRPC",body:"GraphQL lets clients request exactly the fields they need through a typed schema; protect it with authorization and query-cost limits. gRPC uses compact Protocol Buffers and is excellent for strongly typed internal service calls and streaming."},
    {title:"WebSockets",body:"A long-lived, full-duplex connection lets client and server push messages at any time. It fits chat, games, live dashboards, and collaboration, but adds connection management and does not replace normal request-response APIs everywhere."}
  ]}
];

type Fact = { term:string; simple:string; tech:string; example:string };
type Question = { lesson:string; q:string; options:string[]; answer:number; why:string };

const factSets: Record<string, Fact[]> = {
  scaling:[
    {term:"Latency",simple:"the time one customer waits for one answer",tech:"elapsed time from request start to response",example:"A page responds 800 ms after you tap it."},
    {term:"Vertical scaling",simple:"make the one existing counter stronger",tech:"increase CPU, RAM, I/O capacity, or code efficiency on one node",example:"Upgrade one server from 8 GB to 32 GB RAM."},
    {term:"Horizontal scaling",simple:"open more counters so people are served together",tech:"add service instances and distribute requests",example:"Run four app servers instead of one."},
    {term:"Load balancer",simple:"a token clerk who sends each person to a free counter",tech:"routes traffic across healthy instances using a balancing policy",example:"Send the next request to the server with the fewest connections."},
    {term:"Data consistency",simple:"every counter agrees on the same account balance",tech:"all observers see values allowed by the chosen consistency model",example:"Two withdrawals cannot both spend the same ₹1,000."}
  ],
  "building-blocks":[
    {term:"Database",simple:"the system's permanent record book",tech:"durable structured storage queried by application code",example:"Store users, orders, balances, and payment status."},
    {term:"Cache",simple:"a fast tray holding answers people ask for often",tech:"low-latency temporary storage that reduces repeated source reads",example:"Keep a popular product page in memory for 60 seconds."},
    {term:"Message queue",simple:"a safe job list workers can finish later",tech:"a broker decoupling producers from asynchronous consumers",example:"Place an email task in a queue after an order is accepted."},
    {term:"Monitoring",simple:"the system's health dashboard and alarm",tech:"metrics, thresholds, dashboards, and alerts describing current health",example:"Alert when checkout errors exceed 2%."},
    {term:"Distributed tracing",simple:"a tracking number for one request's whole journey",tech:"correlated spans across service boundaries",example:"See that payment, not inventory, caused a slow checkout."}
  ],
  workloads:[
    {term:"Data-intensive",simple:"the difficult part is storing and moving lots of information",tech:"storage, read/write throughput, and network I/O dominate",example:"Instagram serves billions of photos and feed reads."},
    {term:"Compute-intensive",simple:"the difficult part is doing heavy calculations",tech:"CPU or GPU execution is the dominant bottleneck",example:"Encode a 4K video or train an ML model."},
    {term:"Replication",simple:"keep copies of the same book in several places",tech:"copy data across nodes for read scale and resilience",example:"Send feed reads to database replicas."},
    {term:"Sharding",simple:"split one huge filing cabinet into several smaller cabinets",tech:"partition records across database nodes using a shard key",example:"Store users 1–1M on one shard and 1M–2M on another."},
    {term:"CDN",simple:"keep pictures at a shop near each customer",tech:"cache static content at geographically distributed edge locations",example:"Serve an image from Mumbai instead of a distant origin."}
  ],
  requirements:[
    {term:"Functional requirement",simple:"what the user must be able to do",tech:"a specified system behavior or capability",example:"A shopper can add a product to the cart."},
    {term:"Performance requirement",simple:"a measurable rule for how fast it must feel",tech:"a latency percentile under a defined workload",example:"p95 below 200 ms at 10,000 requests per second."},
    {term:"Availability",simple:"the shop is open when customers arrive",tech:"probability the service is reachable and usable in a measurement window",example:"99.9% monthly availability."},
    {term:"Durability",simple:"a saved receipt does not disappear after a power cut",tech:"probability acknowledged data survives failures",example:"A confirmed order remains after a database restart."},
    {term:"Authorization",simple:"decide what a signed-in person may do",tech:"enforce permissions, roles, policies, and ownership",example:"Only an administrator can refund another user's order."}
  ],
  dns:[
    {term:"Recursive resolver",simple:"a helper that finds the address for your computer",tech:"performs iterative DNS queries on a client's behalf",example:"Your ISP resolver asks root, TLD, and authoritative servers."},
    {term:"Root server",simple:"the directory that points toward the right domain ending",tech:"returns a referral to the relevant top-level-domain name servers",example:"For example.com, it points toward .com servers."},
    {term:"Authoritative server",simple:"the official record keeper for one domain",tech:"answers from the DNS zone it is authoritative for",example:"It returns example.com's A or AAAA record."},
    {term:"TTL",simple:"the use-before-refresh time written on a DNS answer",tech:"controls how long a record may be cached",example:"TTL 300 allows reuse for about five minutes."},
    {term:"AAAA record",simple:"a record containing an IPv6 address",tech:"maps a hostname to a 128-bit IPv6 address",example:"api.example.com → 2001:db8::10."}
  ],
  api:[
    {term:"API",simple:"a menu of actions one program offers another",tech:"a defined contract for software communication",example:"A mobile app requests order status from a backend."},
    {term:"Endpoint",simple:"one exact item on that menu",tech:"an exposed operation identified by method and path",example:"GET /products/42 retrieves product 42."},
    {term:"PATCH",simple:"change only the fields that need changing",tech:"applies a partial modification to a resource",example:"PATCH /users/7 changes only the display name."},
    {term:"Nested resource",simple:"show that one item belongs inside another",tech:"models a parent-child relationship in the URI",example:"GET /blogs/42/comments lists comments for blog 42."},
    {term:"API gateway",simple:"a security and traffic desk before the servers",tech:"applies authentication, rate limiting, routing, and transformations",example:"Reject a client after it exceeds 100 requests per minute."}
  ],
  styles:[
    {term:"REST",simple:"work with named resources using normal web methods",tech:"a stateless resource-oriented architectural style over HTTP",example:"GET /orders/42 returns one order."},
    {term:"SOAP",simple:"send a strict XML envelope following a formal rulebook",tech:"an XML messaging protocol with formal contracts and WS-* standards",example:"A legacy banking integration uses a WSDL contract."},
    {term:"GraphQL",simple:"ask for exactly the fields the screen needs",tech:"a typed query language executed through a schema",example:"Request a user's name and latest three posts in one query."},
    {term:"gRPC",simple:"fast, strongly agreed messages between backend services",tech:"contract-first RPC using Protocol Buffers, commonly over HTTP/2",example:"Inventory calls pricing inside a data center."},
    {term:"WebSocket",simple:"keep a two-way phone line open",tech:"a persistent full-duplex client-server connection",example:"Push a chat message instantly without a new HTTP request."}
  ]
};

const questions: Question[] = Object.entries(factSets).flatMap(([lesson,facts]) => facts.flatMap((fact,factIndex) => {
  const others=[1,2,3].map(offset=>facts[(factIndex+offset)%facts.length]);
  const detailed=`Easy answer: ${fact.simple}. Technical answer: ${fact.tech}. Example: ${fact.example}`;
  const variants=[
    {q:`In easy language, what does “${fact.term}” mean?`,correct:fact.simple,wrong:others.map(x=>x.simple)},
    {q:`Which system-design term matches this example: ${fact.example}`,correct:fact.term,wrong:others.map(x=>x.term)},
    {q:`Which technical explanation of “${fact.term}” is correct?`,correct:fact.tech,wrong:others.map(x=>x.tech)},
    {q:`In an interview, which is the best response for “Explain ${fact.term}”?`,correct:`${fact.term}: ${fact.simple}; technically, ${fact.tech}.`,wrong:others.map(x=>`${x.term}: ${x.simple}; technically, ${x.tech}.`)}
  ];
  return variants.map((variant,variantIndex)=>{
    const answer=(factIndex+variantIndex)%4;
    const options=[...variant.wrong]; options.splice(answer,0,variant.correct);
    return {lesson,q:variant.q,options:options.slice(0,4),answer,why:detailed};
  });
}));

function Architecture({ id }:{id:string}) {
  if(id==="scaling") return <div className="arch" aria-label="Scaled bank architecture"><Node icon="👥" label="Customers"/><Arrow/><Node icon="⚖" label="Load balancer" accent/><Arrow/><div className="stack"><Node label="Server 01"/><Node label="Server 02"/><Node label="Server 03"/></div><Arrow/><Node icon="◉" label="Shared database" gold/></div>;
  if(id==="dns") return <div className="arch chain" aria-label="DNS lookup chain">{["Your device","Resolver","Root",".com TLD","Authoritative","IP address"].map((x,i)=><span key={x} className="chainItem"><Node label={x} accent={i===1||i===4}/>{i<5&&<Arrow/>}</span>)}</div>;
  if(id==="workloads") return <div className="arch"><Node icon="▣" label="Heavy job"/><Arrow/><Node icon="⇥" label="Job queue" accent/><Arrow/><div className="stack"><Node label="GPU worker 01"/><Node label="GPU worker 02"/><Node label="GPU worker 03"/></div><Arrow/><Node icon="✓" label="Storage" gold/></div>;
  return <div className="arch"><Node icon="◫" label="Client"/><Arrow/><Node label={id==="api"?"Gateway":"App server"} accent/><Arrow/><Node icon="◇" label={id==="styles"?"API contract":"Cache"}/><Arrow/><Node icon="◉" label="Database" gold/></div>;
}
function Node({label,icon,accent,gold}:{label:string;icon?:string;accent?:boolean;gold?:boolean}){return <div className={`node ${accent?"accent":""} ${gold?"gold":""}`}><b>{icon}</b><span>{label}</span></div>}
function Arrow(){return <span className="arrow" aria-hidden="true">→</span>}

function ExplanationPages({section}:{section:Lesson["sections"][number]}){
  const technical=section.points?.length?section.points.join(" • "):`In technical terms, this component has a clear responsibility inside the request flow and must be designed for capacity, failure, and correct data handling.`;
  const example=section.example||`Imagine a busy shop: customers should get a quick, correct response even when many arrive together. This idea gives one part of the shop a clear job so the whole process remains manageable.`;
  const response=`“${section.title} means ${section.body}” Then give one example, explain the benefit, and mention the trade-off${section.pitfall?`: ${section.pitfall}`:" so the interviewer knows you understand both sides"}.`;
  return <div className="four-pages" aria-label={`Four-part explanation for ${section.title}`}>
    <div className="explain-page easy"><span>PAGE 1 · EASY MEANING</span><h3>Explain it to a friend</h3><p>{section.body}</p></div>
    <div className="explain-page example-page"><span>PAGE 2 · REAL EXAMPLE</span><h3>See it in daily life</h3><p>{example}</p></div>
    <div className="explain-page technical"><span>PAGE 3 · TECH LANGUAGE</span><h3>Use the correct vocabulary</h3><p>{technical}</p></div>
    <div className="explain-page response-page"><span>PAGE 4 · YOUR RESPONSE</span><h3>What you can say</h3><p>{response}</p></div>
  </div>
}

export default function SystemDesignLab(){
  const [active,setActive]=useState("scaling"); const [mode,setMode]=useState<"learn"|"quiz">("learn");
  const [answers,setAnswers]=useState<Record<number,number>>({}); const [done,setDone]=useState<string[]>([]);
  const lesson=lessons.find(x=>x.id===active)!; const quiz=useMemo(()=>questions.filter(x=>x.lesson===active),[active]);
  const covered=done.length; const total=lessons.length;
  const open=(id:string)=>{setActive(id);setMode("learn");window.scrollTo({top:0,behavior:"smooth"})};
  return <main className="sd-shell">
    <aside className="sd-side">
      <a className="sd-brand" href="/system-design"><span className="brand-glyph">SD</span><span><b>System Design</b><small>LEARNING LAB</small></span></a>
      <nav>{lessons.map((l,i)=><button key={l.id} onClick={()=>open(l.id)} className={active===l.id?"on":""}><span>{String(i+1).padStart(2,"0")}</span><div><b>{l.title}</b><small>{l.eyebrow.split(" · ")[0]}</small></div>{done.includes(l.id)&&<em>✓</em>}</button>)}</nav>
      <div className="progressBox"><div><span>Your progress</span><b>{covered}/{total}</b></div><div className="track"><i style={{width:`${covered/total*100}%`}}/></div><small>{covered===total?"Course complete — excellent work.":"20 questions in every lesson · 140 total."}</small></div>
      <a className="back" href="/">← Back to Personal OS</a>
    </aside>
    <section className="sd-main">
      <header className="sd-top"><div className="crumb">COURSE / {lesson.eyebrow.toUpperCase()}</div><div className="top-actions"><span>◷ {lesson.time}</span><button onClick={()=>setMode(mode==="learn"?"quiz":"learn")}>{mode==="learn"?"Test knowledge →":"← Back to lesson"}</button></div></header>
      <div className="lesson-wrap">
        <div className="lesson-head"><span className="class-pill">{lesson.eyebrow}</span><h1>{lesson.title}</h1><p>{lesson.summary}</p><div className="mode-tabs"><button className={mode==="learn"?"on":""} onClick={()=>setMode("learn")}>Learn</button><button className={mode==="quiz"?"on":""} onClick={()=>setMode("quiz")}>Knowledge check <span>{quiz.length}</span></button></div></div>
        {mode==="learn" ? <>
          <div className="diagram-card"><div className="diagram-title"><span>LIVE MODEL</span><p>Follow the request from left to right</p></div><Architecture id={active}/></div>
          <div className="section-grid detailed-grid">{lesson.sections.map((s,i)=><article className="topic-card" key={s.title}><span className="topic-no">{String(i+1).padStart(2,"0")}</span><div><h2>{s.title}</h2><ExplanationPages section={s}/>{s.pitfall&&<div className="detail-box pitfall"><b>Common mistake</b><p>{s.pitfall}</p></div>}{s.note&&<div className="callout"><b>Remember</b>{s.note}</div>}</div></article>)}</div>
          <div className="lesson-next"><div><span>READY TO CHECK YOUR UNDERSTANDING?</span><h3>Turn recognition into recall.</h3></div><button onClick={()=>setMode("quiz")}>Start knowledge check →</button></div>
        </> : <Quiz items={quiz} answers={answers} setAnswers={setAnswers} onComplete={()=>setDone(d=>d.includes(active)?d:[...d,active])}/>} 
      </div>
    </section>
  </main>
}

function Quiz({items,answers,setAnswers,onComplete}:{items:typeof questions;answers:Record<number,number>;setAnswers:(x:Record<number,number>)=>void;onComplete:()=>void}){
  const all=items.every(q=>answers[questions.indexOf(q)]!==undefined); const score=items.filter(q=>answers[questions.indexOf(q)]===q.answer).length;
  return <div className="quiz-wrap">{items.length===0?<div className="emptyQuiz"><b>Quick practice</b><p>Explain this lesson aloud in 60 seconds, then compare your answer with the cards.</p></div>:items.map((q,qi)=>{const key=questions.indexOf(q), chosen=answers[key];return <article className="quiz-card" key={q.q}><div className="qmeta">QUESTION {qi+1} OF {items.length}</div><h2>{q.q}</h2><div className="options">{q.options.map((o,i)=><button disabled={chosen!==undefined} key={o} onClick={()=>setAnswers({...answers,[key]:i})} className={chosen===undefined?"":i===q.answer?"correct":chosen===i?"wrong":"dim"}><span>{String.fromCharCode(65+i)}</span>{o}{chosen!==undefined&&i===q.answer&&<em>✓</em>}{chosen===i&&i!==q.answer&&<em>×</em>}</button>)}</div>{chosen!==undefined&&<div className={`feedback ${chosen===q.answer?"yes":"no"}`}><b>{chosen===q.answer?"Correct":"Not quite"}</b><p>{q.why}</p></div>}</article>})}{items.length>0&&all&&<div className="result"><div><span>LESSON SCORE</span><strong>{score}/{items.length}</strong><p>{score===items.length?"Perfect. You can explain this concept clearly.":"Good attempt. Review the explanation, then try teaching it aloud."}</p></div><button onClick={onComplete}>Mark lesson complete ✓</button></div>}</div>
}
