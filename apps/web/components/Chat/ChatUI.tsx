'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { LANGUAGES } from '@/lib/data';
import { speakText, stopSpeaking } from '@/lib/ai';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface LanguageOption {
  id: string;
  name: string;
  flag: string;
  col: string;
}

const CHAT_LANGUAGES: LanguageOption[] = [
  { id: 'default', name: 'General Chat', flag: '🌍', col: '#D4A373' },
  ...LANGUAGES.map(l => ({ id: l.id, name: l.name, flag: l.flag, col: l.col })),
];

const SUGGESTIONS = [
  'Tell me about HeritageArk',
  'What endangered languages do you cover?',
  'How can I help preserve cultural heritage?',
  'Tell me a traditional story',
  'Explain the importance of oral traditions',
];

function formatTime(d: Date) {
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function MicIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="2" width="6" height="11" rx="3" />
      <path d="M5 10a7 7 0 0 1 14 0" />
      <path d="M12 19v3" />
    </svg>
  );
}

function SendIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 2 11 13" /><path d="m22 2-7 20-4-9-9-4Z" />
    </svg>
  );
}

function StopIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <rect x="6" y="6" width="12" height="12" rx="1" />
    </svg>
  );
}

function SpeakerIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  );
}

function CopyIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function StopCircleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><rect x="9" y="9" width="6" height="6" rx="1" />
    </svg>
  );
}

function ThinkingDots() {
  return (
    <span className="inline-flex items-center gap-1">
      <span className="w-1.5 h-1.5 rounded-full bg-accent/60 animate-bounce" style={{ animationDelay: '0ms' }} />
      <span className="w-1.5 h-1.5 rounded-full bg-accent/60 animate-bounce" style={{ animationDelay: '150ms' }} />
      <span className="w-1.5 h-1.5 rounded-full bg-accent/60 animate-bounce" style={{ animationDelay: '300ms' }} />
    </span>
  );
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function MarkdownRenderer({ content }: { content: string }) {
  const lines = content.split('\n');
  const elements: JSX.Element[] = [];
  let inList = false;
  let listItems: string[] = [];

  function flushList(key: number) {
    if (listItems.length === 0) return null;
    const items = [...listItems];
    listItems = [];
    return (
      <ul key={key} className="space-y-1 my-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm">
            <span className="text-accent mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-current" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    );
  }

  let elementIndex = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? '';
    const trimmed = line.trim();

    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      listItems.push(trimmed.slice(2));
      inList = true;
      continue;
    }

    if (inList) {
      const list = flushList(elementIndex++);
      if (list) elements.push(list);
      inList = false;
    }

    if (!trimmed) {
      elements.push(<div key={elementIndex++} className="h-2" />);
      continue;
    }

    if (trimmed.startsWith('#')) {
      const level = trimmed.match(/^#+/)![0].length;
      const text = trimmed.replace(/^#+\s*/, '');
      const Tag = level === 1 ? 'h1' : level === 2 ? 'h2' : 'h3';
      const styles = ['text-lg font-semibold text-navy mt-4 mb-1', 'text-base font-semibold text-navy mt-3 mb-1', 'text-sm font-semibold text-navy mt-2 mb-1'];
      elements.push(<Tag key={elementIndex++} className={styles[Math.min(level, 3) - 1]}>{text}</Tag>);
      continue;
    }

    if (trimmed.startsWith('```')) {
      const lang = trimmed.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !(lines[i] ?? '').trim().startsWith('```')) {
        codeLines.push(lines[i] ?? '');
        i++;
      }
      elements.push(
        <pre key={elementIndex++} className="bg-navy/5 rounded-lg p-3 my-2 overflow-x-auto text-xs font-mono text-navy/80 border border-border">
          <code>{codeLines.join('\n')}</code>
        </pre>
      );
      continue;
    }

    const escaped = escapeHtml(trimmed);
    const bold = escaped.replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-navy">$1</strong>');
    const italic = bold.replace(/\*(.+?)\*/g, '<em>$1</em>');
    const link = italic.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-accent underline hover:no-underline" target="_blank" rel="noopener noreferrer">$1</a>');
    elements.push(
      <p key={elementIndex++} className="text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: link }} />
    );
  }

  if (inList) {
    const list = flushList(elementIndex++);
    if (list) elements.push(list);
  }

  return <div className="space-y-0.5">{elements}</div>;
}

