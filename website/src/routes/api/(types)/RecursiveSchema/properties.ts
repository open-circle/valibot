import type { PropertyProps } from '~/components';

export const properties: Record<string, PropertyProps> = {
  TWrapped: {
    modifier: 'extends',
    type: {
      type: 'custom',
      name: 'BaseSchema',
      href: '../BaseSchema/',
      generics: [
        'unknown',
        'unknown',
        {
          type: 'custom',
          name: 'BaseIssue',
          href: '../BaseIssue/',
          generics: ['unknown'],
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
    type: {
      type: 'string',
      value: 'recursive',
    },
  },
  reference: {
    type: {
      type: 'custom',
      modifier: 'typeof',
      name: 'recursive',
      href: '../recursive/',
      generics: [
        { type: 'custom', name: 'GenericSchema', href: '../GenericSchema/' },
      ],
    },
  },
  expects: {
    type: {
      type: 'string',
      value: 'unknown',
    },
  },
  wrapped: {
    type: { type: 'custom', name: 'TWrapped' },
  },
};
