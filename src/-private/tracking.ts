import { tracked } from '@glimmer/tracking';

export class Tag {
  @tracked private __tagValue__: undefined;

  static consumeTag(tag: Tag): void {
    // read the tag value
    tag.__tagValue__;
  }

  static dirtyTag(tag: Tag): void {
    // write the tag value
    tag.__tagValue__ = undefined;
  }
}

export function createTag(): Tag {
  return new Tag();
}

export const consumeTag = Tag.consumeTag;
export const dirtyTag = Tag.dirtyTag;

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

export let consumeCollection = (node: Node): void => {
  let tag = node.collectionTag;

  if (tag === null) {
    tag = node.collectionTag = createTag();
  }

  consumeTag(tag);
};

export let dirtyCollection = (node: Node): void => {
  const tag = node.collectionTag;

  if (tag !== null) {
    dirtyTag(tag);
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const Ember: any;

if (Ember !== undefined) {
  consumeCollection = (node): void => Ember.get(node.proxy, '[]');
  dirtyCollection = (node): void =>
    Ember.notifyPropertyChange(node.proxy, '[]');
}
