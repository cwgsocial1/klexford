export const slug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
export const casePath = (title: string) => "/work/" + slug(title);
export const resourcePath = (title: string) => "/resources/" + slug(title);

export const checklistIds = ["book-launch-checklist", "website-inquiry-checklist"] as const;
