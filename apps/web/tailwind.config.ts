import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: '#355C4A',
        navy2: '#2D3436',
        accent: '#B9955A',
        gold: '#8C6B43',
        bg: '#F7F4EF',
        white: '#FFFFFF',
        muted: '#59636D',
        border: '#E8DDC8',
        sand: '#E8DDC8',
        stone: '#DCCFB8',
        ivory: '#F7F4EF',
        charcoal: '#2D3436',
        focus: '#6F927F',
        success: '#2F855A',
        danger: '#C53030',
        info: '#2B6CB0',
        warning: '#C05621',
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['Manrope', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease',
        'slide-up': 'slideUp 0.5s ease both',
        shimmer: 'shimmer 1.5s linear infinite',
        tape: 'tape 30s linear infinite',
        blink: 'blink 1s step-end infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        tape: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
      },
      boxShadow: {
        'accent-glow': '0 6px 20px rgba(185, 149, 90, 0.4)',
        card: '0 18px 50px rgba(45, 52, 54, 0.10)',
        soft: '0 18px 50px rgb(45 52 54 / 0.10)',
      },
      borderRadius: {
        control: '10px',
        panel: '18px',
      },
    },
  },
  plugins: [],
};

export default config;