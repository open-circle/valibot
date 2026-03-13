import type { PropertyProps } from '~/components';

export const properties: Record<string, PropertyProps> = {
  TInput: {
    modifier: 'extends',
    type: 'any',
  },
  RawCheckAddIssue: {
    type: {
      type: 'function',
      params: [
        {
          name: 'info',
          optional: true,
          type: {
            type: 'custom',
            name: 'RawCheckIssueInfo',
            href: '../RawCheckIssueInfo/',
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
