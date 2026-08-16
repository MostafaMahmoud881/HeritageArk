
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useTranslate } from '@/lib/TranslationProvider';
import { CraftsSection, ExpeditionsSection } from '@/components/PlatformSections';
import HeritageSitesPanel from '@/components/HeritageSitesPanel';

const HeritageGlobe = dynamic(() => import('@/components/HeritageGlobe'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[70vh] min-h-[500px] rounded-xl skeleton-pulse" />
  ),
});

const HOME_COPY = {
  en: {
    typewriterWords: ['Civilizations', 'Heritage', 'Cultures', 'Stories', 'Artifacts', 'Languages'],
    civilizations: [
      { name: 'Nubian', region: 'Africa' },
      { name: 'Amazigh', region: 'North Africa' },
      { name: 'Mayan', region: 'Americas' },
      { name: 'Ottoman', region: 'Middle East' },
      { name: 'Phoenician', region: 'Mediterranean' },
      { name: 'Incan', region: 'South America' },
      { name: 'Khmer', region: 'Southeast Asia' },
      { name: 'Viking', region: 'Europe' },
    ],
    stats: [
      { value: 195, suffix: '+', label: 'Cultures Documented' },
      { value: 12000, suffix: '+', label: 'Artifacts Preserved' },
      { value: 847, suffix: '', label: 'Documentaries' },
      { value: 3200, suffix: '+', label: 'Heritage Sites' },
    ],
    features: [
      { title: 'Immersive Stories', desc: 'AI-powered narratives that transport you through time and culture', icon: '📖', href: '/stories', size: 'large' as const, bg: 'from-[#355C4A] to-[#2D3436]' },
      { title: 'Virtual Museum', desc: 'Explore 6 exhibit rooms with 3D artifacts', icon: '🏛️', href: '/museum', size: 'small' as const, bg: 'from-[#8C6B43] to-[#B9955A]' },
      { title: 'Heritage Map', desc: 'Interactive world map of heritage sites', icon: '🗺️', href: '/map', size: 'small' as const, bg: 'from-[#355C4A] to-[#2D6A4F]' },
      { title: 'AI Heritage Guide', desc: 'Chat with an AI expert on any civilization', icon: '🤖', href: '/chat', size: 'medium' as const, bg: 'from-[#59636D] to-[#2D3436]' },
      { title: 'Cultural Reels', desc: 'Short-form videos from around the world', icon: '🎬', href: '/reels', size: 'medium' as const, bg: 'from-[#8C6B43] to-[#B9955A]' },
      { title: 'Language Archive', desc: 'Learn endangered languages before they vanish', icon: '🗣️', href: '/languages', size: 'small' as const, bg: 'from-[#355C4A] to-[#2D6A4F]' },
    ],
    tapeItems: [
      '🏺 Nubian Ankh', '🕌 Ottoman Tile', '🌿 Mayan Mask', '🔯 Amazigh Diadem',
      '⚓ Phoenician Ship', '🦙 Incan Quipu', '🛕 Khmer Temple', '⚔️ Viking Rune',
      '🎭 Greek Theatre', '🌸 Japanese Ikebana', '🥁 African Djembe', '🏯 Chinese Pagoda',
    ],
    heroBadge: 'Preserving Human Heritage',
    heroTitle1: "Explore the World's",
    heroTitle2: 'Heritage',
    heroSubtitle: 'An immersive platform where ancient wisdom meets modern technology. Discover, preserve, and celebrate the richness of human civilization.',
    heroCta: 'Enter the Museum',
    heroCtaSecondary: 'Start a Story',
    heroLinks: ['Reels', 'AI Guide', 'Quests', 'Crafts', 'Scanner'],
    civilizationsHeading: '195+ Civilizations',
    civilizationsTitle1: 'Every Culture Has a',
    civilizationsTitle2: 'Story to Tell',
    civilizationsSubtitle: 'From the ancient Nubians of the Nile to the seafaring Phoenicians of the Mediterranean — every civilization left behind a legacy worth preserving.',
    civilizationsBullets: [
      'Explore artifacts from 12,000+ collections',
      'AI-powered cultural insights',
      'Real-time preservation alerts',
    ],
    civilizationsLink: 'Browse all cultures',
    featuresHeading: 'Everything in One Place',
    featuresTitle: 'Your Heritage Universe',
    featuresExplore: 'Explore',
    globeHeading: 'Interactive Map',
    globeTitle: 'Heritage Sites Around the World',
    globeSubtitle: 'Spin the globe and discover thousands of cultural heritage sites across every civilization.',
    emergencyBadge: 'Heritage Under Threat',
    emergencyTitle1: 'Some Cultures Are Disappearing',
    emergencyTitle2: 'Right Now',
    emergencySubtitle: "Over 40% of the world's languages are endangered. Thousands of heritage sites face destruction. Your engagement helps preserve what remains.",
    emergencyLink: 'View Emergency Alerts',
    finalTitle1: 'Be Part of the',
    finalTitle2: 'Preservation Story',
    finalSubtitle: 'Join thousands of explorers, historians, and culture enthusiasts keeping human heritage alive for future generations.',
    finalPrimary: 'Join HeritageArk',
    finalSecondary: 'Explore First',
    statTitle: 'Scroll',
  },
  ar: {
    typewriterWords: ['الحضارات', 'التراث', 'الثقافات', 'القصص', 'القطع الأثرية', 'اللغات'],
    civilizations: [
      { name: 'نوبي', region: 'أفريقيا' },
      { name: 'أمازيغ', region: 'شمال أفريقيا' },
      { name: 'مايا', region: 'الأمريكتان' },
      { name: 'عثماني', region: 'الشرق الأوسط' },
      { name: 'فينيقي', region: 'المتوسط' },
      { name: 'إنكا', region: 'أمريكا الجنوبية' },
      { name: 'خمير', region: 'جنوب شرق آسيا' },
      { name: 'فايكنغ', region: 'أوروبا' },
    ],
    stats: [
      { value: 195, suffix: '+', label: 'ثقافة موثقة' },
      { value: 12000, suffix: '+', label: 'قطعة أثرية محفوظة' },
      { value: 847, suffix: '', label: 'فيلم وثائقي' },
      { value: 3200, suffix: '+', label: 'موقع تراثي' },
    ],
    features: [
      { title: 'قصص غامرة', desc: 'سرديات مدعومة بالذكاء الاصطناعي تنقلك عبر الزمن والثقافة', icon: '📖', href: '/stories', size: 'large' as const, bg: 'from-[#355C4A] to-[#2D3436]' },
      { title: 'المتحف الافتراضي', desc: 'استكشف 6 قاعات عرض مع قطع أثرية ثلاثية الأبعاد', icon: '🏛️', href: '/museum', size: 'small' as const, bg: 'from-[#8C6B43] to-[#B9955A]' },
      { title: 'خريطة التراث', desc: 'خريطة تفاعلية لمواقع التراث حول العالم', icon: '🗺️', href: '/map', size: 'small' as const, bg: 'from-[#355C4A] to-[#2D6A4F]' },
      { title: 'مرشد التراث الذكي', desc: 'تحدث مع خبير ذكاء اصطناعي حول أي حضارة', icon: '🤖', href: '/chat', size: 'medium' as const, bg: 'from-[#59636D] to-[#2D3436]' },
      { title: 'ريلز ثقافية', desc: 'مقاطع قصيرة من أنحاء العالم', icon: '🎬', href: '/reels', size: 'medium' as const, bg: 'from-[#8C6B43] to-[#B9955A]' },
      { title: 'أرشيف اللغات', desc: 'تعلم اللغات المهددة بالاندثار قبل أن تختفي', icon: '🗣️', href: '/languages', size: 'small' as const, bg: 'from-[#355C4A] to-[#2D6A4F]' },
    ],
    tapeItems: [
      '🏺 تميمة نوبية', '🕌 بلاطة عثمانية', '🌿 قناع مايا', '🔯 تاج أمازيغي',
      '⚓ سفينة فينيقية', '🦙 كويبـو إنكا', '🛕 معبد خمير', '⚔️ رمز فايكنغ',
      '🎭 المسرح اليوناني', '🌸 الإيكيبانا اليابانية', '🥁 طبلة أفريقية', '🏯 برج صيني',
    ],
    heroBadge: 'الحفاظ على التراث الإنساني',
    heroTitle1: 'استكشف تراث',
    heroTitle2: 'العالم',
    heroSubtitle: 'منصة غامرة تلتقي فيها الحكمة القديمة مع التكنولوجيا الحديثة. اكتشف، واحفظ، واحتفِ بغنى الحضارة الإنسانية.',
    heroCta: 'ادخل المتحف',
    heroCtaSecondary: 'ابدأ قصة',
    heroLinks: ['ريلز', 'مرشد ذكي', 'مهام', 'الحرف', 'الماسح'],
    civilizationsHeading: '195+ حضارة',
    civilizationsTitle1: 'لكل ثقافة',
    civilizationsTitle2: 'قصة تُروى',
    civilizationsSubtitle: 'من نوبيي وادي النيل القدماء إلى الفينيقيين البحارة في المتوسط — تركت كل حضارة وراءها إرثًا يستحق الحفظ.',
    civilizationsBullets: [
      'استكشف قطعًا أثرية من أكثر من 12000 مجموعة',
      'رؤى ثقافية مدعومة بالذكاء الاصطناعي',
      'تنبيهات فورية للحفاظ على التراث',
    ],
    civilizationsLink: 'تصفح جميع الثقافات',
    featuresHeading: 'كل شيء في مكان واحد',
    featuresTitle: 'عالم التراث الخاص بك',
    featuresExplore: 'استكشف',
    globeHeading: 'خريطة تفاعلية',
    globeTitle: 'مواقع التراث حول العالم',
    globeSubtitle: 'أدر الكرة الأرضية واكتشف آلاف مواقع التراث الثقافي عبر كل الحضارات.',
    emergencyBadge: 'التراث تحت التهديد',
    emergencyTitle1: 'بعض الثقافات تختفي',
    emergencyTitle2: 'الآن',
    emergencySubtitle: 'أكثر من 40% من لغات العالم مهددة بالانقراض. آلاف المواقع التراثية تواجه الدمار. مشاركتك تساعد في حفظ ما تبقى.',
    emergencyLink: 'عرض تنبيهات الطوارئ',
    finalTitle1: 'كن جزءًا من',
    finalTitle2: 'قصة الحفظ',
    finalSubtitle: 'انضم إلى آلاف المستكشفين والمؤرخين وعشاق الثقافة الذين يحافظون على التراث الإنساني للأجيال القادمة.',
    finalPrimary: 'انضم إلى HeritageArk',
    finalSecondary: 'استكشف أولاً',
    statTitle: 'مرّر للأسفل',
  },
} as const;

