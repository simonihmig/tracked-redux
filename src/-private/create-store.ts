import {
  Action,
  createStore as reduxCreateStore,
  PreloadedState,
  Reducer,
  Store,
  StoreEnhancer,
} from 'redux';
import { createNode, updateNode } from './proxy';
import { Node } from './tracking';

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

  let rootNode: Node<{ state: S }>;
  const originalGetState = store.getState.bind(store);
  const ensureRootNode = (): void => {
    if (rootNode === undefined) {
      rootNode = createNode({
        state: originalGetState(),
      });
    }
  };

  store.getState = (): S => {
    ensureRootNode();
    return rootNode.proxy.state;
  };

  store.subscribe(() => {
    ensureRootNode();
    updateNode(rootNode, {
      state: originalGetState(),
    });
  });

  return store as Store<S & StateExt, A> & Ext;
}
