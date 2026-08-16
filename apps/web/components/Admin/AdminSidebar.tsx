'use client';

import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useState } from 'react';
import clsx from 'clsx';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  permission?: string;
  children?: NavItem[];
}

const NAV_GROUPS: { label?: string; items: NavItem[] }[] = [
  {
    items: [
      {
        href: '/admin',
        label: 'Dashboard',
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
          </svg>
        ),
      },
    ],
  },
  {
    label: 'Content',
    items: [
      {
        href: '/admin/cms',
        label: 'Articles',
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
          </svg>
        ),
        permission: 'content.create',
      },
      {
        href: '/admin/pages',
        label: 'Pages',
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /><line x1="8" y1="7" x2="16" y2="7" /><line x1="8" y1="11" x2="14" y2="11" />
          </svg>
        ),
        permission: 'pages.create',
      },
    ],
  },
  {
    label: 'Media',
    items: [
      {
        href: '/admin/media',
        label: 'Media Library',
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
          </svg>
        ),
        permission: 'media.upload',
      },
      {
        href: '/admin/assets',
        label: 'Assets',
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
          </svg>
        ),
        permission: 'media.upload',
      },
    ],
  },
  {
    label: 'Design',
    items: [
      {
        href: '/admin/theme',
        label: 'Theme',
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
          </svg>
        ),
        permission: 'theme.view',
      },
      {
        href: '/admin/branding',
        label: 'Branding',
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
          </svg>
        ),
        permission: 'branding.view',
      },
      {
        href: '/admin/navigation',
        label: 'Navigation',
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="3" x2="21" y2="3" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="3" y1="15" x2="21" y2="15" /><line x1="3" y1="21" x2="21" y2="21" />
          </svg>
        ),
        permission: 'navigation.manage',
      },
    ],
  },
  {
    label: 'Studio',
    items: [
      {
        href: '/admin/videos',
        label: 'Videos',
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
          </svg>
        ),
        permission: 'video.create',
      },
      {
        href: '/admin/reels-studio',
        label: 'Reels Studio',
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="5" /><path d="M7 2v20M17 2v20M2 12h20" />
          </svg>
        ),
        permission: 'reels.create',
      },
    ],
  },
  {
    label: 'Administration',
    items: [
      {
        href: '/admin/users',
        label: 'Users',
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        ),
        permission: 'users.view',
      },
      {
        href: '/admin/permissions',
        label: 'Permissions',
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        ),
        permission: 'permissions.manage',
      },
      {
        href: '/admin/ai-settings',
        label: 'AI Settings',
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a4 4 0 0 1 4 4c0 2-2 4-4 6-2-2-4-4-4-6a4 4 0 0 1 4-4z" /><path d="M12 22v-8" />
          </svg>
        ),
        permission: 'settings.edit',
      },
      {
        href: '/admin/settings',
        label: 'Settings',
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        ),
        permission: 'settings.view',
      },
    ],
  },
];

function NavItemLink({ item, locale, isCollapsed, onNavigate }: { item: NavItem; locale: string; isCollapsed: boolean; onNavigate: () => void }) {
  const pathname = usePathname();
  const href = `/${locale}${item.href}`;
  const isActive = pathname === href || pathname.startsWith(`/${locale}${item.href}/`);

  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={clsx(
        'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative',
        isActive
          ? 'bg-accent/15 text-accent font-medium'
          : 'text-white/60 hover:text-white hover:bg-white/5',
      )}
      title={isCollapsed ? item.label : undefined}
    >
      <span className="shrink-0">{item.icon}</span>
      {!isCollapsed && (
        <span className="text-sm truncate">{item.label}</span>
      )}
      {isActive && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-accent rounded-r-full" />
      )}
    </Link>
  );
}

export default function AdminSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { locale } = useParams<{ locale: string }>();
  const { user, can, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const filteredGroups = NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => {
      if (!item.permission) return true;
      return can(item.permission as any);
    }),
  })).filter((group) => group.items.length > 0);

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-4 left-4 z-[60] lg:hidden bg-navy text-white p-2.5 rounded-lg shadow-lg hover:bg-navy2 transition-colors"
        aria-label="Toggle sidebar"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {mobileOpen ? (
            <path d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed top-0 left-0 h-full bg-navy border-r border-white/5 flex flex-col z-50 transition-all duration-300',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
          'lg:translate-x-0',
          isCollapsed ? 'w-[72px]' : 'w-60',
        )}
      >
        {/* Logo */}
        <div className={clsx('flex items-center border-b border-white/5 px-4 h-16 shrink-0', isCollapsed ? 'justify-center' : 'justify-between')}>
          <Link href={`/${locale}/admin`} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
              <span className="text-accent font-serif font-bold text-sm">HV</span>
            </div>
            {!isCollapsed && (
              <span className="font-serif text-lg text-white tracking-wide">HeritageArk</span>
            )}
          </Link>
          {!isCollapsed && (
            <button
              onClick={() => setIsCollapsed(true)}
              className="hidden lg:flex text-white/30 hover:text-white/60 transition-colors"
              aria-label="Collapse sidebar"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          )}
        </div>

        {/* Collapse expand button */}
        {isCollapsed && (
          <button
            onClick={() => setIsCollapsed(false)}
            className="hidden lg:flex items-center justify-center py-3 text-white/30 hover:text-white/60 transition-colors"
            aria-label="Expand sidebar"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        )}

        {/* Nav items */}
        <nav className={clsx('flex-1 overflow-y-auto py-4', isCollapsed ? 'px-2' : 'px-3')}>
          {filteredGroups.map((group, idx) => (
            <div key={idx} className={group.label ? 'mb-4' : ''}>
              {group.label && !isCollapsed && (
                <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30 px-3 mb-2">{group.label}</p>
              )}
              <div className="space-y-1">
                {group.items.map((item) => (
                  <NavItemLink
                    key={item.href}
                    item={item}
                    locale={locale}
                    isCollapsed={isCollapsed}
                    onNavigate={() => { setMobileOpen(false); onNavigate?.(); }}
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* User info / logout */}
        <div className={clsx('border-t border-white/5 p-3', isCollapsed && 'text-center')}>
          {user && (
            <div className={clsx('mb-2', isCollapsed ? 'text-center' : 'flex items-center gap-3')}>
              <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center shrink-0 mx-auto lg:mx-0">
                <span className="text-accent text-xs font-bold">{user.name.charAt(0)}</span>
              </div>
              {!isCollapsed && (
                <div className="min-w-0">
                  <p className="text-sm text-white font-medium truncate">{user.name}</p>
                  <p className="text-xs text-white/40 truncate">{user.role}</p>
                </div>
              )}
            </div>
          )}
          <button
            onClick={() => { logout(); window.location.href = `/${locale}/auth/login`; }}
            className={clsx(
              'flex items-center gap-2 w-full rounded-lg transition-colors text-white/40 hover:text-danger hover:bg-danger/10',
              isCollapsed ? 'justify-center p-2' : 'px-3 py-2',
            )}
            title="Logout"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            {!isCollapsed && <span className="text-sm">Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
