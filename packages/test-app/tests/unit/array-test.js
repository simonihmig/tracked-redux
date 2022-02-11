import Component from '@glimmer/component';
import { createStore } from 'tracked-redux';

import { setupRenderingTest } from 'ember-qunit';
import { module } from 'qunit';
import { reactivityTest } from '../helpers/reactivity';
import {
  eachReactivityTest,
  eachInReactivityTest,
} from '../helpers/collection-reactivity';

const ARRAY_GETTER_METHODS = [
  'concat',
  'entries',
  'every',
  'filter',
  'find',
  'findIndex',
  'flat',
  'flatMap',
  'forEach',
  'includes',
  'indexOf',
  'join',
  'keys',
  'lastIndexOf',
  'map',
  'reduce',
  'reduceRight',
  'slice',
  'some',
  'values',
];

module('Array reactivity', function (hooks) {
  setupRenderingTest(hooks);

  eachReactivityTest(
    '{{each}} works with new items',
    class extends Component {
      store = createStore((state = []) => [...state, 0]);

      get collection() {
        return this.store.getState();
      }

      update() {
        this.store.dispatch({ type: 'PUSH' });
      }
    }
  );

  eachReactivityTest(
    '{{each}} works when updating old items',
    class extends Component {
      count = 0;
      store = createStore(() => [++this.count]);

      get collection() {
        return this.store.getState();
      }

      update() {
        this.store.dispatch({ type: 'INCREMENT' });
      }
    }
  );

  eachInReactivityTest(
    '{{each-in}} works with new items',
    class extends Component {
      store = createStore((state = []) => [...state, 0]);

      get collection() {
        return this.store.getState();
      }

      update() {
        this.store.dispatch({ type: 'PUSH' });
      }
    }
  );

  eachInReactivityTest(
    '{{each-in}} works when updating old items',
    class extends Component {
      count = 0;
      store = createStore(() => [++this.count]);

      get collection() {
        return this.store.getState();
      }

      update() {
        this.store.dispatch({ type: 'INCREMENT' });
      }
    }
  );

  ARRAY_GETTER_METHODS.forEach((method) => {
    if (method !== 'keys') {
      reactivityTest(
        `${method} individual index`,
        class extends Component {
          count = 0;
          store = createStore(() => [++this.count]);

          get value() {
            let value = this.store.getState()[method](() => {});

            if (value && value.next) {
              value.next();
            }

            return value;
          }

          update() {
            this.store.dispatch({ type: 'INCREMENT' });
          }
        }
      );
    }

    reactivityTest(
      `${method} collection`,
      class extends Component {
        store = createStore((state = []) => [...state, 0]);

        get value() {
          let value = this.store.getState()[method](() => {});

          if (value && value.next) {
            value.next();
          }

          return value;
        }

        update() {
          this.store.dispatch({ type: 'PUSH' });
        }
      }
    );
  });
});
