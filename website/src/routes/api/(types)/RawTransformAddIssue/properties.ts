import type { PropertyProps } from '~/components';

export const properties: Record<string, PropertyProps> = {
  TInput: {
    modifier: 'extends',
    type: 'any',
  },
  RawTransformAddIssue: {
    type: {
      type: 'function',
      params: [
        {
          name: 'info',
          optional: true,
          type: {
            type: 'custom',
            name: 'RawTransformIssueInfo',
            href: '../RawTransformIssueInfo/',
            generics: [
              {
                type: 'custom',
                name: 'TInput',
              },
            ],
          },
        },
      ],
      return: 'void',
    },
  },
};
