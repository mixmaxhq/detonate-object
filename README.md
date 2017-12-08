detonate-object
===============

[![Build Status](https://travis-ci.org/mixmaxhq/detonate-object.svg?branch=master)](https://travis-ci.org/mixmaxhq/detonate-object)

Generates objects from an object with `$each` declarations in a combinatorial manner.

Has nothing to do with destroying objects.

Not particularly fast, but aims to be correct and unsurprising. Comparable to a
[naïve implementation][naive] with an incrementing variation offset.

Relies on language features available in Node from v6 on.

Install
-------

```sh
$ yarn add detonate-object
# or
$ npm install --save detonate-object
```

Usage
-----

```js
const detonate = require('detonate-object');

// We return an iterator from detonate. If you want an array, pass it to `Array.from`.
const iter = detonate({
  $each: [{
    browserName: 'safari',
    platform: 'macOS',
    version: {$each: [10, 11]}
  }, {
    browserName: {$each: ['firefox', 'chrome']},
    version: {$each: ['latest', 'latest-1']}
  }],
  platform: {$each: ['linux', 'macOS', 'windows']},
  build: 14
});

for (const obj of iter) {
  // loops over the following objects, in no particular order:
  { platform: 'linux',   browserName: 'chrome',  version: 'latest',   build: 14}
  { platform: 'linux',   browserName: 'chrome',  version: 'latest-1', build: 14}
  { platform: 'linux',   browserName: 'firefox', version: 'latest',   build: 14}
  { platform: 'linux',   browserName: 'firefox', version: 'latest-1', build: 14}
  { platform: 'macOS',   browserName: 'chrome',  version: 'latest',   build: 14}
  { platform: 'macOS',   browserName: 'chrome',  version: 'latest-1', build: 14}
  { platform: 'macOS',   browserName: 'firefox', version: 'latest',   build: 14}
  { platform: 'macOS',   browserName: 'firefox', version: 'latest-1', build: 14}
  { platform: 'macOS',   browserName: 'safari',  version: 10,         build: 14}
  { platform: 'macOS',   browserName: 'safari',  version: 11,         build: 14}
  { platform: 'windows', browserName: 'chrome',  version: 'latest',   build: 14}
  { platform: 'windows', browserName: 'chrome',  version: 'latest-1', build: 14}
  { platform: 'windows', browserName: 'firefox', version: 'latest',   build: 14}
  { platform: 'windows', browserName: 'firefox', version: 'latest-1', build: 14}
}
```

### Merge conflicts

detonate-object does guarantees that fields will be taken first from a top-level `$each` declaration, and then from the body.

```js
detonate({
  {$each: [{name: 'abc'}]},
  name: 'def'
});
// From the above, detonate-object will only produce this:
// {name: 'abc'}
// It will not produce this:
// {name: 'def'}
```

### Custom iterables

We can also use custom iterables:

```js
function* generator() {
  yield 'hello';
  yield 'world';
}

const iterable = {
  [Symbol.iterator]() {
    return generator();
  }
};

Array.from(detonate({
  msg: {$each: iterable},
  extra: 'data'
}));
// => [
//   {msg: 'hello', extra: 'data'},
//   {msg: 'world', extra: 'data'}
// ]
```

[naive]: https://github.com/mixmaxhq/detonate-object/blob/benchmarks/naive.js
