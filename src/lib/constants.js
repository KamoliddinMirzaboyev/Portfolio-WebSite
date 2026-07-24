/** Asosiy profil — to'g'ri GitHub */
export const GITHUB_URL = "https://github.com/KamoliddinMirzaboyev";
export const GITHUB_HANDLE = "KamoliddinMirzaboyev";
export const TELEGRAM_URL = "https://t.me/MrMirzaboyev";
export const EMAIL = "Kamoliddinmirzaboyev2005@gmail.com";
export const PHONE = "+998889563848";
export const PHONE_DISPLAY = "+998 88 956 38 48";
export const LINKEDIN_URL =
  "https://www.linkedin.com/in/kamoliddin-mirzaboyev-8226a4329/";

/** SEO — Vercel domain yoki custom domain (.env da o'zgartiring) */
export const SITE_URL = (
  import.meta.env.VITE_SITE_URL || "https://kamoliddinmirzaboyev.vercel.app"
).replace(/\/$/, "");
export const SITE_NAME = "Kamoliddin Mirzaboyev";
export const SITE_TITLE =
  "Kamoliddin Mirzaboyev | Frontend Developer — React, TypeScript, Portfolio";
export const SITE_DESCRIPTION =
  "Kamoliddin Mirzaboyev — Farg'ona, O'zbekiston Frontend dasturchi. React, TypeScript, Vite. Portfolio: web loyihalar, yotoqxona CRM, e-commerce, landing. Frontend developer portfolio.";
export const SITE_KEYWORDS = [
  "Kamoliddin Mirzaboyev",
  "Kamoliddin Mirzaboyev Frontend",
  "Frontend Developer",
  "Frontend dasturchi",
  "React developer",
  "TypeScript developer",
  "portfolio",
  "web dasturchi",
  "yotoqxona",
  "yotoqxona CRM",
  "JoyBor",
  "loyiha",
  "web loyiha",
  "Vite",
  "O'zbekiston Frontend",
  "Farg'ona dasturchi",
  "Kamoliddinmirzaboyev",
].join(", ");
export const SITE_LOGO = "/icon.png";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/icon.png`;

/** Web3Forms public access key (client-side OK) */
export const WEB3FORMS_ACCESS_KEY =
  import.meta.env.VITE_WEB3FORMS_KEY ||
  "bfd7231f-54f0-4183-a53b-8d992f43ae37";

/**
 * Admin panel login (UI)
 * Login: admin
 * Parol: kamoliddin
 * Supabase Auth ichida email sifatida saqlanadi (login "admin" → shu email)
 */
export const ADMIN_LOGIN = "admin";
export const ADMIN_PASSWORD = "kamoliddin";
/** Supabase haqiqiy email format talab qiladi (.local yaroqsiz) */
export const ADMIN_AUTH_EMAIL =
  import.meta.env.VITE_ADMIN_EMAIL || "admin@kamoliddin.dev";
