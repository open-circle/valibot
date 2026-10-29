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
    default: {
      type: 'custom',
      name: 'TInput',
      indexes: ['number'],
    },
  },
  BaseTransformation: {
    modifier: 'extends',
    type: {
      type: 'custom',
      name: 'BaseTransformation',
      href: '../BaseTransformation/',
      generics: [
        {
          type: 'custom',
          name: 'TInput',
        },
        {
          type: 'array',
          item: {
            type: 'custom',
            name: 'TOutput',
          },
        },
        'never',
      ],
    },
  },
  type: {
    type: {
      type: 'string',
      value: 'filter_items',
    },
  },
  reference: {
    type: {
      type: 'custom',
      modifier: 'typeof',
      name: 'filterItems',
      href: '../filterItems/',
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
};
