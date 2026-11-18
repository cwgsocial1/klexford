import { useEffect, useState } from "react";
import { supabase } from "./supabase";

const defaults = { agency_name: "Klexford", contact_email: "hello@klexford.com" };
export function useSiteSettings() {
  const [settings, setSettings] = useState(defaults);
  useEffect(() => {
    let mounted = true;
    if (supabase)
      void supabase
        .from("site_settings")
        .select("agency_name,contact_email")
        .eq("id", true)
        .maybeSingle()
        .then(({ data }) => {
          if (mounted && data)
            setSettings({
              agency_name: data.agency_name || defaults.agency_name,
              contact_email: data.contact_email || defaults.contact_email,
            });
        });
    return () => {
      mounted = false;
    };
  }, []);
  return settings;
}
