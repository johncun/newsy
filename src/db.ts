import { createEffect, createSignal } from "solid-js"
import { ArticleRecord, ArticleRecords, ArticleState, FeedItem, FeedItems } from "@shared/feed-types"
import { REMOVE_LIVE_AFTER_HOURS } from "./options"

const STORAGE_KEY = "newsy:articles"
const STORAGE_KILLS = "newsy:killedlist"

// export const currentLiveGuids = new Set<string>()
// export const currentDeletedGuids = new Set<string>()
// export const currentSavedGuids = new Set<string>()
// export const currentAllGuids = currentLiveGuids
//   .union(currentDeletedGuids)
//   .union(currentSavedGuids)

export const [memData, setMemData] = createSignal<ArticleRecords>([])
export const [killedList, setKilledList] = createSignal<Set<string>>(new Set([]))

export const getAllFromLocal = () => {
  const data = localStorage.getItem(STORAGE_KEY)
  if (!data) {
    console.log("No data in localStorage")
    setMemData([])
  }
  try {
    console.log({ data })
    const parsed = ArticleRecords.parse(JSON.parse(data || "[]"))
    console.log('parsed', parsed.length);
    setMemData(parsed)
  }
  catch (e) {
    console.error("Error parsing data from localStorage:", e)
    setMemData([])
  }
}

export const getKillListFromLocal = () => {
  const data = localStorage.getItem(STORAGE_KILLS)
  if (!data) {
    console.log("No data in localStorage")
    setKilledList(new Set([]))
  }
  try {
    const parsed: string[] = JSON.parse(data || "[]")
    console.log('parsed', parsed.length);
    setKilledList(new Set(parsed))
  }
  catch (e) {
    console.error("Error parsing data from localStorage:", e)
    setKilledList(new Set([]))
  }
}

getAllFromLocal()
getKillListFromLocal()

export const saveAllToLocal = (md: ArticleRecords, kills: Set<string>): void => {
  console.log('saving to local', { data: md, kills: [...kills] })
  localStorage.setItem(STORAGE_KEY, JSON.stringify(md))
  localStorage.setItem(STORAGE_KILLS, JSON.stringify([...kills]))
}

const FeedItemToNewRecord = (item: FeedItem): ArticleRecord => {
  return {
    ...item,
    state: "live",
  }
}
export const getArticleByGuid = (guid: string): ArticleRecord | undefined => memData().find(a => a.guid === guid) || undefined

export const refreshDbWithFeedItems = (items: FeedItems): void => {
  if (items.length === 0) return

  const allGuids = new Set(memData().map(it => it.guid))
  if (killedList()) {
    for (const a of killedList()) { allGuids.add(a) }
  }

  const newRecords: ArticleRecord[] = items.map(FeedItemToNewRecord).filter((record: ArticleRecord) => !allGuids.has(record.guid))

  if (newRecords.length === 0) return

  setMemData([...newRecords, ...memData()])
}

export const updateState = (guid: string, newState: ArticleState) => {
  setMemData(mds => {
    return mds.map(a => {
      if (a.guid === guid) {
        return { ...a, state: newState }
      }
      else return a

    })
  })
}

export const updateStates = (guids: string[], newState: ArticleState) => {
  const gset = new Set(guids)
  setMemData(mds => {
    return mds.map(a => {
      if (gset.has(a.guid)) {
        return { ...a, state: newState }
      }
      else return a

    })
  })
}

export const getAllByState = (state: ArticleState) => (md: ArticleRecords): ArticleRecords => {
  return md.filter(a => a.state === state)
}
const DELETED_MAX_ALLOWED_COUNT = 100

