import type { PropertyProps } from '~/components';

export const properties: Record<string, PropertyProps> = {
  TInput: {
    modifier: 'extends',
    type: 'string',
  },
  TRequirement: {
    modifier: 'extends',
    type: 'number',
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
              name: 'MinDigitCharsIssue',
              href: '../MinDigitCharsAction/',
              generics: [
                {
                  type: 'custom',
                  name: 'TInput',
                },
                {
                  type: 'custom',
                  name: 'TRequirement',
                },
              ],
            },
          ],
        },
        'undefined',
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
          name: 'TInput',
        },
        {
          type: 'custom',
          name: 'MinDigitCharsIssue',
          href: '../MinDigitCharsAction/',
          generics: [
            {
              type: 'custom',
              name: 'TInput',
            },
            {
              type: 'custom',
              name: 'TRequirement',
            },
          ],
        },
      ],
    },
  },
  type: {
    type: {
      type: 'string',
      value: 'min_digits',
    },
  },
  reference: {
    type: {
      type: 'custom',
      modifier: 'typeof',
      name: 'minDigitChars',
      href: '../minDigitChars/',
    },
  },
  expects: {
    type: {
      type: 'template',
      parts: [
        {
          type: 'string',
          value: '>=',
        },
        {
          type: 'custom',
          name: 'TRequirement',
        },
      ],
    },
  },
  requirement: {
    type: {
      type: 'custom',
      name: 'TRequirement',
    },
  },
  message: {
    type: {
      type: 'custom',
      name: 'TMessage',
    },
  },
};
