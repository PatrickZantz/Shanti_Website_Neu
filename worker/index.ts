// Cloudflare Worker: serves static assets and streams private videos from R2.
// Access (Zero Trust) protects /media/* and /videos/*; the JWT check below is defense in depth.

interface R2ObjectBodyLike {
  body: ReadableStream;
  size: number;
  httpEtag: string;
  range?: { offset: number; length: number };
  writeHttpMetadata(headers: Headers): void;
}
interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> };
  VIDEOS: { get(key: string, options?: { range?: Headers }): Promise<R2ObjectBodyLike | null> };
  ACCESS_TEAM_DOMAIN?: string; // e.g. https://myteam.cloudflareaccess.com
  ACCESS_AUD?: string; // Application Audience (AUD) tag
  ALLOW_INSECURE_DEV?: string; // only in .dev.vars for local development
}

type Jwk = JsonWebKey & { kid: string };
let certCache: { keys: Jwk[]; fetchedAt: number } | undefined;

const b64url = (input: string) => Uint8Array.from(atob(input.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0));
const decodeJson = (part: string) => JSON.parse(new TextDecoder().decode(b64url(part)));

async function getKeys(env: Env, force = false): Promise<Jwk[]> {
  if (!force && certCache && Date.now() - certCache.fetchedAt < 3600_000) return certCache.keys;
  const response = await fetch(`${env.ACCESS_TEAM_DOMAIN}/cdn-cgi/access/certs`);
  if (!response.ok) throw new Error("Access certs unavailable");
  const { keys } = (await response.json()) as { keys: Jwk[] };
  certCache = { keys, fetchedAt: Date.now() };
  return keys;
}

async function verifyAccess(request: Request, env: Env): Promise<boolean> {
  if (env.ALLOW_INSECURE_DEV === "1") return true;
  if (!env.ACCESS_TEAM_DOMAIN || !env.ACCESS_AUD) return false;
  const token = request.headers.get("Cf-Access-Jwt-Assertion");
  const parts = token?.split(".");
  if (!parts || parts.length !== 3) return false;
  try {
    const header = decodeJson(parts[0]);
    const payload = decodeJson(parts[1]);
    const aud = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
    if (header.alg !== "RS256" || !aud.includes(env.ACCESS_AUD)) return false;
    if (payload.iss !== env.ACCESS_TEAM_DOMAIN || payload.exp * 1000 < Date.now()) return false;
    let jwk = (await getKeys(env)).find((key) => key.kid === header.kid);
    if (!jwk) jwk = (await getKeys(env, true)).find((key) => key.kid === header.kid);
    if (!jwk) return false;
    const key = await crypto.subtle.importKey("jwk", jwk, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]);
    return crypto.subtle.verify("RSASSA-PKCS1-v1_5", key, b64url(parts[2]), new TextEncoder().encode(`${parts[0]}.${parts[1]}`));
  } catch {
    return false;
  }
}

async function serveVideo(request: Request, env: Env, key: string): Promise<Response> {
  const rangeHeader = request.headers.get("Range");
  const object = await env.VIDEOS.get(key, rangeHeader ? { range: request.headers } : undefined);
  if (!object) return new Response("Not found", { status: 404 });
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("ETag", object.httpEtag);
  headers.set("Accept-Ranges", "bytes");
  headers.set("Cache-Control", "private, no-store");
  headers.set("X-Robots-Tag", "noindex");
  if (object.range && rangeHeader) {
    headers.set("Content-Range", `bytes ${object.range.offset}-${object.range.offset + object.range.length - 1}/${object.size}`);
    headers.set("Content-Length", String(object.range.length));
    return new Response(request.method === "HEAD" ? null : object.body, { status: 206, headers });
  }
  headers.set("Content-Length", String(object.size));
  return new Response(request.method === "HEAD" ? null : object.body, { headers });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/media/")) {
      if (request.method !== "GET" && request.method !== "HEAD") return new Response("Method not allowed", { status: 405 });
      if (!(await verifyAccess(request, env))) return new Response("Forbidden", { status: 403 });
      let key: string;
      try {
        key = decodeURIComponent(url.pathname.slice("/media/".length));
      } catch {
        return new Response("Bad request", { status: 400 });
      }
      if (!key || key.includes("..") || key.startsWith("/")) return new Response("Bad request", { status: 400 });
      return serveVideo(request, env, key);
    }
    return env.ASSETS.fetch(request);
  },
};
