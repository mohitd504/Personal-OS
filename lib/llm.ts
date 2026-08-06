// Shared LLM helper. Uses OpenAI (ChatGPT) if OPENAI_API_KEY is set, else Anthropic.
export async function askLLM(system: string, user: string, maxTokens = 400): Promise<string> {
  const oai = process.env.OPENAI_API_KEY;
  if (oai) {
    try {
      const r = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${oai}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || "gpt-4o-mini",
          max_tokens: maxTokens,
          temperature: 0.2,
          messages: [{ role: "system", content: system }, { role: "user", content: user }],
        }),
      });
      const d = await r.json();
      return d?.choices?.[0]?.message?.content || "";
    } catch (e) { return ""; }
  }
  const anth = process.env.ANTHROPIC_API_KEY;
  if (anth) {
    try {
      const r = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "x-api-key": anth, "anthropic-version": "2023-06-01", "content-type": "application/json" },
        body: JSON.stringify({ model: process.env.ANTHROPIC_MODEL || "claude-haiku-4-5-20251001", max_tokens: maxTokens, system, messages: [{ role: "user", content: user }] }),
      });
      const d = await r.json();
      return d?.content?.[0]?.text || "";
    } catch (e) { return ""; }
  }
  return "";
}
