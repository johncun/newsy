import { parseHTML } from 'linkedom';


export type ReaderOptions = {
  ignorePlaceholderImages?: boolean
  ignoreWords?: string
}

const DEFAULT_OPTS: ReaderOptions = {
  ignorePlaceholderImages: true,
  ignoreWords: ''
}

type ContentText = {
  type: 'text';
  value: string;
}

type ContentImage = {
  type: 'image';
  url: string;
  alt: string;
}

type ContentItem = ContentText | ContentImage;

type SectionItem = {
  title: string;
  level: string;
  content: ContentItem[]
}

export async function summarizeNewsPage(targetUrl: string, proxy: string, _options: ReaderOptions = DEFAULT_OPTS): Promise<SectionItem[]> {
  console.log(`Reader fetching: ${targetUrl}...`);
  try {
    const response = await fetch(`${proxy}?url=${encodeURIComponent(targetUrl)}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; BunParser/1.0)' }
    });
    const htmlString = await response.text();
    // 2. Parse with LinkeDOM
    const { document } = parseHTML(htmlString);

    // 3. Define the extraction logic
    const selector = 'h1, h2, h3, p, img, article, section';
    const elements = document.querySelectorAll(selector);

    const summary: SectionItem[] = [];
    let currentSection: SectionItem = { title: '', level: '', content: [] }

    elements.forEach((el: any) => {
      const tagName = el.tagName.toLowerCase();
      console.log({ tagName })

      // Heading = New Section
      if (tagName.match(/^h[1-6]$/)) {

        const title = el.textContent?.trim() || ''
        const lctitle = title.toLowerCase()
        console.log(`----------- section found  tagName=${tagName} title=${el.textContent}`)
        if (!currentSection.title) {
          currentSection.title = title
          currentSection.level = tagName
        }
        else {
          if (!lctitle.startsWith('sign up ') &&
            !lctitle.startsWith('contact ') &&
            !lctitle.startsWith('follow ')) {
          }
          summary.push(currentSection)
          console.log('----------- section ENDED')

          currentSection = {
            title,
            level: tagName,
            content: []
          };
        }

      }
      else if (tagName === 'p') {
        const text = el.textContent?.trim();
        console.log({ tag: 'p', text, currentSection })
        if (currentSection.title && text && text.length > 3 && !text.toLowerCase().includes('stock photo')) {
          console.log(`            <p>    ${text}`)
          currentSection.content.push({ type: 'text', value: text });
          console.log(`currentSection "${currentSection.level}" has content length ${currentSection.content.length}`);
        }
      }
      else if (tagName === 'img') {
        const src = el.getAttribute('src');
        console.log(`            <img>  ${src}`)
        if (src) {
          if (src.indexOf('placeholder') >= 0
            || src.indexOf('advert') >= 0
            || src.indexOf('https://i.guim.co.uk/img/uploads/') >= 0
          ) {
            console.log(`skipping ${src} as placeholder likely`);
          }
          else {
            const absoluteUrl = new URL(src, targetUrl).href;
            console.log(`                alt=${el.getAttribute('alt')}`)
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
    if (currentSection.title && currentSection.content.length > 0) {
      console.log('----------- section ENDED')
      summary.push(currentSection)
    }


    return summary;

  } catch (error) {
    console.error("Failed to parse page:", error);
    throw error;
  }
}

