import { ArticleRecords, ArticleState } from "@shared/feed-types"
import { Accessor, Switch, For, Match } from "solid-js"
import Card, { Action } from "./Card"
import { getAllByState } from "./db"
import { mode, setSelectedGuid } from "./signals"
import { onSwipeLeft, onSwipeRight } from "./common"

const List = (props: {
  as: Accessor<ArticleRecords>
  mode: Accessor<ArticleState>
}) => {
  const as = () =>
    getAllByState(mode())(props.as())
      .sort((a, b) => {
        const dateA = new Date(a.pubDate).getTime()
        const dateB = new Date(b.pubDate).getTime()
        if (isNaN(dateA) || isNaN(dateB)) {
          return 0
        }
        return dateB - dateA
      })

  const getNextGuidInList = (guid: string): string => {

    const idx = as().findIndex(a => a.guid === guid)
    if (idx < 0 || idx === as().length - 1) return ''
    return as()[idx + 1].guid

  }
  const swipeLeftAndSelect = (guid: string, action: Action) => {

    const nxg = getNextGuidInList(guid)
    setSelectedGuid(nxg);
    onSwipeLeft(guid, action)
  }

  const swipeRightAndSelect = (guid: string, action: Action) => {

    const nxg = getNextGuidInList(guid)
    setSelectedGuid(nxg);
    onSwipeRight(guid, action)
  }

  return <Switch fallback={
    <For each={as()}>
      {(it, idx) => (
        <Card
          data={it}
          index={idx() + 1}
          onSwipeLeft={swipeLeftAndSelect}
          onSwipeRight={swipeRightAndSelect}

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


export default List;
