'use client';

import { Button, Input } from '@heritageverse/ui';
import { useState } from 'react';
import { api } from '@/lib/api';
import { useTranslate } from '@/lib/TranslationProvider';

export default function NewsletterSection() {
  const { t } = useTranslate();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus('idle');

    try {
      await api.post('/api/newsletter', { email });
      setStatus('success');
      setEmail('');
    } catch {
      setStatus('error');
    }
  };

  return (
    <section className="py-24 bg-white">
      <div className="content-section max-w-2xl text-center">
        <span className="text-accent text-sm font-semibold tracking-widest uppercase">
          {t('newsletter.title')}
        </span>
        <h2 className="text-3xl md:text-4xl font-serif text-navy mt-2">
          {t('newsletter.title')}
        </h2>
        <p className="text-muted mt-4">
          {t('newsletter.subtitle')}
        </p>

        <form onSubmit={handleSubmit} className="mt-8 flex gap-3 max-w-md mx-auto">
          <Input
            type="email"
            placeholder={t('newsletter.placeholder')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="flex-1"
          />
          <Button type="submit">{t('newsletter.subscribe')}</Button>
        </form>

        {status === 'success' && (
          <p className="mt-4 text-sm text-success">{t('newsletter.success')}</p>
        )}
        {status === 'error' && (
          <p className="mt-4 text-sm text-danger">{t('newsletter.error')}</p>
        )}
      </div>
    </section>
  );
}
