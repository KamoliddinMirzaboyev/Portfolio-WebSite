import { supabase, isSupabaseConfigured } from "./supabase";

function slugify(text) {
  return String(text || "")
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9\u0400-\u04ff\s-]/gi, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80) || `project-${Date.now()}`;
}

/** Static fallback when Supabase yo'q yoki bo'sh */
export const DEFAULT_PROJECTS = [
  {
    id: "default-1",
    slug: "joybor",
    category: "featured",
    name: "JoyBor",
    img: "/mixel.png",
    gallery: ["/mixel.png", "/discover.jpg"],
    info: "Talabalar yotoqxonasini avtomatlashtirishga qaratilgan CRM tizimi.",
    description:
      "JoyBor — talabalar yotoqxonasi boshqaruvi uchun CRM.\n\n• Talaba qabuli va ro'yxatga olish\n• Xonalar va to'lovlar\n• Admin panel\n\nReact asosida qurilgan, real foydalanuvchilar uchun mo'ljallangan.",
    tech: ["React", "CRM", "2025"],
    github: "https://github.com/KamoliddinMirzaboyev",
    live: "https://joy-bor.uz",
    youtube_url: "",
    price: "",
    for_sale: true,
    sort_order: 1,
  },
  {
    id: "default-2",
    slug: "avtomaktab",
    category: "featured",
    name: "Avtomaktab",
    img: "/exclusive.jpg",
    gallery: ["/exclusive.jpg"],
    info: "Haydovchilik guvohnomasi uchun videodarslar va testlar platformasi.",
    description:
      "Avtomaktab — haydovchilik imtihoniga tayyorgarlik platformasi.\n\n• Videodarslar\n• Testlar\n• Progress tracking",
    tech: ["React", "Video", "2026"],
    github: "https://github.com/KamoliddinMirzaboyev",
    live: "https://autostarts.uz",
    youtube_url: "",
    price: "",
    for_sale: true,
    sort_order: 2,
  },
  {
    id: "default-3",
    slug: "mixel-ecommerce",
    category: "featured",
    name: "Mixel E-Commerce",
    img: "/discover.jpg",
    gallery: ["/discover.jpg"],
    info: "Online do'kon admin dashboard va e-commerce frontend.",
    description: "To'liq e-commerce frontend va admin dashboard yechimi.",
    tech: ["React", "REST API", "Swiper"],
    github: "https://github.com/KamoliddinMirzaboyev/Mixel-E-Commerse-",
    live: "https://mixel-os.netlify.app/",
    youtube_url: "",
    price: "",
    for_sale: false,
    sort_order: 3,
  },
];

function parseGallery(row) {
  if (Array.isArray(row.gallery)) return row.gallery.filter(Boolean);
  if (typeof row.gallery === "string" && row.gallery.trim()) {
    try {
      const j = JSON.parse(row.gallery);
      if (Array.isArray(j)) return j.filter(Boolean);
    } catch {
      return row.gallery.split(",").map((s) => s.trim()).filter(Boolean);
    }
  }
  return row.img ? [row.img] : [];
}

function normalizeProject(row) {
  const gallery = parseGallery(row);
  const cover = row.img || gallery[0] || "";
  return {
    id: row.id,
    slug: row.slug || slugify(row.name),
    name: row.name ?? "",
    info: row.info ?? "",
    description: row.description ?? row.info ?? "",
    img: cover,
    gallery: gallery.length ? gallery : cover ? [cover] : [],
    category: row.category ?? "featured",
    tech: Array.isArray(row.tech) ? row.tech : [],
    github: row.github ?? "",
    live: row.live ?? "",
    youtube_url: row.youtube_url ?? "",
    price: row.price ?? "",
    for_sale: Boolean(row.for_sale),
    sort_order: row.sort_order ?? 0,
    created_at: row.created_at,
  };
}

function tableMissing(error) {
  const m = (error?.message || "").toLowerCase();
  return (
    m.includes("schema cache") ||
    m.includes("could not find the table") ||
    m.includes("does not exist") ||
    error?.code === "42P01" ||
    error?.code === "PGRST205"
  );
}

function columnMissing(error) {
  const m = (error?.message || "").toLowerCase();
  return m.includes("column") && (m.includes("does not exist") || m.includes("schema cache"));
}

export async function fetchProjects() {
  if (!isSupabaseConfigured || !supabase) {
    return DEFAULT_PROJECTS;
  }

  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    return DEFAULT_PROJECTS;
  }

  if (!data?.length) {
    return DEFAULT_PROJECTS;
  }

  return data.map(normalizeProject);
}

