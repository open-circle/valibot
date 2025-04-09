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
  FormDataMultiKeys: {
    type: {
      type: 'conditional',
      conditions: [
        {
          type: {
            type: 'custom',
            name: 'TMultiKeys',
          },
          extends: {
            type: 'array',
            modifier: 'readonly',
            item: 'string',
          },
          true: {
            type: 'custom',
            name: 'Record',
            generics: [
              {
                type: 'custom',
                name: 'TMultiKeys',
                indexes: ['number'],
              },
              {
                type: 'array',
                item: {
                  type: 'custom',
                  name: 'FormDataEntryValue',
                },
              },
            ],
          },
        },
      ],
      false: 'unknown',
    },
  },
};
