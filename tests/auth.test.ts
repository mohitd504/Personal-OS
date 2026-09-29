import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Supabase is mocked through fetch; env must be set before lib modules load.
beforeEach(() => {
  vi.resetModules();
  vi.stubEnv("SUPABASE_URL", "https://sb.test");
  vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "key");
});
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });

const load = async () => (await import("@/lib/auth")).authOptions;
const jwt = async (args: any) => (await load()).callbacks!.jwt!(args as any);

describe("one-click Google sign-in", () => {
  it("does not force Google's consent screen and keeps sessions 90 days", async () => {
    const opts = await load();
    const params = (opts.providers[0] as any).options.authorization.params;
    expect(params.prompt).toBeUndefined();
    expect(params.access_type).toBe("offline");
    expect(opts.session?.maxAge).toBe(90 * 24 * 60 * 60);
  });

  it("stores a new refresh token when Google sends one", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("", { status: 201 }));
    vi.stubGlobal("fetch", fetchMock);
    const t = await jwt({ token: { email: "me@x.com" }, account: { access_token: "a", expires_at: 9e9, refresh_token: "r1" } });
    expect(t).toMatchObject({ refreshToken: "r1", error: undefined });
    expect(fetchMock.mock.calls[0][0]).toBe("https://sb.test/rest/v1/google_tokens");
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)[0]).toMatchObject({ email: "me@x.com", refresh_token: "r1" });
  });

  it("reuses the stored refresh token on a one-click sign-in", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify([{ refresh_token: "stored" }]), { status: 200 })));
    const t = await jwt({ token: { email: "me@x.com" }, account: { access_token: "a", expires_at: 9e9 } });
    expect(t).toMatchObject({ refreshToken: "stored", error: undefined });
  });

  it("asks for consent once when no refresh token is stored", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("[]", { status: 200 })));
    const t = await jwt({ token: { email: "me@x.com" }, account: { access_token: "a", expires_at: 9e9 } });
    expect(t.error).toBe("NoRefreshToken");
  });
});
