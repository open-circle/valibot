import type { PropertyProps } from '~/components';

export const properties: Record<string, PropertyProps> = {
  TItem: {
    modifier: 'extends',
    type: 'any',
  },
  TRoot: {
    modifier: 'extends',
    type: 'any',
  },
  Array: {
    modifier: 'extends',
    type: {
      type: 'custom',
      name: 'Array',
      generics: [
        {
          type: 'custom',
          name: 'ResolveRecursiveValue',
          generics: [
            {
              type: 'custom',
              name: 'TItem',
            },
            {
              type: 'custom',
              name: 'TRoot',
            },
          ],
        },
      ],
    },
  },
};
