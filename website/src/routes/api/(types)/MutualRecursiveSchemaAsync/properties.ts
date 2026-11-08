import type { PropertyProps } from '~/components';

export const properties: Record<string, PropertyProps> = {
  TWrapped: {
    modifier: 'extends',
    type: {
      type: 'union',
      options: [
        { type: 'custom', name: 'GenericSchema', href: '../GenericSchema/' },
        {
          type: 'custom',
          name: 'GenericSchemaAsync',
          href: '../GenericSchemaAsync/',
        },
      ],
    },
  },
  TInput: {
    type: 'unknown',
  },
  TOutput: {
    type: 'unknown',
  },
  TIssue: {
    modifier: 'extends',
    type: {
      type: 'custom',
      name: 'BaseIssue',
      href: '../BaseIssue/',
      generics: ['unknown'],
    },
  },
  BaseSchemaAsync: {
    modifier: 'extends',
    type: {
      type: 'custom',
      name: 'BaseSchemaAsync',
      href: '../BaseSchemaAsync/',
      generics: [
        { type: 'custom', name: 'TInput' },
        { type: 'custom', name: 'TOutput' },
        { type: 'custom', name: 'TIssue' },
      ],
    },
  },
  type: {
    type: { type: 'string', value: 'mutualRecursiveAsync' },
  },
  reference: {
    type: {
      type: 'custom',
      modifier: 'typeof',
      name: 'createRecursiveSchema',
      generics: [{ type: 'custom', name: 'MutualRecursiveSchemaAsync' }],
    },
  },
  expects: {
    type: { type: 'string', value: 'unknown' },
  },
  wrapped: {
    type: { type: 'custom', name: 'TWrapped' },
  },
};
