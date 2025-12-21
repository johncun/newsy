import { createResource, createMemo, onCleanup, Show } from "solid-js";
import { ImageVault } from "./db";

export const CachedImage = (props: { src: string; alt?: string; class: string }) => {
  // Use the URL as the source for our resource
  const [blob] = createResource(() => props.src, ImageVault.getOrFetch);

  // Create the local URL for the <img> tag
  const objectUrl = createMemo(() => {
    const data = blob();
    if (!data) return null;

    const url = URL.createObjectURL(data);
    onCleanup(() => URL.revokeObjectURL(url));
    return url;
  });

  return (
    <Show
      when={!blob.loading && objectUrl()}
      fallback={<div class="w-full h-48 bg-gray-200 animate-pulse rounded-lg" />}
    >
      <img
        src={objectUrl()!}
        alt={props.alt}
        class={props.class}
        crossOrigin="anonymous"
        loading="lazy"
      />
    </Show>
  );
};
