import type { PropertyProps } from '~/components';

export const properties: Record<string, PropertyProps> = {
  TWrapped: {
    modifier: 'extends',
    type: {
      type: 'custom',
      name: 'BaseSchema',
      href: '../BaseSchema/',
      generics: [
        'unknown',
        'unknown',
        {
          type: 'custom',
          name: 'BaseIssue',
          href: '../BaseIssue/',
          generics: ['unknown'],
        },
      ],
    },
  },
  getter: {
    type: {
      type: 'function',
      params: [
        {
          name: 'self',
          type: {
            type: 'custom',
            name: 'RecursiveSelfSchema',
            href: '../RecursiveSelfSchema/',
          },
        },
      ],
      return: {
        type: 'custom',
        name: 'TWrapped',
      },
    },
  },
  Schema: {
    type: {
      type: 'custom',
      name: 'RecursiveSchema',
      href: '../RecursiveSchema/',
      generics: [
        {
          type: 'custom',
          name: 'TWrapped',
        },
      ],
    },
  },
};
