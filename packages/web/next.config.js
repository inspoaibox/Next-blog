/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'http', hostname: '127.0.0.1' },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3012'}/api/:path*`,
      },
      {
        source: '/uploads/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3012'}/uploads/:path*`,
      },
    ];
  },
  // 允许在服务端组件中使用 fetch
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3011', '127.0.0.1:3011', 'localhost:3012', '127.0.0.1:3012'],
    },
  },
};

module.exports = nextConfig;
