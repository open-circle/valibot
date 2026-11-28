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
    {
      type: 'custom',
      name: 'GenericValidationAsync',
      href: '../GenericValidationAsync/',
    },
    {
      type: 'custom',
      name: 'GenericTransformationAsync',
      href: '../GenericTransformationAsync/',
    },
  ],
} satisfies PropertyProps['type'];

export const properties: Record<string, PropertyProps> = {
  AnyOfOptionsAsync: {
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
