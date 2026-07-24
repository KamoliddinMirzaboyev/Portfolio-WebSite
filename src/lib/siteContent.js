import { supabase, isSupabaseConfigured } from "./supabase";
import { translations } from "../i18n/translations";

const uz = translations.uz;

/** Default kontent — tarjimalardan (uz) */
export function getDefaultSiteContent() {
  return {
    profile: {
      name: "Kamoliddin Mirzaboyev",
      initials: "KM",
      role: "Frontend · React · TypeScript",
      tags: ["Farg'ona", "O'zbekiston", uz.about.available],
    },
    hero: {
      badge: uz.hero.badge,
      job: uz.hero.job,
      info: uz.hero.info,
      projectsBtn: uz.hero.projectsBtn,
      contactBtn: uz.hero.contactBtn,
      stats: [
        { n: "1+", l: uz.hero.statExp },
        { n: "10+", l: uz.hero.statProjects },
        { n: "4.7", l: uz.hero.statGpa },
      ],
    },
    about: {
      badge: uz.about.badge,
      title: uz.about.title,
      p1: uz.about.p1,
      p2: uz.about.p2,
      available: uz.about.available,
    },
    experience: {
      badge: uz.experience.badge,
      title: uz.experience.title,
      items: uz.experience.items.map((it) => ({
        role: it.role,
        period: it.period,
        company: it.company || "",
        points: [...(it.points || [])],
      })),
    },
    skills: {
      badge: uz.skills.badge,
      title: uz.skills.title,
      items: uz.skills.items.map((it) => ({
        title: it.title,
        items: it.items,
      })),
    },
    education: {
      badge: uz.education.badge,
      title: uz.education.title,
      items: uz.education.items.map((it) => ({
        place: it.place,
        degree: it.degree,
        period: it.period,
        meta: it.meta || "",
      })),
    },
    portfolio_meta: {
      badge: uz.portfolio.badge,
      title: uz.portfolio.title,
      lead: uz.portfolio.lead,
    },
    contact_meta: {
      badge: uz.contact.badge,
      title: uz.contact.title,
      lead: uz.contact.lead,
    },
  };
}

export const CONTENT_SECTIONS = [
  { key: "profile", label: "Profil kartochka" },
  { key: "hero", label: "Hero (bosh)" },
  { key: "about", label: "Men haqimda" },
  { key: "experience", label: "Tajriba" },
  { key: "skills", label: "Ko'nikmalar" },
  { key: "education", label: "Ta'lim" },
  { key: "portfolio_meta", label: "Portfolio sarlavha" },
  { key: "contact_meta", label: "Aloqa sarlavha" },
];

function deepMerge(base, overlay) {
  if (!overlay || typeof overlay !== "object") return base;
  const out = Array.isArray(base) ? [...base] : { ...base };
  for (const [k, v] of Object.entries(overlay)) {
    if (
      v &&
      typeof v === "object" &&
      !Array.isArray(v) &&
      base?.[k] &&
      typeof base[k] === "object" &&
      !Array.isArray(base[k])
    ) {
      out[k] = deepMerge(base[k], v);
    } else if (v !== undefined && v !== null) {
      out[k] = v;
    }
  }
  return out;
}

/** Barcha bo'limlarni o'qiydi, default bilan birlashtiradi */
export async function fetchSiteContent() {
  const defaults = getDefaultSiteContent();
  if (!isSupabaseConfigured || !supabase) {
    return defaults;
  }

  try {
    const { data, error } = await supabase.from("site_content").select("key, value");
    if (error) {
      // jadval yo'q bo'lsa default
      return defaults;
    }
    const map = { ...defaults };
    for (const row of data || []) {
      if (row.key && row.value && defaults[row.key] !== undefined) {
        map[row.key] = deepMerge(defaults[row.key], row.value);
      } else if (row.key && row.value) {
        map[row.key] = row.value;
      }
    }
    return map;
  } catch {
    return defaults;
  }
}

export async function fetchSiteSection(key) {
  const defaults = getDefaultSiteContent();
  const fallback = defaults[key] || {};
  if (!isSupabaseConfigured || !supabase) return fallback;

  try {
    const { data, error } = await supabase
      .from("site_content")
      .select("value")
      .eq("key", key)
      .maybeSingle();
    if (error || !data?.value) return fallback;
    return deepMerge(fallback, data.value);
  } catch {
    return fallback;
  }
}

/** Bitta bo'limni saqlash (upsert) */
export async function saveSiteSection(key, value) {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error("Supabase sozlanmagan");
  }

  const { error } = await supabase.from("site_content").upsert(
    {
      key,
      value,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "key" }
  );

  if (error) {
    const msg = (error.message || "").toLowerCase();
    if (
      msg.includes("schema cache") ||
      msg.includes("does not exist") ||
      msg.includes("could not find the table")
    ) {
      throw new Error(
        "site_content jadvali yo'q. Supabase SQL: supabase/site_content.sql ni ishga tushiring."
      );
    }
    throw error;
  }
  return true;
}

export async function saveAllSiteContent(content) {
  const keys = Object.keys(content || {});
  for (const key of keys) {
    await saveSiteSection(key, content[key]);
  }
}
