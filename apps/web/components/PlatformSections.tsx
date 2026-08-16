'use client';

import Link from 'next/link';
import { Badge } from '@heritageverse/ui';
import { useCultures, useNews, useDocumentaries, useArtifacts, useLanguages, useCrafts, useGarments, useTimelineEvents, useExpeditions, useStories, useMapPoints, useEmergencyAlerts, useArtCampaigns } from '@/lib/queries';
import { CULTURES } from '@/lib/data';
import { useTranslate } from '@/lib/TranslationProvider';
import { localizeList } from '@/lib/localizeContent';

function SectionHeader({ overline, title, description, href }: { overline: string; title: string; description?: string; href?: string }) {
  const { t } = useTranslate();
  return (
    <div className="flex items-end justify-between mb-12">
      <div>
        <span className="text-[#D4A373] text-sm font-semibold tracking-widest uppercase">{overline}</span>
        <h2 className="text-3xl md:text-4xl font-serif text-[#0B132B] mt-2">{title}</h2>
        {description && <p className="text-[#6B7280] mt-3 max-w-xl">{description}</p>}
      </div>
      {href && <Link href={href} className="hidden sm:inline text-sm text-[#0B132B] hover:text-[#D4A373] transition-colors">{t('common.viewAll')} &rarr;</Link>}
    </div>
  );
}

