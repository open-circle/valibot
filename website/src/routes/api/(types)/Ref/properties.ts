import type { PropertyProps } from '~/components';

export const properties: Record<string, PropertyProps> = {
  TName: {
    modifier: 'extends',
    type: { type: 'union', options: ['string', 'undefined'] },
  },
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
    type: { type: 'string', value: 'ref' },
  },
  owner: {
    type: { type: 'custom', name: 'RecursiveOwner' },
  },
  name: {
    type: { type: 'custom', name: 'TName' },
  },
};
