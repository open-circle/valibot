import type { PropertyProps } from '~/components';

export const properties: Record<string, PropertyProps> = {
  TInput: {
    modifier: 'extends',
    type: 'string',
  },
  TOptions: {
    modifier: 'extends',
    type: {
      type: 'custom',
      name: 'StringboolOptions',
      href: '../StringboolOptions/',
    },
    default: {
      type: 'custom',
      name: 'StringboolOptions',
      href: '../StringboolOptions/',
    },
  },
  BaseTransformation: {
    modifier: 'extends',
    type: {
      type: 'custom',
      name: 'BaseTransformation',
      href: '../BaseTransformation/',
      generics: [
        {
          type: 'custom',
          name: 'TInput',
        },
        'boolean',
        {
          type: 'custom',
          name: 'StringboolIssue',
          href: '../StringboolIssue/',
        },
      ],
    },
  },
  type: {
    type: {
      type: 'string',
      value: 'stringbool',
    },
  },
  reference: {
    type: {
      type: 'custom',
      modifier: 'typeof',
      name: 'stringbool',
      href: '../stringbool/',
    },
  },
  expects: {
    type: 'string',
  },
  options: {
    type: {
      type: 'custom',
      name: 'TOptions',
    },
  },
};
