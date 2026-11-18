import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { audiences, resources, services, work } from "./src/data";
import { casePath, checklistIds, resourcePath } from "./src/lib/publicPaths";

function sitemapPlugin(publicUrl: string | undefined, previewDeployment: boolean): Plugin {
  return {
    name: "klexford-public-sitemap",
    apply: "build",
    generateBundle() {
      const rules = ["User-agent: *"];
      if (previewDeployment) {
        rules.push("Disallow: /");
      } else {
        rules.push("Disallow: /login", "Disallow: /admin", "Disallow: /expert$", "Disallow: /expert/", "Disallow: /invoice/");
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
  const env = loadEnv(mode, process.cwd(), ["PUBLIC_SITE_ORIGIN", "VERCEL_"]);
  const vercelHost = env.VERCEL_PROJECT_PRODUCTION_URL;
  const origin = env.PUBLIC_SITE_ORIGIN || (vercelHost ? "https://" + vercelHost : undefined);
  return { plugins: [react(), sitemapPlugin(origin, env.VERCEL_ENV === "preview")] };
});
