import { defineConfig, loadEnv, type Plugin, type Connect } from "vite";
import react from "@vitejs/plugin-react";
import inquiries from "./api/inquiries.js";
import inviteExpert from "./api/invite-expert.js";
import { audiences, resources, services, work } from "./src/data";
import { casePath, checklistIds, resourcePath } from "./src/lib/publicPaths";

// Reject misplaced server keys before Vite can embed them in a browser bundle.
function validateBrowserConfig(env: Record<string, string>) {
  const keys = [env.VITE_SUPABASE_PUBLISHABLE_KEY, env.VITE_SUPABASE_ANON_KEY].filter(Boolean);
  if (!keys.length) return;
  for (const key of keys) {
    if (key.startsWith("sb_publishable_")) continue;
    try {
      if (JSON.parse(Buffer.from(key.split(".")[1], "base64url").toString()).role === "anon") continue;
    } catch {}
    throw new Error("Use a Supabase publishable or anon key in browser configuration. Keep server keys in SUPABASE_SECRET_KEY.");
  }
  try {
    const url = new URL(env.VITE_SUPABASE_URL);
    if (["http:", "https:"].includes(url.protocol) && !url.username && !url.password) return;
  } catch {}
  throw new Error("Set VITE_SUPABASE_URL to the project's HTTP(S) URL.");
}

function localApi(env: Record<string, string>): Plugin {
  const routes = new Map([["/api/inquiries", inquiries], ["/api/invite-expert", inviteExpert]]);
  const middleware: Connect.NextHandleFunction = async (req, res, next) => {
    const handler = routes.get(req.url?.split("?")[0] ?? "");
    if (!handler) return next();
    const response = {
      setHeader: res.setHeader.bind(res),
      status(code: number) { res.statusCode = code; return this; },
      json(data: unknown) { res.setHeader("Content-Type", "application/json"); res.end(JSON.stringify(data)); },
    };
    try {
      const chunks: Buffer[] = [];
      let size = 0;
      for await (const chunk of req) {
        const bytes = Buffer.from(chunk);
        size += bytes.length;
        if (size > 24576) { response.status(413).json({ message: "Request exceeds the size limit." }); return; }
        chunks.push(bytes);
      }
      await handler({ method: req.method, headers: req.headers, socket: req.socket, body: Buffer.concat(chunks).toString("utf8") }, response, env);
    } catch { if (!res.headersSent) response.status(500).json({ message: "Unable to process the request." }); }
  };
  return {
    name: "workspace-local-api",
    configureServer(server) { server.middlewares.use(middleware); },
    configurePreviewServer(server) { server.middlewares.use(middleware); },
  };
}

function sitemapPlugin(publicUrl: string | undefined, previewDeployment: boolean): Plugin {
  return {
    name: "klexford-public-sitemap",
    apply: "build",
    generateBundle() {
      const rules = ["User-agent: *"];
      if (previewDeployment) {
        rules.push("Disallow: /");
      } else {
        rules.push("Disallow: /account/password", "Disallow: /login", "Disallow: /admin", "Disallow: /expert$", "Disallow: /expert/", "Disallow: /invoice/");
      }
      if (publicUrl && !previewDeployment) {
        const site = new URL(publicUrl);
        if (!["http:", "https:"].includes(site.protocol) || site.pathname !== "/" || site.username || site.password || site.search || site.hash) {
          throw new Error("Set PUBLIC_SITE_ORIGIN to the public HTTP(S) origin, such as https://your-domain.com.");
        }
        const paths = [
          "/", "/about", "/services", "/who-we-help", "/work", "/experts", "/become-an-expert",
          "/resources", "/tools", "/tools/visibility-check", "/book-author-services/book-marketing",
          "/start-a-project", "/privacy", "/terms",
          ...services.map(s => s.route), ...audiences.map(a => a.route),
          ...work.map(w => casePath(w.title)), ...resources.map(r => resourcePath(r.title)),
          ...checklistIds.map(id => "/tools/" + id)
        ];
        const locations = paths.map(path => `  <url><loc>${new URL(path, site).href}</loc></url>`);
        const xml = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">', ...locations, '</urlset>'];
        this.emitFile({ type: "asset", fileName: "sitemap.xml", source: xml.join("\n") + "\n" });
        rules.push("Sitemap: " + new URL("/sitemap.xml", site).href);
      }
      this.emitFile({ type: "asset", fileName: "robots.txt", source: rules.join("\n") + "\n" });
    }
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), ["PUBLIC_SITE_ORIGIN", "VERCEL", "SUPABASE_", "VITE_SUPABASE_", "UPSTASH_", "KLEXFORD_INQUIRY_"]);
  validateBrowserConfig(env);
  const vercelHost = env.VERCEL_PROJECT_PRODUCTION_URL;
  const origin = env.PUBLIC_SITE_ORIGIN || (vercelHost ? "https://" + vercelHost : undefined);
  return { plugins: [react(), localApi(env), sitemapPlugin(origin, env.VERCEL_ENV === "preview")] };
});
