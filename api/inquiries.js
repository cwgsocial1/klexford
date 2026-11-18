import recordInquiry from "../supabase/functions/_shared/inquiries.js";
import { edgeEndpoint, useHostedWorkspace } from "../server/workspace-edge.js";

export default function inquiries(req, res, env = process.env) {
  const crmReady = env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN && env.KLEXFORD_INQUIRY_WEBHOOK;
  if (crmReady || !useHostedWorkspace(req, env)) return recordInquiry(req, res, env);

  res.setHeader("Cache-Control", "no-store");
  if (req.method === "GET") return res.status(200).json({ live: true, edge: true });
  if (req.method === "POST") {
    res.setHeader("Location", edgeEndpoint("inquiries"));
    return res.status(307).json({ ok: false, message: "Submit the inquiry to the workspace endpoint." });
  }
  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({ ok: false });
}
