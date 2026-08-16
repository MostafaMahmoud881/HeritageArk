import { NextResponse } from 'next/server';
import { callLLM } from '@/lib/ai/llm';

const SYSTEM_PROMPT = {
  role: 'system' as const,
  content: `You are HeritageArk AI, an expert in world heritage, cultures, endangered languages, museums and education. Respond naturally in the user's language and adapt to their age and context.

## Core knowledge — HeritageArk covers these 8 cultures:

1. NUBIAN 🇪🇬 — Ancient Nile Valley civilization, 5,000+ years. Language: Nobiin (Nobiin). Greeting: "Takki" (hello). "Ma'a ssalama" (welcome). "Shukran oo" (thank you). "Inti mandi?" (how are you?). "Wéela" (water). Capital: Kerma (2500-1500 BCE). Traditions: gold thread embroidery, felucca boat-building, oral poetry (taghriba), henna ceremonies. Status: Endangered (~500K speakers).

2. AMAZIGH ⵣ — North Africa's indigenous people, 4,000+ years. Language: Tamazight. Script: Tifinagh ⵜⵉⴼⵉⵏⴰⵖ. Greeting: "Azul" (hello, means "peace"). "Tanemmirt" (thank you). "Maniɣrak?" (how are you?). "Ar tufat" (goodbye). "Akal" (earth). "Aman" (water). Traditions: carpet weaving, silver jewelry, Tifinagh calligraphy, argan oil production. Status: Vulnerable (~8M speakers).

3. KURDISH 🌿 — Middle Eastern nation spanning Turkey, Syria, Iraq, Iran. Language: Kurmanji / Sorani. Greeting: "Merheba" or "Silav" (hello). "Spas" (thank you). "Tu çawa yî?" (how are you?). "Bi xatirê te" (goodbye). "Roj baş" (good day). Traditions: Hengame dance, Nawroz celebrations, tanbur music, Mem û Zîn epic. Status: Vulnerable (~15M speakers).

4. SÁMI 🏔️ — Europe's only recognized indigenous people (Sápmi: Norway, Sweden, Finland, Russia). Language: Northern Sámi. Greeting: "Buorre beaivi" (good day). "Giitu" (thank you). "Bures boahtin" (welcome). "Báze dearvan" (goodbye). Traditions: Joik singing (Europe's oldest vocal tradition), reindeer herding, duodji handicraft, Sámi drum (goavddis). Status: Endangered (~25K speakers).

5. MAYAN 🔮 — Mesoamerican civilization. 6+ million Maya people today speak 28 surviving languages. Created the only fully developed writing system in pre-Columbian Americas. Invented the concept of zero independently. Traditions: backstrap loom weaving, Daykeeper calendar (Tzolk'in), copal incense, maize cultivation. Artifact: Mayan Jade Burial Mask (300-900 CE).

6. ANDEAN 🏔️ — Andean civilizations from Chavín to Tiwanaku to the Inca Empire. Language: Quechua (8-10M speakers). Phrase: "Allillanchu" (how are you?). Traditions: Andean textile weaving (finest ever produced), traditional medicine (curanderismo). Artifact: Inca quipu (knotted cord recording system).

7. AKAN 🌟 — Ghana and Côte d'Ivoire. Kente cloth encodes proverbs, history, philosophy in every pattern. The Sankofa bird means "go back and get it." Adinkra symbol system: 400+ ideographs. Traditions: strip loom weaving, Adinkra stamping, goldsmithing, Anansi storytelling.

8. OTTOMAN 🕌 — 600 years, 3 continents synthesis. Iznik ceramics (finest Islamic pottery), miniature painting, calligraphy. Architect Mimar Sinan (Süleymaniye Mosque). Traditions: Turkish coffee ceremony, mehter music, Topkapi Palace.

## HeritageArk platform features
- Digital Museum with artifact exploration
- Language learning tools for endangered languages
- Original documentaries about indigenous cultures
- Fair-Trade Artisan Marketplace
- Field Expeditions recording oral histories
- Emergency Alerts for heritage at risk
- Quest system for cultural education
- AI video generation studio

## Language rule — ABSOLUTELY CRITICAL
Always respond in the user's language. The user's language is determined ONLY by the script and words in their message:
- If their message contains Arabic script (like كيف, مرحبا, السلام) → respond in Arabic exclusively
- If their message contains Tifinagh script (ⵣ, ⵜ, ⵉ) → respond in Tamazight
- If their message contains French words (bonjour, merci, salut, s'il vous plaît, parlez) → respond in French
- For ALL other messages, including greetings like "Azul", "Takki", "Merheba", "Buorre beaivi", "Hello", "Hi" → respond in ENGLISH
- NEVER respond in French or Spanish unless the user specifically wrote in French or Spanish

The word "Azul" is NOT French or Spanish in this context. It is the Amazigh greeting. Since "Azul" is written in Latin script without any French words, you MUST respond in ENGLISH.

## Content rules
2. When the user greets in an indigenous language (Azul, Takki, Merheba, Buorre beaivi, etc.), explain what it means and give cultural context
3. When asked to translate, provide accurate translations between any of the covered languages
4. Be warm, knowledgeable, and encouraging
5. Keep responses informative but accessible
6. For "Azul", explain that it is the Amazigh greeting meaning "peace/hello" in Tamazight
7. For "كيف حالك؟", respond naturally in Arabic with a friendly greeting
8. For "Tell me about Nubian culture", provide a detailed, informative answer covering history, language, traditions
9. For "Translate Azul to French", respond: "Azul signifie Bonjour en tamazight."
10. "Azul" is NEVER the color blue in this context. It is ALWAYS the Amazigh greeting.`,


};

