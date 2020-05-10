import { tracked } from '@glimmer/tracking';
// import { get, notifyPropertyChange } from '@ember/object';

class Tag {
  @tracked private __tag_value__: undefined;

  static consumeTag(tag: Tag) {
    // read the tag value
    tag.__tag_value__;
  }

  static dirtyTag(tag: Tag) {
    // write the tag value
    tag.__tag_value__ = undefined;
  }
}

export function createTag() {
  return new Tag();
}

export const consumeTag = Tag.consumeTag;
export const dirtyTag = Tag.dirtyTag;

////////////

const COLLECTION_TAG_MAP = new WeakMap();

export function setConsumeCollection(fn: (obj: object) => void) {
  consumeCollection = fn;
}

export function setDirtyCollection(fn: (obj: object) => void) {
  dirtyCollection = fn;
}

export let consumeCollection = (obj: object) =>  {
  let tag = COLLECTION_TAG_MAP.get(obj);

  if (tag === undefined) {
    tag = createTag();

    COLLECTION_TAG_MAP.set(obj, tag);
  }

  consumeTag(tag);
}

export let dirtyCollection = (obj: object) => {
  let tag = COLLECTION_TAG_MAP.get(obj);

  if (tag !== undefined) {
    dirtyTag(tag);
  }
};
