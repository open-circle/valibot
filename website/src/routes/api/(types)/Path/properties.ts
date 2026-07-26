import type { PropertyProps } from '~/components';

export const properties: Record<string, PropertyProps> = {
  Path: {
    type: {
      type: 'array',
      modifier: 'readonly',
      item: {
        type: 'union',
        options: ['string', 'number'],
      },
    },
  },
};
