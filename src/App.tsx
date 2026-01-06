import {
  FeedResult, FeedRequestBody
} from '@shared/feed-types'
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
  setIsFetchingFeeds,
  setNetworkIssue,
} from './signals'
import IntroScreen from './IntroScreen'
import MainPage from './MainPage'
import { allGuids, autoClearKills, lastPubTime, refreshDbWithFeedItems } from './db'
import { timestampFetch } from './common'
import { settings } from './settings-utils'

const fetchItems = async (): Promise<FeedResult | null> => {
  try {

    const bodyObj: FeedRequestBody = {
      sources: settings.feeds,
      maxPerRequest: +settings.maxFeedsPerRequest,
      maxLookbackTimeHrs: +settings.maxLookbackTime,
      lastPubTimeMs: lastPubTime(),
      alreadyKnown: [...allGuids()],
      ignoreWords: settings.ignoreWords
    }

    const response = await fetch('/api/selectedFeeds', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bodyObj),
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


    refreshDbWithFeedItems(validatedData.items)
    setIsFetchingFeeds(false)

    console.log({ validatedData })
    return validatedData
  }
  catch (err) {
    setIsFetchingFeeds(false)
    console.error(err)
    setNetworkIssue(true)
    setTimeout(() => setNetworkIssue(false), 2000)
    return null
  }

}

const App: any = () => {
  const [startup, setStartup] = createSignal(true)
  const [feed] = createResource(performFetchFeedsTrigger,
    async (): Promise<FeedResult> => {
      const res = await fetchItems();
      if (res === null) return feed.latest!;
      else return res
    })

  onMount(() => {
    setTimeout(() => setStartup(false), 8000)
    autoClearKills()
  })

  return <ErrorBoundary fallback={<div>Failed to load or validate API data.</div>}>
    <Meta name="apple-mobile-web-app-status-bar-style" content="black" />
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
        <IntroScreen onClick={() => setStartup(false)} />
      </Match>
    </Switch>
  </ErrorBoundary >
}

export default App
