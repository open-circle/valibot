import type { PropertyProps } from '~/components';

export const properties: Record<string, PropertyProps> = {
  truthy: {
    type: {
      type: 'custom',
      name: 'MaybeReadonly',
      href: '../MaybeReadonly/',
      generics: [
        {
          type: 'array',
          item: 'string',
        },
      ],
    },
  },
  falsy: {
    type: {
      type: 'custom',
      name: 'MaybeReadonly',
      href: '../MaybeReadonly/',
      generics: [
        {
          type: 'array',
          item: 'string',
        },
      ],
    },
  },
  case: {
    type: {
      type: 'union',
      options: [
        {
          type: 'string',
          value: 'sensitive',
        },
        {
          type: 'string',
          value: 'insensitive',
        },
        'undefined',
      ],
    },
    default: {
      type: 'string',
      value: 'insensitive',
    },
  },
};
