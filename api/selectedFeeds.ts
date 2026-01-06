import {
  convertStringToWordStruct,
  FeedItem,
  FeedItems,
  FeedRequestSchema,
  FeedResult,
  hasIgnoreWord,
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
    const { sources, ignoreWords, maxPerRequest, lastPubTimeMs, maxLookbackTimeHrs, alreadyKnown } = FeedRequestSchema.parse(request.body)

    const allFeeds = await Promise.all(
      sources.map(feed => parseRSSFeed(feed.url, feed.name)),
    )

    const withinLookback = (a: FeedItem): boolean => {
      if (!a.pubDate) return false;
      const pub = new Date(a.pubDate).getTime()

      if (maxLookbackTimeHrs === 0) {
        return pub >= lastPubTimeMs
      }

      const now = Date.now()
      return (now - pub) < (maxLookbackTimeHrs * 3600 * 1000)
    }
    const ws = convertStringToWordStruct(ignoreWords)
    const check = hasIgnoreWord(ws)

    const findNoIgnoredWords = (a: FeedItem): boolean => {
      if (!ignoreWords) return true;

      const res = !check(a.title) && !check(a.description)
      if (!res) {
        console.log(`IGNORE!! found words ${ignoreWords} in title ${a.title} or description ${a.description}`)
      }
      return res;
    }

    const knowns = new Set(alreadyKnown || [])

    const allItems: FeedItem[] = allFeeds
      .flat()
      .filter(fi => fi.title && fi.link)
      .filter(fi => !knowns.has(fi.guid))
      .filter(findNoIgnoredWords)
      .filter(withinLookback)

    console.log({ knowns: knowns.size, allFeeds: allFeeds.flat().length, allItems: allItems.length })


    let results = allItems

    const cappedAmount = Math.min(maxPerRequest, allItems.length)

    if (cappedAmount >= maxPerRequest) {
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

      const spread = distributeWeight(voting, cappedAmount)

      console.log({ cappedAmount, voting, spread })

      results = spread.reduce((prev, weight) => {
        return [...prev, ...(feedsMapped[weight.name]?.slice(0, weight.n) || [])]
      }, [] as FeedItems)
    }

    console.log({
      results: results.map(f => ({ s: f.source })),
    })
    console.log('total articles returned:', results.length)

    const sortedResults = results
      .sort((a, b) => {
        const dateA = new Date(a.pubDate).getTime()
        const dateB = new Date(b.pubDate).getTime()
        if (isNaN(dateA) || isNaN(dateB)) {
          return 0
        }
        return dateB - dateA
      })

    const result: FeedResult = {
      items: sortedResults,
      count: results.length,
      sources: sources.map(src => src.name),
      lastUpdated: new Date().toISOString(),
    }

    response.status(200).setHeader('X-Content-Type-Options', 'nosniff').json(result)
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

