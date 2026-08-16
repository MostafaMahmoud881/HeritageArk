'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email) { setError('Email is required'); return; }
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F5F0] flex items-center justify-center px-4 pt-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="font-serif text-2xl text-[#D4A373]">HeritageArk</Link>
          <h1 className="text-3xl font-serif text-[#0B132B] mt-6">Forgot Password</h1>
          <p className="text-[#6B7280] mt-2">Enter your email to receive a reset link</p>
        </div>

        {submitted ? (
          <div className="bg-white rounded-xl p-8 shadow-sm border border-[#E8E2D9] text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </div>
            <p className="text-[#6B7280]">If an account with that email exists, we&apos;ve sent a password reset link.</p>
            <Link href="/auth/login" className="inline-block mt-6 text-[#D4A373] hover:text-[#E9C46A] font-medium">Back to Login</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-xl p-8 shadow-sm border border-[#E8E2D9] space-y-5">
            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100">{error}</div>
            )}
            <div>
              <label className="block text-sm font-medium text-[#0B132B] mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-3 py-2 border border-[#E8E2D9] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A373]"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              data-testid="reset-submit"
              className="w-full px-4 py-2.5 bg-[#D4A373] text-white rounded-lg hover:bg-[#E9C46A] transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </button>
            <p className="text-center text-sm text-[#6B7280]">
              Remember your password?{' '}
              <Link href="/auth/login" className="text-[#D4A373] hover:text-[#E9C46A] font-medium">Sign in</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
