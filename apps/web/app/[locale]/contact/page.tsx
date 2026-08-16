'use client';

import { Button } from '@heritageverse/ui';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-bg pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-4">
        <span className="text-accent text-sm font-semibold tracking-widest uppercase">Contact</span>
        <h1 className="text-4xl font-serif text-navy mt-2 mb-4">Get in Touch</h1>
        <p className="text-muted mb-8">
          Have questions, suggestions, or collaboration ideas? We would love to hear from you.
        </p>
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div className="grid sm:grid-cols-2 gap-4">
            <input type="text" placeholder="Your Name" className="w-full bg-white border border-border rounded-xl px-4 py-3 text-navy" />
            <input type="email" placeholder="Your Email" className="w-full bg-white border border-border rounded-xl px-4 py-3 text-navy" />
          </div>
          <input type="text" placeholder="Subject" className="w-full bg-white border border-border rounded-xl px-4 py-3 text-navy" />
          <textarea rows={5} placeholder="Your Message" className="w-full bg-white border border-border rounded-xl px-4 py-3 text-navy" />
          <Button variant="primary" size="lg">Send Message</Button>
        </form>
      </div>
    </div>
  );
}