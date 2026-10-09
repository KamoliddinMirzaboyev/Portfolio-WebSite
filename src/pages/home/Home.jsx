import React, { useEffect, useMemo, useState } from "react";
import "./Home.css";
import { Tab, Tabs } from "@mui/material";
import { LuExternalLink, LuGithub } from "react-icons/lu";
import { FaCss3Alt, FaGitAlt, FaGithub, FaHtml5, FaReact } from "react-icons/fa";
import { SiJavascript, SiTypescript, SiVite } from "react-icons/si";
import { MdOutlineTranslate } from "react-icons/md";
import { HiOutlineCodeBracket } from "react-icons/hi2";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { fetchProjects } from "../../lib/projects";
import { fetchSiteContent } from "../../lib/siteContent";
import { useLang } from "../../i18n/LanguageContext";
import {
  EMAIL,
  GITHUB_HANDLE,
  GITHUB_URL,
  PHONE,
  PHONE_DISPLAY,
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  SITE_TITLE,
  TELEGRAM_URL,
} from "../../lib/constants";
import { Link } from "react-router-dom";
import ContactForm from "../../components/contact/ContactForm";
import Glass from "../../components/ui/Glass";
import "../../components/ui/Glass.css";
import { PortfolioSkeleton } from "../../components/ui/Skeleton";
import Seo from "../../components/seo/Seo";
import { personJsonLd, websiteJsonLd } from "../../lib/seo";

const ease = [0.16, 1, 0.3, 1];

const letterVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.2 + i * 0.028,
      duration: 0.7,
      ease,
    },
  }),
};

function SplitText({ text, className }) {
  const chars = useMemo(() => text.split(""), [text]);
  return (
    <span className={className} aria-label={text}>
      {chars.map((char, i) => (
        <motion.span
          key={`${char}-${i}`}
          className="split-char"
          custom={i}
          variants={letterVariants}
          initial="hidden"
          animate="visible"
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </span>
  );
}

function TiltCard({ children, className = "" }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [5, -5]), {
    stiffness: 120,
    damping: 22,
  });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-5, 5]), {
    stiffness: 120,
    damping: 22,
  });

  const handleMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      className={`tilt-card ${className}`}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      {children}
    </motion.div>
  );
}

/** Har bo'lim uchun to'g'ri ikonlar (oldingi aralashmapdi) */
const skillMeta = [
  {
    accent: "violet",
    icons: [
      { Icon: FaHtml5, color: "#E34F26" },
      { Icon: FaCss3Alt, color: "#1572B6" },
      { Icon: HiOutlineCodeBracket, color: "#A5B4FC" },
    ],
  },
  {
    accent: "cyan",
    icons: [
      { Icon: SiJavascript, color: "#F7DF1E" },
      { Icon: SiTypescript, color: "#3178C6" },
      { Icon: FaReact, color: "#61DAFB" },
    ],
  },
  {
    accent: "pink",
    icons: [
      { Icon: FaGitAlt, color: "#F05032" },
      { Icon: FaGithub, color: "#E6E6E6" },
      { Icon: SiVite, color: "#646CFF" },
    ],
  },
  {
    accent: "amber",
    icons: [{ Icon: MdOutlineTranslate, color: "#A5B4FC" }],
  },
];

