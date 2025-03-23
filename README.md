<div align="center">
  <img width="500" height="160" src="assets/logo.svg">
</div>

# glTF Loader for Webpack 5

A glTF model loader for Webpack that automatically bundles buffers and images referenced in .gltf files. Compatible with Webpack 5.52.0+.

Public path is supported for both external and inline imports.

## Getting started

```sh
npm install --save-dev @neeh/gltf-loader
```

**webpack.config.js**

```js
module.exports = {
  output: {
    publicPath: '',
    assetModuleFilename: 'assets/[name].[hash:8][ext]'
  }
  module: {
    rules: [
      {
        test: /\.(bin|png|jpe?g)$/,
        type: 'asset/resource',
      },
      {
        test: /\.gltf$/,
        use: {
          loader: '@neeh/gltf-loader',
          options: {
            name: 'assets/[name].[hash:8].[ext]'
          }
        }
      },
    ]
  }
};
```

## Options

 - **[`inline`](#inline)**
 - **[`name`](#name)**
 - **[`context`](#context)**
 - **[`regExp`](#regExp)**

### `inline`

Type: `boolean`<br>
Default: `false`

Whether to inject the glTF content inside the bundle.

Example:

```js
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import cube from './assets/cube.gltf';

console.log(cube.images); // glTF content is directly accessible

const loader = new GLTFLoader();
loader.parse(cube, '', gltf => {
  const scene = gltf.scene;
});
```

**webpack.config.js**

```js
{
  test: /\.gltf$/,
  use: {
    loader: '@neeh/gltf-loader',
    options: {
      inline: true
    }
  }
}
```

### `name`

Type: `string`<br>
Default: `"[contenthash].[ext]"`

The name pattern of the exported .gltf file. This name can include a folder.

Example:
```js
import cube from './cube.gltf';
```

**webpack.config.js**

```js
{
  test: /\.gltf$/,
  use: {
    loader: '@neeh/gltf-loader',
    options: {
      name: 'assets/[name].[hash:8].[ext]',
    }
  }
}
```

Will export:

```
assets/cube.a1b2c3d4.gltf
```

See [interpolateName](https://github.com/webpack/loader-utils#interpolatename) for more details.

### `context`

Type: `string`

Used to compute the relative path variable `[path]` of the `name` option.

Example:

```js
import cube from './src/assets/models/cube.gltf';
```

**webpack.config.js**

```js
{
  test: /\.gltf$/,
  use: {
    loader: '@neeh/gltf-loader',
    options: {
      name: '[path][name].[hash:8].[ext]',
      context: './src'
    }
  }
}
```


Will export:

```
assets/models/cube.a1b2c3d4.gltf
```

### `regExp`

Type: `RegExp`

Used to copy specific parts of the input path into the output path.

Example:

```js
import high from './lods/high/model.gltf';
import medium from './lods/medium/model.gltf';
import low from './lods/low/model.gltf';
```

**webpack.config.js**

```js
{
  test: /\.gltf$/,
  use: {
    loader: '@neeh/gltf-loader',
    options: {
      name: 'assets/model-[1].[hash:8].[ext]',
      regExp: /lods\/(.*)\/model\.gltf/
    }
  }
}
```

Will export:

```
assets/model-high.a1b2c3d4.gltf
assets/model-medium.w2x4y6z8.gltf
assets/model-low.e5f6g7h8.gltf
```

### Contributing

Contributions are welcome.

Please update the tests accordingly and make sure they pass:

```sh
npm test
```
