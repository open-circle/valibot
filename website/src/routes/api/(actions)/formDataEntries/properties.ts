import type { PropertyProps } from '~/components';

export const properties: Record<string, PropertyProps> = {
  TMultiKeys: {
    modifier: 'extends',
    type: {
      type: 'array',
      modifier: 'readonly',
      item: 'string',
    },
  },
  multiKeys: {
    type: {
      type: 'custom',
      name: 'TMultiKeys',
    },
  },
  Action: {
    type: {
      type: 'custom',
      name: 'FormDataEntriesAction',
      href: '../FormDataEntriesAction/',
    },
  },
};
