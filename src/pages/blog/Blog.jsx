import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { LuExternalLink, LuArrowRight } from "react-icons/lu";
import { fetchBlogs } from "../../lib/blogs";
import { useLang } from "../../i18n/LanguageContext";
import Glass from "../../components/ui/Glass";
import "../../components/ui/Glass.css";
import Seo from "../../components/seo/Seo";
import "./Blog.css";

const ease = [0.16, 1, 0.3, 1];

function formatDate(iso, locale) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString(
      locale === "ru" ? "ru-RU" : locale === "en" ? "en-US" : "uz-UZ",
      { year: "numeric", month: "short", day: "numeric" }
    );
  } catch {
    return "";
  }
}

function Blog() {
  const { t, locale } = useLang();
  const b = t.blog;
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const blogDesc =
    "Kamoliddin Mirzaboyev blog — Frontend, React, TypeScript, web dasturlash, loyihalar va tajriba haqida maqolalar.";

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const list = await fetchBlogs({ includeDrafts: false });
      if (!cancelled) {
        setPosts(list);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="blogPage">
      <Seo
        title="Blog — Frontend, React, TypeScript"
        description={blogDesc}
        path="/blog"
        keywords="Kamoliddin Mirzaboyev blog, Frontend blog, React maqola, TypeScript, web dasturlash"
      />
      <section className="blog-hero">
        <div className="container">
          <motion.div
            className="condition"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease }}
          >
            <p>{b.badge}</p>
          </motion.div>
          <motion.h1
            className="blog-title"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease }}
          >
            {b.title}
          </motion.h1>
          <motion.p
            className="blog-lead"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease }}
          >
            {b.lead}
          </motion.p>
        </div>
      </section>

      <section className="blog-list-section">
        <div className="container">
          {loading && <p className="blog-empty">{b.loading}</p>}
          {!loading && posts.length === 0 && (
            <p className="blog-empty">{b.empty}</p>
          )}

          <div className="blog-grid">
            {posts.map((post, i) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.7, delay: (i % 6) * 0.06, ease }}
              >
                <Glass className="lg-portfolio" borderRadius={20} blur={0.5}>
                  <article className="blog-card">
                    <Link
                      to={`/blog/${post.slug || post.id}`}
                      className="blog-card-media"
                    >
                      {post.img ? (
                        <img src={post.img} alt={post.title} loading="lazy" />
                      ) : (
                        <div className="blog-card-placeholder" />
                      )}
                    </Link>
                    <div className="blog-card-body">
                      <time className="blog-card-date">
                        {formatDate(post.created_at, locale)}
                      </time>
                      <h2 className="blog-card-title">
                        <Link to={`/blog/${post.slug || post.id}`}>
                          {post.title}
                        </Link>
                      </h2>
                      {post.excerpt && (
                        <p className="blog-card-excerpt">{post.excerpt}</p>
                      )}
                      <div className="blog-card-actions">
                        <Link
                          to={`/blog/${post.slug || post.id}`}
                          className="blog-read"
                        >
                          {b.readMore} <LuArrowRight />
                        </Link>
                        {post.link && (
                          <a
                            href={post.link}
                            target="_blank"
                            rel="noreferrer"
                            className="blog-ext"
                          >
                            <LuExternalLink /> {b.external}
                          </a>
                        )}
                      </div>
                    </div>
                  </article>
                </Glass>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Blog;
