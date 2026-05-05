import type { PropertyProps } from '~/components';

export const properties: Record<string, PropertyProps> = {
  TInput: {
    modifier: 'extends',
    type: {
      type: 'custom',
      name: 'EntriesInput',
      href: '../EntriesInput/',
    },
  },
  TRequirement: {
    modifier: 'extends',
    type: 'number',
  },
  BaseIssue: {
    modifier: 'extends',
    type: {
      type: 'custom',
      name: 'BaseIssue',
      href: '../BaseIssue/',
      generics: [
        {
          type: 'custom',
          name: 'TInput',
        },
      ],
    },
  },
  kind: {
    type: {
      type: 'string',
      value: 'validation',
    },
  },
  type: {
    type: {
      type: 'string',
      value: 'max_entries',
    },
  },
  expected: {
    type: {
      type: 'template',
      parts: [
        {
          type: 'string',
          value: '<=',
        },
        {
          type: 'custom',
          name: 'TRequirement',
        },
      ],
    },
  },
  received: {
    type: {
      type: 'template',
      parts: ['number'],
    },
  },
  requirement: {
    type: {
      type: 'custom',
      name: 'TRequirement',
    },
  },
};
