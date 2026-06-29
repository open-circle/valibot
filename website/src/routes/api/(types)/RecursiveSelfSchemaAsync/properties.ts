import type { PropertyProps } from '~/components';

export const properties: Record<string, PropertyProps> = {
  BaseSchemaAsync: {
    modifier: 'extends',
    type: {
      type: 'custom',
      name: 'BaseSchemaAsync',
      href: '../BaseSchemaAsync/',
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
