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
          item: 'unknown',
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
          item: 'unknown',
        },
      ],
    },
  },
};
