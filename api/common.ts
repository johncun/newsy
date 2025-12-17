import { FeedItem } from "../shared/feed-types.js"
import { decode } from "html-entities"

export function parseXMLElement(xmlText: string, tagName: string, index = 0): string {
  const regex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, "i")
  let searchText = xmlText
  let count = 0

  while (count < index) {
    const match = searchText.match(regex)
    if (!match) return ""
    searchText = searchText.substring(match.index! + match[0].length)
    count++
  }

  const match = searchText.match(regex)
  if (!match) return ""

  let value = match[1].trim()

  // Handle CDATA sections
  const cdataMatch = value.match(/^<!\[CDATA\[([\s\S]*?)\]\]>$/)
  if (cdataMatch) {
    value = cdataMatch[1].trim()
  }

  return value.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&")
}

export function getItemsFromXML(xmlText: string): string[] {
  const items: string[] = []
  const itemRegex = /<item>([\s\S]*?)<\/item>/g
  let match

  while ((match = itemRegex.exec(xmlText)) !== null) {
    items.push(match[1])
  }

  return items
}

export function extractImageFromItem(itemText: string): string | undefined {
  // media:content
  let match = itemText.match(/<media:content[^>]+url=["']([^"']+)["']/)
  if (match) return match[1]

  // media:thumbnail
  match = itemText.match(/<media:thumbnail[^>]+url=["']([^"']+)["']/)
  if (match) return match[1]

  // enclosure with image type
  match = itemText.match(/<enclosure[^>]+url=["']([^"']+)["'][^>]*type=["']image/)
  if (match) return match[1]

  // img in description
  const description = parseXMLElement(itemText, "description")
  match = description.match(/<img[^>]+src=["']?([^"'\s>]+)["']?/)
  if (match) return match[1]

  // picture > source
  match = description.match(/<picture[^>]*>[\s\S]*?<source[^>]+srcset=["']([^"']+)["']/)
  if (match) {
    const urls = match[1].split(",").map((s) => s.trim().split(/\s+/)[0])
    return urls[0]
  }

  // picture > img
  match = description.match(/<picture[^>]*>[\s\S]*?<img[^>]+src=["']([^"']+)["']/)
  if (match) return match[1]

  return undefined
}

export function getPlaceholderImageUrl(title: string): string {
  const hash = title.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)

  const colors = [
    { from: "#3b82f6", to: "#06b6d4" },
    { from: "#8b5cf6", to: "#ec4899" },
    { from: "#f59e0b", to: "#ef4444" },
    { from: "#10b981", to: "#06b6d4" },
    { from: "#f97316", to: "#f59e0b" },
    { from: "#6366f1", to: "#3b82f6" },
  ]

  const colorSet = colors[hash % colors.length]
  const svg = `<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${colorSet.from};stop-opacity:1" />
        <stop offset="100%" style="stop-color:${colorSet.to};stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="800" height="600" fill="url(#grad)"/>
    <text x="50%" y="50%" font-size="24" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle" font-family="system-ui">
      ${title.slice(0, 40)}
    </text>
  </svg>`

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`
}
export async function parseRSSFeed(feedUrl: string, sourceName: string): Promise<FeedItem[]> {
  try {
    const response = await fetch(feedUrl, {
      headers: { "User-Agent": "NewsApp/1.0" },
    })

    if (!response.ok) return []

    const text = await response.text()
    const items = getItemsFromXML(text)

    const feedItems: FeedItem[] = []

    for (let i = 0; i < Math.min(items.length, 20); i++) {
      const itemText = items[i]
      const title = decode(parseXMLElement(itemText, "title"))
      const description = decode(parseXMLElement(itemText, "description"))
      let link = parseXMLElement(itemText, "link")
      const pubDate = parseXMLElement(itemText, "pubDate")
      const guid = parseXMLElement(itemText, "guid")

      if (!title) continue
      if (!link) {
        // Try alternate link formats
        const linkMatch = itemText.match(/<link[^>]*href=["']([^"']+)["']/)
        if (!linkMatch) continue
        link = linkMatch[1]
        if (!link) continue
      }

      let image = extractImageFromItem(itemText)?.replaceAll('&amp;', '&')
      if (!image) {
        image = getPlaceholderImageUrl(title)
      }

      feedItems.push({
        title,
        description: description.replace(/<[^>]*>/g, "").slice(0, 200),
        link,
        pubDate,
        source: sourceName,
        image,
        guid: guid || link,
      })
    }

    return feedItems
  } catch (error) {
    console.error(`Error parsing feed from ${sourceName}:`, error)
    return []
  }
}

export interface VotingItem {
  name: string;
  n: number;
}

export function distributeWeight(list: VotingItem[], M: number): VotingItem[] {
  if (list.length === 0) return [];
  if (M < list.length) return list.map(item => ({ ...item, n: 0 }));

  const totalWeight = list.reduce((sum, item) => sum + item.n, 0);

  if (totalWeight === 0) {
    const base = Math.floor(M / list.length);
    let extra = M % list.length;
    return list.map((item, i) => ({
      name: item.name,
      n: i < extra ? base + 1 : base
    }));
  }

  const adjustedM = M - list.length;

  const shares = list.map(item => {
    const quota = (item.n / totalWeight) * adjustedM;
    return {
      name: item.name,
      base: 1 + Math.floor(quota),
      remainder: quota - Math.floor(quota)
    };
  });

  const currentTotal = shares.reduce((sum, s) => sum + s.base, 0);
  let remainderToDistribute = M - currentTotal;

  const sortedShares = [...shares].sort((a, b) => b.remainder - a.remainder);

  for (let i = 0; i < remainderToDistribute; i++) {
    const itemToUpdate = sortedShares[i];
    const target = shares.find(s => s === itemToUpdate);
    if (target) target.base += 1;
  }

  return shares.map(s => ({
    name: s.name,
    n: s.base
  }));
}