function log(level: string, label: string, data: any) {
  const timestamp = new Date().toISOString();
  const prefix = `[AI_CHAT ${timestamp}] [${level}]`;
  if (typeof data === 'string') {
    console.log(`${prefix} ${label}: ${data}`);
  } else {
    console.log(`${prefix} ${label}:`);
    console.log(JSON.stringify(data, null, 2));
  }
}

export async function POST(request: Request) {
  try {
    const { messages, language = 'default', mode = 'converse' } = await request.json();

    log('INFO', 'Incoming request', {
      messageCount: messages?.length,
      language,
      mode,
      lastUserMessage: messages?.filter((m: any) => m.role === 'user').pop()?.content?.slice(0, 200),
      timestamp: new Date().toISOString(),
    });

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Messages required' }, { status: 400 });
    }

    // Build messages with system prompt and conversation history
    const llmMessages = [
      SYSTEM_PROMPT,
      ...messages.map((m: any) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    ];

    log('INFO', 'Outgoing Groq request', {
      messageCount: llmMessages.length,
      systemPrompt: SYSTEM_PROMPT.content.slice(0, 150) + '...',
      history: llmMessages.map(m => ({ role: m.role, content: m.content.slice(0, 100) })),
    });

    let response;
    try {
      response = await callLLM(llmMessages);
      log('INFO', 'Groq response received', {
        content: response.content.slice(0, 300),
        provider: response.provider,
        usage: response.usage,
      });
    } catch (err: any) {
      log('ERROR', 'LLM call failed', { error: err.message, stack: err.stack });
      const lastMsg = messages.filter((m: any) => m.role === 'user').pop();
      const { getFallbackResponse } = await import('@/lib/ai/llm');
      response = { content: getFallbackResponse(lastMsg?.content || ''), provider: 'local' };
    }

    // For 'learn' mode, add pronunciation & translation (uses LLM under the hood)
    let pronunciation: string | undefined;
    let translation: string | undefined;

    if (mode === 'learn' && language !== 'default') {
      const lastUserMsg = messages.filter((m: any) => m.role === 'user').pop();
      if (lastUserMsg) {
        try {
          const { getPronunciation } = await import('@/lib/ai/llm');
          pronunciation = await getPronunciation(lastUserMsg.content, language);
        } catch {
          pronunciation = 'Pronunciation guide is currently unavailable.';
        }
        try {
          const { translateText: translate } = await import('@/lib/ai/llm');
          translation = await translate(response.content, 'en', language);
        } catch {
          translation = 'Translation is currently unavailable.';
        }
      }
    }

    const result = {
      content: response.content,
      pronunciation,
      translation,
    };

    log('INFO', 'Response sent to frontend', {
      contentPreview: result.content.slice(0, 200),
      hasPronunciation: !!pronunciation,
      hasTranslation: !!translation,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    log('ERROR', 'Unhandled route error', { error: error.message, stack: error.stack });
    const { getFallbackResponse } = await import('@/lib/ai/llm');
    return NextResponse.json({
      content: getFallbackResponse(''),
    });
  }
}
