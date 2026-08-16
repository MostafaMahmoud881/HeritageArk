'use client';

import { Button, Badge } from '@heritageverse/ui';
import Link from 'next/link';

const FEATURES = [
  {
    emoji: '🌍',
    title: 'Heritage Globe',
    description: 'Explore cultural heritage sites across the world through an interactive 3D globe powered by Mapbox GL.',
    link: '/map',
    gradient: 'from-accent/20 to-accent/10',
  },
  {
    emoji: '🏛️',
    title: 'Virtual Museum',
    description: 'Browse digitized artifacts and cultural exhibits in an immersive virtual museum experience.',
    link: '/museum',
    gradient: 'from-purple-500/20 to-purple-600/10',
  },
  {
    emoji: '🤖',
    title: 'AI Chat',
    description: 'Chat with AI guides trained on cultural heritage data to learn about traditions, languages, and history.',
    link: '/chat',
    gradient: 'from-blue-500/20 to-blue-600/10',
  },
  {
    emoji: '🎬',
    title: 'Reels',
    description: 'Watch and share short-form video content showcasing cultural traditions, crafts, and ceremonies.',
    link: '/reels',
    gradient: 'from-green-500/20 to-green-600/10',
  },
  {
    emoji: '👥',
    title: 'Cultures',
    description: 'Deep-dive into featured cultures with rich multimedia content, language lessons, and historical timelines.',
    link: '/cultures',
    gradient: 'from-gold/20 to-gold/10',
  },
];

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-bg pt-24 pb-16">
      <div className="content-section mb-12">
        <Badge variant="accent" size="sm">Platform Demo</Badge>
        <h1 className="text-4xl md:text-5xl font-serif text-navy mt-4 max-w-3xl">
          Explore the HeritageArk Platform
        </h1>
        <p className="text-muted text-lg mt-4 max-w-2xl">
          Discover how we are preserving cultural heritage through technology. Each feature is designed to educate, engage, and inspire.
        </p>
      </div>

      <div className="content-section">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className={`bg-gradient-to-br ${feature.gradient} bg-white rounded-2xl border border-border/50 p-6 hover:shadow-card transition-all duration-300 group`}
            >
              <span className="text-4xl block mb-4 group-hover:scale-110 transition-transform duration-300">
                {feature.emoji}
              </span>
              <h3 className="text-xl font-serif text-navy mb-2">{feature.title}</h3>
              <p className="text-sm text-muted leading-relaxed mb-6">{feature.description}</p>
              <Link href={feature.link}>
                <Button variant="dark" size="sm">
                  Explore {feature.title}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>

      <div className="content-section mt-16">
        <div className="bg-navy rounded-2xl p-8 md:p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-serif text-white">Ready to Start?</h2>
          <p className="text-white/50 mt-3 max-w-xl mx-auto">
            Join our community of cultural preservationists, language learners, and heritage enthusiasts.
          </p>
          <div className="mt-6 flex flex-wrap gap-4 justify-center">
            <Link href="/auth/register">
              <Button size="lg">Get Started Free</Button>
            </Link>
            <Link href="/about">
              <Button variant="outline" size="lg">Learn More</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
