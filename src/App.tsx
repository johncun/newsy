import {
  getAllByState,
  getArticleByGuid,
  killArticle,
  killArticles,
  memData,
  refreshDbWithFeedItems,
  updateState,
  updateStates,
} from './db'
import {
  ErrorBoundary,
  For,
  Show,
  Accessor,
  Match,
  Switch,
  createEffect,
  createResource,
  createSignal,
  onMount,
  Resource,
} from 'solid-js'
import {
  isFetching,
  menuGuid,
  mode,
  setIsFetching,
  setMenuGuid,
  setShowOptions,
  showOptions,
} from './signals'
import {
  ArticleRecord,
  ArticleRecords,
  ArticleState,
  FeedResult,
} from '@shared/feed-types'
import { useRegisterSW } from 'virtual:pwa-register/solid'
import { Motion, Presence } from 'solid-motionone'
import Card, { Action } from './Card'
import { Meta } from '@solidjs/meta'
// import FeedsForm from './FeedsForm'
import { SvgCross } from './svgs'
import { Pulse } from './Pulse'
import Banner from './Banner'
import { SettingsPage } from './Settings'
import { settings } from '@shared/settings'
import IntroScreen from './IntroScreen'

function UpdateToast() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  return (
    <Show when={needRefresh()}>
      <div class="fixed bottom-4 right-4 bg-white p-4 shadow-lg rounded-lg border">
        <span>New content available, click on reload button to update.</span>
        <button onClick={() => updateServiceWorker(true)}>Reload</button>
        <button onClick={() => setNeedRefresh(false)}>Close</button>
      </div>
    </Show>
  )
}

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
    setTimeout(() => setStartup(false), 40000)
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
    <Show when={startup()}><IntroScreen onComplete={() => setStartup(false)} /></Show>
    <Show when={!startup()}><MainPage feed={feed} /></Show>
  </ErrorBoundary>
}

