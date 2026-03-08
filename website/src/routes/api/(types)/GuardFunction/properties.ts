import type { PropertyProps } from '~/components';

export const properties: Record<string, PropertyProps> = {
  TInput: {
    modifier: 'extends',
    type: 'any',
  },
  GuardFunction: {
    type: {
      type: 'function',
      params: [
        {
          name: 'input',
          type: {
            type: 'custom',
            name: 'TInput',
          },
        },
      ],
      return: {
        type: 'predicate',
        param: 'input',
        is: 'any',
      },
    },
  },
};
