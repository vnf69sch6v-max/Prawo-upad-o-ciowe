import { afterEach, describe, expect, it, vi } from "vitest";
import { internalCall, internalInit, internalOrigin } from "@/lib/internal-fetch";

const req = (url: string) => new Request(url);

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("internalOrigin", () => {
  it("uses the canonical public domain in production, not the protected *.vercel.app deployment URL", () => {
    vi.stubEnv("VERCEL_ENV", "production");
    expect(internalOrigin(req("https://prawo-upad-o-ciowe-abc123-team.vercel.app/api/cron/dbw-4"))).toBe("https://savori.space");
  });

  it("ignores VERCEL_PROJECT_PRODUCTION_URL — it picked savori.com, whose DNS is not on Vercel", () => {
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "savori.com");
    expect(internalOrigin(req("https://x.vercel.app/api/cron/bdl"))).toBe("https://savori.space");
  });

  it("normalises www and other production hosts to the canonical domain", () => {
    vi.stubEnv("VERCEL_ENV", "production");
    expect(internalOrigin(req("https://www.savori.space/api/health/freshness"))).toBe("https://savori.space");
  });

  it("lets INTERNAL_BASE_URL override everything", () => {
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("INTERNAL_BASE_URL", "https://staging.savori.space/");
    expect(internalOrigin(req("https://x.vercel.app/api/cron/bdl"))).toBe("https://staging.savori.space");
  });

  it("keeps the request origin outside production (local dev, previews)", () => {
    vi.stubEnv("VERCEL_ENV", "preview");
    expect(internalOrigin(req("http://localhost:3000/api/cron/refresh"))).toBe("http://localhost:3000");
  });
});

describe("internalInit", () => {
  it("never follows redirects and adds the protection-bypass header when configured", () => {
    vi.stubEnv("VERCEL_AUTOMATION_BYPASS_SECRET", "s3cret");
    const init = internalInit();
    expect(init.redirect).toBe("manual");
    expect(init.cache).toBe("no-store");
    expect((init.headers as Record<string, string>)["x-vercel-protection-bypass"]).toBe("s3cret");
  });
});

describe("internalCall", () => {
  const respond = (body: string, status: number, headers: Record<string, string>) =>
    vi.stubGlobal("fetch", vi.fn(async () => new Response(body, { status, headers })));

  it("counts the Vercel login redirect as a failure, not a 200", async () => {
    respond("", 302, { location: "https://vercel.com/sso-api?url=x" });
    expect(await internalCall("https://x.vercel.app/api/nbp?table=a&refresh=1")).toBe("redirect 302 → vercel.com");
  });

  it("counts an HTML 200 (e.g. a login page) as a failure", async () => {
    respond("<!DOCTYPE html>", 200, { "content-type": "text/html; charset=utf-8" });
    expect(await internalCall("https://savori.space/api/nbp?table=a&refresh=1")).toBe("non-JSON 200");
  });

  it("returns 200 only for a JSON answer", async () => {
    respond('{"series":[]}', 200, { "content-type": "application/json" });
    expect(await internalCall("https://savori.space/api/dbw-series?refresh=1")).toBe(200);
  });

  it("passes other statuses and network errors through", async () => {
    respond('{"error":"x"}', 500, { "content-type": "application/json" });
    expect(await internalCall("https://savori.space/api/x")).toBe(500);
    vi.stubGlobal("fetch", vi.fn(async () => { throw new Error("ECONNRESET"); }));
    expect(String(await internalCall("https://savori.space/api/x"))).toMatch(/^error: Error: ECONNRESET/);
  });
});
