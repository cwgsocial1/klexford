import { createClient } from "@supabase/supabase-js";
import production from "../../config/public-supabase.json";

const configuredUrl = import.meta.env.VITE_SUPABASE_URL;
const configuredKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;
const useProductionProject = import.meta.env.PROD && window.location.origin === production.siteOrigin;
const url = configuredUrl || (useProductionProject ? production.url : undefined);
const key = configuredKey || (useProductionProject && url === production.url ? production.publishableKey : undefined);

export const supabase = url && key ? createClient(url, key) : null;
