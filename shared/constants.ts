import { SourceRecord } from './feed-types'
export const SETTINGS_KEY = "newsy:settings"

export const DEFAULT_FEED_URLS: SourceRecord[] = [
  { id: "__initialid-00", name: 'BBC News', url: 'https://feeds.bbci.co.uk/news/rss.xml', votes: 5 },
  { id: "__initialid-01", name: 'The Guardian', url: 'https://www.theguardian.com/uk/rss', votes: 5 },
  {
    id: "__initialid-02", name: 'ABC Australia',
    url: 'https://www.abc.net.au/news/feed/2942460/rss.xml',
    votes: 3,
  },
  { id: "__initialid-03", name: 'The Journal', url: 'https://www.thejournal.ie/feed/', votes: 3 },
  {
    id: "__initialid-04", name: 'Sky News',
    url: 'https://feeds.skynews.com/feeds/rss/home.xml',
    votes: 4,
  },
  { id: "__initialid-05", name: 'RTE', url: 'https://www.rte.ie/rss/news.xml', votes: 2 },
  { id: "__initialid-06", name: 'RTE Sport', url: 'https://www.rte.ie/rss/sport.xml', votes: 1 },
  {
    id: "__initialid-07", name: 'Galway Beo',
    url: 'https://www.galwaybeo.ie/?service=rss',
    votes: 1,
  },
  { id: "__initialid-08", name: "FT", url: "https://www.ft.com/news-uk?format=rss", votes: 1 },
  {
    id: "__initialid-09", name: "Guardian Aus", url: "https://www.theguardian.com/australia-news/rss", votes: 1
  },
  { id: "__initialid-0A", name: "The Age", url: "https://www.theage.com.au/rss/feed.xml", votes: 1 },
  { id: "__initialid-0B", name: "News.com.au", url: "https://news.com.au/content-feeds/latest-news-national/", votes: 1 },
  { id: "__initialid-0C", name: "SBS", url: "https://www.sbs.com.au/news/feed", votes: 1 },
  { id: "__initialid-0D", name: "Noteworthy", url: "https://www.noteworthy.ie/feed/", votes: 1 },
  { id: "__initialid-0E", name: "Huff Post", url: "https://www.huffingtonpost.co.uk/feeds/index.xml", votes: 1 },
  { id: "__initialid-0F", name: "MEN", url: "https://www.manchestereveningnews.co.uk/?service=rss", votes: 1 },
  {
    id: "__initialid-10", name: 'Dublin Live',
    url: 'https://www.dublinlive.ie/?service=rss',
    votes: 1,
  },
]
