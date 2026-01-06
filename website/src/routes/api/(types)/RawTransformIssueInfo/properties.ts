import type { PropertyProps } from '~/components';

export const properties: Record<string, PropertyProps> = {
  TInput: {
    modifier: 'extends',
    type: 'any',
  },
  label: {
    type: {
      type: 'union',
      options: ['string', 'undefined'],
    },
  },
  input: {
    type: {
      type: 'union',
      options: ['unknown', 'undefined'],
    },
  },
  expected: {
    type: {
      type: 'union',
      options: ['string', 'undefined'],
    },
  },
  received: {
    type: {
      type: 'union',
      options: ['string', 'undefined'],
    },
  },
  message: {
    type: {
      type: 'union',
      options: [
        {
          type: 'custom',
          name: 'ErrorMessage',
          href: '../ErrorMessage/',
          generics: [
            {
              type: 'custom',
              name: 'RawTransformIssue',
              href: '../RawTransformIssue/',
              generics: [
                {
                  type: 'custom',
                  name: 'TInput',
                },
              ],
            },
          ],
        },
        'undefined',
      ],
    },
  },
  path: {
    type: {
      type: 'union',
      options: [
        {
          type: 'tuple',
          items: [
            {
              type: 'custom',
              name: 'IssuePathItem',
              href: '../IssuePathItem/',
            },
            {
              type: 'array',
              spread: true,
              item: {
                type: 'custom',
                name: 'IssuePathItem',
                href: '../IssuePathItem/',
              },
            },
          ],
        },
        'undefined',
      ],
    },
  },
};
