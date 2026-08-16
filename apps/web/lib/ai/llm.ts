import { aiProviderManager } from './ai-provider-manager';
import { generateLocally } from './local-generator';
import type { LLMMessage, LLMResponse } from '../types';

export type { LLMMessage, LLMResponse };

export function detectLanguage(text: string): string {
  const patterns: Record<string, RegExp> = {
    arabic: /[\u0600-\u06FF]/,
    tifinagh: /[\u2D30-\u2D7F]/,
  };
  for (const [lang, pattern] of Object.entries(patterns)) {
    if (pattern.test(text)) return lang;
  }
  return 'unknown';
}

export async function translateText(
  text: string,
  sourceLang: string,
  targetLang: string
): Promise<string> {
  if (sourceLang === targetLang) return text;
  const res = await callLLM([
    { role: 'system', content: `Translate from ${sourceLang} to ${targetLang}. Return only the translation.` },
    { role: 'user', content: text },
  ]);
  return res.content;
}

export async function getPronunciation(text: string, language: string): Promise<string> {
  const res = await callLLM([
    { role: 'system', content: `Provide a pronunciation guide for ${language} text. Include phonetic transcription and audio description.` },
    { role: 'user', content: text },
  ]);
  return res.content;
}

export async function getCulturalContext(topic: string): Promise<string> {
  const res = await callLLM([
    { role: 'system', content: 'You are a cultural heritage expert. Provide rich cultural context with historical background, traditions, and significance.' },
    { role: 'user', content: `Provide cultural context about: ${topic}` },
  ]);
  return res.content;
}

export async function callLLM(messages: LLMMessage[]): Promise<LLMResponse> {
  const lastMsg = messages[messages.length - 1];
  if (!lastMsg) return { content: '' };

  // Delegate to the provider manager — system prompt is already in messages
  const result = await aiProviderManager.generate(messages);

  if (result.provider !== 'local') {
    return {
      content: result.content,
      provider: result.provider,
    };
  }

  // Local fallback: try the curated fallback responses first
  const fallback = getFallbackResponse(lastMsg.content);
  if (fallback && !fallback.startsWith('🌍 HeritageArk celebrates')) {
    return { content: fallback, provider: 'local' };
  }

  return {
    content: generateLocally(lastMsg.content, 'informative'),
    provider: 'local',
  };
}

interface FallbackEntry {
  test: (input: string) => boolean;
  response: string | ((input: string) => string);
}

