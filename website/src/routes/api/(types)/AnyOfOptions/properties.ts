import type { PropertyProps } from '~/components';

const option = {
  type: 'union',
  options: [
    {
      type: 'custom',
      name: 'GenericValidation',
      href: '../GenericValidation/',
    },
    {
      type: 'intersect',
      options: [
        {
          type: 'custom',
          name: 'GenericTransformation',
          href: '../GenericTransformation/',
        },
        {
          type: 'object',
          entries: [
            {
              key: 'type',
              value: {
                type: 'string',
                value: 'guard',
              },
            },
          ],
        },
      ],
    },
  ],
} satisfies PropertyProps['type'];

export const properties: Record<string, PropertyProps> = {
  AnyOfOptions: {
    type: {
      type: 'custom',
      name: 'MaybeReadonly',
      href: '../MaybeReadonly/',
      generics: [
        {
          type: 'tuple',
          items: [
            option,
            option,
            {
              type: 'array',
              spread: true,
              item: option,
            },
          ],
        },
      ],
    },
  },
};