function Home() {
  const { t, locale } = useLang();
  const [portfolioDB, setPortfolioDB] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [site, setSite] = useState(null);
  const [value, setValue] = useState("all");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setProjectsLoading(true);
      const [list, content] = await Promise.all([
        fetchProjects(),
        fetchSiteContent(),
      ]);
      if (!cancelled) {
        setPortfolioDB(list);
        setSite(content);
        setProjectsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const hero = site?.hero || t.hero;
  const about = site?.about || t.about;
  const profile = site?.profile || {
    name: "Kamoliddin Mirzaboyev",
    initials: "KM",
    role: "Frontend · React · TypeScript",
    tags: ["Farg'ona", "O'zbekiston", t.about.available],
  };
  const experienceBlock = site?.experience || t.experience;
  const skillsBlock = site?.skills || t.skills;
  const educationBlock = site?.education || t.education;
  const portfolioMeta = site?.portfolio_meta || t.portfolio;
  const contactMeta = site?.contact_meta || t.contact;

  const skills = (skillsBlock.items || []).map((item, i) => ({
    ...item,
    accent: skillMeta[i]?.accent || "violet",
    icons: skillMeta[i % skillMeta.length]?.icons || skillMeta[0].icons,
  }));

  const experiences = experienceBlock.items || [];
  const education = educationBlock.items || [];
  const heroStats =
    hero.stats?.length > 0
      ? hero.stats
      : [
          { n: "1+", l: t.hero.statExp },
          { n: "10+", l: t.hero.statProjects },
          { n: "4.7", l: t.hero.statGpa },
        ];

  const categoryTabs = useMemo(() => {
    const fromDb = portfolioDB
      .map((p) => String(p.category || "").trim().toLowerCase())
      .filter(Boolean);
    const stored = (() => {
      try {
        const raw = localStorage.getItem("portfolio_project_categories");
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed)
          ? parsed.map((c) => String(c).trim().toLowerCase()).filter(Boolean)
          : [];
      } catch {
        return [];
      }
    })();
    // Faqat haqiqiy ishlatiladigan / saqlangan kategoriyalar
    const all = Array.from(new Set([...stored, ...fromDb]));
    const withProjects = all.filter((c) =>
      portfolioDB.some(
        (p) => String(p.category || "").trim().toLowerCase() === c
      )
    );
    // Har doim "all" birinchi tab ("Hammasi"), "react" va "api" butunlay chiqarib tashlanadi
    const cleanCategories = valid.filter(
      (c) => c !== "all" && c !== "react" && c !== "api"
    );
    return ["all", ...cleanCategories];
  }, [portfolioDB]);

  useEffect(() => {
    if (!categoryTabs.length) return;
    if (!categoryTabs.includes(value)) {
      setValue(categoryTabs[0]);
    }
  }, [categoryTabs, value]);

  const categoryLabel = (cat) => {
    if (cat === "all") return t.portfolio?.all || "Hammasi";
    const labels = t.portfolio || {};
    if (labels[cat]) return labels[cat];
    return cat
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  };

  const filtered = portfolioDB.filter((item) => {
    if (value === "all") return true;
    return (
      String(item.category || "").trim().toLowerCase() ===
      String(value).trim().toLowerCase()
    );
  });

  return (
    <div className="homePage" key={locale}>
      <Seo
        title={SITE_TITLE}
        description={SITE_DESCRIPTION}
        path="/"
        keywords={SITE_KEYWORDS}
        jsonLd={[personJsonLd(), websiteJsonLd()]}
      />
      <section className="hero" id="home">
        <div className="hero-glow" />
        <div className="container hero-inner">
          <motion.div
            className="condition"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease }}
          >
            <span className="pulse-dot" />
            <p>{hero.badge}</p>
          </motion.div>

          <h1 className="mainText">
            <SplitText text={profile.name || "Kamoliddin Mirzaboyev"} />
          </h1>

          <motion.h2
            className="jobName"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.75, ease }}
          >
            {hero.job}
          </motion.h2>

          <motion.p
            className="litlleInfo"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.95, ease }}
          >
            {hero.info}
          </motion.p>

          <motion.div
            className="heroBtns"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 1.15, ease }}
          >
            <motion.a
              href="#portfolio"
              className="heroBtn"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.35, ease }}
            >
              {hero.projectsBtn || t.hero.projectsBtn}{" "}
              <i className="fas fa-arrow-right" />
            </motion.a>
            <motion.a
              href="#contact"
              className="heroBtn contactBtn"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.35, ease }}
            >
              {hero.contactBtn || t.hero.contactBtn}{" "}
              <i className="fa-solid fa-share" />
            </motion.a>
          </motion.div>

          <motion.div
            className="hero-stats"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.35, duration: 1, ease }}
          >
            {heroStats.map((s, i) => (
              <motion.div
                key={`${s.n}-${s.l}-${i}`}
                className="stat-chip"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.45 + i * 0.1, duration: 0.8, ease }}
              >
                <strong>{s.n}</strong>
                <span>{s.l}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <main>
        <section id="aboutSection" className="aboutSection">
          <div className="section-bg about-bg" />
          <div className="container about-grid">
            <motion.div
              className="about-visual"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 1, ease }}
            >
              <div className="about-card-glow" />
              <Glass className="lg-about" borderRadius={24} blur={0.5}>
                <div className="about-card about-card-inner">
                  <div className="about-avatar">
                    {profile.initials || "KM"}
                  </div>
                  <h3>{profile.name}</h3>
                  <p>{profile.role}</p>
                  <div className="about-tags">
                    {(profile.tags || []).map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                </div>
              </Glass>
            </motion.div>

            <div className="about-content">
              <motion.div
                className="condition"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease }}
              >
                <p>{about.badge}</p>
              </motion.div>
              <motion.h2
                className="sectionTitle"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.9, delay: 0.08, ease }}
              >
                {about.title}
              </motion.h2>
              <motion.p
                className="infoText"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.9, delay: 0.16, ease }}
              >
                {about.p1}
              </motion.p>
              <motion.p
                className="infoText"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.9, delay: 0.26, ease }}
              >
                {about.p2}
              </motion.p>
            </div>
          </div>
        </section>

        <section id="experience" className="experienceSection">
          <div className="container">
            <motion.div
              className="condition"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease }}
            >
              <p>{experienceBlock.badge}</p>
            </motion.div>
            <motion.h2
              className="sectionTitle"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, ease }}
            >
              {experienceBlock.title}
            </motion.h2>

            <div className="timeline">
              <motion.div
                className="timeline-line"
                initial={{ scaleY: 0 }}
                whileInView={{ scaleY: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.4, ease }}
              />
              {experiences.map((exp, i) => (
                <motion.article
                  key={`${exp.role}-${i}`}
                  className={`timeline-item ${i % 2 === 0 ? "left" : "right"}`}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.9, delay: i * 0.15, ease }}
                >
                  <div className="timeline-dot" />
                  <Glass className="lg-card" borderRadius={18} blur={0.4}>
                    <div className="timeline-card">
                      <span className="timeline-period">{exp.period}</span>
                      <h3>{exp.role}</h3>
                      {exp.company ? (
                        <p className="company">{exp.company}</p>
                      ) : null}
                      <ul>
                        {exp.points.map((p) => (
                          <li key={p}>{p}</li>
                        ))}
                      </ul>
                    </div>
                  </Glass>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <section id="skills" className="skillsSection">
          <div className="section-bg skills-bg" />
          <div className="container">
            <motion.div
              className="condition"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease }}
            >
              <p>{skillsBlock.badge}</p>
            </motion.div>
            <motion.h2
              className="sectionTitle"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, ease }}
            >
              {skillsBlock.title}
            </motion.h2>

            <div className="skillsBlock">
              {skills.map((skill, index) => (
                <motion.div
                  key={skill.title}
                  className="skill-cell"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.85, delay: index * 0.1, ease }}
                >
                  <Glass
                    className={`lg-skill accent-${skill.accent}`}
                    borderRadius={22}
                    blur={0.55}
                    elasticity={0.5}
                  >
                    <div className="skillBox skillBox-inner">
                      <div
                        className={`skillLogo ${
                          skill.icons.length === 1 ? "skillLogo-single" : ""
                        }`}
                      >
                        {skill.icons.map(({ Icon, color }, ii) => (
                          <span
                            className="skillIcon"
                            key={ii}
                            style={{ color }}
                          >
                            <Icon />
                          </span>
                        ))}
                      </div>
                      <h2>{skill.title}</h2>
                      <p>{skill.items}</p>
                    </div>
                  </Glass>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section id="portfolio" className="portfolioSection">
          <div className="container">
            <motion.div
              className="condition"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease }}
            >
              <p>{portfolioMeta.badge}</p>
            </motion.div>
            <motion.h2
              className="sectionTitle"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, ease }}
            >
              {portfolioMeta.title}
            </motion.h2>
            <motion.p
              className="projectInfo lead"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.1, ease }}
            >
              {portfolioMeta.lead}
            </motion.p>

            <motion.div
              className="tabs-wrap"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease }}
            >
              <Tabs
                value={categoryTabs.includes(value) ? value : categoryTabs[0] || false}
                onChange={(_, v) => setValue(v)}
                centered
                variant="scrollable"
                scrollButtons="auto"
              >
                {categoryTabs.map((cat) => (
                  <Tab key={cat} label={categoryLabel(cat)} value={cat} />
                ))}
              </Tabs>
            </motion.div>

            <div className="porfolioBlock">
              {projectsLoading && <PortfolioSkeleton count={3} />}
              {!projectsLoading && filtered.length === 0 && (
                <p className="projectInfo lead" style={{ width: "100%" }}>
                  {t.portfolio.empty}
                </p>
              )}
              {!projectsLoading &&
                filtered.map((item) => (
                <div key={item.id} className="portfolio-cell">
                  <Glass className="lg-portfolio" borderRadius={20}>
                    <article className="portfolioBox portfolioBox-inner">
                      <Link
                        to={`/project/${item.slug || item.id}`}
                        className="projectImg projectImg-link"
                      >
                        <img
                          src={item.img || ""}
                          alt={item.name}
                          loading="lazy"
                        />
                      </Link>
                      <div className="projectData">
                        <h2 className="projectName">
                          <Link to={`/project/${item.slug || item.id}`}>
                            {item.name}
                          </Link>
                          {item.for_sale && (
                            <span className="sale-pill">Sale</span>
                          )}
                        </h2>
                        <p className="projectInfo">{item.info}</p>
                        <div className="technologies">
                          {(item.tech || []).map((tech, ti) => {
                            const label =
                              typeof tech === "string" ? tech : tech?.name;
                            const key =
                              typeof tech === "string"
                                ? `${tech}-${ti}`
                                : (tech?.id ?? ti);
                            return (
                              <div className="techItem" key={key}>
                                <p>{label}</p>
                              </div>
                            );
                          })}
                        </div>
                        <div className="source">
                          <Link
                            to={`/project/${item.slug || item.id}`}
                            className="project-detail-link"
                          >
                            {t.projectPage.details}
                          </Link>
                          {item.live && (
                            <a
                              href={item.live}
                              target="_blank"
                              rel="noreferrer"
                              className="liveLink"
                            >
                              <LuExternalLink />
                              <span>Live</span>
                            </a>
                          )}
                        </div>
                      </div>
                    </article>
                  </Glass>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="education" className="educationSection">
          <div className="section-bg edu-bg" />
          <div className="container">
            <motion.div
              className="condition"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <p>{educationBlock.badge}</p>
            </motion.div>
            <motion.h2
              className="sectionTitle"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              {educationBlock.title}
            </motion.h2>

            <div className="edu-grid">
              {education.map((edu, i) => (
                <motion.div
                  key={edu.place}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.9, delay: i * 0.12, ease }}
                >
                  <Glass className="lg-card" borderRadius={18} blur={0.45}>
                    <div className="edu-card edu-card-inner">
                      <span className="edu-period">{edu.period}</span>
                      <h3>{edu.place}</h3>
                      <p className="edu-degree">{edu.degree}</p>
                      <p className="edu-meta">{edu.meta}</p>
                    </div>
                  </Glass>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section id="contact" className="contactSection">
          <div className="container">
            <motion.div
              className="condition"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease }}
            >
              <p>{contactMeta.badge}</p>
            </motion.div>
            <motion.h2
              className="sectionTitle"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, ease }}
            >
              {contactMeta.title}
            </motion.h2>
            <motion.p
              className="contact-lead"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.08, ease }}
            >
              {contactMeta.lead}
            </motion.p>

            <motion.div
              className="contact-links"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.85, ease }}
            >
              <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
              <a href={`tel:${PHONE}`}>{PHONE_DISPLAY}</a>
              <a href={TELEGRAM_URL} target="_blank" rel="noreferrer">
                t.me/MrMirzaboyev
              </a>
              <a href={GITHUB_URL} target="_blank" rel="noreferrer">
                github.com/{GITHUB_HANDLE}
              </a>
            </motion.div>

            <ContactForm />
          </div>
        </section>
      </main>
    </div>
  );
}

export default Home;
