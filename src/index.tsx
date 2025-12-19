/* @refresh reload */
import { MetaProvider } from '@solidjs/meta';
import { render } from 'solid-js/web';
import App from './App.jsx';
import './index.css';

const root = document.getElementById('root');

render(
  () => (
    <MetaProvider>
      <App />
    </MetaProvider>
  ),
  root!,
);
