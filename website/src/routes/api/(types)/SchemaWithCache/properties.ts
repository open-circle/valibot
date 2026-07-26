import type { PropertyProps } from '~/components';

export const properties: Record<string, PropertyProps> = {
  TSchema: {
    modifier: 'extends',
    type: {
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
  },
  TCacheConfig: {
    modifier: 'extends',
    type: {
      type: 'union',
      options: [
        {
          type: 'custom',
          name: 'CacheConfig',
          href: '../CacheConfig/',
        },
        'undefined',
      ],
    },
  },
  cacheConfig: {
    type: {
      type: 'custom',
      name: 'TCacheConfig',
    },
  },
  cache: {
    type: {
      type: 'custom',
      name: 'Cache',
      href: '../Cache/',
      generics: [
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
  SchemaWithCache: {
    modifier: 'extends',
    type: {
      type: 'custom',
      name: 'TSchema',
    },
  },
};
