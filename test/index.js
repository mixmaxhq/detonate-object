const detonate = require('..');
const expect = require('chai').expect;

const collected = (object) => Array.from(detonate(object));

describe('detonate-object', function() {
  it('should produce a single object', function() {
    const val = { some: 'random', object: new Date() };
    expect(collected(val)).to.deep.equal([val]);
  });

  it('should produce each object', function() {
    const val = {
      some: { $each: ['random', 'other'] },
      object: 42,
    };

    expect(collected(val)).to.have.same.deep.members([
      { some: 'random', object: 42 },
      { some: 'other', object: 42 },
    ]);
  });

  it('should produce many objects', function() {
    const date = new Date();
    const val = {
      some: { $each: ['random', 'other'] },
      object: { $each: [date, 42] },
    };

    expect(collected(val)).to.have.same.deep.members([
      { some: 'random', object: date },
      { some: 'other', object: date },
      { some: 'random', object: 42 },
      { some: 'other', object: 42 },
    ]);
  });

  it('should produce deep objects', function() {
    const date = new Date();
    const val = {
      some: { $each: ['random', 'other'] },
      array: [{ better: { $each: [date, 42] } }],
    };

    expect(collected(val)).to.have.same.deep.members([
      { some: 'random', array: [{ better: date }] },
      { some: 'other', array: [{ better: date }] },
      { some: 'random', array: [{ better: 42 }] },
      { some: 'other', array: [{ better: 42 }] },
    ]);
  });

  it('should merge into the object itself', function() {
    const val = {
      $each: [{ top: 'key' }, { still: 'top' }, 'cannot merge me!'],
      also: 'top',
    };

    expect(collected(val)).to.have.same.deep.members([
      { top: 'key', also: 'top' },
      { also: 'top', still: 'top' },
      'cannot merge me!',
    ]);
  });

  it('should merge with inner expansions', function() {
    const val = {
      $each: [{ top: 'key' }, { still: 'top' }],
      also: 'top',
      inner: { $each: ['a', 'b'] },
    };

    expect(collected(val)).to.have.same.deep.members([
      { also: 'top', top: 'key', inner: 'a' },
      { also: 'top', still: 'top', inner: 'a' },
      { also: 'top', top: 'key', inner: 'b' },
      { also: 'top', still: 'top', inner: 'b' },
    ]);
  });

  it('should support unequal nested expands', function() {
    const val = {
      $each: [
        { top: 'key', test: { $each: [4, 5, 6] } },
        { still: 'top', another: { $each: [3, 4] } },
      ],
      also: 'top',
      inner: { $each: ['a', 'b'] },
    };

    expect(collected(val)).to.have.same.deep.members([
      { also: 'top', top: 'key', inner: 'a', test: 4 },
      { also: 'top', top: 'key', inner: 'a', test: 5 },
      { also: 'top', top: 'key', inner: 'a', test: 6 },
      { also: 'top', still: 'top', inner: 'a', another: 3 },
      { also: 'top', still: 'top', inner: 'a', another: 4 },
      { also: 'top', top: 'key', inner: 'b', test: 4 },
      { also: 'top', top: 'key', inner: 'b', test: 5 },
      { also: 'top', top: 'key', inner: 'b', test: 6 },
      { also: 'top', still: 'top', inner: 'b', another: 3 },
      { also: 'top', still: 'top', inner: 'b', another: 4 },
    ]);
  });

  it('should not produce values for a merge conflicted key', function() {
    const val = {
      $each: [{ inner: 42 }, { hasnoconflict: true }],
      inner: { $each: ['a', 'b', 'd'] },
    };

    expect(collected(val)).to.have.same.deep.members([
      { inner: 42 },
      { inner: 'a', hasnoconflict: true },
      { inner: 'b', hasnoconflict: true },
      { inner: 'd', hasnoconflict: true },
    ]);
  });

  it('should still produce a value with an empty options array', function() {
    const val = {
      $each: [],
      value: true,
    };

    expect(collected(val)).to.have.same.deep.members([{ value: true }]);
  });

  it('should support nested top-level expanders', function() {
    const val = {
      $each: [
        {
          $each: [1, 2],
        },
        {
          $each: [3, 4],
        },
      ],
    };

    expect(collected(val)).to.have.same.deep.members([1, 2, 3, 4]);
  });

  it('should expand strings', function() {
    const val = {
      str: { $each: 'string' },
    };
    expect(collected(val)).to.have.same.deep.members([
      { str: 's' },
      { str: 't' },
      { str: 'r' },
      { str: 'i' },
      { str: 'n' },
      { str: 'g' },
    ]);
  });

  it('should support custom iterables', function() {
    function* generator() {
      yield 'hello';
      yield 'world';
    }

    const iterable = {
      [Symbol.iterator]() {
        return generator();
      },
    };

    const val = {
      msg: { $each: iterable },
      extra: 'data',
    };

    expect(collected(val)).to.have.same.deep.members([
      { msg: 'hello', extra: 'data' },
      { msg: 'world', extra: 'data' },
    ]);
  });

  it('should expand all the items of an array', function() {
    const val = [{ $each: [1, 2, 3] }, { $each: [4, 5] }];

    expect(collected(val)).to.have.same.deep.members([
      [1, 4],
      [1, 5],
      [2, 4],
      [2, 5],
      [3, 4],
      [3, 5],
    ]);
  });

  it('should recursively resolve masking', function() {
    const val = {
      $each: [
        {
          $each: [
            {
              property: 'deep',
            },
          ],
        },
        {
          property: 'less-deep',
        },
      ],
      property: { $each: ['shallow', 'also-shallow'] },
    };

    expect(collected(val)).to.have.same.deep.members([
      { property: 'deep' },
      { property: 'less-deep' },
    ]);
  });
});
