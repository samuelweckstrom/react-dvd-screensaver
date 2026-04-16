# React DVD Screensaver

[![TypeScript](https://badges.frapsoft.com/typescript/code/typescript.svg?v=101)](https://github.com/ellerbrock/typescript-badges/)
[![npm version](https://img.shields.io/npm/v/react-dvd-screensaver.svg)](https://www.npmjs.com/package/react-dvd-screensaver)
[![bundle size](https://img.shields.io/bundlephobia/minzip/react-dvd-screensaver)](https://bundlephobia.com/package/react-dvd-screensaver)

DVD-era nostalgia in React. Zero dependencies, fully typed, works on desktop and mobile, supports React 16 through 19.

[Demo](https://samuel.weckstrom.dev/react-dvd-screensaver) · [Try on StackBlitz](https://stackblitz.com/~/github.com/samuelweckstrom/react-dvd-screensaver)

<br>

```
pnpm add react-dvd-screensaver
# or
npm i react-dvd-screensaver
```

<br>

## Usage

```tsx
import { useDvdScreensaver } from 'react-dvd-screensaver';

function MyComponent() {
  const { containerRef, elementRef, impactCount } = useDvdScreensaver({ speed: 3 });

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', height: '400px' }}>
      <div ref={elementRef} style={{ position: 'absolute', top: 0, left: 0 }}>
        <MyLogo />
      </div>
    </div>
  );
}
```

The container element needs `position: relative` (or `absolute` / `fixed`) to establish a positioning context. The animated element needs `position: absolute; top: 0; left: 0` as its starting point.

<br>

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `speed` | `number` | `2` | Speed of the animation in pixels per frame |
| `freezeOnHover` | `boolean` | `false` | Pause animation on mouse hover or touch |
| `paused` | `boolean` | `false` | Programmatically pause and resume the animation |
| `impactCallback` | `(count: number) => void` | — | Called on each boundary impact with total count |
| `onCornerHit` | `() => void` | — | Called when the element hits a corner (both axes at once) |
| `hoverCallback` | `() => void` | — | Called when hover or touch begins |

<br>

## Return values

| Property | Type | Description |
|---|---|---|
| `containerRef` | `RefObject` | Attach to the container element |
| `elementRef` | `RefObject` | Attach to the element that should animate |
| `hovered` | `boolean` | Whether the element is currently hovered or touched |
| `impactCount` | `number` | Total number of boundary impacts |

<br>

## Examples

### Change color on impact

```tsx
const COLORS = ['#ff4081', '#7c4dff', '#00bcd4', '#69f0ae'];

function MyComponent() {
  const [color, setColor] = useState(COLORS[0]);

  const { containerRef, elementRef } = useDvdScreensaver({
    impactCallback: (count) => setColor(COLORS[count % COLORS.length]),
  });

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', height: '400px' }}>
      <div ref={elementRef} style={{ position: 'absolute', top: 0, left: 0 }}>
        <MyLogo fill={color} />
      </div>
    </div>
  );
}
```

### Pause and resume

```tsx
function MyComponent() {
  const [paused, setPaused] = useState(false);

  const { containerRef, elementRef } = useDvdScreensaver({ paused });

  return (
    <>
      <div ref={containerRef} style={{ position: 'relative', width: '100%', height: '400px' }}>
        <div ref={elementRef} style={{ position: 'absolute', top: 0, left: 0 }}>
          <MyLogo />
        </div>
      </div>
      <button onClick={() => setPaused((p) => !p)}>{paused ? 'Resume' : 'Pause'}</button>
    </>
  );
}
```

### Next.js App Router

Add the `'use client'` directive. The hook is SSR-safe and will not cause hydration mismatches.

```tsx
'use client';

import { useDvdScreensaver } from 'react-dvd-screensaver';

export default function ScreensaverPage() {
  const { containerRef, elementRef } = useDvdScreensaver({ speed: 3 });

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', height: '100vh' }}>
      <div ref={elementRef} style={{ position: 'absolute', top: 0, left: 0 }}>
        <MyLogo />
      </div>
    </div>
  );
}
```

## License

[MIT](LICENSE)
