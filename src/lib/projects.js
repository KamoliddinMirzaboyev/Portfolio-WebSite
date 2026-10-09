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

/** Standart loyihalar — saytda darhol ko'rinadi, Supabase bo'lmasa ham to'liq ishlaydi */
export const DEFAULT_PROJECTS = [
  {
    id: "bg-remover",
    slug: "bg-remover",
    name: "BG Remover — Onlayn AI Fon Tozalagich",
    category: "startup",
    info: "100% brauzerda ishlovchi xavfsiz AI fon tozalagich: rasm serverga yuklanmaydi, ro'yxatdan o'tishsiz shaffof PNG yuklab olish.",
    description:
      "BG Remover — rasmlardan orqa fonni 1 soniyada avtomatik va sifatli olib tashlaydigan zamonaviy onlayn AI platformasi.\n\nAsosiy imkoniyatlar:\n• 100% Client-Side Private AI — barcha ishlov berish to'g'ridan-to'g'ri foydalanuvchi brauzerida bajariladi, rasmlar hech qanday tashqi serverga yuborilmaydi (to'liq maxfiylik)\n• Tezkor va Yuqori sifat rejimlari\n• Interaktiv Studio — «Oldin / Keyin» slayd taqqoslashi, chetlar yumshoqligini sozlash\n• Shaffof fon yoki yangi rangli fonlarni oson almashtirish\n• Yuqori aniqlikdagi HD PNG formatida bir zumda saqlab olish\n• Ro'yxatdan o'tmasdan va limitsiz bepul foydalanish.",
    img: "/bgremover.png",
    gallery: ["/bgremover.png", "/bgremover-studio.png"],
    tech: ["React", "Client-Side AI", "Canvas API", "PWA", "Vite", "Tailwind CSS"],
    github: "",
    live: "https://bgremover.webportfolio.uz/",
    sort_order: 0,
  },
  {
    id: "avazbek-avtotest",
    slug: "avazbek-avtotest",
    name: "Avazbek Avtotest",
    category: "featured",
    info: "Prava nazariy imtihoniga tayyorlaydigan to'liq onlayn ta'lim platformasi: YHQ testlari, video darsliklar va yo'l belgilari.",
    description:
      "Avazbek Avtotest — haydovchilik guvohnomasi (prava) olish uchun nazariy imtihonga tayyorlaydigan to'liq onlayn ta'lim platformasi.\n\nAsosiy imkoniyatlar:\n• Yo'l harakati qoidalari (YHQ) bo'yicha mavzulashtirilgan va tasodifiy testlar\n• Real imtihon simulyatori (taymer va xatoliklar tahlili bilan)\n• Video darsliklar hamda interaktiv yo'l belgilari katalogi\n• Qorong'i va yorug' mavzular (Dark / Light mode)\n• Yuqori darajadagi SEO va barcha qurilmalarga moslashuvchan dizayn.",
    img: "/avazbekavtotest.png",
    gallery: ["/avazbekavtotest.png"],
    tech: ["React", "Vite", "Tailwind CSS", "REST API", "SEO Optimization"],
    github: "",
    live: "https://www.avazbekavtotest.uz/",
    sort_order: 1,
  },
  {
    id: "barakali-bozor",
    slug: "barakali-bozor",
    name: "Barakali Bozor",
    category: "featured",
    info: "Oziq-ovqat va qishloq xo'jaligi mahsulotlari uchun qulay E-Commerce va Telegram Web App (TWA) platformasi.",
    description:
      "Barakali Bozor — foydalanuvchilarga sarxil meva-sabzavotlar, quruq mevalar va oziq-ovqat mahsulotlarini tez hamda qulay xarid qilish imkonini beruvchi zamonaviy e-commerce xizmati.\n\nAsosiy imkoniyatlar:\n• Telegram Web App (TWA) integratsiyasi — bot ichida bevosita ochilish\n• Mahsulotlar toifalari (mevalar, sabzavotlar, poliz, sut mahsulotlari)\n• Qulay qidiruv tizimi, interaktiv savat va buyurtmalarni rasmiylashtirish\n• Buyurtmalar tarixi va shaxsiy profil boshqaruvi\n• Tezkor kesh va optimallashtirilgan yuklanish tezligi.",
    img: "/barakali-bozor.png",
    gallery: ["/barakali-bozor.png"],
    tech: ["React", "Telegram Web App (TWA)", "Framer Motion", "REST API", "E-Commerce"],
    github: "",
    live: "https://www.barakali-bozor.uz/",
    sort_order: 2,
  },
  {
    id: "fdtu1al",
    slug: "fdtu1al",
    name: "FDTU 1-son Akademik Litseyi",
    category: "featured",
    info: "Farg'ona Davlat Texnika Universiteti 1-son Akademik Litseyining rasmiy axborot va ta'lim portali.",
    description:
      "Farg‘ona Davlat Texnika Universiteti qoshidagi 1-son Akademik Litseyining rasmiy veb-portali.\n\nAsosiy imkoniyatlar:\n• Litsey faoliyati, rahbariyat va o'qituvchilar tarkibi haqida batafsil ma'lumot\n• Ta'lim yo'nalishlari va o'quv dasturlari bilan tanishish\n• Qabul jarayoni, imtihon tartibi va mezonlari\n• Yangiliklar lentasi, fotogalereya va yutuqlar burchagi\n• O'quvchilar va ota-onalar uchun qulay aloqa va murojaat shakli.",
    img: "/fdtu1al.png",
    gallery: ["/fdtu1al.png"],
    tech: ["React", "Vite", "Responsive Design", "PWA", "Modern UI"],
    github: "",
    live: "https://www.fdtu1al.uz/",
    sort_order: 3,
  },
  {
    id: "qrmaker",
    slug: "qrmaker",
    name: "QR Maker — Onlayn Generator",
    category: "startup",
    info: "Bepul va ko'p funksiyali QR kod generator: maxsus dizayn, brend logotiplari va yuqori sifatli eksport.",
    description:
      "QR Maker — istalgan turdagi ma'lumotlar uchun professional QR kodlar yaratuvchi zamonaviy veb-ilova.\n\nAsosiy imkoniyatlar:\n• URL, Wi-Fi, vCard, matn, ijtimoiy tarmoqlar formatlarini qo'llab-quvvatlash\n• Ranglar, gradientlar, ramkalar va maxsus shablonlar bilan brendlash\n• QR kod markaziga logotip joylashtirish\n• Yuqori aniqlikdagi vektor va rastr formatlarda (PNG, SVG, PDF) saqlab olish\n• Ro'yxatdan o'tmasdan bir zumda foydalanish.",
    img: "/qrmaker.png",
    gallery: ["/qrmaker.png"],
    tech: ["React", "Canvas API", "SVG Generation", "PWA", "Vite"],
    github: "",
    live: "https://qrmaker.uz/",
    sort_order: 4,
  },
  {
    id: "barakali-admin",
    slug: "barakali-admin",
    name: "Barakali Bozor — Admin CRM",
    category: "startup",
    info: "Barakali Bozor savdo ekotizimini to'liq boshqarish, ombor qoldig'i va buyurtmalar tahlili uchun CRM tizimi.",
    description:
      "Barakali Bozor platformasining ma'murlar va menejerlar uchun mo'ljallangan yopiq boshqaruv CRM paneli.\n\nAsosiy imkoniyatlar:\n• Yangi buyurtmalarni real vaqt rejimida qabul qilish va holatini (status) boshqarish\n• Mahsulotlar katalogi, narxlar va qoldiqlarni tahrirlash\n• Yangi toifalar va aksiyalar yaratish\n• Xaridlar dinamikasi, daromad va mijozlar faolligi tahlili\n• PWA qo'llab-quvvatlovi va xavfsiz avtorizatsiya tizimi.",
    img: "/barakali-admin.png",
    gallery: ["/barakali-admin.png"],
    tech: ["React", "CRM Dashboard", "REST API", "PWA", "Role Auth"],
    github: "",
    live: "https://admin.barakali-bozor.uz/",
    sort_order: 5,
  },
  {
    id: "vocabify",
    slug: "vocabify",
    name: "Vocabify",
    category: "featured",
    info: "Ingliz tili so'zlarini samarali yodlash uchun interaktiv platforma: o'z to'plamlaringizni yarating, viktorinalar orqali mustahkamlang.",
    description:
      "Vocabify — ingliz tili (yoki istalgan til) so'z boyligini tizimli ravishda oshirish uchun mo'ljallangan onlayn lug'at va o'rganish platformasi.\n\nAsosiy imkoniyatlar:\n• Shaxsiy so'z to'plamlarini (kolleksiyalarni) yaratish va boshqarish\n• Tarjimani topish uslubidagi interaktiv viktorina (quiz) rejimi\n• So'zlarni audio orqali eshitib yodlash (talaffuzni tinglash)\n• Kunlik streak, aniqlik foizi va o'zlashtirish statistikasi bilan progress kuzatuvi\n• Tayyor to'plamlarni import qilish va 1000+ so'zni bir joyda saqlash imkoniyati.",
    img: "/vocabify-1.png",
    gallery: [
      "/vocabify-1.png",
      "/vocabify-2.png",
      "/vocabify-3.png",
      "/vocabify-4.png",
      "/vocabify-5.png",
    ],
    tech: ["React", "Vite", "Supabase", "REST API", "PWA"],
    github: "",
    live: "https://vocabify.webportfolio.uz/",
    sort_order: 6,
  },
  {
    id: "mixel-ecommerse",
    slug: "mixel-ecommerse",
    name: "Mixel E-Commerce",
    category: "featured",
    info: "Onlayn do'konlarni boshqarish va mahsulotlar savdosi uchun zamonaviy E-Commerce platformasi.",
    description:
      "Mixel E-Commerce — internet do'kon boshqaruvi va mahsulotlar savdosi uchun yaratilgan qulay platforma.\n\nAsosiy imkoniyatlar:\n• Real vaqt rejimida buyurtmalar va tovarlar hisobi\n• Mahsulotlar toifalari va zamonaviy slayderlar (SwiperJs)\n• Qulay savat va xarid mexanizmi.",
    img: "/mixel.png",
    gallery: ["/mixel.png"],
    tech: ["React", "Restful API", "SwiperJs"],
    github: "https://github.com/Kamoliddinmirzaboyev05/Mixel-E-Commerse-",
    live: "https://mixel-os.netlify.app/",
    sort_order: 7,
  },
  {
    id: "exclusive-ecommerse",
    slug: "exclusive-ecommerse",
    name: "Exclusive E-Commerce",
    category: "featured",
    info: "Zamonaviy internet-do'kon va savdo boshqaruvi interfeysi.",
    description:
      "Exclusive E-Commerce — mahsulotlar katalogi, qidiruv tizimi va xaridlar oqimini qulay boshqarish uchun mo'ljallangan e-commerce do'koni.",
    img: "/exclusive.jpg",
    gallery: ["/exclusive.jpg"],
    tech: ["React", "Restful API", "SwiperJs"],
    github: "https://github.com/Kamoliddinmirzaboyev05/Exclusive-E-Commerse-Site",
    live: "https://exclusive-ecommerse-site.netlify.app/",
    sort_order: 8,
  },
  {
    id: "greenshop",
    slug: "greenshop",
    name: "GreenShop",
    category: "featured",
    info: "O'simliklar va tabiat mahsulotlari uchun maxsus online do'kon platformasi.",
    description:
      "GreenShop — uy o'simliklari, gullar va bog'dorchilik buyumlari savdosi uchun qulay filtrlar va savat tizimiga ega veb-ilova.",
    img: "/greenshop.jpg",
    gallery: ["/greenshop.jpg"],
    tech: ["React", "Local Storage", "SwiperJs"],
    github: "https://github.com/Kamoliddinmirzaboyev05/GreenShop",
    live: "https://greenshop-mkm.netlify.app/",
    sort_order: 9,
  },
  {
    id: "finsweet",
    slug: "finsweet",
    name: "Finsweet",
    category: "featured",
    info: "Ko'p sahifali korporativ biznes va agentlik veb-sayti.",
    description:
      "Finsweet — biznes tashkilotlari uchun zamonaviy UI/UX tamoyillari asosida ishlab chiqilgan ko'p sahifali rasmiy korporativ sayt.",
    img: "/finsweet.jpg",
    gallery: ["/finsweet.jpg"],
    tech: ["React", "Multi Page", "CSS3"],
    github: "https://github.com/Kamoliddinmirzaboyev05/Finsweet-React.git",
    live: "https://finsweet-react-mkm.vercel.app/",
    sort_order: 10,
  },
  {
    id: "planto",
    slug: "planto",
    name: "Planto",
    category: "featured",
    info: "Estetik dizayn va zamonaviy animatsiyalarga ega landing page.",
    description:
      "Planto — toza va vizual jozibador landing page loyihasi bo'lib, unikal soyalar va interaktiv elementlarga ega.",
    img: "/planto.jpg",
    gallery: ["/planto.jpg"],
    tech: ["React", "Drop Shadow", "Landing Page"],
    github: "https://github.com/Kamoliddinmirzaboyev05/Planto-First-React-",
    live: "https://planto-firt-react-mkm.netlify.app/",
    sort_order: 11,
  },
  {
    id: "devfinder",
    slug: "devfinder",
    name: "DevFinder",
    category: "featured",
    info: "GitHub dasturchilar profillarini qidirish va statistikani ko'rish ilovasi.",
    description:
      "DevFinder — GitHub REST API orqali dasturchilar profillarini tezkor qidirish, ularning repozitoriyalari, obunachilari va faolligini ko'rsatuvchi interaktiv vosita.",
    img: "/devfinder.jpg",
    gallery: ["/devfinder.jpg"],
    tech: ["React", "GitHub REST API", "Dark/Light Mode"],
    github: "",
    live: "https://devfinder-github-mkm.netlify.app/",
    sort_order: 12,
  },
  {
    id: "taqvim",
    slug: "taqvim",
    name: "Taqvim (Namoz Vaqtlari)",
    category: "featured",
    info: "Hududlar bo'yicha aniq namoz vaqtlari va hijriy taqvim ilovasi.",
    description:
      "Taqvim — O'zbekiston hududlari bo'yicha real vaqt rejimida aniq namoz vaqtlari va kunlik tartibni hisoblab beruvchi qulay veb-dastur.",
    img: "/taqvim.jpg",
    gallery: ["/taqvim.jpg"],
    tech: ["HTML & CSS", "JavaScript", "Aladhan API"],
    github: "https://github.com/Kamoliddinmirzaboyev05/Namoz-Vaqtlari-APP",
    live: "https://taqvim-mkm.netlify.app/",
    sort_order: 13,
  },
  {
    id: "image-generator",
    slug: "image-generator",
    name: "Image Generator",
    category: "featured",
    info: "Unsplash API orqali yuqori sifatli rasmlarni qidirish va yuklab olish.",
    description:
      "Image Generator — Unsplash API integratsiyasi orqali turli mavzulardagi HD suratlarni qidirish va saqlash ilovasi.",
    img: "/imagegenerator.jpg",
    gallery: ["/imagegenerator.jpg"],
    tech: ["JavaScript", "Unsplash API", "Local Storage"],
    github: "",
    live: "",
    sort_order: 14,
  },
  {
    id: "rolex",
    slug: "rolex",
    name: "Rolex Premium",
    category: "static",
    info: "Premium soatlar brendi uchun vizual interaktiv taqdimot veb-sayti.",
    description:
      "Rolex Premium — hashamatli dizayn, qorong'i va yorug' mavzular hamda silliq o'tishlar bilan yaratilgan rasmiy landing page prototipi.",
    img: "/rolex.jpg",
    gallery: ["/rolex.jpg"],
    tech: ["HTML & CSS", "JavaScript", "Dark - Light Mode"],
    github: "https://github.com/Kamoliddinmirzaboyev05/Rolex",
    live: "https://rolex-mkm.netlify.app/",
    sort_order: 15,
  },
  {
    id: "todo-app",
    slug: "todo-app",
    name: "To-Do / Task Manager",
    category: "static",
    info: "Kunlik vazifalarni rejalashtirish va unumdorlikni oshirish ilovasi.",
    description:
      "To-Do App — kunlik rejalarni boshqarish, vazifalar holatini belgilash va unumdorlikni oshirish uchun qulay interfeys.",
    img: "/todo.jpg",
    gallery: ["/todo.jpg"],
    tech: ["HTML & CSS", "JavaScript", "Local Storage"],
    github: "https://github.com/Kamoliddinmirzaboyev05/To-Do-App",
    live: "https://todolist-mkm.netlify.app/",
    sort_order: 16,
  },
  {
    id: "discover-ecommerse",
    slug: "discover-ecommerse",
    name: "Discover E-Commerce",
    category: "static",
    info: "JavaScript va Fetch API bilan qurilgan to'liq savatli elektron tijorat loyihasi.",
    description:
      "Discover E-Commerce — mahsulotlarni qidirish, saralash, savatga qo'shish va mahalliy xotirada saqlash imkoniyatiga ega internet-do'kon.",
    img: "/discover.jpg",
    gallery: ["/discover.jpg"],
    tech: ["JavaScript", "Fetch API", "Local Storage"],
    github: "https://github.com/Kamoliddinmirzaboyev05/eCommerse-Big-JS-Project",
    live: "https://ecommerse-mkm.netlify.app/",
    sort_order: 17,
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
    return DEFAULT_PROJECTS.map(normalizeProject);
  }

  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error || !data?.length) {
    return DEFAULT_PROJECTS.map(normalizeProject);
  }

  return data.map(normalizeProject);
}

export async function fetchProjectBySlugOrId(slugOrId) {
  if (!slugOrId) return null;

  if (!isSupabaseConfigured || !supabase) {
    const found = DEFAULT_PROJECTS.find(
      (p) => p.slug === slugOrId || String(p.id) === String(slugOrId)
    );
    return found ? normalizeProject(found) : null;
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
    const found = DEFAULT_PROJECTS.find(
      (p) => p.slug === slugOrId || String(p.id) === String(slugOrId)
    );
    return found ? normalizeProject(found) : null;
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
