import { createSignal } from "solid-js";
import { ArticleState } from "./schemas/FeedItem";

export const [mode, setMode] = createSignal<ArticleState>('live')
