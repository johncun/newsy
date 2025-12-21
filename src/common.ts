export const dt = (dstr: string) => {
  const date = new Date(dstr)
  return (
    date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
    + ' '
    + date.toLocaleTimeString(undefined, {
      hour12: true,
      hour: '2-digit',
      minute: '2-digit',
    })
  )
}

export function formatTimeAgo(dateInput: Date | string | number | undefined): string {
  // 1. Safety Check: Handle missing or invalid dates

  // console.log({ dateInput })

  if (!dateInput) return "Never";

  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return "Invalid date";

  const now = new Date();
  const diffInSeconds = Math.floor((date.getTime() - now.getTime()) / 1000);

  // 2. Safety Check: Ensure we aren't passing NaN or Infinity to the formatter
  if (!Number.isFinite(diffInSeconds)) return "Just now";

  const units: { unit: Intl.RelativeTimeFormatUnit; seconds: number }[] = [
    { unit: "year", seconds: 31536000 },
    { unit: "month", seconds: 2592000 },
    { unit: "day", seconds: 86400 },
    { unit: "hour", seconds: 3600 },
    { unit: "minute", seconds: 60 },
    { unit: "second", seconds: 1 },
  ];

  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  for (const { unit, seconds } of units) {
    if (Math.abs(diffInSeconds) >= seconds || unit === "second") {
      const value = Math.round(diffInSeconds / seconds);

      // Final guard: Ensure 'value' is finite
      return Number.isFinite(value) ? rtf.format(value, unit) : "Just now";
    }
  }

  return "Just now";
}
/**
 * Reducer function to shrink image dimensions and compress quality
 * @param originalBlob The 4MB file
 * @param maxWidth Target width (e.g., 800px is plenty for mobile)
 * @param quality 0.0 to 1.0 (0.7 is the "sweet spot" for 10% file size)
 */
export async function reduceImageSize(
  originalBlob: Blob,
  maxWidth: number = 400,
  quality: number = 0.7
): Promise<Blob> {
  // 1. Convert Blob to ImageBitmap or HTMLImageElement
  const bitmap = await createImageBitmap(originalBlob);

  // 2. Calculate new dimensions while maintaining aspect ratio
  let width = bitmap.width;
  let height = bitmap.height;

  if (width > maxWidth) {
    height = (maxWidth / width) * height;
    width = maxWidth;
  }

  // 3. Draw to Canvas
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  if (!ctx) throw new Error("Canvas context failed");

  // Use high-quality image smoothing
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap, 0, 0, width, height);

  // 4. Export as compressed Blob
  return new Promise((resolve, reject) => {
    // WebP is roughly 30% smaller than JPEG at same quality
    canvas.toBlob(
      (blob) => blob ? resolve(blob) : reject("Conversion failed"),
      "image/webp",
      quality
    );
  });
}

