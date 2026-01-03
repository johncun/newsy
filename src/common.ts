import { ArticleRecord, ArticleState } from "@shared/feed-types";
import { killArticle, updateState } from "./db";
export type Action = 'Kill' | 'Save' | 'Delete' | ''

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

export const sorterPubDate = (a: ArticleRecord, b: ArticleRecord) => {
  const dateA = new Date(a.pubDate).getTime()
  const dateB = new Date(b.pubDate).getTime()
  if (isNaN(dateA) || isNaN(dateB)) {
    return 0
  }
  return dateB - dateA
}


export function formatTimeAgo(dateInput: Date | string | number | undefined): string {

  if (!dateInput) return "Never";

  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return "Invalid date";

  const now = new Date();
  const diffInSeconds = Math.floor((date.getTime() - now.getTime()) / 1000);

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

export type ActionToState = { [key: string]: ArticleState }

const actionToState: ActionToState = {
  Save: 'saved',
  Delete: 'deleted',
}

export const onSwipeRight = (guid: string, action: Action) => {
  if (action === '') return
  if (action === 'Kill') killArticle(guid)

  updateState(guid, actionToState[action])
}

export const onSwipeLeft = (guid: string, action: Action) => {
  if (action === '') return
  if (action === 'Kill') killArticle(guid)

  updateState(guid, actionToState[action])
}

export function hashToBoolean(str: string): boolean {
  let hash = 0;

  for (let i = 0; i < str.length; i++) {
    // Standard djb2 hash logic: hash * 33 + charCode
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
    // Convert to 32bit integer to keep numbers manageable
    hash |= 0;
  }

  // Return true if even, false if odd
  return hash % 2 === 0;

}

export let lastFeedFetchedTime = 0
export const timestampFetch = () => lastFeedFetchedTime = Date.now()

export async function copyToClipboard(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
    console.log('Text copied to clipboard');
  } catch (err) {
    console.error('Failed to copy: ', err);
  }
}
export const encodeUnicode = (str: string): string => {
  return btoa(new TextEncoder().encode(str).reduce((data, byte) => data + String.fromCharCode(byte), ''));
};

export const decodeUnicode = (base64: string): string => {
  const binaryString = atob(base64);

  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return new TextDecoder().decode(bytes);
}


