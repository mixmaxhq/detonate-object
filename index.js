const sentinel = Object.create(null);
const hasOwn = Object.prototype.hasOwnProperty;
const toString = Object.prototype.toString;

const specialTypes = new Set(
  ['Arguments', 'Function', 'Number', 'Date', 'RegExp'].map((type) => `[object ${type}]`)
);

/**
 * Check if the given object is a special type of primitive that we should
 * not recurse into.
 *
 * Precondition: object is truthy.
 *
 * @param {*} object
 * @returns {Boolean}
 */
function isRealObject(object) {
  return typeof object === 'object' && !specialTypes.has(toString.call(object));
}

/**
 * Return a copy of the given object without the given fields.
 *
 * @param {Object} object The object to copy/omit from.
 * @param {...String} fields The fields to omit.
 * @returns {Object}
 */
function omit(object, ...fields) {
  const fieldSet = new Set(fields);
  const obj = {};
  for (const key in object) {
    if (hasOwn.call(object, key) && !fieldSet.has(key)) {
      obj[key] = object[key];
    }
  }
  return obj;
}

/**
 * Generate copies of the given object, where the $each declarations expand
 * combinatorially.
 *
 * @param {Object} object The object to expand.
 * @yields {Object} An expanded object from the generated set of objects.
 */
function* detonate(object) {
  // Do yield* instead of returning directly in case the object is not expandable and thus the
  // return value from expand is an array.
  yield* expand(object);
}

/**
 * Expand the given object, and return an iterable or iterator that produces the expansion of all
 * nested $each declarations.
 *
 * @param {*} object The value to expand. If it's an array, we expand each item in the array.
 * @returns {Iterable<*>|Iterator<*>}
 */
function expand(object) {
  if (!object) {
    return [object];
  }

  if (Array.isArray(object)) {
    return expandArray(object);
  }

  if (isRealObject(object)) {
    const options = object.$each;
    if (hasOwn.call(object, '$each') && (options.length >= 0 || Symbol.iterator in options)) {
      return expander(object);
    }

    return expandObject(object);
  }

  return [object];
}

/**
 * Expand all the items in the given array.
 *
 * @param {Array} array The array to expand.
 * @returns {Iterable<Array>|Iterator<Array>}
 */
function expandArray(array) {
  return expandItems(array, 0);
}

/**
 * @param {Array} array The array to expand.
 * @param {Number} driver The position to expand from. This recursively increments.
 * @yields {Array} Each expanded array variation given the $each declarations contained within.
 */
function* expandItems(array, driver) {
  if (driver < array.length) {
    const item = array[driver];
    for (const variation of expand(item)) {
      for (const downstream of expandItems(array, driver + 1)) {
        // TODO: this is probably a really inefficient pattern.
        yield [variation, ...downstream];
      }
    }
  } else {
    yield [];
  }
}

/**
 * @param {Object} object The object to expand.
 * @yields {Object} Each expanded object variation.
 */
function* expandObject(object) {
  const fields = Object.getOwnPropertyNames(object);
  const values = fields.map((field) => object[field]);
  for (const variation of expandItems(values, 0)) {
    const obj = {};
    for (let i = 0; i < fields.length; ++i) {
      obj[fields[i]] = variation[i];
    }
    yield obj;
  }
}

/**
 * Does the crucial work of expanding each of the possible $each options.
 *
 * Precondition: object has a $each property with a non-negative integer length or is iterable.
 *
 * @param {Object} object The object with a $each property (and possible other fields).
 * @yields {*} Items that match the types of the items in the $each array.
 */
function* expander(object) {
  const options = object.$each;

  // While this is technically incorrect, leaving it out would result in unexpected behavior. Let's
  // not surprise the developer. We use length === 0
  if (options.length === 0) {
    yield* expand(omit(object, '$each'));
    return;
  }

  for (const option of options) {
    if (!option || !isRealObject(option)) {
      yield* expand(option);
      continue;
    }

    // Merge the object back together, and expand it.
    const obj = Object.assign({}, object, { $each: sentinel }, option);
    if (obj.$each === sentinel) {
      delete obj.$each;
    }
    yield* expand(obj);
  }
}

module.exports = detonate;
