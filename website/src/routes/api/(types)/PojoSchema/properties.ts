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
              name: 'PojoIssue',
              href: '../PojoIssue/',
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
          name: 'Record',
          generics: ['string', 'unknown'],
        },
        {
          type: 'custom',
          name: 'Record',
          generics: ['string', 'unknown'],
        },
        {
          type: 'custom',
          name: 'PojoIssue',
          href: '../PojoIssue/',
        },
      ],
    },
  },
  type: {
    type: {
      type: 'string',
      value: 'pojo',
    },
  },
  reference: {
    type: {
      type: 'custom',
      modifier: 'typeof',
      name: 'pojo',
      href: '../pojo/',
    },
  },
  expects: {
    type: {
      type: 'string',
      value: 'Object',
    },
  },
  message: {
    type: {
      type: 'custom',
      name: 'TMessage',
    },
  },
};
