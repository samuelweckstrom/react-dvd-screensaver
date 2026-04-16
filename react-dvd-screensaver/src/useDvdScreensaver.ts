import { useEffect, useLayoutEffect, useRef, useState } from 'react';

// useLayoutEffect logs a warning during SSR (e.g. Next.js). Use useEffect on
// the server where layout effects cannot run, and useLayoutEffect on the client
// where synchronous DOM measurement is needed to avoid flicker.
const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/**
 * Configuration options for the DVD screensaver behavior.
 */
export type Options = {
  /** Whether the animation should pause when the element is hovered or touched. */
  freezeOnHover?: boolean;
  /** Callback triggered each time the element hits a container boundary. Receives the total impact count. */
  impactCallback?: (count: number) => void;
  /** Callback triggered when the element simultaneously hits two boundaries (a corner). */
  onCornerHit?: () => void;
  /** Callback triggered when hover or touch begins on the element. */
  hoverCallback?: () => void;
  /** Pause the animation programmatically. */
  paused?: boolean;
  /**
   * Speed of the animation expressed as pixels per frame at 60 fps. Defaults to 2.
   * Internally the animation is time-based so the speed stays consistent across
   * 60 Hz, 90 Hz, and 120 Hz displays.
   */
  speed?: number;
};

type AnimationState = {
  animationFrameId: number;
  impactCount: number;
  isPosXIncrement: boolean;
  isPosYIncrement: boolean;
  /** Timestamp of the previous frame, used to compute a frame-rate-independent delta. */
  lastTimestamp: number;
  positionX: number;
  positionY: number;
};

/**
 * The return type of the useDvdScreensaver hook.
 */
export type UseDvdScreensaver<T extends HTMLElement = HTMLDivElement> = {
  /** Attach to the container element. Takes precedence over the element's parent when provided. */
  containerRef: React.RefObject<T | null>;
  /** Attach to the element that should animate. */
  elementRef: React.RefObject<T | null>;
  /** Whether the element is currently hovered or touched. */
  hovered: boolean;
  /** Total number of boundary impacts. */
  impactCount: number;
};

/**
 * Hook that applies a DVD screensaver bouncing animation to an element.
 * Works on both desktop (mouse) and mobile (touch) devices, and is safe
 * to use in Next.js client components.
 *
 * The container must have `position: relative` (or `absolute` / `fixed`).
 * The animated element must have `position: absolute; top: 0; left: 0`.
 * If `containerRef` is not attached to a DOM node, the element's `parentElement` is used.
 *
 * @param options - Configuration options.
 * @returns Refs for the container and element, hover state, and impact count.
 *
 * @example Basic usage
 * ```tsx
 * const { containerRef, elementRef, impactCount } = useDvdScreensaver({ speed: 3 });
 *
 * return (
 *   <div ref={containerRef} style={{ position: 'relative', width: '100%', height: '400px' }}>
 *     <div ref={elementRef} style={{ position: 'absolute', top: 0, left: 0 }}>
 *       <MyLogo />
 *     </div>
 *   </div>
 * );
 * ```
 *
 * @example Change color on every boundary impact
 * ```tsx
 * const COLORS = ['#ff4081', '#7c4dff', '#00bcd4', '#69f0ae'];
 * const [color, setColor] = useState(COLORS[0]);
 *
 * const { containerRef, elementRef } = useDvdScreensaver({
 *   impactCallback: (count) => setColor(COLORS[count % COLORS.length]),
 * });
 * ```
 *
 * @example Programmatic pause and resume
 * ```tsx
 * const [paused, setPaused] = useState(false);
 * const { containerRef, elementRef } = useDvdScreensaver({ paused });
 *
 * return (
 *   <>
 *     <div ref={containerRef} style={{ position: 'relative', width: '100%', height: '400px' }}>
 *       <div ref={elementRef} style={{ position: 'absolute', top: 0, left: 0 }}>
 *         <MyLogo />
 *       </div>
 *     </div>
 *     <button onClick={() => setPaused((p) => !p)}>{paused ? 'Resume' : 'Pause'}</button>
 *   </>
 * );
 * ```
 *
 * @example Corner hit detection
 * ```tsx
 * const { containerRef, elementRef } = useDvdScreensaver({
 *   onCornerHit: () => console.log('Corner!'),
 * });
 * ```
 *
 * @example Next.js App Router — add 'use client' directive
 * ```tsx
 * 'use client';
 * import { useDvdScreensaver } from 'react-dvd-screensaver';
 *
 * export default function ScreensaverPage() {
 *   const { containerRef, elementRef } = useDvdScreensaver({ speed: 3 });
 *
 *   return (
 *     <div ref={containerRef} style={{ position: 'relative', width: '100%', height: '100vh' }}>
 *       <div ref={elementRef} style={{ position: 'absolute', top: 0, left: 0 }}>
 *         <MyLogo />
 *       </div>
 *     </div>
 *   );
 * }
 * ```
 */
