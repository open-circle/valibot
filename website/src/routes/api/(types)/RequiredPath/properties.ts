import type { PropertyProps } from '~/components';

export const properties: Record<string, PropertyProps> = {
  RequiredPath: {
    type: {
      type: 'tuple',
      modifier: 'readonly',
      items: [
        {
          type: 'union',
          options: ['string', 'number'],
        },
        {
          type: 'custom',
          spread: true,
          name: 'Path',
          href: '../Path/',
        },
      ],
    },
  },
};
