import {
  ArticleState,
  SourceRecord,
  SourceRecords,
  SourceRecordSchema,
} from '@shared/feed-types'
import { createStore, reconcile } from 'solid-js/store'
import { DEFAULT_FEED_URLS } from '@shared/constants'
import { createSignal } from 'solid-js'

export const [mode, setMode] = createSignal<ArticleState>('live')
export const [isFetching, setIsFetching] = createSignal(false)
export const [selectedGuid, setSelectedGuid] = createSignal('')

export const [showOptions, setShowOptions] = createSignal(false)
export const [menuGuid, setMenuGuid] = createSignal<string>('')

export const [userSources, setUserSources] =
  createStore<SourceRecords>(DEFAULT_FEED_URLS)

export const loadSourcesFromStorage = () => {
  const fromLocal = localStorage.getItem('newsy:sources')
  if (!fromLocal) {
    setUserSources(DEFAULT_FEED_URLS)
    return
  }

  try {
    console.log({ fromLocal })
    setUserSources(SourceRecords.parse(JSON.parse(fromLocal)))
  } catch (e) {
    console.error(e)
  }
}

loadSourcesFromStorage()

export const saveSourcesToStorage = () => {
  console.log({ userSources })
  const data = reconcile(userSources)
  console.log({ data: data(userSources) })

  localStorage.setItem('newsy:sources', JSON.stringify(data(userSources)))
}
