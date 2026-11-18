import {
  BookOpen, Code2, Workflow, TrendingUp, Palette,
  PenTool, Users, Building2, Home, CalendarCheck, Store,
  type LucideIcon,
} from "lucide-react";

export interface Service { slug: string; title: string; route: string; desc: string; items: string[]; icon: LucideIcon; image: string; }
export interface Audience { slug: string; title: string; route: string; desc: string; icon: LucideIcon; image: string; }

const u = (id: string, w = 1200) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;
export const IMG = {
  hero: u("photo-1522071820081-009f0129c71c"),
  about1: u("photo-1552664730-d307ca884978", 800), about2: u("photo-1556761175-5973dc0f32e7", 600), about3: u("photo-1600880292203-757bb62b4baf", 600),
  book_author_services: u("photo-1512820790803-83ca734da794"),
  website_development: u("photo-1460925895917-afdab827c52f"),
  crm_automation: u("photo-1551288049-bebda4e38f71"),
  growth_studio: u("photo-1533750349088-cd871a92f312"),
  branding_creative: u("photo-1561070791-2526d30994b5"),
  authors_publishers: u("photo-1455390582262-044cdead277a"),
  creators: u("photo-1611162617213-7d7a39e9b1d7"),
  agencies: u("photo-1519389950473-47ba0277781c"),
  home_services: u("photo-1581578731548-c64695cc6952"),
  appointments: u("photo-1576091160550-2173dba999ef"),
  local_businesses: u("photo-1556740758-90de374c12ad"),
  bookLaunch: u("photo-1544716278-ca5e3f4abd8c"),
  writing: u("photo-1586281380349-632531db7ed4"),
  office: u("photo-1497366216548-37526070297c"),
  p1: u("photo-1573496359142-b8d87734a5a2", 400), p2: u("photo-1507003211169-0a1dd7228f2d", 400),
  p3: u("photo-1494790108377-be9c29b29330", 400), p4: u("photo-1500648767791-00dcc994a43e", 400),
  p5: u("photo-1438761681033-6461ffad8d80", 400), p6: u("photo-1472099645785-5658abf4ff4e", 400),
};

export const services: Service[] = [
  { title: "Book & Author Services", route: "/book-author-services", slug: "book-author-services", image: IMG.book_author_services, icon: BookOpen,
    desc: "Book marketing first, plus everything an author needs to prepare, design and publish.",
    items: ["Book marketing", "Editing & proofreading", "Cover design", "Interior formatting", "EPUB conversion", "Publishing support"] },
  { title: "Website Design & Development", route: "/website-development", slug: "website-development", image: IMG.website_development, icon: Code2,
    desc: "Author and business websites built to explain clearly and convert visitors.",
    items: ["Author websites", "Business websites", "E-commerce", "Landing pages", "Sales funnels"] },
  { title: "CRM & Business Automation", route: "/crm-automation", slug: "crm-automation", image: IMG.crm_automation, icon: Workflow,
    desc: "Inquiries, bookings and follow-ups moved into one managed workflow.",
    items: ["GoHighLevel", "Pipelines", "Booking systems", "Integrations", "Follow-up workflows"] },
  { title: "The Growth Studio", route: "/growth-studio", slug: "growth-studio", image: IMG.growth_studio, icon: TrendingUp,
    desc: "Reach the right people and measure what works across every channel.",
    items: ["SEO", "Paid advertising", "Social media", "Email marketing", "SMS marketing", "Reporting"] },
  { title: "Branding & Creative Content", route: "/branding-creative", slug: "branding-creative", image: IMG.branding_creative, icon: Palette,
    desc: "Identity and content that make your work recognisable and memorable.",
    items: ["Brand identity", "Logos", "Campaign graphics", "Promotional video", "Social content"] },
];

export const audiences: Audience[] = [
  { title: "Authors & Publishers", route: "/who-we-help/authors-publishers", slug: "authors-publishers", image: IMG.authors_publishers, icon: PenTool,
    desc: "Book marketing, preparation, publishing support and author websites." },
  { title: "Creators & Personal Brands", route: "/who-we-help/creators", slug: "creators", image: IMG.creators, icon: Users,
    desc: "Portfolio websites, brand identity, content and inquiry management." },
  { title: "Agencies", route: "/who-we-help/agencies", slug: "agencies", image: IMG.agencies, icon: Building2,
    desc: "Scoped delivery support for websites, creative work and automation." },
  { title: "Home-Service Businesses", route: "/who-we-help/home-services", slug: "home-services", image: IMG.home_services, icon: Home,
    desc: "Websites, estimate inquiries, follow-up and campaigns — cleaning businesses included." },
  { title: "Appointment-Based Businesses", route: "/who-we-help/appointments", slug: "appointments", image: IMG.appointments, icon: CalendarCheck,
    desc: "Booking, CRM, reminders, websites and customer communication." },
  { title: "Local Businesses", route: "/who-we-help/local-businesses", slug: "local-businesses", image: IMG.local_businesses, icon: Store,
    desc: "Business websites, visibility, branding and organised customer inquiries." },
];

