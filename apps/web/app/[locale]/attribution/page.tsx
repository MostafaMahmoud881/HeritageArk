'use client';

const CREDITS = [
  {
    category: 'Imagery',
    items: [
      'Cultural heritage and landscape photography sourced from open-license libraries such as Unsplash, Pexels, and Wikimedia Commons.',
      'AI-generated illustrations are produced within the platform and used for educational visualization only.',
    ],
  },
  {
    category: 'Maps & Geospatial Data',
    items: [
      'Interactive maps powered by Mapbox GL.',
      'Base map data © OpenStreetMap contributors, available under the Open Database License (ODbL).',
    ],
  },
  {
    category: 'Cultural Content',
    items: [
      'Heritage descriptions, oral histories, and traditions are documented in collaboration with cultural communities and public heritage archives.',
      'Where content originates from a specific community or source, attribution is provided alongside the material.',
    ],
  },
  {
    category: 'Open Source',
    items: [
      'Built with Next.js, React, Prisma, and Tailwind CSS.',
      'Icons and UI elements from open-source design systems.',
    ],
  },
];

export default function AttributionPage() {
  return (
    <div className="min-h-screen bg-bg pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-4">
        <span className="text-accent text-sm font-semibold tracking-widest uppercase">Legal</span>
        <h1 className="text-4xl font-serif text-navy mt-2 mb-4">Image & Content Attribution</h1>
        <p className="text-muted mb-10 leading-relaxed">
          HeritageArk is committed to respecting the rights of creators and cultural communities.
          Below are the sources and licenses for the media and data used across the platform.
        </p>

        <div className="space-y-8">
          {CREDITS.map((credit) => (
            <section key={credit.category}>
              <h2 className="text-xl font-serif text-navy mb-3">{credit.category}</h2>
              <ul className="space-y-2">
                {credit.items.map((item, i) => (
                  <li key={i} className="text-muted leading-relaxed flex items-start gap-2">
                    <span className="text-accent mt-1">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <p className="text-sm text-muted mt-12">
          If you believe any content has been used incorrectly or without proper attribution,
          please reach out via the contact page and we will address it promptly.
        </p>
      </div>
    </div>
  );
}
