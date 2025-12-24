import { parseHTML } from 'linkedom';

// 1. Get arguments from CLI
const url = Bun.argv[2];
const outputFile = Bun.argv[3] || 'linkedom.json';

if (!url) {
  console.error("Usage: bun parse.ts <url> [outputFile]");
  process.exit(1);
}

type Options = {
  ignorePlaceholderImages: boolean
}

const DEFAULT_OPTS: Options = {
  ignorePlaceholderImages: true
}


async function summarizeNewsPage(targetUrl: string, options: Options = DEFAULT_OPTS) {
  console.log(`Fetching: ${targetUrl}...`);

  try {
    const response = await fetch(targetUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; BunParser/1.0)' }
    });
    const htmlString = await response.text();

    // 2. Parse with LinkeDOM
    const { document } = parseHTML(htmlString);

    // 3. Define the extraction logic
    const selector = 'h1, h2, h3, p, img, article, section';
    const elements = document.querySelectorAll(selector);

    const summary: any[] = [];
    let currentSection: any = { title: 'Lead', content: [] };

    elements.forEach((el: any) => {
      const tagName = el.tagName.toLowerCase();

      // Heading = New Section
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

    await Bun.write(outputFile, JSON.stringify(summary, null, 2));
    console.log(`✅ Successfully saved summary to ${outputFile}`);

  } catch (error) {
    console.error("Failed to parse page:", error);
  }
}

summarizeNewsPage(url);
