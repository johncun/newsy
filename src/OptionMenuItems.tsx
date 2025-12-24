import { ArticleRecord, ArticleRecords } from "@shared/feed-types"
import { createSignal, onMount } from "solid-js"
import { getArticleByGuid, getAllByState, memData, updateStates, killArticles } from "./db"
import { menuGuid, mode, setMenuGuid } from "./signals"

const OptionMenuItems = () => {
  const [a, setA] = createSignal<ArticleRecord>()

  onMount(() => {
    setA(getArticleByGuid(menuGuid()))
  })

  const follows = (): ArticleRecords => {
    const as = getAllByState(mode())(memData())
    if (!as || !as.length) return []
    const idx = as.findIndex(a => a.guid === menuGuid())
    if (idx < 0) return []
    return as.slice(idx)
  }

  const delFollow = () => {
    if (!follows().length) return

    const gs = follows().map(a => a.guid)
    updateStates(gs, 'deleted')

    setMenuGuid('')
  }

  const saveFollow = () => {
    if (!follows().length) return

    const gs = follows().map(a => a.guid)
    updateStates(gs, 'saved')

    setMenuGuid('')
  }

  const killFollow = () => {
    if (!follows().length) return

    const gs = follows().map(a => a.guid)
    killArticles(gs)

    setMenuGuid('')
  }

  return (
    <div class="flex flex-col absolute inset-2">
      <div class="flex items-center justify-end">
        <div onClick={() => setMenuGuid('')} class="w-6 h-6">
          <svg viewBox="0 0 1024 1024">
            <path
              fill="#ffffff"
              d="M195.2 195.2a64 64 0 0 1 90.496 0L512 421.504 738.304 195.2a64 64 0 0 1 90.496 90.496L602.496 512 828.8 738.304a64 64 0 0 1-90.496 90.496L512 602.496 285.696 828.8a64 64 0 0 1-90.496-90.496L421.504 512 195.2 285.696a64 64 0 0 1 0-90.496z"
            />
          </svg>
        </div>
      </div>
      <div>
        {a() && (
          <div class="bg-[#ebe9e4] bg-[url(https://www.transparenttextures.com/patterns/felt.png)] bg-bg-blend-multiply text-slate-700 font-[Noto_Serif] ml-2 mr-2 mt-2 mb-6 rounded-md font-bold p-2 border-b border-b-slate-500">
            <div class="max-w-prose text-lg _leading-relaxed border-black/10 p-5 bg-white/30">
              {a()!.title}
            </div>
          </div>)}
        {mode() === 'live' && (
          <div class="text-slate-400 p-4 flex justify-center">
            <button
              class="rounded-md bg-green-200 text-slate-700 cursor-pointer p-2"
              onClick={
                saveFollow
              }>{`Save this article and following ${follows().length ? (follows().length + ' article(s)') : ''}`}</button>
          </div>
        )}
        {mode() === 'live' && (
          <div class="text-slate-400 p-4 flex justify-center">
            <button
              class="rounded-md bg-orange-400 text-slate-100 cursor-pointer p-2"
              onClick={
                delFollow
              }>{`Delete this article and following ${follows().length ? (follows().length + ' article(s)') : ''}`}</button>
          </div>
        )}

        {mode() === 'deleted' && (
          <div class="text-slate-400 p-4 flex justify-center">
            <button
              class="rounded-md bg-red-700 text-slate-100 cursor-pointer p-2"
              onClick={
                killFollow
              }>{`KILL this article and following ${follows().length ? (follows().length + ' article(s)') : ''}`}</button>
          </div>
        )}

        {mode() === 'saved' && (
          <div class="text-slate-400 p-4 flex justify-center">
            <button
              class="rounded-md bg-orange-400 text-slate-900 cursor-pointer p-2"
              onClick={
                delFollow
              }>{`Delete this article and following ${follows().length ? (follows().length + ' article(s)') : ''}`}</button>
          </div>
        )}
      </div>
    </div >
  )
}

export default OptionMenuItems;
