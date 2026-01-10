import { Motion } from 'solid-motionone'

import { currentListCount, mode, setIsFetchingFeeds, setMode, setPerformFetchFeedsTrigger, setShowOptions } from './signals'
import { getAllByState, memData } from './db'
import { ArticleState } from '@shared/feed-types'
import { Accessor, For } from 'solid-js'
import { SvgEx, SvgHorizontalDots, SvgLeft, SvgReset, SvgRight } from './svgs'

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
  const nextMode = () => {
    if (mode() === 'live') setMode('saved'); else if (mode() === 'deleted') setMode('live'); else setMode('deleted')
  }
  const prevMode = () => {
    if (mode() === 'live') setMode('deleted'); else if (mode() === 'saved') setMode('live'); else setMode('saved')
  }
  return (
    <div class="flex justify-between items-center bg-linear-to-t from-black to-slate-900 h-12 absolute inset-x-0 z-20 gap-4">
      <div class="border-0 border-red-500 overflow-hidden relative h-12 min-w-40 flex justify-start items-center">
        <div class="absolute -z-10 left-0 right-0 h-12 ">
          <SvgEx topColor="#203050" midColor="#242424" bottomColor="#242424" />
        </div>
        <div class="pl-3 font-bold text-center text-xl flex items-center"><ModeDesc md={mode} />
          <div class="absolute right-6 min-w-8 h-8 rounded-full flex items-center justify-center border text-sky-300 border-slate-400/50 text-sm p-1">{currentListCount()}
          </div></div>
      </div>
      <div class="flex items-center gap-4">
        <Motion.div
          press={{ scale: [1, 1.3] }}
          onClick={prevMode}
          class="bg-zinc-400/20 text-white justify-center rounded-full h-8 w-8 flex items-center p-1">
          <SvgLeft fill="white" />
        </Motion.div>
        <Motion.div
          press={{ scale: [1, 1.3] }}
          onClick={nextMode}
          class="bg-zinc-400/20 text-white justify-center rounded-full h-8 w-8 flex items-center p-1">
          <SvgRight fill="white" />
        </Motion.div>
      </div>
      <Motion.div
        press={{ scale: [1, 1.3] }}
        onClick={() => {
          if (mode() !== 'live') return;
          setIsFetchingFeeds(true)
          setPerformFetchFeedsTrigger(Date.now())
        }}
        class="w-10 h-10 px-1 flex items-center justify-center">
        {mode() === 'live' && <SvgReset fill="#66ccff" />}
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
