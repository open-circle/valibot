import type { PropertyProps } from '~/components';

export const properties: Record<string, PropertyProps> = {
  TWrapped: {
    modifier: 'extends',
    type: { type: 'custom', name: 'GenericSchema', href: '../GenericSchema/' },
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
  BaseSchema: {
    modifier: 'extends',
    type: {
      type: 'custom',
      name: 'BaseSchema',
      href: '../BaseSchema/',
      generics: [
        { type: 'custom', name: 'TInput' },
        { type: 'custom', name: 'TOutput' },
        { type: 'custom', name: 'TIssue' },
      ],
    },
  },
  type: {
    type: { type: 'string', value: 'mutualRecursive' },
  },
  reference: {
    type: {
      type: 'custom',
      modifier: 'typeof',
      name: 'createRecursiveSchema',
      generics: [{ type: 'custom', name: 'MutualRecursiveSchema' }],
    },
  },
  expects: {
    type: { type: 'string', value: 'unknown' },
  },
  wrapped: {
    type: { type: 'custom', name: 'TWrapped' },
  },
};
