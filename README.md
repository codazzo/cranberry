# Cranberry
[![Build Status](https://travis-ci.org/codazzo/cranberry.svg?branch=master)](https://travis-ci.org/codazzo/cranberry)

<a href="http://promises-aplus.github.com/promises-spec"><img src="http://promises-aplus.github.com/promises-spec/assets/logo-small.png" align="right" /></a>

Cranberry is a [Promises/A+](https://github.com/promises-aplus/promises-spec) implementation written as a lightweight layer on top of `Promise` with additional features not in the [promises/a+ spec](https://promisesaplus.com/). It passes the [Promises/A+ Test Suite](https://github.com/promises-aplus/promises-tests).


## Rationale
If you have a browser baseline that includes most relatively recent [browsers](http://caniuse.com/#feat=promises) you can use `Promise` without a polyfill. This is great! Promise implementations have additional features that make them useful but the downside is that they can make stacks grow quite long. Cranberry works around this issue by using native promises under the hood.

## Installation

```bash
npm install cranberry
```

## Usage

```js
var Promise = require('cranberry'); //or give it any name you like
```

## API

### Prototype methods
#### .then(onFulfilled, onRejected)
See [MDN docs](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/then)
#### .catch(onRejected)
See [MDN docs](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/catch)
#### .catch(constructor, onRejected)
Like the call above, but it's only run is the rejection value of the promise it's called on is an instance of `constructor`.
#### .spread(onFulfilled)
Like then, but if the resolution value of the promise it's called on is an array, the it is used as the arguments array to `onFulfilled`.

```js
Promise.resolve([1, 2]).spread(function(one, two)){
    //one + two === 3
});
```

### Constructor methods
#### Promise.resolve(value)
See [MDN docs](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Promise/resolve)
#### Promise.reject(value)
See [MDN docs](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Promise/reject)
#### Promise.all(promises)
See [MDN docs](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Promise/all)

## License

[MIT](LICENSE)
