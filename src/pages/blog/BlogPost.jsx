import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { LuArrowLeft, LuExternalLink } from "react-icons/lu";
import { fetchBlogBySlugOrId } from "../../lib/blogs";
import { useLang } from "../../i18n/LanguageContext";
import Seo from "../../components/seo/Seo";
import { blogPostJsonLd } from "../../lib/seo";
import "./Blog.css";

const ease = [0.16, 1, 0.3, 1];

function formatDate(iso, locale) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString(
      locale === "ru" ? "ru-RU" : locale === "en" ? "en-US" : "uz-UZ",
      { year: "numeric", month: "long", day: "numeric" }
    );
  } catch {
    return "";
  }
}

function BlogPost() {
  const { slug } = useParams();
  const { t, locale } = useLang();
  const b = t.blog;
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const data = await fetchBlogBySlugOrId(slug);
      if (!cancelled) {
        setPost(data);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="blogPage blog-post-page">
        <Seo title="Blog" path={`/blog/${slug || ""}`} noindex />
        <div className="container">
          <p className="blog-empty">{b.loading}</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="blogPage blog-post-page">
        <Seo title="Maqola topilmadi" path={`/blog/${slug || ""}`} noindex />
        <div className="container">
          <p className="blog-empty">{b.notFound}</p>
          <Link to="/blog" className="blog-back-link">
            <LuArrowLeft /> {b.back}
          </Link>
        </div>
      </div>
    );
  }

  const paragraphs = (post.content || "")
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <div className="blogPage blog-post-page">
      <Seo
        title={post.title}
        description={
          post.excerpt ||
          `${post.title} — Kamoliddin Mirzaboyev blog, Frontend dasturchi.`
        }
        path={`/blog/${post.slug || post.id}`}
        image={post.cover_image || post.image}
        type="article"
        keywords={`${post.title}, Kamoliddin Mirzaboyev, Frontend, React`}
        jsonLd={blogPostJsonLd(post)}
      />
      <article className="container blog-article">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease }}
        >
          <Link to="/blog" className="blog-back-link">
            <LuArrowLeft /> {b.back}
          </Link>

          <time className="blog-card-date">
            {formatDate(post.created_at, locale)}
          </time>
          <h1 className="blog-article-title">{post.title}</h1>
          {post.excerpt && <p className="blog-article-excerpt">{post.excerpt}</p>}

          {post.img && (
            <div className="blog-article-cover glass">
              <img src={post.img} alt={post.title} />
            </div>
          )}

          <div className="blog-article-body">
            {paragraphs.map((block, i) => (
              <p key={i}>{block}</p>
            ))}
          </div>

          {post.link && (
            <a
              href={post.link}
              target="_blank"
              rel="noreferrer"
              className="blog-article-link"
            >
              <LuExternalLink /> {b.openLink}
            </a>
          )}
        </motion.div>
      </article>
    </div>
  );
}

export default BlogPost;