export function useDvdScreensaver<T extends HTMLElement = HTMLDivElement>(
  options?: Partial<Options>
): UseDvdScreensaver<T> {
  // Mirror options into a ref so the RAF loop always reads the latest values
  // without needing to restart the animation on prop changes.
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const animationState = useRef<AnimationState>({
    animationFrameId: 0,
    impactCount: 0,
    isPosXIncrement: true,
    isPosYIncrement: true,
    lastTimestamp: 0,
    positionX: 0,
    positionY: 0,
  });

  const animateFnRef = useRef<((timestamp: number) => void) | undefined>(undefined);
  const elementRef = useRef<T | null>(null);
  const containerRef = useRef<T | null>(null);
  const [impactCount, setImpactCount] = useState(0);
  const [hovered, setHovered] = useState(false);
  const hoveredRef = useRef(false);

  /** Returns true when the user has requested reduced motion at the OS level. */
  const prefersReducedMotion = () =>
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function startAnimation() {
    if (!animateFnRef.current || animationState.current.animationFrameId) return;
    if (prefersReducedMotion()) return;
    animationState.current.animationFrameId = requestAnimationFrame(animateFnRef.current);
  }

  function stopAnimation() {
    cancelAnimationFrame(animationState.current.animationFrameId);
    animationState.current.animationFrameId = 0;
    // Reset the timestamp so the first frame after a resume uses the ideal
    // interval instead of the (potentially very large) real elapsed time.
    animationState.current.lastTimestamp = 0;
  }

  useIsomorphicLayoutEffect(() => {
    const element = elementRef.current;

    const mql =
      typeof window !== 'undefined'
        ? window.matchMedia('(prefers-reduced-motion: reduce)')
        : null;

    const setActive = () => setHovered(true);
    const setInactive = () => setHovered(false);

    // Only deactivate when every touch has left the element, so that placing
    // two fingers and lifting one doesn't prematurely unfreeze the animation.
    const handleTouchEnd = (e: TouchEvent) => {
      if (e.touches.length === 0) setInactive();
    };

    const onMotionPrefChange = () => {
      if (mql?.matches) {
        stopAnimation();
      } else if (!optionsRef.current?.paused && !hoveredRef.current) {
        startAnimation();
      }
    };

    function updatePosition(
      containerSpan: number,
      delta: number,
      elementSpan: number,
      prevPos: number,
      toggleKey: 'isPosXIncrement' | 'isPosYIncrement'
    ): { pos: number; hit: boolean } {
      const boundary = Math.max(0, containerSpan - elementSpan);
      let newPos = prevPos + (animationState.current[toggleKey] ? delta : -delta);
      let hit = false;
      if (newPos <= 0 || newPos >= boundary) {
        animationState.current[toggleKey] = !animationState.current[toggleKey];
        animationState.current.impactCount += 1;
        setImpactCount(animationState.current.impactCount);
        optionsRef.current?.impactCallback?.(animationState.current.impactCount);
        newPos = Math.max(0, Math.min(newPos, boundary));
        hit = true;
      }
      return { pos: newPos, hit };
    }

    function animate(timestamp: number) {
      const el = elementRef.current;
      // Prefer the explicit containerRef when provided, fall back to parentElement.
      const container = (containerRef.current as HTMLElement | null) ?? el?.parentElement;

      if (el && container) {
        const last = animationState.current.lastTimestamp;
        // On the very first frame `last` is 0; use the ideal 60 fps interval so
        // the element doesn't jump. Cap at 50 ms to handle tab-backgrounding.
        const elapsed = last ? Math.min(timestamp - last, 50) : 1000 / 60;
        animationState.current.lastTimestamp = timestamp;

        // speed is pixels-per-frame at 60 fps; convert to pixels for this frame.
        const speed = optionsRef.current?.speed ?? 2;
        const delta = (speed * 60 * elapsed) / 1000;

        const { pos: posX, hit: hitX } = updatePosition(
          container.clientWidth, delta, el.clientWidth,
          animationState.current.positionX, 'isPosXIncrement'
        );
        const { pos: posY, hit: hitY } = updatePosition(
          container.clientHeight, delta, el.clientHeight,
          animationState.current.positionY, 'isPosYIncrement'
        );

        if (hitX && hitY) {
          optionsRef.current?.onCornerHit?.();
        }

        el.style.transform = `translate3d(${posX}px, ${posY}px, 0)`;
        animationState.current.positionX = posX;
        animationState.current.positionY = posY;
      }

      animationState.current.animationFrameId = requestAnimationFrame(animate);
    }

    animateFnRef.current = animate;

    if (element) {
      element.style.willChange = 'transform';
      // Prevent text-selection highlight and iOS long-press callout on the
      // animated element without requiring consumers to add their own CSS.
      element.style.userSelect = 'none';
      element.style.setProperty('-webkit-touch-callout', 'none');

      // Seed the starting position within the actual container bounds so the
      // element never starts out-of-bounds, regardless of container size.
      const container = (containerRef.current as HTMLElement | null) ?? element.parentElement;
      if (container) {
        const maxX = Math.max(0, container.clientWidth - element.clientWidth);
        const maxY = Math.max(0, container.clientHeight - element.clientHeight);
        animationState.current.positionX = Math.random() * maxX;
        animationState.current.positionY = Math.random() * maxY;
      }

      // Mouse events (desktop)
      element.addEventListener('mouseover', setActive);
      element.addEventListener('mouseout', setInactive);

      // Touch events (mobile) — passive to avoid blocking scroll on the page
      element.addEventListener('touchstart', setActive, { passive: true });
      element.addEventListener('touchend', handleTouchEnd, { passive: true });
      element.addEventListener('touchcancel', handleTouchEnd, { passive: true });

      mql?.addEventListener('change', onMotionPrefChange);

      if (!optionsRef.current?.paused && !mql?.matches) {
        animationState.current.animationFrameId = requestAnimationFrame(animate);
      }
    }

    return () => {
      element?.removeEventListener('mouseover', setActive);
      element?.removeEventListener('mouseout', setInactive);
      element?.removeEventListener('touchstart', setActive);
      element?.removeEventListener('touchend', handleTouchEnd);
      element?.removeEventListener('touchcancel', handleTouchEnd);
      mql?.removeEventListener('change', onMotionPrefChange);
      cancelAnimationFrame(animationState.current.animationFrameId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Clamp the element position when the container resizes so it never escapes bounds.
  useEffect(() => {
    const element = elementRef.current;
    const container = (containerRef.current as HTMLElement | null) ?? element?.parentElement;
    if (!container || typeof ResizeObserver === 'undefined') return;

    const observer = new ResizeObserver(() => {
      if (!elementRef.current) return;
      const maxX = Math.max(0, container.clientWidth - elementRef.current.clientWidth);
      const maxY = Math.max(0, container.clientHeight - elementRef.current.clientHeight);
      animationState.current.positionX = Math.min(animationState.current.positionX, maxX);
      animationState.current.positionY = Math.min(animationState.current.positionY, maxY);
    });

    observer.observe(container);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Freeze or resume when hovered state changes.
  useEffect(() => {
    const wasHovered = hoveredRef.current;
    hoveredRef.current = hovered;

    if (hovered && !wasHovered) {
      optionsRef.current?.hoverCallback?.();
    }

    if (!optionsRef.current?.freezeOnHover) return;

    if (hovered) {
      stopAnimation();
    } else {
      startAnimation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hovered]);

  // Handle `paused` prop toggled from outside.
  useEffect(() => {
    if (options?.paused) {
      stopAnimation();
    } else if (!hoveredRef.current || !optionsRef.current?.freezeOnHover) {
      startAnimation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options?.paused]);

  // Handle `freezeOnHover` toggled off while the animation is stopped.
  useEffect(() => {
    if (!options?.freezeOnHover && !options?.paused) {
      startAnimation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options?.freezeOnHover]);

  return { containerRef, elementRef, hovered, impactCount };
}
