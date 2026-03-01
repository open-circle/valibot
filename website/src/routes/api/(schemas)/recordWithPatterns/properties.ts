import type { PropertyProps } from '~/components';

export const properties: Record<string, PropertyProps> = {
  TPatterns: {
    modifier: 'extends',
    type: {
      type: 'custom',
      name: 'PatternTuples',
      href: '../PatternTuples/',
    },
  },
  TRest: {
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
  TMessage: {
    modifier: 'extends',
    type: {
      type: 'union',
      options: [
        {
          type: 'custom',
          name: 'ErrorMessage',
          href: '../ErrorMessage/',
          generics: [
            {
              type: 'custom',
              name: 'RecordWithPatternsIssue',
              href: '../RecordWithPatternsIssue/',
            },
          ],
        },
        'undefined',
      ],
    },
  },
  patterns: {
    type: {
      type: 'custom',
      name: 'TPatterns',
    },
  },
  rest: {
    type: {
      type: 'custom',
      name: 'TRest',
    },
  },
  message: {
    type: {
      type: 'custom',
      name: 'TMessage',
    },
  },
  Schema: {
    type: {
      type: 'custom',
      name: 'RecordWithPatternsSchema',
      href: '../RecordWithPatternsSchema/',
      generics: [
        {
          type: 'custom',
          name: 'TPatterns',
        },
        {
          type: 'custom',
          name: 'TRest',
        },
        {
          type: 'custom',
          name: 'TMessage',
        },
      ],
    },
  },
};
