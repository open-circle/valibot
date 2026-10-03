import type { PropertyProps } from '~/components';

export const properties: Record<string, PropertyProps> = {
  TMessage: {
    modifier: 'extends',
    type: {
      type: 'union',
      options: [
        {
          type: 'custom',
          name: 'ErrorMessage',
          href: '../ErrorMessage/',
          generics: [
            {
              type: 'custom',
              name: 'JsonValueIssue',
              href: '../JsonValueIssue/',
            },
          ],
        },
        'undefined',
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
          name: 'JsonValue',
          href: '../JsonValue/',
        },
        {
          type: 'custom',
          name: 'JsonValue',
          href: '../JsonValue/',
        },
        {
          type: 'custom',
          name: 'JsonValueIssue',
          href: '../JsonValueIssue/',
        },
      ],
    },
  },
  type: {
    type: {
      type: 'string',
      value: 'jsonValue',
    },
  },
  reference: {
    type: {
      type: 'custom',
      modifier: 'typeof',
      name: 'jsonValue',
      href: '../jsonValue/',
    },
  },
  expects: {
    type: {
      type: 'string',
      value: '(string | number | boolean | null | Object | Array)',
    },
  },
  message: {
    type: {
      type: 'custom',
      name: 'TMessage',
    },
  },
};
