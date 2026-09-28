import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { askLLM } from "@/lib/llm";

const ok = (content: string) => new Response(JSON.stringify({ choices: [{ message: { content } }] }), { status: 200 });

describe("askLLM", () => {
  beforeEach(() => {
    vi.stubEnv("OPENAI_API_KEY", "test-key");
    vi.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("retries once on a transient 503", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(new Response("busy", { status: 503 })).mockResolvedValueOnce(ok("hello"));
    vi.stubGlobal("fetch", fetchMock);
    await expect(askLLM("sys", "user")).resolves.toBe("hello");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("does not retry a 400 and returns empty string", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("bad", { status: 400 }));
    vi.stubGlobal("fetch", fetchMock);
    await expect(askLLM("sys", "user")).resolves.toBe("");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("sends response_format only when json mode is requested", async () => {
    const fetchMock = vi.fn().mockImplementation(async () => ok("{}"));
    vi.stubGlobal("fetch", fetchMock);
    await askLLM("sys", "user", 100, { json: true });
    await askLLM("sys", "user", 100);
    const bodies = fetchMock.mock.calls.map(([, init]) => JSON.parse(init.body));
    expect(bodies[0].response_format).toEqual({ type: "json_object" });
    expect(bodies[1].response_format).toBeUndefined();
  });
});
