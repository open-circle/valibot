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
  schema: {
    type: {
      type: 'custom',
      name: 'TSchema',
    },
  },
  options: {
    type: {
      type: 'custom',
      name: 'TOptions',
    },
  },
  Schema: {
    type: {
      type: 'custom',
      name: 'SchemaWithCache',
      href: '../SchemaWithCache/',
      generics: [
        {
          type: 'custom',
          name: 'TSchema',
        },
        {
          type: 'custom',
          name: 'TOptions',
        },
      ],
    },
  },
};
