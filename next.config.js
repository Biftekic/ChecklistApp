import withPWA from '@ducanh2912/next-pwa';

const nextConfig = {
  reactStrictMode: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [390, 430, 768, 1024],
    imageSizes: [16, 32, 48, 64, 96],
  },
  experimental: {
    // React 19 and Next.js 15.1 features
    // ppr: true, // Partial Prerendering (canary only)
    // reactCompiler: true, // React Compiler optimization (requires additional setup)
    serverActions: {
      bodySizeLimit: '2mb', // For photo uploads
      allowedOrigins: ['localhost:3000', 'app.checklistapp.com'],
    },
    // optimizeCss: true, // Requires critters to be configured
    optimizePackageImports: [
      '@radix-ui/react-*',
      'dexie',
      'date-fns',
      '@tanstack/react-query',
    ],
    webVitalsAttribution: ['CLS', 'LCP', 'INP'],
  },
  // TypeScript for React 19
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/api\.anthropic\.com\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'claude-api-cache',
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 60 * 60 * 24, // 24 hours
        },
      },
    },
  ],
})(nextConfig);