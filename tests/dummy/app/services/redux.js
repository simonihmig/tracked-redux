import Service from '@ember/service';
import { action } from '@ember/object';
import { createStore } from 'tracked-redux';
import rootReducer from '../reducers';

export default class ReduxService extends Service {
  #store = createStore(
    rootReducer,
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
  );

  get state() {
    return this.#store.getState();
  }

  @action
  dispatch(...args) {
    this.#store.dispatch(...args);
  }
}
