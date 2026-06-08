import { useState, useEffect, useRef, ChangeEvent } from "react";
import { 
  ArrowLeftRight, Copy, RotateCcw, Volume2, Mic, MicOff, 
  Sparkles, Trash2, Heart, History, Star, HelpCircle, FileText, Check, AlertCircle, X 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { LANGUAGES, TONES, Language, HistoryItem, TranslationResult } from "../types";
import { getClientOfflineTranslation } from "../lib/offlineFallback";

export default function TranslatorView() {
  const [sourceText, setSourceText] = useState("");
  const [translatedResult, setTranslatedResult] = useState<TranslationResult | null>(null);
  const [sourceLang, setSourceLang] = useState("auto");
  const [targetLang, setTargetLang] = useState("es");
  const [activeTone, setActiveTone] = useState("standard");
  const [isTranslating, setIsTranslating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // States for Local Key Override & Connection Status
  const [localApiKey, setLocalApiKey] = useState(() => {
    return localStorage.getItem("localhost_gemini_key") || "";
  });
  const [showApiSettings, setShowApiSettings] = useState(false);
  const [geminiStatus, setGeminiStatus] = useState<{
    success: boolean;
    errorType: string | null;
    errorMessage: string | null;
  } | null>(null);

  const handleSaveLocalKey = (key: string) => {
    const trimmed = key.trim();
    setLocalApiKey(trimmed);
    if (trimmed) {
      localStorage.setItem("localhost_gemini_key", trimmed);
    } else {
      localStorage.removeItem("localhost_gemini_key");
    }
  };

  useEffect(() => {
    if (translatedResult && translatedResult.geminiStatus) {
      setGeminiStatus(translatedResult.geminiStatus);
    }
  }, [translatedResult]);

  // States for Voice (Speech-to-Text)
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // States for Copy Feedback
  const [copiedText, setCopiedText] = useState(false);

  // States for History & Favorites
  const [historyList, setHistoryList] = useState<HistoryItem[]>([]);
  const [favoritesList, setFavoritesList] = useState<HistoryItem[]>([]);
  const [activeTab, setActiveTab] = useState<"history" | "favorites">("history");

  // Load History and Bookmarks from Local Storage
  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem("translator_history_v2");
      if (storedHistory) {
        setHistoryList(JSON.parse(storedHistory));
      }
      const storedFavorites = localStorage.getItem("translator_favorites_v2");
      if (storedFavorites) {
        setFavoritesList(JSON.parse(storedFavorites));
      }
    } catch (e) {
      console.error("Local storage error:", e);
    }
  }, []);

  // Save changes to Local Storage
  const saveHistory = (items: HistoryItem[]) => {
    localStorage.setItem("translator_history_v2", JSON.stringify(items));
    setHistoryList(items);
  };

  const saveFavorites = (items: HistoryItem[]) => {
    localStorage.setItem("translator_favorites_v2", JSON.stringify(items));
    setFavoritesList(items);
  };

  // Setup Web Speech API Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US"; // Standard auto-input source

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onerror = (e: any) => {
        console.error("Speech Recognition Error:", e);
        setIsListening(false);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setSourceText((prev) => (prev ? prev + " " + transcript : transcript));
        }
      };

      recognitionRef.current = recognition;
    }
  }, []);

  // Toggle Voice listening
  const handleMicrophoneClick = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not fully supported or permitted in this iframe/browser. Try typing directly!");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      // Configure language based on chosen source language if not 'auto'
      if (sourceLang !== "auto") {
        recognitionRef.current.lang = sourceLang;
      } else {
        recognitionRef.current.lang = "en-US";
      }
      recognitionRef.current.start();
    }
  };

  // Perform Translation
  const handleTranslate = async () => {
    if (!sourceText || !sourceText.trim()) return;

    setIsTranslating(true);
    setErrorMsg(null);

    let data: TranslationResult;

    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: sourceText,
          sourceLanguage: sourceLang,
          targetLanguage: targetLang,
          tone: activeTone,
          clientApiKey: localApiKey || undefined,
        }),
      });

      const contentType = response.headers.get("content-type");
      if (!response.ok) {
        // If it was not ok and it's JSON, try parsing error
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Translation request failed with status ${response.status}`);
        } else {
          throw new Error(`Server returned status ${response.status} (non-JSON response).`);
        }
      }

      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server did not return a valid JSON format.");
      }

      data = await response.json();
      if (data && data.geminiStatus) {
        setGeminiStatus(data.geminiStatus);
      }
    } catch (err: any) {
      console.warn("API translation failed. Activating high-fidelity client-side offline fallback engine:", err);
      data = getClientOfflineTranslation(sourceText, sourceLang, targetLang, activeTone);
      setGeminiStatus({
        success: false,
        errorType: "network_error",
        errorMessage: "Localhost translation server offline or unreachable. Click to troubleshoot."
      });
    }

    try {
      setTranslatedResult(data);

      // Extract specific language codes and human readable titles
      const sourceLanguageObj = LANGUAGES.find((l) => l.code === sourceLang);
      const targetLanguageObj = LANGUAGES.find((l) => l.code === targetLang);

      const sourceLabel = sourceLang === "auto" 
        ? `Auto-Detect (${data.detectedLanguage})` 
        : (sourceLanguageObj?.name || "English");

      const targetLabel = targetLanguageObj?.name || "Spanish";

      // Append translation to visual history
      const newHistoryItem: HistoryItem = {
        id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: sourceText,
        sourceLanguageName: sourceLabel,
        sourceLanguageCode: data.languageCode || sourceLang,
        targetLanguageName: targetLabel,
        targetLanguageCode: targetLang,
        translatedText: data.translatedText,
        tone: activeTone,
        isFavorite: false,
      };

      const updatedHistory = [newHistoryItem, ...historyList].slice(0, 30); // Max 30 cache
      saveHistory(updatedHistory);

    } catch (err: any) {
      console.error("Failed to update translation state UI:", err);
      setErrorMsg(err.message || "An unexpected UI error occurred.");
    } finally {
      setIsTranslating(false);
    }
  };

  // Swap Languages
  const handleSwapLanguages = () => {
    if (sourceLang === "auto") {
      // Swap is only direct between valid inputs. Default to 'en' if auto was active.
      setSourceLang(targetLang);
      setTargetLang("en");
    } else {
      const temp = sourceLang;
      setSourceLang(targetLang);
      setTargetLang(temp);
    }

    if (translatedResult && sourceText) {
      const tempText = sourceText;
      setSourceText(translatedResult.translatedText);
      setTranslatedResult({
        translatedText: tempText,
        detectedLanguage: "Swapped language result",
        languageCode: targetLang,
      });
    }
  };

  // Clear all states
  const handleClear = () => {
    setSourceText("");
    setTranslatedResult(null);
    setErrorMsg(null);
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  // Copy Translation to Clipboard
  const handleCopyToClipboard = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  // Read translated text using Text To Speech
  const handleSpeechOutput = (text: string, langCode: string) => {
    if (!text) return;

    // Check if voice synthesis is loading or already running
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel(); // Cancel current audio playback first
      
      const utterance = new SpeechSynthesisUtterance(text);
      // Map general standard matching voice codes
      utterance.lang = langCode;
      
      // Select appropriate voice based on available browser voices matching code
      const voices = window.speechSynthesis.getVoices();
      const matchVoice = voices.find(v => v.lang.startsWith(langCode));
      if (matchVoice) {
        utterance.voice = matchVoice;
      }

      window.speechSynthesis.speak(utterance);
    } else {
      alert("Speech synthesis is not supported on this device/environment.");
    }
  };

  // Toggle Favorite
  const handleToggleFavorite = (item: HistoryItem) => {
    const isAlreadyFavorite = favoritesList.some((f) => f.id === item.id || (f.text === item.text && f.translatedText === item.translatedText));

    if (isAlreadyFavorite) {
      // Remove
      const filtered = favoritesList.filter((f) => f.id !== item.id && !(f.text === item.text && f.translatedText === item.translatedText));
      saveFavorites(filtered);
      
      // Update state item in history as well as visual
      const updatedHistory = historyList.map(h => h.id === item.id ? { ...h, isFavorite: false } : h);
      saveHistory(updatedHistory);
    } else {
      // Add
      const newItem = { ...item, isFavorite: true };
      const updatedFavorites = [newItem, ...favoritesList];
      saveFavorites(updatedFavorites);

      const updatedHistory = historyList.map(h => h.id === item.id ? { ...h, isFavorite: true } : h);
      saveHistory(updatedHistory);
    }
  };

  // Remove History Block item
  const handleDeleteHistoryItem = (id: string, isFav: boolean) => {
    if (isFav) {
      const updatedFavs = favoritesList.filter((f) => f.id !== id);
      saveFavorites(updatedFavs);
    } else {
      const updatedHist = historyList.filter((h) => h.id !== id);
      saveHistory(updatedHist);
    }
  };

  // Clear all list
  const handleClearAllLists = (isFav: boolean) => {
    if (isFav) {
      if (confirm("Are you sure you want to clear your bookmarked favorites?")) {
        saveFavorites([]);
      }
    } else {
      if (confirm("Are you sure you want to clear your translation history?")) {
        saveHistory([]);
      }
    }
  };

  // Recall historic Translation
  const handleRecallTranslation = (item: HistoryItem) => {
    setSourceText(item.text);
    setSourceLang(item.sourceLanguageCode === "auto" ? "auto" : item.sourceLanguageCode);
    setTargetLang(item.targetLanguageCode);
    setActiveTone(item.tone || "standard");
    setTranslatedResult({
      translatedText: item.translatedText,
      detectedLanguage: item.sourceLanguageName,
      languageCode: item.sourceLanguageCode,
    });
  };

  // File Upload Text Extraction Utility
  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const parsedText = event.target?.result;
      if (typeof parsedText === "string") {
        setSourceText(parsedText);
      }
    };
    reader.onerror = () => {
      alert("Failed to read text from file upload.");
    };
    reader.readAsText(file);
  };

  // Helper values
  const currentSourceTextLength = sourceText.length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10" id="translator-view-panel">
      
      {/* 2-Column Responsive Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Main Translator Section - 8cols on desktop */}
        <div className="lg:col-span-8 space-y-7">
          
          {/* Header Workspace Details: Simple, Human Title */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/60 pb-5">
            <div>
              <h2 className="font-sans font-extrabold text-2xl text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5.5 h-5.5 text-indigo-500" />
                Language Portal
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
                Type, speak, or upload a text file. Customize the tone as needed.
              </p>
            </div>
            
            {/* Tone selector */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {TONES.map((t) => (
                <button
                  key={t.value}
                  id={`tone-select-${t.value}`}
                  onClick={() => setActiveTone(t.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition flex items-center gap-1.5 ${
                    activeTone === t.value
                      ? "bg-indigo-600 text-white shadow"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700/80"
                  }`}
                  title={t.desc}
                >
                  <span>{t.icon}</span>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Collapsible Gemini API Settings & Local Guide */}
          <AnimatePresence>
            {showApiSettings && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-200/50 dark:border-slate-800 p-5 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <h4 className="text-xs font-mono font-bold tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-1.5 uppercase">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
                        Gemini Developer Gateway Guide
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">
                        To enable deep neural contextual translation, cultural idioms localization, and spelling corrections in raw input, specify your Gemini API Key.
                      </p>
                    </div>
                    <button
                      id="close-api-settings-btn"
                      onClick={() => setShowApiSettings(false)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-end">
                    <div className="md:col-span-7 space-y-1.5">
                      <label className="block text-[10.5px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 pl-1">
                        Browser Key Override (Saved locally in your device)
                      </label>
                      <div className="relative">
                        <input
                          id="local-api-key-input"
                          type="password"
                          value={localApiKey}
                          onChange={(e) => handleSaveLocalKey(e.target.value)}
                          placeholder="Paste your active GEMINI_API_KEY here..."
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 rounded-xl pl-3 pr-10 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:border-indigo-500 outline-none transition shadow-sm font-mono"
                        />
                        {localApiKey ? (
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <div className="md:col-span-5 p-3 bg-white/40 dark:bg-slate-900/10 rounded-xl border border-dashed border-slate-200/80 dark:border-slate-800/80 text-[10.5px] text-slate-500 dark:text-slate-400 leading-normal">
                      <span className="font-bold text-slate-700 dark:text-slate-300 block mb-0.5">Alternative: Local .env File</span>
                      Create a file named <code className="font-mono bg-slate-100 dark:bg-slate-950 px-1 py-0.5 rounded text-[9.5px]">.env</code> in your root sandbox folder and add:
                      <code className="block font-mono bg-slate-100 dark:bg-slate-950 px-1.5 py-1 rounded text-[9.5px] mt-1 text-slate-600 dark:text-slate-300">GEMINI_API_KEY="AIzaSy..."</code>
                    </div>
                  </div>

                  {geminiStatus && (
                    <div className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                      geminiStatus.success
                        ? "bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-100 dark:border-emerald-950/40 text-emerald-800 dark:text-emerald-400"
                        : "bg-amber-50/50 dark:bg-amber-950/10 border-amber-100 dark:border-amber-950/40 text-amber-800 dark:text-amber-400"
                    }`}>
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <span className="font-bold block text-xs">
                          {geminiStatus.success ? "Connection: Connected (Gemini Active)" : "Connection: Fallback Passive Mode"}
                        </span>
                        <p className="text-[11px] opacity-90 font-medium">
                          {geminiStatus.success
                            ? "Your API key override is correctly active. Live neural translations are fully enabled now."
                            : `${geminiStatus.errorMessage}. Running translation seamlessly on cloud-powered public translator fallback.`
                          }
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Core Selectors & Interchanging Swapper */}
          <div className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 p-3 rounded-2xl shadow-sm">
            {/* Source dropdown */}
            <div className="flex-1">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1 pl-1">
                Translate From
              </label>
              <select
                id="source-language-select"
                value={sourceLang}
                onChange={(e) => setSourceLang(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm font-semibold outline-none text-slate-800 dark:text-slate-200"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code} disabled={l.code === targetLang}>
                    {l.flag} {l.name} {l.nativeName && `( ${l.nativeName} )`}
                  </option>
                ))}
              </select>
            </div>

            {/* Swap Button */}
            <button
              id="swap-languages-btn"
              onClick={handleSwapLanguages}
              className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 hover:text-indigo-600 dark:hover:text-indigo-400 hover:scale-105 transition-all self-end cursor-pointer"
              title="Swap Languages"
            >
              <ArrowLeftRight className="w-4 h-4" />
            </button>

            {/* Target dropdown */}
            <div className="flex-1">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1 pl-1">
                Translate To
              </label>
              <select
                id="target-language-select"
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm font-semibold outline-none text-slate-800 dark:text-slate-200"
              >
                {/* Auto cannot be a target language */}
                {LANGUAGES.filter(v => v.code !== "auto").map((l) => (
                  <option key={l.code} value={l.code} disabled={l.code === sourceLang}>
                    {l.flag} {l.name} {l.nativeName && `( ${l.nativeName} )`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Translation Boxes: Dual View Box */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Input Left Box */}
            <div className="flex flex-col rounded-2xl border border-slate-200/65 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden focus-within:border-indigo-500/50 dark:focus-within:border-sky-500/40 transition-colors">
              <div className="flex items-center justify-between px-4 py-2 bg-slate-50/50 dark:bg-slate-950/40 border-b border-slate-100 dark:border-slate-800/40">
                <span className="text-xs font-mono font-bold text-slate-400 dark:text-slate-500">
                  {sourceLang === "auto" ? "Detecting Mode" : "Source Input"}
                </span>

                {/* File Upload Trigger */}
                <label className="cursor-pointer text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1.5 select-none hover:bg-slate-100 dark:hover:bg-slate-800/80 px-2.5 py-1 rounded">
                  <FileText className="w-3.5 h-3.5" />
                  Upload .txt
                  <input
                    type="file"
                    accept=".txt"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="plaintext-file-upload"
                  />
                </label>
              </div>

              {/* Input Area */}
              <div className="p-4 relative flex-1 min-h-[220px]">
                <textarea
                  id="source-text-input"
                  value={sourceText}
                  onChange={(e) => setSourceText(e.target.value)}
                  placeholder="Enter standard phrases, sentences, paragraphs to translate..."
                  className="w-full h-full min-h-[180px] bg-transparent outline-none border-none text-sm leading-relaxed text-slate-800 dark:text-slate-200 resize-none font-sans"
                  maxLength={5000}
                />
              </div>

              {/* Bottom Utilities bar */}
              <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/50 p-3 bg-slate-50/20 dark:bg-slate-950/10">
                <div className="flex items-center gap-1">
                  {/* Speech input microphone */}
                  <button
                    id="voice-input-mic-btn"
                    onClick={handleMicrophoneClick}
                    className={`p-2 rounded-xl transition cursor-pointer ${
                      isListening 
                        ? "bg-rose-500 text-white animate-pulse" 
                        : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                    title={isListening ? "Listening... click to lock" : "Voice Input (Speech recognition)"}
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>

                  {/* Clear text */}
                  {sourceText && (
                    <button
                      id="clear-input-btn"
                      onClick={handleClear}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition cursor-pointer"
                      title="Clear content"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Character Counter */}
                <span className="text-[11px] font-mono font-medium text-slate-400 dark:text-slate-500 pr-1 select-none">
                  {currentSourceTextLength} / 5000
                </span>
              </div>
            </div>

            {/* Output Right Box */}
            <div className="flex flex-col rounded-2xl border border-slate-200/65 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden min-h-[220px]">
              <div className="flex items-center justify-between px-4 py-2 bg-slate-50/50 dark:bg-slate-950/40 border-b border-slate-100 dark:border-slate-800/40">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-slate-400 dark:text-slate-500">
                    Translated Output
                  </span>
                  {translatedResult?.detectedLanguage && sourceLang === "auto" && (
                    <span className="px-1.5 py-0.5 rounded bg-emerald-100/60 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 font-sans text-[10px] font-bold">
                      Detected: {translatedResult.detectedLanguage}
                    </span>
                  )}
                </div>

                {/* Premium translation status identifier */}
                {geminiStatus ? (
                  geminiStatus.success ? (
                    <button
                      onClick={() => setShowApiSettings(!showApiSettings)}
                      className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 transition-all hover:opacity-80 cursor-pointer bg-transparent border-0 outline-none"
                      title="Gemini AI is connected and active. Click to view configuration."
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Gemini AI Active
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowApiSettings(true)}
                      className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5 transition-all hover:opacity-85 animate-pulse cursor-pointer bg-transparent border-0 outline-none"
                      title={`${geminiStatus.errorMessage}. Click to configure API Key Override.`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      Gemini Local Fallback
                    </button>
                  )
                ) : (
                  <button
                    onClick={() => setShowApiSettings(!showApiSettings)}
                    className="text-[10px] font-bold uppercase tracking-wider text-indigo-500/80 dark:text-sky-400/85 flex items-center gap-1.5 hover:underline transition-all cursor-pointer bg-transparent border-0 outline-none"
                    title="Click to check translation settings or configure custom API Key."
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-sky-400 animate-pulse" />
                    Gemini AI Core
                  </button>
                )}
              </div>

              {/* Output Content Area */}
              <div className="p-4 flex-1 min-h-[220px] relative">
                {isTranslating ? (
                  <div className="absolute inset-0 bg-white/70 dark:bg-slate-900/70 p-6 flex flex-col items-center justify-center gap-3">
                    <div className="w-10 h-10 border-4 border-indigo-600/30 border-t-indigo-600 dark:border-sky-500/30 dark:border-t-sky-500 animate-spin rounded-full" />
                    <span className="text-xs font-bold text-indigo-600 dark:text-sky-450 animate-pulse uppercase tracking-wider">
                      Analyzing Semantics...
                    </span>
                  </div>
                ) : errorMsg ? (
                  <div className="w-full h-full flex flex-col items-center justify-center text-center p-4 text-rose-500 dark:text-rose-400 bg-rose-50/10 dark:bg-rose-950/5 rounded-xl gap-2">
                    <AlertCircle className="w-6 h-6 shrink-0" />
                    <span className="text-xs font-bold">{errorMsg}</span>
                  </div>
                 ) : translatedResult ? (
                  <div className="space-y-4">
                    <p className="text-slate-800 dark:text-slate-100 text-sm leading-relaxed font-semibold whitespace-pre-wrap">
                      {translatedResult.translatedText}
                    </p>

                    {/* Pronunciation Guide (Only show if present in result) */}
                    {translatedResult.pronunciationGuide && (
                      <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850/60">
                        <span className="text-[10px] block font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-0.5">
                          Pronunciation Guide
                        </span>
                        <p className="font-mono text-xs text-indigo-600 dark:text-sky-400 font-bold">
                          {translatedResult.pronunciationGuide}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-center text-slate-400 dark:text-slate-500 py-10">
                    <Sparkles className="w-8 h-8 opacity-20 mb-2" />
                    <p className="text-xs font-sans">
                      Translation result will appear here.
                    </p>
                  </div>
                )}
              </div>

              {/* Bottom Utilities bar */}
              {translatedResult && !isTranslating && (
                <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/50 p-3 bg-slate-50/20 dark:bg-slate-950/10">
                  <div className="flex items-center gap-1.5 w-full justify-between">
                    <div className="flex gap-1">
                      {/* Hear Translated read-out */}
                      <button
                        id="audio-text-to-speech-btn"
                        onClick={() => handleSpeechOutput(translatedResult.translatedText, targetLang)}
                        className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                        title="Speech Output (Speak translation)"
                      >
                        <Volume2 className="w-4 h-4 text-indigo-600 dark:text-sky-400" />
                      </button>

                      {/* Copy Output Button */}
                      <button
                        id="copy-translation-btn"
                        onClick={() => handleCopyToClipboard(translatedResult.translatedText)}
                        className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer relative"
                        title="Copy to Clipboard"
                      >
                        {copiedText ? (
                          <Check className="w-4 h-4 text-emerald-500 animate-scale-up" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    {/* Bookmark Favorite toggler */}
                    <button
                      id="favorite-toggle-btn"
                      onClick={() => {
                        // Assemble placeholder history node if not exist
                        const sourceLanguageObj = LANGUAGES.find((l) => l.code === sourceLang);
                        const targetLanguageObj = LANGUAGES.find((l) => l.code === targetLang);
                        handleToggleFavorite({
                          id: Math.random().toString(36).substring(2, 9),
                          timestamp: "",
                          text: sourceText,
                          sourceLanguageName: sourceLang === "auto" ? "English" : (sourceLanguageObj?.name || ""),
                          sourceLanguageCode: sourceLang,
                          targetLanguageName: targetLanguageObj?.name || "",
                          targetLanguageCode: targetLang,
                          translatedText: translatedResult.translatedText,
                          tone: activeTone,
                          isFavorite: false,
                        });
                      }}
                      className="p-2 rounded-xl text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/20 transition cursor-pointer"
                      title="Favorite / Bookmark translation"
                    >
                      <Star 
                        className={`w-4.5 h-4.5 ${
                          favoritesList.some(f => f.text === sourceText && f.translatedText === translatedResult.translatedText)
                            ? "fill-amber-400 text-amber-500"
                            : ""
                        }`} 
                      />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Core Trigger Command Button */}
          <button
            id="translate-command-btn"
            onClick={handleTranslate}
            disabled={isTranslating || !sourceText.trim()}
            className="w-full py-4 px-6 rounded-xl font-bold text-center cursor-pointer select-none transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 disabled:from-slate-250 disabled:to-slate-350 disabled:dark:from-slate-850 disabled:dark:to-slate-800 text-white shadow shadow-indigo-500/10 hover:shadow-lg hover:shadow-indigo-500/20 disabled:cursor-not-allowed"
          >
            <Sparkles className="w-4.5 h-4.5" />
            {isTranslating ? "Translating in Realtime..." : "Translate Text"}
          </button>

          {/* Premium Extra visual components: Synonym / Dictionary analysis lookup (Only if text is single word and dictionary exists) */}
          <AnimatePresence>
            {translatedResult?.dictionaryLookup?.definition && !isTranslating && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="p-5 rounded-2xl border border-indigo-150/50 dark:border-indigo-950 bg-indigo-50/20 dark:bg-indigo-950/15 space-y-3"
              >
                <div className="flex items-center gap-2 border-b border-indigo-100/30 dark:border-indigo-900/30 pb-2">
                  <Star className="w-4 h-4 text-indigo-500 animate-spin-slow" />
                  <span className="font-sans font-bold text-sm text-slate-800 dark:text-slate-200">
                    Smart Lexicon: Word Analysis
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Part of Speech / Class
                    </span>
                    <p className="text-xs font-semibold font-mono text-indigo-750 dark:text-sky-400 bg-indigo-50/50 dark:bg-indigo-950/40 px-2 py-1.5 rounded w-fit">
                      {translatedResult.dictionaryLookup.partOfSpeech || "Noun/Expression"}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Semantics Definition
                    </span>
                    <p className="text-xs font-sans text-slate-600 dark:text-slate-350 leading-relaxed font-semibold">
                      {translatedResult.dictionaryLookup.definition}
                    </p>
                  </div>
                </div>

                {translatedResult.dictionaryLookup.synonyms && translatedResult.dictionaryLookup.synonyms.length > 0 && (
                  <div className="pt-2">
                    <span className="text-[10px] block uppercase font-bold text-slate-400 tracking-wider mb-1.5">
                      Alternate Meanings & Context Synonyms
                    </span>
                    <div className="flex gap-2 flex-wrap">
                      {translatedResult.dictionaryLookup.synonyms.map((syn, idx) => (
                        <span 
                          key={idx} 
                          className="px-2 py-1 text-xs font-mono font-medium rounded-lg border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300"
                        >
                          {syn}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Premium Examples Display Panel */}
            {translatedResult?.examples && translatedResult.examples.length > 0 && !isTranslating && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3"
              >
                <span className="text-xs font-mono block font-bold text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-850 pb-2">
                  Parallel Usage Examples (Tone: {activeTone})
                </span>
                
                <div className="space-y-4">
                  {translatedResult.examples.map((ex, idx) => (
                    <div key={idx} className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs border-b border-dashed border-slate-100 dark:border-slate-850 pb-3 last:border-0 last:pb-0">
                      <div>
                        <span className="font-semibold text-[10px] text-slate-400 tracking-wide block">Original Context</span>
                        <p className="text-slate-600 dark:text-slate-350 italic font-medium">"{ex.source}"</p>
                      </div>
                      <div>
                        <span className="font-semibold text-[10px] text-indigo-500 tracking-wide block">As Translated</span>
                        <p className="text-slate-800 dark:text-slate-200 font-bold">"{ex.target}"</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

        {/* Sidebar History & Favorites Section - 4cols on desktop */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
            
            {/* Sidebar headers toggler */}
            <div className="flex border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/20">
              <button
                id="sidebar-tab-history"
                onClick={() => setActiveTab("history")}
                className={`flex-1 py-3 text-xs font-semibold tracking-wider uppercase transition flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === "history"
                    ? "text-indigo-600 dark:text-sky-450 border-b-2 border-indigo-600 dark:border-sky-500 bg-white dark:bg-slate-900"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                <History className="w-3.5 h-3.5" />
                History ({historyList.length})
              </button>
              
              <button
                id="sidebar-tab-favorites"
                onClick={() => setActiveTab("favorites")}
                className={`flex-1 py-3 text-xs font-semibold tracking-wider uppercase transition flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === "favorites"
                    ? "text-indigo-600 dark:text-sky-450 border-b-2 border-indigo-600 dark:border-sky-500 bg-white dark:bg-slate-900"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                <Heart className="w-3.5 h-3.5 text-amber-500" />
                Bookmarks ({favoritesList.length})
              </button>
            </div>

            {/* List Panels content block */}
            <div className="p-4 max-h-[500px] overflow-y-auto space-y-3">
              {activeTab === "history" ? (
                historyList.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center py-10 text-slate-400 select-none">
                    <History className="w-7 h-7 opacity-30 mb-2" />
                    <span className="text-xs">No conversions recorded yet.</span>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Recent Conversions</span>
                      <button 
                        id="clear-all-history-btn"
                        onClick={() => handleClearAllLists(false)}
                        className="text-[10px] font-bold text-rose-500 hover:underline hover:bg-transparent bg-transparent border-0 p-0 cursor-pointer"
                      >
                        Clear All
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      {historyList.map((item) => (
                        <div 
                          key={item.id}
                          className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 hover:border-indigo-500/20 dark:hover:border-indigo-400/20 transition group relative text-left cursor-pointer"
                          onClick={() => handleRecallTranslation(item)}
                        >
                          <div className="flex justify-between items-center mb-1.5 border-b border-slate-150/40 dark:border-slate-800/40 pb-1">
                            <span className="text-[10px] font-bold text-indigo-600 dark:text-sky-400 uppercase tracking-wide">
                              {item.sourceLanguageName} ➡️ {item.targetLanguageName}
                            </span>
                            <span className="text-[9px] text-slate-450 font-mono">
                              {item.timestamp}
                            </span>
                          </div>
                          
                          <p className="text-xs text-slate-600 dark:text-slate-400 italic font-medium truncate mb-1">
                            "{item.text}"
                          </p>
                          <p className="text-xs text-slate-800 dark:text-slate-200 font-bold truncate">
                            {item.translatedText}
                          </p>

                          {/* Quick Utilities inside list card */}
                          <div className="absolute right-2 top-2 hidden group-hover:flex items-center gap-1 bg-white/90 dark:bg-slate-900/90 py-0.5 px-1.5 rounded-lg border border-slate-150/60 dark:border-slate-800">
                            {/* Recall audio synthesis read-out */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSpeechOutput(item.translatedText, item.targetLanguageCode);
                              }}
                              className="p-1 hover:text-indigo-600 dark:hover:text-primary rounded text-slate-500"
                              title="Listen"
                            >
                              <Volume2 className="w-3 h-3" />
                            </button>

                            {/* Delete single trail */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteHistoryItem(item.id, false);
                              }}
                              className="p-1 hover:text-rose-500 rounded text-slate-400"
                              title="Delete index"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )
              ) : favoritesList.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center py-10 text-slate-400 select-none">
                  <Star className="w-7 h-7 opacity-30 text-amber-500 mb-2" />
                  <span className="text-xs">Your translation stamps will reside here.</span>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Saved Stamp Library</span>
                    <button 
                      id="clear-all-favorites-btn"
                      onClick={() => handleClearAllLists(true)}
                      className="text-[10px] font-bold text-rose-500 hover:underline hover:bg-transparent bg-transparent border-0 p-0 cursor-pointer"
                    >
                      Unbookmark All
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {favoritesList.map((item) => (
                      <div 
                        key={item.id}
                        className="p-3 rounded-xl border border-amber-100/60 dark:border-amber-950/20 bg-amber-500/[0.02] hover:border-amber-400 transition group relative text-left cursor-pointer"
                        onClick={() => handleRecallTranslation(item)}
                      >
                        <div className="flex justify-between items-center mb-1.5 border-b border-amber-100/20 dark:border-amber-950/20 pb-1">
                          <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wide flex items-center gap-1">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                            {item.sourceLanguageName} ➡️ {item.targetLanguageName}
                          </span>
                        </div>
                        
                        <p className="text-xs text-slate-600 dark:text-slate-400 italic font-medium truncate mb-1">
                          "{item.text}"
                        </p>
                        <p className="text-xs text-slate-800 dark:text-slate-200 font-bold truncate">
                          {item.translatedText}
                        </p>

                        {/* Quick Utilities */}
                        <div className="absolute right-2 top-2 hidden group-hover:flex items-center gap-1 bg-white/90 dark:bg-slate-900/90 py-0.5 px-1.5 rounded-lg border border-slate-150/60 dark:border-slate-800">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSpeechOutput(item.translatedText, item.targetLanguageCode);
                            }}
                            className="p-1 hover:text-indigo-600 dark:hover:text-primary rounded text-slate-700"
                            title="Listen"
                          >
                            <Volume2 className="w-3 h-3" />
                          </button>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyToClipboard(item.translatedText);
                            }}
                            className="p-1 hover:text-emerald-500 rounded text-slate-700"
                            title="Copy translation"
                          >
                            <Copy className="w-3 h-3" />
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteHistoryItem(item.id, true);
                            }}
                            className="p-1 hover:text-rose-500 rounded text-slate-500"
                            title="Unbookmark"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Clean User Tips Callout */}
          <div className="p-5 rounded-2xl border border-slate-100 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/20 space-y-2.5 text-left">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-indigo-500" />
              Translator Pro Tips
            </h4>
            <ul className="text-[11px] text-slate-500 dark:text-slate-400 space-y-1.5 list-disc list-inside leading-relaxed pb-1">
              <li>Use the <b>Microphone</b> button next to clear input to convert oral speech in English or specific languages.</li>
              <li>Toggle <b>Tone style indicators</b> on top of the panels to instruct the translator's style specifically.</li>
              <li>You can drag or load plain <code>.txt</code> files inside the parser utility easily.</li>
              <li>History and bookmarked favorites reside safely in user local sandbox memory.</li>
            </ul>
          </div>
        </div>

      </div>

    </div>
  );
}
