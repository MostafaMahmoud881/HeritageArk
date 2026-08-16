'use client';

import { useAuth } from '@/lib/auth';
import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import AdminSidebar from '@/components/Admin/AdminSidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const { locale } = useParams<{ locale: string }>();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push(`/${locale}/auth/login`);
    }
  }, [user, isLoading, router, locale]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin text-accent" width="32" height="32" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          <p className="text-muted text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const canAccess = user.role === 'super_admin' || user.role === 'admin' || user.role === 'supervisor' || user.role === 'editor';

  if (!canAccess) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-card p-10 max-w-md text-center border border-border">
          <div className="w-16 h-16 rounded-full bg-danger/10 flex items-center justify-center mx-auto mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-danger">
              <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <h1 className="text-2xl font-serif text-navy mb-2">Access Denied</h1>
          <p className="text-muted text-sm mb-6">
            You do not have the required permissions to access the admin dashboard.
            Please contact an administrator if you believe this is a mistake.
          </p>
          <button
            onClick={() => router.push(`/${locale}`)}
            className="px-6 py-2.5 bg-accent text-navy font-semibold rounded-lg hover:bg-accent/90 transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      <AdminSidebar />
      <div className="lg:pl-60 transition-all duration-300">
        <main className="p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8">
          {children}
        </main>
      </div>
    </div>
  );
}