const MainPage: any = (props: { feed: Resource<FeedResult> }) => {
  // The type of the resource is automatically inferred as Resource<HelloData | undefined>
  createEffect(() => {
    if (props.feed.error) {
      console.error('Error loading or validating API data:', props.feed.error)
    }
    console.log('Fetched items:', props.feed()?.count)

    refreshDbWithFeedItems(props.feed()?.items || [])

    const md = memData()

    console.log('total items:', md.length)
    console.log('total LIVE items:', getAllByState('live')(md).length)
    console.log(
      getAllByState('saved')(md)
        .map(it => it.guid)
        .join(' '),
    )

    setIsFetching(false)
  })

  const [isUpScrolled, setIsUpScrolled] = createSignal(false)
  const [isDnScrolled, setIsDnScrolled] = createSignal(false)

  let upSentinelRef!: HTMLDivElement
  let dnSentinelRef!: HTMLDivElement
  let scrollRef!: HTMLDivElement

  onMount(() => {
    const upObserver = new IntersectionObserver(
      ([entry]) => {
        setIsUpScrolled(!entry.isIntersecting)
      },
      { threshold: [1.0] },
    )
    upObserver.observe(upSentinelRef!)

    const dnObserver = new IntersectionObserver(
      ([entry]) => {
        setIsDnScrolled(entry.isIntersecting)
      },
      { threshold: [1.0] },
    )
    dnObserver.observe(dnSentinelRef!)

    return () => {
      upObserver.disconnect()
      dnObserver.disconnect()
    }
  })

  createEffect(() => {
    if (mode() && scrollRef) {
      scrollRef.scrollTop = 0
    }
  })

  const toTop = () => {
    if (!scrollRef) return
    scrollRef.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const toBottom = () => {
    if (!scrollRef) return
    scrollRef.scrollTo({
      top: 100000, //scrollRef.scrollHeight,
      behavior: 'smooth',
    })
  }


  return (
    <>
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
      <Banner />
      <Show when={isFetching()}>
        <div class="absolute inset-0 flex items-center justify-center bg-black/70 z-50">
          <Pulse />
        </div>
      </Show>
      <div
        ref={upSentinelRef}
        class={`absolute z-30 ${isUpScrolled() ? 'opacity-100' : 'opacity-0'} h-8 w-8 right-2 flex text-2xl items-center justify-center top-18 rounded-full bg-black/90 text-cyan-100`}
        onClick={toTop}>
        ⇡
      </div>
      <div
        ref={dnSentinelRef}
        class={`absolute z-30 ${!isDnScrolled() ? 'opacity-100' : 'opacity-0'} h-8 w-8 right-4 flex text-2xl items-center justify-center bottom-4 rounded-full bg-black/60 text-cyan-100`}
        onClick={toBottom}>
        ⇣
      </div>
      <div
        ref={scrollRef}
        class="absolute top-0 bottom-0 left-4 right-4 overflow-x-hidden overflow-y-scroll">
        <div class="relative flex flex-col pt-16 pb-8 gap-4 items-center py-4">
          <div ref={upSentinelRef} class="h-1 w-1"></div>
          <List as={memData} mode={mode} />
          <div ref={dnSentinelRef} class="h-1 w-1"></div>
        </div>
      </div>
      <Presence exitBeforeEnter>
        {menuGuid() && (
          <Motion.div
            exit={{ scale: 0 }}
            transition={{ duration: 0.2 }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            id="menu"
            class="absolute z-50 inset-0 bg-slate-800/50">
            <div class="absolute rounded-xl inset-8 border border-slate-400 bg-linear-to-b from-slate-700 to-[#242424] text-black">
              <OptionMenuItems />
            </div>
          </Motion.div>
        )}
      </Presence>
      <Presence exitBeforeEnter>
        {showOptions() && (
          <Motion.div
            exit={{ y: '100%' }}
            transition={{ duration: 0.2 }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            id="menu"
            class="absolute z-50 inset-0">
            <div class="absolute inset-0 border-0 border-slate-100 bg-linear-to-b from-zinc-800 to-slate-800 text-black">
              <div class="absolute inset-x-0 top-0 h-12 border-b border-b-slate-900 flex text-xl items-center justify-center text-white ">
                Configuration
              </div>
              <div
                class="absolute w-8 h-8 p-1 cursor-pointer top-2 right-2 flex items-center justify-center text-white "
                onClick={() => setShowOptions(false)}>
                <SvgCross fill="orange" />{' '}
              </div>
              <div class="absolute inset-0 top-16 left-2 right-2 bottom-1 overflow-x-hidden px-2">
                <SettingsPage />
              </div>
            </div>
          </Motion.div>
        )}
      </Presence>
      <UpdateToast />
    </>
  )
}

const OptionMenuItems = () => {
  const [a, setA] = createSignal<ArticleRecord>()

  onMount(() => {
    setA(getArticleByGuid(menuGuid()))
  })

  const follows = (): ArticleRecords => {
    const as = getAllByState(mode())(memData())
    if (!as || !as.length) return []
    const idx = as.findIndex(a => a.guid === menuGuid())
    if (idx < 0) return []
    return as.slice(idx)
  }

  const delFollow = () => {
    if (!follows().length) return

    const gs = follows().map(a => a.guid)
    updateStates(gs, 'deleted')

    setMenuGuid('')
  }

  const saveFollow = () => {
    if (!follows().length) return

    const gs = follows().map(a => a.guid)
    updateStates(gs, 'saved')

    setMenuGuid('')
  }

  const killFollow = () => {
    if (!follows().length) return

    const gs = follows().map(a => a.guid)
    killArticles(gs)

    setMenuGuid('')
  }

  return (
    <div class="flex flex-col absolute inset-2">
      <div class="flex items-center justify-end">
        <div onClick={() => setMenuGuid('')} class="w-6 h-6">
          <svg viewBox="0 0 1024 1024">
            <path
              fill="#ffffff"
              d="M195.2 195.2a64 64 0 0 1 90.496 0L512 421.504 738.304 195.2a64 64 0 0 1 90.496 90.496L602.496 512 828.8 738.304a64 64 0 0 1-90.496 90.496L512 602.496 285.696 828.8a64 64 0 0 1-90.496-90.496L421.504 512 195.2 285.696a64 64 0 0 1 0-90.496z"
            />
          </svg>
        </div>
      </div>
      <div>
        {a() && (
          <div class="bg-[#ebe9e4] bg-[url(https://www.transparenttextures.com/patterns/felt.png)] bg-bg-blend-multiply text-slate-700 font-[Noto_Serif] ml-2 mr-2 mt-2 mb-6 rounded-md font-bold p-2 border-b border-b-slate-500">
            <div class="max-w-prose text-lg _leading-relaxed border-black/10 p-5 bg-white/30">
              {a()!.title}
            </div>
          </div>)}
        {mode() === 'live' && (
          <div class="text-slate-400 p-4 flex justify-center">
            <button
              class="rounded-md bg-green-200 text-slate-700 cursor-pointer p-2"
              onClick={
                saveFollow
              }>{`Save this article and following ${follows().length ? (follows().length + ' article(s)') : ''}`}</button>
          </div>
        )}
        {mode() === 'live' && (
          <div class="text-slate-400 p-4 flex justify-center">
            <button
              class="rounded-md bg-orange-400 text-slate-100 cursor-pointer p-2"
              onClick={
                delFollow
              }>{`Delete this article and following ${follows().length ? (follows().length + ' article(s)') : ''}`}</button>
          </div>
        )}

        {mode() === 'deleted' && (
          <div class="text-slate-400 p-4 flex justify-center">
            <button
              class="rounded-md bg-red-700 text-slate-100 cursor-pointer p-2"
              onClick={
                killFollow
              }>{`KILL this article and following ${follows().length ? (follows().length + ' article(s)') : ''}`}</button>
          </div>
        )}

        {mode() === 'saved' && (
          <div class="text-slate-400 p-4 flex justify-center">
            <button
              class="rounded-md bg-orange-400 text-slate-900 cursor-pointer p-2"
              onClick={
                delFollow
              }>{`Delete this article and following ${follows().length ? (follows().length + ' article(s)') : ''}`}</button>
          </div>
        )}
      </div>
    </div >
  )
}

type ActionToState = { [key: string]: ArticleState }
const actionToState: ActionToState = {
  Save: 'saved',
  Delete: 'deleted',
}
const onSwipeRight = (guid: string, action: Action) => {
  if (action === '') return
  if (action === 'Kill') killArticle(guid)

  updateState(guid, actionToState[action])
}
const onSwipeLeft = (guid: string, action: Action) => {
  if (action === '') return
  if (action === 'Kill') killArticle(guid)

  updateState(guid, actionToState[action])
}

const List = (props: {
  as: Accessor<ArticleRecords>
  mode: Accessor<ArticleState>
}) => {
  const as = () => getAllByState(mode())(props.as())

  return <Switch fallback={
    <For each={as()}>
      {(it, idx) => (
        <Card
          data={it}
          index={idx() + 1}
          onSwipeLeft={onSwipeLeft}
          onSwipeRight={onSwipeRight}
        />
      )}
    </For>
  }>
    <Match when={!as()?.length}>
      <div class="w-full h-40 text-zinc-500 inset-0 flex items-center justify-center">
        <div>{`No items in ${props.mode()} list`}</div>
      </div>
    </Match>
  </Switch>
}

export default App
