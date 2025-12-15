import { z } from 'zod';

export const FeedItem = z.object({
  title: z.string(),
  description: z.string(),
  link: z.string(),
  pubDate: z.string(),
  source: z.string(),
  image: z.string().optional(),
  guid: z.string(),
});

export const FeedItems = z.array(FeedItem);

export const FeedResult = z.object({
  items: FeedItems,
  count: z.number(),
  sources: z.array(z.string()),
  lastUpdated: z.string(),
});

export type FeedItem = z.infer<typeof FeedItem>;
export type FeedItems = z.infer<typeof FeedItems>;
export type FeedResult = z.infer<typeof FeedResult>;

export const ArticleState = z.enum(["live", "saved", "deleted"]);
export type ArticleState = z.infer<typeof ArticleState>;

export const ArticleRecord = FeedItem.extend({
  state: ArticleState,
  savedAt: z.number().optional(),
  deletedAt: z.number().optional(),
  base64Image: z.string().optional(),
})

export type ArticleRecord = z.infer<typeof ArticleRecord>;
export const ArticleRecords = z.array(ArticleRecord);
export type ArticleRecords = z.infer<typeof ArticleRecords>;
