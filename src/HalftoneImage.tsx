import { createSignal, createMemo, createUniqueId, mergeProps, createEffect, onCleanup } from 'solid-js';

const HalftoneImage = (props: { src: Blob | null | undefined, grayscale: boolean, alt?: string, class?: string, config: Partial<HalftoneConfig> }) => {
  // 1. Merge defaults with the "Baked" values you want to use
  const config: HalftoneConfig = mergeProps({
    "size": 3.5,
    "angle": 25,
    "warp": 2,
    "freq": 0.23,
    "octaves": 2,
    "blur": 1.1,
    "slope": 2,
    "intercept": -0.15,
    "invert": true,
    "inkColor": "#222222"
  }, props.config);

  const uid = createUniqueId();
  const filterId = `halftone-filter-${uid}`;
  const patternId = `pattern-${uid}`;

  // --- Image Source Handling ---
  const [imgUrl, setImgUrl] = createSignal("");

  createEffect(() => {
    if (props.src instanceof Blob) {
      const url = URL.createObjectURL(props.src);
      setImgUrl(url);
      onCleanup(() => URL.revokeObjectURL(url));
    }
  });

  // --- 1. Seamless Rotation Pattern ---
  const patternHref = createMemo(() => {
    const s = config.size;
    const a = config.angle;
    const r = s * 0.45;

    // Note: 'patternTransform' rotates the coordinate system of the pattern,
    // allowing the dots to rotate without clipping at tile boundaries.
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

  // --- 2. Grayscale Matrix Logic ---
  const grayMatrix = createMemo(() => {
    if (props.grayscale) {
      // INVERTED LUMINANCE: Dark pixels become White (High Value)
      // -0.21R - 0.72G - 0.07B + 1.0
      return "-0.21 -0.72 -0.07 0 1  -0.21 -0.72 -0.07 0 1  -0.21 -0.72 -0.07 0 1  0 0 0 1 0";
    }
    // IDENTITY: Keep original colors
    return "1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0";
  });

  // --- 3. Colorize Matrix Logic ---
  const colorMatrix = createMemo(() => {
    if (!props.grayscale) {
      // Pass through original RGB
      return "1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0";
    }

    // Map the Alpha channel (result of threshold) to the Ink Color
    const hex = config.inkColor;
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    // The final row "1 0 0 0 0" keeps the alpha from the input
    return `0 0 0 0 ${r}  0 0 0 0 ${g}  0 0 0 0 ${b}  1 0 0 0 0`;
  });

  return (
    <div style={{ position: 'relative', display: 'inline-block' }} class={props.class}>

      {/* SVG Filter Definition (Hidden) */}
      <svg width="0" height="0" style={{ position: 'absolute', overflow: 'hidden' }}>
        <defs>
          <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%" color-interpolation-filters="sRGB">

            {/* Stage 1: Convert to Gray (or Inverted Gray) */}
            <feColorMatrix in="SourceGraphic" type="matrix" values={grayMatrix()} result="gray" />

            {/* Stage 2: Generate Pattern Layer */}
            <feImage href={patternHref()} x="0" y="0" width="3000" height="3000" result="pattern" />

            {/* Stage 3: Organic Distortion */}
            <feTurbulence type="fractalNoise" baseFrequency={config.freq} numOctaves={config.octaves} result="noise" />
            <feDisplacementMap in="pattern" in2="noise" scale={config.warp} xChannelSelector="R" yChannelSelector="G" result="distorted" />

            {/* Stage 4: Blur for Ink Bleed */}
            <feGaussianBlur in="distorted" stdDeviation={config.blur} result="soft" />

            {/* Stage 5: Masking (Multiply Gray * Pattern) */}
            <feComposite in="gray" in2="soft" operator="arithmetic" k1="1" k2="0" k3="0" k4="0" result="masked" />

            {/* Stage 6: Hard Threshold */}
            <feComponentTransfer in="masked" result="threshold">
              <feFuncR type="linear" slope={config.slope} intercept={config.intercept} />
              <feFuncG type="linear" slope={config.slope} intercept={config.intercept} />
              <feFuncB type="linear" slope={config.slope} intercept={config.intercept} />
            </feComponentTransfer>

            {/* Stage 7: Apply Ink Color */}
            <feColorMatrix in="threshold" type="matrix" values={colorMatrix()} />

          </filter>
        </defs>
      </svg>

      {/* Rendered Image */}
      {imgUrl() && (
        <img
          src={imgUrl()}
          alt={props.alt || "Halftone"}
          style={{
            filter: `url(#${filterId})`,
            "max-width": "100%",
            height: "auto",
            display: "block"
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

  /** Amount of displacement distortion applied to the grid */
  warp: number;

  /** Frequency of the noise texture used for warping */
  freq: number;

  /** Complexity of the noise texture (default: 2) */
  octaves: number;

  /** Ink bleed simulation radius (Gaussian Blur stdDeviation) */
  blur: number;

  /** Contrast of the threshold function (Slope) */
  slope: number;

  /** Brightness offset (Intercept) */
  intercept: number;

  /** * If true, uses INVERTED grayscale logic (Dark pixels = High Value).
   * This is required for "Positive Print" (Black ink on White paper).
   * If false, uses original colors (Identity matrix).
   */
  invert: boolean;

  /** The hex color string for the ink (e.g., "#222222") */
  inkColor: string;
}
export default HalftoneImage;
