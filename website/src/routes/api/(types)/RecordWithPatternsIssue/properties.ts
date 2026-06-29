import type { PropertyProps } from '~/components';

export const properties: Record<string, PropertyProps> = {
  BaseIssue: {
    modifier: 'extends',
    type: {
      type: 'custom',
      name: 'BaseIssue',
      href: '../BaseIssue/',
      generics: ['unknown'],
    },
  },
  kind: {
    type: {
      type: 'string',
      value: 'schema',
    },
  },
  type: {
    type: {
      type: 'string',
      value: 'record_with_patterns',
    },
  },
  expected: {
    type: {
      type: 'union',
      options: [
        {
          type: 'string',
          value: 'Object',
        },
        {
          type: 'template',
          parts: [
            {
              type: 'string',
              value: '"',
            },
            'string',
            {
              type: 'string',
              value: '"',
            },
          ],
        },
      ],
    },
  },
};
