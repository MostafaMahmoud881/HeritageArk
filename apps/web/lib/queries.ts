import { CULTURES, NEWS_ARTICLES, ARTIFACTS, DOCUMENTARIES, LANGUAGES, EXPEDITIONS, STORIES, CRAFTS, GARMENTS, TIMELINE_EVENTS, MAP_POINTS, EMERGENCY_ALERTS, ART_CAMPAIGNS, CULTURE_DETAILS } from './data';
import type { Culture, NewsArticle, Artifact } from '@heritageverse/types';

function delay<T>(data: T, ms = 200): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}

export function useCultures() {
  const data = CULTURES.map((c) => ({
    _id: c.id,
    name: c.name,
    slug: c.id,
    region: c.region,
    summary: CULTURE_DETAILS[c.id]?.summary || '',
    description: CULTURE_DETAILS[c.id]?.description || '',
    thumbnail: { url: '', alt: c.name },
    featured: true,
    status: 'published' as const,
    traditions: CULTURE_DETAILS[c.id]?.traditions || [],
    artifacts: CULTURE_DETAILS[c.id]?.artifacts || [],
    documentaries: [],
    languages: [],
    seo: { title: c.name, description: '', keywords: [] },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    flag: c.flag,
    col: c.col,
  }));
  return { data, isLoading: false, error: null };
}

export function useCulture(slug: string) {
  const c = CULTURES.find((x) => x.id === slug);
  if (!c) return { data: null, isLoading: false, error: new Error('Not found') };
  const detail = CULTURE_DETAILS[slug];
  return {
    data: {
      _id: c.id,
      name: c.name,
      slug: c.id,
      region: c.region,
      summary: detail?.summary || '',
      description: detail?.description || '',
      thumbnail: { url: '', alt: c.name },
      featured: true,
      status: 'published' as const,
      traditions: detail?.traditions || [],
      artifacts: detail?.artifacts || [],
      documentaries: [],
      languages: [],
      seo: { title: c.name, description: '', keywords: [] },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      flag: c.flag,
      col: c.col,
    },
    isLoading: false,
    error: null,
  };
}

export function useArtifacts(cultureSlug?: string) {
  const items = cultureSlug
    ? ARTIFACTS.filter((a) => a.culture.toLowerCase() === cultureSlug.toLowerCase())
    : ARTIFACTS;
  return {
    data: items.map((a) => ({
      _id: a.id,
      name: a.name,
      slug: a.id,
      culture: a.culture,
      era: a.period,
      category: a.culture,
      material: a.material,
      description: a.desc,
      summary: a.desc,
      images: [],
      location: a.loc,
      status: 'published' as const,
      preservationStatus: a.status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      emoji: a.emoji,
      col: a.col,
      museum: a.museum,
      dims: a.dims,
    })),
    isLoading: false,
    error: null,
  };
}

export function useNews() {
  return {
    data: NEWS_ARTICLES.map((a) => ({
      _id: a.id,
      title: a.title,
      slug: a.id,
      excerpt: a.summary,
      content: a.summary,
      source: 'HeritageArk',
      sourceUrl: '#',
      categories: [a.cat],
      tags: [a.cat],
      relatedCultures: [],
      publishedAt: new Date(a.date).toISOString(),
      status: 'published' as const,
      createdAt: new Date(a.date).toISOString(),
      updatedAt: new Date(a.date).toISOString(),
      author: a.author,
      img: a.img,
      cultureId: a.cultureId,
      fashionEvolution: a.fashionEvolution,
      tourItinerary: a.tourItinerary,
      culturalIntelligence: a.culturalIntelligence,
      imagePrompt: a.imagePrompt,
    })),
    isLoading: false,
    error: null,
  };
}

export function useNewsInfinite() {
  return {
    data: { pages: [{ data: useNews().data, total: NEWS_ARTICLES.length }] },
    fetchNextPage: () => {},
    hasNextPage: false,
    isFetchingNextPage: false,
    isLoading: false,
  };
}

export function useTrendingTopics() {
  return {
    data: [...new Set(NEWS_ARTICLES.map((a) => a.cat))],
    isLoading: false,
  };
}

export function useDocumentaries() {
  return { data: DOCUMENTARIES, isLoading: false };
}

export function useLanguages() {
  return { data: LANGUAGES, isLoading: false };
}

export function useExpeditions() {
  return { data: EXPEDITIONS, isLoading: false };
}

export function useStories() {
  return { data: STORIES, isLoading: false };
}

export function useCrafts() {
  return { data: CRAFTS, isLoading: false };
}

export function useGarments() {
  return { data: GARMENTS, isLoading: false };
}

export function useTimelineEvents() {
  return { data: TIMELINE_EVENTS, isLoading: false };
}

export function useMapPoints() {
  return { data: MAP_POINTS, isLoading: false };
}

export function useEmergencyAlerts() {
  return { data: EMERGENCY_ALERTS, isLoading: false };
}

export function useArtCampaigns() {
  return { data: ART_CAMPAIGNS, isLoading: false };
}
