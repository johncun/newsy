import { FeedItem } from "@shared/feed-types"
import { Accessor } from "solid-js"
import { Motion } from "solid-motionone"
import { setSelectedGuid } from "./signals"
import { dt } from "./common"
import { CardButtons } from "./CardButtons"

const AnimatedBlackFade = () =>
  <Motion.div
    initial={{ opacity: 1 }}
    animate={{ opacity: 0 }}
    transition={{ duration: 0.7 }}
    class="absolute inset-0 bg-black/20"
  />

const Darken = () => <div class="absolute inset-0 bg-black/40" />

const CardStyleLarge = (props: {
  isSelected: Accessor<boolean>,
  data: FeedItem
  index: number
  swipeLeft: () => void
  swipeRight: () => void
}) => {
  return <div
    class="flex flex-col items-center group cursor-pointer mx-0 bg-slate-800/0 rounded-lg p-2 min-h-60 relative overflow-hidden"
    onClick={() => setSelectedGuid(props.isSelected() ? '' : props.data.guid)}>
    <Motion.div animate={{ scale: [.7, 1], opacity: [0, 1] }} transition={{ duration: .2 }} class="absolute inset-0 p-0">
      <ImageFor data={props.data} isSelected={props.isSelected} />
      {props.isSelected() ? <AnimatedBlackFade /> : <Darken />}
      <Darken />

      {!props.isSelected() &&
        <div class="absolute top-2 left-2 right-2 inset-shadow-gray-1000 flex items-center justify-between">
          <Source value={props.data.source} />
          <PublishedTime value={props.data.pubDate} />
        </div>
      }
      <div
        id="title"
        class={`absolute font-bold font-[Noto_Serif] text-shadow-black/30 text-xl font-stretch-75% text-shadow-md
        inset-x-0 mx-4 top-2 bottom-2 items-center justify-${props.isSelected() ? 'start' : 'center'} flex flex-col gap-1 rounded-xl p-2 ${props.isSelected() ? 'bg-black/0' : ''}`}>

        <Title value={props.data.title} />
        <Byline value={props.data.description} />
      </div>

      <CardButtons data={props.data} isSelected={props.isSelected} swipeLeft={props.swipeLeft} swipeRight={props.swipeRight} />

      {/*      <div
        class={`absolute top-1 h-10 z-30 inset-x-2 flex ${props.isSelected() ? 'bg-black/40' : ''} items-center rounded-2xl justify-between`}>
        <AddBtn action={props.swipeRight} isSelected={props.isSelected} />
        <div class="flex gap-4">
          <OptionBtn action={() => setMenuGuid(props.data.guid)} isSelected={props.isSelected} />
          <GoBtn link={props.data.link} isSelected={props.isSelected} />
        </div>
        <DeleteBtn action={props.swipeLeft} isSelected={props.isSelected} />
      </div> */}
    </Motion.div >
  </div>

}


const Source = (props: { value: string }) => <div class="bg-black/30 text-white/70 text-xs z-10 px-1 py-1 rounded-md w-auto">
  {props.value}
</div>

const PublishedTime = (props: { value: string }) => <div class="bg-black/50 text-white/70 text-xs z-10 px-1 py-1 rounded-md">
  {dt(props.value)}
</div>

const Title = (props: { value: string }) =>
  <div class="line-clamp-4 font-[Quicksand]">{props.value}</div>

const Byline = (props: { value: string }) =>
  <p class="text-sm font-normal text-zinc-100/70 overflow-y-hidden line-clamp-2 text-left w-full">
    {props.value}
  </p>

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
      class={`absolute inset-0 w-full h-full object-cover ${!props.isSelected() && props.blur ? 'blur-xs' : ''}`}
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

export default CardStyleLarge

