import { SourceRecord } from './feed-types'

export const DEFAULT_FEED_URLS: SourceRecord[] = [
  { name: 'BBC News', url: 'https://feeds.bbci.co.uk/news/rss.xml', votes: 5 },
  { name: 'The Guardian', url: 'https://www.theguardian.com/uk/rss', votes: 5 },
  {
    name: 'ABC Australia',
    url: 'https://www.abc.net.au/news/feed/2942460/rss.xml',
    votes: 3,
  },
  { name: 'The Journal', url: 'https://www.thejournal.ie/feed/', votes: 3 },
  {
    name: 'Sky News',
    url: 'https://feeds.skynews.com/feeds/rss/home.xml',
    votes: 4,
  },
  { name: 'RTE', url: 'https://www.rte.ie/rss/news.xml', votes: 2 },
  { name: 'RTE Sport', url: 'https://www.rte.ie/rss/sport.xml', votes: 1 },
  {
    name: 'Galway Beo',
    url: 'https://www.galwaybeo.ie/?service=rss',
    votes: 1,
  },
  { name: "FT", url: "https://www.ft.com/news-uk?format=rss", votes: 1 },
  {
    name: "Guardian Aus", url: "https://www.theguardian.com/australia-news/rss", votes: 1
  },
  { name: "The Age", url: "https://www.theage.com.au/rss/feed.xml", votes: 1 },
  { name: "News.com.au", url: "https://news.com.au/content-feeds/latest-news-national/", votes: 1 },
  { name: "SBS", url: "https://www.sbs.com.au/news/feed", votes: 1 },
  { name: "Noteworth", url: "https://www.noteworthy.ie/feed/", votes: 1 },
  { name: "Huff Post", url: "https://www.huffingtonpost.co.uk/feeds/index.xml", votes: 1 },
  { name: "MEN", url: "https://www.manchestereveningnews.co.uk/?service=rss", votes: 1 },
  {
    name: 'Dublin Live',
    url: 'https://www.dublinlive.ie/?service=rss',
    votes: 1,
  },
]
