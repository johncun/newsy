import { FeedItem, FeedResult } from '@/schemas/FeedItem';
import { VercelRequest, VercelResponse } from '@vercel/node';

const FEED_URLS = [
  { name: "BBC News", url: "https://feeds.bbci.co.uk/news/rss.xml" },
  { name: "The Guardian", url: "https://www.theguardian.com/uk/rss" },
  { name: "The Journal", url: "https://www.thejournal.ie/feed/" },
  { name: "Sky News", url: "https://feeds.skynews.com/feeds/rss/home.xml" },
]

export default async function handler(
  _request: VercelRequest,
  response: VercelResponse
) {

  try {
    const allFeeds = await Promise.all(FEED_URLS.map((feed) => parseRSSFeed(feed.url, feed.name)))

    const allItems = allFeeds
      .flat()
      .filter((item) => item.title && item.link)
      .sort((a, b) => {
        const dateA = new Date(a.pubDate).getTime()
        const dateB = new Date(b.pubDate).getTime()
        if (isNaN(dateA) || isNaN(dateB)) {
          return 0
        }
        return dateB - dateA
      })
      .slice(0, 100)

    console.log("total articles returned:", allItems.length)

    const result: FeedResult = {
      items: allItems,
      count: allItems.length,
      sources: FEED_URLS.map((f) => f.name),
      lastUpdated: new Date().toISOString(),
    }

    response.status(200).json(result)
  } catch (error) {
    console.error("Error in feeds API:", error)
    response.status(500).json({ error: "Failed to fetch feeds" })
  }
}

// Simple XML parser
function parseXMLElement(xmlText: string, tagName: string, index = 0): string {
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

function getItemsFromXML(xmlText: string): string[] {
  const items: string[] = []
  const itemRegex = /<item>([\s\S]*?)<\/item>/g
  let match

  while ((match = itemRegex.exec(xmlText)) !== null) {
    items.push(match[1])
  }

  return items
}

function extractImageFromItem(itemText: string): string | undefined {
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

function getPlaceholderImageUrl(title: string): string {
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

async function parseRSSFeed(feedUrl: string, sourceName: string): Promise<FeedItem[]> {
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
      const title = parseXMLElement(itemText, "title")
      const description = parseXMLElement(itemText, "description")
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


