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
  ReadonlyArray: {
    modifier: 'extends',
    type: {
      type: 'custom',
      name: 'ReadonlyArray',
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
