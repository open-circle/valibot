import type { PropertyProps } from '~/components';

export const properties: Record<string, PropertyProps> = {
  JsonValue: {
    type: {
      type: 'union',
      options: [
        'string',
        'number',
        'boolean',
        'null',
        {
          type: 'object',
          entries: [
            {
              key: { name: 'key', type: 'string' },
              value: {
                type: 'custom',
                name: 'JsonValue',
                href: '../JsonValue/',
              },
            },
          ],
        },
        {
          type: 'array',
          item: {
            type: 'custom',
            name: 'JsonValue',
            href: '../JsonValue/',
          },
        },
      ],
    },
  },
};
