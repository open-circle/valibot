import type { PropertyProps } from '~/components';

export const properties: Record<string, PropertyProps> = {
  TName: {
    modifier: 'extends',
    type: { type: 'union', options: ['string', 'undefined'] },
  },
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
          generics: [{ type: 'custom', name: 'TName' }],
        },
        {
          type: 'custom',
          name: 'RecursiveMarker',
          generics: [{ type: 'custom', name: 'TName' }],
        },
        'never',
      ],
    },
  },
  type: {
    type: { type: 'string', value: 'refAsync' },
  },
  owner: {
    type: { type: 'custom', name: 'RecursiveOwner' },
  },
  name: {
    type: { type: 'custom', name: 'TName' },
  },
};
