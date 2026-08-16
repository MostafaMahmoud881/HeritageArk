export function generateToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

export function validateToken(token: string, cookieToken: string): boolean {
  if (!token || !cookieToken) return false;
  if (token.length !== 64 || cookieToken.length !== 64) return false;

  let diff = 0;
  for (let i = 0; i < token.length; i++) {
    diff |= token.charCodeAt(i) ^ cookieToken.charCodeAt(i);
  }
  return diff === 0;
}
