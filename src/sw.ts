import { precacheAndRoute } from 'workbox-precaching';
import { summarizeNewsPage } from './reader-utils';

console.log("Cuisle SW: Booting up...");

declare let self: ServiceWorkerGlobalScope;

precacheAndRoute(self.__WB_MANIFEST);

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim()); // Crucial for Safari to intercept on first load
});

self.addEventListener('fetch', (event: FetchEvent) => {
  // Debugging: This will show up in the Safari Service Worker Inspector window
  console.log(`[Cuisle SW] Fetching: ${event.request.url}`);

  const url = new URL(event.request.url);
  console.log("fetch intercepted", { p: url.pathname, sp: url.searchParams });

  if (url.pathname === '/summarize-news') {
    const targetUrl = url.searchParams.get('url');
    if (targetUrl) {
      event.respondWith(handleNewsExtraction(targetUrl));
    }
  }
});

async function handleNewsExtraction(targetUrl: string) {
  try {
    console.log('handleNewsExtraction', targetUrl);
    const summary = await summarizeNewsPage(targetUrl, '/api/proxy');
    console.log({ summary })
    return new Response(JSON.stringify(summary, null, 2),
      {
        headers: { 'Content-Type': 'application/json' }
      });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
