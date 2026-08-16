'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useTranslate } from '@/lib/TranslationProvider';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const COPY = {
  en: {
    home: 'Home',
    title: 'AI Travel Planner',
    subtitle: 'Personalized heritage itineraries · Real traveler insights · Anti-scam tips',
    aiOnline: 'AI Online',
    trustPills: ['🗺️ Day-by-day itineraries', '👥 Real traveler reviews', '🚫 Scam warnings', '🛍️ Fixed-price shopping', '💬 Arabic & English'],
    welcomeTitle: "Welcome! I'm your Heritage Travel AI 👋",
    welcomeBody1: "Tell me where you want to go, how many days you have, your budget, and what you love — and I'll build you a complete day-by-day itinerary with insider tips from thousands of travelers.",
    welcomeBody2: "I'll also warn you about tourist scams and show you where to buy authentic crafts at fixed, honest prices.",
    quickStartTitle: 'Quick Start - Click to plan instantly',
    questionTitle: 'Or ask a specific question',
    followUp: ['Add more days', 'What to avoid?', 'Budget breakdown', 'Best restaurants', 'Shopping guide', 'Family-friendly version'],
    inputPlaceholder: 'Tell me your destination, duration, budget, and interests... (Press Enter to send)',
    inputHint: 'Shift+Enter for new line · Enter to send',
    shopLink: 'Shop authentic crafts',
    loadingError: 'Sorry, something went wrong. Please try again.',
    connectionError: '⚠️ Connection error. Please try again.',
    backLabel: '← Home',
    defaultLabel: 'Please choose a destination and trip length.',
    quickStarts: [
      { label: '🇪🇬 Egypt 7 days', prompt: 'I want a 7-day cultural heritage trip to Egypt. Mid-range budget, interested in ancient history, Nubian culture, and authentic local food. Traveling as a couple.' },
      { label: '🇲🇦 Morocco 5 days', prompt: 'Plan a 5-day trip to Morocco focusing on Amazigh Berber culture, Atlas Mountains, and Fez Medina. Budget traveler, solo.' },
      { label: '🇹🇷 Turkey 10 days', prompt: 'I have 10 days in Turkey. I love Ottoman history, Iznik ceramics, and local food. Mid-range budget, traveling with family (2 kids).' },
      { label: '🇲🇽 Mexico 8 days', prompt: 'Plan an 8-day Mayan heritage trip in Mexico — Yucatan, Oaxaca, and Mexico City. Luxury budget, couple, interested in archaeology and indigenous crafts.' },
      { label: '🇵🇪 Peru 12 days', prompt: 'I want to visit Machu Picchu and experience Andean culture. 12 days, mid-range budget, solo traveler, first time in South America.' },
      { label: '🌍 Multi-country', prompt: 'I have 3 weeks and want to visit 2-3 heritage destinations in Africa or Middle East. Mid-range budget, cultural immersion focus, solo traveler.' },
    ],
    questions: [
      'What are the biggest tourist scams I should avoid?',
      'What is the best time of year to visit?',
      'How much should I budget per day?',
      'What authentic crafts can I buy and where?',
      'Is it safe for solo female travelers?',
      'What local foods must I try?',
    ],
  },
  ar: {
    home: 'الرئيسية',
    title: 'مخطط الرحلات بالذكاء الاصطناعي',
    subtitle: 'مسارات تراثية مخصصة · رؤى حقيقية من المسافرين · نصائح لتجنب الاحتيال',
    aiOnline: 'الذكاء الاصطناعي متصل',
    trustPills: ['🗺️ مسارات يومية', '👥 مراجعات حقيقية', '🚫 تحذيرات من الاحتيال', '🛍️ تسوق بسعر ثابت', '💬 العربية والإنجليزية'],
    welcomeTitle: 'مرحباً! أنا مساعدك الذكي لرحلات التراث 👋',
    welcomeBody1: 'قل لي إلى أين تريد الذهاب، وكم يوماً لديك، وما ميزانيتك، وما الذي تحبه، وسأبني لك برنامجاً كاملاً يوماً بيوم مع نصائح من آلاف المسافرين.',
    welcomeBody2: 'وسأحذرك أيضاً من خدع السياح وأريك أين تشتري الحرف الأصلية بأسعار ثابتة وعادلة.',
    quickStartTitle: 'بدء سريع - اضغط للتخطيط فوراً',
    questionTitle: 'أو اسأل سؤالاً محدداً',
    followUp: ['أضف أياماً أكثر', 'ماذا أتجنب؟', 'تفصيل الميزانية', 'أفضل المطاعم', 'دليل التسوق', 'نسخة مناسبة للعائلة'],
    inputPlaceholder: 'اكتب الوجهة، المدة، الميزانية، والاهتمامات... (اضغط Enter للإرسال)',
    inputHint: 'Shift+Enter لسطر جديد · Enter للإرسال',
    shopLink: 'تسوق الحرف الأصلية',
    loadingError: 'حدث خطأ ما. حاول مرة أخرى.',
    connectionError: '⚠️ خطأ في الاتصال. حاول مرة أخرى.',
    backLabel: '← الرئيسية',
    defaultLabel: 'يرجى اختيار وجهة ومدة الرحلة.',
    quickStarts: [
      { label: '🇪🇬 مصر 7 أيام', prompt: 'أريد رحلة تراثية وثقافية لمدة 7 أيام في مصر. ميزانية متوسطة، مهتم بالتاريخ القديم والثقافة النوبية والطعام المحلي الأصيل. السفر مع الشريك.' },
      { label: '🇲🇦 المغرب 5 أيام', prompt: 'خطط لي رحلة لمدة 5 أيام إلى المغرب مع التركيز على الثقافة الأمازيغية وجبال الأطلس ومدينة فاس العتيقة. ميزانية اقتصادية، وأسافر بمفردي.' },
      { label: '🇹🇷 تركيا 10 أيام', prompt: 'لدي 10 أيام في تركيا. أحب التاريخ العثماني والخزف الإزنيقي والطعام المحلي. ميزانية متوسطة، وأسافر مع العائلة (طفلان).' },
      { label: '🇲🇽 المكسيك 8 أيام', prompt: 'خطط لرحلة تراثية لمدة 8 أيام في المكسيك عن حضارة المايا - يوكاتان وأواكساكا ومكسيكو سيتي. ميزانية فاخرة، مع شريك، ومهتم بالآثار والحرف الأصلية.' },
      { label: '🇵🇪 بيرو 12 يوماً', prompt: 'أريد زيارة ماتشو بيتشو وتجربة الثقافة الأنديزية. 12 يوماً، ميزانية متوسطة، وأسافر بمفردي، وهذه أول زيارة لي لأمريكا الجنوبية.' },
      { label: '🌍 عدة دول', prompt: 'لدي 3 أسابيع وأريد زيارة 2-3 وجهات تراثية في أفريقيا أو الشرق الأوسط. ميزانية متوسطة، وأركز على الانغماس الثقافي، وأسافر بمفردي.' },
    ],
    questions: [
      'ما أكبر خدع السياح التي يجب أن أتجنبها؟',
      'ما أفضل وقت في السنة للزيارة؟',
      'كم يجب أن أرصد يومياً للميزانية؟',
      'ما الحرف الأصلية التي يمكنني شراؤها وأين؟',
      'هل السفر آمن للنساء المسافرات بمفردهن؟',
      'ما الأطعمة المحلية التي يجب أن أجربها؟',
    ],
  },
} as const;

