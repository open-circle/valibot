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
  BaseSchema: {
    modifier: 'extends',
    type: {
      type: 'custom',
      name: 'BaseSchema',
      href: '../BaseSchema/',
      generics: [
        {
          type: 'intersect',
          options: [
            {
              type: 'custom',
              name: 'InferPatternsInput',
              href: '../InferPatternsInput/',
              generics: [
                {
                  type: 'custom',
                  name: 'TPatterns',
                },
              ],
            },
            {
              type: 'object',
              entries: [
                {
                  key: '[key: string]',
                  value: {
                    type: 'custom',
                    name: 'InferInput',
                    href: '../InferInput/',
                    generics: [
                      {
                        type: 'custom',
                        name: 'TRest',
                      },
                    ],
                  },
                },
              ],
            },
          ],
        },
        {
          type: 'intersect',
          options: [
            {
              type: 'custom',
              name: 'InferPatternsOutput',
              href: '../InferPatternsOutput/',
              generics: [
                {
                  type: 'custom',
                  name: 'TPatterns',
                },
              ],
            },
            {
              type: 'object',
              entries: [
                {
                  key: '[key: string]',
                  value: {
                    type: 'custom',
                    name: 'InferOutput',
                    href: '../InferOutput/',
                    generics: [
                      {
                        type: 'custom',
                        name: 'TRest',
                      },
                    ],
                  },
                },
              ],
            },
          ],
        },
        {
          type: 'union',
          options: [
            {
              type: 'custom',
              name: 'RecordWithPatternsIssue',
              href: '../RecordWithPatternsIssue/',
            },
            {
              type: 'custom',
              name: 'InferPatternsIssue',
              href: '../InferPatternsIssue/',
              generics: [
                {
                  type: 'custom',
                  name: 'TPatterns',
                },
              ],
            },
            {
              type: 'custom',
              name: 'InferIssue',
              href: '../InferIssue/',
              generics: [
                {
                  type: 'custom',
                  name: 'TRest',
                },
              ],
            },
          ],
        },
      ],
    },
  },
  type: {
    type: {
      type: 'string',
      value: 'record_with_patterns',
    },
  },
  reference: {
    type: {
      type: 'custom',
      modifier: 'typeof',
      name: 'recordWithPatterns',
      href: '../recordWithPatterns/',
    },
  },
  expects: {
    type: {
      type: 'string',
      value: 'Object',
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
};
