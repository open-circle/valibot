import type { PropertyProps } from '~/components';

export const properties: Record<string, PropertyProps> = {
  TOptions: {
    modifier: 'extends',
    type: {
      type: 'custom',
      name: 'MaybeReadonly',
      href: '../MaybeReadonly/',
      generics: [
        {
          type: 'tuple',
          items: [
            'unknown',
            'unknown',
            {
              type: 'array',
              spread: true,
              item: 'unknown',
            },
          ],
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
              name: 'AnyOfIssue',
              href: '../AnyOfIssue/',
              generics: [
                {
                  type: 'custom',
                  name: 'InferAnyOfIssue',
                  generics: [
                    {
                      type: 'custom',
                      name: 'TOptions',
                    },
                  ],
                },
              ],
            },
          ],
        },
        'undefined',
      ],
    },
  },
  TInput: {
    modifier: 'extends',
    type: {
      type: 'custom',
      name: 'InferAnyOfInput',
      generics: [
        {
          type: 'custom',
          name: 'TOptions',
        },
      ],
    },
    default: {
      type: 'custom',
      name: 'InferAnyOfInput',
      generics: [
        {
          type: 'custom',
          name: 'TOptions',
        },
      ],
    },
  },
  options: {
    type: {
      type: 'custom',
      name: 'TOptions',
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
      name: 'AnyOfAction',
      href: '../AnyOfAction/',
      generics: [
        {
          type: 'custom',
          name: 'TOptions',
        },
        {
          type: 'custom',
          name: 'TMessage',
        },
        {
          type: 'custom',
          name: 'TInput',
        },
      ],
    },
  },
};
