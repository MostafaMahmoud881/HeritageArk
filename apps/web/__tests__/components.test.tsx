import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('next/navigation', () => ({
  useParams: () => ({ locale: 'en' }),
  usePathname: () => '/en',
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

vi.mock('@/lib/auth', () => ({
  useAuth: () => ({
    user: null,
    isLoading: false,
    error: null,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    can: () => false,
    hasMinimumRole: () => false,
    updateUser: vi.fn(),
    loginWithGoogle: vi.fn(),
    loginWithMicrosoft: vi.fn(),
    loginWithApple: vi.fn(),
  }),
  AuthProvider: ({ children }: any) => children,
}));

vi.mock('@/lib/i18n', () => ({
  locales: ['en', 'ar', 'fr', 'it'],
  defaultLocale: 'en',
  getMessages: () => ({}),
  t: (_: string, path: string) => path,
  isRTL: (locale: string) => locale === 'ar',
}));

vi.mock('@/lib/TranslationProvider', () => {
  const dictionary: Record<string, string> = {
    'nav.home': 'Home',
    'nav.documentaries': 'Documentaries',
    'nav.museum': 'Museum',
    'nav.map': 'Heritage Map',
    'nav.reels': 'Reels',
    'nav.news': 'News',
    'auth.login': 'Login',
    'locales.en': '🇬🇧 English',
    'locales.ar': '🇸🇦 العربية',
    'locales.fr': '🇫🇷 Français',
    'locales.it': '🇮🇹 Italiano',
    'footer.tagline': 'Preserving and sharing cultural heritage through immersive experiences.',
    'footer.explore': 'Explore',
    'nav.cultures': 'Cultures',
    'nav.expeditions': 'Expeditions',
    'footer.resources': 'Resources',
    'footer.research': 'Research',
    'footer.about': 'About',
    'footer.contact': 'Contact',
    'footer.legal': 'Legal',
    'footer.privacy': 'Privacy Policy',
    'footer.terms': 'Terms of Service',
    'footer.attribution': 'Image Attribution',
    'footer.copyright': 'All rights reserved.',
    'footer.motto': 'Preserve. Explore. Revive.',
  };

  return {
    TranslationProvider: ({ children }: any) => children,
    useTranslate: () => ({
      t: (key: string) => dictionary[key] ?? key,
      dir: 'ltr' as const,
    }),
  };
});

vi.mock('@heritageverse/ui', () => ({
  Button: ({ children, variant, size, className, ...props }: any) => (
    <button
      data-variant={variant}
      data-size={size}
      className={className}
      {...props}
    >
      {children}
    </button>
  ),
}));

describe('Header', () => {
  it('renders with correct locale links', async () => {
    const Header = (await import('@/components/Header')).default;
    render(<Header locale="en" />);

    expect(screen.getByText('HeritageArk')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Documentaries')).toBeInTheDocument();
    expect(screen.getByText('Museum')).toBeInTheDocument();
    expect(screen.getByText('Heritage Map')).toBeInTheDocument();
    expect(screen.getByText('Reels')).toBeInTheDocument();
    expect(screen.getByText('News')).toBeInTheDocument();

    expect(screen.getByText('EN')).toBeInTheDocument();

    const loginLink = screen.getByText('Login');
    expect(loginLink.closest('a')).toHaveAttribute('href', '/auth/login');
  });

  it('displays language switcher with all locales', async () => {
    const Header = (await import('@/components/Header')).default;
    render(<Header locale="en" />);

    const langButton = screen.getByText('EN');
    await userEvent.click(langButton);

    expect(screen.getByText('🇬🇧 English')).toBeInTheDocument();
    expect(screen.getByText('🇸🇦 العربية')).toBeInTheDocument();
    expect(screen.getByText('🇫🇷 Français')).toBeInTheDocument();
    expect(screen.getByText('🇮🇹 Italiano')).toBeInTheDocument();
  });
});

describe('Footer', () => {
  it('renders with brand name HeritageArk', async () => {
    const Footer = (await import('@/components/Footer')).default;
    render(<Footer locale="en" />);

    expect(screen.getByText('HeritageArk')).toBeInTheDocument();
    expect(screen.getByText(/Preserving and sharing/)).toBeInTheDocument();
  });

  it('renders navigation links', async () => {
    const Footer = (await import('@/components/Footer')).default;
    render(<Footer locale="en" />);

    const links = ['Cultures', 'Museum', 'Documentaries', 'Expeditions',
      'News', 'Research', 'About', 'Contact',
      'Privacy Policy', 'Terms of Service', 'Image Attribution'];

    for (const text of links) {
      expect(screen.getByText(text)).toBeInTheDocument();
    }
  });

  it('renders copyright notice', async () => {
    const Footer = (await import('@/components/Footer')).default;
    render(<Footer locale="en" />);

    expect(screen.getByText(/HeritageArk\. All rights reserved\./)).toBeInTheDocument();
    expect(screen.getByText('Preserve. Explore. Revive.')).toBeInTheDocument();
  });
});

describe('Button', () => {
  it('renders with primary variant by default', async () => {
    const { Button } = await import('@heritageverse/ui');
    render(<Button>Click Me</Button>);

    const btn = screen.getByText('Click Me');
    expect(btn).toBeInTheDocument();
    expect(btn.tagName).toBe('BUTTON');
  });

  it('renders with different variants', async () => {
    const { Button } = await import('@heritageverse/ui');
    const variants = ['primary', 'secondary', 'outline', 'ghost', 'danger', 'dark'] as const;

    for (const variant of variants) {
      const { unmount } = render(<Button variant={variant}>{variant}</Button>);
      const btn = screen.getByText(variant);
      expect(btn.tagName).toBe('BUTTON');
      unmount();
    }
  });

  it('renders with different sizes', async () => {
    const { Button } = await import('@heritageverse/ui');
    const sizes = ['sm', 'md', 'lg', 'xl'] as const;

    for (const size of sizes) {
      const { unmount } = render(<Button size={size}>{size}</Button>);
      const btn = screen.getByText(size);
      expect(btn.tagName).toBe('BUTTON');
      unmount();
    }
  });

  it('disables button when disabled prop is set', async () => {
    const { Button } = await import('@heritageverse/ui');
    render(<Button disabled>Disabled</Button>);

    const btn = screen.getByText('Disabled');
    expect(btn).toBeDisabled();
  });
});
