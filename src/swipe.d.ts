import { SwipeHandler } from './swipe';

declare module 'solid-js' {
  namespace JSX {
    interface CustomEvents {}
    interface IntrinsicElements {}
    interface Directives {
      swipe: SwipeHandler;
    }
  }
}
