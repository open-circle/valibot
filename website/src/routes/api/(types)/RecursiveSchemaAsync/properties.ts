import type { PropertyProps } from '~/components';

export const properties: Record<string, PropertyProps> = {
  TWrapped: {
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
    type: {
      type: 'string',
      value: 'recursiveAsync',
    },
  },
  reference: {
    type: {
      type: 'custom',
      modifier: 'typeof',
      name: 'recursiveAsync',
      href: '../recursiveAsync/',
      generics: [
        {
          type: 'union',
          options: [
            {
              type: 'custom',
              name: 'GenericSchema',
              href: '../GenericSchema/',
            },
            {
              type: 'custom',
              name: 'GenericSchemaAsync',
              href: '../GenericSchemaAsync/',
            },
          ],
        },
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
