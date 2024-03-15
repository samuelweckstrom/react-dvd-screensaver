import { useEffect, useState } from 'react';
import { useDvdScreensaver, DvdScreensaver } from 'react-dvd-screensaver';
import './styles.css';

const COLORS = [
  '#ff0000',
  '#ff4000',
  '#ff8000',
  '#ffbf00',
  '#ffff00',
  '#bfff00',
  '#80ff00',
  '#40ff00',
  '#00ff00',
  '#00ff40',
  '#00ff80',
  '#00ffbf',
  '#00ffff',
  '#00bfff',
  '#0080ff',
  '#0040ff',
  '#0000ff',
  '#4000ff',
  '#8000ff',
  '#bf00ff',
  '#ff00ff',
  '#ff00bf',
  '#ff0080',
  '#ff0040',
  '#ff0000',
] as const;

export function App() {
  const { containerRef, elementRef, hovered, impactCount } = useDvdScreensaver({
    freezeOnHover: true,
    speed: 2,
  });
  const [componentImpactCount, setComponentImpactCount] = useState<number>(0);
  const [logoColor, setLogoColor] = useState<string>(COLORS[0]);
  const handleComponentImpactCount = (count: number) => {
    setComponentImpactCount(count);
  };

  useEffect(() => {
    if (hovered) {
      console.log('* FROZEN');
    }
  }, [hovered]);

  useEffect(() => {
    setLogoColor(COLORS[Math.floor(Math.random() * COLORS.length)]);
  }, [impactCount]);

  return (
    <div className="contents">
      <div className="content">
        <h1>Hooks example</h1>
        <h2>impact count: {impactCount}</h2>
        <div ref={containerRef} className="hooks-container">
          <div ref={elementRef} className="hooks-element">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 210 100"
              fill={logoColor}
            >
              <path d="M118.895 20.346s-13.743 16.922-13.04 18.001c.975-1.079-4.934-18.186-4.934-18.186s-1.233-3.597-5.102-15.387H22.175l-2.56 11.068h23.878c12.415 0 19.995 5.132 17.878 14.225-2.287 9.901-13.123 14.128-24.665 14.128H32.39l5.552-24.208H18.647l-8.192 35.368h27.398c20.612 0 40.166-11.067 43.692-25.288.617-2.614.53-9.185-1.054-13.053 0-.093-.091-.271-.178-.537-.087-.093-.178-.722.178-.814.172-.092.525.271.525.358 0 0 .179.456.351.813l17.44 50.315 44.404-51.216 18.761-.092h4.579c12.424 0 20.09 5.132 17.969 14.225-2.29 9.901-13.205 14.128-24.75 14.128h-4.405L161 19.987h-19.287l-8.198 35.368h27.398c20.611 0 40.343-11.067 43.604-25.288 3.347-14.225-11.101-25.293-31.89-25.293H131.757c-10.834 13.049-12.862 15.572-12.862 15.572zM99.424 67.329C47.281 67.329 5 73.449 5 81.012 5 88.57 47.281 94.69 99.424 94.69c52.239 0 94.524-6.12 94.524-13.678.001-7.563-42.284-13.683-94.524-13.683zm-3.346 18.544c-11.98 0-21.58-2.072-21.58-4.595 0-2.523 9.599-4.59 21.58-4.59 11.888 0 21.498 2.066 21.498 4.59 0 2.523-9.61 4.595-21.498 4.595zM182.843 94.635v-.982h-5.745l-.239.982h2.392l-.965 7.591h1.204l.955-7.591h2.398zM191.453 102.226v-8.573h-.949l-3.12 5.881-1.416-5.881h-.955l-2.653 8.573h.977l2.138-6.609 1.442 6.609 3.359-6.609.228 6.609h.949z" />
            </svg>
          </div>
        </div>
      </div>
      <div className="content">
        <h1>Component example</h1>
        <h2>impact count: {componentImpactCount}</h2>
        <div className="component-parent">
          <DvdScreensaver impactCallback={handleComponentImpactCount}>
            <img src="./doge.png" alt="" />
          </DvdScreensaver>
        </div>
      </div>
    </div>
  );
}
