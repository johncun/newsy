import { createEffect, For, Match, Switch } from "solid-js"
import { Motion } from "solid-motionone"
import { SvgCross } from "./svgs"
import { ReaderInput, setIsFetchingStory, setReaderPageInfo } from "./signals"
import { animate } from "@motionone/dom";
import { settings } from "./settings-utils";
import { CachedImage } from "./CachedImage";

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
  const fontInfo = () => settings.fauxPrint ? 'subline font-[Georgia] font-normal' : 'font-[Noto_Serif] font-normal'
  const fontInfoBold = () => settings.fauxPrint ? 'subline font-[Georgia] font-bold' : 'font-[Noto_Serif] font-bold'
  return <>
    <Switch>
      <Match when={props.data.level === 'h1'}>
        <div class={`${fontInfoBold()} text-[#7180a4] text-2xl text-center mb-4`}>{props.data.title!}</div>
      </Match>
      <Match when={props.data.level === 'h2'}>
        <div class={`${fontInfoBold()} leading-4.5 border-t-slate-500 text-[#7180a4] text-lg text-center w-[80%] mt-3`}>{props.data.title!}</div>
      </Match>
      <Match when={props.data.level === 'h3'}>
        <div class={`${fontInfo()} text-md text-[#7180a4] text-center w-[70%] mb-2`}>{props.data.title!}</div>
      </Match>
    </Switch >
    <For each={props.data.content}>{(sub) => {
      return okText(sub) &&
        <Switch>
          <Match when={sub.type === "text"}>
            <div class={`${settings.fauxPrint ? 'subline' : ''} self-start font-[${settings.fauxPrint ? 'Georgia' : 'Noto_Serif'}] 
              first:border-t first:border-t-slate-500 ${sub.value.length < 30 ? '_font-bold' : '_font-light'} 
              px-6 py-3 leading-4.5 text-md max-w-90 text-justify hyphens-auto ${settings.fauxPrint ? 'indent-2' : ''}`}>{sub.value}</div>
          </Match>
          <Match when={sub.type === "image" && okImageSrc(sub.url, sub.alt)}>
            <div class="flex flex-col items-center w-full border border-slate-700/10 rounded-lg p-3">
              <div class={`${settings.fauxImage ? 'halftone' : ''}`} >
                <CachedImage class="rounded-lg" src={sub.url} alt={sub.alt} /></div>
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
  const filterEmbedInItemList = (fs: any[]) => fs.flatMap(f => {

    if (f.title.indexOf('Report: ') >= 0) return []
    if (f.title.indexOf('commentcancel') >= 0) return []
    if (f.title.indexOf('@') >= 0) return []
    if (f.title.indexOf('BBC is in multiple languages') >= 0) return []
    if (f.content.length === 0) return []

    f.content = f.content.filter(({ alt }: { alt: string }) => alt !== "guardian.org")

    const idx = f.content.findIndex((c: { type: string, value: string }) => {
      return (c.type === "text" &&
        (c.value.indexOf("embed this post,") >= 0
          || c.value.indexOf("More on this story") >= 0
          || c.value.indexOf("You must confirm your public display name") >= 0
          || c.value.indexOf("Follow TechRadar") >= 0))
    })
    if (idx === 0) return []
    if (idx >= 0) {
      console.log('found embed...', { idx });
      return [{ ...f, content: f.content.slice(0, idx) }];
    }
    else return [f]
  })

  const truncateAfterTitles = (fs: any[], ops: [string, string][]) => {
    const tidx = fs.findIndex(({ title }) => {
      const lt = title.toLowerCase()
      return ops.find(([operation, text]) => lt[operation](text))
    })

    if (tidx >= 0) {
      console.log('found embed in titles...', { tidx });
      return fs.slice(0, tidx);
    }
    else
      return fs;
  }


  const parseFromLevel = (startLevel: number): ReaderContent[] | undefined => {
    const tags = props.value?.source.toUpperCase().startsWith('BBC') ? [`h${startLevel}`] : [1, 2, 3].slice(startLevel - 1).map(l => 'h' + l)
    console.log(tags)
    const fs = props.value?.items.filter(el => tags.includes(el.level) && el.title)
    console.log({ fs });

    if (!fs) return fs;

    const filterEmbeds = filterEmbedInItemList(fs)
    console.log({ filterEmbeds })

    const truncatedTitles = truncateAfterTitles(filterEmbeds, [
      ['includes', 'embed this post,'],
      ['includes', 'more on this story'],
      ['startsWith', 'more by']])

    return truncatedTitles
  }

  let elRef!: HTMLDivElement;

  const hide = () => {
    setIsFetchingStory(false)
    return
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
      hide()
      const link = props.value?.link
      if (link) open(link)
      setReaderPageInfo(undefined)
    }
  })



  return (
    <Motion.div id="reader" ref={elRef} initial={{ x: "120vw" }} animate={{ x: ["120vw", "-15vw", 0], opacity: 1 }} transition={{ duration: 0.3, easing: "ease-in-out" }}
      class={`absolute inset-0 flex flex-col z-50 items-center opacity-0 px-4 text-zinc-800 overflow-hidden
      ${settings.fauxPrint ? 'newspaper-page' : ''}`} >
      <div class="w-8 h-8 absolute z-50 right-2 top-2 bg-slate-300 rounded-full border border-slate-700 p-1"
        onClick={() => { hide(); setTimeout(() => setReaderPageInfo(undefined), 50) }}>
        <SvgCross fill="#242424" />
      </div >
      <div class="absolute left-0 right-0 pr-16 top-0 h-12 bg-slate-900 flex items-center justify-between text-white">
        <div class="pl-6 font-bold text-center shadow-amber-50 shadow-2xl text-xl">Reader</div>
        <div class="text-sky-300 flex items-center gap-2" onClick={() => { hide(); open(props?.value?.link || '') }}><div class="text-sm text-slate-400">Source: </div>{props.value?.source}</div>
      </div>
      <div class="absolute inset-x-0 top-12 bottom-0 overflow-y-auto">
        <div class="relative flex flex-col items-center w-full p-4">
          {noImageInContent() ? <CachedImage class="w-[80%] mb-4 p-2 border border-slate-600 rounded-md" src={props.value?.backupImage} /> : null}
          <For each={parsedData()}>
            {rc => {
              return <>
                <TextAndImages data={rc} />
              </>
            }}
          </For>
          {settings.fauxPrint ? <div id="paper" class="paperOverlay absolute inset-0" /> : <div class="absolute inset-0 bg-linear-to-br from-orange-100 via-[#d8d5cc] to-[#f5f5e8] -z-50"></div>}
        </div>
      </div>
      <svg style="display: none;">
        <filter id="ink-distortion">
          <feTurbulence type="fractalNoise" baseFrequency="0.5" numOctaves="3" result="noise" />
          <feGaussianBlur stdDeviation="0.1" result="blurred" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.5" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="2" intercept="-0.2" />
          </feComponentTransfer>
        </filter>
      </svg>


      <style>{`
      --paper: #e8e4d9;
      --ink: #2d2b28;
      .newspaper-page {
        background-color: var(--paper);
        width: 600px;
        padding: 40px;
        position: relative;
        box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        overflow: hidden;
        }

      .newspaper-page::before {
        content: "";
        position: absolute;
        top: 0; left: 0; width: 100%; height: 100%;
        opacity: 0.25;
        pointer-events: none;
        background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
      }

      .headline {
        font-family: "Old Standard TT", "Georgia", serif;
        font-size: 4rem;
        font-weight: 900;
        color: var(--ink);
        text-transform: uppercase;
        margin: 0;
        line-height: 0.9;
        letter-spacing: -2px;
        
        /* Apply the ink distortion filter */
        filter: url(#ink-distortion);
        
        /* Makes ink look absorbed into the paper */
        mix-blend-mode: multiply;
      }

      .subline {
        color: var(--ink);
        filter: url(#ink-distortion);
      }


      `}</style>
    </Motion.div >
  )
}

export default Reader;

