import { getAllByState, memData } from "./db";
import { mode, setMode, setRefetch } from "./signals";
import { Motion } from 'solid-motionone';

const Banner = () => {

  const modeDesc = () => {
    return { 'live': "Latest", 'saved': "Saved", 'deleted': "Bin" }[mode()]
  }
  return <div class="flex justify-between items-center bg-blue-950/95 h-14 absolute inset-x-0 p-2 z-20 gap-4">
    <div class="w-20 font-bold font-[Raleway] text-2xl">{modeDesc()}</div>
    <div class="flex gap-4">
      <Motion.div press={{ scale: [1, 1.3] }}
        onClick={() => setMode('live')} class="bg-zinc-400/60 text-white justify-center rounded-full h-8 min-w-8 flex items-center p-1">{getAllByState('live')(memData()).length}</Motion.div>
      <Motion.div press={{ scale: [1, 1.3] }}
        onClick={() => setMode('saved')} class="bg-green-300/30 min-w-6 justify-center
    h-8 w-8 rounded-full flex items-center p-1">{getAllByState('saved')(memData()).length}</Motion.div>
      <Motion.div press={{ scale: [1, 1.3] }} onClick={() => setMode('deleted')} class="bg-orange-100/20  text-white 
      min-w-6 justify-center rounded-full h-8 w-8 flex items-center p-1">{getAllByState('deleted')(memData()).length}</Motion.div>
    </div>
    <Motion.div press={{ scale: 1.3 }} onClick={() => setRefetch(r => !r)} class="font-bold text-2xl px-2">↻</Motion.div>

  </div >
}

export default Banner;
