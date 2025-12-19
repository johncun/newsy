const SWIPE_THRESHOLD = 36;
const MAX_VERTICAL_DEVIATION = 80;

// Type for the handler function
export type SwipeDirection = 'left' | 'right';
export type SwipeHandler = (direction: SwipeDirection, el: HTMLElement) => void;

export function swipe(el: HTMLElement, accessor: () => SwipeHandler) {
  let startX: number;
  let startY: number;

  const handler = accessor();

  const handleTouchStart = (e: TouchEvent) => {
    // Only track the first touch point
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    el.addEventListener('touchend', handleTouchEnd);
    el.addEventListener('touchmove', handleTouchMove);
  };

  const handleTouchMove = (_e: TouchEvent) => {};

  const handleTouchEnd = (e: TouchEvent) => {
    if (e.changedTouches.length === 0) return;

    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;

    const deltaX = startX - endX; // Positive if swiping left
    const deltaY = Math.abs(startY - endY);

    // 1. Check if the vertical movement was minimal
    if (deltaY > MAX_VERTICAL_DEVIATION) {
      // Not a primarily horizontal movement, ignore
      return;
    }

    // 2. Check if the horizontal movement meets the threshold
    if (deltaX > SWIPE_THRESHOLD) {
      // Swiped Left
      handler('left', el);
    } else if (deltaX < -SWIPE_THRESHOLD) {
      // Swiped Right (deltaX is negative)
      handler('right', el);
    }

    // Cleanup: Remove the move and end listeners to prepare for the next touch start
    el.removeEventListener('touchend', handleTouchEnd);
    el.removeEventListener('touchmove', handleTouchMove);
  };

  // Attach the initial 'touchstart' listener
  el.addEventListener('touchstart', handleTouchStart);

  // Optional: Cleanup function for SolidJS disposal
  return {
    destroy() {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchend', handleTouchEnd);
      el.removeEventListener('touchmove', handleTouchMove);
    },
  };
}