function localePath(locale: string, path: string) {
  if (locale === 'en') return path;
  return `/${locale}${path.startsWith('/') ? path : `/${path}`}`;
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      {[0, 1, 2].map((i) => (
        <span key={i} className="w-2 h-2 rounded-full bg-[#D4A373] animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }} />
      ))}
    </div>
  );
}

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === 'user';
  const lines = msg.content.split('\n');

  const renderLine = (line: string, i: number) => {
    // Bold **text**
    const parts = line.split(/\*\*(.*?)\*\*/g);
    const rendered = parts.map((p, j) => j % 2 === 1 ? <strong key={j}>{p}</strong> : p);

    if (line.startsWith('**') && line.endsWith('**') && parts.length === 3) {
      return <p key={i} className="font-bold text-[#0B132B] mt-3 mb-1">{parts[1]}</p>;
    }
    if (line.startsWith('- ') || line.startsWith('• ')) {
      return <li key={i} className="ml-4 text-sm leading-relaxed">{rendered.slice(1)}</li>;
    }
    if (line.startsWith('---')) {
      return <hr key={i} className="border-[#E8E2D9] my-3" />;
    }
    if (line.startsWith('*') && line.endsWith('*')) {
      return <p key={i} className="text-xs text-[#6B7280] italic mb-2">{line.replace(/\*/g, '')}</p>;
    }
    if (line.trim() === '') return <br key={i} />;
    return <p key={i} className="text-sm leading-relaxed">{rendered}</p>;
  };

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${isUser ? 'bg-[#0B132B] text-white' : 'bg-[#D4A373] text-white'}`}>
        {isUser ? '👤' : '🧭'}
      </div>
      <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${isUser ? 'bg-[#0B132B] text-white rounded-tr-sm' : 'bg-white border border-[#E8E2D9] text-[#0B132B] rounded-tl-sm'}`}>
        <ul className="list-none space-y-0.5">
          {lines.map((line, i) => renderLine(line, i))}
        </ul>
      </div>
    </div>
  );
}

