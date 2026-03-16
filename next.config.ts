import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // 允许开发环境下的跨域请求
  allowedDevOrigins: [
    '192.168.31.189',
    '*.local',
    'localhost'
  ],
  
  
  // 静态资源缓存配置
  async headers() {
    return [
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // 字体文件缓存配置
      {
        source: '/fonts/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
