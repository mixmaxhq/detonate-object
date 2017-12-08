const naive = require('./naive');
const detonate = require('../');
const Benchmark = require('benchmark');

const suite = new Benchmark.Suite();

function drain(iterable) {
  let done;
  do {
    done = iterable.next().done;
  } while (!done);
}

suite.add('small w/naive', () => {
  drain(naive({
    a: {$each: [1, 2, 3, 4, 5]},
    b: {$each: [1, 2, 3, 4, 5]},
    c: {$each: [1, 2, 3, 4, 5]},
    d: {$each: [1, 2, 3, 4, 5]},
    e: {$each: [1, 2, 3, 4, 5]},
  }));
});

suite.add('small w/detonate', () => {
  drain(detonate({
    a: {$each: [1, 2, 3, 4, 5]},
    b: {$each: [1, 2, 3, 4, 5]},
    c: {$each: [1, 2, 3, 4, 5]},
    d: {$each: [1, 2, 3, 4, 5]},
    e: {$each: [1, 2, 3, 4, 5]},
  }));
});

suite.add('large w/naive', () => {
  drain(naive({
    a: {$each: [1, 2, 3, 4, 5]},
    b: {$each: [1, 2, 3, 4, 5]},
    c: {$each: [1, 2, 3, 4, 5]},
    d: {$each: [1, 2, 3, 4, 5]},
    e: {$each: [1, 2, 3, 4, 5]},
    f: {$each: [1, 2, 3, 4, 5]},
    g: {$each: [1, 2, 3, 4, 5]},
  }));
});

suite.add('large w/detonate', () => {
  drain(detonate({
    a: {$each: [1, 2, 3, 4, 5]},
    b: {$each: [1, 2, 3, 4, 5]},
    c: {$each: [1, 2, 3, 4, 5]},
    d: {$each: [1, 2, 3, 4, 5]},
    e: {$each: [1, 2, 3, 4, 5]},
    f: {$each: [1, 2, 3, 4, 5]},
    g: {$each: [1, 2, 3, 4, 5]},
  }));
});

suite.on('cycle', (event) => {
  console.log(String(event.target));
});

suite.on('complete', function() {
  const fastest = this.filter('fastest').map('name');
  console.log(`Fastest is ${fastest}`);
});

suite.run();
