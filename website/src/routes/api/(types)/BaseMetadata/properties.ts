import type { PropertyProps } from '~/components';

export const properties: Record<string, PropertyProps> = {
  TInput: {
    modifier: 'extends',
    type: 'any',
  },
  kind: {
    type: {
      type: 'string',
      value: 'metadata',
    },
  },
  type: {
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
                name: 'TInput',
              },
            },
            {
              key: 'issue',
              value: 'never',
            },
          ],
        },
        'undefined',
      ],
    },
  },
};
