import { module, test } from 'qunit';

import { DEBUG } from '@glimmer/env';
import { tracked } from '@glimmer/tracking';
import { createCache, getValue, isConst } from '@glimmer/tracking/primitives/cache';

class Tag {
  @tracked __tag__;
}

function createTag() {
  return new Tag();
}

function consumeTag(tag) {
  tag.__tag__;
}

function dirtyTag(tag) {
  tag.__tag__ = undefined;
}

module('tracking cache', () => {
  test('it memoizes based on tags that are consumed within a track frame', assert => {
    let tag1 = createTag();
    let tag2 = createTag();
    let count = 0;

    let cache = createCache(() => {
      consumeTag(tag1);
      consumeTag(tag2);

      return ++count;
    });

    assert.equal(getValue(cache), 1, 'called correctly the first time');
    assert.equal(getValue(cache), 1, 'memoized result returned second time');

    dirtyTag(tag1);
    assert.equal(getValue(cache), 2, 'cache busted when tag1 dirtied');
    assert.equal(getValue(cache), 2, 'memoized result returned when nothing dirtied');

    dirtyTag(tag2);
    assert.equal(getValue(cache), 3, 'cache busted when tag2 dirtied');
    assert.equal(getValue(cache), 3, 'memoized result returned when nothing dirtied');
  });

  test('nested memoizations work, and automatically propogate', assert => {
    let innerTag = createTag();
    let outerTag = createTag();

    let innerCount = 0;
    let outerCount = 0;

    let innerCache = createCache(() => {
      consumeTag(innerTag);

      return ++innerCount;
    });

    let outerCache = createCache(() => {
      consumeTag(outerTag);

      return [++outerCount, getValue(innerCache)];
    });

    assert.deepEqual(
      getValue(outerCache),
      [1, 1],
      'both functions called correctly the first time'
    );
    assert.deepEqual(getValue(outerCache), [1, 1], 'memoized result returned correctly');

    dirtyTag(outerTag);

    assert.deepEqual(
      getValue(outerCache),
      [2, 1],
      'outer result updated, inner result still memoized'
    );
    assert.deepEqual(getValue(outerCache), [2, 1], 'memoized result returned correctly');

    dirtyTag(innerTag);

    assert.deepEqual(getValue(outerCache), [3, 2], 'both inner and outer result updated');
    assert.deepEqual(getValue(outerCache), [3, 2], 'memoized result returned correctly');
  });

  test('isConst allows users to check if a memoized function is constant', assert => {
    let tag = createTag();

    let constCache = createCache(() => {
      // do nothing;
    });

    let nonConstCache = createCache(() => {
      consumeTag(tag);
    });

    getValue(constCache);
    getValue(nonConstCache);

    assert.ok(isConst(constCache), 'constant cache returns true');
    assert.notOk(isConst(nonConstCache), 'non-constant cache returns false');
  });

  if (DEBUG) {
    test('isConst throws an error in DEBUG mode if users attempt to check a function before it has been called', assert => {
      let cache = createCache(() => {
        // do nothing;
      });

      assert.throws(
        () => isConst(cache),
        /isConst\(\) can only be used on a cache once getValue\(\) has been called at least once/
      );
    });

    test('isConst throws an error in DEBUG mode if users attempt to use with a non-cache', assert => {
      assert.throws(
        () => isConst(123),
        /isConst\(\) can only be used on an instance of a cache created with createCache\(\). Called with: 123/
      );
    });

    test('getValue throws an error in DEBUG mode if users to use with a non-cache', assert => {
      assert.throws(
        () => getValue(123),
        /getValue\(\) can only be used on an instance of a cache created with createCache\(\). Called with: 123/
      );
    });
  }
});
