import { FeedItem } from "@shared/feed-types"
import { Accessor } from "solid-js"
import { Motion } from "solid-motionone"
import { setSelectedGuid, tick } from "./signals"
import { formatTimeAgo } from "./common"
import { CachedImage } from "./CachedImage"
import { CardButtons } from "./CardButtons"

const AnimatedBlackFade = () =>
  <Motion.div
    initial={{ opacity: 1 }}
    animate={{ opacity: 0 }}
    transition={{ duration: 0.7 }}
    class="absolute inset-0 bg-black/20"
  />

const Darken = () => <div class="absolute inset-0 bg-black/20" />

const CardStyleThin = (props: {
  isSelected: Accessor<boolean>,
  data: FeedItem
  index: number
  swipeLeft: () => void
  swipeRight: () => void
}) => {
  return <div
    class={`group cursor-pointer mx-0 bg-slate-700 rounded-lg ${!props.isSelected() ? 'h-30' : 'h-44'} relative overflow-hidden`}
    onClick={() => setSelectedGuid(props.data.guid)}>
    <Motion.div animate={{ scale: [.7, 1], opacity: [0, 1] }} transition={{ duration: .2 }} class="absolute inset-0 p-0">
      <ImageFor data={props.data} isSelected={props.isSelected} />
      {props.isSelected() ? <AnimatedBlackFade /> : <Darken />}


      <div class={`absolute left-31 mx-1 right-0 ${props.isSelected() ? 'bg-black/0' : ''}`}>
        <div class="flex justify-between absolute top-1 inset-x-0 h-5 items-center">
          <Source value={props.data.source} />
          <PublishedTime value={props.data.pubDate} />
        </div>
        <div class="absolute p-1 top-6 w-full flex flex-col overflow-hidden gap-0 font-[Noto_Serif]">
          <Title value={props.data.title} />
          <Byline value={props.data.description} />
        </div>
      </div>

      <CardButtons data={props.data} isSelected={props.isSelected} swipeLeft={props.swipeLeft} swipeRight={props.swipeRight} />
    </Motion.div >
  </div >

}


const Source = (props: { value: string }) => <div class="bg-black/10 text-white/70 text-xs line-clamp-1 font-stretch-75% z-10 py-0.5 font-extrabold rounded-md w-auto">
  {props.value}
</div>


const PublishedTime = (props: { value: string }) => {
  const ds = () => tick() && formatTimeAgo(new Date(props.value))
  return <div class="bg-black/20 text-white/80 line-clamp-1 font-stretch-75% text-xs z-10 px-1 rounded-md" >
    {ds()}
  </div >
}

const Title = (props: { value: string }) =>
  <div class="font-normal leading-4 font-[Noto_Serif] pb-0.5 text-shadow-black/50 text-md font-stretch-10% text-shadow-md line-clamp-3">{props.value}</div>

const Byline = (props: { value: string }) =>
  <div class="text-xs font-normal text-zinc-100/70 overflow-y-hidden line-clamp-3 text-left w-full">
    {props.value}
  </div>

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

  return props.data.image && !props.data.source.startsWith('Sydney') ?
    <CachedImage src={props.data.image} alt={props.data.title}
      class={`absolute left-0 w-30 h-30 top-0 object-cover ${!props.isSelected() && props.blur ? 'blur-xs' : ''}`}
    />
    : <div
      class={`absolute inset-0 ${getDeterministicGradient(props.data.guid)}`}
    />
}

export default CardStyleThin

