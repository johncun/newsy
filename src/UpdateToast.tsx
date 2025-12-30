import { Show } from 'solid-js'
import { useRegisterSW } from 'virtual:pwa-register/solid'
import { SvgCross } from './svgs';

function UpdateToast() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  return (
    <Show when={needRefresh()}>
      <div class="fixed left-4 bottom-4 right-4 bg-white p-4 rounded-lg border text-slate-600 z-50 bg-gradient-to-br from-orange-500 to-orange-700 text-white">
        <div>New content available, click on reload button to update.</div>
        <div class="flex justify-around pt-2">
          <button class="border border-white rounded-md bg-green-500 p-2 text-black" onClick={() => updateServiceWorker(true)}>Reload</button>
          <button class="border border-slate-700 rounded-md " onClick={() => setNeedRefresh(false)}>
            <div class="h-8 w-8"><SvgCross fill="black" /></div></button></div>
      </div>
    </Show>
  )
}

export default UpdateToast;
