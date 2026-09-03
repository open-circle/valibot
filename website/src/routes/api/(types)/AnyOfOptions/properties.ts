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
      type: 'custom',
      name: 'GenericTransformation',
      href: '../GenericTransformation/',
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