export const removeOldDeletes = (_md: ArticleRecords) => {
  const ds = getAllByState('deleted')(_md)
  if (ds.length <= DELETED_MAX_ALLOWED_COUNT) return

  ds.sort((a, b) => (a.deletedAt || 0) - (b.deletedAt || 0))

  const wantedGuids = new Set(ds.slice(0, DELETED_MAX_ALLOWED_COUNT).map(a => a.guid))
  const cleanedArr = _md.filter(a => a.state !== 'deleted' || wantedGuids.has(a.guid))
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
  const pit = (Date.now() - 1000 * 3600 * REMOVE_LIVE_AFTER_HOURS)
  const old = allLive.filter(a => (new Date(a.pubDate)).getTime() < pit)
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
      }
      else return [a]

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
      }
      else return [a]

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

//   const database = await initDB()
//   return new Promie(s(resolve, reject) => {
//     const transaction = database.transaction([STORE_NAME], "readwrite")
//     const store = transaction.objectStore(STORE_NAME)
//
//     const record: ArticleRecord = {
//       ...article,
//       base64Image: base64Image || article.image,
//       state: initialState,
//       ...(initialState === "saved" && { savedAt: Date.now() }),
//       ...(initialState === "deleted" && { deletedAt: Date.now() }),
//     }
//
//     const request = store.put(record)
//     request.onerror = () => reject(request.error)
//     request.onsuccess = () => resolve()
//   })



