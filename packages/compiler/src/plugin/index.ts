import type { UnpluginInstance } from 'unplugin';
import { createUnplugin } from 'unplugin';
import { transformCode } from './transform/index.ts';

export const unplugin: UnpluginInstance<object | undefined> = createUnplugin(
  (_options?: object) => ({
    name: 'valibot-compiler',
    transform: {
      filter: {
        id: { include: [/\.[jt]sx?$/], exclude: [/node_modules/] },
        code: { include: ['@valibot/compiler'] },
      },
      handler(code: string, id: string) {
        return transformCode(code, id);
      },
    },
  })
);
