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
export const [killedList, setKilledList] = createSignal<Set<string>>(
  new Set([]),
)

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
    setMemData(parsed)
  } catch (e) {
    console.error('Error parsing data from localStorage:', e)
    setMemData([])
  }
}

export const getKillListFromLocal = () => {
  const data = localStorage.getItem(STORAGE_KILLS)
  if (!data) {
    console.log('No data in localStorage')
    setKilledList(new Set([]))
  }
  try {
    const parsed: string[] = JSON.parse(data || '[]')
    console.log('parsed', parsed.length)
    setKilledList(new Set(parsed))
  } catch (e) {
    console.error('Error parsing data from localStorage:', e)
    setKilledList(new Set([]))
  }
}

getAllFromLocal()
getKillListFromLocal()

export const saveAllToLocal = (
  md: ArticleRecords,
  kills: Set<string>,
): void => {
  console.log('saving to local', { data: md, kills: [...kills] })
  localStorage.setItem(STORAGE_KEY, JSON.stringify(md))
  localStorage.setItem(STORAGE_KILLS, JSON.stringify([...kills]))
}

const FeedItemToNewRecord = (item: FeedItem): ArticleRecord => {
  return {
    ...item,
    state: 'live',
  }
}
export const getArticleByGuid = (guid: string): ArticleRecord | undefined =>
  memData().find(a => a.guid === guid) || undefined

export const refreshDbWithFeedItems = (items: FeedItems): void => {
  if (items.length === 0) return

  const allGuids = new Set(memData().map(it => it.guid))
  if (killedList()) {
    for (const a of killedList()) {
      allGuids.add(a)
    }
  }

  const newRecords: ArticleRecord[] = items
    .map(FeedItemToNewRecord)
    .filter((record: ArticleRecord) => !allGuids.has(record.guid))

  if (newRecords.length === 0) return

  setMemData([...newRecords, ...memData()])
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

  const ks = killedList()

  setMemData(mds => {
    return mds.flatMap(a => {
      if (toKills.has(a.guid)) {
        ks.add(a.guid)
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
      if (a.guid === guid) {
        ks.add(guid)
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



import { createStore } from "idb-keyval";
import { get, set } from "idb-keyval";
import { reduceImageSize } from './common'

const imageCache = createStore("newsy-db", "images");

export const ImageVault = {
  getOrFetch: async (imageUrl: string): Promise<Blob | null> => {
    try {
      const cached = await get(imageUrl, imageCache);
      if (cached instanceof Blob) return cached;

      // Encode the URL to ensure special characters don't break the query string
      const proxyUrl = `/api/proxy?url=${encodeURIComponent(imageUrl)}`;

      const response = await fetch(proxyUrl);
      if (!response.ok) throw new Error("Proxy failed");
      const heavyBlob = await response.blob();

      // Shrink it before it touches the database
      const slimBlob = await reduceImageSize(heavyBlob, 400, 0.6);

      console.log(`Reduced from ${heavyBlob.size / 1024}KB to ${slimBlob.size / 1024}KB`);

      await set(imageUrl, slimBlob, imageCache);
      return slimBlob;
    } catch (e) {
      console.error("Cache and Proxy both failed", e);
      return null;
    }
  }
};
