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
          type: 'intersect',
          options: [
            {
              type: 'custom',
              name: 'TInput',
            },
            {
              type: 'custom',
              name: 'Flavor',
              href: '../Flavor/',
              generics: [
                {
                  type: 'custom',
                  name: 'TName',
                },
              ],
            },
          ],
        },
        'never',
      ],
    },
  },
  type: {
    type: {
      type: 'string',
      value: 'flavor',
    },
  },
  reference: {
    type: {
      type: 'custom',
      modifier: 'typeof',
      name: 'flavor',
      href: '../flavor/',
    },
  },
  name: {
    type: {
      type: 'custom',
      name: 'TName',
    },
  },
};
