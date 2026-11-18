import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

export const permissionLabels = {
  "work.manage": "Add and edit portfolio drafts",
  "work.publish": "Publish and maintain portfolio work",
  "testimonials.manage": "Add and edit testimonial drafts",
  "testimonials.publish": "Publish and maintain testimonials",
  "invoices.manage": "Manage own invoices",
  "inquiries.manage": "Review submitted inquiries",
};
export type Permission = keyof typeof permissionLabels;
export type Role = "admin" | "expert";
export interface Profile {
  id: string;
  email: string;
  display_name: string;
  role: Role;
  permissions: Permission[];
  active: boolean;
}
interface AuthState {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  error: string;
  reload: () => void;
}
const AuthContext = createContext<AuthState | null>(null);
export const profileFields = "id,email,display_name,role,active,permissions";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null | undefined>(supabase ? undefined : null);
  const [loaded, setLoaded] = useState<{ id: string; profile: Profile | null; error: string } | null>(null);
  const [refresh, setRefresh] = useState(0);
  useEffect(() => {
    if (!supabase) return;
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
    return () => data.subscription.unsubscribe();
  }, []);
  const id = user?.id;
  useEffect(() => {
    if (!id || !supabase) {
      setLoaded(null);
      return;
    }
    const db = supabase;
    let current = true,
      revision = 0;
    async function load() {
      const version = ++revision;
      const { data, error } = await db.from("profiles").select(profileFields).eq("id", id!).maybeSingle();
      if (current && version === revision)
        setLoaded({
          id: id!,
          profile: data as Profile | null,
          error: error ? "We couldn’t load your workspace access. Check your connection and retry." : "",
        });
    }
    const whenVisible = () => {
      if (document.visibilityState === "visible") void load();
    };
    void load();
    window.addEventListener("focus", whenVisible);
    const timer = window.setInterval(whenVisible, 30000);
    return () => {
      current = false;
      clearInterval(timer);
      window.removeEventListener("focus", whenVisible);
    };
  }, [id, refresh]);
  const result = loaded?.id === id ? loaded : null;
  return (
    <AuthContext.Provider
      value={{
        user: user || null,
        profile: result?.profile || null,
        loading: user === undefined || Boolean(id && !result),
        error: result?.error || "",
        reload: () => setRefresh((n) => n + 1),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
export function useAuth() {
  const auth = useContext(AuthContext);
  if (!auth) throw new Error("This route needs an AuthProvider.");
  return auth;
}
export function usePortal() {
  const { profile } = useAuth();
  if (!profile?.active) throw new Error("This route needs active workspace access.");
  return {
    profile,
    can: (permission: Permission) => profile.role === "admin" || profile.permissions.includes(permission),
  };
}
