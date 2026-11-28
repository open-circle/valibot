import type { PropertyProps } from '~/components';

export const properties: Record<string, PropertyProps> = {
  TSchema: {
    modifier: 'extends',
    type: {
      type: 'object',
      entries: [
        {
          key: 'type',
          value: {
            type: 'union',
            options: [
              { type: 'string', value: 'loose_object' },
              { type: 'string', value: 'object' },
              { type: 'string', value: 'object_with_rest' },
              { type: 'string', value: 'strict_object' },
            ],
          },
        },
        {
          key: 'entries',
          value: {
            type: 'union',
            options: [
              {
                type: 'custom',
                name: 'ObjectEntries',
                href: '../ObjectEntries/',
              },
              {
                type: 'custom',
                name: 'ObjectEntriesAsync',
                href: '../ObjectEntriesAsync/',
              },
            ],
          },
        },
      ],
    },
  },
  ObjectKeys: {
    type: {
      type: 'custom',
      name: 'MaybeReadonly',
      href: '../MaybeReadonly/',
      generics: [
        {
          type: 'tuple',
          items: [
            {
              type: 'custom',
              modifier: 'keyof',
              name: 'TSchema',
              indexes: [
                {
                  type: 'string',
                  value: 'entries',
                },
              ],
            },
            {
              type: 'array',
              spread: true,
              item: {
                type: 'custom',
                modifier: 'keyof',
                name: 'TSchema',
                indexes: [
                  {
                    type: 'string',
                    value: 'entries',
                  },
                ],
              },
            },
          ],
        },
      ],
    },
  },
};
