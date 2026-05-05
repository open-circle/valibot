import type { PropertyProps } from '~/components';

export const properties: Record<string, PropertyProps> = {
  issues: {
    type: {
      type: 'tuple',
      items: [
        {
          type: 'custom',
          name: 'BaseIssue',
          href: '../BaseIssue/',
          generics: ['unknown'],
        },
        {
          type: 'array',
          spread: true,
          item: {
            type: 'custom',
            name: 'BaseIssue',
            href: '../BaseIssue/',
            generics: ['unknown'],
          },
        },
      ],
    },
  },
  errors: {
    type: 'string',
  },
};
