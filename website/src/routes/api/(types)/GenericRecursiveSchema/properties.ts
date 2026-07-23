import type { PropertyProps } from '~/components';

export const properties: Record<string, PropertyProps> = {
  BaseSchema: {
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
  type: {
    type: {
      type: 'string',
      value: 'recursive',
    },
  },
  expects: {
    type: {
      type: 'string',
      value: 'unknown',
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
  },
};