const FALLBACK_RESPONSES: FallbackEntry[] = [
  {
    test: (input) => /\bazul\b/i.test(input),
    response: `ⵣ Azul! You greeted me in Tamazight (Amazigh)! The Amazigh are North Africa's indigenous people with a 4,000+ year history.\n\nOther phrases: Tanemmirt (thank you), Maniɣrak? (how are you?), Ar tufat (goodbye).\n\nTheir Tifinagh script ⵜⵉⴼⵉⵏⴰⵖ is one of the world's oldest living writing systems.`
  },
  {
    test: (input) => /\b(merhaba|merheba|silav)\b/i.test(input),
    response: `🌿 Merheba! You greeted me in Kurmanji Kurdish! Kurdish is spoken by ~15 million people across Turkey, Syria, Iraq, and Iran.\n\nOther phrases: Spas (thank you), Tu çawa yî? (how are you?), Bi xatirê te (goodbye).\n\nKurdish oral epics like Mem û Zîn are among the most sophisticated in the Middle East.`
  },
  {
    test: (input) => /\b(buorre beaivi|bures)\b/i.test(input),
    response: `🏔️ Buorre beaivi! You greeted me in Northern Sámi! The Sámi are Europe's only recognized indigenous people, living across Norway, Sweden, Finland, and Russia.\n\nOther phrases: Giitu (thank you), Bures boahtin (welcome), Báze dearvan (goodbye).\n\nTheir joik singing is one of Europe's oldest continuous vocal traditions.`
  },
  {
    test: (input) => /\b(takki|ma'a s{1,2}alama)\b/i.test(input),
    response: `🇪🇬 Takki! You greeted me in Nobiin Nubian! The Nubian people have inhabited the Nile Valley for over 5,000 years, creating one of Africa's earliest civilizations.\n\nOther phrases: Inti mandi? (how are you?), Shukran oo (thank you), Wéela (water).\n\nFewer than 12 fluent Nobiin speakers remain in some communities — HeritageArk is recording oral histories.`
  },
  {
    test: (input) => /^(hello|hi|hey|greetings|good\s*(morning|afternoon|evening|day))\b/i.test(input),
    response: `✨ Welcome to HeritageArk! I can help you explore indigenous languages and cultural heritage. Try asking about Nubian, Amazigh, Kurdish, Sámi, Mayan, Andean, Akan, or Ottoman cultures.`
  },
  {
    test: (input) => /\b(nubian|nubia|nobiin)\b/i.test(input),
    response: `🏛️ **Nubian Culture**\n\nOne of Africa's oldest civilizations, spanning 5,000+ years along the Nile. Language: Nobiin (Nilo-Saharan, ~500K speakers, Endangered).\n\nTraditions: Gold thread embroidery (3,000+ years), felucca boat-building, oral poetry (taghriba).\n\nPhrases: Takki (hello), Shukran oo (thank you), Wéela (water).\n\nEmergency: Fewer than 12 fluent Nobiin speakers remain in some communities — HeritageArk is actively recording oral histories.`
  },
  {
    test: (input) => /\b(amazigh|berber|tamazight|tifinagh)\b/i.test(input),
    response: `ⵣ **Amazigh Culture**\n\nNorth Africa's indigenous "free people" with 4,000+ years of continuous presence. Language: Tamazight (Afroasiatic, ~8M speakers, Vulnerable).\n\nTraditions: Carpet weaving with geometric patterns, silver jewelry, Tifinagh calligraphy, argan oil production.\n\nPhrases: Azul (hello), Tanemmirt (thank you), Akal (earth).`
  },
  {
    test: (input) => /\b(kurdish|kurmanji|sorani|kurd)\b/i.test(input),
    response: `🌿 **Kurdish Culture**\n\nOne of the world's largest nations without a state, spanning Turkey, Syria, Iraq, and Iran. Language: Kurmanji/Sorani (Indo-European, ~15M speakers, Vulnerable).\n\nTraditions: Hengame dance, Nawroz celebrations, tanbur music, jewelry making.\n\nPhrases: Merheba (hello), Spas (thank you), Tu çawa yî? (how are you?).`
  },
  {
    test: (input) => /\b(s[áà]mi|sami|saami|sapmi|joik)\b/i.test(input),
    response: `🏔️ **Sámi Culture**\n\nEurope's only recognized indigenous people, living in Sápmi across Norway, Sweden, Finland, and Russia. Language: Northern Sámi (Uralic, ~25K speakers, Endangered).\n\nTraditions: Joik singing (one of Europe's oldest vocal traditions), reindeer herding, duodji handicraft, Sámi drum (goavddis).\n\nPhrases: Buorre beaivi (good day), Giitu (thank you).`
  },
  {
    test: (input) => /\b(mayan|maya)\b/i.test(input),
    response: `🔮 **Mayan Culture**\n\nThe Maya created the only fully developed writing system in the pre-Columbian Americas and invented the concept of zero independently. Over 6 million Maya people speak 28 surviving languages today.\n\nTraditions: Backstrap loom weaving, Daykeeper calendar (Tzolk'in), copal incense ceremonies, maize cultivation.\n\nNotable artifact: Mayan Jade Burial Mask (300-900 CE) from Palenque.`
  },
  {
    test: (input) => /\b(andean|quechua|inca|andes)\b/i.test(input),
    response: `🏔️ **Andean Culture**\n\nThe Andean region gave rise to remarkable civilizations from Chavín to Tiwanaku to the Inca Empire. Quechua, the language of the Incas, is still spoken by 8-10 million people.\n\nTraditions: Andean textile weaving (among the finest ever produced), Quechua language preservation, traditional medicine (curanderismo).\n\nPhrase: Allillanchu — how are you? (Quechua)`
  },
  {
    test: (input) => /\b(akan|kente|ashanti|adinkra)\b/i.test(input),
    response: `🌟 **Akan Culture**\n\nThe Akan people of Ghana and Côte d'Ivoire developed one of the world's most sophisticated textile traditions. Kente cloth encodes proverbs, history, and philosophy in every pattern.\n\nTraditions: Kente strip loom weaving (royal cloth), Adinkra stamping (400+ symbols), Akan goldsmithing, Anansi storytelling.\n\nThe Sankofa bird means "go back and get it" — learning from the past.`
  },
  {
    test: (input) => /\b(ottoman|iznik|topkapi|mehter)\b/i.test(input),
    response: `🕌 **Ottoman Culture**\n\nThe Ottoman Empire spanned 600 years and three continents, creating a synthesis of Turkish, Persian, Arab, and Byzantine traditions.\n\nTraditions: Iznik tile making (finest Islamic pottery), miniature painting, Islamic calligraphy, Turkish coffee ceremony.\n\nMaster architect Mimar Sinan built over 300 structures including the Süleymaniye Mosque — a masterpiece of world architecture.`
  },
  {
    test: (input) => /\b(endangered\s*languages?|what languages|how many languages|language.*cover)\b/i.test(input),
    response: `🗣️ **Endangered Languages on HeritageArk**\n\n| Language | Speakers | Status |\n|----------|----------|--------|\n| Nubian (Nobiin) | ~500K | Endangered |\n| Amazigh (Tamazight) | ~8M | Vulnerable |\n| Kurdish (Kurmanji) | ~15M | Vulnerable |\n| Northern Sámi | ~25K | Endangered |\n\nOver 3,000 languages risk disappearing by 2100. When a language dies, we lose unique knowledge systems and oral literatures. HeritageArk records oral histories and provides language learning tools.`
  },
  {
    test: (input) => /\b(story|tale|folk|tell me|legend|myth)\b/i.test(input),
    response: `📖 **The Weaver Who Wove the Stars** (Amazigh Legend)\n\nIn the time before memory, when the Atlas Mountains were still young, a weaver named Tafat (meaning "light") climbed to the highest rock each night and unrolled her loom into the darkness. Her shuttle was carved from a fallen star. Her thread was spun from moonlight. The elders said she was weaving time itself — each geometric pattern a year, each knot a human life woven into the great fabric of the Atlas.\n\nWould you like to hear another story? Ask about Nubian taghriba (oral poetry) or Kurdish epic tales!`
  },
  {
    test: () => true,
    response: `🌍 HeritageArk celebrates 8 indigenous cultures:\n\n• Nubian 🇪🇬 — 5,000+ years of Nile Valley civilization\n• Amazigh ⵣ — North Africa's indigenous free people\n• Kurdish 🌿 — Rich oral epics and traditions\n• Sámi 🏔️ — Europe's only recognized indigenous people\n• Mayan 🔮 — Advanced mathematics and astronomy\n• Andean 🏔️ — Quechua language and textile mastery\n• Akan 🌟 — Kente cloth and Adinkra symbols\n• Ottoman 🕌 — 600 years of cultural synthesis\n\nWhich culture interests you most? I'd love to share more!`
  },
];

export function getFallbackResponse(input: string): string {
  const text = input.toLowerCase().trim();
  for (const entry of FALLBACK_RESPONSES) {
    if (entry.test(text)) {
      if (typeof entry.response === 'function') {
        return entry.response(text);
      }
      return entry.response;
    }
  }
  return (FALLBACK_RESPONSES[FALLBACK_RESPONSES.length - 1]?.response as string) ?? '';
}
