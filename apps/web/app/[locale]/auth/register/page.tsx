'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, Input } from '@heritageverse/ui';

export default function RegisterPage() {
  const { register, error, isLoading } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    if (!name) { setLocalError('Name is required'); return; }
    if (!email) { setLocalError('Email is required'); return; }
    if (!password) { setLocalError('Password is required'); return; }
    if (password.length < 8) { setLocalError('Password must be at least 8 characters'); return; }
    if (password !== confirmPassword) { setLocalError('Passwords do not match'); return; }
    try {
      await register(name, email, password);
      router.push('/admin');
    } catch (err: any) {
      setLocalError(err.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F5F0] flex items-center justify-center px-4 pt-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="font-serif text-2xl text-[#D4A373]">HeritageArk</Link>
          <h1 className="text-3xl font-serif text-[#0B132B] mt-6">Create Account</h1>
          <p className="text-[#6B7280] mt-2">Join the HeritageArk community</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl p-8 shadow-sm border border-[#E8E2D9] space-y-5">
          {(localError || error) && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100">
              {localError || error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-[#0B132B] mb-1.5">Full Name</label>
            <Input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" className="w-full" />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#0B132B] mb-1.5">Email</label>
            <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" className="w-full" />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#0B132B] mb-1.5">Password</label>
            <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 8 characters" className="w-full" />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#0B132B] mb-1.5">Confirm Password</label>
            <Input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••" className="w-full" />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading} data-testid="register-submit">
            {isLoading ? 'Creating account...' : 'Create Account'}
          </Button>

          <p className="text-center text-sm text-[#6B7280]">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-[#D4A373] hover:text-[#E9C46A] font-medium">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
