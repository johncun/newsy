import { Show } from 'solid-js'
import { SvgCross } from './svgs';
import { createSignal, onMount } from "solid-js";
import { registerSW } from "virtual:pwa-register";
import { setToast, toast } from './signals';

function usePWAUpdate() {
  const [updateAvailable, setUpdateAvailable] = createSignal(false);
  let updateFunction: (reloadPage?: boolean) => Promise<void>

  onMount(() => {
    // registerSW returns a function to trigger the update
    updateFunction = registerSW({
      onNeedRefresh() {
        setUpdateAvailable(true);
      },
      onOfflineReady() {
        console.log("Cuisle is ready for offline use.");
      },
    });
  });

  const downloadUpdate = () => {
    if (updateFunction) updateFunction(true); // true = reload page after update
  };

  return [updateAvailable, downloadUpdate];
}

export function UpdateApplicationToast() {
  const [updateAvailable, downloadUpdate] = usePWAUpdate();

  return (
    <Show when={updateAvailable()}>
      <div class="fixed left-4 bottom-4 right-4 bg-white p-4 rounded-lg border text-slate-600 z-50 bg-linear-to-br from-orange-500 to-orange-700">
        <div>New content available, click on reload button to update.</div>
        <div class="flex justify-around pt-2">
          <button class="border border-white rounded-md bg-green-500 p-2 text-black" onClick={() => downloadUpdate()}>Reload</button>
          <button class="border border-slate-700 rounded-md " onClick={() => downloadUpdate()}>
            <div class="h-8 w-8"><SvgCross fill="black" /></div></button></div>
      </div>
    </Show>
  );
}
export const popupToast = (s: string, timeout: number = 2000) => {
  setToast(s);
  setTimeout(() => setToast(''), timeout)
}

export function Toast() {
  return (
    <Show when={toast() !== ''}>
      <div class="fixed flex items-center text-sm justify-around left-4 bottom-4 right-4 p-4 rounded-lg border border-slate-600 text-slate-300 z-50 bg-linear-to-br from-gray-900 to-black">
        <div>{toast()}</div>
      </div>
    </Show >
  );
}

