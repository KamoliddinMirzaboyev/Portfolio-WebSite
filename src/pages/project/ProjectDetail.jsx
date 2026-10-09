import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LuArrowLeft,
  LuExternalLink,
  LuGithub,
  LuMaximize2,
  LuX,
  LuChevronLeft,
  LuChevronRight,
} from "react-icons/lu";
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
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

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
    if (project.gallery && project.gallery.length > 0) {
      return project.gallery.filter(Boolean);
    }
    if (project.img) return [project.img];
    return [];
  }, [project]);

  useEffect(() => {
    if (!isLightboxOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsLightboxOpen(false);
      } else if (e.key === "ArrowLeft" && gallery.length > 1) {
        setActiveImg((prev) => (prev > 0 ? prev - 1 : gallery.length - 1));
      } else if (e.key === "ArrowRight" && gallery.length > 1) {
        setActiveImg((prev) => (prev < gallery.length - 1 ? prev + 1 : 0));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [isLightboxOpen, gallery.length]);

  const embed = useMemo(() => {
    return project?.youtube ? youtubeEmbedUrl(project.youtube) : null;
  }, [project?.youtube]);

  const paragraphs = useMemo(() => {
    if (!project?.description) return [];
    return project.description
      .split(/\n\n+/)
      .map((b) => b.trim())
      .filter(Boolean);
  }, [project?.description]);

  if (loading) {
    return (
      <div className="projectPage">
        <div className="container project-layout">
          <DetailSkeleton />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="projectPage">
        <div className="container project-layout">
          <Link to="/#portfolio" className="project-back">
            <LuArrowLeft /> {p.back}
          </Link>
          <div className="project-empty">
            <h2>{p.notFound}</h2>
          </div>
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
                <div
                  className="project-gallery-main"
                  onClick={() => setIsLightboxOpen(true)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setIsLightboxOpen(true);
                    }
                  }}
                  title="Rasmni to'liq hajmda ochish (kattalashtirish)"
                >
                  <img
                    src={gallery[activeImg] || gallery[0]}
                    alt={project.name}
                  />
                  <div className="project-gallery-zoom-badge">
                    <LuMaximize2 />
                    <span>To'liq ko'rish</span>
                  </div>
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
                        title={`Rasm ${i + 1}`}
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

      {/* Fullscreen Lightbox Modal */}
      {isLightboxOpen && (
        <div
          className="lightbox-overlay"
          onClick={() => setIsLightboxOpen(false)}
        >
          <div
            className="lightbox-header"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="lightbox-counter">
              {activeImg + 1} / {gallery.length}
            </div>
            <div className="lightbox-actions">
              <a
                href={gallery[activeImg] || gallery[0]}
                target="_blank"
                rel="noreferrer"
                className="lightbox-btn"
                title="Asl faylni yangi oynada ochish"
              >
                <LuExternalLink /> Asl hajm
              </a>
              <button
                type="button"
                className="lightbox-btn lightbox-close"
                onClick={() => setIsLightboxOpen(false)}
                title="Yopish (Esc)"
              >
                <LuX />
              </button>
            </div>
          </div>

          {gallery.length > 1 && (
            <>
              <button
                type="button"
                className="lightbox-nav prev"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveImg((prev) =>
                    prev > 0 ? prev - 1 : gallery.length - 1
                  );
                }}
                title="Oldingi rasm"
              >
                <LuChevronLeft />
              </button>
              <button
                type="button"
                className="lightbox-nav next"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveImg((prev) =>
                    prev < gallery.length - 1 ? prev + 1 : 0
                  );
                }}
                title="Keyingi rasm"
              >
                <LuChevronRight />
              </button>
            </>
          )}

          <div
            className="lightbox-content"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={gallery[activeImg] || gallery[0]}
              alt={project.name}
              className="lightbox-img"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectDetail;
