import React from 'react';
import { useWindowSize } from './utils';

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

export type DvdScreensaverProps = {
  children: React.ReactNode;
  className?: string;
  freezeOnHover?: boolean;
  height?: string;
  width?: string;
  hoverCallback?: () => void;
  impactCallback?: (count: number) => void;
  speed?: number;
  styles?: HTMLStyleElement;
};

const createHash = () => Math.random().toString(36).substring(7);

const hashedClassName = createHash();
export function DvdScreensaver(props: DvdScreensaverProps) {
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
  const elementRef = React.useRef<HTMLDivElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = React.useState<boolean>(false);
  const [impactCount, setImpactCount] = React.useState<number>(0);

  React.useEffect(() => {
    if (props.impactCallback) {
      props.impactCallback(impactCount);
    }
  }, [impactCount, props]);

  const animate = () => {
    const delta = props.speed || 5;
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
    if (props.freezeOnHover) {
      if (hovered) {
        cancelAnimationFrame(animationRef.current.animationFrameId);
        animationRef.current.animationFrameId = 0;
      }
      if (!hovered && !animationRef.current.animationFrameId) {
        animationRef.current.animationFrameId = requestAnimationFrame(animate);
      }
    }
    if (props.hoverCallback) {
      props.hoverCallback();
    }
  }, [hovered, props]);

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

  return (
    <>
      <style>
        {`.${hashedClassName} {
          width: ${!props.className && props.width ? props.width : 'inherit'};
          height: ${
            !props.className && props.height ? props.height : 'inherit'
          };
        }`}
      </style>
      <div
        ref={containerRef}
        className={`${hashedClassName} ${props.className}`}
        style={{
          ...props.styles,
        }}
      >
        {React.cloneElement(props.children as React.ReactElement<any>, {
          ref: elementRef,
        })}
      </div>
    </>
  );
}
