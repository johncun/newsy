import { parseHTML } from 'linkedom';
import { Readability } from '@mozilla/readability';

const url = Bun.argv[2] || '';
if (!url) {
  console.error("Usage: bun readability-cli.ts <url>");
  process.exit(1);
}

async function run() {
  const response = await fetch(url);
  const html = await response.text();

  // 1. Initialize LinkeDOM
  const { document } = parseHTML(html);

  // 2. Readability shim
  // Readability checks instanceof Node/Element. LinkeDOM's versions 
  // need to be available for the parser to work correctly.
  const reader = new Readability(document, {
    // Optional: Pass classes to preserve or strip
    classesToPreserve: ['caption']
  });

  const article = reader.parse();

  if (!article) {
    console.error("Failed to extract content.");
    return;
  }

  // 3. Process the "Clean" HTML back through LinkeDOM to structure it
  const cleanDoc = parseHTML(article.content).document;

  // We extract images, headings, and paragraphs in document order
  const elements = cleanDoc.querySelectorAll('h1, h2, h3, p, img');
  const sections: any[] = [];
  let currentSection: any = { title: article.title, content: [] };

  elements.forEach((el: any) => {
    const tag = el.tagName.toLowerCase();

    if (tag.startsWith('h')) {
      if (currentSection.content.length > 0) sections.push(currentSection);
      currentSection = { title: el.textContent?.trim(), content: [] };
    } else if (tag === 'p') {
      const text = el.textContent?.trim();
      if (text) currentSection.content.push({ type: 'text', value: text });
    } else if (tag === 'img') {
      // Logic to ensure absolute URLs
      const src = el.getAttribute('src');
      const absoluteSrc = src ? new URL(src, url).href : null;
      if (absoluteSrc) {
        currentSection.content.push({
          type: 'image',
          url: absoluteSrc,
          alt: el.getAttribute('alt')
        });
      }
    }
  });

  sections.push(currentSection);

  // 4. Final Result
  const result = {
    metadata: {
      title: article.title,
      author: article.byline,
      site: article.siteName,
      excerpt: article.excerpt
    },
    sections
  };

  await Bun.write('readability.json', JSON.stringify(result, null, 2));
  console.log("✅ Extraction complete. Check readability.json");
}

run();
