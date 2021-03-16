[npm]: https://img.shields.io/npm/v/@ian-sun/rollup-plugin-sass
[npm-url]: https://www.npmjs.com/package/@ian-sun/rollup-plugin-sass
[size]: https://packagephobia.now.sh/badge?p=@ian-sun/rollup-plugin-sass
[size-url]: https://packagephobia.now.sh/result?p=@ian-sun/rollup-plugin-sass

[![npm][npm]][npm-url]
[![size][size]][size-url]

# @ian-sun/rollup-plugin-sass

A Rollup plugin for seamless integration between Rollup and Sass.

## Install

Using npm:

```console
npm install --save-dev @ian-sun/rollup-plugin-sass
```

## Usage

Create a `rollup.config.js` [configuration file](https://www.rollupjs.org/guide/en/#configuration-files) and import the plugin:

```js
// rollup.config.js
import sass from '@ian-sun/rollup-plugin-sass';

export default {
  input: 'input.js',
  output: {
    dir: 'output',
  },
  plugins: [sass()],
};
```

Then call `rollup` either via the [CLI](https://www.rollupjs.org/guide/en/#command-line-reference) or the [API](https://www.rollupjs.org/guide/en/#javascript-api).

## Options

### `exclude`

Type: `string` | `Array<string>`<br>
Default: `null`

A [minimatch pattern](https://github.com/isaacs/minimatch), or array of patterns, which specifies the files in the build the plugin should _ignore_. By default no files are ignored.

### `include`

Type: `string` | `Array<string>`<br>
Default: `["**/*.sass", "**/*.scss"]`

A [minimatch pattern](https://github.com/isaacs/minimatch), or array of patterns, which specifies the files in the build the plugin should operate on. By default all `sass` and `scss` files are targeted.

### `functions`

Type: `Record<string, Function>`<br>
Default: `null`

The Sass [functions](https://sass-lang.com/documentation/js-api#functions) option, which defines additional built-in Sass functions that are available in all stylesheets.

## License

[LICENSE (MIT)](/LICENSE)
