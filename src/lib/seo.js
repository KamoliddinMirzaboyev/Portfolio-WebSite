import {
  DEFAULT_OG_IMAGE,
  EMAIL,
  GITHUB_URL,
  LINKEDIN_URL,
  PHONE,
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  SITE_NAME,
  SITE_TITLE,
  SITE_URL,
  TELEGRAM_URL,
} from "./constants";

function upsertMeta(attr, key, content) {
  if (content == null || content === "") return;
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertLink(rel, href) {
  if (!href) return;
  let el = document.head.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

function upsertJsonLd(id, data) {
  let el = document.getElementById(id);
  if (!el) {
    el = document.createElement("script");
    el.type = "application/ld+json";
    el.id = id;
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

/** Sahifa SEO — title, description, OG, Twitter, canonical, JSON-LD */
export function applySeo({
  title,
  description = SITE_DESCRIPTION,
  path = "/",
  image = DEFAULT_OG_IMAGE,
  type = "website",
  keywords = SITE_KEYWORDS,
  noindex = false,
  jsonLd,
} = {}) {
  const fullTitle = title
    ? title.includes(SITE_NAME)
      ? title
      : `${title} | ${SITE_NAME}`
    : SITE_TITLE;
  const url = `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
  const img = image?.startsWith("http")
    ? image
    : `${SITE_URL}${image?.startsWith("/") ? image : `/${image || "mixel.png"}`}`;

  document.title = fullTitle;
  document.documentElement.lang =
    document.documentElement.lang || "uz";

  upsertMeta("name", "description", description);
  upsertMeta("name", "keywords", keywords);
  upsertMeta("name", "author", SITE_NAME);
  upsertMeta(
    "name",
    "robots",
    noindex
      ? "noindex, nofollow"
      : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
  );
  upsertMeta("name", "googlebot", noindex ? "noindex, nofollow" : "index, follow");

  upsertLink("canonical", url);

  upsertMeta("property", "og:type", type);
  upsertMeta("property", "og:site_name", SITE_NAME);
  upsertMeta("property", "og:title", fullTitle);
  upsertMeta("property", "og:description", description);
  upsertMeta("property", "og:url", url);
  upsertMeta("property", "og:image", img);
  upsertMeta("property", "og:locale", "uz_UZ");
  upsertMeta("property", "og:locale:alternate", "en_US");
  upsertMeta("property", "og:locale:alternate", "ru_RU");

  upsertMeta("name", "twitter:card", "summary_large_image");
  upsertMeta("name", "twitter:title", fullTitle);
  upsertMeta("name", "twitter:description", description);
  upsertMeta("name", "twitter:image", img);

  if (jsonLd) {
    const list = Array.isArray(jsonLd) ? jsonLd : [jsonLd];
    list.forEach((item, i) => {
      upsertJsonLd(`seo-jsonld-${i}`, item);
    });
  }
}

export function personJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: SITE_NAME,
    alternateName: [
      "Kamoliddinmirzaboyev",
      "Kamoliddin Mirzaboyev Frontend",
      GITHUB_URL.split("/").pop(),
    ],
    url: SITE_URL,
    image: DEFAULT_OG_IMAGE,
    jobTitle: "Frontend Developer",
    description: SITE_DESCRIPTION,
    email: EMAIL,
    telephone: PHONE,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Farg'ona",
      addressCountry: "UZ",
    },
    knowsAbout: [
      "Frontend Development",
      "React",
      "TypeScript",
      "JavaScript",
      "Vite",
      "Web development",
      "CRM",
      "E-commerce",
      "Yotoqxona avtomatlashtirish",
    ],
    sameAs: [GITHUB_URL, LINKEDIN_URL, TELEGRAM_URL],
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: `${SITE_NAME} Portfolio`,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    inLanguage: ["uz", "en", "ru"],
    author: { "@type": "Person", name: SITE_NAME },
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/blog?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function projectJsonLd(project) {
  if (!project) return null;
  const path = `/project/${project.slug || project.id}`;
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.name,
    description: project.description || project.info || "",
    url: `${SITE_URL}${path}`,
    image: project.img
      ? project.img.startsWith("http")
        ? project.img
        : `${SITE_URL}${project.img}`
      : DEFAULT_OG_IMAGE,
    author: { "@type": "Person", name: SITE_NAME },
    keywords: Array.isArray(project.tech)
      ? project.tech.map((t) => (typeof t === "string" ? t : t?.name)).filter(Boolean)
      : [],
    dateCreated: project.created_at || undefined,
  };
}

export function blogPostJsonLd(post) {
  if (!post) return null;
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt || post.title,
    url: `${SITE_URL}/blog/${post.slug || post.id}`,
    image: post.cover_image || post.image || DEFAULT_OG_IMAGE,
    author: { "@type": "Person", name: SITE_NAME },
    datePublished: post.published_at || post.created_at,
  };
}
