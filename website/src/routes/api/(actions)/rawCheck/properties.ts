import type { PropertyProps } from '~/components';

export const properties: Record<string, PropertyProps> = {
  TInput: {
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
            name: 'RawCheckContext',
            href: '../RawCheckContext/',
            generics: [
              {
                type: 'custom',
                name: 'TInput',
              },
            ],
          },
        },
      ],
      return: 'void',
    },
  },
  Action: {
    type: {
      type: 'custom',
      name: 'RawCheckAction',
      href: '../RawCheckAction/',
      generics: [
        {
          type: 'custom',
          name: 'TInput',
        },
      ],
    },
  },
};
