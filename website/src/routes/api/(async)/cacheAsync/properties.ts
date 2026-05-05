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
  schema: {
    type: {
      type: 'custom',
      name: 'TSchema',
    },
  },
  config: {
    type: {
      type: 'custom',
      name: 'TCacheConfig',
    },
  },
  Schema: {
    type: {
      type: 'custom',
      name: 'SchemaWithCacheAsync',
      href: '../SchemaWithCacheAsync/',
      generics: [
        {
          type: 'custom',
          name: 'TSchema',
        },
        {
          type: 'custom',
          name: 'TCacheConfig',
        },
      ],
    },
  },
};
