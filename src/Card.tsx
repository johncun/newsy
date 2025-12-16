import { createSignal, onMount } from 'solid-js';
import { FeedItem } from './schemas/FeedItem';
import { animate } from 'animejs';
import { mode, selectedGuid, setMenuGuid, setSelectedGuid } from './signals';
import { Motion } from 'solid-motionone';
// @ts-ignore
// import { swipe, SwipeDirection } from "./swipe";

export type Action = 'Kill' | 'Save' | 'Delete' | '';

const Card = (props: { data: FeedItem, index: number, onSwipeLeft: (guid: string, action: Action) => void, onSwipeRight: (guid: string, action: Action) => void }) => {

  const dt = () => {
    const date = new Date(props.data.pubDate);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }) + ' ' + date.toLocaleTimeString(undefined, { hour12: true, hour: '2-digit', minute: '2-digit' });
  }
  let elRef!: HTMLDivElement

  // const handleSwipe = (direction: SwipeDirection, el: HTMLElement) => {
  //   elRef = el
  //   console.log({ el, elRef })
  //   if (direction === "left") {
  //     deleteStory()
  //     // setSelectedDay(addDays(selectedDay(), 1));
  //   } else if (direction === "right") {
  //     // sel();
  //     saveStory()
  //   }
  // }
  // const deleteStory = () => {
  //   console.log("delete story")
  // }
  // const saveStory = () => {
  //   console.log("save story")
  //
  // }

  const leftText = (): Action => { return ((({ 'live': 'Save', 'saved': '', 'deleted': 'Save' } as { [key: string]: Action })[mode()]) || '') }
  const rightText = (): Action => { return ((({ 'live': 'Delete', 'saved': 'Delete', 'deleted': 'Kill' } as { [key: string]: Action })[mode()]) || '') }

  const [isDying, setIsDying] = createSignal(false)

  const swiper = (el: HTMLDivElement) => {

    // document.getElementById("swipe");
    let dx = 0
    let x = 0

    function on_scroll(e: any) {
      const scroll_div = e.currentTarget;
      const scroll_center = scroll_div.scrollWidth / 2;
      const viewport_center = scroll_div.clientWidth / 2;
      const current = scroll_div.scrollLeft + viewport_center;
      dx = current - scroll_center;
      x = (scroll_div.scrollWidth - scroll_div.clientWidth) / 2;
      {/* console.log({ dx, sw: scroll_div.scrollWidth, cw: scroll_div.clientWidth, x }); */ }
    }

    function on_touchend(_e: any) {
      console.log('ontouchend');
      const diff = Math.abs(Math.abs(dx) - x);


      if (dx > 0 && diff < 5) {
        console.log({ dx, x });
        animate(elRef, {
          translateX: [0, -500],
          duration: 200,
          ease: "easeInQuad",
          complete: () => {
            setIsDying(true)
            setTimeout(() => props.onSwipeLeft(props.data.guid, rightText()), 200)
          }
        })
      }
      if (dx < 0 && diff < 5) {
        {/* console.log({ dx, x }); */ }
        animate(elRef, {
          translateX: [0, 500],
          duration: 200,
          easing: "easeInQuad",
          complete: () => {
            setIsDying(true)
            setTimeout(() => props.onSwipeRight(props.data.guid, leftText()), 200)
          }
        })

      }
    }

    el.addEventListener("scroll", on_scroll);
    el.addEventListener("touchend", on_touchend);
    return [on_scroll, on_touchend]

  }

  let onsc: (e: any) => void, onte: (e: any) => void;

  onMount(() => {
    [onsc, onte] = swiper(elRef)
    elRef.scrollLeft = 0
    return () => {
      removeEventListener("scroll", onsc)
      removeEventListener("touchend", onte)
    }

  });


  const bgx = (s: string, bg: string) => !s ? 'bg-transparent' : bg;

  const isSelected = () => selectedGuid() === props.data.guid

  const menuFor = (guid: string) => { setMenuGuid(guid) }

  return isDying() ?
    <div>Boom</div> :
    <div ref={elRef} class={`swipe w-full ${selectedGuid() === props.data.guid ? 'drop-shadow-[0px_3px_3px_rgba(0,0,0,0.25)] '
      : ''}`}>
      < div class="w-[20vw] flex items-center justify-center" > <div class={`flex items-center justify-center rounded-lg w-4/5 h-12 ${bgx(leftText(), 'bg-green-700')}`}>{leftText()}</div></div >

      <div class="flex flex-col items-center group cursor-pointer mx-0 bg-slate-800 rounded-2xl p-2 min-h-60 relative overflow-hidden"
        onClick={() => setSelectedGuid(props.data.guid)}
      >
        <div class="absolute inset-0 p-0">
          {props.data.image ? (
            <img
              src={props.data.image /*|| "/placeholder.svg"*/}
              alt={props.data.title}
              class={`absolute inset-0 w-full h-full object-cover ${!isSelected() ? 'blur-xs' : ''}`}
              onError={(e) => {
                const element = e.target as HTMLImageElement
                element.src = "/the-guardian-logo.jpg"
                element.style.opacity = "20%"
                element.style.display = "none"
                const container = element.parentElement
                if (container)
                  container.style.background = "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
              }}></img>)
            : (
              // <div class="absolute inset-0 bg-linear-to-br from-indigo-500 via-purple-500 to-pink-500" />
              <img src={"/the-guardian-logo.jpg"} alt="guardian" class="absolute inset-0 w-full h-full object " />
            )}
          <div class="absolute top-2 left-2 bg-black/30 text-white/70 text-xs z-10 px-1 py-1 rounded-md">{props.data.source}</div>
          <div class="absolute top-2 right-2 bg-black/30 text-white text-xs z-10 px-1 py-1 rounded-md">{dt()}</div>
          <div class="absolute top-10 left-2 bg-black/30 text-white text-xs z-10 px-1 py-1 rounded-md">{props.index}</div>
          <div class="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors duration-200"></div>
          <div id='title' class="absolute font-extrabold text-shadow-black/30 text-xl font-stretch-80% text-shadow-md
        inset-x-0 mx-4 top-12 bottom-6 flex items-center"><div>{props.data.title}</div></div>
          <Motion.div
            press={{ scale: [1, 1.3, 1] }}
            class="absolute text-3xl
            left-2 bottom-2 w-8 h-8 rounded-full bg-amber-200/40 flex items-center justify-center text-black"
            onClick={() => menuFor(props.data.guid)}
            style={{ visibility: isSelected() ? 'visible' : 'hidden' }}>
            <svg viewBox="0 0 24 24" class="w-6">
              <g stroke="none" stroke-width="3" fill="none" fill-rule="evenodd">
                <g>
                  <rect fill-rule="nonzero" x="0" y="0" width="24" height="24" />
                  <line x1="5" y1="7" x2="19" y2="7" id="Path" stroke="#0C0310" stroke-linecap="round" />
                  <line x1="5" y1="17" x2="19" y2="17" id="Path" stroke="#0C0310" stroke-linecap="round" />
                  <line x1="5" y1="12" x2="19" y2="12" id="Path" stroke="#0C0310" stroke-linecap="round" />
                </g>
              </g>
            </svg>
          </Motion.div>

          <Motion.div
            press={{ scale: [1, 1.3, 1] }}
            class="absolute right-2 bottom-2 w-8 h-8 rounded-full bg-amber-200/40 flex items-center justify-center text-black"
            onClick={() => window.open(props.data.link, '_blank', 'noopener,noreferrer')}
            style={{ visibility: isSelected() ? 'visible' : 'hidden' }}
          >➜</Motion.div>
        </div>
      </div>
      <div class="w-[20vw] flex items-center justify-center"><div class={`flex items-center justify-center rounded-lg w-4/5 h-12 ${bgx(rightText(), 'bg-red-700')}`}>{rightText()}</div></div>
    </div >
};

export default Card;