function getClientFallback(input: string, selectedLang: LanguageOption): string {
  const text = input.toLowerCase();

  if (text.includes('nubian')) {
    return '🏛️ **Nubian (Nobiin)**\n\nHello: Takki | Thank you: Shukran oo | Water: Wéela\n\nNubian civilization spans 5,000+ years along the Nile. Their gold-thread embroidery is legendary.';
  }
  if (text.includes('amazigh') || text.includes('berber')) {
    return 'ⵣ **Amazigh (Tamazight)**\n\nHello: Azul | Thank you: Tanemmirt | Earth: Akal\n\nThe Amazigh are North Africa\'s indigenous people. Their Tifinagh script is one of the world\'s oldest.';
  }
  if (text.includes('kurdish') || text.includes('kurmanji')) {
    return '🌿 **Kurdish (Kurmanji)**\n\nHello: Merheba | Thank you: Spas | How are you?: Tu çawa yî?\n\nKurdish oral epics are among the most sophisticated in the Middle East.';
  }
  if (text.includes('sami') || text.includes('sámi')) {
    return '🏔️ **Northern Sámi**\n\nGood day: Buorre beaivi | Thank you: Giitu\n\nThe Sámi are Europe\'s only recognized indigenous people. Their joik singing is one of Europe\'s oldest vocal traditions.';
  }
  if (text.includes('mayan') || text.includes('maya')) {
    return '🔮 **Mayan Culture**\n\nThe Maya created the only fully developed writing system in the pre-Columbian Americas. Over 6 million Maya people speak 28 languages today.';
  }
  if (text.includes('andean') || text.includes('quechua') || text.includes('inca')) {
    return '🏔️ **Andean Culture**\n\nQuechua, the language of the Incas, is still spoken by 8-10 million people. Andean textiles are among the finest ever produced.';
  }
  if (text.includes('akan') || text.includes('kente') || text.includes('ashanti')) {
    return '🌟 **Akan Culture**\n\nKente cloth from Ghana encodes proverbs and history in every pattern. The Sankofa bird means "go back and get it."';
  }
  if (text.includes('ottoman') || text.includes('iznik')) {
    return '🕌 **Ottoman Culture**\n\nThe Ottoman Empire created a rich cultural synthesis over 600 years. Iznik ceramics are world treasures.';
  }
  if (text.includes('hello') || text.includes('hi') || text.includes('hey')) {
    return `✨ Welcome! I\'m HeritageArk AI${selectedLang.id !== 'default' ? `, your ${selectedLang.name} guide` : ''}. Ask me about indigenous cultures, endangered languages, heritage preservation, or traditional stories!`;
  }
  if (text.includes('heritageverse') || text.includes('what is')) {
    return '🌍 HeritageArk preserves indigenous languages and cultural heritage through language learning, a digital museum, documentaries, an artisan marketplace, and field expeditions recording oral histories.';
  }
  if (text.includes('endangered') || text.includes('language')) {
    return '🗣️ HeritageArk covers Nubian (Endangered, ~500K speakers), Amazigh (Vulnerable, ~8M), Kurdish (Vulnerable, ~15M), and Sámi (Endangered, ~25K). Over 3,000 languages risk disappearing by 2100.';
  }
  if (text.includes('preserve') || text.includes('heritage') || text.includes('protect')) {
    return '🛡️ Heritage Preservation: recording oral histories, digitizing artifacts, fair-trade artisan support, and emergency alerts for heritage at risk. You can help by learning, sharing, and supporting.';
  }
  if (text.includes('story') || text.includes('tale') || text.includes('tell me')) {
    return "📖 **The Weaver Who Wove the Stars**\n\nAn Amazigh legend: Tafat, whose name meant 'light,' wove the stars each night on her loom atop the Atlas Mountains. She was weaving time itself.\n\nAsk about Nubian or Kurdish stories too!";
  }
  if (text.includes('thank')) {
    return '✨ You\'re welcome! What else would you like to explore? Ask about a specific culture, language, or heritage preservation.';
  }

  return `🌍 HeritageArk celebrates 8 indigenous cultures${selectedLang.id !== 'default' ? `, and I'm your ${selectedLang.name} guide` : ''}. Which would you like to explore: Nubian, Amazigh, Kurdish, Sámi, Mayan, Andean, Akan, or Ottoman?`;
}

