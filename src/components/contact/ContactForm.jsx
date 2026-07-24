import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLang } from "../../i18n/LanguageContext";
import { WEB3FORMS_ACCESS_KEY } from "../../lib/constants";
import Glass from "../ui/Glass";
import "../ui/Glass.css";
import "./ContactForm.css";

function ContactForm() {
  const { t } = useLang();
  const c = t.contact;
  const formRef = useRef(null);
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const validate = (data) => {
    const errors = {};
    if (!data.name || data.name.trim().length < 2) errors.name = c.errName;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((data.email || "").trim())) {
      errors.email = c.errEmail;
    }
    if (!data.subject || data.subject.trim().length < 2) {
      errors.subject = c.errSubject;
    }
    if (!data.message || data.message.trim().length < 10) {
      errors.message = c.errMessage;
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setStatus("idle");

    const form = formRef.current;
    if (!form) return;

    const formData = new FormData(form);

    // Web3Forms honeypot (bo'sh bo'lishi shart)
    if (formData.get("botcheck")) {
      // Bot — yubormaymiz, lekin "success" ham yolg'on ko'rsatmaymiz
      return;
    }

    const payload = {
      name: String(formData.get("name") || ""),
      email: String(formData.get("email") || ""),
      subject: String(formData.get("subject") || ""),
      message: String(formData.get("message") || ""),
    };

    if (!validate(payload)) return;

    if (!WEB3FORMS_ACCESS_KEY) {
      setStatus("error");
      setErrorMsg(c.errConfig);
      return;
    }

    setStatus("loading");

    try {
      // Rasmiy usul: FormData (JSON emas — Cloudflare/API yaxshiroq qabul qiladi)
      const body = new FormData();
      body.append("access_key", WEB3FORMS_ACCESS_KEY);
      body.append("name", payload.name.trim());
      body.append("email", payload.email.trim());
      body.append("subject", `[Portfolio] ${payload.subject.trim()}`);
      body.append("message", payload.message.trim());
      body.append("replyto", payload.email.trim());
      body.append("from_name", payload.name.trim());
      // bo'sh honeypot
      body.append("botcheck", "");

      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body,
      });

      let data = {};
      const text = await res.text();
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(
          res.ok
            ? c.errGeneric
            : `${c.errGeneric} (HTTP ${res.status})`
        );
      }

      // success ba'zan boolean, ba'zan string
      const ok =
        data.success === true ||
        data.success === "true" ||
        data.status === "success";

      if (!res.ok || !ok) {
        throw new Error(
          data.message || data.error || `${c.errGeneric} (HTTP ${res.status})`
        );
      }

      setStatus("success");
      setFieldErrors({});
      form.reset();
    } catch (err) {
      setStatus("error");
      setErrorMsg(err.message || c.errGeneric);
    }
  };

  const clearError = (name) => {
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  return (
    <motion.div
      className="lg-form"
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
    >
    <Glass borderRadius={24} blur={0.55} className="lg-form">
    <form
      ref={formRef}
      className="contactForm contactForm-inner"
      onSubmit={handleSubmit}
      noValidate
    >
      {/* Web3Forms access key ham hidden input orqali */}
      <input type="hidden" name="access_key" value={WEB3FORMS_ACCESS_KEY} />

      {/* Honeypot — ko'rinmas, autofill uchun oddiy name emas */}
      <input
        type="checkbox"
        name="botcheck"
        className="contact-honeypot"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />

      <div className="row">
        <div className="rowItem">
          <label htmlFor="contact-name">{c.name}</label>
          <input
            id="contact-name"
            name="name"
            type="text"
            autoComplete="name"
            placeholder={c.namePh}
            disabled={status === "loading"}
            className={fieldErrors.name ? "has-error" : ""}
            onChange={() => clearError("name")}
            required
          />
          {fieldErrors.name && (
            <span className="field-error">{fieldErrors.name}</span>
          )}
        </div>
        <div className="rowItem">
          <label htmlFor="contact-email">{c.email}</label>
          <input
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            disabled={status === "loading"}
            className={fieldErrors.email ? "has-error" : ""}
            onChange={() => clearError("email")}
            required
          />
          {fieldErrors.email && (
            <span className="field-error">{fieldErrors.email}</span>
          )}
        </div>
      </div>

      <div className="row">
        <div className="fulrowItem">
          <label htmlFor="contact-subject">{c.subject}</label>
          <input
            id="contact-subject"
            name="subject"
            type="text"
            placeholder={c.subjectPh}
            disabled={status === "loading"}
            className={fieldErrors.subject ? "has-error" : ""}
            onChange={() => clearError("subject")}
            required
          />
          {fieldErrors.subject && (
            <span className="field-error">{fieldErrors.subject}</span>
          )}
        </div>
      </div>

      <div className="row">
        <div className="fulrowItem">
          <label htmlFor="contact-message">{c.message}</label>
          <textarea
            id="contact-message"
            name="message"
            placeholder={c.messagePh}
            disabled={status === "loading"}
            className={fieldErrors.message ? "has-error" : ""}
            onChange={() => clearError("message")}
            required
          />
          {fieldErrors.message && (
            <span className="field-error">{fieldErrors.message}</span>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {status === "success" && (
          <motion.div
            key="ok"
            className="form-alert form-alert-ok"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {c.success}
            <span className="form-alert-hint">{c.successHint}</span>
          </motion.div>
        )}
        {status === "error" && (
          <motion.div
            key="err"
            className="form-alert form-alert-err"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {errorMsg || c.errGeneric}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="submit"
        className="sendBtn"
        disabled={status === "loading"}
        whileHover={status === "loading" ? undefined : { y: -1 }}
        whileTap={status === "loading" ? undefined : { scale: 0.99 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        {status === "loading" ? (
          <span className="send-loading">
            <span className="send-spinner" />
            {c.sending}
          </span>
        ) : (
          c.send
        )}
      </motion.button>
    </form>
    </Glass>
    </motion.div>
  );
}

export default ContactForm;
