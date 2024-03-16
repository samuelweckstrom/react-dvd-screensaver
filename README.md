# React DVD Screensaver

[![TypeScript](https://badges.frapsoft.com/typescript/code/typescript.svg?v=101)](https://github.com/ellerbrock/typescript-badges/)

DVD-era nostalgia in React.

[Demo](https://samuel.weckstrom.xyz/react-dvd-screensaver)

[Try the project on Stackblitz](https://stackblitz.com/~/github.com/samuelweckstrom/react-dvd-screensaver)

<br>

```
npm i react-dvd-screensaver
```

<br>

## Use hook

To add a DVD screensaver effect to your React components, you can use the useDvdScreensaver hook. This hook provides you with references for both the parent (container) and the child (moving element), along with the number of times the child has hit the edges of the container.
<br>

```typescript
import { useDvdScreensaver } from 'react-dvd-screensaver'

...

const { containerRef, elementRef } = useDvdScreensaver();

return (
  <div ref={containerRef}>
    <MyScreensaverComponent ref={elementRef} />
  </div>
)

```

Pass the `ref` objects for parent and child to their respective components. Just remember to set the dimensions for both of them, where the `childRef` component naturally is smaller than the parent so there is room for it to move around.

| Hook returns following:||
| ------------- | ------------- |
|`parentRef: refObject`| Ref of the parent container component|
|`elementRef: refObject`| Ref of the element to animate|
|`impactCount: number`| Number of times the element has hit the container edges|

<br>

### Hook Options

The hook accepts the following parameters:

| Option | Type | Description |
| ------------- | -------|-----|
|`speed`| `number` | Speed of the animation |
|`freezeOnHover`| `boolean` | Whether to pause the animation on hover |
|`hoverCallback`| `Function` | Callback function triggered on hover |

<br>

## Component

For easier implementation, you can also use the DvdScreensaver component to wrap any child component with the DVD screensaver effect.

<br>

```typescript
import { DvdScreensaver } from 'react-dvd-screensaver'

...

return (
  <div className="screensaver-container">
    <DvdScreensaver>
      <MyScreensaverComponent />
    </DvdScreensaver>
  </div>
)
```

The component inherits the parent container's dimensions by default, but you can also specify dimensions or styling directly via props.

<br>

### Props

| Prop         | Type | Description |
| ------------- | ------| -----|
|`className`| `string` | Optional CSS class for the container |
|`freezeOnHover`| `boolean` | Pause animation when hovered |
|`height`| `number` | Optional height for the container |
|`width`| `number` | Optional width for the container |
|`hoverCallback|`Function` | Callback function triggered on hover |
|`impactCallback`|`(count: number) => void`|Callback function triggered on impact with edges |
|`speed`|`number`| Speed of the animation |

## License

[MIT](LICENSE)
