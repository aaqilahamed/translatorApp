import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini AI client
let aiInstance: GoogleGenAI | null = null;

function getGeminiClient(customKey?: string): GoogleGenAI | null {
  const apiKey = customKey || process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === "" || apiKey === "YOUR_GEMINI_API_KEY" || apiKey === "MY_GEMINI_API_KEY" || apiKey === "placeholder" || apiKey.includes("MY_GEMINI_API_KEY") || apiKey.includes("YOUR_GEMINI_API_KEY")) {
    return null;
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Highly comprehensive offline mock lexicon for local sandbox stability / zero-config localhost
const offlineDictionary: Record<string, Record<string, { translated: string; pron?: string; pos?: string; def?: string; syns?: string[] }>> = {
  "hello": {
    "es": { translated: "Hola", pron: "oh-lah", pos: "Interjection", def: "An expression of greeting.", syns: ["Buenas", "Qué tal"] },
    "fr": { translated: "Bonjour", pron: "bohn-zhoor", pos: "Interjection", def: "A greeting used in the daytime.", syns: ["Salut", "Coucou"] },
    "de": { translated: "Hallo", pron: "hah-loh", pos: "Interjection", def: "Friendly greeting.", syns: ["Guten Tag", "Servus"] },
    "it": { translated: "Ciao", pron: "chow", pos: "Interjection", def: "Friendly greeting.", syns: ["Buongiorno", "Salve"] },
    "ja": { translated: "こんにちは", pron: "Konnichiwa", pos: "Interjection", def: "Standard daytime greeting.", syns: ["ハロー", "どうも"] },
    "zh": { translated: "你好", pron: "Nǐ hǎo", pos: "Interjection", def: "Standard greeting.", syns: ["您好"] },
    "hi": { translated: "नमस्ते", pron: "Namaste", pos: "Interjection", def: "A respectful greeting.", syns: ["नमस्कार"] },
    "ko": { translated: "안녕하세요", pron: "Annyeonghaseyo", pos: "Interjection", def: "Standard polite greeting.", syns: ["안녕"] }
  },
  "how are you": {
    "es": { translated: "¿Cómo estás?", pron: "coh-moh es-tahs", pos: "Phrase", def: "Inquiring about someone's status.", syns: ["¿Qué tal?", "¿Cómo va?"] },
    "fr": { translated: "Comment ça va?", pron: "co-mahn sa vah", pos: "Phrase", def: "Inquiring about status.", syns: ["Ça va?", "Comment allez-vous?"] },
    "de": { translated: "Wie geht es dir?", pron: "vee gayt es deer", pos: "Phrase", def: "Inquiring about status.", syns: ["Wie geht's?"] },
    "it": { translated: "Come stai?", pron: "coh-meh stahy", pos: "Phrase", def: "Inquiring about well-being.", syns: ["Come va?"] },
    "ja": { translated: "お元気ですか？", pron: "O-genki desu ka?", pos: "Phrase", def: "Polite health inquiry.", syns: ["いかがですか"] },
    "zh": { translated: "你好吗？", pron: "Nǐ hǎo ma?", pos: "Phrase", def: "How are you? inquiry.", syns: ["最近怎么样"] },
    "hi": { translated: "आप कैसे हैं?", pron: "Aap kaise hain?", pos: "Phrase", def: "Polite inquiry.", syns: ["क्या हाल है?"] }
  },
  "thank you": {
    "es": { translated: "Gracias", pron: "grah-syahs", pos: "Interjection", def: "Expression of gratitude.", syns: ["Muchas gracias", "Agradecido"] },
    "fr": { translated: "Merci", pron: "mair-see", pos: "Interjection", def: "Expression of gratitude.", syns: ["Merci beaucoup"] },
    "de": { translated: "Danke", pron: "dahn-keh", pos: "Interjection", def: "Expression of gratitude.", syns: ["Vielen Dank", "Danke sehr"] },
    "it": { translated: "Grazie", pron: "grah-tsyeh", pos: "Interjection", def: "Gratitude expression.", syns: ["Grazie mille"] },
    "ja": { translated: "ありがとう", pron: "Arigatou", pos: "Interjection", def: "Gratitude expressing word.", syns: ["ありがとうございます"] },
    "zh": { translated: "谢谢", pron: "Xièxiè", pos: "Interjection", def: "Gratitude expression.", syns: ["非常感谢"] },
    "hi": { translated: "धन्यवाद", pron: "Dhanyavaad", pos: "Interjection", def: "Expression of thankfulness.", syns: ["शुक्रिया"] }
  },
  "good morning": {
    "es": { translated: "Buenos días", pron: "bweh-nohs dee-ahs", pos: "Noun/Interjection", def: "Morning greeting." },
    "fr": { translated: "Bonjour", pron: "bohn-zhoor", pos: "Noun/Interjection", def: "Morning greeting." },
    "de": { translated: "Guten Morgen", pron: "goo-ten mor-gen", pos: "Noun/Interjection", def: "Morning greeting." },
    "it": { translated: "Buongiorno", pron: "bwon-johrn-oh", pos: "Noun/Interjection", def: "Morning greeting." },
    "ja": { translated: "おはようございます", pron: "Ohayou gozaimasu", pos: "Noun/Interjection", def: "Morning greeting." },
    "hi": { translated: "सुप्रभात", pron: "Suprabhaat", pos: "Noun/Interjection", def: "Morning greeting." }
  },
  "goodbye": {
    "es": { translated: "Adiós", pron: "ah-dyohs", pos: "Interjection", def: "Farewell." },
    "fr": { translated: "Au revoir", pron: "oh ruh-vwahr", pos: "Interjection", def: "Farewell." },
    "de": { translated: "Auf Wiedersehen", pron: "owf vee-der-zane", pos: "Interjection", def: "Farewell." },
    "it": { translated: "Arrivederci", pron: "ah-ree-veh-dair-chee", pos: "Interjection", def: "Farewell." },
    "ja": { translated: "さようなら", pron: "Sayounara", pos: "Interjection", def: "Farewell." },
    "hi": { translated: "अलविदा", pron: "Alvida", pos: "Interjection", def: "Farewell." }
  },
  "love": {
    "es": { translated: "Amor", pron: "ah-mohr", pos: "Noun", def: "Strong affection.", syns: ["Cariño", "Afecto"] },
    "fr": { translated: "Amour", pron: "ah-moohr", pos: "Noun", def: "Strong affection.", syns: ["Affection", "Tendresse"] },
    "de": { translated: "Liebe", pron: "lee-beh", pos: "Noun", def: "Strong affection.", syns: ["Zuneigung"] },
    "it": { translated: "Amore", pron: "ah-moh-reh", pos: "Noun", def: "Strong affection." },
    "ja": { translated: "愛", pron: "Ai", pos: "Noun", def: "Strong affection.", syns: ["愛情", "恋"] },
    "hi": { translated: "प्यार", pron: "Pyaar", pos: "Noun", def: "Strong affection.", syns: ["प्रेम"] }
  },
  "peace": {
    "es": { translated: "Paz", pron: "pahs", pos: "Noun", def: "Freedom from disturbance." },
    "fr": { translated: "Paix", pron: "peh", pos: "Noun", def: "Freedom from disturbance." },
    "de": { translated: "Frieden", pron: "free-den", pos: "Noun", def: "State of tranquility." },
    "it": { translated: "Pace", pron: "pah-cheh", pos: "Noun", def: "Freedom from disturbance." },
    "ja": { translated: "平和", pron: "Heiwa", pos: "Noun", def: "State of harmony." },
    "hi": { translated: "शांति", pron: "Shaanti", pos: "Noun", def: "State of peacefulness." }
  },
  "friend": {
    "es": { translated: "Amigo", pron: "ah-mee-goh", pos: "Noun", def: "A person with strong bonds of mutual affection." },
    "fr": { translated: "Ami", pron: "ah-mee", pos: "Noun", def: "A person with strong bonds of mutual affection." },
    "de": { translated: "Freund", pron: "froynd", pos: "Noun", def: "A trusted companion." },
    "it": { translated: "Amico", pron: "ah-mee-coh", pos: "Noun", def: "A trusted companion." },
    "ja": { translated: "友達", pron: "Tomodachi", pos: "Noun", def: "Companion." },
    "hi": { translated: "मित्र", pron: "Mitra", pos: "Noun", def: "Companion/Friend." }
  }
};

const localizedModeWarning = {
  es: "Modo simulador local. Coloque la variable GEMINI_API_KEY en su archivo .env local para traducciones ultra-precisas por Inteligencia Artificial.",
  fr: "Mode de simulation hors ligne. Veuillez ajouter la variable GEMINI_API_KEY dans votre fichier .env pour activer l'I.A. de Gemini.",
  de: "Lokaler Simulationsmodus. Tragen Sie GEMINI_API_KEY in Ihrer lokalen .env-Datei ein, um die Gemini AI zu aktivieren.",
  ja: "ローカルシミュレーションモード。高品質な翻訳を有効にするために、ローカルの.envファイルにGEMINI_API_KEYを設定してください。",
  hi: "लोकल सिमुलेशन मोड। जेमिनी एआई सक्रिय करने के लिए अपने लोकल .env फ़ाइल में GEMINI_API_KEY जोड़ें।",
  zh: "本地离线模拟模式。请在本地的.env配置中添加GEMINI_API_KEY变量以激活Gemini AI翻译器।"
};

function detectLanguageCode(text: string): string {
  if (/[\u0b80-\u0bff]/.test(text)) return "ta"; // Tamil
  if (/[\u0c00-\u0c7f]/.test(text)) return "te"; // Telugu
  if (/[\u0900-\u097f]/.test(text)) return "hi"; // Hindi (Devanagari)
  if (/[\uac00-\ud7af]/.test(text)) return "ko"; // Korean
  if (/[\u3040-\u309f\u30a0-\u30ff]/.test(text)) return "ja"; // Japanese Hiragana/Katakana
  if (/[\u4e00-\u9fa5]/.test(text)) return "zh"; // Chinese
  if (/[\u0400-\u04ff]/.test(text)) return "ru"; // Russian (Cyrillic)
  if (/[\u0600-\u06ff]/.test(text)) return "ar"; // Arabic
  if (/[\u0590-\u05ff]/.test(text)) return "he"; // Hebrew
  if (/[\u0e00-\u0e7f]/.test(text)) return "th"; // Thai
  if (/[\u0370-\u03ff]/.test(text)) return "el"; // Greek
  return "en"; // Default to English
}

function getLanguageNameByCode(code: string): string {
  const names: Record<string, string> = {
    en: "English", es: "Spanish", fr: "French", de: "German", it: "Italian",
    pt: "Portuguese", ru: "Russian", zh: "Chinese", ja: "Japanese", ko: "Korean",
    ar: "Arabic", hi: "Hindi", ta: "Tamil", te: "Telugu", tr: "Turkish",
    vi: "Vietnamese", nl: "Dutch", pl: "Polish", sv: "Swedish", el: "Greek",
    he: "Hebrew", th: "Thai"
  };
  return names[code] || "English";
}

// Graceful Offline translation fallback creator
async function getOfflineTranslation(text: string, sourceLanguage: string, targetLanguage: string, tone: string) {
  const normText = text.trim().toLowerCase();
  const tgt = targetLanguage.toLowerCase();
  const src = sourceLanguage === "auto" ? "auto" : sourceLanguage.toLowerCase();
  const detectedCode = src === "auto" ? detectLanguageCode(text) : src;
  
  // Try direct dictionary matching
  let matchedWord = offlineDictionary[normText]?.[tgt];
  
  // If not direct, look for keys containing the word
  if (!matchedWord) {
    const matchedKey = Object.keys(offlineDictionary).find(k => k === normText || normText.includes(k));
    if (matchedKey) {
      matchedWord = offlineDictionary[matchedKey]?.[tgt];
    }
  }

  const isWord = text.split(/\s+/).length === 1;
  const capitalizedText = text.charAt(0).toUpperCase() + text.slice(1);

  let translatedText = "";
  let pronunciationGuide = "";
  let partOfSpeech = "Phrase";
  let definition = `Simulated translation of "${text.slice(0, 30)}${text.length > 30 ? "..." : ""}" in sandbox env.`;
  let synonyms: string[] = ["Sandbox simulated text", "Alternative expression"];

  if (matchedWord) {
    translatedText = matchedWord.translated;
    pronunciationGuide = matchedWord.pron || "";
    partOfSpeech = matchedWord.pos || "Expression";
    definition = matchedWord.def || definition;
    if (matchedWord.syns) {
      synonyms = matchedWord.syns;
    }
  } else {
    // Attempt real translation using MyMemory API as a robust public fallback
    try {
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${detectedCode}|${tgt}`;
      const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
      if (response.ok) {
        const data = await response.json();
        if (data && data.responseData && data.responseData.translatedText) {
          translatedText = data.responseData.translatedText;
        }
      }
    } catch (fetchErr) {
      console.warn("MyMemory Translation API failed, falling back to local heuristic rules:", fetchErr);
    }

    if (!translatedText) {
      const langNames: Record<string, string> = {
        es: "Spanish", fr: "French", de: "German", it: "Italian", ja: "Japanese",
        zh: "Chinese", hi: "Hindi", ko: "Korean", pt: "Portuguese", ru: "Russian",
        ta: "Tamil", te: "Telugu", tr: "Turkish", vi: "Vietnamese", nl: "Dutch",
        pl: "Polish", sv: "Swedish", el: "Greek", he: "Hebrew", th: "Thai"
      };
      const targetLangName = langNames[tgt] || targetLanguage.toUpperCase();
      
      // Create tone stylisation
      let tonePrefix = "";
      if (tone === "formal") tonePrefix = "[Polite/Formal] ";
      else if (tone === "casual") tonePrefix = "[Friendly/Casual] ";
      else if (tone === "poetic") tonePrefix = "[Creative/Poetic Tone] ✨ ";
      else if (tone === "business") tonePrefix = "[Corporate/Business Edition] 💼 ";

      translatedText = `${tonePrefix}${capitalizedText}`;
    }
    pronunciationGuide = `Phonetic representation`;
  }

  // Generate 2 natural parallel situational example helper blocks
  const examples = [
    {
      source: `I would like to translate "${text.split(/\s+/)[0]}" to ${targetLanguage.toUpperCase()} please.`,
      target: matchedWord 
        ? `Me gustaría traducir: "${matchedWord.translated}".` 
        : `Example situational translated context reference.`
    },
    {
      source: `This is a beautiful day to learn some new terminology.`,
      target: tgt === "es" 
        ? "Este es un hermoso día para aprender nuevos términos de traducción." 
        : `Elegant situational parallel translation here.`
    }
  ];

  return {
    translatedText,
    detectedLanguage: getLanguageNameByCode(detectedCode),
    languageCode: detectedCode,
    pronunciationGuide,
    isOfflineFallback: true,
    warning: undefined,
    dictionaryLookup: {
      partOfSpeech: isWord ? partOfSpeech : "Sequence",
      definition,
      synonyms
    },
    examples
  };
}

// API Translation Route
app.post("/api/translate", async (req, res) => {
  try {
    const { text, sourceLanguage, targetLanguage, tone, clientApiKey } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: "Source text is required." });
    }

    if (!targetLanguage) {
      return res.status(400).json({ error: "Target language is required." });
    }

    // Try starting real client with optional override from developer UI settings
    const ai = getGeminiClient(clientApiKey);

    if (!ai) {
      console.log("No GEMINI_API_KEY specified. Serving offline high-fidelity simulator.");
      const offlineResult = await getOfflineTranslation(text, sourceLanguage, targetLanguage, tone);
      (offlineResult as any).geminiStatus = {
        success: false,
        errorType: "unconfigured",
        errorMessage: "GEMINI_API_KEY is not configured inside your local environment (.env file)."
      };
      return res.json(offlineResult);
    }

    const systemInstruction = `You are a professional, premium multi-language translator engine.
Your goal is to provide highly accurate, culturally appropriate translations.
You are running as a back-end translation service. You must return your response structured strictly to the requested JSON schema.`;

    const userPrompt = `Translate this text:
"${text}"

Translation Parameters:
- Source Language: ${sourceLanguage || "Auto-Detect"}
- Target Language: ${targetLanguage}
- Tone style requested: ${tone || "Standard"}

Analyze the phrase, translate it with premium quality, compute the phonetic/pronunciation guide if the target language uses non-Latin characters, and generate 2 parallel situational examples.
If the input text is a single word or short term, also perform a swift dictionary lookup filling the 'dictionaryLookup' fields. Otherwise, leave 'dictionaryLookup' fields empty.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction,
        temperature: 0.3,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            translatedText: {
              type: Type.STRING,
              description: "The complete translated text.",
            },
            detectedLanguage: {
              type: Type.STRING,
              description: "The name of the detected source language (e.g., 'English', 'Spanish', 'Japanese').",
            },
            languageCode: {
              type: Type.STRING,
              description: "Two-letter ISO language code representing the source language (e.g., 'es', 'en', 'ja').",
            },
            pronunciationGuide: {
              type: Type.STRING,
              description: "Romanization / phonetic guide showing how to pronounce the target text (e.g., 'Konnichiwa' for Japanese, 'Nǐ hǎo' for Chinese). Leave empty if same character set or not applicable.",
            },
            dictionaryLookup: {
              type: Type.OBJECT,
              properties: {
                partOfSpeech: {
                  type: Type.STRING,
                  description: "Grammatical part of speech of the translated word, if the input is a single word (e.g. 'Noun', 'Verb'). Else empty.",
                },
                definition: {
                  type: Type.STRING,
                  description: "Brief target definition of the source word, if the input is a single word. Else empty.",
                },
                synonyms: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Alternative translated terms/synonyms.",
                },
              },
            },
            examples: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  source: {
                    type: Type.STRING,
                    description: "Example sentence in original language.",
                  },
                  target: {
                    type: Type.STRING,
                    description: "Exactly translated example sentence in target language.",
                  },
                },
              },
              description: "2 elegant, natural example sentences.",
            },
          },
          required: ["translatedText", "detectedLanguage", "languageCode"],
        },
      },
    });

    const outputText = response.text;
    if (!outputText) {
      throw new Error("No response output returned from Gemini.");
    }

    const result = JSON.parse(outputText.trim());
    result.geminiStatus = {
      success: true,
      errorType: null,
      errorMessage: null
    };
    res.json(result);
  } catch (error: any) {
    console.warn("Caught live translation error (e.g. key missing or expired). Serving soft fallback translation gracefully.", error);
    try {
      const { text, sourceLanguage, targetLanguage, tone } = req.body;
      const offlineResult = await getOfflineTranslation(text, sourceLanguage, targetLanguage, tone);
      (offlineResult as any).geminiStatus = {
        success: false,
        errorType: "api_error",
        errorMessage: error.message || error.toString()
      };
      res.json(offlineResult);
    } catch (fallbackError) {
      res.status(500).json({
        error: "Translation server encountered a critical error.",
        details: error.toString()
      });
    }
  }
});

// Vite middleware integration
async function main() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Translate app running on http://localhost:${PORT}`);
  });
}

main().catch((err) => {
  console.error("Failed to start server", err);
});
