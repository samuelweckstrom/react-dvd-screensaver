import React from 'react';
import { useWindowSize } from './hooks';

export type DvdScreensaverProps = {
  children: React.ReactNode;
  impactCallback?: (count: number) => void;
  className?: string;
  styles?: HTMLStyleElement;
  width?: string;
  height?: string;
  speed?: number;
};

const createHash = () => Math.random().toString(36).substring(7);

const hashedClassName = createHash();
export function DvdScreensaver(props: DvdScreensaverProps) {
  const requestRef = React.useRef<any>({});
  const previousTimeRef = React.useRef<number>();
  const childRef = React.useRef<HTMLElement>();
  const parentRef = React.useRef<any>();
  const [positionX, setPositionX] = React.useState<number>(0);
  const [positionY, setPositionY] = React.useState<number>(0);
  const [impactCount, setImpactCount] = React.useState<number>(0);
  const { width: windowWidth, height: windowHeight } = useWindowSize();
  const speed = props.speed || 0.15;

  React.useEffect(() => {
    if (props.impactCallback) {
      props.impactCallback(impactCount);
    }
  }, [impactCount]);

  React.useEffect(() => {
    if (parentRef.current && childRef.current) {
      requestRef.current.parentWidth = parentRef.current?.getBoundingClientRect().width;
      requestRef.current.parentHeight = parentRef.current?.getBoundingClientRect().height;
      requestRef.current.childWidth = childRef.current?.getBoundingClientRect().width;
      requestRef.current.childHeight = childRef.current?.getBoundingClientRect().height;
      requestRef.current.impactCount = requestRef.current.impactCount || 0;
    }
  }, [parentRef, requestRef, childRef, windowWidth, windowHeight]);

  const animate = (time: number) => {
    if (previousTimeRef.current !== undefined) {
      const move = (time - previousTimeRef.current) * speed;
      const parentWidth = requestRef.current.parentWidth;
      const parentHeight = requestRef.current.parentHeight;
      const width = requestRef.current.childWidth;
      const height = requestRef.current.childHeight;
      const setPosX = (prevPos: number) => {
        const positionWithinRange = Math.min(
          Math.max(prevPos, 0),
          parentWidth - width
        );
        if (positionWithinRange >= parentWidth - width) {
          requestRef.current.isMovingRight = false;
          requestRef.current.impactCount = requestRef.current.impactCount + 1;
        }
        if (positionWithinRange <= 0) {
          requestRef.current.isMovingRight = true;
          requestRef.current.impactCount = requestRef.current.impactCount + 1;
        }
        return requestRef.current.isMovingRight
          ? positionWithinRange + move
          : positionWithinRange - move;
      };
      const setPosY = (prevPos: number) => {
        const positionWithinRange = Math.min(
          Math.max(prevPos, 0),
          parentHeight - height
        );
        if (positionWithinRange >= parentHeight - height) {
          requestRef.current.isMovingDown = false;
          requestRef.current.impactCount = requestRef.current.impactCount + 1;
        }
        if (positionWithinRange <= 0) {
          requestRef.current.isMovingDown = true;
          requestRef.current.impactCount = requestRef.current.impactCount + 1;
        }
        return requestRef.current.isMovingDown
          ? positionWithinRange + move
          : positionWithinRange - move;
      };
      setPositionX(setPosX);
      setPositionY(setPosY);
    }
    setImpactCount(requestRef.current.impactCount);
    previousTimeRef.current = time;
    requestRef.current.animte = requestAnimationFrame(animate);
  };

  React.useEffect(() => {
    if (childRef.current) {
      childRef.current.style.transform = `translate(${positionX}px, ${positionY}px)`;
    }
  }, [positionX, positionY]);

  const onVisibilityChange = () => {
    requestRef.current.isVisible = !document.hidden;
    if (document.hidden) {
      cancelAnimationFrame(requestRef.current.animte);
    } else {
      requestRef.current.animte = requestAnimationFrame(animate);
    }
  };

  React.useLayoutEffect(() => {
    document.addEventListener('visibilitychange', onVisibilityChange, false);
    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [onVisibilityChange]);

  React.useLayoutEffect(() => {
    if (requestRef.current) {
      requestRef.current.animte = requestAnimationFrame(animate);
    }
    return () => {
      cancelAnimationFrame(requestRef.current.animte);
    };
  }, [requestRef]);

  return (
    <>
      <style>
        {`.${hashedClassName} {
        width: ${!props.className && props.width ? props.width : 'inherit'};
        height: ${!props.className && props.height ? props.height : 'inherit'};
        }`}
      </style>
      <div
        ref={parentRef}
        className={`${hashedClassName} ${props.className}`}
        style={{
          ...props.styles,
        }}
      >
        {React.cloneElement(props.children as React.ReactElement<any>, {
          ref: childRef,
        })}
      </div>
    </>
  );
}
