'use client';

import { useEffect } from 'react';

// Service Worker 注册组件
export default function ServiceWorkerRegister() {
  useEffect(() => {
    const registerServiceWorker = async () => {
      try {
        // console.log('[SW] Registering service worker...');
        
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        });

        // console.log('[SW] Service worker registered successfully:', registration.scope);

        // 监听更新
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            // console.log('[SW] New service worker installing...');
            
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  // console.log('[SW] New service worker installed, update available');
                  // 可以在这里通知用户有更新
                } else {
                  // console.log('[SW] Service worker installed for the first time');
                }
              }
            });
          }
        });

        // 监听控制器变化
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          // console.log('[SW] Service worker controller changed');
        });

      } catch (error) {
        console.error('[SW] Service worker registration failed:', error);
      }
    };

    // 检查浏览器是否支持Service Worker
    if ('serviceWorker' in navigator) {
      registerServiceWorker();
    } else {
      console.warn('[SW] Service Worker not supported in this browser');
    }
  }, []);

  // 清除字体缓存的工具函数
  const clearFontCache = async (): Promise<boolean> => {
    if (!('serviceWorker' in navigator) || !navigator.serviceWorker.controller) {
      console.warn('[SW] Service worker not available for cache clearing');
      return false;
    }

    try {
      const messageChannel = new MessageChannel();
      
      return new Promise((resolve) => {
        messageChannel.port1.onmessage = (event) => {
          resolve(event.data.success);
        };
        
        navigator.serviceWorker.controller!.postMessage(
          { type: 'CLEAR_FONT_CACHE' },
          [messageChannel.port2]
        );
      });
    } catch (error) {
      console.error('[SW] Failed to clear font cache:', error);
      return false;
    }
  };

  // 获取缓存状态的工具函数
  const getCacheStatus = async (): Promise<{ cacheSize: number; cachedUrls: string[] } | null> => {
    if (!('serviceWorker' in navigator) || !navigator.serviceWorker.controller) {
      return null;
    }

    try {
      const messageChannel = new MessageChannel();
      
      return new Promise((resolve) => {
        messageChannel.port1.onmessage = (event) => {
          resolve(event.data);
        };
        
        navigator.serviceWorker.controller!.postMessage(
          { type: 'GET_CACHE_STATUS' },
          [messageChannel.port2]
        );
      });
    } catch (error) {
      console.error('[SW] Failed to get cache status:', error);
      return null;
    }
  };

  // 将工具函数暴露到全局，供其他组件使用
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as unknown as { fontCacheUtils: { clearFontCache: () => Promise<boolean>; getCacheStatus: () => Promise<{ cacheSize: number; cachedUrls: string[] } | null> } }).fontCacheUtils = {
        clearFontCache,
        getCacheStatus
      };
    }
  }, []);

  return null; // 这个组件不渲染任何内容
}

// 类型定义
export interface FontCacheUtils {
  clearFontCache: () => Promise<boolean>;
  getCacheStatus: () => Promise<{ cacheSize: number; cachedUrls: string[] } | null>;
}

// 声明全局类型
declare global {
  interface Window {
    fontCacheUtils?: FontCacheUtils;
  }
}