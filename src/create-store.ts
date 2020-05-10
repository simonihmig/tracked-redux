import {
  createStore as reduxCreateStore,
  Store,
  Reducer,
  Action,
  StoreEnhancer,
  PreloadedState,
} from 'redux';
import { createNode, updateNode } from './proxy';

export default function createStore<S, A extends Action, Ext, StateExt>(
  reducer: Reducer<S, A>,
  enhancer?: StoreEnhancer<Ext, StateExt>
): Store<S & StateExt, A> & Ext;

export default function createStore<S, A extends Action, Ext, StateExt>(
  reducer: Reducer<S, A>,
  preloadedState?: PreloadedState<S>,
  enhancer?: StoreEnhancer<Ext, StateExt>
): Store<S & StateExt, A> & Ext;

export default function createStore<S, A extends Action, Ext, StateExt>(
  reducer: Reducer<S, A>,
  preloadedState?: PreloadedState<S> | StoreEnhancer<Ext, StateExt>,
  enhancer?: StoreEnhancer<Ext, StateExt>
): Store<S & StateExt, A> & Ext {
  const store = reduxCreateStore(
    reducer,
    preloadedState as PreloadedState<S>,
    enhancer
  );

  const originalGetState = store.getState.bind(store);

  let rootNode;

  store.getState = (): S => {
    if (rootNode === undefined) {
      rootNode = createNode({
        state: originalGetState(),
      });
    }

    return rootNode.proxy.state;
  };

  store.subscribe(() => {
    updateNode(rootNode, {
      state: originalGetState(),
    });
  });

  return store as Store<S & StateExt, A> & Ext;
}
