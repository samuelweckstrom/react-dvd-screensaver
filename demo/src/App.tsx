import { useCallback, useState } from 'react';
import { useDvdScreensaver } from 'react-dvd-screensaver';
import './styles.css';

const COLORS = [
  '#ff4081',
  '#e040fb',
  '#7c4dff',
  '#40c4ff',
  '#00e5ff',
  '#69f0ae',
  '#b2ff59',
  '#ffff00',
  '#ffd740',
  '#ff6d00',
  '#ff1744',
] as const;

function DvdLogo({ color }: { color: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 210 100"
      fill={color}
      className="dvd-logo"
    >
      <path d="M118.895 20.346s-13.743 16.922-13.04 18.001c.975-1.079-4.934-18.186-4.934-18.186s-1.233-3.597-5.102-15.387H22.175l-2.56 11.068h23.878c12.415 0 19.995 5.132 17.878 14.225-2.287 9.901-13.123 14.128-24.665 14.128H32.39l5.552-24.208H18.647l-8.192 35.368h27.398c20.612 0 40.166-11.067 43.692-25.288.617-2.614.53-9.185-1.054-13.053 0-.093-.091-.271-.178-.537-.087-.093-.178-.722.178-.814.172-.092.525.271.525.358 0 0 .179.456.351.813l17.44 50.315 44.404-51.216 18.761-.092h4.579c12.424 0 20.09 5.132 17.969 14.225-2.29 9.901-13.205 14.128-24.75 14.128h-4.405L161 19.987h-19.287l-8.198 35.368h27.398c20.611 0 40.343-11.067 43.604-25.288 3.347-14.225-11.101-25.293-31.89-25.293H131.757c-10.834 13.049-12.862 15.572-12.862 15.572zM99.424 67.329C47.281 67.329 5 73.449 5 81.012 5 88.57 47.281 94.69 99.424 94.69c52.239 0 94.524-6.12 94.524-13.678.001-7.563-42.284-13.683-94.524-13.683zm-3.346 18.544c-11.98 0-21.58-2.072-21.58-4.595 0-2.523 9.599-4.59 21.58-4.59 11.888 0 21.498 2.066 21.498 4.59 0 2.523-9.61 4.595-21.498 4.595zM182.843 94.635v-.982h-5.745l-.239.982h2.392l-.965 7.591h1.204l.955-7.591h2.398zM191.453 102.226v-8.573h-.949l-3.12 5.881-1.416-5.881h-.955l-2.653 8.573h.977l2.138-6.609 1.442 6.609 3.359-6.609.228 6.609h.949z" />
    </svg>
  );
}

export function App() {
  const [speed, setSpeed] = useState(3);
  const [freezeOnHover, setFreezeOnHover] = useState(false);
  const [paused, setPaused] = useState(false);
  const [color, setColor] = useState<string>(COLORS[0]);
  const [cornerHitCount, setCornerHitCount] = useState(0);

  const handleCornerHit = useCallback(() => {
    setCornerHitCount((n) => n + 1);
  }, []);

  const { containerRef, elementRef, hovered, impactCount } = useDvdScreensaver({
    speed,
    freezeOnHover,
    paused,
    onCornerHit: handleCornerHit,
    impactCallback: (count) => setColor(COLORS[count % COLORS.length]),
  });

  const isFrozen = hovered && freezeOnHover;

  return (
    <div className="app">

      {/* ── TV Body ───────────────────────────── */}
      <div className="tv-body">

        <div className="tv-top-bezel">
          <div className="tv-brand">
            <span className="tv-brand-dvd">DVD</span>
            <span className="tv-brand-rest"> Screensaver</span>
            <span className="tv-brand-badge">React</span>
          </div>
          <div className="tv-top-right">
            {isFrozen && <span className="tv-status-badge tv-status-badge--frozen">frozen</span>}
            {paused && <span className="tv-status-badge tv-status-badge--paused">paused</span>}
          </div>
        </div>

        {cornerHitCount > 0 && (
          <div key={cornerHitCount} className="corner-strobe" aria-hidden="true" />
        )}

        <div className="tv-screen-surround">
          <div
            ref={containerRef as React.Ref<HTMLDivElement>}
            className="screensaver-stage"
          >
            <div ref={elementRef as React.Ref<HTMLDivElement>} className="dvd-element">
              <DvdLogo color={color} />
            </div>

            <div className="stage-hud">
              <div className="hud-stat">
                <span className="hud-number">{impactCount}</span>
                <span className="hud-label">impacts</span>
              </div>
              <div className="hud-stat">
                <span
                  key={cornerHitCount}
                  className={`hud-number hud-number--corners${cornerHitCount > 0 ? ' hud-number--hit' : ''}`}
                >
                  {cornerHitCount}
                </span>
                <span className="hud-label hud-label--corners">corners</span>
              </div>
            </div>
          </div>
        </div>


      </div>

      {/* ── DVD Player ────────────────────────── */}
      <div className="dvd-player">
        <div className="player-panel">

          {/* Controls */}
          <div className="player-controls">
            <div className="player-speed-control">
              <div className="player-ctrl-header">
                <span className="player-ctrl-label">SPEED</span>
                <span className="player-ctrl-value">{speed}</span>
              </div>
              <input
                className="player-slider"
                type="range"
                min={1}
                max={10}
                step={1}
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
              />
              <div className="player-slider-ticks">
                <span>1</span><span>5</span><span>10</span>
              </div>
            </div>

            <div className="player-btn-group">
              <button
                className={`player-btn${freezeOnHover ? ' player-btn--lit' : ''}`}
                onClick={() => setFreezeOnHover((v) => !v)}
                aria-pressed={freezeOnHover}
              >
                <span className={`btn-led${freezeOnHover ? ' btn-led--on' : ''}`} />
                FREEZE
              </button>
              <button
                className={`player-btn${paused ? ' player-btn--lit player-btn--amber' : ''}`}
                onClick={() => setPaused((v) => !v)}
                aria-pressed={paused}
              >
                <span className={`btn-led${paused ? ' btn-led--on btn-led--amber' : ''}`} />
                PAUSE
              </button>
            </div>
          </div>

          {/* Player end: brand + GitHub */}
          <div className="player-end">
            <a
              className="player-github"
              href="https://github.com/samuelweckstrom/react-dvd-screensaver"
              target="_blank"
              rel="noopener noreferrer"
              title="GitHub"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
              </svg>
            </a>
          </div>

        </div>
      </div>

    </div>
  );
}
