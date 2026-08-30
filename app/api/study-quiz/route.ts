import { askLLM } from "@/lib/llm";
import { aiHeaders, guardAiRequest, isGuardResponse } from "@/lib/api-security";
import { studyAiRequestSchema } from "@/lib/domain";

export async function POST(req:Request){
  const guard=await guardAiRequest(req,"study-quiz");if(isGuardResponse(guard))return guard;
  const parsed=studyAiRequestSchema.safeParse(await req.json().catch(()=>null));if(!parsed.success)return Response.json({error:"Invalid study topic or context."},{status:400});
  const {topic,context}=parsed.data;const raw=await askLLM("Create a rigorous five-question multiple-choice quiz grounded only in the supplied study material. Return ONLY JSON: {\"questions\":[{\"question\":string,\"options\":[string,string,string,string],\"answer\":string,\"explanation\":string}]}. The answer must exactly match one option.",`TOPIC: ${topic}\nMATERIAL:\n${context||"No detailed material supplied; use only the topic."}`,1200);
  const match=raw.match(/\{[\s\S]*\}/);try{const data=match?JSON.parse(match[0]):null;if(!Array.isArray(data?.questions))throw new Error();return Response.json({questions:data.questions.slice(0,5),grounded:!!context},{headers:aiHeaders(guard)});}catch{return Response.json({error:"The quiz could not be generated."},{status:502});}
}
