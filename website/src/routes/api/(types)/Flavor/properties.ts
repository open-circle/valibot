import type { PropertyProps } from '~/components';

export const properties: Record<string, PropertyProps> = {
  TName: {
    modifier: 'extends',
    type: {
      type: 'custom',
      name: 'FlavorName',
      href: '../FlavorName/',
    },
  },
  Flavor: {
    type: {
      type: 'object',
      entries: [
        {
          key: {
            name: 'FlavorSymbol',
          },
          value: {
            type: 'object',
            entries: [
              {
                key: {
                  name: 'TValue',
                  modifier: 'in',
                  type: {
                    type: 'custom',
                    name: 'TName',
                  },
                },
                value: {
                  type: 'custom',
                  name: 'TValue',
                },
              },
            ],
          },
        },
      ],
    },
  },
};
