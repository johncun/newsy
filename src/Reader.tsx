import { createEffect, For, Match, Switch } from "solid-js"
import { Motion } from "solid-motionone"
import { SvgCross } from "./svgs"
import { ReaderInput, setIsFetchingStory, setReaderPageInfo } from "./signals"
import { animate } from "@motionone/dom";
import { settings } from "@shared/settings";

export type ReaderContent = {
  title: string;
  level: string;
  content: any[]
}

const TextAndImages = (props: { data: ReaderContent }) => {
  const okImageSrc = (url: string, alt: string) => {
    if (url.endsWith('jpg') && !url.includes('rte.ie')) return false
    if (url.endsWith('jpeg')) return false
    if (url.endsWith('svg')) return false
    if (url.endsWith('png')) return false
    if (alt === "sky news logo") return false
    if (url.endsWith("width=56")) return false
    if (url.indexOf('rte.ie/djs') >= 0) return false
    return true


  }

  const okTitle = () => {
    const t = props.data.title
    if (t.toLowerCase().startsWith("more on ")) return false;
    if (t.toLowerCase().startsWith("related topics")) return false;
    if (t.toLowerCase().startsWith("more sky sites")) return false;
    return true
  }

  if (!okTitle()) return null

  const okText = (sub: any) => {
    if (sub.type === 'text' && sub.value.toLowerCase() === 'our apps') return false
    if (sub.type === 'text' && sub.value.includes('©')) return false
    if (sub.type === 'text' && sub.value.toLowerCase().includes('read more from')) return false
    if (sub.type === 'text' && sub.value.toLowerCase().includes('images courtesy')) return false
    return true
  }

  return <>
    <Switch>
      <Match when={props.data.level === 'h1'}>
        <div class="font-[Noto_Serif] font-normal text-[#7180a4] text-2xl text-center mb-4">{props.data.title!}</div>
      </Match>
      <Match when={props.data.level === 'h2'}>
        <div class="font-[Noto_Serif] font-normal border-t border-t-slate-500 text-[#7180a4] text-lg text-center w-[80%] mt-3">{props.data.title!}</div>
      </Match>
      <Match when={props.data.level === 'h3'}>
        <div class="font-[Noto_Serif] font-normal text-md text-[#7180a4] text-center w-[70%] mb-2">{props.data.title!}</div>
      </Match>
    </Switch>
    <For each={props.data.content}>{(sub) => {
      return okText(sub) &&
        <Switch>
          <Match when={sub.type === "text"}>
            <div class={`self-start font-[Nunito_Sans] first:border-t first:border-t-slate-500 ${sub.value.length < 30 ? 'font-bold' : 'font-light'} 
                px-6 py-3 text-md max-w-90 _text-justify _hyphens-auto _indent-2.5`}>{sub.value}</div>
          </Match>
          <Match when={sub.type === "image" && okImageSrc(sub.url, sub.alt)}>
            <div class="flex flex-col items-center w-full border border-slate-700/10 rounded-lg p-3">
              <img class="rounded-lg" src={sub.url} alt={sub.alt} />
              {settings.showFigureCaptions && <div class="text-xs text-center">{sub.alt}</div>}
            </div>
          </Match>
        </Switch>
    }}
    </For>
  </>
}

const Reader = (props: { value: ReaderInput | undefined }) => {

  if (!props.value) return <div>Oops!</div>
  const parse = (): ReaderContent[] | undefined => {
    let fs = parseFromLevel(1)
    if (fs) return fs;
    fs = parseFromLevel(2)
    if (fs) return fs;
    fs = parseFromLevel(3)
    if (fs) return fs;
    return undefined
  }

  const parseFromLevel = (startLevel: number): ReaderContent[] | undefined => {
    const tags = props.value?.source.toUpperCase().startsWith('BBC') ? [`h${startLevel}`] : [1, 2, 3].slice(startLevel - 1).map(l => 'h' + l)
    console.log(tags)
    const fs = props.value?.items.filter(el => tags.includes(el.level) && el.title)
    console.log({ fs });

    if (!fs) return fs;

    const filterEmbeds = fs.flatMap(f => {

      if (f.title.indexOf('Report: ') >= 0) return []
      if (f.title.indexOf('commentcancel') >= 0) return []
      if (f.title.indexOf('@') >= 0) return []
      if (f.title.indexOf('BBC is in multiple languages') >= 0) return []
      if (f.content.length === 0) return []

      f.content = f.content.filter(({ alt }: { alt: string }) => alt !== "guardian.org")

      const idx = f.content.findIndex((c: { type: string, value: string }) => {
        return (c.type === "text" && (c.value.indexOf("embed this post,") >= 0 || c.value.indexOf("More on this story") >= 0))
      })
      if (idx === 0) return []
      if (idx >= 0) {
        console.log('found embed...', { idx });
        return [{ ...f, content: f.content.slice(0, idx) }];
      }
      else return [f]
    })
    console.log({ filterEmbeds })

    const tidx = filterEmbeds.findIndex(({ title }) => {
      const lt = title.toLowerCase()
      return lt.includes("embed this post,") || lt.includes("more on this story") || lt.startsWith("more by ")
    })

    if (tidx >= 0) {
      console.log('found embed in titles...', { tidx });
      return filterEmbeds.slice(0, tidx);
    }
    else
      return filterEmbeds;
  }

  let elRef!: HTMLDivElement;

  const hide = () => {
    setIsFetchingStory(false)
    if (!elRef) return;
    animate(
      elRef,
      {
        x: ["-15vw", "120vw"]
      },
      {
        duration: 0.2,
      }
    );
  }

  const open = (link: string) => {
    console.log({ link })
    if (link) window.open(
      link,
      '_blank',
      'noopener,noreferrer')
  }
  const parsedData = () => parse() || []

  const noImageInContent = () => !parsedData().find((rc: ReaderContent) => rc.content.find(c => c.type === "image"))

  createEffect(() => {
    console.log({ none: noImageInContent(), parsed: parsedData() })
    if (parsedData().length === 0) {
      open(props?.value?.link || '')
      setTimeout(() => setReaderPageInfo(undefined), 2000)
    }
  })



  return (
    <Motion.div id="reader" ref={elRef} initial={{ x: "120vw" }} animate={{ x: ["120vw", "-15vw", 0], opacity: 1 }} transition={{ duration: 0.3, easing: "ease-in-out" }}
      class="absolute inset-0 flex flex-col z-50 items-center opacity-0 px-4 bg-linear-to-br from-white via-[#d8d5cc] to-[#f5f5e8] text-zinc-800 overflow-hidden" >
      <div class="w-8 h-8 absolute z-50 right-2 top-2 bg-white rounded-full border border-slate-700 p-1"
        onClick={() => { hide(); setTimeout(() => setReaderPageInfo(undefined), 600) }}>
        <SvgCross fill="#242424" />
      </div >
      <div class="absolute inset-x-0 top-0 h-10 text-xs w-full px-4 flex items-center ">
        <div onClick={() => { hide(); open(props?.value?.link || '') }}>Source: <a class={props.value?.link}>{props.value?.source}</a></div>
      </div>
      <div class="absolute inset-x-0 top-10 bottom-0 overflow-y-auto">
        <div class="flex flex-col items-center w-full p-4">
          {noImageInContent() ? <img class="w-[80%] mb-4 p-2 border border-slate-600 rounded-md" src={props.value?.backupImage} /> : null}
          <For each={parsedData()}>
            {rc => {
              return <>
                <TextAndImages data={rc} />
              </>
            }}
          </For>
        </div>
      </div>
    </Motion.div >
  )
}

export default Reader;

