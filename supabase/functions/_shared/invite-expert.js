import { createClient } from "@supabase/supabase-js";

function invitationOrigin(env, requestOrigin) {
  const configured =
    env.PUBLIC_SITE_ORIGIN ||
    (env.VERCEL_PROJECT_PRODUCTION_URL && "https://" + env.VERCEL_PROJECT_PRODUCTION_URL);
  try {
    const url = new URL(configured || requestOrigin);
    const local = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
    if ((configured && url.protocol === "https:") || (local && !env.VERCEL && url.protocol === "http:"))
      return url.origin;
  } catch {}
  return null;
}

function checkedInviteUrl(properties, projectUrl, redirectTo) {
  if (properties?.verification_type !== "invite" || !properties.hashed_token) return null;
  try {
    const action = new URL(properties.action_link);
    const expected = new URL("/auth/v1/verify", projectUrl);
    if (action.protocol !== "https:" || action.origin !== expected.origin || action.pathname !== expected.pathname ||
        action.username || action.password || properties.redirect_to !== redirectTo) return null;
    const params = new URLSearchParams({ token: properties.hashed_token, type: "invite", redirect_to: redirectTo });
    for (const [name, value] of params) {
      if (action.searchParams.get(name) !== value || action.searchParams.getAll(name).length !== 1) return null;
    }
    expected.search = params.toString();
    return expected.href;
  } catch {
    return null;
  }
}

export default async function inviteExpert(req, res, env = process.env) {
  res.setHeader("Cache-Control", "no-store");
  const fail = (code, message) => res.status(code).json({ message });
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return fail(405, "Use POST to invite an expert.");
  }
  const bearer = /^Bearer ([^\s]+)$/i.exec(req.headers.authorization || "")?.[1];
  if (!bearer) return fail(401, "Sign in to invite an expert.");
  try {
    if (req.headers.origin && new URL(req.headers.origin).host !== req.headers.host)
      return fail(403, "Open the invitation form on the workspace website.");
  } catch {
    return fail(403, "Invalid request origin.");
  }
  if (!req.headers["content-type"]?.startsWith("application/json")) return fail(415, "Send a JSON request.");
  let input;
  try {
    input = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  } catch {}
  const email = typeof input?.email === "string" ? input.email.trim().toLowerCase() : "";
  const name = typeof input?.name === "string" ? input.name.trim() : "";
  const delivery = input?.delivery ?? "email";
  if (delivery !== "email" && delivery !== "link") return fail(400, "Choose an invitation delivery method.");
  if (!name || name.length > 160 || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return fail(400, "Enter a name and a valid email address.");

  const url = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
  const secret = env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY;
  const origin = invitationOrigin(env, req.headers.origin);
  if (!url || !secret || !origin)
    return fail(503, "Expert invitations need the server’s Supabase credentials and public site origin.");
  try {
    const db = createClient(url, secret, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });
    const {
      data: { user },
      error: authError,
    } = await db.auth.getUser(bearer);
    if (authError || !user) return fail(401, "Your session has expired. Sign in again.");
    const { data: profile, error } = await db
      .from("profiles")
      .select("role,active")
      .eq("id", user.id)
      .maybeSingle();
    if (error) return fail(503, "Could not verify workspace access.");
    if (profile?.role !== "admin" || !profile.active)
      return fail(403, "Only an active administrator can invite experts.");
    const { data: existing, error: lookupError } = await db
      .from("profiles")
      .select("id")
      .eq("email", email)
      .limit(1);
    if (lookupError) return fail(503, "Could not check the team directory.");
    if (existing?.length)
      return fail(409, "This account already exists. Manage its access in the team directory.");
    const redirectTo = origin + "/account/password";
    if (delivery === "link") {
      // Auth can also regenerate invites for unconfirmed users. Only a newly
      // created user receives the metadata supplied by this invitation.
      const requestId = crypto.randomUUID();
      const { data, error } = await db.auth.admin.generateLink({
        type: "invite",
        email,
        options: { redirectTo, data: { display_name: name, invite_request_id: requestId } },
      });
      if (error) return fail(error.status === 429 ? 429 : 502, "Supabase could not create the invitation link.");
      if (data.user?.email?.toLowerCase() !== email || data.user.email_confirmed_at ||
          data.user.user_metadata?.invite_request_id !== requestId)
        return fail(409, "This account already exists. Manage its access in the team directory.");
      const inviteUrl = checkedInviteUrl(data.properties, url, redirectTo);
      if (!inviteUrl) return fail(502, "Check the project’s Auth URL and invitation redirect settings.");
      return res.status(201).json({ inviteUrl, message: "Invitation link created. Choose this expert’s access below." });
    }
    const { error: inviteError } = await db.auth.admin.inviteUserByEmail(email, {
      data: { display_name: name },
      redirectTo,
    });
    if (inviteError)
      return fail(
        inviteError.status === 429 ? 429 : 502,
        "Supabase could not send the invitation. Check email delivery and try again.",
      );
    return res
      .status(201)
      .json({ message: "Invitation sent. Select the expert below to enable access and assign permissions." });
  } catch {
    return fail(503, "The invitation service is temporarily unavailable.");
  }
}
