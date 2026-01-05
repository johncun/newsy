import {
  ArticleState,
} from '@shared/feed-types'
import { createSignal } from 'solid-js'

export const [mode, setMode] = createSignal<ArticleState>('live')
export const [performFetchFeedsTrigger, setPerformFetchFeedsTrigger] = createSignal(0)
export const [isFetchingFeeds, setIsFetchingFeeds] = createSignal<boolean>(false)
export const [isFetchingStory, setIsFetchingStory] = createSignal<boolean>(false)
export const [selectedGuid, setSelectedGuid] = createSignal('')
export const isSelected = (guid: string) => selectedGuid() === guid
export const [showButtons, setShowButtons] = createSignal(false)

export const [showOptions, setShowOptions] = createSignal(false)
export const [menuGuid, setMenuGuid] = createSignal<string>('')
export type ReaderInput = {
  source: string,
  link: string,
  backupImage: string,
  items: any[]
}
export const [readerPageInfo, setReaderPageInfo] = createSignal<ReaderInput | undefined>();

export const [tick, setTick] = createSignal(1)

export const [networkIssue, setNetworkIssue] = createSignal(false)

