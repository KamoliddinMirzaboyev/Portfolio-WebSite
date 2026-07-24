import { supabase, isSupabaseConfigured } from "./supabase";
import { translations } from "../i18n/translations";

const uz = translations.uz;
const LOCAL_STORAGE_KEY = "portfolio_site_content_v1";

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

/**
 * Saqlangan bo'lim + default.
 * Array maydonlar (items/stats/tags) — saqlangan qiymat to'liq ustun:
 * o'chirilgan elementlar qayta default dan chiqmasin.
 */
export function mergeSection(defaults, saved) {
  if (!saved || typeof saved !== "object" || Array.isArray(saved)) {
    return structuredClone(defaults);
  }
  const base = structuredClone(defaults || {});
  const out = { ...base, ...saved };

  for (const key of Object.keys(out)) {
    if (Array.isArray(saved[key])) {
      out[key] = saved[key].map((item) =>
        item && typeof item === "object" && !Array.isArray(item)
          ? { ...item }
          : item
      );
    } else if (
      saved[key] &&
      typeof saved[key] === "object" &&
      !Array.isArray(saved[key]) &&
      base[key] &&
      typeof base[key] === "object" &&
      !Array.isArray(base[key])
    ) {
      out[key] = { ...base[key], ...saved[key] };
    }
  }
  return out;
}

function readLocalCache() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

function writeLocalCache(map) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(map));
  } catch {
    /* quota */
  }
}

function mergeAll(defaults, overlay) {
  const map = structuredClone(defaults);
  if (!overlay || typeof overlay !== "object") return map;
  for (const key of Object.keys(defaults)) {
    if (overlay[key] != null) {
      map[key] = mergeSection(defaults[key], overlay[key]);
    }
  }
  return map;
}

function isTableMissing(error) {
  const msg = (error?.message || "").toLowerCase();
  return (
    msg.includes("schema cache") ||
    msg.includes("does not exist") ||
    msg.includes("could not find the table") ||
    error?.code === "42P01" ||
    error?.code === "PGRST205"
  );
}

function friendlyError(error) {
  const msg = String(error?.message || error || "");
  if (/failed to fetch|networkerror|network/i.test(msg)) {
    return "Tarmoq xatosi. Internet yoki Supabase URL ni tekshiring.";
  }
  if (isTableMissing(error)) {
    return "site_content jadvali yo'q. Supabase SQL: supabase/site_content.sql";
  }
  return msg || "Noma'lum xato";
}

/** Barcha bo'limlarni o'qiydi */
export async function fetchSiteContent() {
  const defaults = getDefaultSiteContent();
  const local = readLocalCache();

  if (!isSupabaseConfigured || !supabase) {
    return local ? mergeAll(defaults, local) : defaults;
  }

  try {
    const { data, error } = await supabase
      .from("site_content")
      .select("key, value");

    if (error) {
      if (local) return mergeAll(defaults, local);
      return defaults;
    }

    const overlay = {};
    for (const row of data || []) {
      if (row?.key && row.value != null) {
        overlay[row.key] =
          typeof row.value === "string"
            ? JSON.parse(row.value)
            : row.value;
      }
    }
    const merged = mergeAll(defaults, overlay);
    // remote muvaffaqiyatli — local cache sync
    writeLocalCache(
      Object.fromEntries(
        Object.keys(defaults).map((k) => [k, merged[k]])
      )
    );
    return merged;
  } catch {
    return local ? mergeAll(defaults, local) : defaults;
  }
}

/** Bitta bo'limni saqlash (Supabase + local) */
export async function saveSiteSection(key, value) {
  const clean = structuredClone(value ?? {});

  // Avval local — hech bo'lmaganda saqlansin
  const defaults = getDefaultSiteContent();
  const local = readLocalCache() || {};
  local[key] = clean;
  writeLocalCache(local);

  if (!isSupabaseConfigured || !supabase) {
    // local-only rejim
    return { ok: true, source: "local" };
  }

  const { error } = await supabase.from("site_content").upsert(
    {
      key,
      value: clean,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "key" }
  );

  if (error) {
    const err = new Error(friendlyError(error));
    err.cause = error;
    // local saqlangan — foydalanuvchiga ham aytamiz
    err.localSaved = true;
    throw err;
  }

  return { ok: true, source: "remote" };
}

/** Defaultga qaytarib saqlash */
export async function resetSiteSection(key) {
  const def = getDefaultSiteContent()[key];
  if (!def) throw new Error("Noma'lum bo'lim");
  return saveSiteSection(key, def);
}

export { friendlyError };
