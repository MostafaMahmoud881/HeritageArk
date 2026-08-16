import { NextRequest, NextResponse } from 'next/server';

/**
 * Generates a consistent SVG placeholder for artifacts based on their name and culture.
 * This provides a visual placeholder that's better than emojis or empty boxes.
 */

const CULTURE_COLORS: Record<string, { primary: string; secondary: string }> = {
  nubian: { primary: '#8B4513', secondary: '#D4A373' },
  amazigh: { primary: '#1B6CA8', secondary: '#3DA5D9' },
  kurdish: { primary: '#2D6A4F', secondary: '#59B87A' },
  sami: { primary: '#4A4E69', secondary: '#7B8CB8' },
  mayan: { primary: '#6B3FA0', secondary: '#9B5DE5' },
  andean: { primary: '#B5421A', secondary: '#E76F51' },
  akan: { primary: '#C8960C', secondary: '#F4A261' },
  ottoman: { primary: '#8B1A1A', secondary: '#D62828' },
  egyptian: { primary: '#D4A373', secondary: '#E8D5B0' },
  greek: { primary: '#3DA5D9', secondary: '#7EC8E3' },
  roman: { primary: '#9B5DE5', secondary: '#C5A8D4' },
  moroccan: { primary: '#E07A5F', secondary: '#F4A261' },
};

const DEFAULT_COLOR = { primary: '#6B7280', secondary: '#9CA3AF' };

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name') || 'Artifact';
  const culture = searchParams.get('culture') || 'Heritage';
  const size = parseInt(searchParams.get('size') || '400', 10);

  const colors = CULTURE_COLORS[culture.toLowerCase()] || DEFAULT_COLOR;
  const hash = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const initials = name
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${colors.primary}" />
        <stop offset="100%" style="stop-color:${colors.secondary}" />
      </linearGradient>
      <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
        <circle cx="10" cy="10" r="1.5" fill="rgba(255,255,255,0.1)" />
      </pattern>
    </defs>
    <rect width="${size}" height="${size}" fill="url(#bg)" />
    <rect width="${size}" height="${size}" fill="url(#dots)" />
    <text x="${size / 2}" y="${size * 0.42}" text-anchor="middle" fill="rgba(255,255,255,0.85)" font-size="${size * 0.2}" font-family="serif" font-weight="bold">${initials}</text>
    <text x="${size / 2}" y="${size * 0.55}" text-anchor="middle" fill="rgba(255,255,255,0.6)" font-size="${size * 0.06}" font-family="sans-serif">${culture}</text>
    <rect x="${size * 0.15}" y="${size * 0.65}" width="${size * 0.7}" height="2" rx="1" fill="rgba(255,255,255,0.2)" />
    <text x="${size / 2}" y="${size * 0.78}" text-anchor="middle" fill="rgba(255,255,255,0.4)" font-size="${size * 0.04}" font-family="serif" font-style="italic">Heritage Artifact</text>
  </svg>`;

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}