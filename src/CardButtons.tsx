import { Accessor, Show } from "solid-js"
import { Motion } from "solid-motionone"
import { setIsFetching, setMenuGuid, setReaderPageInfo } from "./signals"
import { SvgAdd, SvgTrash } from "./svgs"
import { FeedItem } from "@shared/feed-types"

export const CardButtons = (props: { data: FeedItem, isSelected: Accessor<boolean>, swipeRight: () => void, swipeLeft: () => void }) => {

  return <Show when={props.isSelected()}>

    <Motion.div animate={{ opacity: [0, 1], scale: [.7, 1] }}
      class={`absolute bottom-1 h-10 z-30 inset-x-2 flex bg-white/10 items-center rounded-e-full rounded-s-full px-2 justify-between`}>
      <AddBtn action={props.swipeRight} isSelected={props.isSelected} />
      <div class="flex gap-4">
        <OptionBtn action={(ev: MouseEvent) => {
          ev.stopPropagation()
          setMenuGuid(props.data.guid)
        }} isSelected={props.isSelected} />
        <GoBtnDirect link={props.data.link} isSelected={props.isSelected} />
      </div>
      <GoBtn source={props.data.source} backupImage={props.data.image} link={props.data.link} isSelected={props.isSelected} />
      <DeleteBtn action={props.swipeLeft} isSelected={props.isSelected} />
    </Motion.div>
  </Show>
}

export const AddBtn = (props: { action: () => void, isSelected: Accessor<boolean> }) => <Motion.div
  press={{ scale: [1, 1.3, 1] }}
  class="p-1 w-9 h-9 rounded-full bg-green-400/80 flex items-center justify-center text-black"
  onClick={props.action}
  style={{ visibility: props.isSelected() ? 'visible' : 'hidden' }}>
  <SvgAdd fill="white" />
</Motion.div>

export const OptionBtn = (props: { action: (ev?: any) => void, isSelected: Accessor<boolean> }) => <Motion.div
  press={{ scale: [1, 1.3, 1] }}
  class="text-3xl w-8 h-8 rounded-full bg-amber-200/80 p-1 flex items-center justify-center text-black"
  onClick={props.action}
  style={{ visibility: props.isSelected() ? 'visible' : 'hidden' }}>
  <svg viewBox="0 0 24 24" class="w-6">
    <g
      stroke="none"
      stroke-width="3"
      fill="none"
      fill-rule="evenodd">
      <g>
        <rect
          fill-rule="nonzero"
          x="0"
          y="0"
          width="24"
          height="24"
        />
        <line
          x1="5"
          y1="7"
          x2="19"
          y2="7"
          id="Path"
          stroke="#0C0310"
          stroke-linecap="round"
        />
        <line
          x1="5"
          y1="17"
          x2="19"
          y2="17"
          id="Path"
          stroke="#0C0310"
          stroke-linecap="round"
        />
        <line
          x1="5"
          y1="12"
          x2="19"
          y2="12"
          id="Path"
          stroke="#0C0310"
          stroke-linecap="round"
        />
      </g>
    </g>
  </svg>
</Motion.div>


export const GoBtnDirect = (props: { link: string, isSelected: Accessor<boolean> }) => <Motion.div
  press={{ scale: [1, 1.3, 1] }}
  class="w-8 font-stretch-90% font-extrabold text-2xl h-8 p-1 rounded-full bg-white/50 flex items-center justify-center text-black"
  onClick={async (ev) => {
    ev.stopPropagation();
    window.open(
      props.link,
      '_blank',
      'noopener,noreferrer')
  }}
  style={{ visibility: props.isSelected() ? 'visible' : 'hidden' }}>
  🌍
  {/* <img src="/favicon.svg" class="w-8" /> */}
</Motion.div >

export const GoBtn = (props: { source: string, backupImage?: string, link: string, isSelected: Accessor<boolean> }) => <Motion.div
  press={{ scale: [1, 1.3, 1] }}
  class="w-14 font-stretch-90% font-extrabold text-xs h-8 p-1 rounded-full bg-sky-400/80 text-white flex items-center justify-center "
  onClick={async (ev) => {
    ev.stopPropagation();
    setIsFetching(true)
    const proxyUrl = `/summarize-news?url=${encodeURIComponent(props.link)}`;
    const res = await fetch(proxyUrl);
    const items = await res.json()
    setIsFetching(false)
    setReaderPageInfo({ source: props.source, backupImage: props.backupImage || '', link: props.link, items });

    // window.open(
    // props.link,
    // '_blank',
    // 'noopener,noreferrer',
  }
  }
  style={{ visibility: props.isSelected() ? 'visible' : 'hidden' }}>
  ➜
</Motion.div >

export const DeleteBtn = (props: { action: () => void, isSelected: Accessor<boolean> }) => <Motion.div
  press={{ scale: [1, 1.3, 1] }}
  class="p-1 w-8 h-8 rounded-full bg-red-800/80 flex items-center justify-center text-black"
  onClick={props.action}
  style={{ visibility: props.isSelected() ? 'visible' : 'hidden' }}>
  <SvgTrash stroke="white" fill="" />
</Motion.div>



