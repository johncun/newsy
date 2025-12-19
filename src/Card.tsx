import { mode, selectedGuid, setMenuGuid, setSelectedGuid } from './signals';
import { Accessor, createSignal, onMount } from 'solid-js';
import { FeedItem } from '@shared/feed-types';
import { getAllByState, memData } from './db';
import { SvgAdd, SvgTrash } from './svgs';
import { Motion } from 'solid-motionone';
import { animate } from 'animejs';

export type Action = 'Kill' | 'Save' | 'Delete' | '';

const Card = (props: {
  data: FeedItem;
  index: number;
  onSwipeLeft: (guid: string, action: Action) => void;
  onSwipeRight: (guid: string, action: Action) => void;
}) => {
  const dt = () => {
    const date = new Date(props.data.pubDate);
    return (
      date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }) +
      ' ' +
      date.toLocaleTimeString(undefined, {
        hour12: true,
        hour: '2-digit',
        minute: '2-digit',
      })
    );
  };
  let elRef!: HTMLDivElement;

  const getNextGuid = getAllByState(mode())(memData())[props.index]?.guid || '';

  const leftText = (): Action => {
    return (
      (
        { live: 'Save', saved: '', deleted: 'Save' } as {
          [key: string]: Action;
        }
      )[mode()] || ''
    );
  };
  const rightText = (): Action => {
    return (
      (
        { live: 'Delete', saved: 'Delete', deleted: 'Kill' } as {
          [key: string]: Action;
        }
      )[mode()] || ''
    );
  };

  const [isDying, setIsDying] = createSignal(false);

  const swipeLeft = () =>
    animate(elRef, {
      translateX: [0, -500],
      duration: 200,
      ease: 'easeInQuad',
      complete: () => {
        setIsDying(true);
        setTimeout(() => {
          setSelectedGuid(getNextGuid);
          props.onSwipeLeft(props.data.guid, rightText());
        }, 200);
      },
    });
  const swipeRight = () =>
    animate(elRef, {
      translateX: [0, 500],
      duration: 200,
      easing: 'easeInQuad',
      complete: () => {
        setIsDying(true);
        setTimeout(() => {
          setSelectedGuid(getNextGuid);
          props.onSwipeRight(props.data.guid, leftText());
        }, 200);
      },
    });

  const swiper = (el: HTMLDivElement) => {
    let dx = 0;
    let x = 0;

    function on_scroll(e: any) {
      const scroll_div = e.currentTarget;
      const scroll_center = scroll_div.scrollWidth / 2;
      const viewport_center = scroll_div.clientWidth / 2;
      const current = scroll_div.scrollLeft + viewport_center;
      dx = current - scroll_center;
      x = (scroll_div.scrollWidth - scroll_div.clientWidth) / 2;
    }

    function on_touchend(_e: any) {
      console.log('ontouchend');
      const diff = Math.abs(Math.abs(dx) - x);

      if (dx > 0 && diff < 5) {
        swipeLeft();
      }
      if (dx < 0 && diff < 5) {
        swipeRight();
      }
    }

    el.addEventListener('scroll', on_scroll);
    el.addEventListener('touchend', on_touchend);
    return [on_scroll, on_touchend];
  };

  let onsc: (e: any) => void, onte: (e: any) => void;

  onMount(() => {
    [onsc, onte] = swiper(elRef);
    elRef.scrollLeft = 0;
    return () => {
      removeEventListener('scroll', onsc);
      removeEventListener('touchend', onte);
    };
  });

  const bgx = (s: string, bg: string) => (!s ? 'bg-transparent' : bg);

  const isSelected = () => selectedGuid() === props.data.guid;

  const menuFor = (guid: string) => {
    setMenuGuid(guid);
  };

  return isDying() ? (
    <div>Boom</div>
  ) : (
    <div
      ref={elRef}
      class={`swipe w-full ${
        selectedGuid() === props.data.guid
          ? 'drop-shadow-[0px_3px_3px_rgba(0,0,0,0.25)] '
          : ''
      }`}
    >
      <div class="w-[20vw] flex items-center justify-center">
        {' '}
        <div
          class={`flex items-center justify-center rounded-lg w-4/5 h-12 ${bgx(leftText(), 'bg-green-700')}`}
        >
          {leftText()}
        </div>
      </div>

      <div
        class="flex flex-col items-center group cursor-pointer mx-0 bg-slate-800 rounded-2xl p-2 min-h-60 relative overflow-hidden"
        onClick={() => setSelectedGuid(props.data.guid)}
      >
        <div class="absolute inset-0 p-0">
          <ImageFor data={props.data} isSelected={isSelected} />
          {isSelected() ? (
            <Motion.div
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.7 }}
              class="absolute inset-0 bg-black/20"
            />
          ) : (
            <div class="absolute inset-0 bg-black/20" />
          )}
          {!isSelected() ? (
            <div class="absolute top-2 left-2 right-2 inset-shadow-gray-1000 flex items-center justify-between">
              <div class="bg-black/30 text-white/70 text-xs z-10 px-1 py-1 rounded-md w-auto">
                {props.data.source}
              </div>
              <div class="bg-black/50 text-white/70 text-xs z-10 px-1 py-1 rounded-md">
                {dt()}
              </div>
            </div>
          ) : null}
          <div
            id="title"
            class={`absolute font-extrabold text-shadow-black/30 text-xl font-stretch-80% text-shadow-md
        inset-x-0 mx-4 top-12 bottom-2 items-center justify-end flex flex-col gap-1 rounded-xl p-2 ${isSelected() ? 'bg-black/0' : ''}`}
          >
            <div class="line-clamp-4">{props.data.title}</div>
            <p class="text-sm font-normal text-zinc-100/70 overflow-y-hidden line-clamp-2 text-left w-full">
              {props.data.description}
            </p>
          </div>
          <div
            class={`absolute top-1 h-10 z-30 inset-x-2 flex ${isSelected() ? 'bg-black/40' : ''} items-center rounded-2xl justify-between`}
          >
            <Motion.div
              press={{ scale: [1, 1.3, 1] }}
              class="p-1 w-9 h-9 rounded-full bg-green-400/80 flex items-center justify-center text-black"
              onClick={swipeRight}
              style={{ visibility: isSelected() ? 'visible' : 'hidden' }}
            >
              <SvgAdd fill="white" />
            </Motion.div>
            <div class="flex gap-4">
              <Motion.div
                press={{ scale: [1, 1.3, 1] }}
                class="text-3xl w-8 h-8 rounded-full bg-amber-200/80 flex items-center justify-center text-black"
                onClick={() => menuFor(props.data.guid)}
                style={{ visibility: isSelected() ? 'visible' : 'hidden' }}
              >
                <svg viewBox="0 0 24 24" class="w-6">
                  <g
                    stroke="none"
                    stroke-width="3"
                    fill="none"
                    fill-rule="evenodd"
                  >
                    <g>
                      <rect
                        fill-rule="nonzero"
                        x="0"
                        y="0"
                        width="24"
                        height="24"
                      />
                      <line
                        x1="5"
                        y1="7"
                        x2="19"
                        y2="7"
                        id="Path"
                        stroke="#0C0310"
                        stroke-linecap="round"
                      />
                      <line
                        x1="5"
                        y1="17"
                        x2="19"
                        y2="17"
                        id="Path"
                        stroke="#0C0310"
                        stroke-linecap="round"
                      />
                      <line
                        x1="5"
                        y1="12"
                        x2="19"
                        y2="12"
                        id="Path"
                        stroke="#0C0310"
                        stroke-linecap="round"
                      />
                    </g>
                  </g>
                </svg>
              </Motion.div>

              <Motion.div
                press={{ scale: [1, 1.3, 1] }}
                class="w-8 h-8 rounded-full bg-amber-400/80 flex items-center justify-center text-black"
                onClick={() =>
                  window.open(props.data.link, '_blank', 'noopener,noreferrer')
                }
                style={{ visibility: isSelected() ? 'visible' : 'hidden' }}
              >
                ➜
              </Motion.div>
            </div>
            <Motion.div
              press={{ scale: [1, 1.3, 1] }}
              class="p-1 w-8 h-8 rounded-full bg-red-800/80 flex items-center justify-center text-black"
              onClick={swipeLeft}
              style={{ visibility: isSelected() ? 'visible' : 'hidden' }}
            >
              <SvgTrash stroke="white" fill="" />
            </Motion.div>
          </div>
        </div>
      </div>
      <div class="w-[20vw] flex items-center justify-center">
        <div
          class={`flex items-center justify-center rounded-lg w-4/5 h-12 ${bgx(rightText(), 'bg-red-700')}`}
        >
          {rightText()}
        </div>
      </div>
    </div>
  );
};

