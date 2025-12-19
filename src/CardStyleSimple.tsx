import { FeedItem } from "@shared/feed-types"
import { Accessor, Show } from "solid-js"
import { Motion } from "solid-motionone"
import { setSelectedGuid, setMenuGuid } from "./signals"
import { SvgAdd, SvgTrash } from "./svgs"
import { dt } from "./common"

const AnimatedBlackFade = () =>
  <Motion.div
    initial={{ opacity: 1 }}
    animate={{ opacity: 0 }}
    transition={{ duration: 0.7 }}
    class="absolute inset-0 bg-black/20"
  />

const Darken = () => <div class="absolute inset-0 bg-black/20" />

const CardStyleSimple = (props: {
  isSelected: Accessor<boolean>,
  data: FeedItem
  index: number
  swipeLeft: () => void
  swipeRight: () => void
}) => {
  return <div
    class="group cursor-pointer mx-0 bg-slate-800 rounded-2xl h-30 relative overflow-hidden"
    onClick={() => setSelectedGuid(props.data.guid)}>
    <Motion.div animate={{ scale: [0, 1] }} transition={{ duration: .2 }} class="absolute inset-0 p-0">
      <ImageFor data={props.data} isSelected={props.isSelected} />
      {props.isSelected() ? <AnimatedBlackFade /> : <Darken />}


      {/* <div class="absolute h-2 left-0 bottom-2 w-30 inset-shadow-gray-1000 flex flex-col items-center justify-between"> */}
      {/* </div> */}
      <div class={`absolute left-31 mx-1 right-0  ${props.isSelected() ? 'bg-black/0' : ''}`}>
        <div class="flex justify-between absolute top-1 inset-x-0 h-5 items-center">
          <Source value={props.data.source} />
          <PublishedTime value={props.data.pubDate} />
        </div>
        <div class="absolute px-1 top-8 w-full flex flex-col overflow-hidden gap-0 ">
          <Title value={props.data.title} />
          <Byline value={props.data.description} />
        </div>
      </div>

      <Show when={props.isSelected()}>
        <Motion.div animate={{ opacity: [0, 1], scale: [0, 1] }}
          class={`absolute bottom-1 h-10 z-30 inset-x-2 flex bg-black/40 items-center rounded-2xl justify-between`}>
          <AddBtn action={props.swipeRight} isSelected={props.isSelected} />
          <div class="flex gap-4">
            <OptionBtn action={() => setMenuGuid(props.data.guid)} isSelected={props.isSelected} />
            <GoBtn link={props.data.link} isSelected={props.isSelected} />
          </div>
          <DeleteBtn action={props.swipeLeft} isSelected={props.isSelected} />
        </Motion.div>
      </Show>
    </Motion.div >
  </div >

}


const Source = (props: { value: string }) => <div class="bg-black/10 text-white/70 text-xs line-clamp-1 font-stretch-75% z-10 py-0.5 font-extrabold rounded-md w-auto">
  {props.value}
</div>

const PublishedTime = (props: { value: string }) => <div class="bg-black/20 text-white/80 line-clamp-1 font-stretch-75% text-xs z-10 px-1 rounded-md">
  {dt(props.value)}
</div>

const Title = (props: { value: string }) =>
  <div class="font-normal leading-4 pb-1 text-shadow-black/30 text-md font-stretch-70% text-shadow-md line-clamp-3">{props.value}</div>

const Byline = (props: { value: string }) =>
  <p class="text-xs font-normal text-zinc-100/70 overflow-y-hidden line-clamp-2 text-left w-full">
    {props.value}
  </p>

const AddBtn = (props: { action: () => void, isSelected: Accessor<boolean> }) => <Motion.div
  press={{ scale: [1, 1.3, 1] }}
  class="p-1 w-9 h-9 rounded-full bg-green-400/80 flex items-center justify-center text-black"
  onClick={props.action}
  style={{ visibility: props.isSelected() ? 'visible' : 'hidden' }}>
  <SvgAdd fill="white" />
