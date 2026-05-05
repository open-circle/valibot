import type { PropertyProps } from '~/components';

export const properties: Record<string, PropertyProps> = {
  TInput: {
    modifier: 'extends',
    type: {
      type: 'custom',
      name: 'PartialInput',
      href: '../PartialInput/',
    },
  },
  TPaths: {
    modifier: 'extends',
    type: {
      type: 'custom',
      name: 'Paths',
      href: '../Paths/',
    },
  },
  TSelection: {
    modifier: 'extends',
    type: {
      type: 'custom',
      name: 'DeepPickN',
      href: '../DeepPickN/',
      generics: [
        {
          type: 'custom',
          name: 'TInput',
        },
        {
          type: 'custom',
          name: 'TPaths',
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
              name: 'PartialCheckIssue',
              href: '../PartialCheckIssue/',
              generics: [
                {
                  type: 'custom',
                  name: 'TSelection',
                },
              ],
            },
          ],
        },
        'undefined',
      ],
    },
  },
  BaseValidationAsync: {
    modifier: 'extends',
    type: {
      type: 'custom',
      name: 'BaseValidationAsync',
      href: '../BaseValidationAsync/',
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
          name: 'PartialCheckIssue',
          href: '../PartialCheckIssue/',
          generics: [
            {
              type: 'custom',
              name: 'TSelection',
            },
          ],
        },
      ],
    },
  },
  type: {
    type: {
      type: 'string',
      value: 'partial_check',
    },
  },
  reference: {
    type: {
      type: 'custom',
      modifier: 'typeof',
      name: 'partialCheckAsync',
      href: '../partialCheckAsync/',
    },
  },
  expects: {
    type: 'null',
  },
  paths: {
    type: {
      type: 'custom',
      name: 'TPaths',
    },
  },
  requirement: {
    type: {
      type: 'function',
      params: [
        {
          name: 'input',
          type: {
            type: 'custom',
            name: 'TSelection',
          },
        },
      ],
      return: {
        type: 'custom',
        name: 'MaybePromise',
        href: '../MaybePromise/',
        generics: ['boolean'],
      },
    },
  },
  message: {
    type: {
      type: 'custom',
      name: 'TMessage',
    },
  },
};
