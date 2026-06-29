import type { PropertyProps } from '~/components';

export const properties: Record<string, PropertyProps> = {
  TIssue: {
    modifier: 'extends',
    type: {
      type: 'custom',
      name: 'BaseIssue',
      href: '../BaseIssue/',
      generics: ['unknown'],
    },
  },
  lang: {
    type: {
      type: 'union',
      options: ['string', 'undefined'],
    },
  },
  message: {
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
              name: 'TIssue',
            },
          ],
        },
        'undefined',
      ],
    },
  },
  abortEarly: {
    type: {
      type: 'union',
      options: ['boolean', 'undefined'],
    },
  },
  abortPipeEarly: {
    type: {
      type: 'union',
      options: ['boolean', 'undefined'],
    },
  },
  cronDialect: {
    type: {
      type: 'union',
      options: [
        {
          type: 'custom',
          name: 'CronDialect',
          href: '../CronDialect/',
        },
        'undefined',
      ],
    },
  },
};
