import { createSignal, createMemo, createUniqueId, mergeProps, createEffect, onCleanup } from 'solid-js';

const HalftoneImage = (props: { src: Blob | null | undefined, alt?: string, class?: string, config: Partial<HalftoneConfig> }) => {
  // 1. Merge defaults with the "Baked" values you want to use
  const config = mergeProps({

    "size": 5,
    "angle": 25,
    "warp": 1,
    "freq": 0.13,
    "octaves": 2,
    "blur": 1.8,
    "slope": 6,
    "intercept": -1.8,
    "grayscale": true,
    "inkColor": "#b0b0b0"
  }, props.config);

  // 2. Generate Unique IDs to prevent conflicts if used multiple times
  const uid = createUniqueId();
  const filterId = `halftone-filter-${uid}`;
  const patternId = `pattern-${uid}`;

  // 3. Handle Image Input (Blob vs String)
  const [imgUrl, setImgUrl] = createSignal("");

  createEffect(() => {
    if (!props.src) return
    if (props.src instanceof Blob) {
      const url = URL.createObjectURL(props.src);
      setImgUrl(url);
      onCleanup(() => URL.revokeObjectURL(url));
    } else {
      setImgUrl(props.src);
    }
  });

  // 4. Memoize the Base64 Pattern Generation (The Rotation Logic)
  const patternHref = createMemo(() => {
    const s = config.size;
    const a = config.angle;
    const r = s * 0.45; // Fixed radius ratio

    // We generate an SVG Pattern *inside* the SVG to handle rotation seamlessly
    const svgString = `
      <svg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%'>
        <defs>
          <pattern id='${patternId}' width='${s}' height='${s}' patternUnits='userSpaceOnUse' patternTransform='rotate(${a})'>
            <rect width='100%' height='100%' fill='black'/>
            <circle cx='${s / 2}' cy='${s / 2}' r='${r}' fill='white'/>
          </pattern>
        </defs>
        <rect width='100%' height='100%' fill='url(#${patternId})'/>
      </svg>`;

    return 'data:image/svg+xml;base64,' + btoa(svgString);
  });

  // 5. Memoize Matrices based on Mode
  const grayMatrix = createMemo(() => config.grayscale
    ? "0.21 0.72 0.07 0 0  0.21 0.72 0.07 0 0  0.21 0.72 0.07 0 0  0 0 0 1 0" // Standard Luma
    : "1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0" // Identity
  );

  const colorMatrix = createMemo(() => {
    if (!config.grayscale) {
      return "1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0"; // Identity
    }
    // Hex to RGB normalized (0-1)
    const hex = config.inkColor;
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    return `0 0 0 0 ${r}  0 0 0 0 ${g}  0 0 0 0 ${b}  1 0 0 0 0`;
  });

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>

      {/* The Filter Definition
         Hidden from view but referenced by ID.
         We use absolute positioning to ensure it takes no layout space.
      */}
      <svg width="0" height="0" style={{ position: 'absolute', overflow: 'hidden' }}>
        <defs>
          <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%" color-interpolation-filters="sRGB">

            {/* 1. Grayscale Conversion */}
            <feColorMatrix in="SourceGraphic" type="matrix" values={grayMatrix()} result="gray" />

            {/* 2. Pattern Generation (Large feImage to avoid tiling seams) */}
            <feImage href={patternHref()} x="0" y="0" width="3000" height="3000" result="pattern" />

            {/* 3. Noise & Distortion */}
            <feTurbulence type="fractalNoise" baseFrequency={config.freq} numOctaves={config.octaves} result="noise" />
            <feDisplacementMap in="pattern" in2="noise" scale={config.warp} xChannelSelector="R" yChannelSelector="G" result="distorted" />

            {/* 4. Ink Bleed */}
            <feGaussianBlur in="distorted" stdDeviation={config.blur} result="soft" />

            {/* 5. Masking */}
            <feComposite in="gray" in2="soft" operator="arithmetic" k1="1" k2="0" k3="0" k4="0" result="masked" />

            {/* 6. Threshold / Contrast */}
            <feComponentTransfer in="masked" result="threshold">
              <feFuncR type="linear" slope={config.slope} intercept={config.intercept} />
              <feFuncG type="linear" slope={config.slope} intercept={config.intercept} />
              <feFuncB type="linear" slope={config.slope} intercept={config.intercept} />
            </feComponentTransfer>

            {/* 7. Colorization */}
            <feColorMatrix in="threshold" type="matrix" values={colorMatrix()} />

          </filter>
        </defs>
      </svg>

      {/* The Rendered Image */}
      {imgUrl() && (
        <img
          src={imgUrl()}
          alt={props.alt || ""}
          class={props.class || ""}
          crossOrigin="anonymous"
          loading="lazy"
          style={{
            filter: `url(#${filterId})`,
            "max-width": "100%",
            height: "auto"
          }}
        />
      )}
    </div>
  );
};

export interface HalftoneConfig {
  /** Size of the halftone dots in pixels (default: 8) */
  size: number;

  /** Angle of the grid rotation in degrees (default: 19) */
  angle: number;

  /** * Amount of displacement distortion applied to the grid 
   * (0 = perfect grid, higher = more organic/rough)
   */
  warp: number;

  /** * Frequency of the noise texture used for warping 
   * (0.01 = large waves, 0.5 = fine grain)
   */
  freq: number;

  /** Complexity of the noise texture (default: 2) */
  octaves: number;

  /** * Ink bleed simulation radius (Gaussian Blur stdDeviation)
   * Higher values make dots softer and larger.
   */
  blur: number;

  /** * Contrast of the threshold function (Slope).
   * Higher values create harder edges (digital look), lower values create soft fuzz.
   */
  slope: number;

  /** * Brightness offset (Intercept).
   * Controls the "exposure" of the halftone mask.
   */
  intercept: number;

  /** * If true, converts image to grayscale before processing.
   * If false, uses the original image colors (Identity matrix).
   */
  grayscale: boolean;

  /** * The hex color string for the ink (e.g., "#1a1a1a").
   * Only applied when grayscale is true.
   */
  inkColor: string;
}


export default HalftoneImage;
