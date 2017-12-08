const sentinel = Object.create(null);
const hasOwn = Object.prototype.hasOwnProperty;
const toString = Object.prototype.toString;

const specialTypes = new Set(['Arguments', 'Function', 'Number', 'Date', 'RegExp']
  .map((type) => `[object ${type}]`));

function isRealObject(object) {
  return typeof object === 'object' && !specialTypes.has(toString.call(object));
}

function* detonate(object) {
  for (let i = 0;; ++i) {
    const obj = detonateAt(object, i);
    if (obj === sentinel) return;
    yield obj;
  }
}

function detonateAt(object, index) {
  const box = {value: index};
  const result = expandInner(object, box);
  return box.value > 0 ? sentinel : result;
}

function expandPlain(object, globalIndex) {
  const obj = {};
  for (const key in object) {
    if (hasOwn.call(object, key) && key !== '$each') {
      obj[key] = expandInner(object[key], globalIndex);
    }
  }
  return obj;
}

function expandInner(object, globalIndex) {
  if (object) {
    if (Array.isArray(object)) {
      return object.map((value) => expandInner(value, globalIndex));
    }

    if (isRealObject(object)) {
      const options = object.$each;
      if (!hasOwn.call(object, '$each') || !(options.length > 0)) {
        return expandPlain(object, globalIndex);
      }

      const index = globalIndex.value % options.length;
      globalIndex.value = (globalIndex.value - index) / options.length;
      const option = options[index];

      return expandInner(option, globalIndex);
    }
  }

  return object;
}

module.exports = detonate;
