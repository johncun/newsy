import { parseHTML } from 'linkedom';

export type ReaderOptions = {
  ignorePlaceholderImages: boolean
}

const DEFAULT_OPTS: ReaderOptions = {
  ignorePlaceholderImages: true
}


export async function summarizeNewsPage(targetUrl: string, proxy: string, options: ReaderOptions = DEFAULT_OPTS) {
  console.log(`Reader fetching: ${targetUrl}...`);

  try {
    const response = await fetch(`${proxy}?url=${encodeURIComponent(targetUrl)}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; BunParser/1.0)' }
    });
    const htmlString = await response.text();
    // 2. Parse with LinkeDOM
    const { document } = parseHTML(htmlString);
    console.log({ document })
    // 3. Define the extraction logic
    const selector = 'h1, h2, h3, p, img, article, section';
    const elements = document.querySelectorAll(selector);

    const summary: any[] = [];
    let currentSection: any = { title: 'Lead', content: [] };

    elements.forEach((el: any) => {
      const tagName = el.tagName.toLowerCase();

      // Heading = New Section
      // if (tagName.match(/^section$/)) {
      //   if (currentSection.content.length > 0) summary.push(currentSection);
      //   currentSection = {
      //     title: el.textContent?.trim(),
      //     level: 'h1',
      //     content: []
      //   };
      // }
      // else 
      if (tagName.match(/^h[1-6]$/)) {
        if (currentSection.content.length > 0) summary.push(currentSection);
        currentSection = {
          title: el.textContent?.trim(),
          level: tagName,
          content: []
        };
      }
      // Text
      else if (tagName === 'p') {
        const text = el.textContent?.trim();
        if (text && text.length > 30) {
          currentSection.content.push({ type: 'text', value: text });
        }
      }
      // Images (converting relative to absolute)
      else if (tagName === 'img') {
        const src = el.getAttribute('src');
        if (src) {
          const absoluteUrl = new URL(src, targetUrl).href;
          if (options.ignorePlaceholderImages && src.indexOf('placeholder') >= 0) {
            console.log(`skipping ${src} as placeholder likely`);
          }
          else {
            currentSection.content.push({
              type: 'image',
              url: absoluteUrl,
              alt: el.getAttribute('alt') || ''
            });
          }
        }
      }
    });

    // Final push
    summary.push(currentSection);
    console.log({ summary })
    return summary;

  } catch (error) {
    console.error("Failed to parse page:", error);
  }
}

