import { askLLM } from "@/lib/llm";
import { aiHeaders, guardAiRequest, isGuardResponse } from "@/lib/api-security";
import { studyAiRequestSchema } from "@/lib/domain";

export async function POST(req:Request){
  const guard=await guardAiRequest(req,"study-assistant");if(isGuardResponse(guard))return guard;
  const parsed=studyAiRequestSchema.safeParse(await req.json().catch(()=>null));if(!parsed.success||!parsed.data.question)return Response.json({error:"Enter a valid question."},{status:400});
  const {topic,context,question}=parsed.data;const answer=await askLLM("Answer using the supplied course material first. If the material does not contain the answer, clearly say that before giving a concise general explanation. Never invent a claim about the material.",`TOPIC: ${topic}\nCOURSE MATERIAL:\n${context||"No course material available."}\n\nQUESTION: ${question}`,900);
  return Response.json({answer:answer||"No answer was generated.",grounded:!!context,assumption:context?"Based primarily on the selected subject's stored material.":"No stored course material was available."},{headers:aiHeaders(guard)});
}
