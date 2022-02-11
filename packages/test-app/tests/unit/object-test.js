import Component from '@glimmer/component';
import { createStore } from 'tracked-redux';

import { setupRenderingTest } from 'ember-qunit';
import { module } from 'qunit';
import { reactivityTest } from '../helpers/reactivity';
import { eachInReactivityTest } from '../helpers/collection-reactivity';

module('Object reactivity', function (hooks) {
  setupRenderingTest(hooks);

  eachInReactivityTest(
    '{{each-in}} works with new items',
    class extends Component {
      count = 0;
      store = createStore((state = {}) => ({ ...state, [this.count]: 0 }));

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
      store = createStore(() => ({ foo: ++this.count }));

      get collection() {
        return this.store.getState();
      }

      update() {
        this.store.dispatch({ type: 'INCREMENT' });
      }
    }
  );

  reactivityTest(
    'individual index',
    class extends Component {
      count = 0;
      store = createStore(() => ({ foo: ++this.count }));

      get value() {
        return this.store.getState().foo + 1;
      }

      update() {
        this.store.dispatch({ type: 'INCREMENT' });
      }
    }
  );

  reactivityTest(
    'iterating using for-in',
    class extends Component {
      count = 0;
      store = createStore((state = {}) => ({ ...state, [++this.count]: 0 }));

      get value() {
        let state = this.store.getState();

        let value = 0;

        for (let foo in state) {
          value = state[foo];
        }

        return value;
      }

      update() {
        this.store.dispatch({ type: 'PUSH' });
      }
    }
  );

  reactivityTest(
    'Object.keys',
    class extends Component {
      count = 0;
      store = createStore((state = {}) => ({ ...state, [++this.count]: 0 }));

      get value() {
        return Object.keys(this.store.getState()).join();
      }

      update() {
        this.store.dispatch({ type: 'PUSH' });
      }
    }
  );
});
