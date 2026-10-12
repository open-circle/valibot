import type { PropertyProps } from '~/components';

export const properties: Record<string, PropertyProps> = {
  TPatterns: {
    modifier: 'extends',
    type: {
      type: 'custom',
      name: 'PatternTuplesAsync',
      href: '../PatternTuplesAsync/',
    },
  },
  TRest: {
    modifier: 'extends',
    type: {
      type: 'union',
      options: [
        {
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
        {
          type: 'custom',
          name: 'BaseSchemaAsync',
          href: '../BaseSchemaAsync/',
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
      name: 'BaseSchemaAsync',
      href: '../BaseSchemaAsync/',
      generics: [
        {
          type: 'intersect',
          options: [
            {
              type: 'custom',
              name: 'InferPatternsInputAsync',
              href: '../InferPatternsInputAsync/',
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
              name: 'InferPatternsOutputAsync',
              href: '../InferPatternsOutputAsync/',
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
              name: 'InferPatternsIssueAsync',
              href: '../InferPatternsIssueAsync/',
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
      type: 'union',
      options: [
        {
          type: 'custom',
          modifier: 'typeof',
          name: 'recordWithPatterns',
          href: '../recordWithPatterns/',
        },
        {
          type: 'custom',
          modifier: 'typeof',
          name: 'recordWithPatternsAsync',
          href: '../recordWithPatternsAsync/',
        },
      ],
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
