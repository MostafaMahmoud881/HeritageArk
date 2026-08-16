'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage('No verification token provided.');
      return;
    }

    fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        if (res.ok) {
          setStatus('success');
          setMessage('Email verified successfully! You can now log in.');
        } else {
          const data = await res.json().catch(() => ({}));
          setStatus('error');
          setMessage(data.error || 'Verification failed.');
        }
      })
      .catch(() => {
        setStatus('error');
        setMessage('Network error. Please try again.');
      });
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-card border border-border p-8 text-center">
          <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl">
            {status === 'loading' && <span className="animate-spin text-accent">⚙️</span>}
            {status === 'success' && <span>✅</span>}
            {status === 'error' && <span>❌</span>}
          </div>
          <h1 className="text-2xl font-serif text-navy mb-2">
            {status === 'loading' && 'Verifying Email...'}
            {status === 'success' && 'Email Verified!'}
            {status === 'error' && 'Verification Failed'}
          </h1>
          <p className="text-muted mb-6">{message}</p>
          {status !== 'loading' && (
            <Link
              href="/en/auth/login"
              className="inline-flex items-center px-6 py-3 rounded-xl bg-accent text-navy font-semibold hover:bg-accent/90 transition-colors"
            >
              Go to Login
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="text-muted">Loading...</div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
