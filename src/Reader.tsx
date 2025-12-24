import { For, Match, Switch } from "solid-js"
import { Motion, Presence } from "solid-motionone"
import { SvgCross } from "./svgs"
import { setReaderPageInfo } from "./signals"

const TextAndImages = (props: { content: any[] }) => {

  return <For each={props.content}>{(sub) =>
    <Switch>
      <Match when={sub.type === "text"}><div class="font-[Noto_Serif] px-6 py-3 text-sm max-w-90 _text-justify _hyphens-auto 
indent-2.5">{sub.value}</div></Match>
      <Match when={sub.type === "image"}><div class="flex flex-col items-center w-[90%] border border-slate-700/30 rounded-lg p-1 "><img src={sub.url} alt={sub.alt} /><div class="text-xs text-center">{sub.alt}</div></div></Match>
    </Switch>
  }
  </For>
}

export type ReaderInput = {
  source: string,
  items: any[]
}

const Reader = (props: { originalLink: string, value: ReaderInput }) => {
  const parse = () => {
    const fs = props.value.items.filter(el => el.level === "h1")
    return fs
  }

  return (
    <Presence exitBeforeEnter>
      <Motion.div exit={{ x: [0, "120vw"] }} animate={{ x: ["120vw", 0] }} class="absolute inset-0 flex flex-col items-center p-4 bg-white text-zinc-800 overflow-y-auto">
        <div class="w-8 h-8 z-50 absolute right-2 top-2 bg-white rounded-full border border-slate-700 p-1" onClick={() => setReaderPageInfo('')}>
          <SvgCross fill="#242424" />
        </div >
        <div class="flex text-xs pb-2 justify-end w-full relative gap-8 items-center">
          <div>Source: <a class={props.originalLink}>{props.value.source}</a></div><div class="w-6 h-6">
            <SvgCross fill="#242424" />
          </div>
        </div>
        <For each={parse()}>
          {el => {
            return <>
              <div class="font-[Noto_Serif] text-2xl text-slate-900 text-center font-bold mb-4">{el.title!}</div>
              <TextAndImages content={el.content} />
            </>
          }}
        </For>
      </Motion.div>
    </Presence>
  )
}

export default Reader;

