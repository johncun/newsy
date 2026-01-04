import { JSXElement } from "solid-js";

const Swipeable = (props: {
  children: JSXElement | JSXElement[],
  limit?: number,
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

  const onPointerDown = (e: PointerEvent) => {
    startX = e.clientX;
    isDragging = true;
    containerRef.dataset.dragging = "true";
    containerRef.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: PointerEvent) => {
    if (!isDragging) return;

    let x = e.clientX - startX;
    let absX = Math.abs(x);

    if (absX < 6) return; // stop jitter

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

  const onPointerUp = (_e: PointerEvent) => {
    if (!isDragging) return;
    isDragging = false;
    delete containerRef.dataset.dragging;

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

  return (

    <div
      ref={containerRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      style={{ "--action-size": `${limit}px`, }}
      class={`relative w-full overflow-hidden touch-pan-y select-none bg-slate-100/0 group h-auto snap-start snap-always`}
    >
      <div class="absolute inset-0 px-1 z-0 " >

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
        style={{ transform: "translateX(var(--offset))" }}
        class="relative z-10 bg-[#242424] w-full h-full flex items-center px-1 transition-transform duration-300 ease-[cubic-bezier(0.18,0.89,0.32,1.2)] group-data-dragging:transition-none"
      >
        <div class="py-2 w-full">
          {props.children}
        </div>
      </div>
    </div >
  );
}
export default Swipeable;
