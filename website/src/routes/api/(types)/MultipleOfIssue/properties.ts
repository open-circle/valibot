import type { PropertyProps } from '~/components';

export const properties: Record<string, PropertyProps> = {
  TInput: {
    modifier: 'extends',
    type: {
      type: 'union',
      options: ['number', 'bigint'],
    },
  },
  TRequirement: {
    modifier: 'extends',
    type: {
      type: 'union',
      options: ['number', 'bigint'],
    },
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
      value: 'multiple_of',
    },
  },
  expected: {
    type: {
      type: 'template',
      parts: [
        {
          type: 'string',
          value: '%',
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
      parts: [
        {
          type: 'custom',
          name: 'TInput',
        },
      ],
    },
  },
  requirement: {
    type: {
      type: 'custom',
      name: 'TRequirement',
    },
  },
};
