import Service from '@ember/service';
import { action, get, notifyPropertyChange } from '@ember/object';
import {
  createStore,
  setConsumeCollection,
  setDirtyCollection,
} from 'tracked-redux';
import rootReducer from '../reducers';

setConsumeCollection((obj) => get(obj, '[]'));
setDirtyCollection((obj) => notifyPropertyChange(obj, '[]'));

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
