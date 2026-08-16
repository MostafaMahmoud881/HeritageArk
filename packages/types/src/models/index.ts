export interface MediaAttribution {
  source: string;
  license: string;
  creator?: string;
  creatorUrl?: string;
  sourceUrl?: string;
}

export interface MediaRef {
  url: string;
  alt?: string;
  attribution?: MediaAttribution;
}

export interface MediaAsset {
  _id: string;
  originalName: string;
  mimeType: string;
  size: number;
  urls: {
    original?: string;
    webp?: string;
    avif?: string;
    thumbnail?: string;
    blurHash?: string;
  };
  attribution: MediaAttribution;
  metadata: Record<string, unknown>;
  status: 'pending' | 'processing' | 'ready' | 'failed';
  createdAt: string;
  updatedAt: string;
}

export interface Culture {
  _id: string;
  name: string;
  nativeName?: string;
  slug: string;
  region: string;
  summary: string;
  description: string;
  thumbnail?: MediaRef;
  timeline?: { year: number; event: string }[];
  artifacts: string[];
  documentaries: string[];
  languages: string[];
  traditions: string[];
  status: 'draft' | 'published';
  featured: boolean;
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface Artifact {
  _id: string;
  name: string;
  slug: string;
  culture: string;
  era: string;
  century?: string;
  category: string;
  material?: string;
  description: string;
  summary: string;
  images: MediaAsset[];
  location?: string;
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
}

export interface Documentary {
  _id: string;
  title: string;
  slug: string;
  culture: string;
  year: number;
  duration: number;
  summary: string;
  description: string;
  poster: MediaAsset;
  chapters: { title: string; timestamp: number }[];
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
}

export interface NewsArticle {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  source: string;
  sourceUrl: string;
  image?: MediaRef;
  categories: string[];
  tags: string[];
  relatedCultures: string[];
  publishedAt: string;
  trending?: {
    score: number;
    keywords: string[];
  };
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
}

export interface Expedition {
  _id: string;
  title: string;
  slug: string;
  region: string;
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  description: string;
  startDate: string;
  participants: { name: string; role: string }[];
  images: MediaAsset[];
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
}

export interface Language {
  _id: string;
  name: string;
  nativeName: string;
  slug: string;
  culture: string;
  speakerCount: number;
  region: string;
  status: 'living' | 'endangered' | 'extinct' | 'revived';
  createdAt: string;
  updatedAt: string;
}

export interface Story {
  _id: string;
  title: string;
  slug: string;
  culture: string;
  author: string;
  excerpt: string;
  content: string;
  image?: MediaAsset;
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'contributor' | 'curator' | 'admin';
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}
