import {
  FeedResult,
} from '@shared/feed-types'
import { settings } from '@shared/settings'
import { Meta } from '@solidjs/meta'
import {
  createResource,
  createSignal,
  ErrorBoundary,
  Match,
  onMount,
  Switch,
} from 'solid-js'
import {
  isFetching,
  readerPageInfo,
} from './signals'
import IntroScreen from './IntroScreen'
import Reader from './Reader'
import MainPage from './MainPage'

const fetchItems = async (): Promise<FeedResult> => {
  const response = await fetch('/api/selectedFeeds', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sources: settings.feeds,
      maxPerRequest: 20,
    }),
  })
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`)
  }
  const data = await response.json()
  const validatedData = FeedResult.parse(data)

  validatedData.items = validatedData.items.map(fr => {
    fr.pubDate = fr.pubDate || new Date().toUTCString();
    console.log(fr.title, fr.pubDate)
    return fr
  })
  return validatedData

}

const App: any = () => {
  const [startup, setStartup] = createSignal(true)
  const [feed] = createResource(isFetching, fetchItems)

  onMount(() => {
    setTimeout(() => setStartup(false), 6000)
  })


  return <ErrorBoundary fallback={<div>Failed to load or validate API data.</div>}>
    <Meta name="mobile-web-app-capable" content="yes" />
    <Meta name="apple-mobile-web-app-capable" content="yes" />
    <Meta
      name="apple-mobile-web-app-status-bar-style"
      content="black-translucent"
    />
    <Meta name="theme-color" content="#120a0a" />
    <Meta
      name="viewport"
      content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
    />
    <Switch fallback={<MainPage feed={feed} />}>
      <Match when={startup()}>
        <IntroScreen onComplete={() => setStartup(false)} />
      </Match>
      <Match when={readerPageInfo()}>
        <Reader value={readerPageInfo()}
          originalLink="https://www.bbc.com/news/articles/cvgjzpglw4yo\?at_medium\=RSS\&at_campaign\=rss" />
      </Match>
    </Switch>
  </ErrorBoundary >
}

export default App
