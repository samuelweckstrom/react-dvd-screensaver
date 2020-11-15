import React from 'react';

export const useWindowSize = (): { [T: string]: number } => {
  const getSize = (): { [T: string]: number } => ({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [windowSize, setWindowSize] = React.useState(getSize);
  React.useLayoutEffect(() => {
    const onResize = () => setWindowSize(getSize);
    window.addEventListener('resize', onResize);
    return (): void => window.removeEventListener('resize', onResize);
  }, []);
  return windowSize;
};
