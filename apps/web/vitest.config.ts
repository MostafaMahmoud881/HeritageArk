import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  esbuild: {
    jsx: 'automatic',
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./__tests__/setup.ts'],
    server: {
      deps: {
        inline: ['@heritageverse'],
      },
    },
    include: ['./__tests__/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/',
        '__tests__/',
        '**/*.d.ts',
        '**/*.config.{ts,js}',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
      '@heritageverse/ui': path.resolve(__dirname, '../../packages/ui/src'),
      '@heritageverse/types': path.resolve(__dirname, '../../packages/types/src'),
      '@heritageverse/auth': path.resolve(__dirname, '../../packages/auth/src'),
    },
  },
});
