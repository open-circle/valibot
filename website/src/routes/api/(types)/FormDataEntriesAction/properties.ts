import type { PropertyProps } from '~/components';

export const properties: Record<string, PropertyProps> = {
  TMultiKeys: {
    modifier: 'extends',
    type: {
      type: 'union',
      options: [
        {
          type: 'array',
          modifier: 'readonly',
          item: 'string',
        },
        'undefined',
      ],
    },
  },
  FormDataEntriesAction: {
    type: {
      type: 'custom',
      name: 'BaseTransformation',
      href: '../BaseTransformation/',
      generics: [
        {
          type: 'custom',
          name: 'FormData',
        },
        {
          type: 'intersect',
          options: [
            {
              type: 'custom',
              name: 'FormDataEntries',
              href: '../FormDataEntries/',
            },
            {
              type: 'custom',
              name: 'FormDataMultiKeys',
              href: '../FormDataMultiKeys/',
              generics: [
                {
                  type: 'custom',
                  name: 'TMultiKeys',
                },
              ],
            },
          ],
        },
        'never',
      ],
    },
  },
  type: {
    type: {
      type: 'string',
      value: 'form_data_entries',
    },
  },
  reference: {
    type: {
      type: 'custom',
      modifier: 'typeof',
      name: 'formDataEntries',
      href: '../formDataEntries/',
    },
  },
  multiKeys: {
    type: {
      type: 'custom',
      name: 'TMultiKeys',
    },
  },
};
