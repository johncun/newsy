import { createSignal } from "solid-js";
import { ArticleState } from "./schemas/FeedItem";

export const [mode, setMode] = createSignal<ArticleState>('live')
export const [isFetching, setIsFetching] = createSignal(false)
export const [selectedGuid, setSelectedGuid] = createSignal('')

export const [menuGuid, setMenuGuid] = createSignal<string>('')
// export const showNews = (link: string) => setNewsItem(link)
