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
  BaseSchema: {
    modifier: 'extends',
    type: {
      type: 'custom',
      name: 'BaseSchema',
      href: '../BaseSchema/',
      generics: [
        {
          type: 'custom',
          name: 'ResolveRecursiveInput',
          generics: [
            {
              type: 'custom',
              name: 'InferInput',
              href: '../InferInput/',
              generics: [
                {
                  type: 'custom',
                  name: 'TWrapped',
                },
              ],
            },
          ],
        },
        {
          type: 'custom',
          name: 'ResolveRecursiveOutput',
          generics: [
            {
              type: 'custom',
              name: 'InferOutput',
              href: '../InferOutput/',
              generics: [
                {
                  type: 'custom',
                  name: 'TWrapped',
                },
              ],
            },
          ],
        },
        {
          type: 'custom',
          name: 'InferIssue',
          href: '../InferIssue/',
          generics: [
            {
              type: 'custom',
              name: 'TWrapped',
            },
          ],
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
  reference: {
    type: {
      type: 'custom',
      modifier: 'typeof',
      name: 'recursive',
      href: '../recursive/',
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
        name: 'TWrapped',
      },
    },
  },
};
