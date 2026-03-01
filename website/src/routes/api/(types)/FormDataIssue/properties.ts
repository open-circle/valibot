import type { PropertyProps } from '~/components';

export const properties: Record<string, PropertyProps> = {
  FormDataIssue: {
    modifier: 'extends',
    type: {
      type: 'custom',
      name: 'BaseIssue',
      href: '../BaseIssue/',
      generics: ['unknown'],
    },
  },
  kind: {
    type: {
      type: 'string',
      value: 'schema',
    },
  },
  type: {
    type: {
      type: 'string',
      value: 'form_data',
    },
  },
  expected: {
    type: {
      type: 'string',
      value: 'FormData',
    },
  },
};
