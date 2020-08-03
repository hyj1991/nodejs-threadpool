# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [1.3.0](https://github.com/theanarkh/nodejs-threadpool/compare/v1.0.1...v1.3.0) (2020-08-03)


### Features

* 支持过载时自动拓展线程数 \n 如果任务繁重，则根据配置，动态增加线程，如果每个平均超过3个任务则新增线程 \n ([e7e3fb4](https://github.com/theanarkh/nodejs-threadpool/commit/e7e3fb47f080b6c57d7520c51b02b9065886c2f2))
* **threadPool:** 修改变量名称 ([f54ece1](https://github.com/theanarkh/nodejs-threadpool/commit/f54ece128e8f560ad2561ee7794d61e906bc270a))
* **threadPool:** 修改配置 ([bc1346b](https://github.com/theanarkh/nodejs-threadpool/commit/bc1346bbd0a8e79bbb4a4b58125a19cd5bfe2521))


### Bug Fixes

* fix selectThread & handle error ([f43b140](https://github.com/theanarkh/nodejs-threadpool/commit/f43b1401a50f9762267d641cb97bd370d77f4fad))

## [1.2.0](https://github.com/theanarkh/nodejs-threadpool/compare/v1.1.0...v1.2.0) (2020-08-03)


### Features

* **threadPool:** 修改变量名称 ([f54ece1](https://github.com/theanarkh/nodejs-threadpool/commit/f54ece128e8f560ad2561ee7794d61e906bc270a))

## [1.1.0](https://github.com/theanarkh/nodejs-threadpool/compare/v1.0.1...v1.1.0) (2020-08-03)


### Features

* 支持过载时自动拓展线程数， 如果任务繁重，则根据配置，动态增加线程，如果每个平均超过3个任务则新增线程 ([e7e3fb4](https://github.com/theanarkh/nodejs-threadpool/commit/e7e3fb47f080b6c57d7520c51b02b9065886c2f2))
* **threadPool:** 修改配置 ([bc1346b](https://github.com/theanarkh/nodejs-threadpool/commit/bc1346bbd0a8e79bbb4a4b58125a19cd5bfe2521))

### 1.0.1 (2020-08-03)
