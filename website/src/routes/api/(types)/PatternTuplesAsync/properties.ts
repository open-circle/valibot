import type { PropertyProps } from '~/components';

export const properties: Record<string, PropertyProps> = {
  PatternTuplesAsync: {
    type: {
      type: 'tuple',
      modifier: 'readonly',
      items: [
        {
          type: 'custom',
          name: 'PatternTupleAsync',
          href: '../PatternTupleAsync/',
        },
        {
          type: 'array',
          spread: true,
          item: {
            type: 'custom',
            name: 'PatternTupleAsync',
            href: '../PatternTupleAsync/',
          },
        },
      ],
    },
  },
};
