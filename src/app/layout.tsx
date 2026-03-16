import type { Metadata } from 'next';
import React from 'react';
import "./styles/globals.css";
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister';
import FontHealthChecker from '@/components/FontHealthChecker';

export const metadata: Metadata = {
  title: "复制符 - 特殊符号查询工具",
  description: "快速查找和复制特殊符号，提供多种分类和搜索功能",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <head>
        {/* 字体预加载优化 - 使用preload提高缓存效率 */}
        <link 
          rel="preload" 
          href="https://f.0211120.xyz/font/得意黑/result.css" 
          as="style" 
          crossOrigin="anonymous"
        />
        <link 
          rel="preload" 
          href="https://f.0211120.xyz/font/Noto%20Sans%20Symbols%202/result.css" 
          as="style" 
          crossOrigin="anonymous"
        />
        
        {/* 字体样式表 - 直接加载以避免React hydration错误 */}
        <link 
          rel="stylesheet" 
          href="https://f.0211120.xyz/font/得意黑/result.css" 
          crossOrigin="anonymous"
        />
        <link 
          rel="stylesheet" 
          href="https://f.0211120.xyz/font/Noto%20Sans%20Symbols%202/result.css" 
          crossOrigin="anonymous"
        />
        
        {/* 移动端优化 */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        
        {/* DNS预解析优化 */}
        <link rel="dns-prefetch" href="//f.0211120.xyz" />
        <link rel="preconnect" href="https://f.0211120.xyz" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">
        <ServiceWorkerRegister />
        {children}
        <FontHealthChecker />
      </body>
    </html>
  );
}
