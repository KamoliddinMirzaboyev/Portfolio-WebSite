import React from "react";
import "./App.css";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster } from "sonner";
import Home from "./pages/home/Home";
import Blog from "./pages/blog/Blog";
import BlogPost from "./pages/blog/BlogPost";
import ProjectDetail from "./pages/project/ProjectDetail";
import Admin from "./pages/admin/Admin";
import Navbar from "./components/navbar/Navbar";
import Footer from "./components/footer/Footer";
import AnimatedBackground from "./components/background/AnimatedBackground";
import { LanguageProvider } from "./i18n/LanguageContext";
import { ThemeProvider, useTheme } from "./theme/ThemeContext";

function AppToaster() {
  const { isDark } = useTheme();
  return (
    <Toaster
      theme={isDark ? "dark" : "light"}
      position="top-right"
      richColors
      closeButton
      duration={3200}
      toastOptions={{
        className: "app-sonner-toast",
        style: {
          fontFamily: "var(--font, system-ui, sans-serif)",
        },
      }}
    />
  );
}

function Shell() {
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith("/admin");

  return (
    <>
      {!isAdmin && <AnimatedBackground />}
      {!isAdmin && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/project/:slug" element={<ProjectDetail />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
      {!isAdmin && <Footer />}
      <AppToaster />
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <BrowserRouter>
          <Shell />
        </BrowserRouter>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
