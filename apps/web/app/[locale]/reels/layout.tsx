'use client';

import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import clsx from 'clsx';

interface TabItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const tabs: TabItem[] = [
  {
    href: '/reels',
    label: 'Feed',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
        <line x1="7" y1="2" x2="7" y2="22" />
        <line x1="17" y1="2" x2="17" y2="22" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <line x1="2" y1="7" x2="7" y2="7" />
        <line x1="2" y1="17" x2="7" y2="17" />
        <line x1="17" y1="17" x2="22" y2="17" />
        <line x1="17" y1="7" x2="22" y2="7" />
      </svg>
    ),
  },
  {
    href: '/reels/trending',
    label: 'Trending',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
      </svg>
    ),
  },
  {
    href: '/reels/explore',
    label: 'Explore',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
  },
  {
    href: '/reels/upload',
    label: 'Upload',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="16" />
        <line x1="8" y1="12" x2="16" y2="12" />
      </svg>
    ),
  },
];

export default function ReelsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const params = useParams();
  const locale = params.locale as string;

  const isActive = (href: string) => {
    if (href === '/reels') return pathname === `/${locale}/reels`;
    return pathname.startsWith(`/${locale}${href}`);
  };

  return (
    <div className="pt-16 pb-20 md:pb-0 md:pt-16">
      {children}

      <nav className="fixed bottom-0 inset-x-0 z-40 md:left-0 md:top-16 md:bottom-auto md:w-20 md:flex md:flex-col md:items-center md:pt-6 md:bg-white md:border-r md:border-border">
        <div className="flex md:flex-col items-center justify-around md:justify-start md:gap-2 h-16 md:h-auto bg-white border-t md:border-t-0 border-border shadow-lg md:shadow-none px-2">
          {tabs.map((tab) => (
            <Link
              key={tab.href}
              href={`/${locale}${tab.href}`}
              className={clsx(
                'flex flex-col md:flex-row items-center gap-1 md:gap-3 px-3 md:px-4 py-1.5 md:py-3 rounded-xl transition-all duration-200',
                isActive(tab.href)
                  ? 'text-accent bg-accent/10'
                  : 'text-muted hover:text-navy hover:bg-bg'
              )}
            >
              <span className={clsx(
                'md:w-6 md:h-6 flex items-center justify-center',
                isActive(tab.href) ? 'scale-110' : ''
              )}>
                {tab.icon}
              </span>
              <span className={clsx(
                'text-[10px] md:text-sm font-medium whitespace-nowrap',
                'md:hidden'
              )}>
                {tab.label}
              </span>
              <span className="hidden md:inline text-xs font-medium">{tab.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
