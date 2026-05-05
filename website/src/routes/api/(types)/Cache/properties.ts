import type { PropertyProps } from '~/components';

export const properties: Record<string, PropertyProps> = {
  TValue: {
    modifier: 'extends',
    type: 'any',
  },
  key: {
    type: {
      type: 'function',
      params: [
        {
          name: 'input',
          type: 'unknown',
        },
        {
          name: 'config',
          optional: true,
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
      return: 'string',
    },
  },
  get: {
    type: {
      type: 'function',
      params: [
        {
          name: 'key',
          type: 'string',
        },
      ],
      return: {
        type: 'union',
        options: [
          {
            type: 'custom',
            name: 'TValue',
          },
          'undefined',
        ],
      },
    },
  },
  set: {
    type: {
      type: 'function',
      params: [
        {
          name: 'key',
          type: 'string',
        },
        {
          name: 'value',
          type: {
            type: 'custom',
            name: 'TValue',
          },
        },
      ],
      return: 'void',
    },
  },
  clear: {
    type: {
      type: 'function',
      params: [],
      return: 'void',
    },
  },
};
