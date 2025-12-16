import { getAllByState, memData } from "./db";
import { mode, setMode, setRefetch } from "./signals";
import { Motion } from 'solid-motionone';

const Banner = (props: {}) => {

  const modeDesc = () => {
    return { 'live': "Latest", 'saved': "Saved", 'deleted': "Bin" }[mode()]
  }
  return <div class="flex justify-between items-center bg-sky-700/20 h-14 absolute inset-x-0 p-2 z-20 gap-4">
    <div class="w-20 font-bold font-[Raleway] text-2xl">{modeDesc()}</div>
    <div class="flex gap-4">
      <Motion.div press={{ scale: [1, 1.3] }}
        onClick={() => setMode('live')} class="bg-linear-to-br from-green-300 to-orange-700 text-white justify-center rounded-lg h-6 min-w-6 flex items-center p-1">{getAllByState('live')(memData()).length}</Motion.div>
      <Motion.div press={{ scale: [1, 1.3] }}
        onClick={() => setMode('saved')} class="bg-linear-to-br text-white from-green-300 to-sky-900 min-w-6 justify-center
    rounded-lg h-6 flex items-center p-1">{getAllByState('saved')(memData()).length}</Motion.div>
      <Motion.div press={{ scale: [1, 1.3] }} onClick={() => setMode('deleted')} class="bg-linear-to-br text-white from-red-300 to-orange-600
      min-w-6 justify-center rounded-lg h-6 flex items-center p-1">{getAllByState('deleted')(memData()).length}</Motion.div>
    </div>
    <Motion.div press={{ scale: 1.3 }} onClick={() => setRefetch(r => !r)} class="font-bold text-2xl px-2">↻</Motion.div>

  </div >
}

export default Banner;
