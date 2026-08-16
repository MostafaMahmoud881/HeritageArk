'use client';

const SECTIONS = [
  {
    title: 'Information We Collect',
    body: 'We collect information you provide directly, such as your name and email when you create an account or contact us, as well as content you submit to the platform. We also collect limited technical data (device, browser, and usage information) to operate and improve the service.',
  },
  {
    title: 'How We Use Your Information',
    body: 'Your information is used to provide and personalize the HeritageArk experience, respond to inquiries, maintain security, and improve our cultural preservation tools. We do not sell your personal data.',
  },
  {
    title: 'Cultural Heritage Content',
    body: 'Heritage content, oral histories, and cultural materials are handled with respect for the communities they originate from. Where possible, we follow community-defined access and attribution preferences.',
  },
  {
    title: 'Data Sharing',
    body: 'We share data only with service providers that help us operate the platform, when required by law, or with your consent. These providers are bound by confidentiality obligations.',
  },
  {
    title: 'Data Security',
    body: 'We apply industry-standard safeguards to protect your information. However, no method of transmission or storage is completely secure, and we cannot guarantee absolute security.',
  },
  {
    title: 'Your Rights',
    body: 'You may request access to, correction of, or deletion of your personal data. To exercise these rights, contact us through the contact page.',
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-bg pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-4">
        <span className="text-accent text-sm font-semibold tracking-widest uppercase">Legal</span>
        <h1 className="text-4xl font-serif text-navy mt-2 mb-2">Privacy Policy</h1>
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
