import type { PropertyProps } from '~/components';

export const properties: Record<string, PropertyProps> = {
  PatternTupleAsync: {
    type: {
      type: 'tuple',
      modifier: 'readonly',
      itemLabels: ['key', 'value'],
      items: [
        {
          type: 'union',
          options: [
            {
              type: 'custom',
              name: 'BaseSchema',
              href: '../BaseSchema/',
              generics: [
                'string',
                'string',
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
                'string',
                'string',
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
        {
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
      ],
    },
  },
};