// const DB_NAME = "NewsFeedDB"
// const DB_VERSION = 3
// const STORE_NAME = "articles"
//
// let db: IDBDatabase | null = null
//
// export async function initDB(): Promise<IDBDatabase> {
//   if (db) return db
//
//   return new Promise((resolve, reject) => {
//     const request = indexedDB.open(DB_NAME, DB_VERSION)
//
//     request.onerror = () => reject(request.error)
//     request.onsuccess = () => {
//       db = request.result
//       resolve(db)
//     }
//
//     request.onupgradeneeded = (event) => {
//       const database = (event.target as IDBOpenDBRequest).result
//
//       if (!database.objectStoreNames.contains(STORE_NAME)) {
//         const store = database.createObjectStore(STORE_NAME, { keyPath: "guid" })
//         store.createIndex("state", "state", { unique: false })
//         store.createIndex("deletedAt", "deletedAt", { unique: false })
//       }
//     }
//   })
// }
//
// export async function updateArticleState(guid: string, newState: ArticleState): Promise<void> {
//   const database = await initDB()
//   return new Promise((resolve, reject) => {
//     const transaction = database.transaction([STORE_NAME], "readwrite")
//     const store = transaction.objectStore(STORE_NAME)
//
//     const getRequest = store.get(guid)
//     getRequest.onsuccess = () => {
//       const article = getRequest.result
//       if (article) {
//         article.state = newState
//         if (newState === "saved") {
//           article.savedAt = Date.now()
//         } else if (newState === "deleted") {
//           article.deletedAt = Date.now()
//         }
//         const putRequest = store.put(article)
//         putRequest.onerror = () => reject(putRequest.error)
//         putRequest.onsuccess = () => resolve()
//       } else {
//         reject(new Error("Article not found"))
//       }
//     }
//     getRequest.onerror = () => reject(getRequest.error)
//   })
// }
//
// export async function createOrUpdateArticle(
//   article: FeedItem,
//   base64Image?: string,
//   initialState: ArticleState = "live",
// ): Promise<void> {
//   const database = await initDB()
//   return new Promise((resolve, reject) => {
//     const transaction = database.transaction([STORE_NAME], "readwrite")
//     const store = transaction.objectStore(STORE_NAME)
//
//     const record: ArticleRecord = {
//       ...article,
//       base64Image: base64Image || article.image,
//       state: initialState,
//       ...(initialState === "saved" && { savedAt: Date.now() }),
//       ...(initialState === "deleted" && { deletedAt: Date.now() }),
//     }
//
//     const request = store.put(record)
//     request.onerror = () => reject(request.error)
//     request.onsuccess = () => resolve()
//   })
// }
//
// export async function refreshDbWithFeedItems(items: FeedItems): Promise<void> {
//   const database = await initDB()
//   return new Promise((resolve, reject) => {
//     const transaction = database.transaction([STORE_NAME], "readwrite")
//     const store = transaction.objectStore(STORE_NAME)
//
//     const feedIds = new Set(items.map((item) => item.guid))
//     const currentDbArticles = store.getAll()
//     currentDbArticles.onsuccess = (ev) => {
//
//       const feedIds = new Set(items.
//         map(({ guid }) => guid))
//       const currentDbArticles = new Set(store.getAll().map(({ guid }) => guid))
//
//       const dbIds = new Set(currentDbArticles.map((item) => item.guid))
//       const newArticles = []
//
//       // For all in feed - check if in DB, if it isn't, add it as "live"
//
//
//       request.onerror = () => reject(request.error)
//       request.onsuccess = () => {
//         const articles = request.result.map(({ guid, title, description, link, source, pubDate, base64Image }) => ({
//           guid,
//           title,
//           description,
//           link,
//           source,
//           pubDate,
//           image: base64Image,
//         }))
//         resolve(articles)
//       }
//       items.forEach((article) => {
//         const record: ArticleRecord = {
//           ...article,
//           base64Image: article.image,
//           state: "live",
//         }
//         store.put(record)
//       }
//     const record: ArticleRecord = {
//         ...article,
//         base64Image: base64Image || article.image,
//         state: initialState,
//         ...(initialState === "saved" && { savedAt: Date.now() }),
//         ...(initialState === "deleted" && { deletedAt: Date.now() }),
//       }
//
//       const request = store.put(record)
//       request.onerror = () => reject(request.error)
//       request.onsuccess = () => resolve()
//     })
// }
//
//
//
// export async function getSavedArticles(): Promise<FeedItem[]> {
//   const database = await initDB()
//   return new Promise((resolve, reject) => {
//     const transaction = database.transaction([STORE_NAME], "readonly")
//     const store = transaction.objectStore(STORE_NAME)
//     const index = store.index("state")
//
//     const request = index.getAll("saved")
//     request.onerror = () => reject(request.error)
//     request.onsuccess = () => {
//       const articles = request.result.map(({ guid, title, description, link, source, pubDate, base64Image }) => ({
//         guid,
//         title,
//         description,
//         link,
//         source,
//         pubDate,
//         image: base64Image,
//       }))
//       resolve(articles)
//     }
//   })
// }
//
// export async function getArticleState(guid: string): Promise<ArticleState | null> {
//   const database = await initDB()
//   return new Promise((resolve, reject) => {
//     const transaction = database.transaction([STORE_NAME], "readonly")
//     const store = transaction.objectStore(STORE_NAME)
//
//     const request = store.get(guid)
//     request.onerror = () => reject(request.error)
//     request.onsuccess = () => {
//       const article = request.result
//       resolve(article?.state || null)
//     }
//   })
// }
//
// export const NUMBER_DELETED_TO_KEEP = 100
//
// export async function cleanupOldDeletedArticles(): Promise<void> {
//   const database = await initDB()
//   return new Promise((resolve, reject) => {
//     const transaction = database.transaction([STORE_NAME], "readwrite")
//     const store = transaction.objectStore(STORE_NAME)
//     const index = store.index("state")
//
//     const request = index.getAll("deleted")
//     request.onsuccess = () => {
//       const deletedArticles = request.result
//       if (deletedArticles.length > 100) {
//         // Sort by deletedAt and remove oldest
//         const sorted = deletedArticles.sort((a, b) => (a.deletedAt || 0) - (b.deletedAt || 0))
//         const toRemove = sorted.slice(0, deletedArticles.length - NUMBER_DELETED_TO_KEEP)
//
//         let deleted = 0
//         toRemove.forEach((article) => {
//           const deleteRequest = store.delete(article.guid)
//           deleteRequest.onsuccess = () => {
//             deleted++
//             if (deleted === toRemove.length) {
//               resolve()
//             }
//           }
//           deleteRequest.onerror = () => reject(deleteRequest.error)
//         })
//       } else {
//         resolve()
//       }
//     }
//     request.onerror = () => reject(request.error)
//   })
// }
//
