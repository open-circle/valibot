import type { PropertyProps } from '~/components';

export const properties: Record<string, PropertyProps> = {
  TInput: {
    modifier: 'extends',
    type: {
      type: 'union',
      options: [
        {
          type: 'custom',
          name: 'Record',
          generics: ['string', 'unknown'],
        },
        {
          type: 'custom',
          name: 'ArrayLike',
          generics: ['unknown'],
        },
      ],
    },
  },
  TPaths: {
    modifier: 'extends',
    type: {
      type: 'custom',
      name: 'RequiredPaths',
      href: '../RequiredPaths/',
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
  paths: {
    type: {
      type: 'custom',
      name: 'ValidPaths',
      href: './ValidPaths/',
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
      return: 'boolean',
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
      name: 'PartialCheckAction',
      href: '../PartialCheckAction/',
      generics: [
        {
          type: 'custom',
          name: 'TInput',
        },
        {
          type: 'custom',
          name: 'TPaths',
        },
        {
          type: 'custom',
          name: 'TSelection',
        },
        {
          type: 'custom',
          name: 'TMessage',
        },
      ],
    },
  },
};
