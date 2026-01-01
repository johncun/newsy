import { Motion } from 'solid-motionone'

import { mode, setIsFetchingFeeds, setMode, setPerformFetchFeedsTrigger, setShowOptions } from './signals'
import { getAllByState, memData } from './db'
import { SvgOptions, SvgPlus } from './svgs'

const Banner = () => {
  const modeDesc = (): string => {
    return { live: 'Latest', saved: 'Saved', deleted: 'Bin' }[mode() || '']
  }

  return (
    <div class="flex justify-between items-center bg-linear-to-t from-black to-slate-900 h-14 absolute inset-x-0 p-2 z-20 gap-4">
      <div class="w-20 normal pl-2 font-bold text-center shadow-amber-50 shadow-2xl text-xl">{modeDesc()}</div>
      <div class="flex items-center gap-4">
        <Motion.div
          press={{ scale: [1, 1.3] }}
          onClick={() => setMode('live')}
          class="bg-zinc-400/60 text-white justify-center rounded-full h-8 min-w-8 flex items-center p-1">
          {getAllByState('live')(memData()).length}
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
        <SvgPlus fill="orange" />
      </Motion.div>
      <Motion.div
        press={{ scale: [1, 1.3] }}
        onClick={() => {
          setShowOptions(true)
        }}
        class=" px-2 w-10 h-10 flex items-center justify-center">
        <SvgOptions fill="white" />
      </Motion.div>
    </div>
  )
}

export default Banner
