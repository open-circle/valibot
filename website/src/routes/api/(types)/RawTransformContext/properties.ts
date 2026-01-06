import type { PropertyProps } from '~/components';

export const properties: Record<string, PropertyProps> = {
  TInput: {
    modifier: 'extends',
    type: 'any',
  },
  dataset: {
    type: {
      type: 'custom',
      name: 'SuccessDataset',
      href: '../SuccessDataset/',
      generics: [
        {
          type: 'custom',
          name: 'TInput',
        },
      ],
    },
  },
  config: {
    type: {
      type: 'custom',
      name: 'Config',
      href: '../Config/',
      generics: [
        {
          type: 'custom',
          name: 'RawTransformIssue',
          href: '../RawTransformIssue/',
          generics: [
            {
              type: 'custom',
              name: 'TInput',
            },
          ],
        },
      ],
    },
  },
  addIssue: {
    type: {
      type: 'custom',
      name: 'RawTransformAddIssue',
      href: '../RawTransformAddIssue/',
      generics: [
        {
          type: 'custom',
          name: 'TInput',
        },
      ],
    },
  },
  NEVER: {
    type: 'never',
  },
};
