import { isIP } from "node:net";
import inquiries from "../_shared/inquiries.js";
import inviteExpert from "../_shared/invite-expert.js";

const siteOrigin = "https://klexford.vercel.app";
const maxBytes = 24576;
const allowedHeaders = ["authorization", "content-type", "apikey", "x-client-info"];

function workspaceSecret() {
  const keys = Deno.env.get("SUPABASE_SECRET_KEYS");
  if (keys) {
    try {
      const secret = JSON.parse(keys).default;
      if (typeof secret === "string" && secret) return secret;
    } catch { /* Older projects expose the service-role key individually. */ }
  }
  return Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
}

async function readBody(request: Request) {
  if (Number(request.headers.get("content-length")) > maxBytes) return null;
  const reader = request.body?.getReader();
  if (!reader) return "";
  const decoder = new TextDecoder();
  let body = "";
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) return body + decoder.decode();
      size += value.byteLength;
      if (size > maxBytes) {
        await reader.cancel();
        return null;
      }
      body += decoder.decode(value, { stream: true });
    }
  } finally {
    reader.releaseLock();
  }
}

Deno.serve(async request => {
  const path = new URL(request.url).pathname;
  const endpoint = /^(?:\/functions\/v1)?\/klexford-workspace\/(inquiries|invite-expert)\/?$/.exec(path)?.[1];
  const headers = new Headers({ "Vary": "Origin", "Cache-Control": "no-store" });
  const respond = (status: number, message: string) => Response.json({ message }, { status, headers });
  if (!endpoint) return respond(404, "Unknown workspace endpoint.");

  const origin = request.headers.get("origin");
  if (origin && origin !== siteOrigin) return respond(403, "Open this form on the Klexford website.");
  if (origin === siteOrigin) headers.set("Access-Control-Allow-Origin", siteOrigin);

  const methods = endpoint === "inquiries" ? ["GET", "POST"] : ["POST"];
  if (request.method === "OPTIONS") {
    const method = request.headers.get("access-control-request-method") || "";
    const requested = request.headers.get("access-control-request-headers")?.toLowerCase().split(",") || [];
    if (origin !== siteOrigin || !methods.includes(method) || requested.some(h => !allowedHeaders.includes(h.trim()))) {
      return respond(403, "Unsupported cross-origin request.");
    }
    headers.set("Access-Control-Allow-Methods", methods.join(", "));
    headers.set("Access-Control-Allow-Headers", allowedHeaders.join(", "));
    headers.set("Access-Control-Max-Age", "600");
    return new Response(null, { status: 204, headers });
  }
  if (!methods.includes(request.method)) {
    headers.set("Allow", [...methods, "OPTIONS"].join(", "));
    return respond(405, "Unsupported method.");
  }
  const env = {
    PUBLIC_SITE_ORIGIN: siteOrigin,
    SUPABASE_URL: Deno.env.get("SUPABASE_URL"),
    SUPABASE_SECRET_KEY: workspaceSecret(),
  };
  const body = request.method === "POST" ? await readBody(request) : "";
  if (body === null) return respond(413, "Request exceeds the size limit.");

  // Supabase's hosted Cloudflare ingress supplies CF-Connecting-IP. Keep a
  // shared rate-limit bucket when unavailable; never accept caller forwarding chains.
  const clientIP = request.headers.get("cf-connecting-ip") || "";
  const input = {
    method: request.method,
    headers: {
      authorization: request.headers.get("authorization"),
      "content-type": request.headers.get("content-type"),
      host: new URL(siteOrigin).host,
      origin,
    },
    socket: { remoteAddress: isIP(clientIP) ? clientIP : "unknown-edge-client" },
    body,
  };
  let status = 200;
  const output = {
    setHeader(name: string, value: string) { headers.set(name, value); },
    status(code: number) { status = code; return this; },
    json(data: unknown) { return Response.json(data, { status, headers }); },
  };
  return endpoint === "inquiries" ? await inquiries(input, output, env) : await inviteExpert(input, output, env);
});
