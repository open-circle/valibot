import type { PropertyProps } from '~/components';

export const properties: Record<string, PropertyProps> = {
  RequiredPaths: {
    type: {
      type: 'tuple',
      modifier: 'readonly',
      items: [
        {
          type: 'custom',
          name: 'RequiredPath',
          href: '../RequiredPath/',
        },
        {
          type: 'array',
          spread: true,
          item: {
            type: 'custom',
            name: 'RequiredPath',
            href: '../RequiredPath/',
          },
        },
      ],
    },
  },
};
