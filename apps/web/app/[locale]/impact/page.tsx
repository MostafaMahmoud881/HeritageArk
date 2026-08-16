'use client';

import { Badge } from '@heritageverse/ui';

const METRICS = [
  { value: '8+', label: 'Cultures Documented', description: 'Indigenous and endangered cultures thoroughly documented with rich multimedia content.', icon: '👥', gradient: 'from-accent/20 to-accent/5' },
  { value: '4+', label: 'Endangered Languages', description: 'Critically endangered languages with AI-powered documentation and learning tools.', icon: '🗣️', gradient: 'from-blue-500/20 to-blue-600/5' },
  { value: '4+', label: 'Digitized Artifacts', description: 'Cultural artifacts preserved in high-resolution 3D scans and photographs.', icon: '🏺', gradient: 'from-purple-500/20 to-purple-600/5' },
  { value: '4+', label: 'Active Expeditions', description: 'Field research expeditions actively documenting oral histories and traditions.', icon: '🔍', gradient: 'from-green-500/20 to-green-600/5' },
  { value: '10+', label: 'Heritage Sites Mapped', description: 'UNESCO and indigenous heritage sites mapped on the interactive 3D globe.', icon: '🗺️', gradient: 'from-gold/20 to-gold/5' },
  { value: '25K+', label: 'Language Learners Served', description: 'Learners worldwide using our AI-powered tools (Sámi language example).', icon: '🎓', gradient: 'from-red-500/20 to-red-600/5' },
];

const SDG_ALIGNMENT = [
  { number: '4', title: 'Quality Education', description: 'AI-powered language learning platforms make education accessible for endangered language communities.', icon: '📚' },
  { number: '10', title: 'Reduced Inequalities', description: 'Digital preservation ensures marginalized cultures have equal representation in the global heritage narrative.', icon: '⚖️' },
  { number: '11', title: 'Sustainable Cities & Communities', description: 'Protecting cultural heritage strengthens community identity and supports sustainable cultural tourism.', icon: '🏛️' },
  { number: '16', title: 'Peace, Justice & Strong Institutions', description: 'Cultural documentation supports indigenous rights, intercultural dialogue, and institutional capacity building.', icon: '🕊️' },
];

const METHODOLOGY_STEPS = [
  { step: '01', title: 'Field Documentation', description: 'Trained anthropologists and linguists conduct field research, recording oral histories, traditions, and language samples.' },
  { step: '02', title: 'Digital Preservation', description: 'High-resolution digitization of artifacts, documents, and recordings using professional-grade equipment and standards.' },
  { step: '03', title: 'AI Enhancement', description: 'Machine learning models process and enhance collected data — translating, generating pronunciation guides, and creating educational content.' },
  { step: '04', title: 'Community Access', description: 'Preserved heritage is made accessible to source communities and global audiences through interactive platform features.' },
];

export default function ImpactPage() {
  return (
    <div className="min-h-screen bg-bg pt-24 pb-16">
      <div className="content-section mb-16">
        <Badge variant="accent" size="sm">Impact Dashboard</Badge>
        <h1 className="text-4xl md:text-5xl font-serif text-navy mt-4 max-w-3xl">
          Our Global Impact
        </h1>
        <p className="text-muted text-lg mt-4 max-w-2xl">
          Measurable outcomes in cultural preservation, language documentation, and community engagement worldwide.
        </p>
      </div>

      <div className="content-section mb-20">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {METRICS.map((metric) => (
            <div
              key={metric.label}
              className={`bg-gradient-to-br ${metric.gradient} bg-white rounded-2xl border border-border/50 p-6 hover:shadow-card transition-all duration-300`}
            >
              <div className="flex items-start justify-between mb-4">
                <span className="text-3xl">{metric.icon}</span>
              </div>
              <p className="text-4xl font-bold text-navy">{metric.value}</p>
              <p className="font-semibold text-navy mt-1">{metric.label}</p>
              <p className="text-sm text-muted mt-2 leading-relaxed">{metric.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-navy py-20">
        <div className="content-section">
          <div className="text-center mb-12">
            <Badge variant="gold" size="sm">Global Goals</Badge>
            <h2 className="text-3xl font-serif text-white mt-4">SDG Alignment</h2>
            <p className="text-white/50 mt-3 max-w-2xl mx-auto">
              Our work directly contributes to four United Nations Sustainable Development Goals.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {SDG_ALIGNMENT.map((sdg) => (
              <div key={sdg.number} className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6 hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">{sdg.icon}</span>
                  <span className="text-accent text-xs font-bold tracking-wider">SDG {sdg.number}</span>
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
            <Badge variant="accent" size="sm">Our Process</Badge>
            <h2 className="text-3xl font-serif text-navy mt-4">Cultural Preservation Methodology</h2>
            <p className="text-muted mt-3 max-w-2xl mx-auto">
              A rigorous, community-centered approach to documenting and preserving cultural heritage.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {METHODOLOGY_STEPS.map((step) => (
              <div key={step.step} className="relative">
                <div className="bg-white rounded-2xl border border-border p-6 hover:shadow-card transition-shadow">
                  <span className="text-accent/30 text-5xl font-serif font-bold">{step.step}</span>
                  <h3 className="text-lg font-serif text-navy mt-2 mb-2">{step.title}</h3>
                  <p className="text-sm text-muted leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
