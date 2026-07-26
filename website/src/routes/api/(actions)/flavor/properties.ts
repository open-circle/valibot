import type { PropertyProps } from '~/components';

export const properties: Record<string, PropertyProps> = {
  TInput: {
    modifier: 'extends',
    type: 'any',
  },
  TName: {
    modifier: 'extends',
    type: {
      type: 'custom',
      name: 'FlavorName',
      href: '../FlavorName/',
    },
  },
  name: {
    type: {
      type: 'custom',
      name: 'TName',
    },
  },
  Action: {
    type: {
      type: 'custom',
      name: 'FlavorAction',
      href: '../FlavorAction/',
      generics: [
        {
          type: 'custom',
          name: 'TInput',
        },
        {
          type: 'custom',
          name: 'TName',
        },
      ],
    },
  },
};
