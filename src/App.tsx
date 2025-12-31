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
  performFetchFeedsTrigger,
} from './signals'
import IntroScreen from './IntroScreen'
import MainPage from './MainPage'
import { allGuids, autoClearKills } from './db'
import { timestampFetch } from './common'

const fetchItems = async (): Promise<FeedResult> => {
  const response = await fetch('/api/selectedFeeds', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sources: settings.feeds,
      maxPerRequest: +settings.maxFeedsPerRequest,
      maxLookbackTime: +settings.maxLookbackTime,
      fullMode: settings.fullMode,
      alreadyKnown: [...allGuids()]
    }),
  })
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`)
  }
  timestampFetch()

  const data = await response.json()
  const validatedData = FeedResult.parse(data)
  validatedData.items = validatedData.items.map(fr => {
    fr.pubDate = fr.pubDate || new Date().toUTCString();
    console.log({ title: fr.title, d: fr.pubDate })
    return fr
  })
  return validatedData

}

const App: any = () => {
  const [startup, setStartup] = createSignal(true)
  const [feed] = createResource(performFetchFeedsTrigger, fetchItems)

  onMount(() => {
    setTimeout(() => setStartup(false), 3000)
    autoClearKills()
  })


  return <ErrorBoundary fallback={<div>Failed to load or validate API data.</div>}>
    <Meta name="apple-mobile-web-app-status-bar-style" content="black" />
    <Meta name="apple-mobile-web-app-capable" content="yes" />
    <Meta
      name="apple-mobile-web-app-status-bar-style"
      content="black-translucent"
    />
    <Meta name="theme-color" content="#242424" />
    <Meta
      name="viewport"
      content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"
    />
    <Switch fallback={<MainPage feed={feed} />}>
      <Match when={startup()}>
        <IntroScreen />
      </Match>
    </Switch>
  </ErrorBoundary >
}

export default App
