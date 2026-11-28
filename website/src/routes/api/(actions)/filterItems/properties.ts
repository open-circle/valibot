import type { PropertyProps } from '~/components';

export const properties: Record<string, PropertyProps> = {
  TInput: {
    modifier: 'extends',
    type: {
      type: 'custom',
      name: 'ArrayInput',
      href: '../ArrayInput/',
    },
  },
  TOutput: {
    modifier: 'extends',
    type: {
      type: 'custom',
      name: 'TInput',
      indexes: ['number'],
    },
  },
  operation: {
    type: {
      type: 'union',
      options: [
        {
          type: 'function',
          params: [
            {
              name: 'item',
              type: {
                type: 'custom',
                name: 'TInput',
                indexes: ['number'],
              },
            },
            {
              name: 'index',
              type: 'number',
            },
            {
              name: 'array',
              type: {
                type: 'custom',
                name: 'TInput',
              },
            },
          ],
          return: {
            type: 'predicate',
            param: 'item',
            is: {
              type: 'custom',
              name: 'TOutput',
            },
          },
        },
        {
          type: 'function',
          params: [
            {
              name: 'item',
              type: {
                type: 'custom',
                name: 'TInput',
                indexes: ['number'],
              },
            },
            {
              name: 'index',
              type: 'number',
            },
            {
              name: 'array',
              type: {
                type: 'custom',
                name: 'TInput',
              },
            },
          ],
          return: 'boolean',
        },
      ],
    },
  },
  Action: {
    type: {
      type: 'custom',
      name: 'FilterItemsAction',
      href: '../FilterItemsAction/',
      generics: [
        {
          type: 'custom',
          name: 'TInput',
        },
        {
          type: 'custom',
          name: 'TOutput',
        },
      ],
    },
  },
};
