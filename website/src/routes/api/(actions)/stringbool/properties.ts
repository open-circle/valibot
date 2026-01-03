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
  options: {
    type: {
      type: 'custom',
      name: 'TOptions',
    },
  },
  Action: {
    type: {
      type: 'custom',
      name: 'StringboolAction',
      href: '../StringboolAction/',
      generics: [
        {
          type: 'custom',
          name: 'TInput',
        },
        {
          type: 'custom',
          name: 'TOptions',
        },
      ],
    },
  },
};
