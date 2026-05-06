import type { PropertyProps } from '~/components';

export const properties: Record<string, PropertyProps> = {
  CheckboxAction: {
    modifier: 'extends',
    type: {
      type: 'custom',
      name: 'BaseTransformation',
      href: '../BaseTransformation/',
      generics: ['string', 'boolean', 'never'],
    },
  },
  type: {
    type: {
      type: 'string',
      value: 'checkbox',
    },
  },
  reference: {
    type: {
      type: 'custom',
      modifier: 'typeof',
      name: 'checkbox',
      href: '../checkbox/',
    },
  },
};
