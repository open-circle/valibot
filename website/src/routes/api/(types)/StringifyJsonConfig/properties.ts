import type { PropertyProps } from '~/components';

export const properties: Record<string, PropertyProps> = {
  replacer: {
    type: {
      type: 'union',
      options: [
        {
          type: 'function',
          params: [
            {
              name: 'this',
              type: 'any',
            },
            {
              name: 'key',
              type: 'string',
            },
            {
              name: 'value',
              type: 'any',
            },
          ],
          return: 'any',
        },
        {
          type: 'array',
          item: {
            type: 'union',
            options: ['string', 'number'],
          },
        },
        'undefined',
      ],
    },
  },
  space: {
    type: {
      type: 'union',
      options: ['string', 'number', 'undefined'],
    },
  },
};
