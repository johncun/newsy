import { getAllByState, memData } from "./db";
import { mode, setMode } from "./signals";
import { Motion } from 'solid-motionone';

const Banner = (props: {}) => {

  const modeDesc = () => {
    return { 'live': "Latest", 'saved': "Saved", 'deleted': "Bin" }[mode()]
  }
  return <div class="flex items-center bg-sky-700/30 h-14 absolute inset-x-0 p-2 z-20 gap-4">
    <div class="flex-1 font-extrabold">{modeDesc()}</div>
    <Motion.div press={{ scale: [1, 1.3] }}
      onClick={() => setMode('live')} class="bg-linear-to-br from-green-300 to-orange-700 text-white  rounded-lg h-6 flex items-center p-1">{getAllByState('live')(memData()).length}</Motion.div>
    <Motion.div press={{ scale: [1, 1.3] }}
      onClick={() => setMode('saved')} class="bg-linear-to-br text-white from-cyan-300 to-sky-900
      rounded-lg h-6 flex items-center p-1">{getAllByState('saved')(memData()).length}</Motion.div>
    <Motion.div press={{ scale: [1, 1.3] }} onClick={() => setMode('deleted')} class="bg-linear-to-br text-white from-red-300 to-red-600 text-slate-600 rounded-lg h-6 flex items-center p-1">{getAllByState('deleted')(memData()).length}</Motion.div>
  </div>
}

export default Banner;
