# egg-typegoose

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][codecov-image]][codecov-url]
[![David deps][david-image]][david-url]
[![Known Vulnerabilities][snyk-image]][snyk-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/egg-typegoose.svg?style=flat-square
[npm-url]: https://npmjs.org/package/egg-typegoose
[travis-image]: https://img.shields.io/travis/eggjs/egg-typegoose.svg?style=flat-square
[travis-url]: https://travis-ci.org/eggjs/egg-typegoose
[codecov-image]: https://img.shields.io/codecov/c/github/eggjs/egg-typegoose.svg?style=flat-square
[codecov-url]: https://codecov.io/github/eggjs/egg-typegoose?branch=master
[david-image]: https://img.shields.io/david/eggjs/egg-typegoose.svg?style=flat-square
[david-url]: https://david-dm.org/eggjs/egg-typegoose
[snyk-image]: https://snyk.io/test/npm/egg-typegoose/badge.svg?style=flat-square
[snyk-url]: https://snyk.io/test/npm/egg-typegoose
[download-image]: https://img.shields.io/npm/dm/egg-typegoose.svg?style=flat-square
[download-url]: https://npmjs.org/package/egg-typegoose

<!--
Description here.
-->

## Install

```bash
$ npm i egg-typegoose --save
```

## Usage

```js
// {app_root}/config/plugin.js
exports.typegoose = {
  enable: true,
  package: 'egg-typegoose',
};
```

## Configuration

```js
// {app_root}/config/config.default.js
exports.typegoose = {
    url: '',
    options: {},  // 参考mongoose的options
    modelWhitelist: [],  // 忽略的模型。
    modelFilePath: 'app/model',  // 需要手动在typings下建立相同目录，并创建index.d.ts文件。后续在项目启动时会自动生成
};
```



see [config/config.default.js](config/config.default.js) for more detail.

## License

[MIT](LICENSE)
