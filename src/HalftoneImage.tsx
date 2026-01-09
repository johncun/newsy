import { createSignal, createEffect, onCleanup } from 'solid-js';

const HalftoneImage = (props: { src: Blob | null | undefined, alt?: string, class?: string }) => {
  const [imgUrl, setImgUrl] = createSignal("");

  createEffect(() => {
    if (props.src instanceof Blob) {
      const url = URL.createObjectURL(props.src);
      setImgUrl(url);
      onCleanup(() => URL.revokeObjectURL(url));
    }
  });

  return (
    <div style={{ position: 'relative', display: 'inline-block' }} class={props.class}>

      {/* Rendered Image */}
      {imgUrl() && (
        <img
          src={imgUrl()}
          alt={props.alt || "Halftone"}
          style={{
            filter: `url(#halftone-filter)`,
            "max-width": "100%",
            height: "auto",
            display: "block"
          }}
        />
      )}
    </div>
  );
};

export default HalftoneImage;