const ImageFor = (props: {
  data: FeedItem;
  isSelected: Accessor<boolean>;
  blur?: boolean;
}) => {
  const gradients = [
    'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900',
    'bg-gradient-to-bl from-zinc-950 via-zinc-900 to-zinc-950',
    'bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-900',
    'bg-gradient-to-bl from-slate-900 via-indigo-950 to-zinc-900',
    'bg-gradient-to-br from-emerald-950 via-teal-950 to-slate-900',
    'bg-gradient-to-bl from-rose-950 via-slate-900 to-zinc-900',
    'bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900',
    'bg-gradient-to-bl from-blue-950 via-slate-900 to-black',
    'bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900',
    'bg-gradient-to-bl from-zinc-900 via-stone-900 to-zinc-950',
    'bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900',
    'bg-gradient-to-bl from-cyan-950 via-slate-900 to-indigo-950',
    'bg-gradient-to-br from-gray-900 via-gray-800 to-black',
    'bg-gradient-to-bl from-violet-950 via-slate-900 to-slate-950',
    'bg-gradient-to-br from-fuchsia-950 via-slate-900 to-zinc-900',
    'bg-gradient-to-bl from-teal-950 via-emerald-950 to-neutral-900',
    'bg-gradient-to-br from-slate-900 via-slate-800 to-zinc-900',
    'bg-gradient-to-bl from-indigo-900 via-slate-900 to-black',
    'bg-gradient-to-br from-zinc-950 via-neutral-900 to-stone-950',
    'bg-gradient-to-bl from-slate-800 via-slate-900 to-slate-950',
  ];

  function getDeterministicGradient(input: string): string {
    let hash = 5381;

    for (let i = 0; i < input.length; i++) {
      hash = (hash << 5) + hash + input.charCodeAt(i);
    }

    const index = (hash >>> 0) % gradients.length;

    return gradients[index];
  }

  // mask-[linear-gradient(to_bottom,red_0%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,red_0%,transparent_100%)]`}

  return props.data.image && !props.data.source.startsWith('Sydney') ? (
    <img
      src={props.data.image /*|| "/placeholder.svg"*/}
      alt={props.data.title}
      class={`absolute inset-0 w-full h-full object-cover ${!props.isSelected() && props.blur ? 'blur-xs' : ''}`}
      onError={(e) => {
        const element = e.target as HTMLImageElement;
        element.src = '/the-guardian-logo.jpg';
        element.style.opacity = '20%';
        element.style.display = 'none';
        const container = element.parentElement;
        // if (container)
        // container.style.background = "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      }}
    ></img>
  ) : (
    <div
      class={`absolute inset-0 ${getDeterministicGradient(props.data.guid)}`}
    />
  );
};

export default Card;
