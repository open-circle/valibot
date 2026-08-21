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
  BaseValidation: {
    modifier: 'extends',
    type: {
      type: 'custom',
      name: 'BaseValidation',
      href: '../BaseValidation/',
      generics: [
        {
          type: 'custom',
          name: 'TInput',
        },
        {
          type: 'custom',
          name: 'InferAnyOfOutput',
          generics: [
            {
              type: 'custom',
              name: 'TOptions',
            },
            {
              type: 'custom',
              name: 'TInput',
            },
          ],
        },
        {
          type: 'union',
          options: [
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
  },
  type: {
    type: {
      type: 'string',
      value: 'any_of',
    },
  },
  reference: {
    type: {
      type: 'custom',
      modifier: 'typeof',
      name: 'anyOf',
      href: '../anyOf/',
    },
  },
  expects: {
    type: 'string',
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
};
