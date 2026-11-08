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
  definition: {
    type: {
      type: 'function',
      params: [
        {
          name: 'self',
          type: {
            type: 'custom',
            name: 'Ref',
            href: '../Ref/',
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
      name: 'ResolvedRecursiveSchema',
      generics: [
        {
          type: 'custom',
          name: 'TWrapped',
        },
      ],
    },
  },
};
