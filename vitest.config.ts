import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';
import { VitestReporter } from 'tdd-guard-vitest';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    reporters: [
      'default',
      new VitestReporter('/home/tinpavlic1/claude-projects/ChecklistApp'),
    ],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        '.next/',
        'coverage/',
        '*.config.*',
        '**/*.d.ts',
        '**/*.spec.*',
        '**/*.test.*',
        '**/mockData/*',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      '@/components': path.resolve(__dirname, './components'),
      '@/lib': path.resolve(__dirname, './lib'),
      '@/hooks': path.resolve(__dirname, './hooks'),
      '@/types': path.resolve(__dirname, './types'),
      '@/stores': path.resolve(__dirname, './stores'),
      '@/utils': path.resolve(__dirname, './utils'),
      '@/config': path.resolve(__dirname, './config'),
    },
  },
});