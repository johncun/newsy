import { createEffect, For, Match, Switch } from "solid-js"
import { Motion } from "solid-motionone"
import { SvgCross } from "./svgs"
import { ReaderContent, ReaderInput, ReaderItem, setReaderPageInfo } from "./signals"
import { animate } from "@motionone/dom";

const TextAndImages = (props: { data: ReaderItem }) => {

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
    <For each={props.data.content}>{(sub: ReaderContent) =>
      <Switch>
        <Match when={sub.type === "text"}><div class="font-[Noto_Serif] px-6 py-3 text-sm max-w-90 _text-justify _hyphens-auto 
_indent-2.5">{sub.type === "text" && sub.value}</div></Match>
        <Match when={sub.type === "image"}>
          {sub.type === 'image' &&
            <div class="flex flex-col items-center w-[90%] border border-slate-700/30 rounded-lg p-1 ">
              <img src={sub.url} alt={sub.alt} />
              <div class="text-xs text-center">{sub.alt}</div>
            </div>}
        </Match>
      </Switch>
    }
    </For>
  </>
}

const parseFromLevel = (input: ReaderInput, startLevel: number): ReaderItem[] | undefined => {
  let tags = input.source.toUpperCase().startsWith('BBC') ? [`h${startLevel}`] : [1, 2, 3].slice(startLevel - 1).map(l => 'h' + l)
  console.log({ tags })
  const fs = input.items.filter(el => tags.includes(el.level) && el.title)
  console.log({ fs });

  if (!fs) return fs;

  const filterEmbeds = fs.flatMap(ri => {

    if (ri.title.indexOf('commentcancel') >= 0) return []
    if (ri.title.indexOf('BBC is in multiple languages') >= 0) return []
    if (ri.title.indexOf('More Sky Sites') >= 0) return []
    if (ri.content.length === 0) return []

    ri.content = ri.content.filter((rc: ReaderContent) => !(rc.type === 'image' && rc.alt === "guardian.org"))
    console.log({ ri })
    let itemIdx = ri.content.findIndex((rc: ReaderContent) => {
      return (rc.type === "text" && (
        rc.value.indexOf("embed this post,") >= 0 ||
        rc.value.indexOf("Courtesy of Getty") >= 0 ||
        rc.value.indexOf("Follow our channel") >= 0 ||
        rc.value.indexOf("More on this story") >= 0))
    })
    if (itemIdx >= 0) {
      console.log('truncate items')

      return [{ ...ri, content: ri.content.splice(0, itemIdx) }];
    }
    else return [ri]
  })

  console.log({ filterEmbeds })
  return filterEmbeds;
}

const parse = (input: ReaderInput): ReaderItem[] | undefined => {
  console.log({ input })
  console.log('parsing level 1')
  let fs = parseFromLevel(input, 1)
  if (fs) return fs;
  console.log('parsing level 2')
  fs = parseFromLevel(input, 2)
  if (fs) return fs;
  console.log('parsing level 3')
  fs = parseFromLevel(input, 3)
  if (fs) return fs;
  return undefined
}



const Reader = (props: { input: ReaderInput }) => {

  if (!props.input) return <div>Oops!</div>

  let elRef!: HTMLDivElement;

  const hide = () => {
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
  const parsedData = () => parse(props.input) || []

  const noImageInContent = () => !parsedData().find((rc: ReaderItem) => rc.content.find(c => c.type === "image"))

  createEffect(() => {
    console.log({ none: noImageInContent(), parsed: parsedData() })
    if (parsedData().length === 0) {
      open(props.input.link || '')
      setTimeout(() => setReaderPageInfo(undefined), 2000)
    }
  })



  return (
    <Motion.div ref={elRef} initial={{ x: "120vw" }} animate={{ x: ["120vw", "-15vw", 0], opacity: 1 }} transition={{ duration: 0.8, easing: "ease-in-out" }} class="absolute inset-0 flex flex-col z-50 items-center opacity-0 p-4 bg-white text-zinc-800 overflow-hidden" >
      <div class="w-8 h-8 z-50 absolute right-2 top-2 bg-white rounded-full border border-slate-700 p-1" onClick={() => { hide(); setTimeout(() => setReaderPageInfo(undefined), 600) }}>
        <SvgCross fill="#242424" />
      </div >
      <div class="absolute inset-x-0 top-0 h-10 text-xs w-full px-4 flex items-center ">
        <div onClick={() => open(props.input.link || '')}>Source: <a class={props.input.link}>{props.input.source}</a></div>
      </div>
      <div class="absolute inset-x-0 top-10 bottom-0 overflow-y-auto">
        <div class="flex flex-col items-center w-full p-4">
          {noImageInContent() ? <img class="w-[80%] mb-4 p-2 border border-slate-600 rounded-md" src={props.input.backupImage} /> : null}
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

