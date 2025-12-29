import { createEffect, createSignal, Match, onMount, Switch } from 'solid-js'
import { FeedItem } from '@shared/feed-types'
import { animate } from 'animejs'

import { mode, selectedGuid, } from './signals'
import CardStyleLarge from './CardStyleLarge'
import CardStyleThin from './CardStyleThin'
import { hashToBoolean } from './common'

export type Action = 'Kill' | 'Save' | 'Delete' | ''

const Card = (props: {
  data: FeedItem
  index: number
  onSwipeLeft: (guid: string, action: Action) => void
  onSwipeRight: (guid: string, action: Action) => void
}) => {
  let elRef!: HTMLDivElement

  {/* const getNextGuid = getAllByState(mode())(memData())[props.index]?.guid || '' */ }

  const leftText = (): Action => {
    return (
      (
        { live: 'Save', saved: '', deleted: 'Save' } as {
          [key: string]: Action
        }
      )[mode()] || ''
    )
  }
  const rightText = (): Action => {
    return (
      (
        { live: 'Delete', saved: 'Delete', deleted: 'Kill' } as {
          [key: string]: Action
        }
      )[mode()] || ''
    )
  }

  const [isDying, setIsDying] = createSignal(false)

  const swipeLeft = () =>
    animate(elRef, {
      translateX: [0, -500],
      duration: 200,
      ease: 'easeInQuad',
      complete: () => {
        setIsDying(true)
        setTimeout(() => {
          {/* setSelectedGuid(getNextGuid) */ }
          props.onSwipeLeft(props.data.guid, rightText())
        }, 200)
      },
    })
  const swipeRight = () =>
    animate(elRef, {
      translateX: [0, 500],
      duration: 200,
      easing: 'easeInQuad',
      complete: () => {
        setIsDying(true)
        setTimeout(() => {

          props.onSwipeRight(props.data.guid, leftText())
        }, 200)
      },
    })

  const swiper = (el: HTMLDivElement) => {
    let dx = 0
    let x = 0

    function on_scroll(e: any) {
      const scroll_div = e.currentTarget
      const scroll_center = scroll_div.scrollWidth / 2
      const viewport_center = scroll_div.clientWidth / 2
      const current = scroll_div.scrollLeft + viewport_center
      dx = current - scroll_center
      x = (scroll_div.scrollWidth - scroll_div.clientWidth) / 2
    }

    function on_touchend(_e: any) {
      const diff = Math.abs(Math.abs(dx) - x)

      if (dx >= 0 && diff < 5) {
        swipeLeft()
      }
      if (dx <= 0 && diff < 5) {
        swipeRight()
      }
    }

    el.addEventListener('scroll', on_scroll)
    el.addEventListener('touchend', on_touchend)
    return [on_scroll, on_touchend]
  }


  onMount(() => {
    const [onsc, onte] = swiper(elRef)
    elRef.scrollLeft = 0
    return () => {
      removeEventListener('scroll', onsc)
      removeEventListener('touchend', onte)
    }
  })

  const bgx = (s: string, bg: string) => (!s ? 'bg-transparent' : bg)

  const isSelected = () => selectedGuid() === props.data.guid

  const useThin = () => hashToBoolean(props.data.guid)

  createEffect(() => {
    if (isSelected() && elRef) {
      elRef.scrollIntoView({
        behavior: "smooth", // "auto" for instant jump
        block: "nearest",   // "start", "center", "end", or "nearest"
        inline: "nearest"
      })
    }
  });

  return isDying() ?
    <div>Boom</div>
    : <div
      ref={elRef}
      class={`swipe w-full bg-[#242424]`}>
      <div class="w-[20vw] flex items-center justify-center">
        <div
          class={`flex items-center justify-center rounded-lg w-4/5 h-12 ${bgx(leftText(), 'bg-green-700')}`}>
          {leftText()}
        </div>
      </div>

      <Switch fallback={
        <CardStyleLarge isSelected={isSelected} data={props.data} index={props.index} swipeLeft={swipeLeft} swipeRight={swipeRight} />
      }>
        <Match when={useThin()}>
          <CardStyleThin isSelected={isSelected} data={props.data} index={props.index} swipeLeft={swipeLeft} swipeRight={swipeRight} />
        </Match>
      </Switch>

      <div class="w-[20vw] flex items-center justify-center">
        <div
          class={`flex items-center justify-center rounded-lg w-4/5 h-12 ${bgx(rightText(), 'bg-red-700')}`}>
          {rightText()}
        </div>
      </div>
    </div >
}

export default Card
