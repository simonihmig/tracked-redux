import { module, test } from 'qunit';
import { createStore } from 'tracked-redux';
import {
  createCache as _createCache,
  getValue,
} from '@glimmer/tracking/primitives/cache';

const CACHE_CALL_COUNTS = new WeakMap();

function callCount(cache) {
  return CACHE_CALL_COUNTS.get(cache);
}

function createCache(fn) {
  let cache = _createCache(() => {
    CACHE_CALL_COUNTS.set(cache, CACHE_CALL_COUNTS.get(cache) + 1);

    return fn();
  });

  CACHE_CALL_COUNTS.set(cache, 0);

  return cache;
}

module('Unit | basic', () => {
  module('primitive root', () => {
    test('redux works', (assert) => {
      let store = createStore((state = 0) => ++state);

      store.dispatch({ type: 'INCREMENT' });

      assert.equal(store.getState(), 2, 'value is correct');
    });

    test('caching works', (assert) => {
      let store = createStore((state = 0) => ++state);

      let cache = createCache(() => store.getState());

      assert.equal(getValue(cache), 1, 'initial value is correct');
      assert.equal(callCount(cache), 1, 'cache call count correct');

      store.dispatch({ type: 'INCREMENT' });

      assert.equal(getValue(cache), 2, 'initial value is correct');
      assert.equal(callCount(cache), 2, 'cache call count correct');
    });
  });

  module('object root', () => {
    test('object updates correctly, does not invalidate cache', (assert) => {
      let count = 0;

      let store = createStore((state = { static: 123 }) => {
        count++;

        return { ...state, count };
      });

      let cache = createCache(() => store.getState());

      assert.deepEqual(
        getValue(cache),
        { static: 123, count: 1 },
        'initial value is correct'
      );
      assert.equal(callCount(cache), 1, 'cache call count correct');

      store.dispatch({ type: 'INCREMENT' });

      assert.deepEqual(
        getValue(cache),
        { static: 123, count: 2 },
        'initial value is correct'
      );
      assert.equal(callCount(cache), 1, 'cache call count correct');
    });

    test('cache updates correctly if dynamic value used', (assert) => {
      let count = 0;

      let store = createStore((state = { static: 123 }) => {
        count++;

        return { ...state, count };
      });

      let cache = createCache(() => store.getState().count);

      assert.deepEqual(getValue(cache), 1, 'initial value is correct');
      assert.equal(callCount(cache), 1, 'cache call count correct');

      store.dispatch({ type: 'INCREMENT' });

      assert.deepEqual(getValue(cache), 2, 'initial value is correct');
      assert.equal(callCount(cache), 2, 'cache call count correct');
    });

    test('cache not invalidated if static value used', (assert) => {
      let count = 0;

      let store = createStore((state = { static: 123 }) => {
        count++;

        return { ...state, count };
      });

      let cache = createCache(() => store.getState().static);

      assert.deepEqual(getValue(cache), 123, 'initial value is correct');
      assert.equal(callCount(cache), 1, 'cache call count correct');

      store.dispatch({ type: 'INCREMENT' });

      assert.deepEqual(getValue(cache), 123, 'initial value is correct');
      assert.equal(callCount(cache), 1, 'cache call count correct');
    });

    test('cache invalidated correctly if collection used and keys changed', (assert) => {
      let count = 0;

      let store = createStore((state = {}) => {
        count++;

        return { ...state, [count]: count };
      });

      let cache = createCache(() => Object.keys(store.getState()));

      assert.deepEqual(getValue(cache), ['1'], 'initial value is correct');
      assert.equal(callCount(cache), 1, 'cache call count correct');

      store.dispatch({ type: 'INCREMENT' });

      assert.deepEqual(getValue(cache), ['1', '2'], 'initial value is correct');
      assert.equal(callCount(cache), 2, 'cache call count correct');
    });

    test('cache invalidated correctly if collection used and keys changed, same number of keys', (assert) => {
      let count = 0;

      let store = createStore(() => {
        if (count === 0) {
          count++;
          return { foo: 123 };
        } else {
          return { bar: 123 };
        }
      });

      let cache = createCache(() => Object.keys(store.getState()));

      assert.deepEqual(getValue(cache), ['foo'], 'initial value is correct');
      assert.equal(callCount(cache), 1, 'cache call count correct');

      store.dispatch({ type: 'INCREMENT' });

      assert.deepEqual(getValue(cache), ['bar'], 'initial value is correct');
      assert.equal(callCount(cache), 2, 'cache call count correct');
    });
  });

  module('array root', () => {
    test('array updates correctly, does not invalidate cache', (assert) => {
      let count = 0;

      let store = createStore((state = []) => {
        return [...state, ++count];
      });

      let cache = createCache(() => store.getState());

      assert.deepEqual(getValue(cache), [1], 'initial value is correct');
      assert.equal(callCount(cache), 1, 'cache call count correct');

      store.dispatch({ type: 'INCREMENT' });

      assert.deepEqual(getValue(cache), [1, 2], 'initial value is correct');
      assert.equal(callCount(cache), 1, 'cache call count correct');
    });

    test('cache updates correctly if dynamic value used', (assert) => {
      let count = 0;

      let store = createStore(() => {
        return [++count];
      });

      let cache = createCache(() => store.getState()[0]);

      assert.deepEqual(getValue(cache), 1, 'initial value is correct');
      assert.equal(callCount(cache), 1, 'cache call count correct');

      store.dispatch({ type: 'INCREMENT' });

      assert.deepEqual(getValue(cache), 2, 'initial value is correct');
      assert.equal(callCount(cache), 2, 'cache call count correct');
    });

    test('cache not invalidated if static value used', (assert) => {
      let count = 0;

      let store = createStore(() => {
        count++;

        return [123, ++count];
      });

      let cache = createCache(() => store.getState()[0]);

      assert.deepEqual(getValue(cache), 123, 'initial value is correct');
      assert.equal(callCount(cache), 1, 'cache call count correct');

      store.dispatch({ type: 'INCREMENT' });

      assert.deepEqual(getValue(cache), 123, 'initial value is correct');
      assert.equal(callCount(cache), 1, 'cache call count correct');
    });

    test('cache invalidated correctly if iteration used and items added', (assert) => {
      let count = 0;

      let store = createStore((state = []) => {
        return [...state, ++count];
      });

      let cache = createCache(() => store.getState().map((v) => v + 1));

      assert.deepEqual(getValue(cache), [2], 'initial value is correct');
      assert.equal(callCount(cache), 1, 'cache call count correct');

      store.dispatch({ type: 'INCREMENT' });

      assert.deepEqual(getValue(cache), [2, 3], 'initial value is correct');
      assert.equal(callCount(cache), 2, 'cache call count correct');
    });

    test('cache invalidated correctly if iteration used and items changed', (assert) => {
      let count = 0;

      let store = createStore(() => {
        return [++count];
      });

      let cache = createCache(() => store.getState().map((v) => v + 1));

      assert.deepEqual(getValue(cache), [2], 'initial value is correct');
      assert.equal(callCount(cache), 1, 'cache call count correct');

      store.dispatch({ type: 'INCREMENT' });

      assert.deepEqual(getValue(cache), [3], 'initial value is correct');
      assert.equal(callCount(cache), 2, 'cache call count correct');
    });
  });

  module('nested values', () => {
    test('object updates correctly, does not invalidate cache', (assert) => {
      let store = createStore((state = { arr: [{ foo: 123 }] }, { update }) => {
        return { ...state, ...update };
      });

      let cache = createCache(() => store.getState());

      assert.deepEqual(
        getValue(cache),
        { arr: [{ foo: 123 }] },
        'initial value is correct'
      );
      assert.equal(callCount(cache), 1, 'cache call count correct');

      store.dispatch({ type: 'UPDATE', update: { arr: [{ foo: 456 }] } });

      assert.deepEqual(
        getValue(cache),
        { arr: [{ foo: 456 }] },
        'initial value is correct'
      );
      assert.equal(callCount(cache), 1, 'cache call count correct');
    });

    test('cache updates correctly if dynamic value used', (assert) => {
      let store = createStore((state = { arr: [{ foo: 123 }] }, { update }) => {
        return { ...state, ...update };
      });

      let cache = createCache(() => store.getState().arr[0].foo);

      assert.deepEqual(getValue(cache), 123, 'initial value is correct');
      assert.equal(callCount(cache), 1, 'cache call count correct');

      store.dispatch({ type: 'UPDATE', update: { arr: [{ foo: 456 }] } });

      assert.deepEqual(getValue(cache), 456, 'initial value is correct');
      assert.equal(callCount(cache), 2, 'cache call count correct');
    });

    test('cache not invalidated if static value used', (assert) => {
      let store = createStore(
        (state = { arr: [{ foo: 123 }, { bar: 456 }] }, { update }) => {
          return {
            arr: [
              ...state.arr.map((obj) => {
                if (obj.foo) {
                  return { ...obj, update };
                }

                return obj;
              }),
            ],
          };
        }
      );

      let cache = createCache(() => store.getState().arr[1].bar);

      assert.deepEqual(getValue(cache), 456, 'initial value is correct');
      assert.equal(callCount(cache), 1, 'cache call count correct');

      store.dispatch({ type: 'UPDATE', update: { foo: 321 } });

      assert.deepEqual(getValue(cache), 456, 'initial value is correct');
      assert.equal(callCount(cache), 1, 'cache call count correct');
    });
  });
});
