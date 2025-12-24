import { precacheAndRoute } from 'workbox-precaching';
import { summarizeNewsPage } from './reader-utils';

declare let self: ServiceWorkerGlobalScope;

precacheAndRoute(self.__WB_MANIFEST);

self.addEventListener('fetch', (event: any) => {
  const url = new URL(event.request.url);
  // console.log("fetch intercepted", { p: url.pathname, sp: url.searchParams });

  if (url.pathname === '/summarize-news') {
    const targetUrl = url.searchParams.get('url');
    if (targetUrl) {
      event.respondWith(handleNewsExtraction(targetUrl));
    }
  }
});

async function handleNewsExtraction(targetUrl: string) {
  try {

    const summary = await summarizeNewsPage(targetUrl, '/api/proxy');
    // console.log({ summary })
    return new Response(JSON.stringify(summary, null, 2),
      {
        headers: { 'Content-Type': 'application/json' }
      });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
