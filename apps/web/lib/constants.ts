export const MIN_PASSWORD_LENGTH = 8;
export const MAX_PASSWORD_LENGTH = 128;
export const MIN_NAME_LENGTH = 1;
export const MAX_NAME_LENGTH = 100;
export const MAX_EMAIL_LENGTH = 254;

export const RATE_LIMIT = {
  AUTH_LOGIN_MAX: 5,
  AUTH_LOGIN_WINDOW_MS: 15 * 60 * 1000,
  AUTH_REGISTER_MAX: 3,
  AUTH_REGISTER_WINDOW_MS: 60 * 60 * 1000,
  AUTH_FORGOT_PASSWORD_MAX: 3,
  AUTH_FORGOT_PASSWORD_WINDOW_MS: 60 * 60 * 1000,
  API_GLOBAL_MAX: 100,
  API_GLOBAL_WINDOW_MS: 60 * 1000,
} as const;

export const TOKEN_EXPIRY = {
  ACCESS_TOKEN: '15m',
  REFRESH_TOKEN: '7d',
  RESET_TOKEN: '1h',
} as const;

export const UPLOAD = {
  MAX_FILE_SIZE: 50 * 1024 * 1024,
  ALLOWED_IMAGES: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif', 'image/avif'] as readonly string[],
  ALLOWED_VIDEOS: ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska', 'video/mpeg', 'video/3gpp', 'video/ogg'] as readonly string[],
  ALLOWED_DOCUMENTS: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'] as readonly string[],
};
