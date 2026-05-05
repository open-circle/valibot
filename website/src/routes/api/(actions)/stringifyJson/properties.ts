import type { PropertyProps } from '~/components';

export const properties: Record<string, PropertyProps> = {
  TInput: {
    modifier: 'extends',
    type: 'any',
  },
  TConfig: {
    modifier: 'extends',
    type: {
      type: 'union',
      options: [
        {
          type: 'custom',
          name: 'StringifyJsonConfig',
          href: '../StringifyJsonConfig/',
        },
        'undefined',
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
              name: 'StringifyJsonIssue',
              href: '../StringifyJsonIssue/',
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
  config: {
    type: {
      type: 'custom',
      name: 'TConfig',
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
      name: 'StringifyJsonAction',
      href: '../StringifyJsonAction/',
      generics: [
        {
          type: 'custom',
          name: 'TInput',
        },
        {
          type: 'custom',
          name: 'TConfig',
        },
        {
          type: 'custom',
          name: 'TMessage',
        },
      ],
    },
  },
};
