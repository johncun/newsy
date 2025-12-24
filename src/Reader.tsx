import { createEffect, For, Match, Switch } from "solid-js"
import { Motion } from "solid-motionone"
import { SvgCross } from "./svgs"
import { ReaderInput, setReaderPageInfo } from "./signals"
import { animate } from "@motionone/dom";

export type ReaderContent = {
  title: string;
  level: string;
  content: any[]
}

const TextAndImages = (props: { data: ReaderContent }) => {

  return <>
    <Switch>
      <Match when={props.data.level === 'h1'}>
        <div class="font-[Noto_Serif] text-2xl text-slate-900 text-center font-bold mb-4">{props.data.title!}</div>
      </Match>
      <Match when={props.data.level === 'h2'}>
        <div class="font-[Noto_Serif] text-xl text-slate-900 text-center w-[90%] font-bold mb-3">{props.data.title!}</div>
      </Match>
      <Match when={props.data.level === 'h3'}>
        <div class="font-[Noto_Serif] text-md text-slate-900 text-center w-[80%] font-bold mb-2">{props.data.title!}</div>
      </Match>
    </Switch>
    <For each={props.data.content}>{(sub) =>
      <Switch>
        <Match when={sub.type === "text"}><div class="font-[Noto_Serif] px-6 py-3 text-sm max-w-90 _text-justify _hyphens-auto 
_indent-2.5">{sub.value}</div></Match>
        <Match when={sub.type === "image"}><div class="flex flex-col items-center w-[90%] border border-slate-700/30 rounded-lg p-1 "><img src={sub.url} alt={sub.alt} /><div class="text-xs text-center">{sub.alt}</div></div></Match>
      </Switch>
    }
    </For>
  </>
}

const Reader = (props: { value: ReaderInput | undefined }) => {
  const parse = (): ReaderContent[] | undefined => {
    const fs = props.value?.items.filter(el => ["h1", "h2", "h3"].includes(el.level) && el.title)
    console.log({ fs });

    if (!fs) return fs;

    const filterEmbeds = fs.flatMap(f => {

      if (f.title.indexOf('commentcancel') >= 0) return []
      if (f.title.indexOf('BBC is in multiple languages') >= 0) return []
      if (f.content.length === 0) return []

      f.content = f.content.filter(({ alt }: { alt: string }) => alt !== "guardian.org")

      const idx = f.content.findIndex((c: { type: string, value: string }) => {
        return (c.type === "text" && c.value.indexOf("embed this post,") >= 0)
      })
      if (idx === 0) return []
      if (idx >= 0) {
        return [{ ...f, content: f.content.splice(0, idx) }];
      }
      else return [f]
    })
    console.log({ filterEmbeds })
    return filterEmbeds;
  }

  let elRef!: HTMLDivElement;

  const hide = () => {
    if (!elRef) return;
    animate(
      elRef,
      {
        x: "120vw"
      },
      {
        duration: 0.5,
        easing: "ease-out"
      }
    );
  }

  const open = () => {
    window.open(
      props.value?.link,
      '_blank',
      'noopener,noreferrer')
  }
  const parsedData = () => parse() || []

  const noMainImageInContent = () => !parsedData().find((rc: ReaderContent) => rc.content.find(c => c.type === "image" && c.value === props.value?.backupImage))

  createEffect(() => {
    console.log({ none: noMainImageInContent(), parsed: parsedData() })
  })



  return (
    <Motion.div ref={elRef} exit={{ x: [0, "120vw"] }} animate={{ x: ["120vw", 0] }} class="absolute inset-0 flex flex-col z-50 items-center p-4 bg-white text-zinc-800 overflow-y-auto">
      <div class="w-8 h-8 z-50 absolute right-2 top-2 bg-white rounded-full border border-slate-700 p-1" onClick={() => { hide(); setTimeout(() => setReaderPageInfo(undefined), 600) }}>
        <SvgCross fill="#242424" />
      </div >
      <div class="flex text-xs pb-2 justify-end w-full relative gap-8 items-center">
        <div onClick={open}>Source: <a class={props.value?.link}>{props.value?.source}</a></div>
        <div class="w-6 h-6">
          <SvgCross fill="#242424" />
        </div>
      </div>
      {noMainImageInContent() ? <img class="w-[80%] mb-4 p-2 border border-slate-600 rounded-md" src={props.value?.backupImage} /> : null}

      <For each={parsedData()}>
        {rc => {
          return <>
            <TextAndImages data={rc} />
          </>
        }}
      </For>
    </Motion.div>
  )
}

export default Reader;

