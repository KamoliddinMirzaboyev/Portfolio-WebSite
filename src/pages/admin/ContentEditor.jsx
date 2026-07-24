import { useEffect, useState } from "react";
import {
  CONTENT_SECTIONS,
  fetchSiteContent,
  getDefaultSiteContent,
  saveSiteSection,
} from "../../lib/siteContent";

function Field({ label, children, full }) {
  return (
    <label className={full ? "full" : undefined}>
      {label}
      {children}
    </label>
  );
}

function ContentEditor({ onMessage }) {
  const [section, setSection] = useState("profile");
  const [content, setContent] = useState(() => getDefaultSiteContent());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const data = await fetchSiteContent();
      if (!cancelled) {
        setContent(data);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const data = content[section] || {};

  const setSectionData = (next) => {
    setContent((c) => ({ ...c, [section]: next }));
  };

  const patch = (key, value) => {
    setSectionData({ ...data, [key]: value });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveSiteSection(section, content[section]);
      onMessage?.(`«${section}» saqlandi`);
    } catch (err) {
      onMessage?.(err.message || "Saqlash xatosi");
    } finally {
      setSaving(false);
    }
  };

  const handleResetSection = () => {
    const def = getDefaultSiteContent()[section];
    setSectionData(def);
    onMessage?.("Bo'lim defaultga qaytarildi (hali saqlanmagan)");
  };

  if (loading) {
    return <p className="admin-muted">Kontent yuklanmoqda…</p>;
  }

  return (
    <div className="admin-content-editor">
      <div className="admin-content-tabs">
        {CONTENT_SECTIONS.map((s) => (
          <button
            key={s.key}
            type="button"
            className={`admin-chip-tab ${section === s.key ? "active" : ""}`}
            onClick={() => setSection(s.key)}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="admin-card admin-form">
        <div className="admin-card-head">
          <h2>
            {CONTENT_SECTIONS.find((s) => s.key === section)?.label || section}
          </h2>
          <div className="admin-form-actions" style={{ margin: 0 }}>
            <button
              type="button"
              className="admin-btn ghost sm"
              onClick={handleResetSection}
            >
              Default
            </button>
            <button
              type="button"
              className="admin-btn sm"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "…" : "Saqlash"}
            </button>
          </div>
        </div>

        {section === "profile" && (
          <div className="admin-grid">
            <Field label="Ism">
              <input
                value={data.name || ""}
                onChange={(e) => patch("name", e.target.value)}
              />
            </Field>
            <Field label="Initsial (avatar)">
              <input
                value={data.initials || ""}
                onChange={(e) => patch("initials", e.target.value)}
                maxLength={4}
              />
            </Field>
            <Field label="Rol (kartochka osti)" full>
              <input
                value={data.role || ""}
                onChange={(e) => patch("role", e.target.value)}
              />
            </Field>
            <Field label="Teglar (vergul bilan)" full>
              <input
                value={(data.tags || []).join(", ")}
                onChange={(e) =>
                  patch(
                    "tags",
                    e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean)
                  )
                }
                placeholder="Farg'ona, O'zbekiston, Mavjud"
              />
            </Field>
          </div>
        )}

        {section === "hero" && (
          <div className="admin-grid">
            <Field label="Badge" full>
              <input
                value={data.badge || ""}
                onChange={(e) => patch("badge", e.target.value)}
              />
            </Field>
            <Field label="Lavozim (job)" full>
              <input
                value={data.job || ""}
                onChange={(e) => patch("job", e.target.value)}
              />
            </Field>
            <Field label="Qisqa matn" full>
              <textarea
                rows={3}
                value={data.info || ""}
                onChange={(e) => patch("info", e.target.value)}
              />
            </Field>
            <Field label="Loyihalar tugmasi">
              <input
                value={data.projectsBtn || ""}
                onChange={(e) => patch("projectsBtn", e.target.value)}
              />
            </Field>
            <Field label="Aloqa tugmasi">
              <input
                value={data.contactBtn || ""}
                onChange={(e) => patch("contactBtn", e.target.value)}
              />
            </Field>
            <div className="full">
              <p className="admin-muted" style={{ marginBottom: 8 }}>
                Statistikalar
              </p>
              {(data.stats || []).map((st, i) => (
                <div className="admin-inline-row" key={i}>
                  <input
                    placeholder="1+"
                    value={st.n || ""}
                    onChange={(e) => {
                      const stats = [...(data.stats || [])];
                      stats[i] = { ...stats[i], n: e.target.value };
                      patch("stats", stats);
                    }}
                  />
                  <input
                    placeholder="yil tajriba"
                    value={st.l || ""}
                    onChange={(e) => {
                      const stats = [...(data.stats || [])];
                      stats[i] = { ...stats[i], l: e.target.value };
                      patch("stats", stats);
                    }}
                  />
                  <button
                    type="button"
                    className="admin-btn danger sm"
                    onClick={() =>
                      patch(
                        "stats",
                        (data.stats || []).filter((_, j) => j !== i)
                      )
                    }
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="admin-btn ghost sm"
                onClick={() =>
                  patch("stats", [...(data.stats || []), { n: "", l: "" }])
                }
              >
                + Stat
              </button>
            </div>
          </div>
        )}

        {section === "about" && (
          <div className="admin-grid">
            <Field label="Badge">
              <input
                value={data.badge || ""}
                onChange={(e) => patch("badge", e.target.value)}
              />
            </Field>
            <Field label="Mavjud / status">
              <input
                value={data.available || ""}
                onChange={(e) => patch("available", e.target.value)}
              />
            </Field>
            <Field label="Sarlavha" full>
              <input
                value={data.title || ""}
                onChange={(e) => patch("title", e.target.value)}
              />
            </Field>
            <Field label="1-paragraf" full>
              <textarea
                rows={4}
                value={data.p1 || ""}
                onChange={(e) => patch("p1", e.target.value)}
              />
            </Field>
            <Field label="2-paragraf" full>
              <textarea
                rows={3}
                value={data.p2 || ""}
                onChange={(e) => patch("p2", e.target.value)}
              />
            </Field>
          </div>
        )}

        {section === "experience" && (
          <div className="admin-stack">
            <div className="admin-grid">
              <Field label="Badge">
                <input
                  value={data.badge || ""}
                  onChange={(e) => patch("badge", e.target.value)}
                />
              </Field>
              <Field label="Sarlavha">
                <input
                  value={data.title || ""}
                  onChange={(e) => patch("title", e.target.value)}
                />
              </Field>
            </div>
            {(data.items || []).map((item, i) => (
              <div className="admin-nested-card" key={i}>
                <div className="admin-card-head">
                  <h3>Tajriba #{i + 1}</h3>
                  <button
                    type="button"
                    className="admin-btn danger sm"
                    onClick={() =>
                      patch(
                        "items",
                        (data.items || []).filter((_, j) => j !== i)
                      )
                    }
                  >
                    O&apos;chirish
                  </button>
                </div>
                <div className="admin-grid">
                  <Field label="Lavozim">
                    <input
                      value={item.role || ""}
                      onChange={(e) => {
                        const items = [...(data.items || [])];
                        items[i] = { ...items[i], role: e.target.value };
                        patch("items", items);
                      }}
                    />
                  </Field>
                  <Field label="Davr">
                    <input
                      value={item.period || ""}
                      onChange={(e) => {
                        const items = [...(data.items || [])];
                        items[i] = { ...items[i], period: e.target.value };
                        patch("items", items);
                      }}
                    />
                  </Field>
                  <Field label="Kompaniya" full>
                    <input
                      value={item.company || ""}
                      onChange={(e) => {
                        const items = [...(data.items || [])];
                        items[i] = { ...items[i], company: e.target.value };
                        patch("items", items);
                      }}
                    />
                  </Field>
                  <Field label="Bandlar (har qator = 1 punkt)" full>
                    <textarea
                      rows={3}
                      value={(item.points || []).join("\n")}
                      onChange={(e) => {
                        const items = [...(data.items || [])];
                        items[i] = {
                          ...items[i],
                          points: e.target.value
                            .split("\n")
                            .map((s) => s.trim())
                            .filter(Boolean),
                        };
                        patch("items", items);
                      }}
                    />
                  </Field>
                </div>
              </div>
            ))}
            <button
              type="button"
              className="admin-btn ghost"
              onClick={() =>
                patch("items", [
                  ...(data.items || []),
                  { role: "", period: "", company: "", points: [] },
                ])
              }
            >
              + Tajriba qo&apos;shish
            </button>
          </div>
        )}

        {section === "skills" && (
          <div className="admin-stack">
            <div className="admin-grid">
              <Field label="Badge">
                <input
                  value={data.badge || ""}
                  onChange={(e) => patch("badge", e.target.value)}
                />
              </Field>
              <Field label="Sarlavha">
                <input
                  value={data.title || ""}
                  onChange={(e) => patch("title", e.target.value)}
                />
              </Field>
            </div>
            {(data.items || []).map((item, i) => (
              <div className="admin-nested-card" key={i}>
                <div className="admin-card-head">
                  <h3>Skill #{i + 1}</h3>
                  <button
                    type="button"
                    className="admin-btn danger sm"
                    onClick={() =>
                      patch(
                        "items",
                        (data.items || []).filter((_, j) => j !== i)
                      )
                    }
                  >
                    O&apos;chirish
                  </button>
                </div>
                <div className="admin-grid">
                  <Field label="Guruh nomi">
                    <input
                      value={item.title || ""}
                      onChange={(e) => {
                        const items = [...(data.items || [])];
                        items[i] = { ...items[i], title: e.target.value };
                        patch("items", items);
                      }}
                    />
                  </Field>
                  <Field label="Elementlar (vergul)">
                    <input
                      value={item.items || ""}
                      onChange={(e) => {
                        const items = [...(data.items || [])];
                        items[i] = { ...items[i], items: e.target.value };
                        patch("items", items);
                      }}
                    />
                  </Field>
                </div>
              </div>
            ))}
            <button
              type="button"
              className="admin-btn ghost"
              onClick={() =>
                patch("items", [
                  ...(data.items || []),
                  { title: "", items: "" },
                ])
              }
            >
              + Skill guruh
            </button>
          </div>
        )}

        {section === "education" && (
          <div className="admin-stack">
            <div className="admin-grid">
              <Field label="Badge">
                <input
                  value={data.badge || ""}
                  onChange={(e) => patch("badge", e.target.value)}
                />
              </Field>
              <Field label="Sarlavha">
                <input
                  value={data.title || ""}
                  onChange={(e) => patch("title", e.target.value)}
                />
              </Field>
            </div>
            {(data.items || []).map((item, i) => (
              <div className="admin-nested-card" key={i}>
                <div className="admin-card-head">
                  <h3>Ta&apos;lim #{i + 1}</h3>
                  <button
                    type="button"
                    className="admin-btn danger sm"
                    onClick={() =>
                      patch(
                        "items",
                        (data.items || []).filter((_, j) => j !== i)
                      )
                    }
                  >
                    O&apos;chirish
                  </button>
                </div>
                <div className="admin-grid">
                  <Field label="Joy / OTM">
                    <input
                      value={item.place || ""}
                      onChange={(e) => {
                        const items = [...(data.items || [])];
                        items[i] = { ...items[i], place: e.target.value };
                        patch("items", items);
                      }}
                    />
                  </Field>
                  <Field label="Davr">
                    <input
                      value={item.period || ""}
                      onChange={(e) => {
                        const items = [...(data.items || [])];
                        items[i] = { ...items[i], period: e.target.value };
                        patch("items", items);
                      }}
                    />
                  </Field>
                  <Field label="Daraja / kurs" full>
                    <input
                      value={item.degree || ""}
                      onChange={(e) => {
                        const items = [...(data.items || [])];
                        items[i] = { ...items[i], degree: e.target.value };
                        patch("items", items);
                      }}
                    />
                  </Field>
                  <Field label="Meta (joy, GPA…)" full>
                    <input
                      value={item.meta || ""}
                      onChange={(e) => {
                        const items = [...(data.items || [])];
                        items[i] = { ...items[i], meta: e.target.value };
                        patch("items", items);
                      }}
                    />
                  </Field>
                </div>
              </div>
            ))}
            <button
              type="button"
              className="admin-btn ghost"
              onClick={() =>
                patch("items", [
                  ...(data.items || []),
                  { place: "", degree: "", period: "", meta: "" },
                ])
              }
            >
              + Ta&apos;lim qo&apos;shish
            </button>
          </div>
        )}

        {(section === "portfolio_meta" || section === "contact_meta") && (
          <div className="admin-grid">
            <Field label="Badge">
              <input
                value={data.badge || ""}
                onChange={(e) => patch("badge", e.target.value)}
              />
            </Field>
            <Field label="Sarlavha">
              <input
                value={data.title || ""}
                onChange={(e) => patch("title", e.target.value)}
              />
            </Field>
            <Field label="Lead matn" full>
              <textarea
                rows={3}
                value={data.lead || ""}
                onChange={(e) => patch("lead", e.target.value)}
              />
            </Field>
          </div>
        )}

        <div className="admin-form-actions">
          <button
            type="button"
            className="admin-btn"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saqlanmoqda…" : "Bo'limni saqlash"}
          </button>
        </div>
      </div>

      <p className="admin-muted">
        SQL bir marta: <code>supabase/site_content.sql</code>
      </p>
    </div>
  );
}

export default ContentEditor;
