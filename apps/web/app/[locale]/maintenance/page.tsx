'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslate } from '@/lib/TranslationProvider';

export default function MaintenancePage() {
  const { t } = useTranslate();
  const [message, setMessage] = useState<string | null>(null);
  const [siteName, setSiteName] = useState('HeritageArk');

  useEffect(() => {
    fetch('/api/public/settings')
      .then(r => r.json())
      .then(d => {
        setSiteName(d.siteName || 'HeritageArk');
        setMessage(d.maintenanceMessage || null);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B132B] px-4">
      <div className="max-w-md w-full text-center">
        <h1 className="font-serif text-3xl text-[#D4A373] mb-3">{siteName}</h1>
        <div className="w-16 h-1 bg-[#D4A373]/40 rounded-full mx-auto mb-6" />
        <h2 className="text-xl text-white font-medium mb-3">Site Under Maintenance</h2>
        <p className="text-white/60 text-sm leading-relaxed">
          {message || 'We are currently performing scheduled maintenance to improve your experience. Please check back shortly.'}
        </p>
        <div className="mt-8">
          <Link
            href="/admin"
            className="inline-block text-sm text-white/40 hover:text-[#D4A373] transition-colors"
          >
            Admin access
          </Link>
        </div>
      </div>
    </div>
  );
}
