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
  TMessage: {
    modifier: 'extends',
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
              name: 'GuardIssue',
              href: '../GuardIssue/',
              generics: [
                {
                  type: 'custom',
                  name: 'TInput',
                },
                {
                  type: 'custom',
                  name: 'TGuard',
                },
              ],
            },
          ],
        },
        'undefined',
      ],
    },
  },
  requirement: {
    type: {
      type: 'custom',
      name: 'TGuard',
    },
  },
  message: {
    type: {
      type: 'custom',
      name: 'TMessage',
    },
  },
  Action: {
    type: {
      type: 'custom',
      name: 'GuardAction',
      href: '../GuardAction/',
      generics: [
        {
          type: 'custom',
          name: 'TInput',
        },
        {
          type: 'custom',
          name: 'TGuard',
        },
        {
          type: 'custom',
          name: 'TMessage',
        },
      ],
    },
  },
};