const CIVILIZATION_VISUALS = [
  { emoji: '🏺', color: '#B9955A' },
  { emoji: '🔯', color: '#8C6B43' },
  { emoji: '🌿', color: '#355C4A' },
  { emoji: '🕌', color: '#59636D' },
  { emoji: '⚓', color: '#8C6B43' },
  { emoji: '🦙', color: '#B9955A' },
  { emoji: '🛕', color: '#355C4A' },
  { emoji: '⚔️', color: '#59636D' },
];

// ─── Hooks ────────────────────────────────────────────────────────────────────

function useTypewriter(words: readonly string[], speed = 80, pause = 2000) {
  const [display, setDisplay] = useState('');
  const [wordIdx, setWordIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const word = words[wordIdx % words.length]!;
    const timeout = setTimeout(() => {
      if (!deleting) {
        setDisplay(word.slice(0, charIdx + 1));
        if (charIdx + 1 === word.length) setTimeout(() => setDeleting(true), pause);
        else setCharIdx(c => c + 1);
      } else {
        setDisplay(word.slice(0, charIdx - 1));
        if (charIdx - 1 === 0) { setDeleting(false); setWordIdx(w => w + 1); setCharIdx(0); }
        else setCharIdx(c => c - 1);
      }
    }, deleting ? speed / 2 : speed);
    return () => clearTimeout(timeout);
  }, [charIdx, deleting, wordIdx, words, speed, pause]);

  return display;
}

