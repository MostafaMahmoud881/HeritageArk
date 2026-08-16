// API Request/Response Types

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface APIError {
  message: string;
  code: string;
  status: number;
  details?: Record<string, string[]>;
}

// Auth
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    avatar: string | null;
  };
  token: string;
  refreshToken: string;
}

// Cultures
export interface CultureListParams {
  page?: number;
  limit?: number;
  region?: string;
  search?: string;
}

// News
export interface NewsListParams {
  page?: number;
  limit?: number;
  category?: string;
  source?: string;
  tag?: string;
  cultureId?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  trending?: boolean;
}

// Artifacts
export interface ArtifactListParams {
  page?: number;
  limit?: number;
  cultureId?: string;
  status?: string;
  search?: string;
}

// Search
export interface SearchParams {
  q: string;
  type?: 'all' | 'cultures' | 'artifacts' | 'documentaries' | 'news' | 'crafts';
  page?: number;
  limit?: number;
}

export interface SearchResult {
  id: string;
  type: string;
  title: string;
  description: string;
  url: string;
  image: string | null;
  cultureName?: string;
  score: number;
}
