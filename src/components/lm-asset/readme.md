# lm-asset



<!-- Auto Generated Below -->


## Properties

| Property          | Attribute          | Description | Type            | Default     |
| ----------------- | ------------------ | ----------- | --------------- | ----------- |
| `activeAnimation` | `active-animation` |             | `string`        | `undefined` |
| `id`              | `id`               |             | `string`        | `""`        |
| `offset`          | `offset`           |             | `number`        | `undefined` |
| `parent`          | --                 |             | `ISceneElement` | `undefined` |
| `position`        | `position`         |             | `string`        | `undefined` |
| `radius`          | `radius`           |             | `number`        | `undefined` |
| `sceneElement`    | --                 |             | `LMAsset`       | `undefined` |
| `sequenceNo`      | `sequence-no`      |             | `number`        | `undefined` |
| `shadowsEnabled`  | `shadows-enabled`  |             | `boolean`       | `true`      |
| `src`             | `src`              |             | `string`        | `undefined` |
| `visible`         | `visible`          |             | `boolean`       | `true`      |
| `vrEnabled`       | `vr-enabled`       |             | `boolean`       | `true`      |
| `xRotation`       | `x-rotation`       |             | `number`        | `0`         |
| `xRotationSpeed`  | `x-rotation-speed` |             | `number`        | `0`         |
| `yRotation`       | `y-rotation`       |             | `number`        | `0`         |
| `yRotationSpeed`  | `y-rotation-speed` |             | `number`        | `0`         |
| `zRotation`       | `z-rotation`       |             | `number`        | `0`         |
| `zRotationSpeed`  | `z-rotation-speed` |             | `number`        | `0`         |


## Events

| Event   | Description | Type               |
| ------- | ----------- | ------------------ |
| `click` |             | `CustomEvent<any>` |


## Methods

### `destroy() => Promise<void>`



#### Returns

Type: `Promise<void>`



### `getAnimationNames() => Promise<Array<string>>`



#### Returns

Type: `Promise<string[]>`



### `getSceneObject() => Promise<Group>`



#### Returns

Type: `Promise<Group>`




----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
