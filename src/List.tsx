import { ArticleRecord, ArticleRecords, ArticleState } from "@shared/feed-types"
import { Accessor, Switch, For, Match, Show } from "solid-js"
import { getAllByState } from "./db"
import { mode, selectedGuid, setSelectedGuid } from "./signals"
import { Action, hashToBoolean, onSwipeLeft, onSwipeRight, sorterPubDate } from "./common"
import Swipeable from "./Swipeable"
import CardStyleThin from "./CardStyleThin"
import { SvgPlus, SvgTrash } from "./svgs"
import CardStyleLarge from "./CardStyleLarge"
import CardStyleThreeQuarter from "./CardStyleThreeQuarter"
import { settings } from "@shared/settings"

const DEBUG_SWIPE = false

const List = (props: {
  as: Accessor<ArticleRecords>
  mode: Accessor<ArticleState>
}) => {
  const as = () =>
    [...getAllByState(mode())(props.as())]
      .sort(sorterPubDate)

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

  const isSelected = (a: ArticleRecord) => () => selectedGuid() === a.guid
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
            <CardStyleThreeQuarter isSelected={isSelected(it)} data={it} index={idx()} />
          </Show>

          <Show when={!settings.fullMode}>
            <Switch fallback={
              <CardStyleLarge isSelected={isSelected(it)} data={it} index={idx()} />}>
              <Match when={useThin(it)}>
                <CardStyleThin isSelected={isSelected(it)} data={it} index={idx()} />
              </Match>
            </Switch>
          </Show>


          {/* <div class="w-full h-30"> */}
          {/*   <CardStyleThin isSelected={() => selectedGuid() === it.guid} data={it} index={idx()} swipeLeft={() => { }} swipeRight={() => { }} /> */}
          {/* </div> */}
        </Swipeable>
        // <Card
        //           data={it}
        //           index={idx() + 1}
        //           onSwipeLeft={swipeLeftAndSelect}
        //           onSwipeRight={swipeRightAndSelect}
        //
        //         />
      )}
    </For >
  }>
    <Match when={!as()?.length}>
      <div class="w-full h-40 text-zinc-500 inset-0 flex items-center justify-center">
        <div>{`No items in ${props.mode()} list`}</div>
      </div>
    </Match>
  </Switch >
}


export default List;
