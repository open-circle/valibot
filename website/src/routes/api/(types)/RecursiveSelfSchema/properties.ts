import type { PropertyProps } from '~/components';

export const properties: Record<string, PropertyProps> = {
  BaseSchema: {
    modifier: 'extends',
    type: {
      type: 'custom',
      name: 'BaseSchema',
      href: '../BaseSchema/',
      generics: [
        {
          type: 'custom',
          name: 'RecursiveMarker',
          href: '../RecursiveMarker/',
        },
        {
          type: 'custom',
          name: 'RecursiveMarker',
          href: '../RecursiveMarker/',
        },
        'never',
      ],
    },
  },
  type: {
    type: {
      type: 'string',
      value: 'recursive',
    },
  },
};
