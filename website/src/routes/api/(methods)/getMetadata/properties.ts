import type { PropertyProps } from '~/components';

export const properties: Record<string, PropertyProps> = {
  TSchema: {
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
        {
          type: 'custom',
          name: 'SchemaWithPipe',
          href: '../SchemaWithPipe/',
          generics: [
            {
              type: 'tuple',
              modifier: 'readonly',
              items: [
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
                  type: 'array',
                  spread: true,
                  item: {
                    type: 'union',
                    options: [
                      {
                        type: 'custom',
                        name: 'PipeItem',
                        href: '../PipeItem/',
                        generics: [
                          'any',
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
                        name: 'MetadataAction',
                        href: '../MetadataAction/',
                        generics: ['unknown', 'string'],
                      },
                    ],
                  },
                },
              ],
            },
          ],
        },
        {
          type: 'custom',
          name: 'SchemaWithPipeAsync',
          href: '../SchemaWithPipeAsync/',
          generics: [
            {
              type: 'tuple',
              modifier: 'readonly',
              items: [
                {
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
                {
                  type: 'array',
                  spread: true,
                  item: {
                    type: 'union',
                    options: [
                      {
                        type: 'custom',
                        name: 'PipeItem',
                        href: '../PipeItem/',
                        generics: [
                          'any',
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
                        name: 'PipeItemAsync',
                        href: '../PipeItemAsync/',
                        generics: [
                          'any',
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
                        name: 'MetadataAction',
                        href: '../MetadataAction/',
                        generics: ['unknown', 'string'],
                      },
                    ],
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  },
  schema: {
    type: {
      type: 'custom',
      name: 'TSchema',
    },
  },
  metadata: {
    type: {
      type: 'custom',
      name: 'InferMetadata',
      href: '../InferMetadata/',
      generics: [
        {
          type: 'custom',
          name: 'TSchema',
        },
      ],
    },
  },
};
