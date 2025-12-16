import { createSignal } from "solid-js";
import { ArticleState } from "./schemas/FeedItem";

export const [mode, setMode] = createSignal<ArticleState>('live')
export const [refetch, setRefetch] = createSignal(false)

// export const [newsItem, setNewsItem] = createSignal<string>('')
// export const showNews = (link: string) => setNewsItem(link)
