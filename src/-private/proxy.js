import { DEBUG } from '@glimmer/env';
import {
  createTag,
  consumeTag,
  dirtyTag,
  consumeCollection,
  dirtyCollection,
} from './tracking';

const REDUX_PROXY_LABEL = Symbol();

class ObjectTreeNode {
  constructor(value) {
    this.value = value;
    this.proxy = new Proxy(this, objectProxyHandler);
    this.tag = createTag();
    this.tags = Object.create(null);
    this.children = Object.create(null);
    this.collectionTag = null;
  }

  toString() {
    return 'testing';
  }
}

const objectProxyHandler = {
  get(node, key) {
    if (DEBUG && key === REDUX_PROXY_LABEL) {
      return true;
    }

    let { value } = node;
    let childValue = Reflect.get(value, key);

    if (typeof childValue === 'object' && childValue !== null && !(childValue instanceof Date)) {
      let childNode = node.children[key];

      if (childNode === undefined) {
        childNode = node.children[key] = createNode(childValue);
      }

      consumeTag(childNode.tag);

      return childNode.proxy;
    } else {
      let tag = node.tags[key];

      if (tag === undefined) {
        tag = node.tags[key] = createTag();
      }

      consumeTag(tag);

      return childValue;
    }
  },

  ownKeys(node) {
    consumeCollection(node);
    return Reflect.ownKeys(node.value);
  },

  getOwnPropertyDescriptor(node, prop) {
    return Reflect.getOwnPropertyDescriptor(node.value, prop);
  },

  has(node, prop) {
    return Reflect.has(node.value, prop);
  },

  set() {
    if (DEBUG) {
      throw new Error(
        'You attempted to set a value on the Redux store directly. This is not allowed, you must use `dispatch` to send an action which updates the state of the store.'
      );
    }

    return false;
  },
};

class ArrayTreeNode {
  constructor(value) {
    this.value = value;
    this.proxy = new Proxy([this], arrayProxyHandler);
    this.tag = createTag();
    this.tags = Object.create(null);
    this.children = Object.create(null);
    this.collectionTag = null;
  }
}

const arrayProxyHandler = {
  get([node], key) {
    if (key === 'length') {
      consumeCollection(node);
    }

    return objectProxyHandler.get(node, key);
  },

  ownKeys([node]) {
    return objectProxyHandler.ownKeys(node);
  },

  getOwnPropertyDescriptor([node], prop) {
    return objectProxyHandler.getOwnPropertyDescriptor(node, prop);
  },

  has([node], prop) {
    return objectProxyHandler.has(node, prop);
  },

  set() {
    return objectProxyHandler.set();
  },
};

export function createNode(value) {
  if (Array.isArray(value)) {
    return new ArrayTreeNode(value);
  }

  return new ObjectTreeNode(value);
}

export function updateNode(node, newValue) {
  const { value, tags, children } = node;

  node.value = newValue;

  if (Array.isArray(value) && value.length !== newValue.length) {
    dirtyCollection(node);
  } else {
    let oldKeys = Object.keys(value);
    let newKeys = Object.keys(newValue);

    if (
      oldKeys.length !== newKeys.length ||
      oldKeys.some((k) => !newKeys.includes(k))
    ) {
      dirtyCollection(node);
    }
  }

  for (let key in tags) {
    let childValue = value[key];
    let newChildValue = newValue[key];

    if (childValue !== newChildValue) {
      dirtyCollection(node);
      dirtyTag(tags[key]);
    }

    if (typeof newChildValue === 'object' && newChildValue !== null && !(childValue instanceof Date)) {
      delete tags[key];
    }
  }

  for (let key in children) {
    const childNode = children[key];
    const newChildValue = newValue[key];

    const childValue = childNode.value;

    if (childValue === newChildValue) {
      continue;
    } else if (
      typeof newChildValue === 'object' &&
      newChildValue !== null &&
      Object.getPrototypeOf(newChildValue) === Object.getPrototypeOf(childValue) &&
      !(childValue instanceof Date)
    ) {
      updateNode(childNode, newChildValue);
    } else {
      deleteNode(childNode);
      delete children[key];
    }
  }
}

function deleteNode(node) {
  dirtyTag(node.tag);
  dirtyCollection(node);
  Object.values(node.tags).map(dirtyTag);
  Object.values(node.children).map(deleteNode);
}

if (DEBUG) {
  const listStyle = {
    style:
      'list-style-type: none; padding: 0; margin: 0 0 0 12px; font-style: normal; position: relative',
  };

  const defaultValueKeyStyle = { style: 'color: #7D258C' };
  const primitiveValueKeyStyle = {
    style: 'color: #7D258C; margin-left: 15px;',
  };

  window.devtoolsFormatters = window.devtoolsFormatters || [];

  window.devtoolsFormatters.push({
    header(obj, config = {}) {
      if (!obj[REDUX_PROXY_LABEL]) {
        return null;
      }

      let label = [
        'span',
        defaultValueKeyStyle,
        config.labelKey ? config.labelKey + ': ' : 'Redux State: ',
      ];

      let preview;

      if (Array.isArray(obj)) {
        preview = ['span', `Array(${obj.length})`];
      } else {
        let previewKeys = Object.entries(obj)
          .slice(0, 5)
          .map(([key, value]) => {
            let previewValue;

            if (typeof value === 'object' && value !== null) {
              previewValue = Array.isArray(value)
                ? `Array(${value.length})`
                : '{...}';
            } else {
              previewValue = value;
            }

            return `${key}: ${previewValue}`;
          });

        preview = ['span', `{${previewKeys.join(', ')}}`];
      }

      return ['div', label, preview];
    },
    hasBody() {
      return true;
    },
    body(obj) {
      const children = Object.entries(obj).map(([key, value]) => {
        if (typeof value === 'object' && value !== null) {
          return [
            'li',
            {},
            ['object', { object: value, config: { labelKey: key } }],
          ];
        } else {
          return [
            'li',
            {},
            ['span', primitiveValueKeyStyle, `${key}: `],
            ['object', { object: value, config: { labelKey: key } }],
          ];
        }
      });

      return ['ol', listStyle, ...children];
    },
  });
}
