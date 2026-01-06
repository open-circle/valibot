import type { PropertyProps } from '~/components';

export const properties: Record<string, PropertyProps> = {
  TInput: {
    modifier: 'extends',
    type: 'any',
  },
  TOutput: {
    modifier: 'extends',
    type: 'any',
  },
  action: {
    type: {
      type: 'function',
      params: [
        {
          name: 'context',
          type: {
            type: 'custom',
            name: 'RawTransformContext',
            href: '../RawTransformContext/',
            generics: [
              {
                type: 'custom',
                name: 'TInput',
              },
            ],
          },
        },
      ],
      return: {
        type: 'custom',
        name: 'TOutput',
      },
    },
  },
  Action: {
    type: {
      type: 'custom',
      name: 'RawTransformAction',
      href: '../RawTransformAction/',
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
