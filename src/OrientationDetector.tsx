import { createSignal, onCleanup, onMount } from "solid-js";

export const useOrientationDetector = () => {
  const [isLandscape, setIsLandscape] = createSignal(
    window.matchMedia("(orientation: landscape)").matches
  );

  onMount(() => {
    const mql = window.matchMedia("(orientation: landscape)");

    const handler = (ev: any) => setIsLandscape(ev.matches);

    mql.addEventListener("change", handler);

    onCleanup(() => mql.removeEventListener("change", handler));
  });

  return [isLandscape]
}