export default function TravelPlannerPage() {
  const { locale } = useTranslate();
  const copy = locale === 'ar' ? COPY.ar : COPY.en;
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = { role: 'user', content: text.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    setStarted(true);

    try {
      const res = await fetch('/api/travel-planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-csrf-bypass': '1' },
        body: JSON.stringify({ messages: newMessages }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: 'assistant', content: data.content || copy.loadingError }]);
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: copy.connectionError }]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); }
  };

  return (
    <div className="min-h-screen bg-[#F8F5F0] flex flex-col">

      {/* Header */}
      <div className="bg-[#0B132B] pt-20 pb-6 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <Link href={localePath(locale, '/')} className="text-white/40 hover:text-white/70 text-sm transition-colors">{copy.backLabel}</Link>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#D4A373] flex items-center justify-center text-2xl">🧭</div>
            <div>
              <h1 className="text-2xl font-serif text-white">{copy.title}</h1>
              <p className="text-white/50 text-sm">{copy.subtitle}</p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-green-400 text-xs font-medium">{copy.aiOnline}</span>
            </div>
          </div>

          {/* Trust pills */}
          <div className="flex flex-wrap gap-2 mt-4">
            {copy.trustPills.map((t) => (
              <span key={t} className="text-xs px-3 py-1 rounded-full bg-white/10 text-white/70 border border-white/10">{t}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 flex flex-col gap-4">

        {/* Welcome / Quick starts */}
        {!started && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-[#E8E2D9] p-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#D4A373] flex items-center justify-center text-xl flex-shrink-0">🧭</div>
                <div>
                  <p className="font-serif text-[#0B132B] text-lg mb-2">{copy.welcomeTitle}</p>
                  <p className="text-[#6B7280] text-sm leading-relaxed">
                    {copy.welcomeBody1}
                  </p>
                  <p className="text-[#6B7280] text-sm mt-2">
                    {copy.welcomeBody2.split('fixed, honest prices').length > 1 ? (
                      <>
                        {copy.welcomeBody2.split('fixed, honest prices')[0]}
                        <span className="text-[#D4A373] font-medium">{locale === 'ar' ? 'أسعار ثابتة وعادلة' : 'fixed, honest prices'}</span>
                        {copy.welcomeBody2.split('fixed, honest prices')[1]}
                      </>
                    ) : (
                      copy.welcomeBody2
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-3">🚀 {copy.quickStartTitle}</p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {copy.quickStarts.map((q) => (
                  <button key={q.label} onClick={() => send(q.prompt)}
                    className="text-left p-4 bg-white rounded-xl border border-[#E8E2D9] hover:border-[#D4A373] hover:shadow-md transition-all group">
                    <span className="font-medium text-[#0B132B] text-sm group-hover:text-[#D4A373] transition-colors">{q.label}</span>
                    <p className="text-xs text-[#6B7280] mt-1 line-clamp-2">{q.prompt.slice(0, 80)}...</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-3">💬 {copy.questionTitle}</p>
              <div className="flex flex-wrap gap-2">
                {copy.questions.map((q) => (
                  <button key={q} onClick={() => send(q)}
                    className="text-xs px-3 py-2 rounded-full bg-white border border-[#E8E2D9] text-[#6B7280] hover:border-[#D4A373] hover:text-[#0B132B] transition-all">
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Messages */}
        {messages.length > 0 && (
          <div className="space-y-4">
            {messages.map((msg, i) => <MessageBubble key={i} msg={msg} />)}
            {loading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-[#D4A373] flex items-center justify-center text-sm flex-shrink-0">🧭</div>
                <div className="bg-white border border-[#E8E2D9] rounded-2xl rounded-tl-sm">
                  <TypingDots />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Suggested follow-ups after first response */}
        {started && messages.length >= 2 && !loading && (
          <div className="flex flex-wrap gap-2 mt-2">
            {copy.followUp.map((q) => (
              <button key={q} onClick={() => send(q)}
                className="text-xs px-3 py-1.5 rounded-full bg-white border border-[#E8E2D9] text-[#6B7280] hover:border-[#D4A373] hover:text-[#0B132B] transition-all">
                {q}
              </button>
            ))}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="sticky bottom-0 bg-white border-t border-[#E8E2D9] px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-3 items-end">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder={copy.inputPlaceholder}
                rows={2}
                className="w-full bg-[#F8F5F0] border border-[#E8E2D9] rounded-2xl px-4 py-3 text-sm text-[#0B132B] placeholder-[#6B7280]/60 focus:outline-none focus:border-[#D4A373] transition-colors resize-none"
              />
            </div>
            <button
              onClick={() => send(input)}
              disabled={!input.trim() || loading}
              className="w-12 h-12 rounded-2xl bg-[#0B132B] text-white flex items-center justify-center hover:bg-[#D4A373] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0 text-lg"
            >
              {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : '↑'}
            </button>
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-[#6B7280]">{copy.inputHint}</p>
            <div className="flex items-center gap-3">
              <Link href={localePath(locale, '/marketplace')} className="text-xs text-[#D4A373] hover:underline">🛍️ {copy.shopLink} →</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