export function DocumentariesSection() {
  const { t } = useTranslate();
  const { data: rawDocs } = useDocumentaries();
  const docs = localizeList(rawDocs, 'documentaries', t);
  return (
    <section className="py-24 bg-white scroll-mt-20" id="documentaries">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader overline={t('documentaries.watch')} title={t('documentaries.title')} description={t('documentaries.subtitle')} />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {docs.map((doc) => (
            <div key={doc.id} className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-[#E8E2D9]">
              <div className="aspect-video flex items-center justify-center text-6xl" style={{ background: doc.bg }}>{doc.emoji}</div>
              <div className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-[#D4A373] font-semibold">{doc.cat}</span>
                  <span className="text-xs text-[#6B7280]">{doc.dur}</span>
                </div>
                <h3 className="font-serif text-lg text-[#0B132B] group-hover:text-[#D4A373] transition-colors">{doc.title}</h3>
                <p className="text-sm text-[#6B7280] mt-2 line-clamp-2">{doc.desc}</p>
                <div className="flex items-center justify-between mt-4 text-xs text-[#6B7280]">
                  <span>{doc.culture}</span>
                  <span>{doc.views.toLocaleString()} {t('documentaries.views')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function MuseumSection() {
  const { t } = useTranslate();
  const { data: rawArtifacts } = useArtifacts();
  const artifacts = localizeList(rawArtifacts, 'artifacts', t);
  return (
    <section className="py-24 bg-[#F8F5F0] scroll-mt-20" id="museum">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader overline={t('museum.explore')} title={t('museum.title')} description={t('museum.subtitle')} />
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {artifacts.map((a) => (
            <div key={a._id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-[#E8E2D9] group">
              <div className="aspect-square flex items-center justify-center text-5xl bg-[#F8F5F0]">{a.emoji}</div>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full" style={{ background: a.col }} />
                  <span className="text-xs text-[#6B7280]">{a.era}</span>
                </div>
                <h3 className="font-serif text-base text-[#0B132B] group-hover:text-[#D4A373] transition-colors">{a.name}</h3>
                <p className="text-xs text-[#6B7280] mt-1">{a.culture} &middot; {a.location}</p>
                <div className="mt-3 flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${(a as any).preservationStatus === 'Critical' ? 'bg-red-100 text-red-700' : (a as any).preservationStatus === 'Restored' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>{(a as any).preservationStatus}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function LanguagesSection() {
  const { t } = useTranslate();
  const { data: rawLangs } = useLanguages();
  const langs = localizeList(rawLangs, 'languages', t);
  return (
    <section className="py-24 bg-white scroll-mt-20" id="languages">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader overline={t('languages.learn')} title={t('languages.title')} description={t('languages.subtitle')} />
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {langs.map((lang) => (
            <div key={lang.id} className="bg-[#F8F5F0] rounded-xl p-6 border border-[#E8E2D9] hover:shadow-md transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{lang.emoji}</span>
                <div>
                  <h3 className="font-serif text-lg text-[#0B132B]">{lang.name}</h3>
                  <span className="text-xs text-[#6B7280]">{lang.speakers} {t('languages.speakers')}</span>
                </div>
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm"><span className="text-[#6B7280]">{t('languages.status')}</span><span className="font-medium">{lang.status}</span></div>
                <div className="flex justify-between text-sm"><span className="text-[#6B7280]">{t('languages.family')}</span><span className="font-medium">{lang.family}</span></div>
              </div>
              <div className="bg-white rounded-lg p-3 text-sm">
                <p className="text-[#6B7280] text-xs">{t('languages.hello')}</p>
                <p className="font-medium text-[#0B132B]">{lang.hello}</p>
                <p className="text-xs text-[#6B7280] mt-1">{lang.hello_script}</p>
              </div>
              <div className="mt-3 flex flex-wrap gap-1">
                {lang.levels.map((lvl) => (
                  <span key={lvl} className="text-xs px-2 py-0.5 rounded-full bg-[#D4A373]/10 text-[#D4A373]">{lvl}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function StoriesSection() {
  const { t } = useTranslate();
  const { data: rawStories } = useStories();
  const stories = localizeList(rawStories, 'stories', t);
  return (
    <section className="py-24 bg-[#0B132B] scroll-mt-20" id="stories">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-[#D4A373] text-sm font-semibold tracking-widest uppercase">{t('stories.listen')}</span>
          <h2 className="text-3xl md:text-4xl font-serif text-white mt-2">{t('stories.title')}</h2>
          <p className="text-white/60 mt-3 max-w-xl mx-auto">{t('stories.subtitle')}</p>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          {stories.map((story) => (
            <div key={story.id} className="bg-white/5 rounded-xl p-8 border border-white/10 hover:bg-white/10 transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs px-3 py-1 rounded-full bg-[#D4A373]/20 text-[#D4A373]">{story.genre}</span>
                <span className="text-xs text-white/40">{story.culture}</span>
              </div>
              <h3 className="font-serif text-xl text-white mb-4">{story.title}</h3>
              <p className="text-white/60 text-sm leading-relaxed line-clamp-6">{story.content}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FashionSection() {
  const { t } = useTranslate();
  const { data: rawGarments } = useGarments();
  const garments = localizeList(rawGarments, 'garments', t);
  return (
    <section className="py-24 bg-white scroll-mt-20" id="fashion">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader overline={t('fashion.wear')} title={t('fashion.title')} description={t('fashion.subtitle')} />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {garments.map((g) => (
            <div key={g.id} className="bg-[#F8F5F0] rounded-xl overflow-hidden border border-[#E8E2D9] hover:shadow-md transition-all duration-300 group">
              <div className="p-6 flex items-center justify-center text-6xl bg-white">{g.emoji}</div>
              <div className="p-5">
                <h3 className="font-serif text-lg text-[#0B132B] group-hover:text-[#D4A373] transition-colors">{g.name}</h3>
                <p className="text-xs text-[#6B7280] mt-1">{g.origin} &middot; {g.era}</p>
                <p className="text-sm text-[#6B7280] mt-3 line-clamp-2">{g.desc}</p>
                <div className="flex flex-wrap gap-1 mt-3">
                  {g.tags.map((t) => (
                    <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-[#D4A373]/10 text-[#D4A373]">{t}</span>
                  ))}
                </div>
                <p className="text-xs text-[#6B7280] mt-3">{g.material}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CraftsSection() {
  const { t } = useTranslate();
  const { data: rawCrafts } = useCrafts();
  const crafts = localizeList(rawCrafts, 'crafts', t);
  return (
    <section className="py-24 bg-[#F8F5F0] scroll-mt-20" id="crafts">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader overline={t('crafts.shop')} title={t('crafts.title')} description={t('crafts.subtitle')} />
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {crafts.map((c) => (
            <div key={c.id} className="bg-white rounded-xl overflow-hidden border border-[#E8E2D9] hover:shadow-lg transition-all duration-300 group">
              <div className="aspect-square flex items-center justify-center text-5xl" style={{ background: c.col + '20' }}>{c.emoji}</div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-[#D4A373] font-semibold">{c.cat}</span>
                  <span className="text-sm font-bold text-[#0B132B]">${c.price}</span>
                </div>
                <h3 className="font-serif text-base text-[#0B132B] group-hover:text-[#D4A373] transition-colors">{c.name}</h3>
                <p className="text-xs text-[#6B7280] mt-1">{c.origin}</p>
                <p className="text-xs text-[#6B7280] mt-2 line-clamp-2">{c.desc}</p>
                <div className="flex items-center justify-between mt-3 text-xs text-[#6B7280]">
                  <span>★ {c.rating} ({c.reviews})</span>
                  {c.fairtrade && <span className="text-green-600">{t('crafts.fairTrade')}</span>}
                </div>
                <p className="text-xs text-[#6B7280] mt-1">{t('crafts.by')} {c.artisan}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function TimelineSection() {
  const { t } = useTranslate();
  const { data: rawEvents } = useTimelineEvents();
  const events = localizeList(rawEvents, 'timelineEvents', t);
  return (
    <section className="py-24 bg-white scroll-mt-20" id="timeline">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader overline={t('timeline.history')} title={t('timeline.title')} description={t('timeline.subtitle')} />
        <div className="space-y-0">
          {events.map((ev, i) => (
            <div key={ev.id} className="flex gap-6 group">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl bg-[#F8F5F0] border-2 border-[#E8E2D9] group-hover:border-[#D4A373] transition-colors flex-shrink-0">{ev.emoji}</div>
                {i < events.length - 1 && <div className="w-0.5 flex-1 bg-[#E8E2D9] group-hover:bg-[#D4A373]/30 transition-colors" />}
              </div>
              <div className="pb-12 pt-1">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-sm font-bold text-[#D4A373]">{ev.year}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#0B132B]/5 text-[#6B7280]">{ev.era}</span>
                  <span className="text-xs text-[#6B7280]">{ev.cat}</span>
                </div>
                <h3 className="font-serif text-lg text-[#0B132B]">{ev.title}</h3>
                <p className="text-sm text-[#6B7280] mt-1 max-w-2xl">{ev.desc}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {ev.cultures.map((cult) => (
                    <span key={cult} className="text-xs px-2 py-0.5 rounded-full bg-[#D4A373]/10 text-[#D4A373]">{cult}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ExpeditionsSection() {
  const { t } = useTranslate();
  const { data: rawExps } = useExpeditions();
  const exps = localizeList(rawExps, 'expeditions', t);
  return (
    <section className="py-24 bg-[#F8F5F0] scroll-mt-20" id="expeditions">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader overline={t('expeditions.fieldwork')} title={t('expeditions.title')} description={t('expeditions.subtitle')} />
        <div className="grid md:grid-cols-2 gap-6">
          {exps.map((exp) => (
            <div key={exp.id} className="bg-white rounded-xl p-6 border border-[#E8E2D9] hover:shadow-md transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-serif text-lg text-[#0B132B]">{exp.name}</h3>
                  <p className="text-sm text-[#6B7280]">{exp.region}</p>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${exp.status === 'Active' ? 'bg-green-100 text-green-700' : exp.status === 'Planning' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>{exp.status}</span>
              </div>
              <p className="text-sm text-[#6B7280] mb-4">{exp.mission}</p>
              <div className="flex items-center gap-4 text-sm text-[#6B7280]">
                <span>{t('expeditions.lead')}: {exp.lead}</span>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-1"><span className="text-[#6B7280]">{t('expeditions.progress')}</span><span>{exp.progress}%</span></div>
                <div className="w-full h-2 rounded-full bg-[#E8E2D9] overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${exp.progress}%`, background: exp.progress === 100 ? '#059669' : '#D4A373' }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function EmergencySection() {
  const { t } = useTranslate();
  const { data: rawAlerts } = useEmergencyAlerts();
  const alerts = localizeList(rawAlerts, 'emergencyAlerts', t);
  return (
    <section className="py-24 bg-[#0B132B] scroll-mt-20" id="emergency">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-[#DC2626] text-sm font-semibold tracking-widest uppercase">{t('emergency.urgent')}</span>
          <h2 className="text-3xl md:text-4xl font-serif text-white mt-2">{t('emergency.title')}</h2>
          <p className="text-white/60 mt-3 max-w-xl mx-auto">{t('emergency.subtitle')}</p>
        </div>
        <div className="space-y-4">
          {alerts.map((alert) => (
            <div key={alert.id} className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-all duration-300">
              <div className="flex items-start gap-4">
                <span className={`text-xs px-3 py-1 rounded-full font-medium flex-shrink-0 mt-0.5 ${alert.severity === 'Critical' ? 'bg-red-500/20 text-red-300' : alert.severity === 'High' ? 'bg-orange-500/20 text-orange-300' : 'bg-yellow-500/20 text-yellow-300'}`}>{alert.severity}</span>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="font-serif text-base text-white">{alert.title}</h3>
                    <span className="text-xs text-white/40 flex-shrink-0">{alert.date}</span>
                  </div>
                  <p className="text-sm text-white/60 mt-2">{alert.desc}</p>
                  <div className="flex items-center gap-3 mt-3 text-xs text-white/40">
                    <span>{alert.region}</span>
                    <span>{alert.culture}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ArtForPreservationSection() {
  const { t } = useTranslate();
  const { data: rawCampaigns } = useArtCampaigns();
  const campaigns = localizeList(rawCampaigns, 'artCampaigns', t);
  return (
    <section className="py-24 bg-white scroll-mt-20" id="art">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader overline={t('art.support')} title={t('art.title')} description={t('art.subtitle')} />
        <div className="grid md:grid-cols-3 gap-6">
          {campaigns.map((c) => (
            <div key={c.id} className="bg-[#F8F5F0] rounded-xl overflow-hidden border border-[#E8E2D9] hover:shadow-lg transition-all duration-300 group">
              <div className="aspect-[4/3] flex items-center justify-center text-6xl" style={{ background: c.col + '15' }}>{c.emoji}</div>
              <div className="p-5">
                <h3 className="font-serif text-lg text-[#0B132B] group-hover:text-[#D4A373] transition-colors">{c.title}</h3>
                <p className="text-xs text-[#6B7280] mt-1">by {c.artist} &middot; {c.culture}</p>
                <p className="text-sm text-[#6B7280] mt-2">{c.desc}</p>
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-[#6B7280]">${c.raised.toLocaleString()} {t('art.raised')}</span>
                    <span className="font-medium text-[#0B132B]">${c.goal.toLocaleString()} {t('art.goal')}</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#E8E2D9] overflow-hidden">
                    <div className="h-full rounded-full bg-[#D4A373]" style={{ width: `${Math.min(100, (c.raised / c.goal) * 100)}%` }} />
                  </div>
                  <p className="text-xs text-[#6B7280] mt-2">{c.backers} {t('art.backers')}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FeaturedCulturesSection() {
  const { t } = useTranslate();
  const { data: rawCultures } = useCultures();
  const cultures = localizeList(rawCultures, 'cultures', t);
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader overline={t('cultures.explore')} title={t('cultures.title')} href="/cultures" />
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cultures.slice(0, 4).map((culture) => (
            <Link key={culture._id} href={`/cultures/${culture.slug}`} className="group block">
              <div className="aspect-[3/4] rounded-xl overflow-hidden relative border border-[#E8E2D9] hover:shadow-card transition-all duration-300">
                <div className="absolute inset-0 flex items-center justify-center text-7xl bg-[#F8F5F0] group-hover:scale-105 transition-transform duration-700">{culture.flag}</div>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0B132B] via-[#0B132B]/60 to-transparent p-5 pt-12">
                  <h3 className="font-serif text-xl text-white group-hover:text-[#D4A373] transition-colors">{culture.name}</h3>
                  <p className="text-sm text-white/60 mt-1">{culture.region}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HeritageMapSection() {
  const { t } = useTranslate();
  const { data: rawPoints } = useMapPoints();
  const points = localizeList(rawPoints, 'mapPoints', t);
  return (
    <section className="py-24 bg-[#0B132B] scroll-mt-20" id="map">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-[#D4A373] text-sm font-semibold tracking-widest uppercase">{t('hero.explore')}</span>
          <h2 className="text-3xl md:text-4xl font-serif text-white mt-2">{t('map.title')}</h2>
          <p className="text-white/60 mt-3 max-w-xl mx-auto">{t('map.subtitle')}</p>
        </div>
        <div className="relative w-full aspect-[21/9] rounded-xl overflow-hidden bg-[#1C2541] border border-white/10">
          <div className="absolute inset-0 p-4">
            <svg viewBox="0 0 100 50" className="w-full h-full opacity-30">
              <path d="M10 25 Q20 15, 30 20 Q40 25, 50 18 Q60 12, 70 20 Q80 28, 90 22" fill="none" stroke="#D4A373" strokeWidth="0.3" />
              {[...Array(30)].map((_, i) => (
                <circle key={i} cx={Math.random() * 100} cy={Math.random() * 50} r={0.3} fill="#D4A373" opacity={0.3} />
              ))}
            </svg>
          </div>
          <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-2 p-6">
            {points.map((p) => (
              <div key={p.id} className="bg-white/10 backdrop-blur-sm rounded-lg p-2 text-center border border-white/10 hover:bg-white/20 transition-all duration-200 cursor-pointer">
                <span className="text-xl">{p.emoji}</span>
                <p className="text-white text-xs mt-1 font-medium">{p.name}</p>
                <p className="text-white/40 text-[10px]">{p.culture}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function NewsSection() {
  const { t } = useTranslate();
  const { data: rawArticles } = useNews();
  const articles = localizeList(rawArticles, 'newsArticles', t);
  return (
    <section className="py-24 bg-[#F8F5F0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader overline="Stay Informed" title={t('news.title')} href="/news" />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.slice(0, 6).map((article) => (
            <Link key={article._id} href={`/news/${article.slug}`} className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-card transition-all duration-300 border border-[#E8E2D9]">
              <div className="aspect-video flex items-center justify-center text-5xl bg-[#F8F5F0]">{article.img}</div>
              <div className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="accent" size="sm">{article.categories[0]}</Badge>
                  <span className="text-xs text-[#6B7280] ml-auto">{article.author}</span>
                </div>
                <h3 className="font-serif text-lg text-[#0B132B] group-hover:text-[#D4A373] transition-colors line-clamp-2">{article.title}</h3>
                <p className="text-sm text-[#6B7280] mt-2 line-clamp-2">{article.excerpt}</p>
                <time className="text-xs text-[#6B7280] mt-3 block">{new Date(article.publishedAt).toLocaleDateString()}</time>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
