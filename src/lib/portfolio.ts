import { useEffect, useState } from "react";
import { supabase } from "./supabase";

export const mediaBucket = "portfolio-media";
export const portfolioUrl = (id: string) => "/work/p-" + id;
export type Publication = "draft" | "published";
export interface WorkPost {
  id: string;
  title: string;
  category: string;
  audience: string;
  summary: string;
  image_path: string | null;
  status: Publication;
  updated_at: string;
}
export interface ClientQuote {
  id: string;
  client_name: string;
  client_title: string;
  quote: string;
  status: Publication;
  updated_at: string;
}
export type DisplayWork = WorkPost & { image: string };
export const workColumns = "id,title,summary,category,audience,image_path,status,updated_at";
export const quoteColumns = "id,client_name,client_title,quote,status,updated_at";

export function contentClient() {
  if (!supabase) throw new Error("The content service has not been configured.");
  return supabase;
}

async function withCovers(rows: WorkPost[]): Promise<DisplayWork[]> {
  const paths = rows.flatMap(row => row.image_path ? [row.image_path] : []);
  const urls = new Map<string, string>();
  if (paths.length) {
    const { data } = await contentClient().storage.from(mediaBucket).createSignedUrls([...new Set(paths)], 3600);
    for (const item of data || []) {
      if (item.path && item.signedUrl && !item.error) urls.set(item.path, item.signedUrl);
    }
  }
  return rows.map(row => ({ ...row, image: urls.get(row.image_path || "") || "" }));
}

export function usePublishedWork({ id, category, audience, limit = 12, page = 0 }: {
  id?: string; category?: string; audience?: string; limit?: number; page?: number;
} = {}) {
  const [reload, setReload] = useState(0);
  const queryKey = JSON.stringify([id, category, audience, limit, page, reload]);
  const [result, setResult] = useState<{key: string; rows: DisplayWork[]; more: boolean; error: boolean} | null>(null);
  useEffect(() => {
    if (!supabase) return;
    let current = true;
    async function load() {
      let query = contentClient().from("portfolio_work").select(workColumns).eq("status", "published");
      if (id) query = query.eq("id", id);
      if (category) query = query.eq("category", category);
      if (audience) query = query.eq("audience", audience);
      const offset = page * limit;
      const { data, error } = await query.order("created_at", { ascending: false }).order("id").range(offset, offset + limit);
      if (error) throw error;
      const rows = await withCovers((data || []).slice(0, limit) as WorkPost[]);
      if (current) setResult({ key: queryKey, rows, more: (data?.length || 0) > limit, error: false });
    }
    void load().catch(() => {
      if (current) setResult({ key: queryKey, rows: [], more: false, error: true });
    });
    return () => { current = false; };
  }, [queryKey, id, category, audience, limit, page]);

  const latest = result?.key === queryKey ? result : null;
  return {
    rows: latest?.rows || [],
    loading: !!supabase && !latest,
    more: !!latest?.more,
    error: !!latest?.error,
    retry: () => setReload(n => n + 1),
  };
}

export function usePublishedQuotes() {
  const [page, setPage] = useState(0);
  const [retry, setRetry] = useState(0);
  const [result, setResult] = useState({ rows: [] as ClientQuote[], page: -1, more: false, error: false });
  useEffect(() => {
    if (!supabase) return;
    let current = true;
    const size = 6;
    const load = async () => {
      const {data, error} = await contentClient().from("testimonials").select(quoteColumns).eq("status", "published")
        .order("created_at", {ascending:false}).order("id").range(page * size, (page + 1) * size);
      if (error) throw error;
      if (!current) return;
      const next = (data || []).slice(0, size) as ClientQuote[];
      setResult(old => {
        const known = new Map((page === 0 ? [] : old.rows).map(quote => [quote.id, quote]));
        next.forEach(quote => known.set(quote.id, quote));
        return { rows: [...known.values()], page, more: (data?.length || 0) > size, error: false };
      });
    };
    void load().catch(() => { if (current) setResult(old => ({ ...old, error: true })); });
    return () => { current = false; };
  }, [page, retry]);
  return {
    rows: result.rows,
    more: result.more,
    loading: page !== result.page && !result.error,
    error: result.error,
    next: () => {
      if (result.error) {
        setResult(old => ({ ...old, error: false }));
        setRetry(n => n + 1);
      } else {
        setPage(p => p + 1);
      }
    },
  };
}
