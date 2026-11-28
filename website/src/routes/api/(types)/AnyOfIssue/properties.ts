import type { PropertyProps } from '~/components';

export const properties: Record<string, PropertyProps> = {
  TSubIssue: {
    modifier: 'extends',
    type: {
      type: 'custom',
      name: 'BaseIssue',
      href: '../BaseIssue/',
      generics: ['unknown'],
    },
  },
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
      value: 'validation',
    },
  },
  type: {
    type: {
      type: 'string',
      value: 'any_of',
    },
  },
  expected: {
    type: 'string',
  },
  issues: {
    type: {
      type: 'tuple',
      items: [
        {
          type: 'custom',
          name: 'TSubIssue',
        },
        {
          type: 'array',
          spread: true,
          item: {
            type: 'custom',
            name: 'TSubIssue',
          },
        },
      ],
    },
  },
};
