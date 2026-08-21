import type { PropertyProps } from '~/components';

export const properties: Record<string, PropertyProps> = {
  GlobalConfig: {
    type: {
      type: 'intersect',
      options: [
        {
          type: 'custom',
          name: 'Omit',
          generics: [
            {
              type: 'custom',
              name: 'Config',
              href: '../Config/',
              generics: ['never'],
            },
            {
              type: 'union',
              options: [
                {
                  type: 'string',
                  value: 'message',
                },
                {
                  type: 'string',
                  value: 'lang',
                },
              ],
            },
          ],
        },
        {
          type: 'object',
          entries: [
            {
              key: 'lang',
              value: {
                type: 'union',
                options: [
                  {
                    type: 'function',
                    return: 'string',
                    params: [],
                  },
                  'string',
                ],
              },
            },
          ],
        },
      ],
    },
  },
};
