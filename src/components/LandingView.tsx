import { motion } from "motion/react";
import { Sparkles, MoveRight, Layers, Volume2, Globe, Heart, History, CheckCircle2 } from "lucide-react";

interface LandingViewProps {
  setActiveTab: (tab: string) => void;
}

export default function LandingView({ setActiveTab }: LandingViewProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  };

  const features = [
    {
      icon: Globe,
      color: "from-sky-400 to-indigo-500",
      title: "Global Language Reach",
      desc: "Instant conversions between major global tongues including Spanish, French, Chinese, Japanese, Arabic, and national regional variants like Hindi, Tamil, and Telugu.",
    },
    {
      icon: Layers,
      color: "from-pink-500 to-rose-400",
      title: "Tone & Voice Selection",
      desc: "Tailor the output to match standard contexts, polite formalities, casual talk, business negotiations, or poetical expressions with simple click selectors.",
    },
    {
      icon: Volume2,
      color: "from-emerald-400 to-teal-500",
      title: "Text to Speech synthesis",
      desc: "Listen to natural pronunciations of target translations allowing offline auditory correction or language practice.",
    },
    {
      icon: Heart,
      color: "from-amber-400 to-orange-500",
      title: "Favorites & Recent History",
      desc: "Keep vital translations safe inside bookmarks and track historic conversion trails directly in a visual panel.",
    },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 space-y-16"
      id="landing-view-container"
    >
      {/* 1. Hero Banner */}
      <div className="text-center space-y-7 max-w-4xl mx-auto relative">
        {/* Glow ambient decorations */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -z-10 w-80 h-80 bg-gradient-to-tr from-indigo-500/20 to-sky-500/10 dark:from-indigo-500/10 dark:to-sky-400/5 blur-3xl pointer-events-none rounded-full" />
        
        <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-100 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-300 text-xs font-semibold backdrop-blur-sm shadow-sm font-sans">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
          Next-Generation Full-Context Translator Engine
        </motion.div>

        <motion.h1 
          variants={itemVariants}
          className="font-sans font-extrabold text-4xl sm:text-5xl md:text-6xl tracking-tight text-slate-900 dark:text-white leading-[1.1]"
        >
          Break down language barriers with {" "}
          <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-sky-500 dark:from-indigo-400 dark:via-purple-400 dark:to-sky-450 bg-clip-text text-transparent">
            Gemini-Powered Accuracy
          </span>
        </motion.h1>

        <motion.p 
          variants={itemVariants}
          className="text-slate-600 dark:text-slate-350 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed"
        >
          An elegant translation workspace tailored for speed and visual accuracy. Instantly translate English and other major world languages while tuning the perfect tonality.
        </motion.p>

        <motion.div 
          variants={itemVariants}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2.5"
        >
          <button
            id="landing-start-translating-btn"
            onClick={() => setActiveTab("translator")}
            className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-base bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-3.5"
          >
            Start Translating
            <MoveRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          
          <button
            id="landing-learn-more-btn"
            onClick={() => setActiveTab("about")}
            className="w-full sm:w-auto px-7 py-4 rounded-xl font-bold text-base border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850/50 transition cursor-pointer"
          >
            How it works
          </button>
        </motion.div>
      </div>

      {/* 2. Interactive Mockup Frame preview */}
      <motion.div 
        variants={itemVariants}
        className="relative mx-auto max-w-5xl rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white/50 dark:bg-slate-950/40 p-2 sm:p-3 shadow-2xl backdrop-blur-md"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-100/20 dark:to-slate-900/10 pointer-events-none rounded-2xl" />
        <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-6 sm:p-8 flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
            </div>
            <span className="text-xs font-mono text-slate-400 dark:text-slate-500">
              translation_session.env
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left">
            {/* Input simulator card */}
            <div className="p-5 rounded-xl border border-dashed border-indigo-200/50 dark:border-indigo-900/30 bg-indigo-50/15 dark:bg-indigo-950/5 space-y-3">
              <span className="text-xs font-bold uppercase text-indigo-500 tracking-wider">
                English Source
              </span>
              <p className="text-slate-700 dark:text-slate-300 text-sm font-medium italic">
                "Hello, hope you're doing fine! This application supports voice recognition and will help us learn different dialects."
              </p>
            </div>
            {/* Output simulator card */}
            <div className="p-5 rounded-xl border border-dashed border-sky-200/50 dark:border-sky-900/30 bg-sky-50/15 dark:bg-sky-950/5 space-y-3">
              <span className="text-xs font-bold uppercase text-sky-500 tracking-wider">
                Japanese Translation (Casual Tone)
              </span>
              <p className="text-slate-800 dark:text-slate-200 text-sm font-bold bg-gradient-to-r from-sky-600 to-indigo-600 dark:from-sky-300 dark:to-indigo-300 bg-clip-text text-transparent">
                「こんにちは、元気にしてる？このアプリは音声認識に対応していて、いろんな方言を学ぶのに役立つよ。」
              </p>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center gap-3">
                <span className="px-2 py-0.5 rounded text-xs font-mono bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  Pronunciation: Konnichiwa, genki ni shiteru?
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 3. Core Features Section */}
      <div className="space-y-10 pt-6">
        <div className="text-center space-y-3">
          <h2 className="font-sans font-bold text-3xl text-slate-900 dark:text-white">
            Designed for Instant & Rich Translative Results
          </h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-lg mx-auto text-sm sm:text-base">
            Everything you need for multi-language conversation, study, or international business communications.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, index) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={feat.title}
                variants={itemVariants}
                className="group p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 flex flex-col gap-4 shadow-sm hover:shadow-md hover:border-indigo-500/20 dark:hover:border-indigo-400/20 transition-all duration-300"
              >
                <div className={`p-3.5 rounded-xl text-white bg-gradient-to-tr ${feat.color} w-fit group-hover:scale-105 transition-transform duration-300`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-sans font-bold text-base text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-sky-400 transition-colors">
                  {feat.title}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm leading-relaxed">
                  {feat.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* 4. Trust Banner - Anti-AI Slop, clean elegant assurances */}
      <motion.div 
        variants={itemVariants} 
        className="p-8 rounded-3xl border border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/20 flex flex-col sm:flex-row items-center justify-between gap-6"
      >
        <div className="space-y-1.5 text-center sm:text-left">
          <h4 className="font-sans font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2 justify-center sm:justify-start">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            Context-Aware Translations
          </h4>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm max-w-xl">
            Instead of dry, inaccurate, word-for-word string match replacements like standard legacy systems, Gemini analyzes the absolute context, sentence tone, and semantics.
          </p>
        </div>
        <button
          onClick={() => setActiveTab("translator")}
          className="cursor-pointer whitespace-nowrap px-6 py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm hover:opacity-90 transition shadow-sm"
        >
          Try Universal Translating Now
        </button>
      </motion.div>
    </motion.div>
  );
}
