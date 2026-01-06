import { createEffect, createSignal, ErrorBoundary, onMount, Show } from "solid-js"
import { memData } from "./db"
import { Presence, Motion } from "solid-motionone"
import Banner from "./Banner"
import { Pulse } from "./Pulse"
import { mode, isFetchingFeeds, menuGuid, showOptions, setShowOptions, readerPageInfo, isFetchingStory, networkIssue } from "./signals"
import { SvgCross } from "./svgs"
import OptionMenuItems from "./OptionMenuItems"
import List from "./List"
import Reader from "./Reader"
import { useOrientationDetector } from "./OrientationDetector"
import { UpdateApplicationToast } from "./UpdateApplicationToast"
import { sanitizeSettings, settings } from "./settings-utils"
import { SettingsPage } from "./SettingsPage"

const MainPage: any = () => {
  // The type of the resource is automatically inferred as Resource<HelloData | undefined>
  {/* createEffect(() => { */ }
  {/*   if (props.feed.error) { */ }
  {/*     console.error('Error loading or validating API data:', props.feed.error) */ }
  {/*   } */ }
  {/*   untrack(() => { */ }
  {/*     console.log('refresh DB: Fetched items:', props.feed()?.count) */ }
  {/**/ }
  {/*     refreshDbWithFeedItems(props.feed()?.items || []) */ }
  {/*   }); */ }
  {/* }) */ }

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
    scrollRef.scrollTo({ top: 0, behavior: 'instant' })
  }

  const toBottom = () => {
    if (!scrollRef) return
    scrollRef.scrollTo({
      top: scrollRef.scrollHeight,
      behavior: 'instant',
    })
  }
  createEffect(() => {
    if (!isFetchingFeeds() && settings.gotoTopAfterRefresh && !readerPageInfo()) {
      setTimeout(() =>
        toTop()
        , 100)

    }
  })


  return (
    <Show when={isLandscape() === true || isLandscape() === false}>
      <div class="absolute z-0 left-[env(safe-area-inset-left)] right-[env(safe-area-inset-right)] top-[env(safe-area-inset-top)] bottom-[env(safe-area-inset-bottom)]">
        <Banner />
        <ErrorBoundary fallback={<div>Failed to load or validate API data.</div>}>
          <Show when={isFetchingFeeds() || isFetchingStory() || networkIssue()}>
            <div class={`absolute inset-0 flex items-center justify-center ${networkIssue() ? 'bg-orange-500/30' : 'bg-black/70'} z-50`}>
              <Pulse />
            </div>
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
            class={`absolute top-12 bottom-0 left-2 right-2 overflow-x-hidden overflow-y-scroll ${settings.alignStoriesInScroll ? 'snap-y' : ''}`}>
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
                class="absolute z-40 inset-0 border-0 border-slate-100 bg-linear-to-b flex flex-col from-zinc-800 to-slate-800 text-black">
                <div class="absolute inset-x-0 top-0 h-12 bg-slate-900 flex font-bold text-xl items-center  text-white ">
                  <div class="w-20 normal pl-6 font-bold text-center shadow-amber-50 shadow-2xl text-xl">Configuration</div>
                </div>
                <div class="w-8 h-8 absolute z-50 right-2 top-2 rounded-full border border-slate-700 p-1 bg-slate-300"
                  onClick={() => {
                    sanitizeSettings()
                    setShowOptions(false)
                  }
                  }>
                  <SvgCross fill="#242424" />
                </div >
                <div class="absolute inset-x-2 top-12 bottom-0 overflow-x-hidden px-2 ">
                  <SettingsPage />
                </div>
              </Motion.div>
            )}
          </Presence>
          <Show when={readerPageInfo()}>
            <Reader value={readerPageInfo()} />
          </Show>
        </ErrorBoundary>

        <UpdateApplicationToast />
      </div>
    </Show>
  )
}

export default MainPage;
