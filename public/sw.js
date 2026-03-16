// Service Worker for font caching optimization
// 字体缓存优化的Service Worker

const CACHE_NAME = 'rarechar-fonts-v1'; // eslint-disable-line @typescript-eslint/no-unused-vars
const FONT_CACHE_NAME = 'rarechar-fonts-cache';

// 需要缓存的字体资源
const FONT_URLS = [
  'https://f.0211120.xyz/font/得意黑/result.css',
  'https://f.0211120.xyz/font/Noto%20Sans%20Symbols%202/result.css'
];

// 安装事件 - 预缓存字体资源
self.addEventListener('install', event => {
  // console.log('[SW] Installing service worker for font caching...');
  
  event.waitUntil(
    caches.open(FONT_CACHE_NAME)
      .then(cache => {
        // console.log('[SW] Caching font resources...');
        return cache.addAll(FONT_URLS);
      })
      .then(() => {
        // console.log('[SW] Font resources cached successfully');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('[SW] Failed to cache font resources:', error);
      })
  );
});

// 激活事件 - 清理旧缓存
self.addEventListener('activate', event => {
  // console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== FONT_CACHE_NAME && cacheName.startsWith('rarechar-fonts-')) {
              // console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        // console.log('[SW] Service worker activated');
        return self.clients.claim();
      })
  );
});

// 拦截请求 - 优化字体加载
self.addEventListener('fetch', event => {
  const url = event.request.url;
  
  // 只处理字体相关的请求
  if (url.includes('f.0211120.xyz/font/') || 
      url.includes('.woff') || 
      url.includes('.woff2') || 
      url.includes('.ttf') || 
      url.includes('.otf')) {
    
    event.respondWith(
      caches.open(FONT_CACHE_NAME)
        .then(cache => {
          return cache.match(event.request)
            .then(cachedResponse => {
              if (cachedResponse) {
                // console.log('[SW] Serving font from cache:', url);
                return cachedResponse;
              }
              
              // 如果缓存中没有，则从网络获取并缓存
              // console.log('[SW] Fetching font from network:', url);
              return fetch(event.request)
                .then(response => {
                  // 检查响应是否有效
                  if (response.status === 200) {
                    // 克隆响应用于缓存
                    const responseClone = response.clone();
                    cache.put(event.request, responseClone);
                    // console.log('[SW] Font cached:', url);
                  }
                  return response;
                })
                .catch(error => {
                  console.error('[SW] Failed to fetch font:', url, error);
                  // 返回一个空响应避免页面报错
                  return new Response('', { status: 404 });
                });
            });
        })
    );
  }
});

// 消息处理 - 支持手动清除缓存
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'CLEAR_FONT_CACHE') {
    event.waitUntil(
      caches.delete(FONT_CACHE_NAME)
        .then(() => {
          // console.log('[SW] Font cache cleared');
          event.ports[0].postMessage({ success: true });
        })
        .catch(error => {
          console.error('[SW] Failed to clear font cache:', error);
          event.ports[0].postMessage({ success: false, error });
        })
    );
  }
  
  if (event.data && event.data.type === 'GET_CACHE_STATUS') {
    event.waitUntil(
      caches.open(FONT_CACHE_NAME)
        .then(cache => cache.keys())
        .then(keys => {
          event.ports[0].postMessage({
            cacheSize: keys.length,
            cachedUrls: keys.map(req => req.url)
          });
        })
    );
  }
});

// 错误处理
self.addEventListener('error', event => {
  console.error('[SW] Service worker error:', event.error);
});

self.addEventListener('unhandledrejection', event => {
  console.error('[SW] Unhandled promise rejection:', event.reason);
});