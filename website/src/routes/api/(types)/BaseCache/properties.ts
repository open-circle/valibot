import type { PropertyProps } from '~/components';

export const properties: Record<string, PropertyProps> = {
  TKey: {
    modifier: 'extends',
    type: 'any',
  },
  TValue: {
    modifier: 'extends',
    type: 'any',
  },
  get: {
    type: {
      type: 'function',
      params: [
        {
          name: 'key',
          type: {
            type: 'custom',
            name: 'TKey',
          },
        },
      ],
      return: {
        type: 'union',
        options: [
          {
            type: 'custom',
            name: 'TValue',
          },
          'undefined',
        ],
      },
    },
  },
  set: {
    type: {
      type: 'function',
      params: [
        {
          name: 'key',
          type: {
            type: 'custom',
            name: 'TKey',
          },
        },
        {
          name: 'value',
          type: {
            type: 'custom',
            name: 'TValue',
          },
        },
      ],
      return: 'void',
    },
  },
};
