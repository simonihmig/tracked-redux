import { DEBUG } from '@glimmer/env';
import { REDUX_PROXY_LABEL } from './proxy';

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
