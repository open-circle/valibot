import type { PropertyProps } from '~/components';

export const properties: Record<string, PropertyProps> = {
  FormDataEntries: {
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
              name: 'FormDataEntryValue',
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
      ],
    },
  },
};
