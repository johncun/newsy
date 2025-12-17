import { createResource, ErrorBoundary, createEffect, For, Accessor, onMount, createSignal, Match, Switch } from 'solid-js';
import { ArticleRecord, ArticleRecords, ArticleState, FeedResult } from '@shared/feed-types';
import Card, { Action } from './Card';
import { getAllByState, getArticleByGuid, killArticle, killArticles, memData, refreshDbWithFeedItems, updateState, updateStates } from './db';
import Banner from './Banner';
import { isFetching, menuGuid, mode, setIsFetching, setMenuGuid, setShowOptions, showOptions, userSources } from './signals';
import { Motion, Presence } from 'solid-motionone';
import { Pulse } from './Pulse';
import { SvgCross } from './svgs';
import FeedsForm from './FeedsForm';

const fetchItems = async (): Promise<FeedResult> => {
  const response = await fetch('/api/selectedFeeds', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sources: userSources,
      maxPerRequest: 20

    }),
  });
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }
  const data = await response.json();
  const validatedData = FeedResult.parse(data);

  return validatedData;
};

const App: any = () => {
  // The type of the resource is automatically inferred as Resource<HelloData | undefined>
  const [feed] = createResource(() => isFetching(), fetchItems);

  createEffect(() => {
    if (feed.error) {
      console.error("Error loading or validating API data:", feed.error);
    }
    console.log("Fetched items:", feed()?.count);

    refreshDbWithFeedItems(feed()?.items || []);

    const md = memData()

    console.log("total items:", md.length);
    console.log("total LIVE items:", getAllByState('live')(md).length);
    console.log(getAllByState('saved')(md).map(it => it.guid).join(' '))

    setIsFetching(false)
  });

  const [isUpScrolled, setIsUpScrolled] = createSignal(false)
  const [isDnScrolled, setIsDnScrolled] = createSignal(false)

  let upSentinelRef!: HTMLDivElement
  let dnSentinelRef!: HTMLDivElement
  let scrollRef!: HTMLDivElement

  onMount(() => {
    const upObserver = new IntersectionObserver(([entry]) => {
      setIsUpScrolled(!entry.isIntersecting);
    }, { threshold: [1.0] })
    upObserver.observe(upSentinelRef!);

    const dnObserver = new IntersectionObserver(([entry]) => {
      setIsDnScrolled(entry.isIntersecting);
    }, { threshold: [1.0] })
    dnObserver.observe(dnSentinelRef!);

    return () => {
      upObserver.disconnect()
      dnObserver.disconnect()
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
      behavior: 'smooth'
    });
  };

  return (
    <ErrorBoundary fallback={<div>Failed to load or validate API data.</div>}>
      <Banner />
      <Switch fallback={null}>
        <Match when={isFetching()}>
          <div class="absolute inset-0 flex items-center justify-center"><Pulse /></div>
        </Match>
        <Match when={!isFetching()}>
          <div ref={upSentinelRef} class={`absolute z-30 ${isUpScrolled() ? 'opacity-100' : 'opacity-0'} h-8 w-8 right-4 flex text-2xl items-center justify-center top-18 rounded-full bg-amber-800/80 text-cyan-100 drop-shadow-sm drop-shadow-slate-400`} onClick={toTop}>⇡</div>
          <div ref={dnSentinelRef} class={`absolute z-30 ${!isDnScrolled() ? 'opacity-100' : 'opacity-0'} h-8 w-8 right-4 flex text-2xl items-center justify-center bottom-4 rounded-full bg-amber-800/80 text-cyan-100 drop-shadow-sm drop-shadow-slate-400`} onClick={toBottom}>⇣</div>
          <div ref={scrollRef} class='absolute top-0 bottom-0 left-4 right-4 overflow-x-hidden overflow-y-scroll'>
            <div class='relative flex flex-col pt-16 pb-8 gap-4 items-center py-4'>
              <div ref={upSentinelRef} class='h-1 w-1'></div>
              <List as={memData} mode={mode} />
              <div ref={dnSentinelRef} class='h-1 w-1'></div>
            </div>
          </div>
          <Presence exitBeforeEnter>
            {menuGuid() &&
              <Motion.div exit={{ scale: 0 }} transition={{ duration: .2 }} initial={{ scale: 0 }} animate={{ scale: 1 }} id='menu' class='absolute z-50 inset-0 bg-slate-800/50'>
                <div class="absolute rounded-lg inset-8 border border-slate-700 bg-linear-to-br from-slate-700 to-orange-900 text-black">
                  <MenuItems />
                </div>
              </Motion.div>}
          </Presence>
          <Presence exitBeforeEnter>
            {showOptions() &&
              <Motion.div exit={{ scale: 0 }} transition={{ duration: .2 }} initial={{ scale: 0 }} animate={{ scale: 1 }} id='menu' class='absolute z-50 inset-0 bg-slate-800/50'>
                <div class="absolute rounded-lg inset-3 border-2 border-slate-100 bg-linear-to-b from-slate-700 to-slate-800 text-black">
                  <div class="absolute inset-x-0 top-0 h-12 border-b border-b-slate-900 flex text-xl items-center justify-center text-white ">Options Form</div>
                  <div class="absolute w-8 h-8 top-2 right-2 flex items-center justify-center text-white " onClick={() => setShowOptions(false)} ><SvgCross fill="orange" /> </div>
                  <div class="absolute top-16 left-2 right-2 bottom-1 overflow-x-hidden px-2">
                    <FeedsForm onSaved={() => setShowOptions(false)} />
                  </div>
                </div>
              </Motion.div>}
          </Presence>
        </Match>
      </Switch>
    </ErrorBoundary>
  );
};

