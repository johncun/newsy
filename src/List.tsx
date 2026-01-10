import { ArticleRecord, ArticleRecords, ArticleState, convertStringToWordStruct, FeedItem, hasIgnoreWord } from "@shared/feed-types"
import { Accessor, Switch, For, Match, Show, createEffect } from "solid-js"
import { getAllByState } from "./db"
import { mode, selectedGuid, setLiveCount, setSelectedGuid, setShowButtons, showButtons } from "./signals"
import { Action, hashToBoolean, onSwipeLeft, onSwipeRight, sorterPubDate, sorterSavedDate } from "./common"
import Swipeable from "./Swipeable"
import CardStyleThin from "./CardStyleThin"
import { SvgPlus, SvgTrash } from "./svgs"
import CardStyleLarge from "./CardStyleLarge"
import CardStyleThreeQuarter from "./CardStyleThreeQuarter"
import { invokeReader } from "./CardButtons"
import { settings } from "./settings-utils"

const DEBUG_SWIPE = false

const List = (props: {
  as: Accessor<ArticleRecords>
  mode: Accessor<ArticleState>
}) => {

  const as = () => {
    const allForMode = [...getAllByState(mode())(props.as())]
      .sort(sorterSavedDate)

    if (settings.ignoreWords.trim().length === 0) {
      return allForMode
    }

    const ws = convertStringToWordStruct(settings.ignoreWords)
    const check = hasIgnoreWord(ws)

    const findNoIgnoredWords = (a: FeedItem): boolean => {
      const res = !check(a.title) && !check(a.description)
      if (!res) {
        console.log(`IGNORE!! found words ${settings.ignoreWords} in title ${a.title} or description ${a.description}`)
      }
      return res;
    }

    return allForMode.filter(findNoIgnoredWords)
  }

  createEffect(() => {
    setLiveCount(as().length)
  })

  const getNextGuidInList = (guid: string): string => {

    const idx = as().findIndex(a => a.guid === guid)
    if (idx < 0 || idx === as().length - 1) return ''
    return as()[idx + 1].guid

  }
  const swipeLeftAndSelect = (guid: string, action: Action) => {
    if (DEBUG_SWIPE) {
      console.log('swipe left', guid, action);
      return
    }

    const nxg = getNextGuidInList(guid)
    onSwipeLeft(guid, action)
    setTimeout(() => setSelectedGuid(nxg), 0)
  }

  const swipeRightAndSelect = (guid: string, action: Action) => {

    if (DEBUG_SWIPE) {
      console.log('swipe left', guid, action);
      return
    }
    const nxg = getNextGuidInList(guid)
    onSwipeRight(guid, action)
    setTimeout(() => setSelectedGuid(nxg), 0)
  }

  const useThin = (a: ArticleRecord) => hashToBoolean(a.guid)
  const rightAction = (): Action => {
    return (
      (
        { live: 'Save', saved: '', deleted: 'Save' } as {
          [key: string]: Action
        }
      )[mode()] || ''
    )
  }
  const leftAction = (): Action => {
    return (
      (
        { live: 'Delete', saved: 'Delete', deleted: 'Kill' } as {
          [key: string]: Action
        }
      )[mode()] || ''
    )
  }
  const swipeLeft = (guid: string) => () => swipeLeftAndSelect(guid, leftAction())
  const swipeRight = (guid: string) => () => swipeRightAndSelect(guid, rightAction())

  const showReader = (fi: FeedItem) => (ev: MouseEvent) => {
    ev.stopPropagation()
    setShowButtons(false)
    setSelectedGuid(fi.guid)
    invokeReader(fi.source, fi.image || '', fi.link)
  }

  const handleMenu = (fi: FeedItem) => (ev: MouseEvent) => {
    console.log('onMenu')
    ev.stopPropagation();
    if (showButtons() && selectedGuid() !== fi.guid) setShowButtons(false)
    setSelectedGuid(fi.guid)
    setShowButtons(sb => !sb)
  }


  return <Switch fallback={
    <For each={as()}>
      {(it, idx) => (
        <Swipeable
          onSwipeLeft={swipeLeft(it.guid)}
          onSwipeRight={swipeRight(it.guid)}
          leftBg="bg-green-700/50"
          rightBg="bg-red-600/50"
          leftIcon={<SvgPlus fill="white" />}
          rightIcon={
            <SvgTrash stroke="white" fill="none" />
          }>

          <Show when={settings.fullMode}>
            <CardStyleThreeQuarter onMenu={handleMenu(it)} onClick={showReader(it)} data={it} index={idx()} />
          </Show>

          <Show when={!settings.fullMode}>
            <Switch fallback={
              <CardStyleLarge onMenu={handleMenu(it)} onClick={showReader(it)} data={it} index={idx()} />}>
              <Match when={useThin(it)}>
                <CardStyleThin onMenu={handleMenu(it)} onClick={showReader(it)} data={it} index={idx()} />
              </Match>
            </Switch>
          </Show>


        </Swipeable>
      )}
    </For >
  }>
    <Match when={!as()?.length}>
      <div class="absolute z-50 inset-0 text-zinc-500 flex items-center justify-center">
        <div class="wave" />
        <div class="wave" />
        <div class="wave" />
        <div class="opacity-50 wave-bg p-6 rounded-2xl text-black">{`No items in ${props.mode()} list`}</div>
      </div>
    </Match>
  </Switch >
}


export default List;
