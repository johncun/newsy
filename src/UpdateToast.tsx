import { Show } from 'solid-js'
import { useRegisterSW } from 'virtual:pwa-register/solid'

function UpdateToast() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  return (
    <Show when={needRefresh()}>
      <div class="fixed bottom-4 right-4 bg-white p-4 shadow-lg rounded-lg border">
        <span>New content available, click on reload button to update.</span>
        <button onClick={() => updateServiceWorker(true)}>Reload</button>
        <button onClick={() => setNeedRefresh(false)}>Close</button>
      </div>
    </Show>
  )
}

export default UpdateToast;
