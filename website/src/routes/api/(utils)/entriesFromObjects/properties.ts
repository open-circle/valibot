import type { PropertyProps } from '~/components';

export const properties: Record<string, PropertyProps> = {
  TSchemas: {
    modifier: 'extends',
    type: {
      type: 'tuple',
      items: [
        {
          type: 'custom',
          name: 'Schema',
        },
        {
          type: 'array',
          spread: true,
          item: {
            type: 'custom',
            name: 'Schema',
          },
        },
      ],
    },
  },
  schemas: {
    type: {
      type: 'custom',
      name: 'TSchemas',
    },
  },
  entries: {
    type: {
      type: 'custom',
      name: 'MergedEntries',
      generics: [
        {
          type: 'custom',
          name: 'TSchemas',
        },
      ],
    },
  },
};
