import type { PropertyProps } from '~/components';

export const properties: Record<string, PropertyProps> = {
  TInput: {
    modifier: 'extends',
    type: 'any',
  },
  BaseIssue: {
    modifier: 'extends',
    type: {
      type: 'custom',
      name: 'BaseIssue',
      href: '../BaseIssue/',
      generics: [
        {
          type: 'union',
          options: [
            {
              type: 'custom',
              name: 'TInput',
            },
            {
              type: 'custom',
              name: 'Date',
            },
          ],
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
      value: 'to_date',
    },
  },
  expected: {
    type: 'null',
  },
};
