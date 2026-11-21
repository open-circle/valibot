import type { PropertyProps } from '~/components';

export const properties: Record<string, PropertyProps> = {
  PatternTuples: {
    type: {
      type: 'tuple',
      modifier: 'readonly',
      items: [
        { type: 'custom', name: 'PatternTuple', href: '../PatternTuple/' },
        {
          type: 'array',
          spread: true,
          item: {
            type: 'custom',
            name: 'PatternTuple',
            href: '../PatternTuple/',
          },
        },
      ],
    },
  },
};
