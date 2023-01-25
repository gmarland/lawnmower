# lm-image



<!-- Auto Generated Below -->


## Properties

| Property         | Attribute         | Description | Type            | Default     |
| ---------------- | ----------------- | ----------- | --------------- | ----------- |
| `borderRadius`   | `border-radius`   |             | `number`        | `0`         |
| `height`         | `height`          |             | `number`        | `undefined` |
| `id`             | `id`              |             | `string`        | `""`        |
| `modal`          | `modal`           |             | `boolean`       | `false`     |
| `offset`         | `offset`          |             | `number`        | `undefined` |
| `parent`         | --                |             | `ISceneElement` | `undefined` |
| `position`       | `position`        |             | `string`        | `undefined` |
| `sceneElement`   | --                |             | `LMImage`       | `undefined` |
| `sequenceNo`     | `sequence-no`     |             | `number`        | `undefined` |
| `shadowsEnabled` | `shadows-enabled` |             | `boolean`       | `true`      |
| `src`            | `src`             |             | `string`        | `undefined` |
| `visible`        | `visible`         |             | `boolean`       | `true`      |
| `vrEnabled`      | `vr-enabled`      |             | `boolean`       | `true`      |
| `width`          | `width`           |             | `number`        | `undefined` |


## Events

| Event             | Description | Type                  |
| ----------------- | ----------- | --------------------- |
| `click`           |             | `CustomEvent<any>`    |
| `showModalDialog` |             | `CustomEvent<string>` |


## Methods

### `destroy() => Promise<void>`



#### Returns

Type: `Promise<void>`



### `getSceneObject() => Promise<Group>`



#### Returns

Type: `Promise<Group>`




## Dependencies

### Used by

 - [lm-image](.)

### Depends on

- [lm-modal](../lm-modal)
- [lm-image](.)

### Graph
```mermaid
graph TD;
  lm-image --> lm-image
  style lm-image fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
