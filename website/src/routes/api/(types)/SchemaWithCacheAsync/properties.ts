import type { PropertyProps } from '~/components';

export const properties: Record<string, PropertyProps> = {
  async: {
    type: {
      type: 'boolean',
      value: true,
    },
  },
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
  TOptions: {
    modifier: 'extends',
    type: {
      type: 'union',
      options: [
        {
          type: 'custom',
          name: 'CacheOptions',
          href: '../CacheOptions/',
        },
        {
          type: 'custom',
          name: 'CacheInstanceOptions',
          href: '../CacheInstanceOptions/',
          generics: [
            {
              type: 'custom',
              name: 'TSchema',
            },
          ],
        },
        'undefined',
      ],
    },
  },
  options: {
    type: {
      type: 'custom',
      name: 'TOptions',
    },
  },
  cache: {
    type: {
      type: 'conditional',
      conditions: [
        {
          type: {
            type: 'custom',
            name: 'TOptions',
          },
          extends: {
            type: 'object',
            entries: [
              {
                key: 'cache',
                value: {
                  type: 'custom',
                  modifier: 'infer',
                  name: 'TCache',
                },
              },
            ],
          },
          true: {
            type: 'custom',
            name: 'TCache',
          },
        },
      ],
      false: {
        type: 'custom',
        name: '_Cache',
        generics: [
          'unknown',
          {
            type: 'custom',
            name: 'OutputDataset',
            href: '../OutputDataset/',
            generics: [
              {
                type: 'custom',
                name: 'InferOutput',
                href: '../InferOutput/',
                generics: [
                  {
                    type: 'custom',
                    name: 'TSchema',
                  },
                ],
              },
              {
                type: 'custom',
                name: 'InferIssue',
                href: '../InferIssue/',
                generics: [
                  {
                    type: 'custom',
                    name: 'TSchema',
                  },
                ],
              },
            ],
          },
        ],
      },
    },
  },
  SchemaWithCacheAsync: {
    modifier: 'extends',
    type: {
      type: 'custom',
      name: 'TSchema',
    },
  },
};
