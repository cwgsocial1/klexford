import { createHash } from "node:crypto";

const owners = new Map([
  ["book-author-services", "Author services lead"], ["website-development", "Website lead"],
  ["crm-automation", "Automation lead"], ["growth-studio", "Growth lead"],
  ["branding-creative", "Creative lead"],
]);
const fields = {
  project: ["customerType", "service", "details", "timeline", "budget"],
  visibility: ["reviewType", "customerType", "url", "goal"],
  expert: ["department", "portfolio", "availability", "experience"],
};
const hash = value => createHash("sha256").update(value).digest("hex");
const isWebUrl = value => {
  try { return ["http:", "https:"].includes(new URL(value).protocol); } catch { return false; }
};

function normalize(body) {
  if (!body || typeof body !== "object" || !Object.hasOwn(fields, body.kind)) return null;
  const { kind, requestId } = body;
  if (typeof requestId !== "string" || !/^[0-9a-f-]{36}$/i.test(requestId)) return null;
  if (typeof body.name !== "string" || typeof body.email !== "string") return null;
  const name = body.name.trim(), email = body.email.trim().toLowerCase();
  if (!name || name.length > 150 || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  if (!body.data || typeof body.data !== "object" || Array.isArray(body.data)) return null;
  const entries = Object.entries(body.data);
  if (entries.length > 40 || entries.some(([k,v]) => !/^[a-z][a-zA-Z]{0,39}$/.test(k) || typeof v !== "string" || v.length > 6000)) return null;
  const data = Object.fromEntries(entries.map(([k,v]) => [k,v.trim()]));
  if (fields[kind].some(key => !data[key]) || (data.projectUrl && !isWebUrl(data.projectUrl))) return null;
  let owner = "Project coordinator";
  if (kind === "project") {
    if (!owners.has(data.service) && data.service !== "Help me choose") return null;
    if (!data.additionalServices && owners.has(data.service)) owner = owners.get(data.service);
  } else if (kind === "expert") {
    if (!owners.has(data.department) || !isWebUrl(data.portfolio)) return null;
    owner = "Collaboration coordinator";
  } else {
    if (!["Book or Author Visibility", "Business Website Visibility"].includes(data.reviewType) || !isWebUrl(data.url)) return null;
    owner = data.reviewType === "Book or Author Visibility" ? "Author services lead" : "Website lead";
  }
  data.source = /^\/(?!\/)[^\s]{0,255}$/.test(data.source || "") ? data.source : "/";
  Object.assign(data, { name, email, owner });
  return { kind, requestId, name, email, data };
}

// Store the brief before contacting the receiving CRM. A lease lets an identical
// retry finish an interrupted handoff without creating a second inquiry.
const reserve = `
local digest = redis.call('HGET', KEYS[1], 'digest')
if digest then
  if digest ~= ARGV[1] then return 'conflict' end
  if redis.call('HGET', KEYS[1], 'status') == 'delivered' then return 'delivered' end
else
  local count = redis.call('INCR', KEYS[2])
  if count == 1 then redis.call('EXPIRE', KEYS[2], 3600) end
  if count > 12 then return 'limited' end
  redis.call('HSET', KEYS[1], 'digest', ARGV[1], 'payload', ARGV[2], 'status', 'pending')
end
if redis.call('SET', KEYS[3], ARGV[3], 'NX', 'EX', 30) then return 'reserved' end
return 'busy'`;

export default async function handler(req, res) {
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  const destination = process.env.KLEXFORD_INQUIRY_WEBHOOK;
  const live = Boolean(redisUrl && token && destination);
  const json = (code, data) => res.status(code).json(data);
  res.setHeader("Cache-Control", "no-store");
  if (req.method === "GET") return json(200, { live });
  if (req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return json(405, { ok: false });
  }
  if (!live) return json(503, { ok: false });
  if (req.headers.origin) {
    let host;
    try { host = new URL(req.headers.origin).host; } catch { return json(403, { ok: false }); }
    if (host !== req.headers.host) return json(403, { ok: false });
  }
  if (!req.headers["content-type"]?.startsWith("application/json")) return json(415, { ok: false });
  if (Buffer.byteLength(typeof req.body === "string" ? req.body : JSON.stringify(req.body ?? null)) > 24576) return json(413, { ok: false });
  let inquiry;
  try { inquiry = normalize(typeof req.body === "string" ? JSON.parse(req.body) : req.body); } catch {}
  if (!inquiry) return json(400, { ok: false });

  const redis = async command => {
    const response = await fetch(redisUrl, { method: "POST", headers: {
      Authorization: "Bearer " + token, "Content-Type": "application/json",
    }, body: JSON.stringify(command), signal: AbortSignal.timeout(4000) });
    if (!response.ok) throw new Error("Storage unavailable");
    const message = await response.json();
    if (message.error) throw new Error("Storage operation failed");
    return message.result;
  };
  const recordKey = "klexford:inquiry:" + inquiry.requestId;
  const leaseKey = recordKey + ":lease";
  const lease = crypto.randomUUID();
  const ip = req.headers["x-vercel-forwarded-for"] || req.socket?.remoteAddress || "local";
  const contactId = hash(inquiry.email);
  const time = new Date().toISOString();
  const payload = JSON.stringify({ ...inquiry, contactId, stage: "New Inquiry", receivedAt: time });
  try {
    const state = await redis(["EVAL", reserve, "3", recordKey, "klexford:limit:"+hash(String(ip)), leaseKey, hash(JSON.stringify(inquiry)), payload, lease]);
    if (state === "delivered") return json(200, { ok: true });
    if (state === "limited") return json(429, { ok: false });
    if (state === "conflict") return json(409, { ok: false });
    if (state !== "reserved") return json(503, { ok: false });
    try {
      const headers = { "Content-Type": "application/json", "Idempotency-Key": inquiry.requestId };
      if (process.env.KLEXFORD_INQUIRY_WEBHOOK_TOKEN) headers.Authorization = "Bearer " + process.env.KLEXFORD_INQUIRY_WEBHOOK_TOKEN;
      const stored = await redis(["HGET", recordKey, "payload"]);
      const response = await fetch(destination, { method:"POST", headers, body:stored, redirect:"error", signal:AbortSignal.timeout(6000) });
      if (!response.ok) throw new Error("Receiver unavailable");
      await redis(["HSET", recordKey, "status", "delivered"]);
    } finally {
      await redis(["EVAL", "if redis.call('GET',KEYS[1]) == ARGV[1] then return redis.call('DEL',KEYS[1]) end return 0", "1", leaseKey, lease]);
    }
    return json(201, { ok: true });
  } catch {
    return json(503, { ok: false });
  }
}
