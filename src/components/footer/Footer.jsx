import React, { useRef } from "react";
import "./Footer.css";
import { Link, useNavigate } from "react-router-dom";
import { LuGithub } from "react-icons/lu";
import { FiLinkedin } from "react-icons/fi";
import { FaTelegramPlane } from "react-icons/fa";
import { HiOutlineMail } from "react-icons/hi";
import { motion } from "framer-motion";
import { useLang } from "../../i18n/LanguageContext";
import {
  EMAIL,
  GITHUB_URL,
  LINKEDIN_URL,
  TELEGRAM_URL,
} from "../../lib/constants";

function Footer() {
  const navigate = useNavigate();
  const { t } = useLang();
  const clicks = useRef({ count: 0, timer: null });

  const links = [
    { label: t.nav.home, to: "/", type: "route" },
    { label: t.nav.about, to: "/#aboutSection", type: "hash" },
    { label: t.nav.portfolio, to: "/#portfolio", type: "hash" },
    { label: t.nav.blog, to: "/blog", type: "route" },
    { label: t.nav.skills, to: "/#skills", type: "hash" },
    { label: t.nav.contact, to: "/#contact", type: "hash" },
  ];

  const socials = [
    { href: GITHUB_URL, icon: <LuGithub />, label: "GitHub" },
    { href: TELEGRAM_URL, icon: <FaTelegramPlane />, label: "Telegram" },
    { href: `mailto:${EMAIL}`, icon: <HiOutlineMail />, label: "Email" },
    { href: LINKEDIN_URL, icon: <FiLinkedin />, label: "LinkedIn" },
  ];

  const onSecretTap = () => {
    const state = clicks.current;
    state.count += 1;
    if (state.timer) clearTimeout(state.timer);
    state.timer = setTimeout(() => {
      state.count = 0;
    }, 2800);
    if (state.count >= 7) {
      state.count = 0;
      navigate("/admin");
    }
  };

  return (
    <footer>
      <motion.div
        className="container footer-top"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="logo">
          <h2>
            <span>Kamoliddin</span>.dev
          </h2>
          <p className="footerCopy">
            © {new Date().getFullYear()} {t.footer.rights}
          </p>
        </div>

        <div className="navLinks">
          {links.map((item) =>
            item.type === "route" ? (
              <Link key={item.to + item.label} to={item.to} className="a">
                {item.label}
              </Link>
            ) : (
              <a key={item.to + item.label} href={item.to} className="a">
                {item.label}
              </a>
            )
          )}
        </div>

        <div className="navBtns">
          {socials.map((s) => (
            <motion.a
              key={s.label}
              href={s.href}
              target={s.href.startsWith("http") ? "_blank" : undefined}
              rel={s.href.startsWith("http") ? "noreferrer" : undefined}
              aria-label={s.label}
            >
              <button type="button" className="navBtn">
                {s.icon}
              </button>
            </motion.a>
          ))}
        </div>
      </motion.div>

      <motion.div
        className="container"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
      >
        <p className="powered" onClick={onSecretTap}>
          {t.footer.powered}
        </p>
      </motion.div>
    </footer>
  );
}

export default Footer;