export default function ChatUI() {
  const [selectedLang, setSelectedLang] = useState<LanguageOption>(() => CHAT_LANGUAGES[0]!);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [translatingId, setTranslatingId] = useState<string | null>(null);
  const [translationTarget, setTranslationTarget] = useState<string>('en');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const abortRef = useRef<AbortController | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);
  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleTranslate = useCallback(async (msgId: string, text: string) => {
    if (translations[msgId] || translatingId) return;
    setTranslatingId(msgId);
    try {
      const res = await fetch('/api/ai/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          sourceLang: 'auto',
          targetLang: translationTarget,
        }),
      });
      if (!res.ok) throw new Error('Translation failed');
      const data = await res.json();
      setTranslations(prev => ({ ...prev, [msgId]: data.translation }));
    } catch {
      setTranslations(prev => ({ ...prev, [msgId]: 'Translation unavailable.' }));
    } finally {
      setTranslatingId(null);
    }
  }, [translationTarget, translations, translatingId]);

  const handleSend = useCallback(async (text?: string) => {
    const messageText = (text || input).trim();
    if (!messageText || isLoading) return;

    setInput('');
    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content: messageText, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    const abortController = new AbortController();
    abortRef.current = abortController;

    console.log(`[AI_CHAT_FRONTEND] Sending message: "${messageText.slice(0, 100)}" (lang=${selectedLang.id}, mode=${selectedLang.id === 'default' ? 'converse' : 'learn'})`);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
          language: selectedLang.id,
          mode: selectedLang.id === 'default' ? 'converse' : 'learn',
        }),
        signal: abortController.signal,
      });

      if (!res.ok) throw new Error(`API responded with ${res.status}`);

      const data = await res.json();
      console.log(`[AI_CHAT_FRONTEND] Response rendered: "${data.content.slice(0, 150)}..."`);

      const aiMsg: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.content,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      console.warn(`[AI_CHAT_FRONTEND] API call failed: ${err.message}. Using client fallback.`);
      const fallbackContent = getClientFallback(messageText, selectedLang);
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: fallbackContent,
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
      abortRef.current = null;
    }
  }, [input, isLoading, messages, selectedLang.id]);

  const handleVoiceInput = useCallback(() => {
    if (isRecording) {
      setIsRecording(false);
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice input requires Chrome or Edge browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.continuous = true;

    let finalTranscript = '';
    recognition.onresult = (event: any) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + ' ';
        }
      }
      setInput(finalTranscript);
    };

    recognition.onerror = () => { setIsRecording(false); };
    recognition.onend = () => {
      if (finalTranscript.trim()) {
        handleSend(finalTranscript.trim());
      }
      setIsRecording(false);
    };

    recognition.start();
    recognitionRef.current = recognition;
    setIsRecording(true);
  }, [isRecording, handleSend]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const handleSpeak = useCallback(async (text: string, id: string) => {
    if (isSpeaking === id) {
      stopSpeaking();
      setIsSpeaking(null);
      return;
    }
    stopSpeaking();
    setIsSpeaking(id);
    try {
      await speakText(text);
    } catch {
      // Browser SpeechSynthesis fallback handled by speakText
    }
    setIsSpeaking(null);
  }, [isSpeaking]);

  const handleCopy = useCallback(async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleStopGenerating = () => {
    abortRef.current?.abort();
    setIsLoading(false);
  };

  const clearHistory = () => setMessages([]);

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
      {/* Header */}
      <div className="bg-navy px-5 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
            <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456Z" />
            </svg>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">HeritageArk AI</h2>
            <p className="text-[10px] text-white/50">{selectedLang.id === 'default' ? 'General Assistant' : `Language Expert — ${selectedLang.name}`}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedLang.id}
            onChange={e => {
              const lang = CHAT_LANGUAGES.find(l => l.id === e.target.value) ?? CHAT_LANGUAGES[0]!;
              setSelectedLang(lang);
              setMessages([]);
            }}
            className="bg-navy2 text-white/80 text-xs rounded-lg px-2.5 py-1.5 border border-white/10 focus:outline-none focus:border-accent/50"
          >
            {CHAT_LANGUAGES.map(l => (
              <option key={l.id} value={l.id}>{l.flag} {l.name}</option>
            ))}
          </select>
          {messages.length > 0 && (
            <button
              onClick={clearHistory}
              className="text-[10px] px-2.5 py-1.5 rounded-lg text-white/40 hover:text-danger hover:bg-danger/10 transition-colors"
              title="Clear history"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto scroll-smooth">
        <div className="px-4 sm:px-6 py-4 max-w-2xl mx-auto">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-250px)] text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-gold flex items-center justify-center mb-4 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456Z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-navy mb-1">How can I help you?</h3>
              <p className="text-sm text-muted mb-6 max-w-sm">
                Ask me about indigenous cultures, endangered languages, heritage preservation, or traditional stories.
              </p>
              <div className="grid grid-cols-2 gap-2 w-full max-w-lg">
                {SUGGESTIONS.map(s => (
                  <button
                    key={s}
                    onClick={() => handleSend(s)}
                    className="text-xs px-3.5 py-2.5 rounded-xl bg-bg border border-border text-muted hover:border-accent hover:text-navy transition-colors text-left leading-snug"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map(msg => (
                <div key={msg.id} className={`group flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] sm:max-w-[75%] ${msg.role === 'user' ? 'order-1' : 'order-1'}`}>
                     {msg.role === 'user' ? (
                       <div className="bg-accent text-white rounded-2xl rounded-br-md px-4 py-2.5">
                         <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                         {translations[msg.id] && (
                           <div className="mt-2 p-2 rounded-lg bg-white/10 border border-white/20">
                             <p className="text-xs text-white/70 font-medium mb-1">Translation</p>
                             <p className="text-sm text-white leading-relaxed">{translations[msg.id]}</p>
                           </div>
                         )}
                         <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-white/20">
                           <button
                             onClick={() => handleTranslate(msg.id, msg.content)}
                             disabled={!!translations[msg.id] || translatingId === msg.id}
                             className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50"
                             title={translations[msg.id] ? 'Translated' : 'Translate'}
                           >
                             {translatingId === msg.id ? (
                               <span className="text-[10px]">...</span>
                             ) : (
                               <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                 <path d="M5 8l6 6M4 14l6-6 2 2M2 5h12M7 2v3M12 6l6-3M22 15v-3M17 22l6-6"/>
                               </svg>
                             )}
                           </button>
                           <select
                             value={translationTarget}
                             onChange={e => setTranslationTarget(e.target.value)}
                             className="text-[10px] bg-transparent text-white/70 border border-white/20 rounded px-1 py-0.5 focus:outline-none"
                           >
                             <option value="ar">العربية</option>
                             <option value="en">English</option>
                             <option value="fr">Français</option>
                             <option value="nub">Nubian</option>
                             <option value="amz">Amazigh</option>
                             <option value="kur">Kurdish</option>
                             <option value="sami">Sami</option>
                           </select>
                         </div>
                       </div>
                     ) : (
                        <div className="bg-bg rounded-2xl rounded-bl-md px-4 py-3 border border-border/50">
                          <div className="text-sm text-navy leading-relaxed">
                            <MarkdownRenderer content={msg.content} />
                          </div>
                          {translations[msg.id] && (
                            <div className="mt-2 p-2 rounded-lg bg-accent/5 border border-accent/10">
                              <p className="text-xs text-accent font-medium mb-1">Translation</p>
                              <p className="text-sm text-navy leading-relaxed">{translations[msg.id]}</p>
                            </div>
                          )}
                          <div className="flex items-center gap-1.5 mt-3 pt-2 border-t border-border/50">
                            <button
                              onClick={() => handleSpeak(msg.content, msg.id)}
                              className={`p-1.5 rounded-lg transition-colors ${isSpeaking === msg.id ? 'text-accent bg-accent/10' : 'text-muted/50 hover:text-muted hover:bg-navy/5'}`}
                              title={isSpeaking === msg.id ? 'Stop' : 'Read aloud'}
                            >
                              {isSpeaking === msg.id ? <StopIcon size={14} /> : <SpeakerIcon size={14} />}
                            </button>
                            <button
                              onClick={() => handleCopy(msg.content, msg.id)}
                              className="p-1.5 rounded-lg text-muted/50 hover:text-muted hover:bg-navy/5 transition-colors"
                              title="Copy"
                            >
                              {copiedId === msg.id ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
                            </button>
                            <button
                              onClick={() => handleTranslate(msg.id, msg.content)}
                              disabled={!!translations[msg.id] || translatingId === msg.id}
                              className="p-1.5 rounded-lg text-muted/50 hover:text-muted hover:bg-navy/5 transition-colors disabled:opacity-50"
                              title={translations[msg.id] ? 'Translated' : 'Translate'}
                            >
                              {translatingId === msg.id ? (
                                <span className="text-[10px]">...</span>
                              ) : (
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M5 8l6 6M4 14l6-6 2 2M2 5h12M7 2v3M12 6l6-3M22 15v-3M17 22l6-6"/>
                                </svg>
                              )}
                            </button>
                            <select
                              value={translationTarget}
                              onChange={e => setTranslationTarget(e.target.value)}
                              className="text-[10px] bg-transparent text-muted/60 border border-border/50 rounded px-1 py-0.5 focus:outline-none"
                            >
                              <option value="ar">العربية</option>
                              <option value="en">English</option>
                              <option value="fr">Français</option>
                              <option value="nub">Nubian</option>
                              <option value="amz">Amazigh</option>
                              <option value="kur">Kurdish</option>
                              <option value="sami">Sami</option>
                            </select>
                            <span className="text-[10px] text-muted/40 ml-auto">{formatTime(msg.timestamp)}</span>
                          </div>
                        </div>
                    )}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-bg rounded-2xl rounded-bl-md px-4 py-3 border border-border/50">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted">Thinking</span>
                      <ThinkingDots />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-border bg-white px-4 sm:px-6 py-3 flex-shrink-0">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-2 bg-bg rounded-2xl border border-border focus-within:border-accent focus-within:ring-1 focus-within:ring-accent/20 transition-all px-3 py-1.5">
            <button
              onClick={handleVoiceInput}
              disabled={isLoading}
              className={`p-2 rounded-xl transition-all flex-shrink-0 ${isRecording ? 'bg-danger text-white shadow-lg shadow-danger/30 animate-pulse' : 'text-muted hover:text-navy hover:bg-navy/5 disabled:opacity-30'}`}
              title={isRecording ? 'Stop recording' : 'Voice input'}
            >
              <MicIcon size={18} />
            </button>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isRecording ? 'Listening...' : `Ask about heritage, culture, or languages...`}
              disabled={isRecording || isLoading}
              className="flex-1 bg-transparent text-sm text-navy placeholder:text-muted/50 focus:outline-none py-1.5 disabled:opacity-50"
            />
            {isLoading ? (
              <button
                onClick={handleStopGenerating}
                className="p-2 rounded-xl bg-navy text-white hover:bg-navy/90 transition-colors flex-shrink-0"
                title="Stop generating"
              >
                <StopCircleIcon />
              </button>
            ) : (
              <button
                onClick={() => handleSend()}
                disabled={!input.trim()}
                className="p-2 rounded-xl bg-accent text-white hover:bg-accent/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
                title="Send message"
              >
                <SendIcon size={18} />
              </button>
            )}
          </div>
          <p className="text-[10px] text-muted/40 text-center mt-2">
            HeritageArk AI may produce inaccurate information. Verify important facts.
          </p>
        </div>
      </div>
    </div>
  );
}
