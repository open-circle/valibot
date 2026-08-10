import type { PropertyProps } from '~/components';

export const properties: Record<string, PropertyProps> = {
  CronDialect: {
    type: {
      type: 'union',
      options: [
        { type: 'string', value: 'VIXIE' },
        { type: 'string', value: 'POSIX' },
        { type: 'string', value: 'NODE_CRON' },
        { type: 'string', value: 'NODE_SCHEDULE' },
        { type: 'string', value: 'Croner' },
      ],
    },
  },
};
