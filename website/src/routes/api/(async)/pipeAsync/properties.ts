import type { PropertyProps } from '~/components';

export const properties: Record<string, PropertyProps> = {
  TSchema: {
    modifier: 'extends',
    type: {
      type: 'union',
      options: [
        {
          type: 'custom',
          name: 'BaseSchema',
          href: '../BaseSchema/',
          generics: [
            'unknown',
            'unknown',
            {
              type: 'custom',
              name: 'BaseIssue',
              href: '../BaseIssue/',
              generics: ['unknown'],
            },
          ],
        },
        {
          type: 'custom',
          name: 'BaseSchemaAsync',
          href: '../BaseSchemaAsync/',
          generics: [
            'unknown',
            'unknown',
            {
              type: 'custom',
              name: 'BaseIssue',
              href: '../BaseIssue/',
              generics: ['unknown'],
            },
          ],
        },
      ],
    },
  },
  TItems: {
    modifier: 'extends',
    type: {
      type: 'array',
      modifier: 'readonly',
      item: {
        type: 'union',
        options: [
          {
            type: 'custom',
            name: 'PipeItem',
            href: '../PipeItem/',
            generics: [
              'any',
              'unknown',
              {
                type: 'custom',
                name: 'BaseIssue',
                href: '../BaseIssue/',
                generics: ['unknown'],
              },
            ],
          },
          {
            type: 'custom',
            name: 'PipeItemAsync',
            href: '../PipeItemAsync/',
            generics: [
              'any',
              'unknown',
              {
                type: 'custom',
                name: 'BaseIssue',
                href: '../BaseIssue/',
                generics: ['unknown'],
              },
            ],
          },
        ],
      },
    },
  },
  schema: {
    type: {
      type: 'custom',
      name: 'TSchema',
    },
  },
  items: {
    type: {
      type: 'custom',
      name: 'TItems',
    },
  },
  Schema: {
    type: {
      type: 'custom',
      name: 'SchemaWithPipeAsync',
      href: '../SchemaWithPipeAsync/',
      generics: [
        {
          type: 'tuple',
          modifier: 'readonly',
          items: [
            {
              type: 'custom',
              name: 'TSchema',
            },
            {
              type: 'custom',
              spread: true,
              name: 'TItems',
            },
          ],
        },
      ],
    },
  },
};
