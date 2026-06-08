import { motion } from "motion/react";
import { Info, HelpCircle, Check, Sparkles, Brain, Cpu, MessageSquare } from "lucide-react";

export default function AboutView() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } },
  };

  const benefits = [
    {
      title: "Context & Semantics Analysis",
      desc: "Unlike standard text engines that translate word-for-word, the built-in Gemini model understands exact idiom meanings, contextual subject cues, and local cultural references.",
      icon: Brain,
    },
    {
      title: "Realtime Pronunciation romanization",
      desc: "Instant phonetic guides generated for non-Latin target characters (Japanese, Chinese, Arabic, Hindi) so you can read and pronounce translated material correctly.",
      icon: Cpu,
    },
    {
      title: "Tone Adaptability Styles",
      desc: "Easily adjust the voice output depending on standard settings, professional, business environments, creative prose writing, or casual daily banter.",
      icon: MessageSquare,
    },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 space-y-12 text-left"
      id="about-view-container"
    >
      {/* Visual Title */}
      <div className="text-center space-y-3">
        <motion.div variants={itemVariants} className="inline-flex p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-sky-450 w-fit">
          <Info className="w-6 h-6" />
        </motion.div>
        <motion.h2 variants={itemVariants} className="font-sans font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-white">
          About Universal Translator
        </motion.h2>
        <motion.p variants={itemVariants} className="text-slate-600 dark:text-slate-400 text-sm sm:text-base max-w-lg mx-auto">
          How our next generation semantic translator engine operates.
        </motion.p>
      </div>

      {/* Schematic Flow: Standard vs. Gemini Semantic Translations */}
      <motion.div 
        variants={itemVariants} 
        className="p-6 sm:p-8 rounded-2xl border border-slate-200/60 dark:border-slate-850 bg-white dark:bg-slate-900 shadow-sm space-y-6"
      >
        <h3 className="font-sans font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          The Translating Paradigm Shift
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          Standard translation services parse individual string characters, look them up in a mapped lexical registry database, and swap them verbatim. This frequently breaks down inside conversational contexts, fails to capture nuances, and removes natural tone.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-3">
          {/* Legacy method */}
          <div className="p-5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 space-y-2.5">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Legacy Translation Pattern</span>
            <p className="text-xs font-bold text-rose-500">🚫 String replacements & static matrices</p>
            <div className="text-xs font-mono text-slate-500 dark:text-slate-400 space-y-1">
              <div>"Your input string" ➡️ [Lexical Database Match] ➡️ "Literal output sentence"</div>
            </div>
            <p className="text-xs text-slate-500 mt-1">Often yields robotic, awkward phrasings with severe grammatical errors.</p>
          </div>

          {/* Next gen method */}
          <div className="p-5 rounded-xl border border-indigo-100 dark:border-indigo-950 bg-indigo-50/15 dark:bg-indigo-950/5 space-y-2.5">
            <span className="text-[10px] uppercase font-bold text-indigo-500 tracking-wider block">Our Semantic Translator Pattern</span>
            <p className="text-xs font-bold text-emerald-500 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Modern Large Language Semantics
            </p>
            <div className="text-xs font-mono text-slate-800 dark:text-slate-200">
              "Your input string" ➡️ [Tone Selection/Cultural Idioms Analysis] ➡️ "Accurate translated prose"
            </div>
            <p className="text-xs text-slate-500 mt-1">Flows smoothly, maintains specified formality levels, and includes helper pronunciation tools.</p>
          </div>
        </div>
      </motion.div>

      {/* Benefits Bento Block Grid */}
      <div className="space-y-6 pt-4">
        <h3 className="font-bold text-xl text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
          Benefits & Advantages
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {benefits.map((b, idx) => {
            const Icon = b.icon;
            return (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="p-6 rounded-2xl border border-slate-200/40 dark:border-slate-850/50 bg-white dark:bg-slate-900 space-y-3 shadow-xs hover:border-indigo-500/15 transition-all"
              >
                <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850/65 rounded-xl w-fit text-indigo-600 dark:text-sky-400">
                  <Icon className="w-5 h-5 animate-pulse" />
                </div>
                <h4 className="font-sans font-bold text-base text-slate-900 dark:text-white">
                  {b.title}
                </h4>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  {b.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="space-y-6 pt-4">
        <h3 className="font-bold text-xl text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
          <HelpCircle className="w-5.5 h-5.5 text-indigo-500" />
          Frequently Asked Questions
        </h3>

        <div className="space-y-4">
          <div className="p-5 rounded-xl border border-slate-150/50 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-950/10 space-y-2">
            <h5 className="font-semibold text-sm text-slate-900 dark:text-white">What languages are supported?</h5>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              We support a wide array of global languages—from English, German, French, and Spanish to Arabic, Chinese, Japanese, Korean, Hindi, Tamil, Telugu, and more!
            </p>
          </div>

          <div className="p-5 rounded-xl border border-slate-150/50 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-950/10 space-y-2">
            <h5 className="font-semibold text-sm text-slate-900 dark:text-white">Is there support for local persistence?</h5>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Yes! Your recent translations and favorite bookmarks are cached inside local browser storage, ensuring they never leak and are accessible whenever you return.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