export const work: { title: string; tag: string; tone: string; image: string; summary: string }[] = [
  { title: "Debut novel launch campaign", tag: "Book Marketing", tone: "from-brand-500 to-indigo-600" , image: IMG.bookLaunch, summary: "Positioning review, launch plan, email sequence and promotional assets for a debut novelist." },
  { title: "Author website & newsletter", tag: "Website", tone: "from-emerald-500 to-teal-600" , image: IMG.authors_publishers, summary: "A fast author site with book pages, newsletter signup and reader journey." },
  { title: "Cleaning company booking CRM", tag: "Automation", tone: "from-amber-500 to-orange-600" , image: IMG.home_services, summary: "Estimate requests flow into a GoHighLevel pipeline with automatic follow-up and reminders." },
  { title: "Non-fiction cover & interior", tag: "Book Design", tone: "from-fuchsia-500 to-purple-600" , image: IMG.book_author_services, summary: "Cover design, paperback interior and EPUB conversion for a business book." },
  { title: "Local clinic SEO & ads", tag: "Growth Studio", tone: "from-sky-500 to-blue-700" , image: IMG.growth_studio, summary: "Local SEO clean-up and a paid search campaign with monthly reporting." },
  { title: "Coach brand identity", tag: "Branding", tone: "from-rose-500 to-pink-600" , image: IMG.branding_creative, summary: "Logo, colour palette, typography and social templates for a coaching brand." },
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
  { name: "Team Member", role: "Book Marketing Lead", initials: "BM", image: IMG.p1 },
  { name: "Team Member", role: "Web Development Lead", initials: "WD", image: IMG.p2 },
  { name: "Team Member", role: "CRM & Automation Lead", initials: "CA", image: IMG.p3 },
  { name: "Team Member", role: "Creative Director", initials: "CD", image: IMG.p4 },
  { name: "Team Member", role: "Editing & Proofreading Lead", initials: "EP", image: IMG.p5 },
  { name: "Team Member", role: "Growth Studio Lead", initials: "GS", image: IMG.p6 },
];

export const testimonials = [
  { quote: "Approved testimonial goes here — tied to the specific project it describes.", name: "Client Name", project: "Author · Book Marketing", image: IMG.p5 },
  { quote: "A second approved testimonial about a website or automation project.", name: "Client Name", project: "Cleaning business · CRM", image: IMG.p6 },
  { quote: "A third approved testimonial about branding or creative work.", name: "Client Name", project: "Coach · Brand identity", image: IMG.p3 },
];

export const faqs = [
  { q: "Can I commission just one service?", a: "Yes. Every service can be booked on its own, or combined into a coordinated package." },
  { q: "Who owns my project?", a: "Each offer has one identified team member responsible for scope, quality review and delivery." },
  { q: "Do you guarantee sales or rankings?", a: "No. We agree clear deliverables and report honestly on results — we never promise sales, reviews or bestseller status." },
  { q: "How is pricing set?", a: "Prices are confirmed after we agree scope. You receive an invoice with a secure payment link." },
];

export const resources = [
  { type: "Guide", title: "Planning a book launch: the first 90 days", image: IMG.bookLaunch },
  { type: "Checklist", title: "Manuscript-to-upload publishing checklist", image: IMG.writing },
  { type: "Assessment", title: "Is your website ready to take inquiries?", image: IMG.website_development },
  { type: "Guide", title: "Setting up follow-up workflows that feel personal", image: IMG.crm_automation },
  { type: "Checklist", title: "Brand identity essentials for small businesses", image: IMG.branding_creative },
  { type: "Guide", title: "Email vs SMS: choosing your customer channel", image: IMG.growth_studio },
];

export const tools = [
  { title: "Free Visibility Check", desc: "A scoped initial review of how easily people can find you.", route: "/tools/visibility-check" },
  { title: "Book Launch Readiness Checklist", desc: "Confirm your manuscript, assets and platform are launch-ready.", route: "/resources" },
  { title: "Website Inquiry Audit", desc: "Check whether your site turns visitors into qualified inquiries.", route: "/resources" },
];
