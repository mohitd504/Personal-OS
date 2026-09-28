// Shared LLM helper. Uses OpenAI (ChatGPT) if OPENAI_API_KEY is set, else Anthropic.
// Returns "" on failure (callers already handle that), but failures are now logged,
// requests time out instead of hanging until Vercel's 504, and transient
// errors (429 / 5xx / network) are retried once.

export type LLMOptions = {
  // Ask OpenAI for a guaranteed JSON object (response_format json_object).
  // The prompt must mention JSON. Ignored for Anthropic.
  json?: boolean;
};

const TIMEOUT_MS = Number(process.env.LLM_TIMEOUT_MS || 25_000);
const RETRYABLE = new Set([408, 409, 429, 500, 502, 503, 504, 529]);

async function postJson(label: string, url: string, headers: Record<string, string>, body: unknown): Promise<any | null> {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const r = await fetch(url, { method: "POST", headers, body: JSON.stringify(body), signal: AbortSignal.timeout(TIMEOUT_MS) });
      if (r.ok) return await r.json();
      const detail = (await r.text().catch(() => "")).slice(0, 300);
      console.error(`[llm] ${label} HTTP ${r.status} (attempt ${attempt + 1})`, detail);
      if (!RETRYABLE.has(r.status)) return null;
    } catch (err: any) {
      const timedOut = err?.name === "TimeoutError" || err?.name === "AbortError";
      console.error(`[llm] ${label} ${timedOut ? `timed out after ${TIMEOUT_MS}ms` : "request failed"} (attempt ${attempt + 1})`, timedOut ? "" : err);
      if (timedOut) return null; // a retry would likely blow the function time limit
    }
    if (attempt === 0) await new Promise((resolve) => setTimeout(resolve, 800));
  }
  return null;
}

async function callOpenAI(key: string, system: string, userContent: unknown, maxTokens: number, opts: LLMOptions): Promise<string> {
  const d = await postJson("openai", "https://api.openai.com/v1/chat/completions",
    { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    {
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      max_tokens: maxTokens,
      temperature: 0.2,
      ...(opts.json ? { response_format: { type: "json_object" } } : {}),
      messages: [{ role: "system", content: system }, { role: "user", content: userContent }],
    });
  return d?.choices?.[0]?.message?.content || "";
}

async function callAnthropic(key: string, system: string, userContent: unknown, maxTokens: number): Promise<string> {
  const d = await postJson("anthropic", "https://api.anthropic.com/v1/messages",
    { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    { model: process.env.ANTHROPIC_MODEL || "claude-haiku-4-5-20251001", max_tokens: maxTokens, system, messages: [{ role: "user", content: userContent }] });
  return d?.content?.[0]?.text || "";
}

export async function askLLM(system: string, user: string, maxTokens = 400, opts: LLMOptions = {}): Promise<string> {
  const oai = process.env.OPENAI_API_KEY;
  if (oai) return callOpenAI(oai, system, user, maxTokens, opts);
  const anth = process.env.ANTHROPIC_API_KEY;
  if (anth) return callAnthropic(anth, system, user, maxTokens);
  return "";
}

// Vision helper: pass a data URL (data:image/jpeg;base64,....) and get a text answer.
export async function askLLMImage(system: string, text: string, dataUrl: string, maxTokens = 400, opts: LLMOptions = {}): Promise<string> {
  const oai = process.env.OPENAI_API_KEY;
  if (oai) return callOpenAI(oai, system, [{ type: "text", text }, { type: "image_url", image_url: { url: dataUrl } }], maxTokens, opts);
  const anth = process.env.ANTHROPIC_API_KEY;
  if (anth) {
    const m = dataUrl.match(/^data:(image\/[a-zA-Z]+);base64,(.*)$/);
    const media = m ? m[1] : "image/jpeg";
    const b64 = m ? m[2] : dataUrl;
    return callAnthropic(anth, system, [{ type: "text", text }, { type: "image", source: { type: "base64", media_type: media, data: b64 } }], maxTokens);
  }
  return "";
}
