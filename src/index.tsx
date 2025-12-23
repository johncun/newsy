/* @refresh reload */
import { MetaProvider } from '@solidjs/meta'
import { render } from 'solid-js/web'
import { registerSW } from 'virtual:pwa-register'
import App from './App.jsx'
import './index.css'

registerSW({
  immediate: true,
  onNeedRefresh() { console.log('SW Needs Refresh') },
  onOfflineReady() { console.log('SW Offline Ready') },

})

const root = document.getElementById('root')

render(
  () => (
    <MetaProvider>
      <App />
    </MetaProvider>
  ),
  root!,
)
