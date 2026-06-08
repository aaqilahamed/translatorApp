import { Languages, Github, Heart } from "lucide-react";

interface FooterProps {
  setActiveTab: (tab: string) => void;
}

export default function Footer({ setActiveTab }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200/50 dark:border-slate-800 bg-white dark:bg-slate-950 transition-colors duration-300 py-10 mt-16 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        
        {/* Brand */}
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-600 dark:bg-indigo-500 text-white">
            <Languages className="w-4 h-4" />
          </div>
          <span className="font-sans font-extrabold text-sm text-slate-900 dark:text-white">
            Universal Translator
          </span>
        </div>

        {/* Navigation Guides */}
        <div className="flex items-center gap-5 flex-wrap justify-center text-xs font-semibold text-slate-500 dark:text-slate-400">
          <button 
            onClick={() => setActiveTab("home")} 
            className="hover:text-indigo-650 hover:underline cursor-pointer bg-transparent border-none p-0"
          >
            Home
          </button>
          <button 
            onClick={() => setActiveTab("translator")} 
            className="hover:text-indigo-650 hover:underline cursor-pointer bg-transparent border-none p-0"
          >
            Translator App
          </button>
          <button 
            onClick={() => setActiveTab("about")} 
            className="hover:text-indigo-650 hover:underline cursor-pointer bg-transparent border-none p-0"
          >
            About Semantics
          </button>
          <button 
            onClick={() => setActiveTab("contact")} 
            className="hover:text-indigo-650 hover:underline cursor-pointer bg-transparent border-none p-0"
          >
            Contact Desk
          </button>
        </div>

        {/* Copy / Details */}
        <div className="text-[11px] text-slate-400 dark:text-slate-500 flex flex-col sm:items-end gap-1">
          <span>
            © {currentYear} Universal Translator. All rights completed.
          </span>
          <span className="flex items-center gap-1 justify-center sm:justify-end">
            Handcrafted with <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> & Gemini AI
          </span>
        </div>

      </div>
    </footer>
  );
}
