import { FeedItem } from "@shared/feed-types"
import { Motion } from "solid-motionone"
import { isSelected, showButtons, tick } from "./signals"
import { createLogger, formatTimeAgo } from "./common"
import { CachedImage } from "./CachedImage"
import { CardButtons } from "./CardButtons"
import { SvgHorizontalDots } from "./svgs"

const _Logger = createLogger('Swipeable')
const lg = _Logger.log
_Logger.disable()


export const AnimatedBlackFade = () =>
  <Motion.div
    initial={{ opacity: 1 }}
    animate={{ opacity: 0 }}
    transition={{ duration: 0.7 }}
    class="absolute inset-0 bg-black/20"
  />

const Darken = () => <div class="absolute inset-0 bg-black/20 pointer-events-none" />


const CardStyleThin = (props: {
  data: FeedItem,
  index: number,
  onClick: (ev: MouseEvent) => void
  onMenu: (ev: MouseEvent) => void
}) => {

  return <div
    class={`group cursor-pointer mx-0 rounded-lg ${!isSelected(props.data.guid) ? 'h-42' : 'h-42'} relative overflow-hidden`}
    onClick={props.onClick} >
    <Motion.div animate={{ scale: [.7, 1], opacity: [0, 1] }} transition={{ duration: .2 }} class="absolute inset-0 p-0">
      <ImageFor data={props.data} />
      <Darken />


      <div class={`absolute left-31 mx-1 right-0 ${isSelected(props.data.guid) ? 'bg-black/0' : ''}`}>
        <div class="flex justify-between absolute top-1 inset-x-0 h-5 items-center">
          <Source value={props.data.source} />
          <PublishedTime value={props.data.pubDate} />
        </div>
        <div class="absolute p-1 top-6 w-full flex flex-col overflow-hidden gap-0 font-[Noto_Serif]">
          <Title value={props.data.title} />
          <Byline value={props.data.description} />
        </div>
      </div>
      <Fade />
      {/*
      <div class="absolute bottom-0 right-0 translate-y-0 rounded-tl-2xl h-8 w-8 bg-black/10 
        flex items-center justify-center p-2"
        onClick={(ev: MouseEvent) => invokeReader(props.data.source, props.data.image || '', props.data.link, ev)} ><SvgRight fill="#808080" /></div>
      */}
      <div class="absolute bottom-0 left-0 translate-y-0 z-50 rounded-tr-2xl h-8 w-8 bg-black/50 
        flex items-center justify-center p-2"
        onClick={props.onMenu}
      >
        <SvgHorizontalDots stroke="#808080" />
      </div>
      {showButtons() && <CardButtons data={props.data} />}
    </Motion.div >
  </div >

}


const Source = (props: { value: string }) => <div class="bg-black/10 px-1 text-white/70 text-xs line-clamp-1 font-stretch-75% z-10 py-0.5 font-extrabold rounded-md w-auto">
  {props.value}
</div>


const PublishedTime = (props: { value: string }) => {
  const ds = () => tick() && formatTimeAgo(new Date(props.value))
  return <div class="bg-black/20 text-white/80 line-clamp-1 font-stretch-75% text-xs z-10 px-1 rounded-md" >
    {ds()}
  </div >
}

const Fade = () =>
  <div class="absolute pointer-events-none inset-x-0 bottom-0 h-12 bg-linear-to-b from-transparent to-[#202020]"></div>

const Title = (props: { value: string }) =>
  <div class="font-bold leading-4 font-[Quicksand] pb-1 text-shadow-black/50 text-md font-stretch-125% text-shadow-md line-clamp-4">{props.value}</div>

const Byline = (props: { value: string }) =>
  <div class={`text-sm leading-3.5 font-normal font-[Nunito_Sans] text-zinc-100/70 overflow-y-hidden line-clamp-5 text-left w-full`}>
    {props.value}
  </div>

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

  return props.data.image && !props.data.source.startsWith('Sydney') ?
    <CachedImage src={props.data.image} alt={props.data.title}
      class={`absolute left-0 w-30 h-full top-0 object-cover ${!isSelected(props.data.guid) && props.blur ? 'blur-xs' : ''}`}
    />
    : <div
      class={`absolute inset-0 ${getDeterministicGradient(props.data.guid)}`}
    />
}

export default CardStyleThin

