'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export interface BrandingData {
  siteName: string;
  logoUrl: string | null;
  logoDarkUrl: string | null;
  faviconUrl: string | null;
  tagline: string | null;
}

export interface ThemeData {
  id: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  goldColor: string;
  bgColor: string;
  textColor: string;
  mutedColor: string;
  borderColor: string;
  successColor: string;
  dangerColor: string;
  infoColor: string;
  warningColor: string;
  whiteColor: string;
  headingFont: string;
  bodyFont: string;
  customCss: string | null;
}

interface SiteSettingsContextType {
  branding: BrandingData;
  theme: ThemeData | null;
  logoUrl: string | null;
  siteName: string;
}

const SiteSettingsContext = createContext<SiteSettingsContextType | null>(null);

function fontStack(font: string): string {
  const base =
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
  if (!font) return base;
  const named = `'${font}', ${base}`;
  return named;
}

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const [branding, setBranding] = useState<BrandingData>({
    siteName: 'HeritageArk',
    logoUrl: null,
    logoDarkUrl: null,
    faviconUrl: null,
    tagline: null,
  });
  const [theme, setTheme] = useState<ThemeData | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/public/branding')
      .then(r => (r.ok ? r.json() : null))
      .then(data => {
        if (cancelled || !data) return;
        if (data.branding) setBranding(data.branding);
        if (data.theme) setTheme(data.theme);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme) {
      root.style.setProperty('--color-navy', theme.primaryColor);
      root.style.setProperty('--color-navy2', theme.secondaryColor);
      root.style.setProperty('--color-accent', theme.accentColor);
      root.style.setProperty('--color-gold', theme.goldColor);
      root.style.setProperty('--color-bg', theme.bgColor);
      root.style.setProperty('--color-text', theme.textColor);
      root.style.setProperty('--color-muted', theme.mutedColor);
      root.style.setProperty('--color-border', theme.borderColor);
      root.style.setProperty('--color-success', theme.successColor);
      root.style.setProperty('--color-danger', theme.dangerColor);
      root.style.setProperty('--color-info', theme.infoColor);
      root.style.setProperty('--color-warning', theme.warningColor);
      root.style.setProperty('--color-white', theme.whiteColor);
      root.style.setProperty('--font-serif', fontStack(theme.headingFont));
      root.style.setProperty('--font-sans', fontStack(theme.bodyFont));
      if (theme.customCss) {
        let styleEl = document.getElementById('admin-custom-css') as HTMLStyleElement | null;
        if (!styleEl) {
          styleEl = document.createElement('style');
          styleEl.id = 'admin-custom-css';
          document.head.appendChild(styleEl);
        }
        styleEl.textContent = theme.customCss;
      }
    } else {
      root.style.removeProperty('--color-navy');
      root.style.removeProperty('--color-navy2');
      root.style.removeProperty('--color-accent');
      root.style.removeProperty('--color-gold');
      root.style.removeProperty('--color-bg');
      root.style.removeProperty('--color-text');
      root.style.removeProperty('--color-muted');
      root.style.removeProperty('--color-border');
      root.style.removeProperty('--color-success');
      root.style.removeProperty('--color-danger');
      root.style.removeProperty('--color-info');
      root.style.removeProperty('--color-warning');
      root.style.removeProperty('--color-white');
      root.style.removeProperty('--font-serif');
      root.style.removeProperty('--font-sans');
    }
  }, [theme]);

  useEffect(() => {
    if (branding.faviconUrl) {
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = branding.faviconUrl;
    }
  }, [branding.faviconUrl]);

  const isDark = mounted ? document.documentElement.classList.contains('dark') : false;
  const logoUrl = isDark && branding.logoDarkUrl ? branding.logoDarkUrl : branding.logoUrl;

  return (
    <SiteSettingsContext.Provider
      value={{ branding, theme, logoUrl: logoUrl, siteName: branding.siteName }}
    >
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings(): SiteSettingsContextType {
  const ctx = useContext(SiteSettingsContext);
  if (!ctx) {
    return {
      branding: { siteName: 'HeritageArk', logoUrl: null, logoDarkUrl: null, faviconUrl: null, tagline: null },
      theme: null,
      logoUrl: null,
      siteName: 'HeritageArk',
    };
  }
  return ctx;
}
