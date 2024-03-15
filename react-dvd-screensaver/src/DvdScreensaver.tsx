import React, { cloneElement, useEffect } from 'react';
import { useDvdScreensaver } from './useDvdScreensaver';

/**
 * Props for the DvdScreensaver component.
 * @typedef Props
 */
export type Props = {
  /** @property {React.ReactElement} children - The child element to which the screensaver effect will be applied. */
  children: React.ReactElement<any, string | React.JSXElementConstructor<any>>;
  /** @property {string} [className] - Optional CSS class name for the container div. */
  className?: string;
  /** @property {boolean} [freezeOnHover] - If true, the animation will pause when the mouse hovers over the element. */
  freezeOnHover?: boolean;
  /** @property {string} [height] - Optional height for the container, defaults to 100% if not specified. */
  height?: string;
  /** @property {() => void} [hoverCallback] - Optional callback function that is called when the element is hovered. */
  hoverCallback?: () => void;
  /** @property {(count: number) => void} [impactCallback] - Optional callback function that is called when the animated element hits a boundary. Receives the total number of impacts as an argument. */
  impactCallback?: (count: number) => void;
  /** @property {number} [speed] - Optional speed of the animation. Higher values increase the speed. */
  speed?: number;
  /** @property {React.CSSProperties} [style] - Optional inline styles for the container. */
  style?: React.CSSProperties;
  /** @property {string} [width] - Optional width for the container, defaults to 100% if not specified. */
  width?: string;
};

export function DvdScreensaver(props: Props) {
  const { elementRef, impactCount } = useDvdScreensaver<HTMLDivElement>({
    freezeOnHover: props.freezeOnHover,
    hoverCallback: props.hoverCallback,
    speed: props.speed,
  });

  useEffect(() => {
    if (props.impactCallback) {
      props.impactCallback(impactCount);
    }
  }, [impactCount, props.impactCallback]);

  const enhancedStyle: React.CSSProperties = {
    ...props.style,
    width: props?.width || '100%',
    height: props?.height || '100%',
  };

  const childWithRef = cloneElement(props.children, { ref: elementRef });

  return (
    <div className={props.className} style={enhancedStyle}>
      {childWithRef}
    </div>
  );
}
