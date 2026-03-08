import type { PropertyProps } from '~/components';

export const properties: Record<string, PropertyProps> = {
  TInput: {
    modifier: 'extends',
    type: 'any',
  },
  TConfig: {
    modifier: 'extends',
    type: {
      type: 'union',
      options: [
        {
          type: 'custom',
          name: 'ParseBooleanConfig',
          href: '../ParseBooleanConfig/',
        },
        'undefined',
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
              name: 'ParseBooleanIssue',
              href: '../ParseBooleanIssue/',
              generics: [
                {
                  type: 'custom',
                  name: 'TInput',
                },
              ],
            },
          ],
        },
        'undefined',
      ],
    },
  },
  BaseTransformation: {
    modifier: 'extends',
    type: {
      type: 'custom',
      name: 'BaseTransformation',
      href: '../BaseTransformation/',
      generics: [
        {
          type: 'custom',
          name: 'TInput',
        },
        'boolean',
        {
          type: 'custom',
          name: 'ParseBooleanIssue',
          href: '../ParseBooleanIssue/',
          generics: [
            {
              type: 'custom',
              name: 'TInput',
            },
          ],
        },
      ],
    },
  },
  type: {
    type: {
      type: 'string',
      value: 'parse_boolean',
    },
  },
  reference: {
    type: {
      type: 'custom',
      modifier: 'typeof',
      name: 'parseBoolean',
      href: '../parseBoolean/',
    },
  },
  expects: {
    type: 'string',
  },
  config: {
    type: {
      type: 'custom',
      name: 'TConfig',
    },
  },
  message: {
    type: {
      type: 'custom',
      name: 'TMessage',
    },
  },
};
