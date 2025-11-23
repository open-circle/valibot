import type { PropertyProps } from '~/components';

export const properties: Record<string, PropertyProps> = {
  TInput: {
    modifier: 'extends',
    type: 'any',
  },
  TGuard: {
    modifier: 'extends',
    type: {
      type: 'custom',
      name: 'Guard',
      generics: [
        {
          type: 'custom',
          name: 'TInput',
        },
      ],
    },
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
      value: 'guard',
    },
  },
  requirement: {
    type: {
      type: 'custom',
      name: 'TGuard',
    },
  },
};
