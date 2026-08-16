import type { MetadataRoute } from 'next';

const locales = ['en', 'ar', 'fr', 'it'] as const;
const baseUrl = 'https://heritageverse.dev';

const staticRoutes = [
  '',
  '/cultures',
  '/news',
  '/chat',
  '/about',
  '/contact',
  '/privacy',
  '/terms',
  '/attribution',
  '/research',
  '/artifacts',
  '/documentaries',
  '/expeditions',
];

const cultureSlugs = [
  'nubian',
  'amazigh',
  'kurdish',
  'sami',
  'mayan',
  'andean',
  'akan',
  'ottoman',
];

const newsSlugs = ['n1', 'n2', 'n3', 'n4', 'n5'];

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    for (const route of staticRoutes) {
      entries.push({
        url: `${baseUrl}/${locale}${route}`,
        lastModified: new Date(),
        changeFrequency: route === '' ? 'weekly' : 'monthly',
        priority: route === '' ? 1.0 : 0.8,
      });
    }

    for (const slug of cultureSlugs) {
      entries.push({
        url: `${baseUrl}/${locale}/cultures/${slug}`,
        lastModified: new Date('2026-06-15'),
        changeFrequency: 'monthly',
        priority: 0.7,
      });
    }

    for (const slug of newsSlugs) {
      entries.push({
        url: `${baseUrl}/${locale}/news/${slug}`,
        lastModified: new Date('2026-06-22'),
        changeFrequency: 'weekly',
        priority: 0.6,
      });
    }
  }

  return entries;
}
