import {
  createStorage,
  getValue,
  setValue,
  TrackedStorage,
} from 'ember-tracked-storage-polyfill';

export type Tag = TrackedStorage<unknown>;

export interface Node<
  T extends Array<unknown> | Record<string, unknown> =
    | Array<unknown>
    | Record<string, unknown>
> {
  collectionTag: Tag | null;
  tag: Tag | null;
  tags: Record<string, Tag>;
  children: Record<string, Node>;
  proxy: T;
  value: T;
}

const neverEq = () => false;

export function createTag(): Tag {
  return createStorage(null, neverEq);
}
export const consumeTag = getValue;
export function dirtyTag(tag: Tag): void {
  setValue(tag, null);
}

export let consumeCollection = (node: Node): void => {
  let tag = node.collectionTag;

  if (tag === null) {
    tag = node.collectionTag = createStorage(null, neverEq);
  }

  getValue(tag);
};

export let dirtyCollection = (node: Node): void => {
  const tag = node.collectionTag;

  if (tag !== null) {
    setValue(tag, null);
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const Ember: any;

if (Ember !== undefined) {
  consumeCollection = (node): void => Ember.get(node.proxy, '[]');
  dirtyCollection = (node): void =>
    Ember.notifyPropertyChange(node.proxy, '[]');
}
