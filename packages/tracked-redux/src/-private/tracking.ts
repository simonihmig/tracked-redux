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
