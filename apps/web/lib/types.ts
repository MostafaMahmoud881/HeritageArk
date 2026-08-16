// ─── Shared Types ─────────────────────────────────────────────────────────────
// Single source of truth for all shared interfaces and types.

// ── AI ────────────────────────────────────────────────────────────────────────

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMResponse {
  content: string;
  provider?: string;
  usage?: { promptTokens: number; completionTokens: number };
}

export type AIProvider = 'groq' | 'ollama' | 'openrouter' | 'openai' | 'gemini' | 'local';

// ── Auth ──────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin' | 'moderator';
  avatar?: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

// ── API ───────────────────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ── Cart ──────────────────────────────────────────────────────────────────────

export interface CartItem {
  id: string;
  name: string;
  price: number;
  emoji: string;
  origin: string;
  artisan: string;
  qty: number;
  flag: string;
}

// ── Museum / Avatar ───────────────────────────────────────────────────────────

export interface AvatarConfig {
  name: string;
  skinColor: string;
  hairColor: string;
  shirtColor: string;
  photoUrl?: string;
}

// ── Heritage ──────────────────────────────────────────────────────────────────

export interface HeritageSite {
  id: string;
  name: string;
  culture: string;
  cultureId: string;
  lat: number;
  lng: number;
  emoji: string;
  color: string;
  type: string;
  period: string;
  description: string;
}

// ── UI ────────────────────────────────────────────────────────────────────────

export type Locale = 'en' | 'ar' | 'fr' | 'it' | 'ber';

export type ThemeMode = 'light' | 'dark';

export interface NavItem {
  href: string;
  label: string;
  icon?: string;
}
