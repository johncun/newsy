import {
  FeedItem,
  FeedItems,
  FeedRequestSchema,
  FeedResult,
} from '../shared/feed-types.js'
import { distributeWeight, parseRSSFeed, VotingItem } from './common.js'
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { z } from 'zod'

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' })
  }

  try {
    const { sources, maxPerRequest } = FeedRequestSchema.parse(request.body)

    const allFeeds = await Promise.all(
      sources.map(feed => parseRSSFeed(feed.url, feed.name)),
    )

    const allItems: FeedItem[] = allFeeds
      .flat()
      .filter(item => item.title && item.link)
      .sort((a, b) => {
        const dateA = new Date(a.pubDate).getTime()
        const dateB = new Date(b.pubDate).getTime()
        if (isNaN(dateA) || isNaN(dateB)) {
          return 0
        }
        return dateB - dateA
      })

    const feedsMapped = allItems.reduce(
      (prev, it) => {
        return { ...prev, [it.source]: [...(prev[it.source] || []), it] }
      },
      {} as { [key: string]: FeedItem[] },
    )

    const voting: VotingItem[] = sources.map(src => ({
      name: src.name,
      n: src.votes,
    }))
    const cappedAmount = Math.min(maxPerRequest, allItems.length)

    const spread = distributeWeight(voting, cappedAmount)
    console.log({ cappedAmount, voting, spread })

    const results = spread.reduce((prev, weight) => {
      return [...prev, ...(feedsMapped[weight.name]?.slice(0, weight.n) || [])]
    }, [] as FeedItems)
    console.log({
      results: results.map(f => ({ s: f.source })),
    })
    console.log('total articles returned:', results.length)

    const result: FeedResult = {
      items: results,
      count: results.length,
      sources: sources.map(src => src.name),
      lastUpdated: new Date().toISOString(),
    }

    response.status(200).json(result)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return response.status(400).json({
        error: 'Validation failed',
        details: error.issues.map(e => ({ path: e.path, message: e.message })),
      })
    }

    return response.status(500).json({ error: 'Internal Server Error' })
  }
}
