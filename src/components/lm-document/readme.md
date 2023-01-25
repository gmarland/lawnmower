# lm-document



<!-- Auto Generated Below -->


## Properties

| Property                   | Attribute                    | Description | Type      | Default       |
| -------------------------- | ---------------------------- | ----------- | --------- | ------------- |
| `controllerGuides`         | `controller-guides`          |             | `boolean` | `true`        |
| `defaultPlacementLocation` | `default-placement-location` |             | `number`  | `500`         |
| `id`                       | `id`                         |             | `string`  | `""`          |
| `shadowsEnabled`           | `shadows-enabled`            |             | `boolean` | `true`        |
| `skyboxColor`              | `skybox-color`               |             | `string`  | `"#efefef"`   |
| `skyboxOpacity`            | `skybox-opacity`             |             | `number`  | `1`           |
| `title`                    | `title`                      |             | `string`  | `"Lawnmower"` |
| `titlecardBackground`      | `titlecard-background`       |             | `string`  | `"#222222"`   |
| `titlecardBackgroundImage` | `titlecard-background-image` |             | `string`  | `null`        |
| `titlecardFontColor`       | `titlecard-font-color`       |             | `string`  | `"#EEEFF3"`   |
| `titlecardFontFamily`      | `titlecard-font-family`      |             | `string`  | `"Arial"`     |
| `titlecardFontSize`        | `titlecard-font-size`        |             | `string`  | `"4em"`       |
| `vrEnabled`                | `vr-enabled`                 |             | `boolean` | `true`        |


## Methods

### `closeModal() => Promise<void>`



#### Returns

Type: `Promise<void>`



### `getCamera() => Promise<SceneCamera>`



#### Returns

Type: `Promise<SceneCamera>`



### `getLighting() => Promise<Lighting>`



#### Returns

Type: `Promise<Lighting>`



### `getRenderer() => Promise<Renderer>`



#### Returns

Type: `Promise<Renderer>`



### `getScene() => Promise<Scene>`



#### Returns

Type: `Promise<Scene>`



### `setLayout(layoutId: string) => Promise<void>`



#### Returns

Type: `Promise<void>`



### `showModal(id: string) => Promise<void>`



#### Returns

Type: `Promise<void>`




----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
