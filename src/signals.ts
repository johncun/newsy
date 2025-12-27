import {
  ArticleState,
} from '@shared/feed-types'
import { createSignal } from 'solid-js'

export const [mode, setMode] = createSignal<ArticleState>('live')
export const [isFetching, setIsFetching] = createSignal<boolean | null>(null)
export const [selectedGuid, setSelectedGuid] = createSignal('')

export const [showOptions, setShowOptions] = createSignal(false)
export const [menuGuid, setMenuGuid] = createSignal<string>('')

export type ReaderText = {
  type: 'text';
  value: string;
}

export type ReaderImage = {
  type: 'image';
  url: string;
  alt: string;
}

export type ReaderItem = {
  title: string;
  level: string;
  content: ReaderContent[]
}


export type ReaderContent = ReaderImage | ReaderText;


export type ReaderInput = {
  source: string,
  link: string,
  backupImage: string,
  items: ReaderItem[]
}
export const [readerPageInfo, setReaderPageInfo] = createSignal<ReaderInput | undefined>();



// export const [userSources, setUserSources] =
//   createStore<SourceRecords>(DEFAULT_FEED_URLS)
//
// export const loadSourcesFromStorage = () => {
//   const fromLocal = localStorage.getItem('newsy:sources')
//   if (!fromLocal) {
//     setUserSources(DEFAULT_FEED_URLS)
//     return
//   }
//
//   try {
//     console.log({ fromLocal })
//     setUserSources(SourceRecords.parse(JSON.parse(fromLocal)))
//   } catch (e) {
//     console.error(e)
//   }
// }
//
// loadSourcesFromStorage()
//
// export const saveSourcesToStorage = () => {
//   console.log({ userSources })
//   const data = reconcile(userSources)
//   console.log({ data: data(userSources) })
//
//   localStorage.setItem('newsy:sources', JSON.stringify(data(userSources)))
// }
