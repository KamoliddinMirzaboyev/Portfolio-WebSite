import { useCallback, useEffect, useState } from "react";
import {
  CONTENT_SECTIONS,
  fetchSiteContent,
  getDefaultSiteContent,
  resetSiteSection,
  saveSiteSection,
} from "../../lib/siteContent";
import { AdminFormSkeleton } from "../../components/ui/Skeleton";
import { toastAuto, toastError, toastSuccess } from "../../lib/toast";

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
  const [dirty, setDirty] = useState(false);

  const flash = useCallback(
    (msg, type) => {
      if (!msg) return;
      if (type === "success") toastSuccess(msg);
      else if (type === "error") toastError(msg);
      else toastAuto(msg);
      onMessage?.(msg, type);
    },
    [onMessage]
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchSiteContent();
      setContent(data);
      setDirty(false);
    } catch (err) {
      flash(err.message || "Kontent yuklanmadi", "error");
    } finally {
      setLoading(false);
    }
  }, [flash]);

  useEffect(() => {
    load();
  }, [load]);

  const data = content[section] || {};

  const setSectionData = (next) => {
    setContent((c) => ({ ...c, [section]: next }));
    setDirty(true);
  };

  const patch = (key, value) => {
    setSectionData({ ...data, [key]: value });
  };

  const updateItem = (index, field, value) => {
    const items = [...(data.items || [])];
    items[index] = { ...items[index], [field]: value };
    patch("items", items);
  };

  const removeItem = (index) => {
    const items = (data.items || []).filter((_, j) => j !== index);
    patch("items", items);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // eng yangi state
      let payload;
      setContent((c) => {
        payload = c[section];
        return c;
      });
      // setState async — shu renderdagi content ishonchliroq
      payload = content[section];
      const result = await saveSiteSection(section, payload);
      setDirty(false);
      const label =
        CONTENT_SECTIONS.find((s) => s.key === section)?.label || section;
      if (result.source === "local") {
        flash(
          `«${label}» local saqlandi. Sayt shu brauzerda ko'rinadi.`,
          "success"
        );
      } else {
        flash(`«${label}» saqlandi`, "success");
      }
      const fresh = await fetchSiteContent();
      setContent(fresh);
    } catch (err) {
      if (err.localSaved) {
        setDirty(false);
        flash(
          `${err.message} Local nusxa saqlandi.`,
          "error"
        );
      } else {
        flash(err.message || "Saqlash xatosi", "error");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleResetSection = async () => {
    if (
      !window.confirm(
        "Bu bo'lim default qiymatlarga qaytarilsinmi? Hozirgi o'zgarishlar o'chadi."
      )
    ) {
      return;
    }
    setSaving(true);
    try {
      const def = getDefaultSiteContent()[section];
      setSectionData(def);
      await resetSiteSection(section);
      setDirty(false);
      flash("Bo'lim defaultga qaytarildi va saqlandi", "success");
      const fresh = await fetchSiteContent();
      setContent(fresh);
    } catch (err) {
      flash(err.message || "Defaultga qaytarish xatosi", "error");
    } finally {
      setSaving(false);
    }
  };

  const switchSection = (key) => {
    if (dirty) {
      const ok = window.confirm(
        "Saqlanmagan o'zgarishlar bor. Boshqa bo'limga o'tasizmi?"
      );
      if (!ok) return;
    }
    setSection(key);
    setDirty(false);
  };

  if (loading) {
    return (
      <div className="admin-card">
        <AdminFormSkeleton />
      </div>
    );
  }

  return (
    <div className="admin-content-editor">
      <div className="admin-content-tabs">
        {CONTENT_SECTIONS.map((s) => (
          <button
            key={s.key}
            type="button"
            className={`admin-chip-tab ${section === s.key ? "active" : ""}`}
            onClick={() => switchSection(s.key)}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="admin-card admin-form">
        <div className="admin-card-head">
          <h2>
            {CONTENT_SECTIONS.find((s) => s.key === section)?.label || section}
            {dirty ? " ·" : ""}
          </h2>
          <div className="admin-form-actions" style={{ margin: 0 }}>
            <button
              type="button"
              className="admin-btn ghost sm"
              onClick={handleResetSection}
              disabled={saving}
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
                    onClick={() => removeItem(i)}
                  >
                    O&apos;chirish
                  </button>
                </div>
                <div className="admin-grid">
                  <Field label="Lavozim">
                    <input
                      value={item.role || ""}
                      onChange={(e) => updateItem(i, "role", e.target.value)}
                    />
                  </Field>
                  <Field label="Davr">
                    <input
                      value={item.period || ""}
                      onChange={(e) => updateItem(i, "period", e.target.value)}
                    />
                  </Field>
                  <Field label="Kompaniya" full>
                    <input
                      value={item.company || ""}
                      onChange={(e) =>
                        updateItem(i, "company", e.target.value)
                      }
                    />
                  </Field>
                  <Field label="Bandlar (har qator = 1 punkt)" full>
                    <textarea
                      rows={3}
                      value={(item.points || []).join("\n")}
                      onChange={(e) =>
                        updateItem(
                          i,
                          "points",
                          e.target.value
                            .split("\n")
                            .map((s) => s.trim())
                            .filter(Boolean)
                        )
                      }
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
                    onClick={() => removeItem(i)}
                  >
                    O&apos;chirish
                  </button>
                </div>
                <div className="admin-grid">
                  <Field label="Guruh nomi">
                    <input
                      value={item.title || ""}
                      onChange={(e) => updateItem(i, "title", e.target.value)}
                    />
                  </Field>
                  <Field label="Elementlar (vergul)">
                    <input
                      value={item.items || ""}
                      onChange={(e) => updateItem(i, "items", e.target.value)}
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
            {(data.items || []).length === 0 && (
              <p className="admin-muted">
                Hali ta&apos;lim yo&apos;q. Pastdan qo&apos;shing.
              </p>
            )}
            {(data.items || []).map((item, i) => (
              <div className="admin-nested-card" key={i}>
                <div className="admin-card-head">
                  <h3>Ta&apos;lim #{i + 1}</h3>
                  <button
                    type="button"
                    className="admin-btn danger sm"
                    onClick={() => removeItem(i)}
                  >
                    O&apos;chirish
                  </button>
                </div>
                <div className="admin-grid">
                  <Field label="Joy / OTM">
                    <input
                      value={item.place || ""}
                      onChange={(e) => updateItem(i, "place", e.target.value)}
                    />
                  </Field>
                  <Field label="Davr">
                    <input
                      value={item.period || ""}
                      onChange={(e) => updateItem(i, "period", e.target.value)}
                    />
                  </Field>
                  <Field label="Daraja / kurs" full>
                    <input
                      value={item.degree || ""}
                      onChange={(e) => updateItem(i, "degree", e.target.value)}
                    />
                  </Field>
                  <Field label="Meta (joy, GPA…)" full>
                    <input
                      value={item.meta || ""}
                      onChange={(e) => updateItem(i, "meta", e.target.value)}
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
            {saving ? "Saqlanmoqda…" : dirty ? "Saqlash *" : "Saqlash"}
          </button>
          <button
            type="button"
            className="admin-btn ghost"
            onClick={load}
            disabled={saving}
          >
            Yangilash
          </button>
        </div>
      </div>

      <p className="admin-muted">
        O&apos;zgartirishdan keyin <strong>Saqlash</strong> bosing. SQL:{" "}
        <code>supabase/site_content.sql</code>
      </p>
    </div>
  );
}

export default ContentEditor;
