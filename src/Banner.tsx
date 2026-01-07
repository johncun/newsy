import { Motion } from 'solid-motionone'

import { liveCount, mode, setIsFetchingFeeds, setMode, setPerformFetchFeedsTrigger, setShowOptions } from './signals'
import { getAllByState, memData } from './db'
import { ArticleState } from '@shared/feed-types'
import { Accessor, For } from 'solid-js'
import { SvgEx, SvgHorizontalDots, SvgReset } from './svgs'

const Banner = () => {

  const ModeDesc = (props: { md: Accessor<ArticleState> }) => {
    const ar = () => [props.md()]
    return <For each={ar()}>{_mode =>
      <Motion
        transition={{ duration: 0.1, easing: "ease-in-out" }} animate={{ scale: [0.3, 1] }}>
        {{ live: 'Cuisle', saved: 'Saved', deleted: 'Deleted' }[_mode || '']}
      </Motion>
    }
    </For >
  }


  return (
    <div class="flex justify-between items-center bg-linear-to-t from-black to-slate-900 h-12 absolute inset-x-0 z-20 gap-4">
      <div class="border-0 border-red-500 overflow-hidden relative h-12 w-50 flex justify-start items-center">
        <div class="absolute -z-10 left-0 right-0 h-12 ">
          <SvgEx topColor="#203050" midColor="#242424" bottomColor="#242424" />
        </div>
        <div class="pl-8 font-bold text-center text-xl"><ModeDesc md={mode} /></div>
      </div>
      <div class="flex items-center gap-4">
        <Motion.div
          press={{ scale: [1, 1.3] }}
          onClick={() => setMode('live')}
          class="bg-zinc-400/60 text-white justify-center rounded-full h-8 min-w-8 flex items-center p-1">
          {liveCount()}
        </Motion.div>
        <Motion.div
          press={{ scale: [1, 1.3] }}
          onClick={() => setMode('saved')}
          class="bg-green-300/30 min-w-6 justify-center
    h-8 w-8 rounded-full flex items-center p-1">
          {getAllByState('saved')(memData()).length}
        </Motion.div>
        <Motion.div
          press={{ scale: [1, 1.3] }}
          onClick={() => setMode('deleted')}
          class="bg-orange-100/20  text-white 
      min-w-6 justify-center rounded-full h-8 w-8 flex items-center p-1">
          {getAllByState('deleted')(memData()).length}
        </Motion.div>
      </div>
      <Motion.div
        press={{ scale: [1, 1.3] }}
        onClick={() => {
          setMode('live')
          setIsFetchingFeeds(true)
          setPerformFetchFeedsTrigger(Date.now())
        }}
        class="w-10 h-10 px-1 flex items-center justify-center">
        <SvgReset fill="#66ccff" />
      </Motion.div>
      <Motion.div
        press={{ scale: [1, 1.3] }}
        onClick={() => {
          setShowOptions(true)
        }}
        class=" px-2 w-10 h-10 flex items-center justify-center">
        <SvgHorizontalDots stroke="white" />
      </Motion.div>
    </div >
  )
}

export default Banner
