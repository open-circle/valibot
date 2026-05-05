import type { PropertyProps } from '~/components';

export const properties: Record<string, PropertyProps> = {
  TInput: {
    modifier: 'extends',
    type: 'string',
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
              name: 'IsoDateTimeSecondIssue',
              href: '../IsoDateTimeSecondIssue/',
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
  BaseValidation: {
    modifier: 'extends',
    type: {
      type: 'custom',
      name: 'BaseValidation',
      href: '../BaseValidation/',
      generics: [
        {
          type: 'custom',
          name: 'TInput',
        },
        {
          type: 'custom',
          name: 'TInput',
        },
        {
          type: 'custom',
          name: 'IsoDateTimeSecondIssue',
          href: '../IsoDateTimeSecondIssue/',
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
      value: 'iso_date_time_second',
    },
  },
  reference: {
    type: {
      type: 'custom',
      modifier: 'typeof',
      name: 'isoDateTimeSecond',
      href: '../isoDateTimeSecond/',
    },
  },
  expects: {
    type: 'null',
  },
  requirement: {
    type: {
      type: 'custom',
      name: 'RegExp',
    },
  },
  message: {
    type: {
      type: 'custom',
      name: 'TMessage',
    },
  },
};