export async function fetchProjectBySlugOrId(slugOrId) {
  if (!slugOrId) return null;

  if (!isSupabaseConfigured || !supabase) {
    return (
      DEFAULT_PROJECTS.find(
        (p) => p.slug === slugOrId || p.id === slugOrId
      ) || null
    );
  }

  let { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("slug", slugOrId)
    .maybeSingle();

  if ((!data || error) && slugOrId) {
    const byId = await supabase
      .from("projects")
      .select("*")
      .eq("id", slugOrId)
      .maybeSingle();
    data = byId.data;
    error = byId.error;
  }

  if (error || !data) {
    return (
      DEFAULT_PROJECTS.find(
        (p) => p.slug === slugOrId || p.id === slugOrId
      ) || null
    );
  }

  return normalizeProject(data);
}

function projectPayload(payload) {
  const slug = payload.slug?.trim() || slugify(payload.name);
  const gallery = Array.isArray(payload.gallery)
    ? payload.gallery.filter(Boolean)
    : [];
  const img = payload.img || gallery[0] || null;

  return {
    name: payload.name,
    slug,
    info: payload.info || null,
    description: payload.description || payload.info || null,
    img,
    gallery,
    category: payload.category || "featured",
    tech: payload.tech || [],
    github: payload.github || null,
    live: payload.live || null,
    youtube_url: payload.youtube_url || null,
    price: payload.price || null,
    for_sale: Boolean(payload.for_sale),
    sort_order: payload.sort_order ?? 0,
  };
}

/** Yangi ustunlar yo'q bo'lsa eski schema bilan yozish */
function projectPayloadLegacy(payload) {
  return {
    name: payload.name,
    info: payload.info || null,
    img: payload.img || null,
    category: payload.category || "featured",
    tech: payload.tech || [],
    github: payload.github || null,
    live: payload.live || null,
    sort_order: payload.sort_order ?? 0,
  };
}

export async function createProject(payload) {
  if (!supabase) throw new Error("Supabase sozlanmagan");

  const full = projectPayload(payload);
  let { data, error } = await supabase
    .from("projects")
    .insert(full)
    .select()
    .single();

  if (error && columnMissing(error)) {
    const legacy = projectPayloadLegacy(full);
    const retry = await supabase
      .from("projects")
      .insert(legacy)
      .select()
      .single();
    data = retry.data;
    error = retry.error;
    if (!error) {
      throw new Error(
        "Loyiha saqlandi, lekin detail ustunlar yo'q. SQL: supabase/projects_detail_columns.sql ni ishga tushiring."
      );
    }
  }

  if (error) {
    if (tableMissing(error)) {
      throw new Error(
        "Jadval yo'q: Supabase SQL Editor da SETUP_ALL.sql ni ishga tushiring."
      );
    }
    throw new Error(error.message || "Loyiha saqlanmadi");
  }
  return normalizeProject(data);
}

export async function updateProject(id, payload) {
  if (!supabase) throw new Error("Supabase sozlanmagan");

  const full = projectPayload(payload);
  let { data, error } = await supabase
    .from("projects")
    .update(full)
    .eq("id", id)
    .select()
    .single();

  if (error && columnMissing(error)) {
    const legacy = projectPayloadLegacy(full);
    const retry = await supabase
      .from("projects")
      .update(legacy)
      .eq("id", id)
      .select()
      .single();
    data = retry.data;
    error = retry.error;
    if (!error) {
      throw new Error(
        "Yangilandi (eski schema). Detail maydonlar uchun: projects_detail_columns.sql"
      );
    }
  }

  if (error) {
    if (tableMissing(error)) {
      throw new Error(
        "Jadval yo'q: Supabase SQL Editor da SETUP_ALL.sql ni ishga tushiring."
      );
    }
    throw new Error(error.message || "Yangilash xatosi");
  }
  return normalizeProject(data);
}

export async function deleteProject(id) {
  if (!supabase) throw new Error("Supabase sozlanmagan");

  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) {
    if (tableMissing(error)) {
      throw new Error(
        "Jadval yo'q: Supabase SQL Editor da SETUP_ALL.sql ni ishga tushiring."
      );
    }
    throw new Error(error.message || "O'chirish xatosi");
  }
}

export function youtubeEmbedUrl(url) {
  if (!url) return "";
  const u = String(url).trim();
  // already embed
  if (u.includes("youtube.com/embed/")) return u;
  // youtu.be/ID
  const short = u.match(/youtu\.be\/([a-zA-Z0-9_-]{6,})/);
  if (short) return `https://www.youtube.com/embed/${short[1]}`;
  // watch?v=ID
  const watch = u.match(/[?&]v=([a-zA-Z0-9_-]{6,})/);
  if (watch) return `https://www.youtube.com/embed/${watch[1]}`;
  // shorts
  const shorts = u.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{6,})/);
  if (shorts) return `https://www.youtube.com/embed/${shorts[1]}`;
  return "";
}

export { tableMissing, slugify };
