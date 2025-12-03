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
            'number',
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
      value: 'to_number',
    },
  },
  expected: {
    type: 'null',
  },
};
