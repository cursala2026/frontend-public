// Bundle Analyzer compatible con ESM
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Skip trailing slash redirect
  skipTrailingSlashRedirect: true,

  // Configuración de Turbopack (requerida para Next.js 16)
  turbopack: {},

  // Optimizaciones para producción
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Optimización para reducir legacy JavaScript
  experimental: {
    optimizePackageImports: [
      'jsvectormap',
      'flatpickr',
      'lucide-react',
      'react-icons'
    ],
  },

  // Configuración de imágenes
  images: {
    qualities: [60, 75, 90],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cursala.b-cdn.net',
        port: '',
        pathname: '/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    localPatterns: [
      {
        pathname: '/api/direct',
        search: '?path=*',
      },
      {
        pathname: '/images/**',
      },
    ],
  },
  
  // Configuración de headers para caché optimizada
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "connect-src 'self' https://cursala.b-cdn.net https://cloudflareinsights.com https://static.cloudflareinsights.com",
          },
        ],
      },
      {
        source: '/logo/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/covers/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/images/sections/hero/cursos.jpg',
        headers: [
          {
            key: 'Link',
            value: '</images/sections/hero/cursos.jpg>; rel=preload; as=image',
          },
        ],
      },
    ];
  },
  
  // Redirección interna para la API de cursos del bot
  async rewrites() {
    return [
      {
        source: '/api/courses',
        destination: '/api/courses/bot', // Apunta al endpoint exclusivo del bot
      },
    ]
  },
  
  webpack: (config, { dev }) => {
    // Optimizaciones para desarrollo
    if (dev) {
      config.infrastructureLogging = {
        level: 'error',
      };
      
      // Optimizar resolución de módulos
      config.resolve.symlinks = false;
      
      // Reducir checks en desarrollo  
      config.watchOptions = {
        poll: false,
        ignored: /node_modules/,
      };
      
      // Optimizar cache
      config.cache = {
        type: 'filesystem',
      };
    }
    
    // Suprimir warnings de dependencias y fuentes
    config.ignoreWarnings = [
      /Critical dependency/,
      /Module not found/,
      (warning) => warning.message.includes('-ms-high-contrast'),
      (warning) => warning.message && warning.message.includes('Glyph bbox'),
      (warning) => warning.message && warning.message.includes('font-family'),
    ];
    
    return config;
  },
};

// Exportar config con soporte para bundle analyzer en ESM
export default (async () => {
  if (process.env.ANALYZE === 'true') {
    const { default: withBundleAnalyzer } = await import('@next/bundle-analyzer');
    return withBundleAnalyzer({ enabled: true })(nextConfig);
  }
  return nextConfig;
})();