function useCountUp(target: number, duration = 2000, active: boolean) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration, active]);
  return count;
}

function useInView(threshold = 0.3) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e!.isIntersecting) setInView(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Particles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const particles = Array.from({ length: 40 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.5,
      dx: (Math.random() - 0.5) * 0.3, dy: (Math.random() - 0.5) * 0.3,
      opacity: Math.random() * 0.25 + 0.05,
    }));
    let raf: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(185, 149, 90, ${p.opacity})`; ctx.fill();
        p.x += p.dx; p.y += p.dy;
        if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    window.addEventListener('resize', resize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />;
}

function StatCard({ value, suffix, label, active }: { value: number; suffix: string; label: string; active: boolean }) {
  const count = useCountUp(value, 2000, active);
  return (
    <div className="text-center">
      <div className="text-4xl md:text-5xl font-serif text-[#B9955A] font-bold">{count.toLocaleString()}{suffix}</div>
      <div className="text-[#59636D] text-sm mt-2 tracking-wide">{label}</div>
    </div>
  );
}

function CivilizationWheel({ civilizations }: { civilizations?: readonly { name: string; region: string }[] }) {
  const { locale } = useTranslate();
  const fallbackCivilizations = HOME_COPY[locale === 'ar' ? 'ar' : 'en'].civilizations;
  const items = civilizations ?? fallbackCivilizations;
  const [active, setActive] = useState(0);
  const [rotating, setRotating] = useState(true);
  useEffect(() => {
    if (!rotating) return;
    const t = setInterval(() => setActive(a => (a + 1) % items.length), 2500);
    return () => clearInterval(t);
  }, [rotating, items.length]);
  const current = items[active]!;
  const currentVisual = CIVILIZATION_VISUALS[active % CIVILIZATION_VISUALS.length]!;
  const radius = 140;
  return (
    <div className="relative flex items-center justify-center" style={{ width: 360, height: 360 }}>
      <div
        className="absolute z-10 w-28 h-28 rounded-full flex flex-col items-center justify-center border-2 transition-all duration-700 cursor-pointer shadow-lg"
        onClick={() => setRotating(r => !r)}
      >
        <span className="text-4xl">{currentVisual.emoji}</span>
        <span className="text-[#2D3436] text-xs mt-1 font-medium">{current.name}</span>
        <span className="text-[#59636D] text-[10px]">{current.region}</span>
      </div>
      {items.map((civ, i) => {
        const visual = CIVILIZATION_VISUALS[i % CIVILIZATION_VISUALS.length]!;
        const angle = (i / items.length) * 2 * Math.PI - Math.PI / 2;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        const isActive = i === active;
        return (
          <button key={civ.name} className="absolute flex flex-col items-center gap-1 transition-all duration-500"
            style={{ transform: `translate(${x}px, ${y}px)` }}
            onClick={() => { setActive(i); setRotating(false); }}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg border transition-all duration-300"
              style={{
                background: isActive ? visual.color : visual.color + '15',
                borderColor: visual.color,
                transform: isActive ? 'scale(1.3)' : 'scale(1)',
                boxShadow: isActive ? `0 0 16px ${visual.color}50` : 'none',
              }}>
              {visual.emoji}
            </div>
            {isActive && <span className="text-[10px] text-[#59636D] whitespace-nowrap">{civ.name}</span>}
          </button>
        );
      })}
      <svg className="absolute inset-0 pointer-events-none" width="360" height="360">
        <circle cx="180" cy="180" r={radius} fill="none" stroke="rgba(185,149,90,0.2)" strokeWidth="1" strokeDasharray="4 6" />
      </svg>
    </div>
  );
}

function BentoFeature({ feature }: { feature: { title: string; desc: string; icon: string; href: string; size: 'small' | 'medium' | 'large'; bg: string } }) {
  const { locale } = useTranslate();
  const copy = HOME_COPY[locale === 'ar' ? 'ar' : 'en'];
  const [hovered, setHovered] = useState(false);
  const sizeClass = feature.size === 'large' ? 'md:col-span-2 md:row-span-2' : feature.size === 'medium' ? 'md:col-span-1 md:row-span-2' : '';
  return (
    <Link href={feature.href}
      className={`relative rounded-2xl overflow-hidden group cursor-pointer ${sizeClass}`}
      style={{ minHeight: feature.size === 'small' ? 160 : feature.size === 'medium' ? 280 : 320 }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <div className={`absolute inset-0 bg-gradient-to-br ${feature.bg} transition-transform duration-700 ${hovered ? 'scale-105' : 'scale-100'}`} />
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.3) 0%, transparent 50%)' }} />
      <div className="relative z-10 p-6 h-full flex flex-col justify-between">
        <span className="text-4xl">{feature.icon}</span>
        <div>
          <h3 className="text-white font-serif text-xl mb-1">{feature.title}</h3>
          <p className="text-white/70 text-sm">{feature.desc}</p>
          <div className={`mt-4 flex items-center gap-2 text-white/80 text-sm transition-all duration-300 ${hovered ? 'translate-x-2' : ''}`}>
            <span>{copy.featuresExplore}</span><span>→</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function HeritageTape() {
  const { locale } = useTranslate();
  const copy = HOME_COPY[locale === 'ar' ? 'ar' : 'en'];
  const items = [...copy.tapeItems, ...copy.tapeItems];
  return (
    <div className="overflow-hidden py-4 border-y border-[#B9955A]/15 bg-[#F7F4EF]">
      <div className="flex gap-8 animate-tape whitespace-nowrap">
        {items.map((item, i) => (
          <span key={i} className="text-[#B9955A]/60 text-sm font-medium tracking-widest uppercase flex-shrink-0">{item}</span>
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function HomePageNew() {
  const { locale } = useTranslate();
  const isArabic = locale === 'ar';
  const copy = HOME_COPY[isArabic ? 'ar' : 'en'];
  const typeword = useTypewriter(copy.typewriterWords) || copy.heroTitle2;
  const { ref: statsRef, inView: statsInView } = useInView();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="bg-[#F7F4EF] min-h-screen overflow-x-hidden" dir={isArabic ? 'rtl' : 'ltr'}>

      {/* ── Hero ── */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#F7F4EF] via-[#EDE8DF] to-[#E8DDC8]">
        <Particles />

        {/* Texture */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23B9955A' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            transform: `translateY(${scrollY * 0.4}px)`,
          }} />

        {/* Glow */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[600px] h-[600px] rounded-full opacity-15"
            style={{ background: 'radial-gradient(circle, #B9955A 0%, transparent 70%)' }} />
        </div>

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-3 mb-8 px-4 py-2 rounded-full border border-[#B9955A]/25 bg-white/60 backdrop-blur-sm shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B9955A] animate-pulse" />
            <span className="text-[#B9955A] text-xs tracking-[0.3em] uppercase font-medium">{copy.heroBadge}</span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif text-[#2D3436] leading-tight">
            {copy.heroTitle1}
            <br />
            <span className="text-[#B9955A]">{typeword}</span>
            <span className="animate-blink text-[#B9955A]">|</span>
          </h1>

          <p className="mt-8 text-lg md:text-xl text-[#59636D] max-w-2xl mx-auto leading-relaxed">
            {copy.heroSubtitle}
          </p>

          <div className="mt-12 flex flex-wrap gap-4 justify-center">
            <Link href="/museum"
              className="group px-8 py-4 rounded-full bg-[#355C4A] text-white font-semibold text-sm tracking-wide hover:bg-[#2D6A4F] transition-all duration-300 flex items-center gap-2 shadow-md">
              {copy.heroCta}
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
            <Link href="/stories"
              className="px-8 py-4 rounded-full border border-[#2D3436]/20 text-[#59636D] font-medium text-sm tracking-wide hover:border-[#B9955A]/50 hover:text-[#2D3436] transition-all duration-300 bg-white/50 backdrop-blur-sm">
              {copy.heroCtaSecondary}
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-2">
            {[
              { href: '/reels', label: `🎬 ${copy.heroLinks[0]}` },
              { href: '/chat', label: `🤖 ${copy.heroLinks[1]}` },
              { href: '/quests', label: `⚔️ ${copy.heroLinks[2]}` },
              { href: '/marketplace', label: `🛍️ ${copy.heroLinks[3]}` },
              { href: '/scanner', label: `📷 ${copy.heroLinks[4]}` },
            ].map(link => (
              <Link key={link.href} href={link.href}
                className="px-4 py-1.5 rounded-full bg-white/60 hover:bg-white border border-[#2D3436]/10 text-[#59636D] hover:text-[#2D3436] text-xs transition-all duration-200 shadow-sm">
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30">
          <span className="text-[#59636D] text-[10px] tracking-[0.3em] uppercase">{copy.statTitle}</span>
          <div className="w-px h-12 bg-gradient-to-b from-[#59636D] to-transparent animate-pulse" />
        </div>
      </section>

      {/* ── Tape ── */}
      <HeritageTape />

      {/* ── Civilizations Wheel ── */}
      <section className="py-32 relative overflow-hidden bg-white">
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ background: 'radial-gradient(ellipse at center, #B9955A 0%, transparent 70%)' }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-[#B9955A] text-xs tracking-[0.3em] uppercase font-medium">{copy.civilizationsHeading}</span>
              <h2 className="text-4xl md:text-5xl font-serif text-[#2D3436] mt-4 leading-tight">
                {copy.civilizationsTitle1}<br />
                <span className="text-[#B9955A]">{copy.civilizationsTitle2}</span>
              </h2>
              <p className="text-[#59636D] mt-6 leading-relaxed max-w-md">
                {copy.civilizationsSubtitle}
              </p>
              <div className="mt-8 space-y-3">
                {copy.civilizationsBullets.map(item => (
                  <div key={item} className="flex items-center gap-3 text-[#59636D] text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#B9955A] flex-shrink-0" />{item}
                  </div>
                ))}
              </div>
              <Link href="/cultures" className="mt-8 inline-flex items-center gap-2 text-[#B9955A] text-sm hover:gap-3 transition-all duration-200">
                {copy.civilizationsLink} →
              </Link>
            </div>
            <div className="flex justify-center">
              <CivilizationWheel civilizations={copy.civilizations} />
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="py-20 border-y border-[#E8DDC8] bg-[#F7F4EF]" ref={statsRef}>
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-12">
          {copy.stats.map(s => <StatCard key={s.label} value={s.value} suffix={s.suffix} label={s.label} active={statsInView} />)}
        </div>
      </section>

      {/* ── Bento Features ── */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-[#B9955A] text-xs tracking-[0.3em] uppercase font-medium">{copy.featuresHeading}</span>
            <h2 className="text-4xl md:text-5xl font-serif text-[#2D3436] mt-4">{copy.featuresTitle}</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4 auto-rows-[160px]">
            {copy.features.map(feature => <BentoFeature key={feature.title} feature={feature} />)}
          </div>
        </div>
      </section>

      {/* ── Globe ── */}
      <section className="py-24 bg-[#F7F4EF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-[#B9955A] text-xs tracking-[0.3em] uppercase font-medium">{copy.globeHeading}</span>
            <h2 className="text-4xl md:text-5xl font-serif text-[#2D3436] mt-4">{copy.globeTitle}</h2>
            <p className="text-[#59636D] mt-3 max-w-xl mx-auto text-sm">
              {copy.globeSubtitle}
            </p>
          </div>
          <div className="grid lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 rounded-xl overflow-hidden">
              <HeritageGlobe />
            </div>
            <div className="lg:col-span-1">
              <HeritageSitesPanel />
            </div>
          </div>
        </div>
      </section>

      {/* ── Tape 2 ── */}
      <HeritageTape />

      {/* ── Crafts Section (id="crafts") ── */}
      <CraftsSection />

      {/* ── Expeditions Section (id="expeditions") ── */}
      <ExpeditionsSection />

      {/* ── Emergency Banner ── */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 border border-red-200 mb-6">
            <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
            <span className="text-red-500 text-xs tracking-widest uppercase font-medium">{copy.emergencyBadge}</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-serif text-[#2D3436]">
            {copy.emergencyTitle1}<br />
            <span className="text-red-400">{copy.emergencyTitle2}</span>
          </h2>
          <p className="text-[#59636D] mt-4 max-w-xl mx-auto">
            {copy.emergencySubtitle}
          </p>
          <Link href="/emergency"
            className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-red-50 border border-red-200 text-red-500 text-sm hover:bg-red-100 transition-all duration-200">
            {copy.emergencyLink} →
          </Link>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-40 relative overflow-hidden bg-gradient-to-b from-[#F7F4EF] to-[#E8DDC8]">
        <div className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse at 50% 100%, rgba(185,149,90,0.08) 0%, transparent 60%)' }} />
        <div className="relative z-10 max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-5xl md:text-6xl font-serif text-[#2D3436] leading-tight">
            {copy.finalTitle1}<br />
            <span className="text-[#B9955A]">{copy.finalTitle2}</span>
          </h2>
          <p className="text-[#59636D] mt-6 text-lg max-w-xl mx-auto">
            {copy.finalSubtitle}
          </p>
          <div className="mt-12 flex flex-wrap gap-4 justify-center">
            <Link href="/auth/register"
              className="px-10 py-4 rounded-full bg-[#355C4A] text-white font-bold text-sm tracking-wide hover:bg-[#2D6A4F] transition-all duration-300 shadow-md">
              {copy.finalPrimary}
            </Link>
            <Link href="/museum"
              className="px-10 py-4 rounded-full border border-[#2D3436]/15 text-[#59636D] text-sm hover:border-[#B9955A]/40 hover:text-[#2D3436] transition-all duration-300">
              {copy.finalSecondary}
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}