import type { PropertyProps } from '~/components';

export const properties: Record<string, PropertyProps> = {
  TGuard: {
    modifier: 'extends',
    type: {
      type: 'custom',
      name: 'GuardFunction',
      href: '../GuardFunction/',
      generics: ['any'],
    },
  },
  InferGuardOutput: {
    type: {
      type: 'conditional',
      conditions: [
        {
          type: {
            type: 'custom',
            name: 'TGuard',
          },
          extends: {
            type: 'function',
            params: [
              {
                name: 'input',
                type: 'any',
              },
            ],
            return: {
              type: 'predicate',
              param: 'input',
              is: {
                type: 'custom',
                modifier: 'infer',
                name: 'TOutput',
              },
            },
          },
          true: {
            type: 'custom',
            name: 'TOutput',
          },
        },
      ],
      false: 'unknown',
    },
  },
};
