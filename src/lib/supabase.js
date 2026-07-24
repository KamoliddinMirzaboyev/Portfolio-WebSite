import { createClient } from "@supabase/supabase-js";

const url = String(import.meta.env.VITE_SUPABASE_URL || "")
  .trim()
  .replace(/\/$/, "");
const anonKey = String(import.meta.env.VITE_SUPABASE_ANON_KEY || "").trim();

export const isSupabaseConfigured = Boolean(
  url &&
    anonKey &&
    url.startsWith("https://") &&
    url.includes("supabase") &&
    anonKey.length > 20
);

/** Debug (maxfiy emas) — admin xabarlarida ishlatish mumkin */
export function getSupabaseConfigStatus() {
  const rawUrl = import.meta.env.VITE_SUPABASE_URL;
  const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  return {
    hasUrl: Boolean(rawUrl && String(rawUrl).trim()),
    hasKey: Boolean(rawKey && String(rawKey).trim()),
    urlHost: (() => {
      try {
        return url ? new URL(url).host : "";
      } catch {
        return "";
      }
    })(),
    configured: isSupabaseConfigured,
  };
}

export const supabase = isSupabaseConfigured
  ? createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    })
  : null;
