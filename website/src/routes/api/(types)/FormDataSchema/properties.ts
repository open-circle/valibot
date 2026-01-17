import type { PropertyProps } from '~/components';

export const properties: Record<string, PropertyProps> = {
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
              name: 'FormDataIssue',
              href: '../FormDataIssue/',
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
          type: 'custom',
          name: 'FormData',
        },
        {
          type: 'custom',
          name: 'FormData',
        },
        {
          type: 'custom',
          name: 'FormDataIssue',
          href: '../FormDataIssue/',
        },
      ],
    },
  },
  type: {
    type: {
      type: 'string',
      value: 'form_data',
    },
  },
  reference: {
    type: {
      type: 'custom',
      modifier: 'typeof',
      name: 'formData',
      href: '../formData/',
    },
  },
  expects: {
    type: {
      type: 'string',
      value: 'FormData',
    },
  },
  message: {
    type: {
      type: 'custom',
      name: 'TMessage',
    },
  },
};
