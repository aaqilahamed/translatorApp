export interface TranslationResult {
  translatedText: string;
  detectedLanguage: string;
  languageCode: string;
  pronunciationGuide?: string;
  isOfflineFallback?: boolean;
  warning?: string;
  dictionaryLookup?: {
    partOfSpeech?: string;
    definition?: string;
    synonyms?: string[];
  };
  examples?: Array<{
    source: string;
    target: string;
  }>;
  geminiStatus?: {
    success: boolean;
    errorType: string | null;
    errorMessage: string | null;
  };
}

export interface HistoryItem {
  id: string;
  timestamp: string;
  text: string;
  sourceLanguageName: string;
  sourceLanguageCode: string;
  targetLanguageName: string;
  targetLanguageCode: string;
  translatedText: string;
  tone: string;
  isFavorite: boolean;
}

export interface Language {
  code: string;
  name: string;
  nativeName?: string;
  flag?: string;
}

export const LANGUAGES: Language[] = [
  { code: "auto", name: "Auto-Detect", nativeName: "Auto", flag: "✨" },
  { code: "en", name: "English", nativeName: "English", flag: "🇬🇧" },
  { code: "es", name: "Spanish", nativeName: "Español", flag: "🇪🇸" },
  { code: "fr", name: "French", nativeName: "Français", flag: "🇫🇷" },
  { code: "de", name: "German", nativeName: "Deutsch", flag: "🇩🇪" },
  { code: "it", name: "Italian", nativeName: "Italiano", flag: "🇮🇹" },
  { code: "pt", name: "Portuguese", nativeName: "Português", flag: "🇵🇹" },
  { code: "ru", name: "Russian", nativeName: "Русский", flag: "🇷🇺" },
  { code: "zh", name: "Chinese (Simplified)", nativeName: "简体中文", flag: "🇨🇳" },
  { code: "ja", name: "Japanese", nativeName: "日本語", flag: "🇯🇵" },
  { code: "ko", name: "Korean", nativeName: "한국어", flag: "🇰🇷" },
  { code: "ar", name: "Arabic", nativeName: "العربية", flag: "🇸🇦" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", flag: "🇮🇳" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்", flag: "🇮🇳" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు", flag: "🇮🇳" },
  { code: "tr", name: "Turkish", nativeName: "Türkçe", flag: "🇹🇷" },
  { code: "vi", name: "Vietnamese", nativeName: "Tiếng Việt", flag: "🇻🇳" },
  { code: "nl", name: "Dutch", nativeName: "Nederlands", flag: "🇳🇱" },
  { code: "pl", name: "Polish", nativeName: "Polski", flag: "🇵🇱" },
  { code: "sv", name: "Swedish", nativeName: "Svenska", flag: "🇸🇪" },
  { code: "el", name: "Greek", nativeName: "Ελληνικά", flag: "🇬🇷" },
  { code: "he", name: "Hebrew", nativeName: "עברית", flag: "🇮🇱" },
  { code: "th", name: "Thai", nativeName: "ไทย", flag: "🇹🇭" },
];

export const TONES = [
  { value: "standard", label: "Standard", desc: "Natural balanced translation", icon: "⚖️" },
  { value: "formal", label: "Formal", desc: "Polite and professional", icon: "👔" },
  { value: "casual", label: "Casual", desc: "Friendly and informal", icon: "💬" },
  { value: "poetic", label: "Creative/Poetic", desc: "Artistic and expressive", icon: "🎨" },
  { value: "business", label: "Business", desc: "Polished context for corporate", icon: "💼" },
];
