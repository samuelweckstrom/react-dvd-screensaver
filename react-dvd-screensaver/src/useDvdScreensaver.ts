import React from 'react';
import { useWindowSize } from './utils';

export type useDvdScreensaverParams = {
  freezeOnHover?: boolean;
  hoverCallback?: () => void;
  speed?: number;
};

type AnimationRefProperties = {
  animationFrameId: number;
  impactCount: number;
  isPosXIncrement: boolean;
  isPosYIncrement: boolean;
  containerHeight: number;
  containerWidth: number;
  positionX: number;
  positionY: number;
};

export type UseDvdScreensaver = {
  containerRef: React.RefObject<
    HTMLElement | HTMLDivElement | React.ReactElement
  >;
  elementRef: React.RefObject<
    HTMLElement | HTMLDivElement | React.ReactElement
  >;
  hovered: boolean;
  impactCount: number;
};

export function useDvdScreensaver(
  params: useDvdScreensaverParams
): UseDvdScreensaver {
  const { width: windowWidth, height: windowHeight } = useWindowSize();
  const animationRef = React.useRef<AnimationRefProperties>({
    animationFrameId: 0,
    impactCount: 0,
    isPosXIncrement: false,
    isPosYIncrement: false,
    containerHeight: 0,
    containerWidth: 0,
    positionX: Math.random() * (windowWidth - 0) + 0,
    positionY: Math.random() * (windowHeight - 0) + 0,
  });
  const elementRef = React.useRef<HTMLElement | HTMLDivElement>(null);
  const containerRef = React.useRef<HTMLElement | HTMLDivElement>(null);
  const [impactCount, setImpactCount] = React.useState<number>(0);
  const [hovered, setHovered] = React.useState<boolean>(false);

  const animate = () => {
    const delta = params.speed || 5;
    const setPos = ({
      containerSpan,
      delta,
      elementSpan,
      prevPos,
      toggleRefKey,
    }: {
      containerSpan: number;
      delta: number;
      elementSpan: number;
      prevPos: number;
      toggleRefKey: 'isPosXIncrement' | 'isPosYIncrement';
    }) => {
      const parentBoundary = containerSpan - elementSpan;
      const positionInRange = Math.min(Math.max(prevPos, 0), parentBoundary);
      if (positionInRange >= parentBoundary) {
        animationRef.current[toggleRefKey] = true;
        animationRef.current.impactCount = animationRef.current.impactCount + 1;
        setImpactCount(animationRef.current.impactCount);
      }
      if (positionInRange <= 0) {
        animationRef.current[toggleRefKey] = false;
        animationRef.current.impactCount = animationRef.current.impactCount + 1;
        setImpactCount(animationRef.current.impactCount);
      }
      return animationRef.current[toggleRefKey]
        ? positionInRange - delta
        : positionInRange + delta;
    };

    if (elementRef.current && elementRef.current.parentElement) {
      const containerHeight = elementRef.current.parentElement.clientHeight;
      const containerWidth = elementRef.current.parentElement.clientWidth;
      const elementHeight = elementRef.current.clientHeight;
      const elementWidth = elementRef.current.clientWidth;

      const posX = setPos({
        containerSpan: containerWidth,
        delta,
        elementSpan: elementWidth,
        prevPos: animationRef.current.positionX,
        toggleRefKey: 'isPosXIncrement',
      });

      const posY = setPos({
        containerSpan: containerHeight,
        delta,
        elementSpan: elementHeight,
        prevPos: animationRef.current.positionY,
        toggleRefKey: 'isPosYIncrement',
      });

      elementRef.current.style.transform = `translate3d(${posX}px, ${posY}px, 0)`;
      animationRef.current.positionX = posX;
      animationRef.current.positionY = posY;
    }
    const animationFrameId = requestAnimationFrame(animate);
    animationRef.current.animationFrameId = animationFrameId;
  };

  React.useEffect(() => {
    if (params.freezeOnHover) {
      if (hovered) {
        cancelAnimationFrame(animationRef.current.animationFrameId);
        animationRef.current.animationFrameId = 0;
      }
      if (!hovered && !animationRef.current.animationFrameId) {
        animationRef.current.animationFrameId = requestAnimationFrame(animate);
      }
    }
    if (params.hoverCallback) {
      params.hoverCallback();
    }
  }, [hovered, params]);

  const handleMouseOver = () => {
    setHovered(true);
  };

  const handleMouseOut = () => {
    setHovered(false);
  };

  React.useLayoutEffect(() => {
    if (animationRef.current && elementRef.current) {
      elementRef.current.style.willChange = 'transform';
      elementRef.current.onmouseover = handleMouseOver;
      elementRef.current.onmouseout = handleMouseOut;
      animationRef.current.animationFrameId = requestAnimationFrame(animate);
    }
    return () => {
      elementRef.current?.removeEventListener('mouseover', handleMouseOut);
      elementRef.current?.removeEventListener('mouseout', handleMouseOver);
      cancelAnimationFrame(animationRef.current.animationFrameId);
    };
  }, [animationRef, elementRef]);

  return {
    containerRef,
    elementRef,
    hovered,
    impactCount,
  };
}
