# React DVD Screensaver

[![TypeScript](https://badges.frapsoft.com/typescript/code/typescript.svg?v=101)](https://github.com/ellerbrock/typescript-badges/)

That badass DVD screensaver as a React hook and component.

[Demo](https://codesandbox.io/s/react-dvd-screensaver-demo-mp563)

<br>

```
yarn add react-dvd-screensaver
```
<br>

## Use hook
<br>

```
import { useDvdScreensaver } from 'react-dvd-screensaver'

...

const dvdScreensaver = useDvdScreensaver();

return (
  <div ref={dvdScreensaver.parentRef}>
    <MyScreensaverComponent ref={dvdScreensaver.childRef} />
  </div>
)
```

Pass the `ref` objects for parent and child to their respective components. Just remember to set the dimensions for both of them, where the `childRef` component naturally is smaller than the parent so there is room for it to move around.

| Hook returns following:||
| ------------- | ------------- |
|`parentRef: refObject`| Ref of parent component|
|`childRef: refObject`| Ref of child component|
|`impactCount: number`| Number increment for each impact within parent element|

<br>

| Hook accepts following params:|
| ------------- |
|`speed: number`|
|`freezeOnHover: boolean`|

<br>
<br>

## Component
<br>

```
import { DvdScreensaver } from 'react-dvd-screensaver'

...

  return (
    <div className="screensaver-container">
      <DvdScreensaver>
        <MyScreenSaverComponent />
      </DvdScreensaver>
    </div>
  )
```
The component version will by default inherit the parent containers dimensions, but you can also pass your own styles to `DvdScreensaver` by passing a `className`, setting a style object or `height` and `width` -props.


<br>

| Props         |
| ------------- |
|`className?: string`|
|`freezeOnHover?: boolean`|
|`height?: number`|
|`width?: number`|
|`hoverCallback?: () => void`|
|`impactCallback?: (impactNumber<number>) => void`|
|`speed?: number`|
|`styles?: HTMLStyleElement`|

## License

[MIT](LICENSE)
