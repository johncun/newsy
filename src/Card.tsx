import { onMount } from 'solid-js';
import { FeedItem } from './schemas/FeedItem';
import { animate } from 'animejs';
// @ts-ignore
// import { swipe, SwipeDirection } from "./swipe";

const Card = (props: { data: FeedItem, onSwipeLeft: (guid: string) => void, onSwipeRight: (guid: string) => void }) => {

  const dt = () => {
    const date = new Date(props.data.pubDate);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
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
          height: 0,
          paddingTop: 0,
          paddingBottom: 0,
          paddingLeft: 0,
          paddingRight: 0,
          complete: () => {
            setTimeout(() => props.onSwipeLeft(props.data.guid), 50)
          }
        })
      }
      if (dx < 0 && diff < 5) {
        console.log({ dx, x });
        animate(elRef, {
          translateX: [0, 500],
          duration: 200,
          easing: "easeInQuad",
          height: 0,
          paddingTop: 0,
          paddingBottom: 0,
          paddingLeft: 0,
          paddingRight: 0,
          complete: () => {
            setTimeout(() => props.onSwipeRight(props.data.guid), 50)
          }
        })

      }
    }

    el.addEventListener("scroll", on_scroll);
    el.addEventListener("touchend", on_touchend);
    return [on_scroll, on_touchend]

  }

  onMount(() => {
    const [onsc, onte] = swiper(elRef)
    elRef.scrollLeft = 0
    return () => {
      removeEventListener("scroll", onsc)
      removeEventListener("touchend", onte)
    }

  });

  return <div ref={elRef} class="swipe w-full">
    <div class="w-[20vw] flex items-center justify-center"><div class="flex items-center justify-center rounded-lg w-4/5 h-12 bg-green-700">Save</div></div>

    <div class="flex flex-col items-center group cursor-pointer mx-0 bg-slate-800 rounded-2xl p-2 min-h-60 relative overflow-hidden"
      onClick={() => window.open(props.data.link, "_blank")}
    >
      <div class="absolute inset-0 p-0">
        {props.data.image ? (
          <img
            src={props.data.image /*|| "/placeholder.svg"*/}
            alt={props.data.title}
            class="absolute inset-0 w-full h-full object-cover"
            onError={(e) => {
              const element = e.target as HTMLImageElement
              element.src = "/the-guardian-logo.jpg"
              element.style.opacity = "20%"
              // element.style.display = "none"
              // const container = element.parentElement
              // if (container) {
              //   container.style.background = "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
              // }
            }}
          />
        ) : (
          // <div class="absolute inset-0 bg-linear-to-br from-indigo-500 via-purple-500 to-pink-500" />
          <img src={"/the-guardian-logo.jpg"} alt="guardian" class="absolute inset-0 w-full h-full object " />
        )}
        <div class="absolute top-2 left-2 bg-black/30 text-white text-xs px-1 py-1 rounded-md">{props.data.source}</div>
        <div class="absolute top-2 right-2 bg-black/30 text-white text-xs px-1 py-1 rounded-md">{dt()}</div>
        <div class="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors duration-200"></div>
        <div class="absolute font-extrabold inset-x-0 mx-4 bottom-6">{props.data.title}</div>
      </div>
    </div>
    <div class="w-[20vw] flex items-center justify-center"><div class="flex items-center justify-center rounded-lg w-4/5 h-12 bg-red-700">Delete</div></div>
  </div>
};

export default Card;
