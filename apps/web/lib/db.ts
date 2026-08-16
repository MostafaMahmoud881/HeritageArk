import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), '.data', 'db.json');

export interface Article {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  category: string;
  status: 'draft' | 'published' | 'scheduled';
  author: string;
  tags: string[];
  image?: string;
  scheduledDate?: string;
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: string;
  avatar?: string;
  emailVerified: boolean;
  createdAt: string;
  lastLogin?: string;
}

export interface NewsletterSubscription {
  email: string;
  subscribedAt: string;
}

export interface MediaItem {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  tags: string[];
  copyright: string;
  uploadDate: string;
}

interface DB {
  users: User[];
  articles: Article[];
  categories: string[];
  mediaItems: MediaItem[];
  auditLogs: { id: string; user: string; action: string; date: string }[];
  newsletterSubscriptions: NewsletterSubscription[];
}

function getDefaultDB(): DB {
  return {
    users: [],
    articles: [
      { id: '1', title: 'UNESCO Adds Three New Languages to Critically Endangered List', content: 'The latest UNESCO Atlas update flags three additional languages...', excerpt: 'The latest UNESCO Atlas update flags three additional languages...', category: 'Policy', status: 'published', author: 'HeritageArk Editorial', tags: ['UNESCO', 'languages', 'endangered'], createdAt: '2026-06-22T00:00:00Z', updatedAt: '2026-06-22T00:00:00Z', version: 1 },
      { id: '2', title: 'Field Notes: Inside the Aswan Oral History Recovery Mission', content: 'Our lead researcher reports from the field...', excerpt: 'Our lead researcher reports from the field...', category: 'Expedition', status: 'published', author: 'Dr. Layla Haddad', tags: ['Nubian', 'oral history', 'Aswan'], createdAt: '2026-06-20T00:00:00Z', updatedAt: '2026-06-20T00:00:00Z', version: 1 },
      { id: '3', title: 'Why Kente Cloth Color Symbolism Is More Complex Than You Think', content: 'A deep dive into the proverb-encoding system...', excerpt: 'A deep dive into the proverb-encoding system...', category: 'Culture', status: 'draft', author: 'Tariq Osman', tags: ['Kente', 'Akan', 'textiles'], createdAt: '2026-06-17T00:00:00Z', updatedAt: '2026-06-17T00:00:00Z', version: 1 },
    ],
    categories: ['Policy', 'Culture', 'Expedition', 'Partnership', 'Opinion', 'Research'],
    mediaItems: [],
    auditLogs: [],
    newsletterSubscriptions: [],
  };
}

let db: DB | null = null;

function load(): DB {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch {}
  return getDefaultDB();
}

function save() {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2));
  } catch {}
}

export function getDB(): DB {
  if (!db) db = load();
  return db;
}

export function resetDB() {
  db = getDefaultDB();
  save();
}

// Users
export function findUserByEmail(email: string) {
  return getDB().users.find(u => u.email === email);
}

export function findUserById(id: string) {
  return getDB().users.find(u => u.id === id);
}

export function createUser(name: string, email: string, password: string, role = 'member') {
  const user: User = {
    id: String(Date.now()),
    name, email, password, role,
    emailVerified: false,
    createdAt: new Date().toISOString(),
  };
  getDB().users.push(user);
  save();
  return user;
}

export function updateUser(id: string, updates: Partial<User>) {
  const idx = getDB().users.findIndex(u => u.id === id);
  if (idx === -1) return null;
  const existing = getDB().users[idx];
  if (!existing) return null;
  getDB().users[idx] = { ...existing, ...updates } as User;
  save();
  return getDB().users[idx];
}

// Articles
export function getArticles() {
  return getDB().articles;
}

export function getArticle(id: string) {
  return getDB().articles.find(a => a.id === id);
}

export function createArticle(data: Omit<Article, 'id' | 'createdAt' | 'updatedAt' | 'version'>) {
  const article: Article = {
    ...data,
    id: String(Date.now()),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: 1,
  };
  getDB().articles.unshift(article);
  save();
  return article;
}

export function updateArticle(id: string, data: Partial<Article>) {
  const idx = getDB().articles.findIndex(a => a.id === id);
  if (idx === -1) return null;
  const existing = getDB().articles[idx];
  if (!existing) return null;
  getDB().articles[idx] = {
    ...existing,
    ...data,
    updatedAt: new Date().toISOString(),
    version: (existing.version || 0) + 1,
  } as Article;
  save();
  return getDB().articles[idx];
}

export function deleteArticle(id: string) {
  const idx = getDB().articles.findIndex(a => a.id === id);
  if (idx === -1) return false;
  getDB().articles.splice(idx, 1);
  save();
  return true;
}

// Categories
export function getCategories() {
  return getDB().categories;
}

export function addCategory(name: string) {
  if (!getDB().categories.includes(name)) {
    getDB().categories.push(name);
    save();
  }
  return getDB().categories;
}

export function deleteCategory(name: string) {
  const idx = getDB().categories.indexOf(name);
  if (idx === -1) return false;
  getDB().categories.splice(idx, 1);
  save();
  return true;
}

// Media
export function getMediaItems() {
  return getDB().mediaItems;
}

export function addMediaItem(item: MediaItem) {
  getDB().mediaItems.unshift(item);
  save();
  return item;
}

export function deleteMediaItem(id: string) {
  const idx = getDB().mediaItems.findIndex(m => m.id === id);
  if (idx === -1) return false;
  getDB().mediaItems.splice(idx, 1);
  save();
  return true;
}

// Newsletter
export function addNewsletterSubscription(email: string) {
  const db = getDB();
  if (!db.newsletterSubscriptions.some(s => s.email === email)) {
    db.newsletterSubscriptions.push({ email, subscribedAt: new Date().toISOString() });
    save();
  }
}

// Audit
export function addAuditLog(user: string, action: string) {
  getDB().auditLogs.unshift({ id: String(Date.now()), user, action, date: new Date().toISOString() });
  save();
}
