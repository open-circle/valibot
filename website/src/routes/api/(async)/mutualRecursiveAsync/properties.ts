import type { PropertyProps } from '~/components';

export const properties: Record<string, PropertyProps> = {
  TEntries: {
    modifier: 'extends',
    type: {
      type: 'custom',
      name: 'Record',
      generics: [
        'string',
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
  build: {
    type: {
      type: 'function',
      params: [
        {
          name: 'ref',
          type: {
            type: 'custom',
            name: 'RefFactoryAsync',
          },
        },
      ],
      return: {
        type: 'custom',
        name: 'TEntries',
      },
    },
  },
  Schemas: {
    type: {
      type: 'custom',
      name: 'RecursiveSchemasAsync',
      generics: [{ type: 'custom', name: 'TEntries' }],
    },
  },
};
