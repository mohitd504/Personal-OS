"use client";
// Chart cards live in their own module so recharts is only downloaded when a chart is shown.
import { PieChart, Pie, Cell, BarChart, Bar as RBar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const PIE_COLORS = ["#3B82F6","#10B981","#F59E0B","#A855F7","#EC4899","#06B6D4"];
const TT = { background:"#0f172a", border:"1px solid rgba(255,255,255,.12)", borderRadius:8, color:"#E7ECF3" } as any;
export function PieCard({ title, data }: { title:string; data:{name:string;value:number}[] }) {
  const empty = data.every(d=>!d.value);
  return <div className="card"><strong>{title}</strong>
    <div style={{height:230,marginTop:6}}>{empty? <div className="muted" style={{textAlign:"center",paddingTop:92}}>No data yet — log some to see the chart</div> :
      <ResponsiveContainer width="100%" height="100%"><PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3} stroke="none">
          {data.map((_,i)=><Cell key={i} fill={PIE_COLORS[i%PIE_COLORS.length]} />)}
        </Pie><Tooltip contentStyle={TT}/></PieChart></ResponsiveContainer>}</div>
    <div className="row" style={{flexWrap:"wrap",gap:12,marginTop:6}}>{data.map((d,i)=><span key={i} className="muted" style={{fontSize:12}}><span style={{display:"inline-block",width:10,height:10,borderRadius:3,background:PIE_COLORS[i%PIE_COLORS.length],marginRight:6}}/>{d.name}: {d.value}</span>)}</div>
  </div>;
}
export function BarCard({ title, data, color }: { title:string; data:{name:string;value:number}[]; color:string }) {
  return <div className="card"><strong>{title}</strong><div style={{height:230,marginTop:6}}>
    <ResponsiveContainer width="100%" height="100%"><BarChart data={data}>
      <XAxis dataKey="name" tick={{fill:"#8A94A6",fontSize:11}} axisLine={false} tickLine={false}/>
      <YAxis tick={{fill:"#8A94A6",fontSize:11}} axisLine={false} tickLine={false} width={30}/>
      <Tooltip cursor={{fill:"rgba(255,255,255,.05)"}} contentStyle={TT}/>
      <RBar dataKey="value" fill={color} radius={[6,6,0,0]}/>
    </BarChart></ResponsiveContainer></div></div>;
}
export function LineCard({ title, data, color }: { title:string; data:{name:string;value:number}[]; color:string }) {
  return <div className="card"><strong>{title}</strong><div style={{height:230,marginTop:6}}>
    <ResponsiveContainer width="100%" height="100%"><LineChart data={data}>
      <XAxis dataKey="name" tick={{fill:"#8A94A6",fontSize:11}} axisLine={false} tickLine={false}/>
      <YAxis domain={["auto","auto"]} tick={{fill:"#8A94A6",fontSize:11}} axisLine={false} tickLine={false} width={34}/>
      <Tooltip contentStyle={TT}/>
      <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2.5} dot={{r:3,fill:color}}/>
    </LineChart></ResponsiveContainer></div></div>;
}
