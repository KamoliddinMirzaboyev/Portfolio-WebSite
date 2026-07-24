import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  LuFileText,
  LuFolderKanban,
  LuGlobe,
  LuLayoutDashboard,
  LuLogOut,
  LuMenu,
  LuNewspaper,
  LuX,
} from "react-icons/lu";
import ContentEditor from "./ContentEditor";
import { supabase, isSupabaseConfigured } from "../../lib/supabase";
import {
  createProject,
  deleteProject,
  tableMissing,
  updateProject,
} from "../../lib/projects";
import {
  createBlog,
  deleteBlog,
  slugify,
  updateBlog,
} from "../../lib/blogs";
import { uploadImageFile } from "../../lib/uploadImage";
import {
  ADMIN_AUTH_EMAIL,
  ADMIN_LOGIN,
  ADMIN_PASSWORD,
} from "../../lib/constants";
import Seo from "../../components/seo/Seo";
import "./Admin.css";

const EMPTY_PROJECT = {
  name: "",
  slug: "",
  info: "",
  description: "",
  img: "",
  gallery: [],
  category: "featured",
  tech: "",
  github: "",
  live: "",
  youtube_url: "",
  price: "",
  for_sale: false,
  sort_order: 0,
};

const EMPTY_BLOG = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  img: "",
  link: "",
  published: true,
  sort_order: 0,
};

const DEFAULT_CATEGORIES = ["featured", "react", "api", "static"];
const CATEGORIES_STORAGE_KEY = "portfolio_project_categories";
const LOCAL_ADMIN_KEY = "portfolio_admin_ok";

function loadStoredCategories() {
  try {
    const raw = localStorage.getItem(CATEGORIES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.map((c) => String(c).trim().toLowerCase()).filter(Boolean)
      : [];
  } catch {
    return [];
  }
}

function saveStoredCategories(list) {
  try {
    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
}

function normalizeCategorySlug(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9\u0400-\u04ff\s-]/gi, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 40);
}

