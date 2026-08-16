'use client';

import { Badge, Button } from '@heritageverse/ui';
import Link from 'next/link';

const TECH_STACK = [
  { name: 'Next.js 14', description: 'App Router, Server Components, and Streaming SSR for optimal performance and SEO.', icon: '⚡' },
  { name: 'TypeScript', description: 'End-to-end type safety across frontend, backend, and database layers.', icon: '🔷' },
  { name: 'Mapbox GL', description: 'Interactive 3D globe visualizing heritage sites with custom markers and cultural data layers.', icon: '🌐' },
  { name: 'Prisma + PostgreSQL', description: 'Type-safe database ORM with relational data modeling for complex cultural heritage data.', icon: '🗄️' },
  { name: 'AI Integration', description: 'OpenAI and custom ML models for translation, pronunciation, and educational content generation.', icon: '🧠' },
  { name: 'i18n with RTL', description: 'Full internationalization supporting English, Arabic, French, and more with RTL layout support.', icon: '🌍' },
];

const INNOVATIONS = [
  {
    title: 'AI-Powered Language Learning',
    description: 'Neural machine translation and TTS models trained on low-resource endangered languages enable interactive language preservation and learning experiences.',
    icon: '🗣️',
  },
  {
    title: '3D Heritage Globe',
    description: 'Custom Mapbox GL implementation with immersive 3D globe visualization, cultural site markers, and spatial data exploration.',
    icon: '🌍',
  },
  {
    title: 'Virtual Museum',
    description: 'Digitally preserved artifacts and exhibits presented in an engaging virtual environment with rich metadata and storytelling.',
    icon: '🏛️',
  },
];

const IMPACTS = [
  {
    metric: '8+',
    label: 'Cultures Documented',
    detail: 'In-depth multimedia documentation of indigenous and endangered cultures worldwide.',
    icon: '👥',
  },
  {
    metric: '4+',
    label: 'Endangered Languages',
    detail: 'AI-assisted documentation and learning tools for critically endangered languages.',
    icon: '🗣️',
  },
  {
    metric: '4+',
    label: 'Digitized Artifacts',
    detail: 'High-resolution 3D scans and photographs of cultural artifacts preserved for future generations.',
    icon: '🏺',
  },
  {
    metric: '2+',
    label: 'Active Expeditions',
    detail: 'Field research expeditions documenting oral histories, traditions, and heritage sites.',
    icon: '🔍',
  },
];

export default function JudgesPage() {
  return (
    <div className="min-h-screen bg-bg pt-24 pb-16">
      <div className="content-section mb-16">
        <Badge variant="accent" size="sm">Competition Entry</Badge>
        <h1 className="text-4xl md:text-5xl font-serif text-navy mt-4 max-w-3xl">
          HeritageArk Platform
        </h1>
        <p className="text-muted text-lg mt-4 max-w-2xl leading-relaxed">
          An AI-powered platform dedicated to documenting, preserving, and revitalizing endangered indigenous languages, cultural traditions, and heritage sites worldwide.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/demo">
            <Button variant="primary">View Demo</Button>
          </Link>
          <Link href="/about">
            <Button variant="outline">About the Project</Button>
          </Link>
        </div>
      </div>

      <div className="bg-navy py-20">
        <div className="content-section">
          <div className="text-center mb-12">
            <Badge variant="gold" size="sm">Architecture</Badge>
            <h2 className="text-3xl font-serif text-white mt-4">Technical Architecture</h2>
            <p className="text-white/50 mt-3 max-w-2xl mx-auto">
              Modern, scalable stack designed for global heritage preservation.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {TECH_STACK.map((tech) => (
              <div key={tech.name} className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-5 hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{tech.icon}</span>
                  <h3 className="text-white font-semibold">{tech.name}</h3>
                </div>
                <p className="text-white/50 text-sm leading-relaxed">{tech.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="py-20">
        <div className="content-section">
          <div className="text-center mb-12">
            <Badge variant="accent" size="sm">Innovation</Badge>
            <h2 className="text-3xl font-serif text-navy mt-4">Innovation Highlights</h2>
            <p className="text-muted mt-3 max-w-2xl mx-auto">
              Pushing the boundaries of cultural preservation through cutting-edge technology.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {INNOVATIONS.map((item) => (
              <div key={item.title} className="bg-white rounded-2xl border border-border p-6 hover:shadow-card transition-shadow">
                <span className="text-3xl block mb-4">{item.icon}</span>
                <h3 className="text-lg font-serif text-navy mb-3">{item.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-navy to-navy2 py-20">
        <div className="content-section">
          <div className="text-center mb-12">
            <Badge variant="gold" size="sm">Impact</Badge>
            <h2 className="text-3xl font-serif text-white mt-4">Measurable Impact</h2>
            <p className="text-white/50 mt-3 max-w-2xl mx-auto">
              Tangible results in cultural preservation and community engagement.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {IMPACTS.map((item) => (
              <div key={item.label} className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6 text-center hover:bg-white/10 transition-colors">
                <span className="text-3xl block mb-3">{item.icon}</span>
                <p className="text-3xl font-bold text-accent">{item.metric}</p>
                <p className="text-white font-semibold mt-1">{item.label}</p>
                <p className="text-white/50 text-sm mt-2 leading-relaxed">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