const MenuItems = () => {

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

  return <div class="flex flex-col absolute inset-2">
    <div class="flex items-center justify-end">
      <div onClick={() => setMenuGuid('')} class="w-6 h-6">
        <svg viewBox="0 0 1024 1024"><path fill="#ffffff" d="M195.2 195.2a64 64 0 0 1 90.496 0L512 421.504 738.304 195.2a64 64 0 0 1 90.496 90.496L602.496 512 828.8 738.304a64 64 0 0 1-90.496 90.496L512 602.496 285.696 828.8a64 64 0 0 1-90.496-90.496L421.504 512 195.2 285.696a64 64 0 0 1 0-90.496z" /></svg></div>
    </div>
    <div>
      {a() && <>

        <div class="text-slate-400 font-bold p-4 border-b border-b-slate-500">
          {a()!.title}
        </div>

        {mode() === 'live' &&
          <div class="text-slate-400 p-4 flex justify-center">
            <button onClick={saveFollow}>{`Save this and following ${follows().length ?? ''}`}</button>
          </div>}
        {mode() === 'live' &&
          <div class="text-slate-400 p-4 flex justify-center">
            <button onClick={delFollow}>{`Delete this and following ${follows().length ?? ''}`}</button>
          </div>}

        {mode() === 'deleted' &&
          <div class="text-slate-400 p-4 flex justify-center">
            <button onClick={killFollow}>{`KILL this and following ${follows().length ?? ''}`}</button>
          </div>}

        {mode() === 'saved' &&
          <div class="text-slate-400 p-4 flex justify-center">
            <button onClick={delFollow}>{`Delete this and following ${follows().length ?? ''}`}</button>
          </div>}

      </>}

    </div>
  </div >

}

type ActionToState = { [key: string]: ArticleState }
const actionToState: ActionToState = {
  'Save': 'saved',
  'Delete': 'deleted',
}
const onSwipeRight = (guid: string, action: Action) => {
  if (action === '') return
  if (action === 'Kill') killArticle(guid);

  updateState(guid, actionToState[action])
}
const onSwipeLeft = (guid: string, action: Action) => {
  if (action === '') return
  if (action === 'Kill') killArticle(guid);

  updateState(guid, actionToState[action])
}


const List = (props: { as: Accessor<ArticleRecords>, mode: Accessor<ArticleState> }) => {

  const as = () => getAllByState(mode())(props.as())
  return <>
    <For each={as()}>{(it, idx) =>
      <Card data={it} index={idx() + 1} onSwipeLeft={onSwipeLeft} onSwipeRight={onSwipeRight} />}
    </For>
  </>


}

export default App;
