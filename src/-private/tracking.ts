import { tracked } from '@glimmer/tracking';

class Tag {
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

const COLLECTION_TAG_MAP = new WeakMap();

export let consumeCollection = (obj: object): void => {
  let tag = COLLECTION_TAG_MAP.get(obj);

  if (tag === undefined) {
    tag = createTag();

    COLLECTION_TAG_MAP.set(obj, tag);
  }

  consumeTag(tag);
};

export let dirtyCollection = (obj: object): void => {
  const tag = COLLECTION_TAG_MAP.get(obj);

  if (tag !== undefined) {
    dirtyTag(tag);
  }
};

export function setConsumeCollection(fn: (obj: object) => void): void {
  consumeCollection = fn;
}

export function setDirtyCollection(fn: (obj: object) => void): void {
  dirtyCollection = fn;
}
