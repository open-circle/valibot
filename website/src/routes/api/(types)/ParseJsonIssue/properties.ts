import type { PropertyProps } from '~/components';

export const properties: Record<string, PropertyProps> = {
  TInput: {
    modifier: 'extends',
    type: 'string',
  },
  BaseIssue: {
    modifier: 'extends',
    type: {
      type: 'custom',
      name: 'BaseIssue',
      href: '../BaseIssue/',
      generics: [
        {
          type: 'custom',
          name: 'TInput',
        },
      ],
    },
  },
  kind: {
    type: {
      type: 'string',
      value: 'transformation',
    },
  },
  type: {
    type: {
      type: 'string',
      value: 'parse_json',
    },
  },
  expected: {
    type: 'null',
  },
  received: {
    type: {
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
  },
};
