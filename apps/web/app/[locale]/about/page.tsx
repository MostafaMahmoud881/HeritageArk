'use client';

import { Badge } from '@heritageverse/ui';

const SDGS = [
  { number: '4', title: 'Quality Education', description: 'Providing AI-powered language learning tools to preserve and teach endangered languages to new generations.', icon: '📚' },
  { number: '10', title: 'Reduced Inequalities', description: 'Amplifying marginalized voices by documenting underrepresented cultures and ensuring equitable access to heritage knowledge.', icon: '⚖️' },
  { number: '11', title: 'Sustainable Cities & Communities', description: 'Digitally preserving heritage sites and cultural traditions that define community identity and sustainable tourism.', icon: '🏛️' },
  { number: '16', title: 'Peace, Justice & Strong Institutions', description: 'Strengthening cultural institutions through technology, fostering intercultural dialogue, and protecting cultural rights.', icon: '🕊️' },
];

const METRICS = [
  { value: '4+', label: 'Languages Documented', icon: '🗣️' },
  { value: '8+', label: 'Cultures Featured', icon: '🌍' },
  { value: '4+', label: 'Artifacts Digitized', icon: '🏺' },
  { value: '2+', label: 'Active Expeditions', icon: '🔍' },
];

const AI_FEATURES = [
  { title: 'Translation', description: 'Neural machine translation models trained on low-resource languages enable real-time translation of heritage content across multiple languages.', icon: '🌐' },
  { title: 'Pronunciation', description: 'Text-to-speech AI generates authentic pronunciation guides for endangered languages, helping learners hear correct phonetics.', icon: '🔊' },
  { title: 'Content Generation', description: 'LLM-powered tools assist in creating educational content, digitizing oral histories, and generating metadata for cultural artifacts.', icon: '✨' },
];

const ARCHITECTURE = [
  { name: 'Next.js 14', role: 'Frontend Framework', color: 'from-black/20 to-black/10' },
  { name: 'Prisma', role: 'Database ORM', color: 'from-accent/20 to-accent/10' },
  { name: 'PostgreSQL', role: 'Database', color: 'from-blue-500/20 to-blue-600/10' },
  { name: 'Mapbox GL', role: '3D Globe', color: 'from-green-500/20 to-green-600/10' },
  { name: 'AI Integration', role: 'OpenAI & Custom Models', color: 'from-purple-500/20 to-purple-600/10' },
  { name: 'i18n', role: 'Multi-language Support', color: 'from-gold/20 to-gold/10' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-bg pt-24 pb-16">
      <div className="content-section mb-16">
        <Badge variant="accent" size="sm">About Us</Badge>
        <h1 className="text-4xl md:text-5xl font-serif text-navy mt-4 max-w-3xl">
          Preserving Heritage for Future Generations
        </h1>
        <p className="text-muted text-lg mt-4 max-w-2xl leading-relaxed">
          HeritageArk is an AI-powered platform dedicated to documenting, preserving, and revitalizing endangered indigenous languages, cultural traditions, and heritage sites worldwide.
        </p>
      </div>

      <div className="bg-navy py-20">
        <div className="content-section">
          <div className="text-center mb-12">
            <Badge variant="gold" size="sm">UN Sustainable Development Goals</Badge>
            <h2 className="text-3xl font-serif text-white mt-4">Aligned with Global Impact</h2>
            <p className="text-white/50 mt-3 max-w-2xl mx-auto">
              Our mission directly supports four key UN SDGs through technology-driven cultural preservation.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {SDGS.map((sdg) => (
              <div key={sdg.number} className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6 hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">{sdg.icon}</span>
                  <span className="text-accent text-sm font-bold tracking-wider">SDG {sdg.number}</span>
                </div>
                <h3 className="text-white font-semibold mb-2">{sdg.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{sdg.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="py-20">
        <div className="content-section">
          <div className="text-center mb-12">
            <Badge variant="accent" size="sm">Impact Metrics</Badge>
            <h2 className="text-3xl font-serif text-navy mt-4">Cultural Preservation Impact</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {METRICS.map((metric) => (
              <div key={metric.label} className="bg-white rounded-2xl border border-border p-6 text-center hover:shadow-card transition-shadow">
                <span className="text-4xl block mb-3">{metric.icon}</span>
                <p className="text-3xl font-bold text-navy">{metric.value}</p>
                <p className="text-sm text-muted mt-1">{metric.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-navy to-navy2 py-20">
        <div className="content-section">
          <div className="text-center mb-12">
            <Badge variant="gold" size="sm">AI Technology</Badge>
            <h2 className="text-3xl font-serif text-white mt-4">AI Impact on Preservation</h2>
            <p className="text-white/50 mt-3 max-w-2xl mx-auto">
              Artificial intelligence accelerates the documentation and revival of endangered cultural heritage at scale.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {AI_FEATURES.map((feature) => (
              <div key={feature.title} className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6 hover:bg-white/10 transition-colors">
                <span className="text-3xl block mb-4">{feature.icon}</span>
                <h3 className="text-white font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="py-20">
        <div className="content-section">
          <div className="text-center mb-12">
            <Badge variant="accent" size="sm">Technology Stack</Badge>
            <h2 className="text-3xl font-serif text-navy mt-4">Architecture Overview</h2>
            <p className="text-muted mt-3 max-w-2xl mx-auto">
              Built on a modern, scalable stack to support global heritage preservation efforts.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ARCHITECTURE.map((tech) => (
              <div key={tech.name} className={`bg-gradient-to-br ${tech.color} rounded-xl border border-border/50 p-5 hover:shadow-card transition-shadow`}>
                <p className="font-semibold text-navy">{tech.name}</p>
                <p className="text-sm text-muted mt-1">{tech.role}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
