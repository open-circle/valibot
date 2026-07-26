import type { PropertyProps } from '~/components';

export const properties: Record<string, PropertyProps> = {
  FlavorName: {
    type: {
      type: 'union',
      options: ['string', 'number', 'symbol'],
    },
  },
};
