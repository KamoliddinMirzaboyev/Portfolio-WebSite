import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { LuArrowLeft, LuExternalLink, LuGithub } from "react-icons/lu";
import {
  fetchProjectBySlugOrId,
  youtubeEmbedUrl,
} from "../../lib/projects";
import { useLang } from "../../i18n/LanguageContext";
import Glass from "../../components/ui/Glass";
import "../../components/ui/Glass.css";
import Seo from "../../components/seo/Seo";
import { projectJsonLd } from "../../lib/seo";
import { DetailSkeleton } from "../../components/ui/Skeleton";
import "./ProjectDetail.css";

const ease = [0.16, 1, 0.3, 1];

function ProjectDetail() {
  const { slug } = useParams();
  const { t } = useLang();
  const p = t.projectPage;
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const data = await fetchProjectBySlugOrId(slug);
      if (!cancelled) {
        setProject(data);
        setActiveImg(0);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const gallery = useMemo(() => {
    if (!project) return [];
    const g = project.gallery?.length
      ? project.gallery
      : project.img
        ? [project.img]
        : [];
    return g.filter(Boolean);
  }, [project]);

  const embed = project ? youtubeEmbedUrl(project.youtube_url) : "";
  const paragraphs = (project?.description || project?.info || "")
    .split(/\n\n+/)
    .map((x) => x.trim())
    .filter(Boolean);

  if (loading) {
    return (
      <div className="projectPage">
        <Seo title="Loyiha" path={`/project/${slug || ""}`} noindex />
        <div className="container project-layout">
          <DetailSkeleton />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="projectPage">
        <Seo title="Loyiha topilmadi" path={`/project/${slug || ""}`} noindex />
        <div className="container">
          <p className="project-empty">{p.notFound}</p>
          <Link to="/#portfolio" className="project-back">
            <LuArrowLeft /> {p.back}
          </Link>
        </div>
      </div>
    );
  }

  const techLabels = (project.tech || [])
    .map((t) => (typeof t === "string" ? t : t?.name))
    .filter(Boolean);
  const projectDesc =
    project.info ||
    project.description ||
    `${project.name} — Kamoliddin Mirzaboyev frontend loyihasi. ${techLabels.join(", ")}`;

  return (
    <div className="projectPage">
      <Seo
        title={`${project.name} — Frontend loyiha`}
        description={projectDesc}
        path={`/project/${project.slug || project.id}`}
        image={project.img}
        type="article"
        keywords={[
          project.name,
          "Kamoliddin Mirzaboyev",
          "Frontend",
          "loyiha",
          "yotoqxona",
          ...techLabels,
        ].join(", ")}
        jsonLd={projectJsonLd(project)}
      />
      <div className="container project-layout">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease }}
        >
          <Link to="/#portfolio" className="project-back">
            <LuArrowLeft /> {p.back}
          </Link>

          <div className="project-header">
            <div>
              {project.for_sale && (
                <span className="project-badge">{p.forSale}</span>
              )}
              <h1 className="project-title">{project.name}</h1>
              {project.info && (
                <p className="project-lead">{project.info}</p>
              )}
            </div>
            {project.price && (
              <div className="project-price-box">
                <span className="project-price-label">{p.price}</span>
                <strong className="project-price">{project.price}</strong>
              </div>
            )}
          </div>

          {/* Gallery */}
          {gallery.length > 0 && (
            <Glass className="lg-portfolio project-gallery-wrap" borderRadius={22}>
              <div className="project-gallery">
                <div className="project-gallery-main">
                  <img
                    src={gallery[activeImg] || gallery[0]}
                    alt={project.name}
                  />
                </div>
                {gallery.length > 1 && (
                  <div className="project-thumbs">
                    {gallery.map((src, i) => (
                      <button
                        type="button"
                        key={`${src}-${i}`}
                        className={`project-thumb ${
                          i === activeImg ? "active" : ""
                        }`}
                        onClick={() => setActiveImg(i)}
                      >
                        <img src={src} alt="" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </Glass>
          )}

          {/* YouTube */}
          {embed && (
            <section className="project-section">
              <h2 className="project-section-title">{p.video}</h2>
              <Glass borderRadius={20} blur={0.4}>
                <div className="project-video">
                  <iframe
                    src={embed}
                    title={`${project.name} video`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </Glass>
            </section>
          )}

          {/* Description */}
          <section className="project-section">
            <h2 className="project-section-title">{p.description}</h2>
            <Glass className="lg-card" borderRadius={18} blur={0.45}>
              <div className="project-desc">
                {paragraphs.map((block, i) => (
                  <p key={i}>{block}</p>
                ))}
              </div>
            </Glass>
          </section>

          {/* Tech */}
          {project.tech?.length > 0 && (
            <section className="project-section">
              <h2 className="project-section-title">{p.tech}</h2>
              <div className="project-tech">
                {project.tech.map((tItem, i) => (
                  <span className="techItem" key={`${tItem}-${i}`}>
                    {typeof tItem === "string" ? tItem : tItem?.name}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Links */}
          <div className="project-actions">
            {project.live && (
              <a
                href={project.live}
                target="_blank"
                rel="noreferrer"
                className="project-btn primary"
              >
                <LuExternalLink /> {p.live}
              </a>
            )}
            {project.github && (
              <a
                href={project.github}
                target="_blank"
                rel="noreferrer"
                className="project-btn ghost"
              >
                <LuGithub /> GitHub
              </a>
            )}
            {project.for_sale && (
              <a href="/#contact" className="project-btn sale">
                {p.buy}
              </a>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default ProjectDetail;
