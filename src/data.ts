import {
  BookOpen, Code2, Workflow, TrendingUp, Palette,
  PenTool, Users, Building2, Home, CalendarCheck, Store,
  type LucideIcon,
} from "lucide-react";

export interface Service { title: string; route: string; desc: string; items: string[]; icon: LucideIcon; }
export interface Audience { title: string; route: string; desc: string; icon: LucideIcon; }

export const services: Service[] = [
  { title: "Book & Author Services", route: "#services", icon: BookOpen,
    desc: "Book marketing first, plus everything an author needs to prepare, design and publish.",
    items: ["Book marketing", "Editing & proofreading", "Cover design", "Interior formatting", "EPUB conversion", "Publishing support"] },
  { title: "Website Design & Development", route: "#services", icon: Code2,
    desc: "Author and business websites built to explain clearly and convert visitors.",
    items: ["Author websites", "Business websites", "E-commerce", "Landing pages", "Sales funnels"] },
  { title: "CRM & Business Automation", route: "#services", icon: Workflow,
    desc: "Inquiries, bookings and follow-ups moved into one managed workflow.",
    items: ["GoHighLevel", "Pipelines", "Booking systems", "Integrations", "Follow-up workflows"] },
  { title: "The Growth Studio", route: "#services", icon: TrendingUp,
    desc: "Reach the right people and measure what works across every channel.",
    items: ["SEO", "Paid advertising", "Social media", "Email marketing", "SMS marketing", "Reporting"] },
  { title: "Branding & Creative Content", route: "#services", icon: Palette,
    desc: "Identity and content that make your work recognisable and memorable.",
    items: ["Brand identity", "Logos", "Campaign graphics", "Promotional video", "Social content"] },
];

export const audiences: Audience[] = [
  { title: "Authors & Publishers", route: "#who", icon: PenTool,
    desc: "Book marketing, preparation, publishing support and author websites." },
  { title: "Creators & Personal Brands", route: "#who", icon: Users,
    desc: "Portfolio websites, brand identity, content and inquiry management." },
  { title: "Agencies", route: "#who", icon: Building2,
    desc: "Scoped delivery support for websites, creative work and automation." },
  { title: "Home-Service Businesses", route: "#who", icon: Home,
    desc: "Websites, estimate inquiries, follow-up and campaigns — cleaning businesses included." },
  { title: "Appointment-Based Businesses", route: "#who", icon: CalendarCheck,
    desc: "Booking, CRM, reminders, websites and customer communication." },
  { title: "Local Businesses", route: "#who", icon: Store,
    desc: "Business websites, visibility, branding and organised customer inquiries." },
];

export const work = [
  { title: "Debut novel launch campaign", tag: "Book Marketing", tone: "from-brand-500 to-indigo-600" },
  { title: "Author website & newsletter", tag: "Website", tone: "from-emerald-500 to-teal-600" },
  { title: "Cleaning company booking CRM", tag: "Automation", tone: "from-amber-500 to-orange-600" },
  { title: "Non-fiction cover & interior", tag: "Book Design", tone: "from-fuchsia-500 to-purple-600" },
  { title: "Local clinic SEO & ads", tag: "Growth Studio", tone: "from-sky-500 to-blue-700" },
  { title: "Coach brand identity", tag: "Branding", tone: "from-rose-500 to-pink-600" },
];

export const steps = [
  { n: "01", title: "Understand", desc: "We learn your goals, audience, timeline and what already exists." },
  { n: "02", title: "Agree scope", desc: "Deliverables, dates, responsibilities and costs are confirmed in writing." },
  { n: "03", title: "Deliver & review", desc: "The owning team member delivers, then quality-reviews before handover." },
  { n: "04", title: "Hand over or support", desc: "You receive everything you need — or we continue with ongoing support." },
];

export const plans = [
  { title: "Scoped Project", desc: "One clearly defined service with fixed deliverables and dates.",
    points: ["Single service owner", "Written scope", "Quality review", "Full handover"] },
  { title: "Launch Campaign", desc: "Connected services coordinated around a launch or release.", featured: true,
    points: ["Multi-service team", "Campaign plan", "Shared timeline", "Post-launch review"] },
  { title: "Monthly Support", desc: "Ongoing growth, content or automation support each month.",
    points: ["Dedicated contact", "Monthly priorities", "Reporting", "Flexible scope"] },
];

export const team = [
  { name: "Team Member", role: "Book Marketing Lead", initials: "BM" },
  { name: "Team Member", role: "Web Development Lead", initials: "WD" },
  { name: "Team Member", role: "CRM & Automation Lead", initials: "CA" },
  { name: "Team Member", role: "Creative Director", initials: "CD" },
];

export const resources = [
  { type: "Guide", title: "Planning a book launch: the first 90 days" },
  { type: "Checklist", title: "Manuscript-to-upload publishing checklist" },
  { type: "Assessment", title: "Is your website ready to take inquiries?" },
];
