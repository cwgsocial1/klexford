import project from "../../config/public-supabase.json";

export function workspaceEndpoint(action: "inquiries" | "invite-expert", edge: boolean) {
  if (!edge) return "/api/" + action;
  if (window.location.origin !== project.siteOrigin) throw new Error("Unexpected workspace origin.");
  return new URL("/functions/v1/klexford-workspace/" + action, project.url).href;
}
