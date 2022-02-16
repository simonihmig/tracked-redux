import {
  createStorage,
  getValue as consumeTag,
  setValue,
  TrackedStorage,
} from 'ember-tracked-storage-polyfill';

export type Tag = TrackedStorage<unknown>;

const neverEq = (): boolean => false;

export function createTag(): Tag {
  return createStorage(null, neverEq);
}
export { consumeTag };
export function dirtyTag(tag: Tag): void {
  setValue(tag, null);
}

////////////

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

export const consumeCollection = (node: Node): void => {
  let tag = node.collectionTag;

  if (tag === null) {
    tag = node.collectionTag = createTag();
  }

  consumeTag(tag);
};

export const dirtyCollection = (node: Node): void => {
  const tag = node.collectionTag;

  if (tag !== null) {
    dirtyTag(tag);
  }
};