</Motion.div>

const OptionBtn = (props: { action: () => void, isSelected: Accessor<boolean> }) => <Motion.div
  press={{ scale: [1, 1.3, 1] }}
  class="text-3xl w-8 h-8 rounded-full bg-amber-200/80 flex items-center justify-center text-black"
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

const GoBtn = (props: { link: string, isSelected: Accessor<boolean> }) => <Motion.div
  press={{ scale: [1, 1.3, 1] }}
  class="w-14 font-stretch-90% font-extrabold text-xs h-8 rounded-full bg-green-200/80 flex items-center justify-center text-black"
  onClick={() =>
    window.open(
      props.link,
      '_blank',
      'noopener,noreferrer',
    )
  }
  style={{ visibility: props.isSelected() ? 'visible' : 'hidden' }}>
  Read ➜
</Motion.div>

const DeleteBtn = (props: { action: () => void, isSelected: Accessor<boolean> }) => <Motion.div
  press={{ scale: [1, 1.3, 1] }}
  class="p-1 w-8 h-8 rounded-full bg-red-800/80 flex items-center justify-center text-black"
  onClick={props.action}
  style={{ visibility: props.isSelected() ? 'visible' : 'hidden' }}>
  <SvgTrash stroke="white" fill="" />
</Motion.div>


const ImageFor = (props: {
  data: FeedItem
  isSelected: Accessor<boolean>
  blur?: boolean
}) => {
  const gradients = [
    'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900',
    'bg-gradient-to-bl from-zinc-950 via-zinc-900 to-zinc-950',
    'bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-900',
    'bg-gradient-to-bl from-slate-900 via-indigo-950 to-zinc-900',
    'bg-gradient-to-br from-emerald-950 via-teal-950 to-slate-900',
    'bg-gradient-to-bl from-rose-950 via-slate-900 to-zinc-900',
    'bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900',
    'bg-gradient-to-bl from-blue-950 via-slate-900 to-black',
    'bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900',
    'bg-gradient-to-bl from-zinc-900 via-stone-900 to-zinc-950',
    'bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900',
    'bg-gradient-to-bl from-cyan-950 via-slate-900 to-indigo-950',
    'bg-gradient-to-br from-gray-900 via-gray-800 to-black',
    'bg-gradient-to-bl from-violet-950 via-slate-900 to-slate-950',
    'bg-gradient-to-br from-fuchsia-950 via-slate-900 to-zinc-900',
    'bg-gradient-to-bl from-teal-950 via-emerald-950 to-neutral-900',
    'bg-gradient-to-br from-slate-900 via-slate-800 to-zinc-900',
    'bg-gradient-to-bl from-indigo-900 via-slate-900 to-black',
    'bg-gradient-to-br from-zinc-950 via-neutral-900 to-stone-950',
    'bg-gradient-to-bl from-slate-800 via-slate-900 to-slate-950',
  ]

  function getDeterministicGradient(input: string): string {
    let hash = 5381

    for (let i = 0; i < input.length; i++) {
      hash = (hash << 5) + hash + input.charCodeAt(i)
    }

    const index = (hash >>> 0) % gradients.length

    return gradients[index]
  }

  // mask-[linear-gradient(to_bottom,red_0%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,red_0%,transparent_100%)]`}

  return props.data.image && !props.data.source.startsWith('Sydney') ?
    <img
      src={props.data.image /*|| "/placeholder.svg"*/}
      alt={props.data.title}
      class={`absolute left-0 w-30 h-30 top-0 object-cover ${!props.isSelected() && props.blur ? 'blur-xs' : ''}`}
      onError={e => {
        const element = e.target as HTMLImageElement
        element.src = '/the-guardian-logo.jpg'
        element.style.opacity = '20%'
        element.style.display = 'none'
        // const container = element.parentElement
        // if (container)
        // container.style.background = "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      }}></img>
    : <div
      class={`absolute inset-0 ${getDeterministicGradient(props.data.guid)}`}
    />
}

export default CardStyleSimple

