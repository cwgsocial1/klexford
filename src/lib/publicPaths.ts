export const slug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
export const portfolioUrl = (project: { id: string; legacy_slug?: string | null }) =>
  "/work/" + (project.legacy_slug || "p-" + project.id);
export const resourcePath = (title: string) => "/resources/" + slug(title);

export const checklistIds = ["book-launch-checklist", "website-inquiry-checklist"] as const;
