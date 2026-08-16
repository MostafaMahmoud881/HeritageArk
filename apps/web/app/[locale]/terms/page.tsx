'use client';

const SECTIONS = [
  {
    title: 'Acceptance of Terms',
    body: 'By accessing or using HeritageArk, you agree to be bound by these Terms of Service. If you do not agree, please do not use the platform.',
  },
  {
    title: 'Use of the Platform',
    body: 'HeritageArk is provided for educational and cultural preservation purposes. You agree to use it lawfully and respectfully, and not to misuse, disrupt, or attempt to gain unauthorized access to the service.',
  },
  {
    title: 'User Content',
    body: 'You retain ownership of content you submit. By submitting content, you grant HeritageArk a non-exclusive license to host and display it for the purpose of operating the platform. You are responsible for ensuring you have the rights to share any content you upload.',
  },
  {
    title: 'Cultural Respect',
    body: 'Content related to indigenous and cultural heritage must be shared and used with respect for the originating communities. Misrepresentation or misuse of cultural materials is prohibited.',
  },
  {
    title: 'Intellectual Property',
    body: 'The platform, including its design, software, and original content, is protected by intellectual property laws. Attribution requirements for third-party materials are listed on the Attribution page.',
  },
  {
    title: 'Disclaimer & Limitation of Liability',
    body: 'HeritageArk is provided "as is" without warranties of any kind. To the fullest extent permitted by law, we are not liable for any damages arising from your use of the platform.',
  },
  {
    title: 'Changes to These Terms',
    body: 'We may update these Terms from time to time. Continued use of the platform after changes take effect constitutes acceptance of the revised Terms.',
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-bg pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-4">
        <span className="text-accent text-sm font-semibold tracking-widest uppercase">Legal</span>
        <h1 className="text-4xl font-serif text-navy mt-2 mb-2">Terms of Service</h1>
        <p className="text-muted mb-10">Last updated: {new Date().getFullYear()}</p>

        <div className="space-y-8">
          {SECTIONS.map((section) => (
            <section key={section.title}>
              <h2 className="text-xl font-serif text-navy mb-2">{section.title}</h2>
              <p className="text-muted leading-relaxed">{section.body}</p>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
