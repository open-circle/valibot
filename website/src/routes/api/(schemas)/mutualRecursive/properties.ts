import type { PropertyProps } from '~/components';

export const properties: Record<string, PropertyProps> = {
  TEntries: {
    modifier: 'extends',
    type: {
      type: 'custom',
      name: 'Record',
      generics: [
        'string',
        { type: 'custom', name: 'GenericSchema', href: '../GenericSchema/' },
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
            name: 'RefFactory',
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
      name: 'RecursiveSchemas',
      generics: [{ type: 'custom', name: 'TEntries' }],
    },
  },
};
