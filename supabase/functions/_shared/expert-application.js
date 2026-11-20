const specialties = new Map([
  ["book-author-services", "Book & Author Services"],
  ["website-development", "Website Design & Development"],
  ["crm-automation", "CRM & Business Automation"],
  ["growth-studio", "The Growth Studio"],
  ["branding-creative", "Branding & Creative Content"],
]);

export function applicationMetadata(name, details) {
  if (details?.expertRegistration !== "true" || typeof name !== "string" || !name.trim() ||
      name.length > 160 || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(name.trim())) return null;
  const specialty = specialties.get(details.department);
  const { experience, availability, portfolio = "", timeZone = "" } = details;
  if (!specialty || typeof experience !== "string" || !experience.trim() || experience.length > 600 ||
      typeof availability !== "string" || !availability.trim() || availability.length > 160 ||
      typeof timeZone !== "string" || timeZone.length > 80 || typeof portfolio !== "string") return null;
  let portfolioUrl = "";
  if (portfolio) {
    try {
      const url = new URL(portfolio);
      if (!portfolio.startsWith("https://") || /[\s\\]/.test(portfolio) || url.username || url.password || url.href.length > 2048) return null;
      portfolioUrl = url.href;
    } catch { return null; }
  }
  return {
    expert_registration: true, display_name: name.trim(), specialty, bio: experience.trim(),
    portfolio_url: portfolioUrl, availability: availability.trim(), time_zone: timeZone.trim(),
  };
}
