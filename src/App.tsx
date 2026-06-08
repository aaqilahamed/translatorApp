import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import LandingView from "./components/LandingView";
import TranslatorView from "./components/TranslatorView";
import AboutView from "./components/AboutView";
import ContactView from "./components/ContactView";
import Footer from "./components/Footer";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [activeTab, setActiveTab] = useState("home");
  const [darkMode, setDarkMode] = useState(true); // Default to a stylish dark theme for translation portal

  // 1. Load initial theme from localStorage on mount (safe for iframes/sandboxes)
  useEffect(() => {
    try {
      const persistedTheme = localStorage.getItem("translator_dark_theme");
      if (persistedTheme !== null) {
        setDarkMode(JSON.parse(persistedTheme));
      }
    } catch (e) {
      console.warn("Theme persistence reads disabled (this is normal in sandboxed previews):", e);
    }
  }, []);

  // 2. Synchronize theme class on documentElement and persist changes on update
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    try {
      localStorage.setItem("translator_dark_theme", JSON.stringify(darkMode));
    } catch (e) {
      // safe fallback if storage fails
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case "home":
        return <LandingView setActiveTab={setActiveTab} />;
      case "translator":
        return <TranslatorView />;
      case "about":
        return <AboutView />;
      case "contact":
        return <ContactView />;
      default:
        return <LandingView setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans">
      
      {/* Absolute Decorative ambient background elements */}
      <div className="fixed inset-0 -z-50 overflow-hidden pointer-events-none opacity-40 dark:opacity-20">
        {/* Glow point 1 */}
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-gradient-to-tr from-sky-400 to-indigo-500 rounded-full blur-3xl" />
        {/* Glow point 2 */}
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full blur-3xl" />
      </div>

      {/* Glassmorphic Navigation bar */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        darkMode={darkMode} 
        toggleDarkMode={toggleDarkMode} 
      />

      {/* Screen view content area with dynamic layout transit fades */}
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            {renderActiveView()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Clean footer context */}
      <Footer setActiveTab={setActiveTab} />
    </div>
  );
}
