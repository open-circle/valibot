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
      value: 'jsonValue',
    },
  },
  expected: {
    type: {
      type: 'string',
      value: '(string | number | boolean | null | Object | Array)',
    },
  },
};
