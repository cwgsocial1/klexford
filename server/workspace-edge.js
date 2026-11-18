import project from "../config/public-supabase.json" with { type: "json" };

export function useHostedWorkspace(req, env) {
  if (env.VERCEL_ENV !== "production" || env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY)
    return false;
  const configured = [env.SUPABASE_URL, env.VITE_SUPABASE_URL].filter(Boolean);
  return (
    req.headers.host?.toLowerCase() === new URL(project.siteOrigin).host &&
    configured.every((url) => url.replace(/\/$/, "") === project.url)
  );
}

export function edgeEndpoint(action) {
  return new URL("/functions/v1/klexford-workspace/" + action, project.url).href;
}
