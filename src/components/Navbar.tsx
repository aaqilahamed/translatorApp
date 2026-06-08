import { Languages, Home, Sparkles, Info, Mail, Sun, Moon, Menu, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

export default function Navbar({ activeTab, setActiveTab, darkMode, toggleDarkMode }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: "home", label: "Home", icon: Home },
    { id: "translator", label: "Translator", icon: Sparkles },
    { id: "about", label: "About", icon: Info },
    { id: "contact", label: "Contact", icon: Mail },
  ];

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md border-b transition-colors duration-300 bg-white/75 dark:bg-slate-900/75 border-slate-200/50 dark:border-slate-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div 
            className="flex items-center gap-2.5 cursor-pointer group"
            onClick={() => { setActiveTab("home"); setMobileMenuOpen(false); }}
            id="logo-brand"
          >
            <div className="p-2 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 dark:from-sky-400 dark:to-indigo-500 text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200">
              <Languages className="w-5 h-5" />
            </div>
            <div>
              <span className="font-sans font-bold text-lg tracking-tight bg-gradient-to-r from-slate-900 to-indigo-950 dark:from-white dark:to-indigo-200 bg-clip-text text-transparent">
                Universal
              </span>
              <span className="text-xs block text-sky-600 dark:text-sky-400 font-mono tracking-widest font-bold -mt-1 uppercase">
                Translator
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                    isActive
                      ? "text-indigo-600 dark:text-sky-400"
                      : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNavIndicator"
                      className="absolute inset-0 bg-indigo-50 dark:bg-sky-950/40 rounded-lg -z-10 border border-indigo-100/50 dark:border-sky-900/30"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <Icon className="w-4.5 h-4.5" />
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Right Controls */}
          <div className="hidden md:flex items-center gap-3">
            {/* Quick Link to launch translator */}
            {activeTab !== "translator" && (
              <button
                id="header-start-translate-btn"
                onClick={() => setActiveTab("translator")}
                className="cursor-pointer text-xs font-semibold uppercase tracking-wider px-4 py-2 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 transition shadow-sm"
              >
                Launch App
              </button>
            )}

            {/* Light/Dark Toggle */}
            <button
              id="theme-toggle-btn"
              onClick={toggleDarkMode}
              className="p-2.5 rounded-xl border cursor-pointer border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
              aria-label="Toggle theme"
            >
              {darkMode ? (
                <Sun className="w-4.5 h-4.5 text-amber-400" />
              ) : (
                <Moon className="w-4.5 h-4.5 text-slate-700" />
              )}
            </button>
          </div>

          {/* Mobile menu button / Theme combination */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              id="theme-toggle-mobile"
              onClick={toggleDarkMode}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/40"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              id="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-2 pb-6 space-y-2.5"
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-tab-mobile-${item.id}`}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left font-medium text-sm transition-all ${
                    isActive
                      ? "bg-indigo-50 dark:bg-sky-950/50 text-indigo-600 dark:text-sky-400 font-semibold"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/30"
                  }`}
                >
                  <Icon className="w-4.5 h-4.5" />
                  {item.label}
                </button>
              );
            })}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60">
              <button
                id="mobile-launch-app-btn"
                onClick={() => {
                  setActiveTab("translator");
                  setMobileMenuOpen(false);
                }}
                className="w-full text-center py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-sky-500 text-white text-sm font-semibold tracking-wide"
              >
                Go to Translator
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
