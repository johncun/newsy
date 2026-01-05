import {
  ArticleRecord,
  ArticleRecords,
  ArticleState,
  FeedItem,
  FeedItems,
} from '@shared/feed-types'
import { createEffect, createSignal } from 'solid-js'

import { REMOVE_LIVE_AFTER_HOURS } from './options'

const STORAGE_KEY = 'newsy:articles'
const STORAGE_KILLS = 'newsy:killedlist'

export const [memData, setMemData] = createSignal<ArticleRecords>([])
export type KilledItemMap = { [link: string]: { time: number } }
export const [killedList, setKilledList] = createSignal<KilledItemMap>({});

const MS_TO_KEEP_KILLS = 3 * 24 * 50 * 60 * 1000;

export const autoClearKills = () => {
  const ks = killedList()
  const ds = new Set()
  const now = Date.now()

  Object.keys(ks).forEach(k => {
    if (now - ks[k].time < MS_TO_KEEP_KILLS) ds.add(k)
    if (ds.size === 0) return;
  })

  setMemData(mds => {
    return mds.flatMap(a => {
      if (ds.has(a.guid)) {
        return []
      } else return [a]
    })
  })

  setKilledList(ks)
}

export const lastPubTime = (): number => {
  const sorted = [...memData()].sort(sorterPubDate).slice(0, settings.maxLiveCount)
  if (sorted.length === 0) return 0;
  return new Date(sorted[0].pubDate).getTime()
}

export const getAllFromLocal = () => {
  const data = localStorage.getItem(STORAGE_KEY)
  if (!data) {
    console.log('No data in localStorage')
    setMemData([])
  }
  try {
    console.log({ data })
    const parsed = ArticleRecords.parse(JSON.parse(data || '[]'))
    console.log('parsed', parsed.length)
    setMemData(deduplicateByGiud(parsed))
  } catch (e) {
    console.error('Error parsing data from localStorage:', e)
    setMemData([])
  }
}

export const getKillListFromLocal = () => {
  const data = localStorage.getItem(STORAGE_KILLS) || "{}"

  try {
    let ks = JSON.parse(data)
    if (Array.isArray(ks)) {

      ks = ks.map(l => ([l, Date.now() - (24 * 3600000)])).reduce((prev, [l, t]) => ({ ...prev, [l]: { time: t } }), {})
    }

    setKilledList(ks)
  } catch (e) {
    console.error('Error parsing data from localStorage:', e)
    setKilledList({})
  }
}

getAllFromLocal()
getKillListFromLocal()

export const saveAllToLocal = (
  md: ArticleRecords,
  kills: KilledItemMap,
): void => {
  // console.log('saving to local', { data: md, kills })
  localStorage.setItem(STORAGE_KEY, JSON.stringify(md))
  localStorage.setItem(STORAGE_KILLS, JSON.stringify(kills))
}

const FeedItemToNewRecord = (item: FeedItem): ArticleRecord => {
  return {
    ...item,
    state: 'live',
  }
}
export const getArticleByGuid = (guid: string): ArticleRecord | undefined =>
  memData().find(a => a.guid === guid) || undefined

export const allGuids = (): Set<string> => {
  const guids = new Set(memData().map(it => it.guid))
  if (killedList()) {
    Object.keys(killedList()).forEach(k => {
      guids.add(k)
    })
  }
  return guids
}

const deduplicateByGiud = (as: ArticleRecords): ArticleRecords => {
  const soFar = new Set<String>()
  return as.flatMap(a => {
    if (!soFar.has(a.guid)) {
      soFar.add(a.guid);
      return [a]
    }
    return []
  })
}

export const refreshDbWithFeedItems = (items: FeedItems): void => {
  if (items.length === 0) return
  const guids = allGuids()
  console.log({ guids: guids.size })

  const newRecords: ArticleRecord[] = items
    .map(FeedItemToNewRecord)
    .filter((record: ArticleRecord) => !guids.has(record.guid))

  console.log({ newRecords: newRecords.length })
  if (newRecords.length === 0) return

  const amalgamated = [...newRecords, ...memData()]
  console.log({ amalgamated: amalgamated.length })

  const extractedLive = amalgamated.filter(a => a.state === 'live')
  console.log({ extractedLive: extractedLive.length })

  if (extractedLive.length <= settings.maxLiveCount) {

    const deduped = deduplicateByGiud(amalgamated)
    setMemData(deduped);
    console.log('setMemData with amalgamated');
  }
  else {
    const sorted = extractedLive.sort(sorterPubDate).slice(0, settings.maxLiveCount)
    console.log({ sorted: sorted.length })
    setMemData([...sorted, ...amalgamated.filter(a => a.state !== 'live')])
    console.log('setMemData with sorted + amalgamated');
  }
}

export const updateState = (guid: string, newState: ArticleState) => {
  setMemData(mds => {
    return mds.map(a => {
      if (a.guid === guid) {
        return { ...a, state: newState }
      } else return a
    })
  })
}

