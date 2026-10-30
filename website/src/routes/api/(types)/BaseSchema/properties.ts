import type { PropertyProps } from '~/components';

export const properties: Record<string, PropertyProps> = {
  TInput: {
    modifier: 'extends',
    type: 'any',
  },
  TOutput: {
    modifier: 'extends',
    type: 'any',
  },
  TIssue: {
    modifier: 'extends',
    type: {
      type: 'custom',
      name: 'BaseIssue',
      href: '../BaseIssue/',
      generics: ['unknown'],
    },
  },
  kind: {
    type: {
      type: 'string',
      value: 'schema',
    },
  },
  type: {
    type: 'string',
  },
  expects: {
    type: 'string',
  },
  reference: {
    type: {
      type: 'function',
      params: [
        {
          name: 'args',
          spread: true,
          type: {
            type: 'array',
            item: 'any',
          },
        },
      ],
      return: 'unknown',
    },
  },
  async: {
    type: {
      type: 'boolean',
      value: false,
    },
  },
  '~standard': {
    type: {
      type: 'custom',
      name: 'StandardProps',
      href: '../StandardProps/',
      generics: [
        {
          type: 'custom',
          name: 'TInput',
        },
        {
          type: 'custom',
          name: 'TOutput',
        },
      ],
    },
  },
  '~run': {
    type: {
      type: 'function',
      params: [
        {
          name: 'dataset',
          type: {
            type: 'custom',
            name: 'UnknownDataset',
            href: '../UnknownDataset/',
          },
        },
        {
          name: 'config',
          type: {
            type: 'custom',
            name: 'Config',
            href: '../Config/',
            generics: [
              {
                type: 'custom',
                name: 'BaseIssue',
                href: '../BaseIssue/',
                generics: ['unknown'],
              },
            ],
          },
        },
      ],
      return: {
        type: 'custom',
        name: 'OutputDataset',
        href: '../OutputDataset/',
        generics: [
          {
            type: 'custom',
            name: 'TOutput',
          },
          {
            type: 'custom',
            name: 'TIssue',
          },
        ],
      },
    },
  },
  '~types': {
    type: {
      type: 'union',
      options: [
        {
          type: 'object',
          entries: [
            {
              key: 'input',
              value: {
                type: 'custom',
                name: 'TInput',
              },
            },
            {
              key: 'output',
              value: {
                type: 'custom',
                name: 'TOutput',
              },
            },
            {
              key: 'issue',
              value: {
                type: 'custom',
                name: 'TIssue',
              },
            },
          ],
        },
        'undefined',
      ],
    },
  },
};
