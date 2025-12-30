import { FeedResult } from "@shared/feed-types"
import { createEffect, createSignal, onMount, Resource, Show } from "solid-js"
import { memData, refreshDbWithFeedItems } from "./db"
import { Meta } from "@solidjs/meta"
import { Presence, Motion } from "solid-motionone"
import Banner from "./Banner"
import { Pulse } from "./Pulse"
import { SettingsPage } from "./Settings"
import { setIsFetching, mode, isFetching, menuGuid, showOptions, setShowOptions, readerPageInfo } from "./signals"
import { SvgCross } from "./svgs"
import OptionMenuItems from "./OptionMenuItems"
import List from "./List"
import Reader from "./Reader"
import { useOrientationDetector } from "./OrientationDetector"
import { UpdateApplicationToast } from "./UpdateApplicationToast"

const MainPage: any = (props: { feed: Resource<FeedResult> }) => {
  // The type of the resource is automatically inferred as Resource<HelloData | undefined>
  createEffect(() => {
    if (props.feed.error) {
      console.error('Error loading or validating API data:', props.feed.error)
    }
    {/* console.log('Fetched items:', props.feed()?.count) */ }

    refreshDbWithFeedItems(props.feed()?.items || [])

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

  const [isLandscape] = useOrientationDetector()

  createEffect(() => {
    if (mode() && scrollRef) {
      scrollRef.scrollTop = 0
    }
  })

  createEffect(() => console.log(`isLandscape: ${isLandscape()}`))
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
  let lastFetchTime = 0
  createEffect(() => {
    if (isFetching()) {
      lastFetchTime = Date.now()
    }
    else {
      setTimeout(() => {
        if (Date.now() - lastFetchTime < 2000 && !readerPageInfo()) toTop()
      }, 1000)
    }
  })


  return (
    <Show when={isLandscape() === true || isLandscape() === false}>
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

      <Show when={readerPageInfo()}>
        <Reader value={readerPageInfo()} />
      </Show>

      <div
        ref={upSentinelRef}
        class={`absolute z-30 ${isUpScrolled() ? 'opacity-100' : 'opacity-0'} h-8 w-8 right-1 flex text-2xl items-center justify-center top-18 rounded-full bg-black/20 text-cyan-100`}
        onClick={toTop}>
        ⇡
      </div>
      <div
        ref={dnSentinelRef}
        class={`absolute z-30 ${!isDnScrolled() ? 'opacity-100' : 'opacity-0'} h-8 w-8 right-1 flex text-2xl items-center justify-center bottom-4 rounded-full bg-black/20 text-cyan-100`}
        onClick={toBottom}>
        ⇣
      </div>
      <div
        ref={scrollRef}
        class="absolute top-14 bottom-0 left-4 right-4 overflow-x-hidden overflow-y-scroll snap-y">
        {/* <div class="relative flex flex-col pt-2 pb-8 gap-4 items-center py-4"> */}
        <div ref={upSentinelRef} class="h-1 w-1"></div>
        <List as={memData} mode={mode} />
        <div ref={dnSentinelRef} class="h-1 w-1"></div>
        {/* </div> */}
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
              <div class="absolute inset-x-0 top-0 h-12 border-b border-b-slate-900 flex font-bold text-xl items-center justify-center text-white ">
                Configuration
              </div>
              <div
                class="absolute w-8 h-8 p-1 cursor-pointer top-2 right-2 flex items-center justify-center text-white "
                onClick={() => setShowOptions(false)}>
                <SvgCross fill="white" />{' '}
              </div>
              <div class="absolute inset-0 top-16 left-2 right-2 bottom-1 overflow-x-hidden px-2">
                <SettingsPage />
              </div>
            </div>
          </Motion.div>
        )}
      </Presence>

      <UpdateApplicationToast />
    </Show>
  )
}

export default MainPage;
