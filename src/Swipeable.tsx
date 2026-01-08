import { JSXElement } from "solid-js";
import { createLogger } from "./common";

const _Logger = createLogger('Swipeable')
const lg = _Logger.log
_Logger.disable()

const Swipeable = (props: {
  children: JSXElement | JSXElement[],
  limit?: number,
  class?: string,
  onSwipeRight?: () => void,
  onSwipeLeft?: () => void,
  leftBg: string,
  rightBg: string,
  leftIcon: JSXElement,
  rightIcon: JSXElement
}) => {
  let containerRef!: HTMLDivElement;
  let boxLRef!: HTMLDivElement;
  let boxRRef!: HTMLDivElement;

  const limit = props.limit || 50;

  let startX = 0;
  let isDragging = false;
  let isWaitForDrag = false;

  const onPointerDown = (e: PointerEvent) => {
    lg('onPointerDown', { e, isDragging, isWaitForDrag, hasCapture: containerRef.hasPointerCapture(e.pointerId) })
    startX = e.clientX;
    if (containerRef.hasPointerCapture(e.pointerId))
      containerRef.releasePointerCapture(e.pointerId);
    isDragging = false
    isWaitForDrag = true
  };

  const onPointerMove = (e: PointerEvent) => {

    let x = e.clientX - startX;
    let absX = Math.abs(x);
    lg('onPointerMove', { e, absX, isDragging, isWaitForDrag, hasCapture: containerRef.hasPointerCapture(e.pointerId) })

    if (absX < 6) return

    if (isWaitForDrag) {
      isWaitForDrag = false
      if (!containerRef.hasPointerCapture(e.pointerId))
        containerRef.setPointerCapture(e.pointerId);
      containerRef.dataset.dragging = "true";
      isDragging = true
    }
    if (!isDragging) return

    // Rubber-banding
    if (absX > limit) {
      const over = absX - limit;
      x = x > 0 ? limit + over * 0.1 : -limit - over * 0.1;
      absX = limit + over * 0.1;
    }

    // Direct DOM updates for 60fps performance
    containerRef.style.setProperty("--offset", `${x}px`);
    containerRef.style.setProperty("--abs-offset", `${absX}px`);
    containerRef.style.setProperty("--iconx", `0px`);

    // Icon Scaling Math (0 to 1)
    let scale = Math.min(Math.max(.2 + absX / limit, 0.2), 1);
    containerRef.style.setProperty("--icon-scale", String(scale));

    // Toggle visibility of the "under-boxes"
    if (boxLRef) boxLRef.style.visibility = x > 0 ? "visible" : "hidden";
    if (boxRRef) boxRRef.style.visibility = x < 0 ? "visible" : "hidden";
  };

  const __onRelease = (e: PointerEvent) => {
    isDragging = false
    isWaitForDrag = false
    delete containerRef.dataset.dragging;

    if (containerRef.hasPointerCapture(e.pointerId))
      containerRef.releasePointerCapture(e.pointerId);

    const currentX = parseFloat(getComputedStyle(containerRef).getPropertyValue("--offset"));

    if (Math.abs(currentX) >= limit * 1.2) {
      const isRight = currentX > 0;
      setTimeout(() => isRight ? props.onSwipeRight?.() : props.onSwipeLeft?.(), 200);
      containerRef.style.setProperty("--offset", `${isRight ? '' : '-'}100%`);
      containerRef.style.setProperty("--abs-offset", `${isRight ? '' : '-'}100%`);
      containerRef.style.setProperty("--iconx", `${isRight ? '' : '-'}500px`);
      {/* containerRef.style.setProperty("--icon-scale", "0"); */ }
      {/* containerRef.style.setProperty("--abs-offset", "0px"); */ }
      {/* containerRef.style.setProperty("--icon-scale", "0"); */ }
    } else {
      // Reset animations
      containerRef.style.setProperty("--offset", "0px");
      containerRef.style.setProperty("--abs-offset", "0px");
      containerRef.style.setProperty("--icon-scale", "0");
      containerRef.style.setProperty("--iconx", "0");
    }
  };

  const onPointerUp = (e: PointerEvent) => {
    lg('onPointerUp', { e, isDragging, isWaitForDrag, hasCapture: containerRef.hasPointerCapture(e.pointerId) })
    __onRelease(e)
  }

  const onPointerCancel = (e: PointerEvent) => {
    lg('onPointerUp', { e, isDragging, isWaitForDrag, hasCapture: containerRef.hasPointerCapture(e.pointerId) })
    __onRelease(e)
  }

  // const onClick = (e: MouseEvent) => {
  //   lg('onClick', { e })
  // }


  return (

    <div
      ref={containerRef}
      style={{ "--action-size": `${limit}px`, }}
      class={`relative w-full overflow-hidden touch-pan-y max-w-2xl mx-auto select-none bg-slate-100/0 group h-auto snap-start snap-always ${props.class ?? ''}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerCancel={onPointerCancel}
      onPointerUp={onPointerUp}
    // onClick={props.onClick}
    >
      <div class="absolute inset-0 px-1 z-0" >

        <div
          ref={boxLRef}
          style={{ width: "clamp(0px, calc(var(--abs-offset) - 1rem), var(--action-size))", transform: 'translateX(var(--iconx))' }}
          class={`absolute left-0 top-6 flex h-20 items-center justify-center overflow-hidden 
          rounded-full shrink-0 transition-[width] duration-30 ease-[cubic-bezier(0.18,0.89,0.32,1.2)] 
          group-data-dragging:transition-none ${props.leftBg || 'bg-green-700'}`} >
          <div style={{ transform: "scale(var(--icon-scale))" }}
            class="p-2 flex items-center justify-center transition-transform duration-200 group-data-dragging:transition-none text-white" >
            {props.leftIcon}
          </div>
        </div>

        <div
          ref={boxRRef}
          style={{ width: "clamp(0px, calc(var(--abs-offset) - 1rem), var(--action-size))", transform: 'translateX(var(--iconx))' }}
          class={`absolute right-0 top-6 flex h-20 items-center justify-center overflow-hidden 
          rounded-full shrink-0 transition-[width] duration-30 ease-[cubic-bezier(0.18,0.89,0.32,1.2)] 
          group-data-dragging:transition-none ${props.rightBg || 'bg-red-700'}`} >
          <div style={{ transform: "scale(var(--icon-scale))" }}
            class="p-2 flex items-center justify-center transition-transform duration-200 group-data-dragging:transition-none text-white">
            {props.rightIcon}
          </div>
        </div>
      </div >

      <div
        id="swipe-content"
        style={{ transform: "translateX(var(--offset))" }}
        class="relative z-10 bg-[#242424] w-full h-full flex items-center px-1 transition-transform duration-300 ease-[cubic-bezier(0.18,0.89,0.32,1.2)] group-data-dragging:transition-none"
      >
        <div class="py-2 w-full">
          {props.children}
        </div>
      </div>
      {/* <div id="tester" class="absolute bg-amber-600 w-10 h-10 left-2 bottom-2 z-20" */}
      {/*   onClick={() => { lg('CLICK') }} onPointerUp={() => { lg('POINTER UP') }}></div> */}
    </div >
  );
}
export default Swipeable;
