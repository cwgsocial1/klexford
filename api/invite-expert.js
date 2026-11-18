import inviteExpert from "../supabase/functions/_shared/invite-expert.js";
import { edgeEndpoint, useHostedWorkspace } from "../server/workspace-edge.js";

export default async function invitations(req, res, env = process.env) {
  const edge = useHostedWorkspace(req, env);
  res.setHeader("Cache-Control", "no-store");
  if (req.method === "GET") return res.status(200).json({ edge });
  if (!edge || req.method !== "POST") return inviteExpert(req, res, env);

  // Existing POST-only clients can use this route. The browser discovers the
  // Edge endpoint first and sends its authenticated request directly.
  if (!/^Bearer \S+$/i.test(req.headers.authorization || ""))
    return res.status(401).json({ message: "Sign in to invite an expert." });
  if (!req.headers["content-type"]?.startsWith("application/json"))
    return res.status(415).json({ message: "Send a JSON request." });
  try {
    if (req.headers.origin && new URL(req.headers.origin).host !== req.headers.host)
      return res.status(403).json({ message: "Open the invitation form on the workspace website." });
  } catch {
    return res.status(403).json({ message: "Invalid request origin." });
  }
  const body = typeof req.body === "string" ? req.body : JSON.stringify(req.body ?? null);
  if (Buffer.byteLength(body) > 24576)
    return res.status(413).json({ message: "Request exceeds the size limit." });
  try {
    const response = await fetch(edgeEndpoint("invite-expert"), {
      method: "POST",
      headers: {
        Authorization: req.headers.authorization,
        "Content-Type": "application/json",
        ...(req.headers.origin && { Origin: req.headers.origin }),
      },
      body,
      redirect: "error",
      signal: AbortSignal.timeout(12000),
    });
    const reply = await response.json();
    return res.status(response.status).json({ message: reply.message });
  } catch {
    return res.status(503).json({ message: "The invitation service is temporarily unavailable." });
  }
}
