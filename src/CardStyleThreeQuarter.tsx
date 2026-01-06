import { FeedItem } from "@shared/feed-types"
import { Motion } from "solid-motionone"
import { isSelected, showButtons, tick } from "./signals"
import { formatTimeAgo } from "./common"
import { CardButtons } from "./CardButtons"
import { SvgHorizontalDots } from "./svgs"
import { CachedImage } from "./CachedImage"

const Darken = () => <div class="absolute inset-0 bg-black/40" />

const CardStyleThreeQuarter = (props: {
  data: FeedItem
  index: number
  onClick: (ev: MouseEvent) => void
  onMenu: (ev: MouseEvent) => void
}) => {
  return <div
    class="w-full flex flex-col items-center group cursor-pointer mx-0 bg-slate-800/0 rounded-lg p-2 min-h-[46vh] relative overflow-hidden"
    onClick={props.onClick}>
    <Motion.div animate={{ scale: [.7, 1], opacity: [0, 1] }} transition={{ duration: .2 }} class="absolute inset-0 p-0">
      <ImageFor data={props.data} blur={false} />
      <Darken />

      {(!isSelected(props.data.guid) || true) &&
        <div class="absolute top-2 left-2 right-2 inset-shadow-gray-1000 flex items-center justify-between">
          <Source value={props.data.source} />
          <PublishedTime value={props.data.pubDate} />
        </div>
      }
      <div
        id="title"
        class={`absolute font-bold font-[Noto_Serif] text-shadow-black/30 text-xl font-stretch-75% text-shadow-md
        inset-x-0 mx-4 top-2 bottom-2 items-center justify-${isSelected(props.data.guid) || true ? 'center' : 'end'} flex flex-col gap-1 rounded-xl p-2 ${isSelected(props.data.guid) ? 'bg-black/0' : ''}`}>
        <div class="backdrop-blur-md p-1 rounded-2xl">
          <Title value={props.data.title} />
          <Byline value={props.data.description} />
        </div>
      </div>
      {/*      <div class="absolute bottom-0 right-0 translate-y-0 rounded-tl-2xl h-8 w-8 bg-black/10 
        flex items-center justify-center p-2"
        onClick={(ev: MouseEvent) => invokeReader(props.data.source, props.data.image || '', props.data.link, ev)} ><SvgRight fill="#808080" /></div>
      */}
      <div class="absolute bottom-0 left-0 translate-y-0 rounded-tr-2xl h-8 w-8 bg-black/10 
        flex items-center justify-center p-2"
        onClick={props.onMenu}>
        <SvgHorizontalDots stroke="#808080" />
      </div>
      {showButtons() && <CardButtons data={props.data} />}


    </Motion.div >
  </div>

}


const Source = (props: { value: string }) => <div class="bg-black/30 text-white/70 text-xs z-10 px-1 py-1 rounded-md w-auto">
  {props.value}
</div>

const PublishedTime = (props: { value: string }) => {
  const ds = () => tick() && formatTimeAgo(new Date(props.value))
  return <div class="bg-black/50 text-white/70 text-xs z-10 px-1 py-1 rounded-md">
    {ds()}
  </div>
}

const Title = (props: { value: string }) =>
  <div class="font-[Quicksand]" >{props.value}</div>

const Byline = (props: { value: string }) =>
  <p class="text-sm font-normal text-zinc-100/70 overflow-y-hidden text-left w-full">
    {props.value}
  </p>

const ImageFor = (props: {
  data: FeedItem
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
    <CachedImage
      src={props.data.image /*|| "/placeholder.svg"*/}
      alt={props.data.title}
      class={`absolute inset-0 w-full h-full object-cover ${props.blur ? 'blur-[5px]' : ''}`}
    />
    : <div
      class={`absolute inset-0 ${getDeterministicGradient(props.data.guid)}`}
    />
}

export default CardStyleThreeQuarter

