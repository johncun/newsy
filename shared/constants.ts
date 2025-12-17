import { SourceRecord } from "./feed-types";

export const DEFAULT_FEED_URLS: SourceRecord[] = [

  { name: "BBC News", url: "https://feeds.bbci.co.uk/news/rss.xml", votes: 5 },
  { name: "The Guardian", url: "https://www.theguardian.com/uk/rss", votes: 5 },
  { name: "Sydney Morning Herald", url: "https://www.smh.com.au/rss/feed.xml", votes: 3 },
  { name: "The Journal", url: "https://www.thejournal.ie/feed/", votes: 3 },
  { name: "Sky News", url: "https://feeds.skynews.com/feeds/rss/home.xml", votes: 4 },
  { name: "RTE", url: "https://www.rte.ie/rss/news.xml", votes: 2 },
  { name: "RTE Sport", url: "https://www.rte.ie/rss/sport.xml", votes: 1 },
  { name: "Galway Beo", url: "https://www.galwaybeo.ie/?service=rss", votes: 1 },
  { name: "Dublin Live", url: "https://www.dublinlive.ie/?service=rss", votes: 1 },
]