function Admin() {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [localAuthed, setLocalAuthed] = useState(
    () => sessionStorage.getItem(LOCAL_ADMIN_KEY) === "1"
  );
  const [authLoading, setAuthLoading] = useState(true);
  const [loginName, setLoginName] = useState(ADMIN_LOGIN);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authBusy, setAuthBusy] = useState(false);
  const [authHint, setAuthHint] = useState("");

  const [tab, setTab] = useState("dashboard"); // dashboard | projects | blogs | content
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dbReady, setDbReady] = useState(null); // null | true | false

  // Projects
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [projectForm, setProjectForm] = useState(EMPTY_PROJECT);
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [projectPreview, setProjectPreview] = useState("");
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  const [categories, setCategories] = useState(() => {
    const stored = loadStoredCategories();
    return Array.from(new Set([...DEFAULT_CATEGORIES, ...stored]));
  });
  const [newCategory, setNewCategory] = useState("");

  // Blogs
  const [blogs, setBlogs] = useState([]);
  const [loadingBlogs, setLoadingBlogs] = useState(false);
  const [blogForm, setBlogForm] = useState(EMPTY_BLOG);
  const [editingBlogId, setEditingBlogId] = useState(null);
  const [blogPreview, setBlogPreview] = useState("");

  const isAuthed = Boolean(session) || localAuthed;

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setAuthLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session) {
        sessionStorage.setItem(LOCAL_ADMIN_KEY, "1");
        setLocalAuthed(true);
      }
      setAuthLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      if (s) {
        sessionStorage.setItem(LOCAL_ADMIN_KEY, "1");
        setLocalAuthed(true);
      }
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const loadProjects = useCallback(async () => {
    setLoadingProjects(true);
    try {
      if (!isSupabaseConfigured || !supabase) {
        setProjects([]);
        setDbReady(false);
        return;
      }
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });
      if (error) {
        if (tableMissing(error)) {
          setDbReady(false);
          setProjects([]);
          return;
        }
        throw error;
      }
      setDbReady(true);
      const list = (data || []).map((row) => ({
        id: row.id,
        name: row.name ?? "",
        slug: row.slug ?? "",
        info: row.info ?? "",
        description: row.description ?? "",
        img: row.img ?? "",
        gallery: Array.isArray(row.gallery) ? row.gallery : [],
        category: row.category ?? "featured",
        tech: Array.isArray(row.tech) ? row.tech : [],
        github: row.github ?? "",
        live: row.live ?? "",
        youtube_url: row.youtube_url ?? "",
        price: row.price ?? "",
        for_sale: Boolean(row.for_sale),
        sort_order: row.sort_order ?? 0,
      }));
      setProjects(list);
      const fromProjects = list
        .map((p) => normalizeCategorySlug(p.category))
        .filter(Boolean);
      setCategories((prev) => {
        const next = Array.from(
          new Set([...DEFAULT_CATEGORIES, ...prev, ...fromProjects])
        );
        const custom = next.filter((c) => !DEFAULT_CATEGORIES.includes(c));
        saveStoredCategories(custom);
        return next;
      });
    } catch (err) {
      setMessage(err.message || "Loyihalar yuklash xatosi");
    } finally {
      setLoadingProjects(false);
    }
  }, []);

  const addCategory = () => {
    const slug = normalizeCategorySlug(newCategory);
    if (!slug) {
      setMessage("Kategoriya nomini yozing");
      return;
    }
    if (categories.includes(slug)) {
      setProjectForm((f) => ({ ...f, category: slug }));
      setNewCategory("");
      setMessage(`«${slug}» allaqachon bor — tanlandi`);
      return;
    }
    setCategories((prev) => {
      const next = [...prev, slug];
      const custom = next.filter((c) => !DEFAULT_CATEGORIES.includes(c));
      saveStoredCategories(custom);
      return next;
    });
    setProjectForm((f) => ({ ...f, category: slug }));
    setNewCategory("");
    setMessage(`Kategoriya qo'shildi: ${slug}`);
  };

  const removeCustomCategory = (cat) => {
    if (DEFAULT_CATEGORIES.includes(cat)) return;
    setCategories((prev) => {
      const next = prev.filter((c) => c !== cat);
      saveStoredCategories(next.filter((c) => !DEFAULT_CATEGORIES.includes(c)));
      return next;
    });
    setProjectForm((f) =>
      f.category === cat ? { ...f, category: "featured" } : f
    );
  };

  const loadBlogs = useCallback(async () => {
    setLoadingBlogs(true);
    try {
      if (!isSupabaseConfigured || !supabase) {
        setBlogs([]);
        return;
      }
      const { data, error } = await supabase
        .from("blogs")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });
      if (error) {
        if (tableMissing(error)) {
          setDbReady(false);
          setBlogs([]);
          return;
        }
        throw error;
      }
      setBlogs(
        (data || []).map((row) => ({
          id: row.id,
          title: row.title ?? "",
          slug: row.slug ?? "",
          excerpt: row.excerpt ?? "",
          content: row.content ?? "",
          img: row.img ?? "",
          link: row.link ?? "",
          published: row.published !== false,
          sort_order: row.sort_order ?? 0,
          created_at: row.created_at,
        }))
      );
    } catch (err) {
      setMessage(err.message || "Blog yuklash xatosi");
      setBlogs([]);
    } finally {
      setLoadingBlogs(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthed) return;
    loadProjects();
    loadBlogs();
  }, [isAuthed, loadProjects, loadBlogs]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError("");
    setAuthHint("");

    const login = loginName.trim().toLowerCase();
    if (login !== ADMIN_LOGIN) {
      setAuthError(`Login: "${ADMIN_LOGIN}" bo'lishi kerak`);
      return;
    }
    if (password !== ADMIN_PASSWORD) {
      setAuthError("Parol noto'g'ri");
      return;
    }

    setAuthBusy(true);
    try {
      // Lokal kirish — rate limit bo'lsa ham panel ochiladi
      sessionStorage.setItem(LOCAL_ADMIN_KEY, "1");
      setLocalAuthed(true);

      // Faqat signIn (signUp YO'Q — email limit chiqarmaydi)
      if (supabase) {
        const { error } = await supabase.auth.signInWithPassword({
          email: ADMIN_AUTH_EMAIL,
          password: ADMIN_PASSWORD,
        });

        if (error) {
          const msg = (error.message || "").toLowerCase();
          let hint = error.message;
          if (msg.includes("rate limit")) {
            hint =
              "Supabase email limiti (30–60 daqiqa). Panel ochildi. SQL ishga tushiring: supabase/fix_rls_anon_write.sql — yoki Users → Add user: " +
              ADMIN_AUTH_EMAIL +
              " / kamoliddin (Auto Confirm ON).";
          } else if (
            msg.includes("invalid") ||
            msg.includes("credentials")
          ) {
            hint =
              "Supabase user yo'q. Users → Add user: " +
              ADMIN_AUTH_EMAIL +
              " / kamoliddin (Auto Confirm ON). SQL: fix_rls_anon_write.sql";
          }
          setMessage(hint);
        }
      }
    } catch (err) {
      setAuthError(err.message || "Login xatosi");
      sessionStorage.removeItem(LOCAL_ADMIN_KEY);
      setLocalAuthed(false);
    } finally {
      setAuthBusy(false);
    }
  };

  const handleLogout = async () => {
    await supabase?.auth.signOut();
    sessionStorage.removeItem(LOCAL_ADMIN_KEY);
    setSession(null);
    setLocalAuthed(false);
    setProjects([]);
    setBlogs([]);
  };

  const parseTech = (str) =>
    str
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

  // ---- Projects handlers ----
  const onProjectChange = (key, value) => {
    setProjectForm((prev) => ({ ...prev, [key]: value }));
  };

  const resetProjectForm = () => {
    setEditingProjectId(null);
    setProjectForm(EMPTY_PROJECT);
    setProjectPreview("");
    setGalleryPreviews([]);
  };

  const startEditProject = (p) => {
    setTab("projects");
    setEditingProjectId(p.id);
    const gallery = Array.isArray(p.gallery) ? p.gallery : [];
    setProjectForm({
      name: p.name,
      slug: p.slug || "",
      info: p.info,
      description: p.description || "",
      img: p.img,
      gallery,
      category: p.category,
      tech: (p.tech || []).join(", "),
      github: p.github || "",
      live: p.live || "",
      youtube_url: p.youtube_url || "",
      price: p.price || "",
      for_sale: Boolean(p.for_sale),
      sort_order: p.sort_order ?? 0,
    });
    setProjectPreview(p.img || "");
    setGalleryPreviews(gallery);
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleProjectSubmit = async (e) => {
    e.preventDefault();
    if (!projectForm.name.trim()) {
      setMessage("Nom majburiy");
      return;
    }
    setSaving(true);
    setMessage("");
    try {
      const gallery = Array.isArray(projectForm.gallery)
        ? projectForm.gallery.filter(Boolean)
        : [];
      const payload = {
        name: projectForm.name.trim(),
        slug: projectForm.slug.trim(),
        info: projectForm.info.trim(),
        description: projectForm.description.trim(),
        img: projectForm.img.trim() || gallery[0] || "",
        gallery,
        category: projectForm.category,
        tech: parseTech(projectForm.tech),
        github: projectForm.github.trim(),
        live: projectForm.live.trim(),
        youtube_url: projectForm.youtube_url.trim(),
        price: projectForm.price.trim(),
        for_sale: projectForm.for_sale,
        sort_order: Number(projectForm.sort_order) || 0,
      };
      if (editingProjectId) {
        await updateProject(editingProjectId, payload);
        setMessage("Loyiha yangilandi");
      } else {
        await createProject(payload);
        setMessage("Loyiha qo'shildi");
      }
      resetProjectForm();
      await loadProjects();
    } catch (err) {
      setMessage(err.message || "Saqlash xatosi");
    } finally {
      setSaving(false);
    }
  };

  const handleProjectDelete = async (id) => {
    if (!window.confirm("Loyihani o'chirishni tasdiqlaysizmi?")) return;
    try {
      await deleteProject(id);
      if (editingProjectId === id) resetProjectForm();
      await loadProjects();
      setMessage("Loyiha o'chirildi");
    } catch (err) {
      setMessage(err.message || "O'chirish xatosi");
    }
  };

  /** Asosiy cover rasm */
  const handleProjectImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const localUrl = URL.createObjectURL(file);
    setProjectPreview(localUrl);
    setUploading(true);
    setMessage("");
    try {
      const url = await uploadImageFile(file, "projects");
      onProjectChange("img", url);
      setProjectPreview(url);
      // cover ham gallery boshiga
      setProjectForm((prev) => {
        const g = Array.isArray(prev.gallery) ? [...prev.gallery] : [];
        if (url && !g.includes(url)) g.unshift(url);
        return { ...prev, img: url, gallery: g };
      });
      setGalleryPreviews((prev) => {
        if (url && !prev.includes(url)) return [url, ...prev];
        return prev;
      });
      setMessage("Asosiy rasm tayyor");
    } catch (err) {
      setMessage(err.message || "Rasm yuklash xatosi");
      setProjectPreview("");
      onProjectChange("img", "");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  /** Gallery — bir nechta rasm */
  const handleGalleryImages = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    setMessage("");
    try {
      const urls = [];
      for (const file of files) {
        const url = await uploadImageFile(file, "projects/gallery");
        urls.push(url);
      }
      setProjectForm((prev) => {
        const g = Array.isArray(prev.gallery) ? [...prev.gallery] : [];
        const next = [...g, ...urls];
        const img = prev.img || next[0] || "";
        return { ...prev, gallery: next, img };
      });
      setGalleryPreviews((prev) => [...prev, ...urls]);
      if (!projectForm.img && urls[0]) {
        setProjectPreview(urls[0]);
      }
      setMessage(`${urls.length} ta rasm qo'shildi`);
    } catch (err) {
      setMessage(err.message || "Gallery yuklash xatosi");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const removeGalleryImage = (url) => {
    setProjectForm((prev) => {
      const g = (prev.gallery || []).filter((x) => x !== url);
      const img = prev.img === url ? g[0] || "" : prev.img;
      return { ...prev, gallery: g, img };
    });
    setGalleryPreviews((prev) => prev.filter((x) => x !== url));
    if (projectPreview === url) {
      setProjectPreview("");
    }
  };

  // ---- Blogs handlers ----
  const onBlogChange = (key, value) => {
    setBlogForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "title" && !editingBlogId && !prev.slugManual) {
        next.slug = slugify(value);
      }
      return next;
    });
  };

  const onBlogSlugChange = (value) => {
    setBlogForm((prev) => ({
      ...prev,
      slug: value,
      slugManual: true,
    }));
  };

  const resetBlogForm = () => {
    setEditingBlogId(null);
    setBlogForm(EMPTY_BLOG);
    setBlogPreview("");
  };

  const startEditBlog = (post) => {
    setTab("blogs");
    setEditingBlogId(post.id);
    setBlogForm({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      img: post.img,
      link: post.link || "",
      published: post.published !== false,
      sort_order: post.sort_order ?? 0,
      slugManual: true,
    });
    setBlogPreview(post.img || "");
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBlogSubmit = async (e) => {
    e.preventDefault();
    if (!blogForm.title.trim()) {
      setMessage("Sarlavha majburiy");
      return;
    }
    setSaving(true);
    setMessage("");
    try {
      const payload = {
        title: blogForm.title.trim(),
        slug: blogForm.slug.trim() || slugify(blogForm.title),
        excerpt: blogForm.excerpt.trim(),
        content: blogForm.content.trim(),
        img: blogForm.img.trim(),
        link: blogForm.link.trim(),
        published: blogForm.published,
        sort_order: Number(blogForm.sort_order) || 0,
      };
      if (editingBlogId) {
        await updateBlog(editingBlogId, payload);
        setMessage("Blog yangilandi");
      } else {
        await createBlog(payload);
        setMessage("Blog qo'shildi");
      }
      resetBlogForm();
      await loadBlogs();
    } catch (err) {
      setMessage(err.message || "Blog saqlash xatosi");
    } finally {
      setSaving(false);
    }
  };

  const handleBlogDelete = async (id) => {
    if (!window.confirm("Blogni o'chirishni tasdiqlaysizmi?")) return;
    try {
      await deleteBlog(id);
      if (editingBlogId === id) resetBlogForm();
      await loadBlogs();
      setMessage("Blog o'chirildi");
    } catch (err) {
      setMessage(err.message || "O'chirish xatosi");
    }
  };

  const handleBlogImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const localUrl = URL.createObjectURL(file);
    setBlogPreview(localUrl);
    setUploading(true);
    setMessage("");
    try {
      const url = await uploadImageFile(file, "blog");
      onBlogChange("img", url);
      setBlogPreview(url);
      setMessage("Blog rasmi tayyor");
    } catch (err) {
      setMessage(err.message || "Rasm yuklash xatosi");
      setBlogPreview("");
      onBlogChange("img", "");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const saleCount = useMemo(
    () => projects.filter((p) => p.for_sale).length,
    [projects]
  );
  const publishedBlogs = useMemo(
    () => blogs.filter((b) => b.published).length,
    [blogs]
  );

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LuLayoutDashboard },
    {
      id: "content",
      label: "Kontent",
      icon: LuFileText,
    },
    {
      id: "projects",
      label: "Loyihalar",
      icon: LuFolderKanban,
      count: projects.length,
    },
    {
      id: "blogs",
      label: "Blog",
      icon: LuNewspaper,
      count: blogs.length,
    },
  ];

  const pageTitle =
    tab === "dashboard"
      ? "Dashboard"
      : tab === "content"
        ? "Sayt kontenti"
        : tab === "projects"
          ? "Loyihalar"
          : "Blog";

  const goTab = (id) => {
    setTab(id);
    setSidebarOpen(false);
  };

  if (authLoading) {
    return (
      <div className="admin-shell admin-shell--auth">
        <Seo title="Admin" path="/admin" noindex />
        <div className="admin-auth-card">
          <p className="admin-muted">Yuklanmoqda…</p>
        </div>
      </div>
    );
  }

  if (!isSupabaseConfigured) {
    return (
      <div className="admin-shell admin-shell--auth">
        <Seo title="Admin" path="/admin" noindex />
        <div className="admin-auth-card">
          <div className="admin-auth-brand">KM</div>
          <h1>Sozlash kerak</h1>
          <p className="admin-muted">
            `.env` ga <code>VITE_SUPABASE_URL</code> va{" "}
            <code>VITE_SUPABASE_ANON_KEY</code> qo&apos;ying. SQL:{" "}
            <code>supabase/SETUP_ALL.sql</code>
          </p>
          <button
            type="button"
            className="admin-btn"
            onClick={() => navigate("/")}
          >
            Saytga qaytish
          </button>
        </div>
      </div>
    );
  }

  if (!isAuthed) {
    return (
      <div className="admin-shell admin-shell--auth">
        <Seo title="Admin" path="/admin" noindex />
        <form className="admin-auth-card" onSubmit={handleLogin}>
          <div className="admin-auth-brand">KM</div>
          <h1>Admin kirish</h1>
          <p className="admin-muted admin-login-hint">
            Login: <strong>admin</strong> · Parol: <strong>kamoliddin</strong>
          </p>
          <label>
            Login
            <input
              type="text"
              value={loginName}
              onChange={(e) => setLoginName(e.target.value)}
              autoComplete="username"
              placeholder="admin"
              required
            />
          </label>
          <label>
            Parol
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              placeholder="kamoliddin"
              required
            />
          </label>
          {authError && <p className="admin-error">{authError}</p>}
          {authHint && <p className="admin-hint">{authHint}</p>}
          <button type="submit" className="admin-btn admin-btn-block" disabled={authBusy}>
            {authBusy ? "…" : "Kirish"}
          </button>
          <Link to="/" className="admin-auth-back">
            ← Saytga qaytish
          </Link>
        </form>
      </div>
    );
  }

  return (
    <div className={`admin-shell ${sidebarOpen ? "sidebar-open" : ""}`}>
      <Seo title="Admin Dashboard" path="/admin" noindex />

      {sidebarOpen && (
        <button
          type="button"
          className="admin-sidebar-backdrop"
          aria-label="Yopish"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className="admin-sidebar">
        <div className="admin-sidebar-top">
          <div className="admin-sidebar-brand">
            <span className="admin-sidebar-logo">KM</span>
            <div>
              <strong>Admin</strong>
              <span>Portfolio CMS</span>
            </div>
          </div>
          <button
            type="button"
            className="admin-sidebar-close"
            onClick={() => setSidebarOpen(false)}
            aria-label="Yopish"
          >
            <LuX />
          </button>
        </div>

        <nav className="admin-sidebar-nav" aria-label="Admin navigatsiya">
          {navItems.map(({ id, label, icon: Icon, count }) => (
            <button
              key={id}
              type="button"
              className={`admin-nav-item ${tab === id ? "active" : ""}`}
              onClick={() => goTab(id)}
            >
              <Icon />
              <span>{label}</span>
              {typeof count === "number" && (
                <em className="admin-nav-count">{count}</em>
              )}
            </button>
          ))}
        </nav>

        <div className="admin-sidebar-foot">
          <Link to="/" className="admin-nav-item" target="_blank" rel="noreferrer">
            <LuGlobe />
            <span>Saytni ochish</span>
          </Link>
          <button
            type="button"
            className="admin-nav-item admin-nav-item--danger"
            onClick={handleLogout}
          >
            <LuLogOut />
            <span>Chiqish</span>
          </button>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <button
              type="button"
              className="admin-icon-btn"
              onClick={() => setSidebarOpen(true)}
              aria-label="Menu"
            >
              <LuMenu />
            </button>
            <div>
              <h1>{pageTitle}</h1>
              <p className="admin-muted">
                {session?.user?.email || "local admin"}
                {!session && " · local session"}
              </p>
            </div>
          </div>
          <div className="admin-topbar-right">
            <Link to="/blog" className="admin-btn ghost sm">
              Blog
            </Link>
            <Link to="/" className="admin-btn ghost sm" target="_blank">
              <LuGlobe /> Sayt
            </Link>
            <button
              type="button"
              className="admin-btn ghost sm"
              onClick={handleLogout}
            >
              <LuLogOut /> Chiqish
            </button>
          </div>
        </header>

        <div className="admin-content">
          {dbReady === false && (
            <div className="admin-setup-banner">
              <strong>Supabase jadvallari yo&apos;q</strong>
              <p>
                SQL Editor da: <code>supabase/SETUP_ALL.sql</code>
              </p>
            </div>
          )}

          {message && (
            <div className="admin-toast" role="status">
              {message}
              <button
                type="button"
                className="admin-toast-close"
                onClick={() => setMessage("")}
                aria-label="Yopish"
              >
                ×
              </button>
            </div>
          )}

          {tab === "dashboard" && (
            <section className="admin-dashboard">
              <div className="admin-stats">
                <button
                  type="button"
                  className="admin-stat-card"
                  onClick={() => goTab("projects")}
                >
                  <span className="admin-stat-label">Loyihalar</span>
                  <strong className="admin-stat-value">{projects.length}</strong>
                  <span className="admin-stat-hint">Barcha portfolio</span>
                </button>
                <button
                  type="button"
                  className="admin-stat-card"
                  onClick={() => goTab("projects")}
                >
                  <span className="admin-stat-label">Sotuvda</span>
                  <strong className="admin-stat-value">{saleCount}</strong>
                  <span className="admin-stat-hint">for sale</span>
                </button>
                <button
                  type="button"
                  className="admin-stat-card"
                  onClick={() => goTab("blogs")}
                >
                  <span className="admin-stat-label">Bloglar</span>
                  <strong className="admin-stat-value">{blogs.length}</strong>
                  <span className="admin-stat-hint">
                    {publishedBlogs} nashr qilingan
                  </span>
                </button>
                <div className="admin-stat-card">
                  <span className="admin-stat-label">Kategoriyalar</span>
                  <strong className="admin-stat-value">{categories.length}</strong>
                  <span className="admin-stat-hint">default + custom</span>
                </div>
              </div>

              <div className="admin-dash-grid">
                <div className="admin-card">
                  <div className="admin-card-head">
                    <h2>Tezkor amallar</h2>
                  </div>
                  <div className="admin-quick-actions">
                    <button
                      type="button"
                      className="admin-btn"
                      onClick={() => goTab("content")}
                    >
                      Kontent tahrirlash
                    </button>
                    <button
                      type="button"
                      className="admin-btn ghost"
                      onClick={() => goTab("projects")}
                    >
                      + Yangi loyiha
                    </button>
                    <button
                      type="button"
                      className="admin-btn ghost"
                      onClick={() => goTab("blogs")}
                    >
                      + Yangi blog
                    </button>
                    <Link to="/" className="admin-btn ghost" target="_blank">
                      Saytni ko&apos;rish
                    </Link>
                  </div>
                </div>
                <div className="admin-card">
                  <div className="admin-card-head">
                    <h2>So&apos;nggi loyihalar</h2>
                    <button
                      type="button"
                      className="admin-link-btn"
                      onClick={() => goTab("projects")}
                    >
                      Hammasi
                    </button>
                  </div>
                  {projects.length === 0 ? (
                    <p className="admin-muted">Hali loyiha yo&apos;q.</p>
                  ) : (
                    <ul className="admin-list admin-list--compact">
                      {projects.slice(0, 5).map((p) => (
                        <li key={p.id} className="admin-list-item">
                          <div className="admin-list-thumb">
                            {p.img ? (
                              <img src={p.img} alt="" />
                            ) : (
                              <span>—</span>
                            )}
                          </div>
                          <div className="admin-list-meta">
                            <strong>{p.name}</strong>
                            <span>
                              {p.category}
                              {p.for_sale ? " · sale" : ""}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </section>
          )}

          {tab === "content" && (
            <ContentEditor onMessage={setMessage} />
          )}

          {tab === "projects" && (
        <>
          <form className="admin-card admin-form" onSubmit={handleProjectSubmit}>
            <div className="admin-card-head">
              <h2>
                {editingProjectId ? "Loyihani tahrirlash" : "Yangi loyiha"}
              </h2>
            </div>
            <div className="admin-grid">
              <label>
                Nom *
                <input
                  value={projectForm.name}
                  onChange={(e) => onProjectChange("name", e.target.value)}
                  required
                />
              </label>
              <label>
                Slug (URL)
                <input
                  value={projectForm.slug}
                  onChange={(e) => onProjectChange("slug", e.target.value)}
                  placeholder="joybor"
                />
              </label>
              <label>
                Kategoriya
                <select
                  value={
                    categories.includes(projectForm.category)
                      ? projectForm.category
                      : projectForm.category || "featured"
                  }
                  onChange={(e) => onProjectChange("category", e.target.value)}
                >
                  {!categories.includes(projectForm.category) &&
                    projectForm.category && (
                      <option value={projectForm.category}>
                        {projectForm.category}
                      </option>
                    )}
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>
              <label className="full admin-category-add">
                Yangi kategoriya
                <div className="admin-category-row">
                  <input
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="masalan: vue, mobile, crm"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addCategory();
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="admin-btn sm"
                    onClick={addCategory}
                  >
                    Qo&apos;shish
                  </button>
                </div>
                {categories.filter((c) => !DEFAULT_CATEGORIES.includes(c))
                  .length > 0 && (
                  <div className="admin-category-chips">
                    {categories
                      .filter((c) => !DEFAULT_CATEGORIES.includes(c))
                      .map((c) => (
                        <span key={c} className="admin-category-chip">
                          {c}
                          <button
                            type="button"
                            aria-label={`${c} o'chirish`}
                            onClick={() => removeCustomCategory(c)}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                  </div>
                )}
              </label>
              <label>
                Tartib
                <input
                  type="number"
                  value={projectForm.sort_order}
                  onChange={(e) =>
                    onProjectChange("sort_order", e.target.value)
                  }
                />
              </label>
              <label className="full">
                Qisqa tavsif (kartochka)
                <textarea
                  rows={2}
                  value={projectForm.info}
                  onChange={(e) => onProjectChange("info", e.target.value)}
                />
              </label>
              <label className="full">
                To&apos;liq tavsif (detail sahifa)
                <textarea
                  rows={6}
                  value={projectForm.description}
                  onChange={(e) =>
                    onProjectChange("description", e.target.value)
                  }
                  placeholder="Loyiha haqida to'liq matn… (paragraflarni bo'sh qator bilan ajrating)"
                />
              </label>
              <label className="full">
                Asosiy rasm (fayl) {uploading ? "· yuklanmoqda…" : ""}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  onChange={handleProjectImage}
                  disabled={uploading}
                />
              </label>
              {(projectPreview || projectForm.img) && (
                <div className="admin-preview full">
                  <img src={projectPreview || projectForm.img} alt="Preview" />
                </div>
              )}
              <label className="full">
                Gallery rasmlar (bir nechta)
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  multiple
                  onChange={handleGalleryImages}
                  disabled={uploading}
                />
              </label>
              {galleryPreviews.length > 0 && (
                <div className="admin-gallery full">
                  {galleryPreviews.map((src) => (
                    <div className="admin-gallery-item" key={src}>
                      <img src={src} alt="" />
                      <button
                        type="button"
                        className="admin-btn danger sm"
                        onClick={() => removeGalleryImage(src)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <label className="full">
                YouTube video (link)
                <input
                  value={projectForm.youtube_url}
                  onChange={(e) =>
                    onProjectChange("youtube_url", e.target.value)
                  }
                  placeholder="https://www.youtube.com/watch?v=... yoki youtu.be/..."
                />
              </label>
              <label>
                Tech (vergul)
                <input
                  value={projectForm.tech}
                  onChange={(e) => onProjectChange("tech", e.target.value)}
                  placeholder="React, TypeScript"
                />
              </label>
              <label>
                Narx (sotuv)
                <input
                  value={projectForm.price}
                  onChange={(e) => onProjectChange("price", e.target.value)}
                  placeholder="$299 yoki 3 000 000 so'm"
                />
              </label>
              <label>
                GitHub
                <input
                  value={projectForm.github}
                  onChange={(e) => onProjectChange("github", e.target.value)}
                />
              </label>
              <label>
                Live demo
                <input
                  value={projectForm.live}
                  onChange={(e) => onProjectChange("live", e.target.value)}
                />
              </label>
              <label className="admin-check">
                <input
                  type="checkbox"
                  checked={projectForm.for_sale}
                  onChange={(e) =>
                    onProjectChange("for_sale", e.target.checked)
                  }
                />
                Sotuv uchun (for sale)
              </label>
            </div>
            <div className="admin-form-actions">
              <button type="submit" className="admin-btn" disabled={saving}>
                {saving ? "…" : editingProjectId ? "Saqlash" : "Qo'shish"}
              </button>
              {editingProjectId && (
                <button
                  type="button"
                  className="admin-btn ghost"
                  onClick={resetProjectForm}
                >
                  Bekor
                </button>
              )}
            </div>
          </form>

          <section className="admin-card">
            <div className="admin-card-head">
              <h2>
                Loyihalar{" "}
                {loadingProjects ? "…" : `(${projects.length})`}
              </h2>
            </div>
            {projects.length === 0 && !loadingProjects && (
              <p className="admin-muted">Hali loyiha yo&apos;q.</p>
            )}
            <ul className="admin-list">
              {projects.map((p) => (
                <li key={p.id} className="admin-list-item">
                  <div className="admin-list-thumb">
                    {p.img ? <img src={p.img} alt="" /> : <span>—</span>}
                  </div>
                  <div className="admin-list-meta">
                    <strong>{p.name}</strong>
                    <span>
                      /{p.slug || "—"} · {p.category} · #{p.sort_order}
                      {p.for_sale ? " · sale" : ""}
                      {p.youtube_url ? " · yt" : ""}
                    </span>
                  </div>
                  <div className="admin-list-actions">
                    <Link
                      to={`/project/${p.slug || p.id}`}
                      className="admin-btn ghost sm"
                      target="_blank"
                    >
                      View
                    </Link>
                    <button
                      type="button"
                      className="admin-btn ghost sm"
                      onClick={() => startEditProject(p)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="admin-btn danger sm"
                      onClick={() => handleProjectDelete(p.id)}
                    >
                      Del
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}

      {tab === "blogs" && (
        <>
          <form className="admin-card admin-form" onSubmit={handleBlogSubmit}>
            <div className="admin-card-head">
              <h2>{editingBlogId ? "Blogni tahrirlash" : "Yangi blog"}</h2>
            </div>
            <div className="admin-grid">
              <label className="full">
                Sarlavha *
                <input
                  value={blogForm.title}
                  onChange={(e) => onBlogChange("title", e.target.value)}
                  required
                />
              </label>
              <label>
                Slug (URL)
                <input
                  value={blogForm.slug}
                  onChange={(e) => onBlogSlugChange(e.target.value)}
                  placeholder="react-maslahatlar"
                />
              </label>
              <label>
                Tartib
                <input
                  type="number"
                  value={blogForm.sort_order}
                  onChange={(e) => onBlogChange("sort_order", e.target.value)}
                />
              </label>
              <label className="full">
                Qisqa matn (excerpt)
                <textarea
                  rows={2}
                  value={blogForm.excerpt}
                  onChange={(e) => onBlogChange("excerpt", e.target.value)}
                  placeholder="Kartochkada ko'rinadigan qisqa tavsif"
                />
              </label>
              <label className="full">
                To&apos;liq matn (content)
                <textarea
                  rows={8}
                  value={blogForm.content}
                  onChange={(e) => onBlogChange("content", e.target.value)}
                  placeholder="Blog matni… (paragraflarni bo'sh qator bilan ajrating)"
                />
              </label>
              <label className="full">
                Rasm (faqat fayl) {uploading ? "· yuklanmoqda…" : ""}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  onChange={handleBlogImage}
                  disabled={uploading}
                />
              </label>
              {(blogPreview || blogForm.img) && (
                <div className="admin-preview full">
                  <img src={blogPreview || blogForm.img} alt="Preview" />
                  <button
                    type="button"
                    className="admin-btn ghost sm"
                    onClick={() => {
                      setBlogPreview("");
                      onBlogChange("img", "");
                    }}
                  >
                    Rasmni olib tashlash
                  </button>
                </div>
              )}
              <label className="full">
                Tashqi blog link (ixtiyoriy)
                <input
                  value={blogForm.link}
                  onChange={(e) => onBlogChange("link", e.target.value)}
                  placeholder="https://medium.com/... yoki boshqa manba"
                />
              </label>
              <label className="admin-check">
                <input
                  type="checkbox"
                  checked={blogForm.published}
                  onChange={(e) =>
                    onBlogChange("published", e.target.checked)
                  }
                />
                Nashr qilingan (saytda ko&apos;rinsin)
              </label>
            </div>
            <div className="admin-form-actions">
              <button type="submit" className="admin-btn" disabled={saving}>
                {saving ? "…" : editingBlogId ? "Saqlash" : "Qo'shish"}
              </button>
              {editingBlogId && (
                <button
                  type="button"
                  className="admin-btn ghost"
                  onClick={resetBlogForm}
                >
                  Bekor
                </button>
              )}
            </div>
          </form>

          <section className="admin-card">
            <div className="admin-card-head">
              <h2>
                Bloglar {loadingBlogs ? "…" : `(${blogs.length})`}
              </h2>
            </div>
            {blogs.length === 0 && !loadingBlogs && (
              <p className="admin-muted">
                Hali blog yo&apos;q. SQL:{" "}
                <code>supabase/blogs_only.sql</code>
              </p>
            )}
            <ul className="admin-list">
              {blogs.map((post) => (
                <li key={post.id} className="admin-list-item">
                  <div className="admin-list-thumb">
                    {post.img ? (
                      <img src={post.img} alt="" />
                    ) : (
                      <span>—</span>
                    )}
                  </div>
                  <div className="admin-list-meta">
                    <strong>{post.title}</strong>
                    <span>
                      /{post.slug} ·{" "}
                      {post.published ? "published" : "draft"} · #
                      {post.sort_order}
                      {post.link ? " · link" : ""}
                    </span>
                  </div>
                  <div className="admin-list-actions">
                    <Link
                      to={`/blog/${post.slug || post.id}`}
                      className="admin-btn ghost sm"
                      target="_blank"
                    >
                      View
                    </Link>
                    <button
                      type="button"
                      className="admin-btn ghost sm"
                      onClick={() => startEditBlog(post)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="admin-btn danger sm"
                      onClick={() => handleBlogDelete(post.id)}
                    >
                      Del
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
        </div>
      </div>
    </div>
  );
}

export default Admin;
