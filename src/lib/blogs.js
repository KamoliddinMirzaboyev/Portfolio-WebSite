import { supabase, isSupabaseConfigured } from "./supabase";
import { tableMissing } from "./projects";

export const DEFAULT_BLOGS = [
  {
    id: "default-blog-1",
    title: "React bilan boshlang'ich portfolio",
    slug: "react-portfolio-start",
    excerpt:
      "Zamonaviy portfolio sayt qanday quriladi: komponentlar, animatsiya va deploy.",
    content:
      "Bu maqolada React + Vite bilan shaxsiy portfolio qurish haqida gaplashamiz.\n\n1) Loyiha strukturasi\n2) Animatsiyalar\n3) Deploy (Vercel/Netlify)\n\nAmaliyotda real loyihalar orqali o'rganish eng samarali yo'l.",
    img: "/digital.jpg",
    link: "",
    published: true,
    sort_order: 1,
    created_at: new Date().toISOString(),
  },
  {
    id: "default-blog-2",
    title: "Frontend dasturchi uchun 5 maslahat",
    slug: "frontend-5-tips",
    excerpt: "Kod sifati, UI/UX va o'sish yo'nalishi haqida qisqa maslahatlar.",
    content:
      "1. Toza va o'qiladigan kod yozing.\n2. Responsive dizaynni unutmang.\n3. Git odatlarini mustahkamlang.\n4. Real loyihalar qiling.\n5. Doim o'rganing.",
    img: "/finsweet.jpg",
    link: "https://github.com/KamoliddinMirzaboyev",
    published: true,
    sort_order: 2,
    created_at: new Date().toISOString(),
  },
];

function slugify(text) {
  return String(text || "")
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9\u0400-\u04ff\s-]/gi, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80) || `post-${Date.now()}`;
}

function normalizeBlog(row) {
  return {
    id: row.id,
    title: row.title ?? "",
    slug: row.slug ?? "",
    excerpt: row.excerpt ?? "",
    content: row.content ?? "",
    img: row.img ?? "",
    link: row.link ?? "",
    published: row.published !== false,
    sort_order: row.sort_order ?? 0,
    created_at: row.created_at,
  };
}

/** Public: faqat published */
export async function fetchBlogs({ includeDrafts = false } = {}) {
  if (!isSupabaseConfigured || !supabase) {
    return DEFAULT_BLOGS;
  }

  let q = supabase
    .from("blogs")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (!includeDrafts) {
    q = q.eq("published", true);
  }

  const { data, error } = await q;

  if (error) {
    // jadval yo'q — default / bo'sh
    return includeDrafts ? [] : DEFAULT_BLOGS;
  }

  if (!data?.length) {
    return includeDrafts ? [] : DEFAULT_BLOGS;
  }

  return data.map(normalizeBlog);
}

export async function fetchBlogBySlugOrId(slugOrId) {
  if (!slugOrId) return null;

  if (!isSupabaseConfigured || !supabase) {
    return (
      DEFAULT_BLOGS.find(
        (b) => b.slug === slugOrId || b.id === slugOrId
      ) || null
    );
  }

  // slug bo'yicha
  let { data, error } = await supabase
    .from("blogs")
    .select("*")
    .eq("slug", slugOrId)
    .maybeSingle();

  if (!data && !error) {
    const byId = await supabase
      .from("blogs")
      .select("*")
      .eq("id", slugOrId)
      .maybeSingle();
    data = byId.data;
    error = byId.error;
  }

  if (error || !data) {
    return (
      DEFAULT_BLOGS.find(
        (b) => b.slug === slugOrId || b.id === slugOrId
      ) || null
    );
  }

  return normalizeBlog(data);
}

export async function createBlog(payload) {
  if (!supabase) throw new Error("Supabase sozlanmagan");

  const slug = payload.slug?.trim() || slugify(payload.title);

  const { data, error } = await supabase
    .from("blogs")
    .insert({
      title: payload.title,
      slug,
      excerpt: payload.excerpt || null,
      content: payload.content || null,
      img: payload.img || null,
      link: payload.link || null,
      published: payload.published !== false,
      sort_order: payload.sort_order ?? 0,
    })
    .select()
    .single();

  if (error) {
    if (tableMissing(error)) {
      throw new Error(
        "blogs jadvali yo'q: Supabase SQL Editor da SETUP_ALL.sql ni ishga tushiring."
      );
    }
    throw new Error(error.message || "Blog saqlanmadi");
  }
  return normalizeBlog(data);
}

export async function updateBlog(id, payload) {
  if (!supabase) throw new Error("Supabase sozlanmagan");

  const slug = payload.slug?.trim() || slugify(payload.title);

  const { data, error } = await supabase
    .from("blogs")
    .update({
      title: payload.title,
      slug,
      excerpt: payload.excerpt || null,
      content: payload.content || null,
      img: payload.img || null,
      link: payload.link || null,
      published: payload.published !== false,
      sort_order: payload.sort_order ?? 0,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    if (tableMissing(error)) {
      throw new Error(
        "blogs jadvali yo'q: Supabase SQL Editor da SETUP_ALL.sql ni ishga tushiring."
      );
    }
    throw new Error(error.message || "Blog yangilanmadi");
  }
  return normalizeBlog(data);
}

export async function deleteBlog(id) {
  if (!supabase) throw new Error("Supabase sozlanmagan");
  const { error } = await supabase.from("blogs").delete().eq("id", id);
  if (error) {
    if (tableMissing(error)) {
      throw new Error(
        "blogs jadvali yo'q: Supabase SQL Editor da SETUP_ALL.sql ni ishga tushiring."
      );
    }
    throw new Error(error.message || "O'chirish xatosi");
  }
}

export { slugify };