export const updateStates = (guids: string[], newState: ArticleState) => {
  const gset = new Set(guids)
  setMemData(mds => {
    return mds.map(a => {
      if (gset.has(a.guid)) {
        return { ...a, state: newState }
      } else return a
    })
  })
}

export const getAllByState =
  (state: ArticleState) =>
    (md: ArticleRecords): ArticleRecords => {
      return md.filter(a => a.state === state)
    }
const DELETED_MAX_ALLOWED_COUNT = 400

export const removeOldDeletes = (_md: ArticleRecords) => {
  const ds = getAllByState('deleted')(_md)
  if (ds.length <= DELETED_MAX_ALLOWED_COUNT) return

  ds.sort((a, b) => (a.deletedAt || 0) - (b.deletedAt || 0))

  const wantedGuids = new Set(
    ds.slice(0, DELETED_MAX_ALLOWED_COUNT).map(a => a.guid),
  )
  const cleanedArr = _md.filter(
    a => a.state !== 'deleted' || wantedGuids.has(a.guid),
  )
  const cleaned = new Set(cleanedArr)
  const mdset = new Set(_md)
  const diff = mdset.difference(cleaned)
  if (diff.size) {
    setTimeout(() => {
      setMemData(cleanedArr)
    }, 100)
  }
}

export const removeLiveAfterHours = () => {
  const allLive = getAllByState('live')(memData())
  const pit = Date.now() - 1000 * 3600 * REMOVE_LIVE_AFTER_HOURS
  const old = allLive.filter(a => new Date(a.pubDate).getTime() < pit)
  if (!old.length) return

  console.log({ old })
  const toDeletes = new Set(old.map(a => a.guid))

  setMemData(mds => {
    return mds.map(a => {
      if (toDeletes.has(a.guid)) {
        a.state = 'deleted'
      }
      return a
    })
  })
}

export const killArticles = (guids: string[]) => {
  const toKills = new Set(guids)

  const ks = guids.reduce((prev, id) => ({ ...prev, [id]: { time: Date.now() } }), {} as KilledItemMap)

  setMemData(mds => {
    return mds.flatMap(a => {
      if (toKills.has(a.guid)) {
        ks[a.guid] = { time: Date.now() }
        return []
      } else return [a]
    })
  })

  setKilledList(ks)
}

export const killArticle = (guid: string) => {
  const ks = killedList()

  setMemData(mds => {
    return mds.flatMap(a => {
      if (a.guid === guid && !ks[a.guid]) {
        ks[a.guid] = { time: Date.now() }
        return []
      } else return [a]
    })
  })

  setKilledList(ks)
}

export const [allLive, setAllLive] = createSignal<ArticleRecords>([])

createEffect(() => {
  const ks = killedList()

  const md = memData() || []

  saveAllToLocal(md, ks)
  setAllLive(getAllByState('live'))
  removeOldDeletes(md)
})

removeLiveAfterHours()

setInterval(() => {
  removeLiveAfterHours()
}, 15000)



import { createStore, delMany, entries } from "idb-keyval";
import { get, set } from "idb-keyval";
import { reduceImageSize, sorterPubDate } from './common'
import { settings } from './settings-utils'

const imageCache = createStore("newsy-db", "images");

export const ImageVault = {
  getOrFetch: async (imageUrl: string): Promise<Blob | null> => {
    try {
      const cached = await get(imageUrl, imageCache);
      if (!!cached) {
        if (cached instanceof Blob) {
          await set(imageUrl, { cached, when: Date.now() }, imageCache);
          return cached;
        }
        else {
          return cached.slimBlob
        }
      }

      // Encode the URL to ensure special characters don't break the query string
      const proxyUrl = `/api/proxy?url=${encodeURIComponent(imageUrl)}`;

      const response = await fetch(proxyUrl);
      if (!response.ok) throw new Error("Proxy failed");
      const heavyBlob = await response.blob();

      // Shrink it before it touches the database
      const slimBlob = await reduceImageSize(heavyBlob, 400, 0.6);

      console.log(`Reduced from ${heavyBlob.size / 1024}KB to ${slimBlob.size / 1024}KB`);

      await set(imageUrl, { slimBlob, when: Date.now() }, imageCache);
      return slimBlob;
    } catch (e) {
      console.error("Cache and Proxy both failed", e);
      return null;
    }
  },
  purge: async (): Promise<void> => {

    const all = await entries(imageCache)
    if (all.length === 0) return

    const toPurge = all.flatMap(([k, v]: [IDBValidKey, Blob | { slimBlob: Blob; when: number }]) => {
      if (v instanceof Blob)
        return [k]
      if (v.when && (Date.now() - v.when) > (1000 * 3600 * 72)) return [k];
      else {
        return [] as IDBValidKey
      }
    })
    if (toPurge.length === 0) return
    await delMany(toPurge, imageCache)

  }
};
