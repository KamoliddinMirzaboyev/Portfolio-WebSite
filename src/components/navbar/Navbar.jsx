import React, { useEffect, useState } from "react";
import "./Navbar.css";
import { Link, useLocation } from "react-router-dom";
import { LuGithub, LuMoon, LuSun } from "react-icons/lu";
import { FiLinkedin } from "react-icons/fi";
import { FaTelegramPlane } from "react-icons/fa";
import { HiOutlineMail } from "react-icons/hi";
import { motion } from "framer-motion";
import { useLang } from "../../i18n/LanguageContext";
import { useTheme } from "../../theme/ThemeContext";
import {
  EMAIL,
  GITHUB_URL,
  LINKEDIN_URL,
  TELEGRAM_URL,
} from "../../lib/constants";

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { t, locale, setLocale, locales } = useLang();
  const { isDark, toggleTheme } = useTheme();
  const { pathname } = useLocation();
  const onHome = pathname === "/";

  const section = (hash) => (onHome ? hash : `/${hash}`);

  const links = [
    { label: t.nav.home, to: "/", type: "route" },
    { label: t.nav.about, to: section("#aboutSection"), type: "hash" },
    { label: t.nav.experience, to: section("#experience"), type: "hash" },
    { label: t.nav.portfolio, to: section("#portfolio"), type: "hash" },
    { label: t.nav.blog, to: "/blog", type: "route" },
    { label: t.nav.skills, to: section("#skills"), type: "hash" },
    { label: t.nav.contact, to: section("#contact"), type: "hash" },
  ];

  const socials = [
    { href: GITHUB_URL, icon: <LuGithub />, tooltip: "GitHub" },
    { href: TELEGRAM_URL, icon: <FaTelegramPlane />, tooltip: "Telegram" },
    {
      href: `mailto:${EMAIL}`,
      icon: <HiOutlineMail />,
      tooltip: "Email",
    },
    { href: LINKEDIN_URL, icon: <FiLinkedin />, tooltip: "LinkedIn" },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.nav
      className={scrolled ? "scrolled" : ""}
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="container">
        <Link to="/" className="logo">
          <h2>
            <span>Kamoliddin</span>.dev
          </h2>
        </Link>

        <div className="navLinks">
          {links.map((item, index) =>
            item.type === "route" ? (
              <motion.div
                key={item.to + item.label}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.7,
                  delay: 0.06 * index,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <Link to={item.to} className="a">
                  {item.label}
                </Link>
              </motion.div>
            ) : (
              <motion.a
                key={item.to + item.label}
                href={item.to}
                className="a"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.7,
                  delay: 0.06 * index,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                {item.label}
              </motion.a>
            )
          )}
        </div>

        <div className="nav-right">
          <button
            type="button"
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={isDark ? "Light mode" : "Dark mode"}
            title={isDark ? "Light" : "Dark"}
          >
            {isDark ? <LuSun /> : <LuMoon />}
          </button>

          <div className="lang-switch" role="group" aria-label="Language">
            {locales.map((code) => (
              <button
                key={code}
                type="button"
                className={`lang-btn ${locale === code ? "active" : ""}`}
                onClick={() => setLocale(code)}
              >
                {code.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="navBtns">
            {socials.map((btn, index) => (
              <motion.a
                key={btn.tooltip}
                href={btn.href}
                target={btn.href.startsWith("http") ? "_blank" : undefined}
                rel={btn.href.startsWith("http") ? "noreferrer" : undefined}
                className="tooltip-wrapper"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                  duration: 0.6,
                  delay: 0.4 + index * 0.06,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <button
                  type="button"
                  className="navBtn"
                  aria-label={btn.tooltip}
                >
                  {btn.icon}
                  <div className="tooltip">
                    {btn.tooltip} <span className="tooltip-arrow" />
                  </div>
                </button>
              </motion.a>
            ))}
          </div>
        </div>
      </div>
    </motion.nav>
  );
}

export default Navbar;
