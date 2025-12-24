import { ArticleRecords, ArticleState } from "@shared/feed-types"
import { Accessor, Switch, For, Match } from "solid-js"
import Card from "./Card"
import { getAllByState } from "./db"
import { mode } from "./signals"
import { onSwipeLeft, onSwipeRight } from "./common"

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


export default List;
